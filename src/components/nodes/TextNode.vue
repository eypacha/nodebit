<template>
  <textarea
    v-model="node.content"
    ref="textareaRef"
    :class="{ noselect: !editable }"
    :readOnly="!editable"
    @blur="$emit('blur')"
    @input="updateSize($event)"
    @keypress.enter.exact.prevent="handleEnter"/>
</template>

<script setup>
import { ref, defineExpose, computed } from "vue";
import { useStudioStore } from "@/stores/studio";

import { NODE_TYPES, getNodeType } from "@/nodes/types";

const store = useStudioStore();

const props = defineProps({
  node: Object,
  editable: Boolean,
});

const textareaRef = ref(null);

function focus() {
  textareaRef.value?.focus();
}

defineExpose({
  focus,
});

const nodeType = computed(() => {
  return NODE_TYPES[props.node.type];
});

function handleEnter(event) {
  updateNode(event);
  store.evaluateBytebeat();
}

function updateSize(event) {
  if (!textareaRef.value || !event) return;

  const isLineBreak = event.inputType === "insertLineBreak";
  const isTextInsertWithoutData =
    event.inputType === "insertText" && !event.data;
  const isTextInsertExceedingHeight =
    event.inputType === "insertText" &&
    textareaRef.value.scrollHeight > props.node.h;

  if (isLineBreak || isTextInsertWithoutData) {
    updateHeight();
  } else if (isTextInsertExceedingHeight) {
    props.node.w < 300 ? updateWidth() : updateHeight();
  }
}

function updateHeight() {
  textareaRef.value.style.height = 0;
  textareaRef.value.style.height =
    Math.min(textareaRef.value.scrollHeight, 500) + "px";
  const h = Math.min(textareaRef.value.scrollHeight, 500);
  store.updateNode(props.node.id, { h });
}

function updateWidth() {
  const w = props.node.w + 15;
  store.updateNode(props.node.id, { w });
}

function updateNode() {
  let { content, w, h } = props.node;

  content = content.trim();
  let type = getNodeType(content);

  if (type == "empty") {
    store.deleteNode(props.node.id);
    return;
  }

  console.log(props.node.type, "-->", type);

  const minWidth = NODE_TYPES[type]?.minWidth || 60;
  const minHeight = NODE_TYPES[type]?.minHeight || 44;

  if (type === "exp" || type === "comment") {
    w = Math.max(w, minWidth);
  } else if (type === "number") {
    const chars = props.node.content.length;

    w = chars * 7.8 + 70

  
  } else if (type === "manual") {
    type = "comment";
    w = NODE_TYPES["manual"].minWidth;
    h = NODE_TYPES["manual"].minHeight;
    content = NODE_TYPES["manual"].content;
  } else {
    w = minWidth;
    h = minHeight;
  }

  store.updateNode(props.node.id, { content, type, w, h });
}
</script>
