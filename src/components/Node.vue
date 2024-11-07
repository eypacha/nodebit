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
    :resizable="!['time','theme'].includes(node.type)"
    :handles="['mr']"
    tabindex="1"
    @dblclick="editable = nodeType.editable"
    @focus="handleFocus"
    @keydown="handleKeyDown"
    @keyup.stop="handleNodeKeyUp"
    @dragStart="store.setIsDragging(true)"
    @dragStop="store.setIsDragging(false)"
    @dragging="handleDragging"
    @mousedown.stop
    @mouseup.stop
    @click.ctrl.stop
    @click.exact.stop="handleNodeClick(node.id, $event)"
    @click.shift.exact.stop="store.toggleSelection(node.id)"
    @resizeStart="store.setIsResizing(true)"
    @resizeStop="store.setIsResizing(false)"
    @resizing="handleResizing"
  >

    
    <TextNode v-if="['empty','exp','comment'].includes(node.type)" ref="textNodeRef":node="node" :editable="editable" @blur="handleBlur"/>
    <!-- <ExpressionNode v-else-if="node.type === 'exp'" ref="textNodeRef":node="node" :editable="editable" @blur="handleBlur"/> -->
    <ThemeNode v-else-if="node.type === 'theme'"/>

    <NumberNode v-else-if="node.type === 'number'" :node="node" :editable="editable" @blur="handleBlur"/>
    <PlayNode v-else-if="node.type === 'play'" />
    <StopNode v-else-if="node.type === 'stop'" />
    <ResetNode v-else-if="node.type === 'reset'" />
    <ExportNode v-else-if="node.type === 'export'"/>
    <ExportImageNode v-else-if="node.type === 'exportImg'"/>
    <ImportNode v-else-if="node.type === 'import'"/>
    <EvaluatedNode v-else-if="node.type === 'evaluated'"/>
    <ErrorsNode v-else-if="node.type === 'errors'"/>
    <TimeNode v-else-if="node.type === 'time'"/>
    <Visualizer v-else-if="node.type === 'visualizer'"/>
    <OperatorNode v-else-if="node.type == 'operator'" :node="node"/>
    <ToggleNode v-else-if="node.type === 'toggle'" :node="node"/>
    <!-- <RangeNode v-else-if="node.type === 'range'" :node="node"/> -->
    <SwitchNode v-else-if="node.type === 'switch'" :node="node"/>
    <!-- <MidiNode v-else-if="node.type === 'midi'" :node="node"/> -->
    <HelpNode v-else-if="node.type === 'help'"
      :nodeId="node.id"
      :content="node.content"
      :connectionActive="store.isConnectionActive(node.id, 0, 'input')"/>
    <div v-else-if="node.type == 'out'" class="content noselect">out</div>
    <div v-else class="content noselect" style="color: cyan !important">{{ node.content }}</div>

    <div v-if="nodeType.inputs" class="inputs">
      <div
        v-for="n in nodeType.inputs"
        :key="`input-socket-${n - 1}`"
        v-memo="[store.isConnectionActive(node.id, n - 1, 'input'), node.activeSocket === n - 1]"
        class="socket-wrapper"
      >
        <div
          class="socket"
          :class="[
            `socket-${n - 1}`,
            {
              active: store.isConnectionActive(node.id, n - 1, 'input'),
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
            { active: store.isConnectionActive(node.id, n - 1, 'output') })
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
import { ref, computed } from "vue";

import VueDraggableResizable from "vue-draggable-resizable";
import { NODE_TYPES } from "@/nodes/types";

import TextNode from "./nodes/TextNode.vue";
import ExpressionNode from "./nodes/ExpressionNode.vue";
import ThemeNode from "./nodes/ThemeNode.vue";
import NumberNode from "./nodes/NumberNode.vue";
import PlayNode from "./nodes/PlayNode.vue";
import ExportNode from "./nodes/ExportNode.vue";
import ExportImageNode from "./nodes/ExportImageNode.vue";
import ImportNode from "./nodes/ImportNode.vue";
import EvaluatedNode from "./nodes/EvaluatedNode.vue";
import ErrorsNode from "./nodes/ErrorsNode.vue";
import ToggleNode from "./nodes/ToggleNode.vue";
// import RangeNode from "./nodes/RangeNode.vue";
import SwitchNode from "./nodes/SwitchNode.vue";
// import MidiNode from "./nodes/MidiNode.vue";
import HelpNode from "./nodes/HelpNode.vue";
import OperatorNode from "./nodes/OperatorNode.vue";
import StopNode from "./nodes/StopNode.vue";
import ResetNode from "./nodes/ResetNode.vue";
import TimeNode from "./nodes/TimeNode.vue";
import Visualizer from './nodes/VisualizerNode.vue';


import { useStudioStore } from "@/stores/studio";

import "./Node.scss";

const props = defineProps({
  node: Object,
  selected: Boolean,
  isDrawingPath: Boolean,
  lastSocketConnected: Number,
});

const store = useStudioStore();

const editable = ref(false)

const textNodeRef = ref(null)

const isSelected = computed(()=> {
  return store.selectedNodes.includes(props.node.id)
})

const nodeType = computed(()=>{
  return NODE_TYPES[props.node.type]
})

const nodeMinWidth = computed(() => {
  if (props.node.type === "switch") {
    return props.node.lastSocketConnected ? props.node.lastSocketConnected * 20 + 14 : 75;
  }

  return nodeType?.minWidth ?? 60;
});

const nodeMinHeight = computed(() => {
  return nodeType?.minHeight ?? 44;
});

const nodeMaxWidth = computed(() => {

  if(props.node.type === "switch") {
    return 315
  }
  return nodeType?.maxWidth ?? null;
});

const nodeMaxHeight = computed(() => {
  return nodeType?.maxHeight ?? null;
});

function handleFocus() {
  console.log('🔎 focus in node',props.node.type)
  store.selectNode(props.node.id)
}

function focusAndEdit() {
  editable.value = true;
  textNodeRef.value?.focus()
}

defineExpose({
  focusAndEdit
});

function handleBlur() {
  editable.value = false;
  console.log('🔎 lost focus')
  if (props.node.type !== "empty" || props.node.content.trim() != "") return;
  store.deleteNode(props.node.id);
}

function handleDragging(left, top) {

  const deltaX = left - props.node.x;
  const deltaY = top - props.node.y;
  store.updateNode(props.node.id, { x: left, y: top });

  store.selectedNodes.forEach(nodeId => {
    if (nodeId !== props.node.id) {
      const node = store.find("nodes", "id", nodeId);
      const newLeft = node.x + deltaX;
      const newTop = node.y + deltaY;
      store.updateNode(nodeId, { x: newLeft, y: newTop });
    }
  });
}

function handleResizing(left, top, width, height) {

  if (isNaN(width)) {
    console.error("Width is NaN");
    return; 
  }
  store.updateNode(props.node.id, { w: width });
}

function handleNodeClick(){
  store.deselectAll()
  store.selectNode(props.node.id)
}

function handleKeyDown(event) {
  let keyPressed = parseInt(event.key);

  if(event.ctrlKey && event.code === "KeyC" && !editable.value) {
    store.copySelection()
  }

  if (isNaN(keyPressed)) {
    const letterMap = {
      'a': 1,
      'b': 12,
      'c': 13,
      'd': 14,
      'e': 15,
      'f': 16
    };
    keyPressed = letterMap[event.key.toLowerCase()];
  }


  switch(props.node.type){
    case 'switch':
      if (isNaN(keyPressed)) return;
      let socketIndex = keyPressed === 0 ? 9 : keyPressed - 1;
      store.switchChange(props.node.id, socketIndex);
      store.updateNode(props.node.id, { activeSocket: socketIndex });
      break;
    case 'operator':
      //
      break;

  }

 
}
function handleNodeKeyUp(event) {
  if (event.key == "Delete" || event.key == "Backspace") {
    if (editable.value) return;
    console.log('handlekeydown en nodo')
    store.deleteNode(props.node.id);
    store.evaluateBytebeat()
  }

  if (event.key == "Escape") {
    if (editable) {
      editable.value = false;
      store.updateNode(props.node.id,{...props.node})
    }
  }
}

function switchChange(socketIndex) {
  if (props.node.type !== "switch") return;

  store.switchChange(props.node.id, socketIndex);
  store.updateNode(props.node.id, { activeSocket: socketIndex })
}
</script>
