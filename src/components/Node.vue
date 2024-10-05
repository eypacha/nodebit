<template>
    <vue-draggable-resizable
      :parent="true"
      class="node"
      :class="[`node-${node.type}`, { selected, editable }]"
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
      @dblclick="editable = nodeTypes[node.type].editable"
      @focus="$parent.selectNode(node.id)"
      @blur="handleBlur"
      @keyup="handleNodeKeyUp"
      @keydown="handleKeyDown"
      @dragstart="editable = false"
      @dragging="handleDrag"
      @click.exact.stop="$parent.handleNodeClick(node.id)"
      @click.shift.exact.stop="$parent.selectNode(node.id)"
      @resizing="handleResizing"
    >
      <textarea
        v-if="nodeTypes[node.type].editable"
        autofocus
        ref="textarea"
        :class="{ noselect: isDrawingPath || !selected }"
        :readOnly="!editable"
        @blur="editable = false"
        role="textbox"
        v-model="node.content"
        @input="updateSize"
        @keypress.enter.exact.prevent="handleEnter"
      />

      <div
        v-else-if="node.type == 'play'"
        class="noselect"
        @click="$parent.playPause()"
        >
          {{ $parent.isPlaying ? 'pause' : 'play '}}
      </div>

      <div
        v-else-if="node.type == 'export'"
        class="noselect"
        @click="$parent.exportByte()">
        export
      </div>

      <div
        v-else-if="node.type == 'out'"
        class="content noselect">
        out
      </div>


      <div
        v-else-if="node.type == 'help'"
        class="content noselect">
        <textarea ref="textarea" readOnly>{{ $parent.helpText ?? 'Connect a node for show help about it. '}}</textarea>
      </div>

      <div
        v-else-if="node.type == 'conmut'"
        class="content noselect">
        {{ node.content }}
      </div>

      <div
        v-else-if="node.type == 'evaluated'"
        class="content noselect">
        <div v-if="$parent.expressions[0]  == $parent.expressions[1] ">
            OUT = {{ $parent.expressions[0] }}
          </div>
        <div v-else>
          <div>OUT(L) => {{ $parent.expressions[0] }}</div>
          <div>OUT(R) =>  {{ $parent.expressions[1] }}</div>
        </div>
      </div>

      <div
        v-else-if="node.type == 'errors'"
        class="content noselect">
        <div v-if="$parent.error">{{ $parent.error }}</div>
        <div v-else>No errors</div>
      </div>

      <div v-else class="content noselect" style="color: yellow !important">
        {{ node.content }}
      </div>
  
        <div v-if="nodeTypes[node.type].inputs" class="inputs">
          <div
            v-for="n in nodeTypes[node.type].inputs"
            :key="`input-socket-${n-1}`"
            class="socket-wrapper"
          >
            <div
              class="socket"
              :class="[`socket-${n-1}`,{ active: isConnectionActive(node.id, n-1, 'input'), switched: node.activeSocket == n-1 }]"
              @mouseup="$emit('finish-path', node.id, n-1)"/>
            <span v-if="nodeTypes[node.type].inputs > 3" @click="switchChange(n-1)" class="label noselect">{{ n }}</span>
          </div>
        </div>
    
        <div v-if="nodeTypes[node.type].outputs" class="outputs">
          <div
            v-for="n in nodeTypes[node.type].outputs"
            :key="`output-socket-${n-1}`"
            class="socket-wrapper"
          >
            <div
              class="socket"
              :class="`socket-${n-1}`,{ active: isConnectionActive(node.id, n-1, 'output') }"
              @mousedown="$emit('start-path', $event, node.id, n-1)"/>
          </div>
          <span v-if="nodeTypes[node.type].outputs > 3" class="label noselect">{{ n }}</span>
        </div>
    </vue-draggable-resizable>
  </template>
  
  <script>
  import VueDraggableResizable from "vue-draggable-resizable";
  import { NODE_TYPES, getNodeType } from '@/nodes/types';
  
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
      selected: {
        type: Boolean,
        default: null,
      },
      isDrawingPath: {
        type: Boolean,
        default: false,
      },
      isConnectionActive: {
        type: Function,
        required: true,
      },
      lastSocketConnected: {
        type: Number
      }
    },
    data() {
      return {
        nodeTypes: NODE_TYPES,
        editable: false,
      };
    },
    computed: {
      nodeMinWidth () {
        if(this.node.type === 'switch') {
          return (this.lastSocketConnected ? this.lastSocketConnected * 20 + 12 : 72);
        } 

        return this.nodeTypes[this.node.type].minWidth ?? 60;
      },
      nodeMinHeight() {
        return this.nodeTypes[this.node.type].minHeight ?? 41;
      },
      nodeMaxWidth() {
        return this.nodeTypes[this.node.type].maxWidth ?? null
      },
      nodeMaxHeight() {
        return this.nodeTypes[this.node.type].maxHeight ?? null; 
      }
    },
    methods: {
      handleBlur(){
  
        // this.$parent.selectedNode = null;

      },
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
      handleNodeKeyUp(event) {

        if(event.key == "Escape") {
          if(this.editable) {
            this.editable = false;
            this.$emit('update:node',this.node)
          } else {
            this.handleBlur()
          }
         
        }
        
      },
      handleKeyDown(event){
        if(this.node.type !== 'switch') return
        
        const keyPressed = parseInt(event.key);
        if (isNaN(keyPressed)) return

        let socketIndex = keyPressed === 0 ? 9 : keyPressed - 1
        this.$emit('switch-change', this.node, socketIndex);
        this.$emit('update:node', { ...this.node, activeSocket: socketIndex });
      },
      updateSize() {

        let textarea = this.$refs.textarea;

        textarea.style.height = "0";
        textarea.style.height = textarea.scrollHeight + "px";
   
        this.$nextTick(()=>{
          const el = textarea.getBoundingClientRect()
          const h = el.height;
          this.$emit('update:node', { ...this.node, content: this.node.content, h }, false);
          })
       
      },
      updateNode(event) {
        let { content, w, h } = this.node;
        content = content.trim();

        let type = getNodeType(content);
        const minWidth = this.nodeTypes[type]?.minWidth || 60;
        const minHeight = this.nodeTypes[type]?.minHeight || 60;

        if (type === 'switch') {
          w = minWidth;
        } else if (type === 'exp') {
          w = Math.max(w, minWidth);
          content = content === 'exp' ? '' : content;
        } else if(type === 'manual') {
          type = 'comment'
          w = this.nodeTypes['manual'].minWidth
          h = this.nodeTypes['manual'].minHeight
          content =  this.nodeTypes['manual'].content
        } else if(type === 'help') {
          w = minWidth
          h = minHeight
        } 

        if(!this.nodeTypes[type].editable) this.editable = false

        this.$emit('update:node', { ...this.node, content, type, w, h });
        this.$nextTick(() => this.updateSize());
      },
      switchChange(socket) {
        if (this.node.type !== "switch") return;
        this.$emit('switch-change', this.node.id, socket - 1);
        this.$emit('update:node', { ...this.node, activeSocket: socket - 1 });
        
      },
    },
  };
  </script>