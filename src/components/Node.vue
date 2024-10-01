<template>
    <vue-draggable-resizable
      :parent="true"
      class="node"
      :class="[`node-${node.type}`, { active: isActive }]"
      :w="node.w"
      :h="node.h"
      :min-width="node.type === 'switch' ? 72 : 60"
      :min-height="41"
      :x="node.x"
      :y="node.y"
      :draggable="!isDrawingPath"
      :handles="['mr']"
      @dragging="handleDrag"
      @mousedown="$emit('node-mousedown', node.id)"
      @click.stop
      @resizing="handleResizing"
    >
      <textarea
        class="textarea"
        :class="{ noselect: isDrawingPath || !isActive }"
        role="textbox"
        v-model="node.content"
        @input="updateHeight"
        @keypress.enter.exact.prevent="handleEnter"
      />
  
      <div v-if="nodeTypes[node.type].inputs" class="inputs">
        <div
          v-for="n in nodeTypes[node.type].inputs"
          :key="`input-socket-${n}`"
          class="socket"
          :class="{ active: isConnectionActive(node.id, n, 'input') }"
          @mouseup="$emit('finish-path', node.id, n)"
        >
          <span v-if="nodeTypes[node.type].inputs > 3" @click="switchChange(n)" class="noselect">{{ n - 1 }}</span>
        </div>
      </div>
  
      <div v-if="nodeTypes[node.type].outputs" class="outputs">
        <div
          v-for="n in nodeTypes[node.type].outputs"
          :key="`output-socket-${n}`"
          class="socket"
          :class="{ active: isConnectionActive(node.id, n, 'output') }"
          @mousedown="$emit('start-path', $event, node.id, n)"
        />
      </div>
    </vue-draggable-resizable>
  </template>
  
  <script>
  import VueDraggableResizable from "vue-draggable-resizable";
  import { NODE_TYPES } from '@/utils/constants';
  import { getNodeType } from '@/utils/helpers';
  
  import './Node.scss';

  export default {
    name: 'NodeComponent',
    components: {
      VueDraggableResizable,
    },
    props: {
      node: {
        type: Object,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
      isDrawingPath: {
        type: Boolean,
        default: false,
      },
      isConnectionActive: {
        type: Function,
        required: true,
      },
    },
    data() {
      return {
        nodeTypes: NODE_TYPES,
      };
    },
    methods: {
      handleDrag(left, top) {
        this.$emit('update:node', { ...this.node, x: left, y: top }, false);
      },
      handleResizing(left, top, width, height) {
        this.$emit('update:node', { ...this.node, w: width, h: height }, false);
      },
      handleEnter(event) {
        this.updateNode(event);
        this.$emit('evaluate');
      },
      updateHeight(event) {
        const el = event.target.getBoundingClientRect();
        const height = Math.max(el.height, 40);
        this.$emit('update:node', { ...this.node, content: this.node.content, h: height }, false);
      },
      updateNode(event) {
        const content = this.node.content.trim().toLowerCase();
        const type = getNodeType(content)

        const width = type === "switch" ? 72 : (type === "out" ? 60 : this.node.w);
        this.$emit('update:node', { ...this.node, content, type, w: width });
        this.$nextTick(() => this.updateHeight(event));
      },
      switchChange(socket) {
        if (this.node.type !== "switch") return;
        this.$emit('switch-change', this.node.id, socket - 1);
        this.$emit('update:node', { ...this.node, activeSocket: socket - 1 });
        
      },
    },
  };
  </script>