<template>
  <textarea
    v-if="editable"
    v-model="node.content"
    ref="textareaRef"
    :class="{ noselect: !editable }"
    @blur="$emit('blur')"
    @input="updateSize($event)"
    @keypress.enter.exact.prevent="handleEnter"
  />
  <div v-else class="formated" tabindex="0" @blur="$emit('blur')">
    <span
      v-for="(token, index) in tokenizedContent"
      :key="index"
      :class="token.type"
    >
      {{ token.text }}
    </span>
  </div>
</template>

<script setup>
import { ref, defineExpose, computed } from "vue";
import { useStudioStore } from "@/stores/studio";

import { NODE_TYPES } from "@/nodes/types";

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

const tokenizedContent = computed(() => {
  if (!props.node.content) return [];

  const regexPattern = /0x[0-9A-Fa-f]+|0o[0-7]+|0b[01]+|\d+(?:\.\d*)?|\.\d+|\bt\b|\(|\)|\+|-|\*{1,2}|\/|%|&|\||\^|>>|<<|!=|==|>=|<=|>|<|\S/g;
  const tokens = props.node.content.match(regexPattern) || [];

  return tokens.map((token) => {
    let type = "other";
    if (/^(?:0x[0-9A-Fa-f]+|0o[0-7]+|0b[01]+|\d+(?:\.\d*)?|\.\d+)$/.test(token)) {
      type = "number";
    } else if (token === "t") {
      type = "time";
    } else if (token === "(" || token === ")") {
      type = "parenthesis";
    } else if (["+", "-", "*", "/", "%", "**"].includes(token)) {
      type = "operator";
    } else if (["&", "|", "^", ">>", "<<"].includes(token)) {
      type = "bitwise";
    } else if (["!=", "==", ">", "<", ">=", "<="].includes(token)) {
      type = "comparison";
    }

    return {
      text: token,
      type: type,
    };
  });
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

  console.log(props.node.type, "-->", type);

  const minWidth = NODE_TYPES["exp"]?.minWidth || 60;

  w = Math.max(w, minWidth);

  store.updateNode(props.node.id, { content, type, w, h });
}
</script>

<style lang="scss" scoped>
.formated {
  color: white;
  padding: 13px 0.5em;
  cursor: pointer;
  text-align: left;
  resize: none;
  line-height: normal;
  overflow: hidden;
  width: inherit;
  height: inherit;
  font-family: var(--main-font);
  font-size: 13px;
  font-optical-sizing: auto;
  box-shadow: black 0px 2px 8px inset;
  word-break: break-all;
  white-space: pre-wrap;
  
  .time,
  .number {

    &:hover {
      color: yellow;
    }
   
  }

  .operator,
  .bitwise,
  .comparison {
    &:hover {
      color: cyan;
    }
  }
  
  
}
</style>
