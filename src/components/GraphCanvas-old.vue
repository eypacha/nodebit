<template>
  <div 
    ref="canvas" 
    class="canvas" 
    :class="`mode-${mode}`" 
    @click.ctrl.prevent="addNode" 
    @click="handleCanvasClick"
    @mousedown="startMouseSelection"
    @mousemove="trackMousePosition"
    @mouseleave="this.selectionBox = false"
  >
    <ConnectionsLayer
      :connections="connections"
      :nodes="nodes"
      :mode="mode"
      :path-data="pathData"
    />

    <Node
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      :ref="`node-${node.id}`"
      :selected="selectedNodes.includes(node.id)"
      :is-drawing-path="mode === 'routing'"
      :is-connection-active="isConnectionActive"
      :lastSocketConnected="node.lastSocketConnected"
      @update:node="updateNode"
      @evaluate="evaluateBytebeat"
      @start-path="handleStartPath"
      @finish-path="handleFinishPath"
      @switch-change="switchChange"
    />

    <div
      v-if="selectionBox?.width > 4 || selectionBox?.height > 4"
      class="selection-box"
      :style="{ left: `${selectionBox.left}px`, top: `${selectionBox.top}px`, width: `${selectionBox.width}px`, height: `${selectionBox.height}px`}"
      >
    </div>
    
  </div>
</template>

<script>
import { generateUniqueId, getMousePosition, trimParens } from "@/utils/helpers";
import { NODE_TYPES } from "@/nodes/types";

import Node from './Node.vue';
import ConnectionsLayer from './ConnectionsLayer.vue';

import './GraphCanvas.scss';

export default {
  name: 'GraphCanvas',
  components: {
    Node,
    ConnectionsLayer
  },
  data() {
    return {
      nodeTypes: NODE_TYPES,
      selectedNode: null,
      selectedNodes: [],
      preSelectedNodes: [],
      selectedConnections: [],
      selectionBox: null,
      mode: 'default',
      pathData: {},
      connecting: {},
      expressions: ['',''],
      error: null,
      intervalId: null
    };
  },
  computed: {
    canvasRect() {
      return this.$refs.canvas?.getBoundingClientRect() ?? {};
    },
  },
  methods: {
    find(property, key, value) {
      return this[property].find(item => item[key] === value);
    },
    // exportByte() {
    //   const stringData = this.generateStringData();
    //   downloadFile(stringData, 'bytebeat.json', 'application/json');
    // },
    // generateStringData() {
    //   const data = {
    //     expressions: this.expressions,
    //     nodes: this.nodes,
    //     connections: this.connections
    //   };
    //   return JSON.stringify(data, null, 0);
      
    // },
    // getConnectionArray(nodeId) {

    //   const connsArray = [];
    //   let socketIndex = 0;
    //   let conn;

    //   console.log('getConnectionArray',nodeId)

    //   do {

    //     console.log('iteration',socketIndex)

    //     conn = this.connections.find(c => 
    //       c.input.id === nodeId && 
    //       c.input.socket === socketIndex 
    //     );

    //     console.log('found',conn ?? 'no conns')

    //     if (conn) {
    //       connsArray.push(...conn);
    //       socketIndex++;
    //     } 
    //   } while (conn);

    //   return connsArray;
    // },
    // isConnectionActive(idToCheck, socketToCheck = 0, direction = 'output') {
    //   return this.connections.some(connection => 
    //     connection[direction].id === idToCheck && connection[direction].socket === socketToCheck
    //   );
    // },
    // switchChange(node, socket) {
    //   let firstMatchFound = false;

    //   this.connections.forEach(connection => {
    //     if (connection.input.id === node.id) {
    //       if (!firstMatchFound && connection.input.socket === socket) {
    //         connection.active = true;  // Activa la primera coincidencia
    //         firstMatchFound = true;    // Marca que ya encontramos la primera
    //         node.activeSocket = socket;
    //       } else {
    //         connection.active = false; // Desactiva las demás conexiones
    //       }
    //     }
    //   });
    // },
    async addNode(event) {
      const { offsetX, offsetY } = event;

      newNodeId = await studio.addNode(offsetX-30, offsetY,20)

      this.$nextTick(()=>{

        studio.selectNode(newNodeId)
        
        const nodeRef = this.$refs[`node-${newNode.id}`][0]
        nodeRef.editable = true
        nodeRef.$el.querySelector('textarea').focus()
        
      })


    },
    // deselectAll() {
    //   this.selectedNodes = []
    //   this.selectedConnections = []
    //   this.seletionBox = null
    // },
    // handleNodeClick(nodeClick) {
    //   studio.deselectAll()
    //   studio.selectNode(nodeClick)
    // },
    // selectNode(nodeId) {
    //   if (!this.selectedNodes.includes(nodeId)) {
    //     this.selectedNodes.push(nodeId)
    //   }
    // },
    // toggleSelection(nodeId){
    //   if (this.selectedNodes.includes(nodeId)) {
    //     this.selectedNodes = this.selectedNodes.filter(id => id !== nodeId);
    //   } else {
    //     this.selectedNodes.push(nodeId);
    //   }
    // },
    // selectConnection(connId) {
    //   if (!this.selectedConnections.includes(connId)) {
    //     this.selectedConnections.push(connId)
    //   }
    // },
    handleCanvasClick(){
      if(this.selectionBox.width < 2) this.deselectAll()
      this.selectionBox = false
    },
    startMouseSelection(event){

      console.log('startMouseSelection')

      this.preSelectedNodes = [...this.selectedNodes]

      const { x, y } = getMousePosition(event,this.canvasRect);

      this.selectionBox = {
        startX: x,
        startY: y,
        left: x,
        top: y,
        width: 0,
        height: 0
      }
    },
    trackMousePosition(event){

      if(event.buttons != 1) return
      if(!this.selectionBox) return

      const { x, y } = getMousePosition(event,this.canvasRect);
      const { startX, startY } = this.selectionBox

      this.selectionBox = {
        startX: startX,
        startY: startY,
        left: Math.min(x, startX),
        top: Math.min(y, startY),
        width: Math.abs(x - startX),
        height: Math.abs(y - startY),
      };

      this.mouseSelectNodes()

    },
    mouseSelectNodes() {
        const newSelectedNodes = studio.nodes

        .filter(node => {
          const nodeRight = node.x + node.w;
          const nodeBottom = node.y + node.h;
          const selectionRight = this.selectionBox.left + this.selectionBox.width;
          const selectionBottom = this.selectionBox.top + this.selectionBox.height;
          return (
            node.x < selectionRight &&
            nodeRight > this.selectionBox.left &&
            node.y < selectionBottom &&
            nodeBottom > this.selectionBox.top
          );
        })
        .map(node => node.id);

      // Invertir la selección
      studio.selectedNodes = studio.nodes
        .filter(node => {
          const nodeId = node.id;

          const isSelectedBefore = this.preSelectedNodes.includes(nodeId);
          const isSelectedNow = newSelectedNodes.includes(nodeId);

          return (isSelectedBefore && !isSelectedNow) || (!isSelectedBefore && isSelectedNow);
        })
        .map(node => node.id);
    },
    endMouseSelection(){
      this.selectionBox = null
    },
    handleConnectionClick(connId) {
      studio.deselectAll()
      studio.selectConnection(connId)
    },
    // deleteNode(nodeId) {
    //   this.deselectAll()
    //   this.nodes = this.nodes.filter(node => node.id !== nodeId);

    //   this.connections = this.connections.filter(
    //     connection => connection.output.id !== nodeId && connection.input.id !== nodeId
    //   );

    //   if(!this.nodes.some(node => node.type == 'play')) {
    //     this.stop()
    //   }

    //   this.evaluateBytebeat()
    // },
    // deleteSelectedNodes() {
    //   this.selectedNodes.forEach(nodeId => {
    //     this.deleteNode(nodeId);
    //   });
    // },
    // deleteSelecteConnections(){
    //   this.selectedConnections.forEach(nodeId => {
    //     this.deleteConnection(nodeId);
    //   });
    // },
    // updateNode(updatedNode, shouldEvaluate = true) {
    //   const index = this.nodes.findIndex(node => node.id === updatedNode.id);

    //   if (index === -1) return;

    //   this.nodes.splice(index, 1, updatedNode);

    //   console.log('updatedNode',shouldEvaluate)

    //   // Check for invalid connections
    //   const nodeType = NODE_TYPES[updatedNode.type];
    //   if (!nodeType) {
    //     console.error(`Unknown node type: ${updatedNode.type}`);
    //     return;
    //   }

    //   if(updatedNode.type == 'conmut'){
    //     updatedNode.content = updatedNode.content[0]
    //   }

    //   this.connections = this.connections.filter(conn => {
    //     if (conn.input.id === updatedNode.id) {
    //       // Check if the connection's input socket is still valid
    //       return conn.input.socket < nodeType.inputs;
    //     }
    //     if (conn.output.id === updatedNode.id) {
    //       // Check if the connection's output socket is still valid
    //       return conn.output.socket < nodeType.outputs;
    //     }
    //     return true;
    //   });

    //   if (!shouldEvaluate) return;
    //   this.evaluateBytebeat();
      
    // },
    handleStartPath(event, node, socket) {
      this.mode = 'routing';
      this.connecting = { node, socket: socket };
      const { x, y } = getMousePosition(event,this.canvasRect);
      this.pathData = { x1: x, y1: y, x2: x, y2: y };
      document.addEventListener("mouseup", this.handleCancelPath);
      document.addEventListener('mousemove', this.drawPath);
    },
    drawPath(event) {
      if (this.mode !== 'routing') return;
      const { x, y } = getMousePosition(event, this.canvasRect);
      this.pathData = Object.assign({}, this.pathData, { x2: x, y2: y });
    },
    // getMaxConnectedInputSocket(nodeId) {
    //   const inputConnections = this.connections.filter(conn => conn.input.id === nodeId);
    //   if (inputConnections.length === 0) return null;
    //   const maxSocket = Math.max(...inputConnections.map(conn => conn.input.socket));
    //   return maxSocket;
    // },
    handleFinishPath(nodeId, socket) {
      if (this.mode !== 'routing') return;

      const inputNode = studio.find('nodes','id',nodeId)
      

      const isConnectionActive = inputNode.type == "conmut" || 
                           (inputNode.type == "switch" 
                            ? !studio.connections.some(conn => conn.input.id === nodeId && conn.active)
                            : !studio.connections.some(conn => conn.input.id === nodeId && conn.input.socket === socket && conn.active));

      const newConnection = {
        id: generateUniqueId(),
        output: { id: studio.connecting.node, socket: studio.connecting.socket },
        input: { id: nodeId, socket: socket},
        active: isConnectionActive,
      };

      
      if(inputNode.type == "switch" && newConnection.active == true) {
         inputNode.activeSocket = newConnection.input.socket
      }

      if (!this.connectionExists(newConnection)) {

        this.connections.push(newConnection);
        inputNode.lastSocketConnected = this.getMaxConnectedInputSocket(nodeId)
        this.evaluateBytebeat()
      }

      if(inputNode.type == "help" && newConnection.active == true) {
        const outputNode = this.find('nodes','id',this.connecting.node)

        const subgroup = this.nodeTypes[outputNode.type].descriptions;

         this.helpText = `NAME: ${subgroup ? subgroup[outputNode.content].name : this.nodeTypes[outputNode.type].name}

DESCRIPTION:
${subgroup ? subgroup[outputNode.content].description : this.nodeTypes[outputNode.type].description}`


      }

      this.handleCancelPath();
    },
    // connectionExists(newConnection) {
    //   return this.connections.some(conn => 
    //     this.isEqual(conn.input, newConnection.input) && this.isEqual(conn.output, newConnection.output)
    //   );
    // },
    // isEqual(a, b) {
    //   return a.id === b.id && a.socket === b.socket;
    // },
    // deleteConnection(connId){

    //   console.log('deleteConnection',connId)

    //   const connection = this.find('connections','id',connId)
    //   const wasActive = connection.active
    //   const inputNode = this.find('nodes','id',connection.input.id)
      
    //   this.connections = this.connections.filter(conn => conn.id !== connId);
      
    //   inputNode.lastSocketConnected = this.getMaxConnectedInputSocket(inputNode.id);

    //   if(!wasActive || inputNode.type === 'conmut') {

    //     this.evaluateBytebeat();
    //     return 

    //   }

    //   const sameNodeInputConnection = this.connections.find(conn => (conn.input.id === inputNode.id) && (conn.input.socket === connection.input.socket))
      
    //   if(sameNodeInputConnection) {
    //     sameNodeInputConnection.active = true
    //   }

    //   this.evaluateBytebeat();

    // },
    // toggleConnections(connId){

    //   // console.log(toggleConnection,connId)
    //   studio.selectedConnection = connId;

    //   const connection = studio.find('connections','id',connId)
    //     const node = studio.find('nodes','id',connection.input.id)
    //     connection.active = !connection.active

    //     if(node.type == 'switch' && connection.active) {
    //       studio.switchChange(node,connection.input.socket)
    //     } else {
    //       studio.evaluateBytebeat();
    //     }
        
    // },
    handleCancelPath() {
      this.mode = 'default'
      document.removeEventListener("mouseup", this.handleCancelPath);
      document.removeEventListener('mousemove', this.drawPath);
    },
    handleKeyDown(event) {
      this.mode = 'default'
      if(event.ctrlKey) {
        this.mode = 'adding'
      }
    },
    handleKeyUp(event) {
      this.mode = 'default'

      if(event.key == "Delete" || event.key == "Backspace") {

        console.log('delete in canvas')

        studio.deleteSelecteConnections()
        studio.deleteSelectedNodes()

      }
    },
  },
  mounted() {
    studio.evaluateBytebeat();
    document.addEventListener('keydown',this.handleKeyDown)
    document.addEventListener('keyup',this.handleKeyUp)
  },
  beforeDestroy() {
    document.removeEventListener('keydown',this.handleKeyDown)
    document.removeEventListener('keyup',this.handleKeyUp)

    if (studio.byteBeatNode) {
      studio.context = null;
      studio.byteBeatNode.disconnect(); 
      studio.byteBeatNode = null; 
    }

    this.handleCancelPath();
  },
};
</script>