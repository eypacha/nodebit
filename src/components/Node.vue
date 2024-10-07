<template>
  <vue-draggable-resizable
    :parent="true"
    class="node"
    :class="[`node-${node.type}`, { selected: isSelected, editable }]"
    :w="node.w"
    :h="node.h"
    :min-width="nodeMinWidth"
    :min-height="nodeMinHeight"
    :max-width="nodeMaxWidth"
    :max-height="nodeMaxHeight"
    :x="node.x"
    :y="node.y"
    :draggable="!isDrawingPath && !editable"
    :resizable="node.type != 'time'"
    :handles="['mr']"
    tabindex="1"
    @dblclick="editable = nodeType.editable"
    @focus="handleFocus"
    @keydown="handleKeyDown"
    @keyup.stop="handleNodeKeyUp"
    @dragstart="editable = false"
    @dragging="handleDrag"
    @mousedown.stop
    @mouseup.stop
    @click.ctrl.stop
    @click.exact.stop="handleNodeClick(node.id, $event)"
    @click.shift.exact.stop="studio.toggleSelection(node.id)"
    @resizing="handleResizing"
  >
    <textarea
      v-if="nodeType.editable"
      ref="textarea"
      :class="{ noselect: !editable }"
      :readOnly="!editable"
      @blur="handleBlur"
      role="textbox"
      v-model="node.content"
      @input="updateSize"
      @keypress.enter.exact.prevent="handleEnter"
    />

    <PlayNode v-else-if="node.type == 'play'" />
    <ExportNode v-else-if="node.type == 'export'"/>
    <ImportNode v-else-if="node.type == 'import'"/>
    <EvaluatedNode v-else-if="node.type == 'evaluated'"/>
    <ErrorsNode v-else-if="node.type == 'errors'"/>
    <SwitchNode v-else-if="node.type == 'switch'" :node="node"/>
    <HelpNode v-else-if="node.type == 'help'"
      :nodeId="node.id"
      :content="node.content"
      :connectionActive="studio.isConnectionActive(node.id, 0, 'input')"/>
    <div v-else-if="node.type == 'out'" class="content noselect">out</div>

    <div v-else-if="node.type == 'conmut'" class="content noselect">
      {{ node.content }}
    </div>

    <div v-else class="content noselect" style="color: cyan !important">
      {{ node.content }}
    </div>

    <div v-if="nodeType.inputs" class="inputs">
      <div
        v-for="n in nodeType.inputs"
        :key="`input-socket-${n - 1}`"
        class="socket-wrapper"
      >
        <div
          class="socket"
          :class="[
            `socket-${n - 1}`,
            {
              active: studio.isConnectionActive(node.id, n - 1, 'input'),
              switched: node.activeSocket == n - 1,
            },
          ]"
          @mouseup="$emit('finish-path', node.id, n - 1)"
        />
        <span
          v-if="NODE_TYPES[node.type].inputs > 3"
          @click="switchChange(n - 1)"
          class="label noselect"
          >{{ n }}</span
        >
      </div>
    </div>

    <div v-if="nodeType.outputs" class="outputs">
      <div
        v-for="n in nodeType.outputs"
        :key="`output-socket-${n - 1}`"
        class="socket-wrapper"
      >
        <div
          class="socket"
          :class="
            (`socket-${n - 1}`,
            { active: studio.isConnectionActive(node.id, n - 1, 'output') })
          "
          @mousedown="$emit('start-path', node.id, n - 1)"
        />
      </div>
      <span v-if="nodeType.outputs > 3" class="label noselect">{{
        n
      }}</span>
    </div>
  </vue-draggable-resizable>
</template>

<script setup>
import VueDraggableResizable from "vue-draggable-resizable";
import { NODE_TYPES, getNodeType } from "@/nodes/types";

// import NodeSockets from "./nodes/NodeSockets.vue";
import PlayNode from "./nodes/PlayNode.vue";
import ExportNode from "./nodes/ExportNode.vue";
import ImportNode from "./nodes/ImportNode.vue";
import EvaluatedNode from "./nodes/EvaluatedNode.vue";
import ErrorsNode from "./nodes/ErrorsNode.vue";
import SwitchNode from "./nodes/SwitchNode.vue";
import HelpNode from "./nodes/HelpNode.vue";

import { ref, computed, nextTick } from "vue";
import { useStudioStore } from "@/stores/studio";

import "./Node.scss";

const props = defineProps({
  node: Object,
  selected: Boolean,
  isDrawingPath: Boolean,
  lastSocketConnected: Number,
});

const studio = useStudioStore();

const editable = ref(false)

const textarea = ref(null)

const isSelected = computed(()=> {
  return studio.selectedNodes.includes(props.node.id)
})

const nodeType = computed(()=>{
  return NODE_TYPES[props.node.type]
})

const nodeMinWidth = computed(() => {
  if (props.node.type === "switch") {
    return props.node.lastSocketConnected ? props.node.lastSocketConnected * 20 + 12 : 72;
  }

  return nodeType?.minWidth ?? 60;
});

const nodeMinHeight = computed(() => {
  return nodeType?.minHeight ?? 41;
});

const nodeMaxWidth = computed(() => {
  return nodeType?.maxWidth ?? null;
});

const nodeMaxHeight = computed(() => {
  return nodeType?.maxHeight ?? null;
});

function handleFocus() {
  console.log('focus')
  studio.selectNode(props.node.id)
}

function focusAndEdit() {
  editable.value = true;
  textarea.value.focus()
}

defineExpose({
  focusAndEdit
});


function handleBlur() {
  editable.value = false;
  if (props.node.type !== "empty" || props.node.content.trim() != "") return;
  studio.deleteNode(props.node.id);
}
function handleDrag(left, top) {
  studio.updateNode(props.node.id, {x: left, y: top})
}
function handleResizing(left, top, width, height) {
  studio.updateNode(props.node.id, {w: width})
}
function handleEnter(event) {
  updateNode(event);
  studio.evaluateBytebeat()
}

function handleNodeClick(){
  studio.deselectAll()
  studio.selectNode(props.node.id)
}

function handleKeyDown(event) {
  const keyPressed = parseInt(event.key);

  switch(props.node.type){
    case 'switch':
      if (isNaN(keyPressed)) return;
      let socketIndex = keyPressed === 0 ? 9 : keyPressed - 1;
      studio.switchChange(props.node.id, socketIndex);
      studio.updateNode(props.node.id, {activeSocket: socketIndex });
      break;
    case 'operator':
  }

 
}
function handleNodeKeyUp(event) {
  if (event.key == "Delete" || event.key == "Backspace") {
    if (editable.value) return;
    studio.deleteNode(props.node.id);
  }

  if (event.key == "Escape") {
    if (editable) {
      editable.value = false;
      studio.updateNode(props.node.id,{...props.node})
    }
  }
}
function updateSize() {

  if(!textarea.value) return

  textarea.value.style.height = "0";
  textarea.value.style.height = textarea.value.scrollHeight + "px";

  nextTick().then(() => {
    const el = textarea.value.getBoundingClientRect();
    const h = el.height;
    studio.updateNode(props.node.id, {h})
  });
}
function updateNode() {
  let { content, w, h } = props.node;
  content = content.trim();

  let type = getNodeType(content);
  const minWidth = NODE_TYPES[type]?.minWidth || 60;
  const minHeight = NODE_TYPES[type]?.minHeight || 41;

  if (type === "switch") {
    w = minWidth;
    h = 41;
  } else if (type === "exp") {
    w = Math.max(w, minWidth);
    content = content === "exp" ? "" : content;
  } else if (type === "manual") {
    type = "comment";
    w = NODE_TYPES["manual"].minWidth;
    h = NODE_TYPES["manual"].minHeight;
    content = NODE_TYPES["manual"].content;
  } else if (type === "help") {
    w = minWidth;
    h = minHeight;
  }

  if (!NODE_TYPES[type].editable) editable.value = false;

  studio.updateNode(props.node.id, {content, type, w, w})

  if (!editable) return;

  nextTick().then(() => updateSize())
  
}
function switchChange(socket) {
  if (props.node.type !== "switch") return;
  this.$emit("switch-change", props.node.id, socket - 1);
  studio.updateNode(props.node.id, {activeSocket: socket - 1 })
  
}
</script>
