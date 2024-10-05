<template>
  <div 
    ref="canvas" 
    class="canvas" 
    :class="`mode-${mode}`" 
    @click.ctrl="addNode" 
    @click="deselectAll"
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

    
  </div>
</template>

<script>
import { generateUniqueId, getMousePosition, downloadFile, trimParens } from "@/utils/helpers";
import { presets } from '@/utils/presets';
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
      context: null,
      byteBeatNode: null,
      isPlaying: false,
      selectedNode: null,
      selectedNodes: [],
      selectedConnections: [],
      mode: 'default',
      pathData: {},
      connecting: {},
      nodes: presets[0].nodes,
      connections: presets[0].connections,
      expressions: ['',''],
      error: null,
    };
  },
  computed: {
    canvasRect() {
      return this.$refs.canvas?.getBoundingClientRect() ?? {};
    }
  },
  methods: {
    find(property, key, value) {
      return this[property].find(item => item[key] === value);
    },
    exportByte() {
      const stringData = this.generateStringData();
      downloadFile(stringData, 'bytebeat.json', 'application/json');
    },
    generateStringData() {
      const data = {
        expressions: this.expressions,
        nodes: this.nodes,
        connections: this.connections
      };
      return JSON.stringify(data, null, 0);
      
    },
    async evaluateBytebeat() {
      try {
        const outputNode = this.find('nodes', 'type', 'out');

        if (!outputNode) {
          console.error('No output node found');
          this.error = 'No output node found'
          this.stop();
          return '0';
        }

        const evaluateNode = (nodeId, socketIndex = 0) => {
        
          const node = this.find('nodes', 'id', nodeId);
          if (!node) return '';

          const inputConnections = this.connections.filter(
            conn => conn.input.id === nodeId && conn.active && conn.input.socket === socketIndex
          );

          const leftConn = this.connections.find(conn => conn.input.id === nodeId && conn.input.socket === 0);
          const rightConn = this.connections.find(conn => conn.input.id === nodeId && conn.input.socket === 1);

          let result = '';
          switch (node.type) {
            case 'number':
              result = node.content;
              break;
            case 'exp':
              result = `(${node.content})`;
              break;
            case 'switch':
              const activeConn = this.connections.find(
                conn => conn.input.id === nodeId && conn.active
              );
              if (activeConn) {
                result = evaluateNode(activeConn.output.id, activeConn.output.socket);
              }
              break;
            case 'operator':
              result = `(${leftConn ? evaluateNode(leftConn.output.id, leftConn.output.socket) : '0'}${node.content}${rightConn ? evaluateNode(rightConn.output.id, rightConn.output.socket) : '0'})`;
              break;
            case 'negation':  // Nuevo caso para negación
              result = `!${leftConn ? evaluateNode(leftConn.output.id, leftConn.output.socket) : '0'}`;
              break;
            case 'function':
              result = `${node.content}(${leftConn ? trimParens(evaluateNode(leftConn.output.id, leftConn.output.socket)) : '0'})`;
              break;
            case 'conmut':
              const connectedExpressions = inputConnections.map(conn =>
                evaluateNode(conn.output.id, conn.output.socket)
              ).filter(expr => expr !== '');
              result = connectedExpressions.length > 0 ? `(${connectedExpressions.join(`${node.content}`)})` : '';
              break;
            case 'mouse':
              return `mouse${socketIndex ? 'X' : 'Y'}`
              break;
            case 'out':
              result = inputConnections.length > 0 ? evaluateNode(inputConnections[0].output.id, socketIndex) : '0';
              break;
            case 'time':
              result = 't';
              break;
            default:
              result = '0';
          }
          return result

        };

        this.expressions = [
          trimParens(evaluateNode(outputNode.id, 0)),
          trimParens(evaluateNode(outputNode.id, 1)),
        ];

        if (!this.isPlaying) return;
        await this.byteBeatNode.setExpressions([...this.expressions]);
        this.error = '';
      } catch (error) {
        this.error = 'sss'+error;
      }
    },
    async playPause() {
      if (this.isPlaying) {
        this.byteBeatNode.disconnect();
        this.isPlaying = false;
        return
      }

      try {

        if(!this.context) {
          this.context = new (window.AudioContext || window.webkitAudioContext)();
          this.context.resume();
          await ByteBeatNode.setup(this.context);
          
          this.byteBeatNode = new ByteBeatNode(this.context);
          this.byteBeatNode.setType(ByteBeatNode.Type.byteBeat);
          this.byteBeatNode.setExpressionType(ByteBeatNode.ExpressionType.infix);
          this.byteBeatNode.setDesiredSampleRate(8000);
          this.byteBeatNode.connect(this.context.destination);

        } else {
          this.byteBeatNode.connect(this.context.destination);
          this.context.resume();
        }
        
        this.byteBeatNode.setExpressions([...this.expressions]);
        this.isPlaying = true;

        console.log('playing',this.isPlaying)

      } catch (error) {
        console.error('Error starting ByteBeat:', error);
        this.error = error
      }
    },
    isConnectionActive(idToCheck, socketToCheck = 0, direction = 'output') {
      return this.connections.some(connection => 
        connection[direction].id === idToCheck && connection[direction].socket === socketToCheck
      );
    },
    stop() {
      this.byteBeatNode.disconnect();
      this.isPlaying = false;
    },
    switchChange(node, socket) {
      let firstMatchFound = false;

      this.connections.forEach(connection => {
        if (connection.input.id === node.id) {
          if (!firstMatchFound && connection.input.socket === socket) {
            connection.active = true;  // Activa la primera coincidencia
            firstMatchFound = true;    // Marca que ya encontramos la primera
            node.activeSocket = socket;
          } else {
            connection.active = false; // Desactiva las demás conexiones
          }
        }
      });
    },
    addNode(event) {
      const { offsetX, offsetY } = event;
      const newNode = {
        id: generateUniqueId(),
        type: "empty",
        content: "",
        w: 60,
        h: 40,
        x: offsetX - 30,
        y: offsetY - 20,
      };
      this.nodes.push(newNode);

      console.log(newNode.id)

      this.deselectAll()
    
      this.$nextTick(()=>{

        this.selectNode(newNode.id)
        const nodeRef = this.$refs[`node-${newNode.id}`][0]
        nodeRef.editable = true
        nodeRef.$el.querySelector('textarea').focus()
        
      })


    },
    deselectAll() {
      this.selectedNodes = []
      this.selectedConnections = []
    },
    handleNodeClick(id) {
      this.deselectAll()
      this.selectNode(id)
    },
    selectNode(nodeId) {
      if (!this.selectedNodes.includes(nodeId)) {
        this.selectedNodes.push(nodeId)
      }
    },
    selectConnection(connId) {
      console.log('selectConnection',connId)
      if (!this.selectedConnections.includes(connId)) {
        this.selectedConnections.push(connId)
      }
    },
    handleConnectionClick(connId) {
      console.log('click connection',connId)
      this.deselectAll()
      this.selectConnection(connId)
    },
    deleteNode(nodeId) {
      this.deselectAll()
      this.nodes = this.nodes.filter(node => node.id !== nodeId);

      this.connections = this.connections.filter(
        connection => connection.output.id !== nodeId && connection.input.id !== nodeId
      );

      if(!this.nodes.some(node => node.type == 'play')) {
        this.stop()
      }

      this.evaluateBytebeat()
    },
    deleteSelectedNodes() {

      this.selectedNodes.forEach(nodeId => {
        this.deleteNode(nodeId);
      });
      
    },
    deleteSelecteConnections(){
      this.selectedConnections.forEach(nodeId => {
        this.deleteConnection(nodeId);
      });
    },
    updateNode(updatedNode, shouldEvaluate = true) {
      const index = this.nodes.findIndex(node => node.id === updatedNode.id);

      if (index === -1) return;

      this.nodes.splice(index, 1, updatedNode);

      console.log('updatedNode',shouldEvaluate)

      // Check for invalid connections
      const nodeType = NODE_TYPES[updatedNode.type];
      if (!nodeType) {
        console.error(`Unknown node type: ${updatedNode.type}`);
        return;
      }

      if(updatedNode.type == 'conmut'){
        updatedNode.content = updatedNode.content[0]
      }

      this.connections = this.connections.filter(conn => {
        if (conn.input.id === updatedNode.id) {
          // Check if the connection's input socket is still valid
          return conn.input.socket < nodeType.inputs;
        }
        if (conn.output.id === updatedNode.id) {
          // Check if the connection's output socket is still valid
          return conn.output.socket < nodeType.outputs;
        }
        return true;
      });

      if (!shouldEvaluate) return;
      this.evaluateBytebeat();
      
    },
    handleStartPath(event, node, socket) {
      console.log('start path')
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
    getMaxConnectedInputSocket(nodeId) {
      const inputConnections = this.connections.filter(conn => conn.input.id === nodeId);
      if (inputConnections.length === 0) return null;
      const maxSocket = Math.max(...inputConnections.map(conn => conn.input.socket));
      return maxSocket;
    },
    handleFinishPath(nodeId, socket) {
      if (this.mode !== 'routing') return;

      const inputNode = this.find('nodes','id',nodeId)
      

      const isConnectionActive = inputNode.type == "conmut" || 
                           (inputNode.type == "switch" 
                            ? !this.connections.some(conn => conn.input.id === nodeId && conn.active)
                            : !this.connections.some(conn => conn.input.id === nodeId && conn.input.socket === socket && conn.active));

      const newConnection = {
        id: generateUniqueId(),
        output: { id: this.connecting.node, socket: this.connecting.socket },
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
    connectionExists(newConnection) {
      return this.connections.some(conn => 
        this.isEqual(conn.input, newConnection.input) && this.isEqual(conn.output, newConnection.output)
      );
    },
    isEqual(a, b) {
      return a.id === b.id && a.socket === b.socket;
    },
    deleteConnection(connId){

      console.log('deleteConnection',connId)

      const connection = this.find('connections','id',connId)
      const wasActive = connection.active
      const inputNode = this.find('nodes','id',connection.input.id)
      
      this.connections = this.connections.filter(conn => conn.id !== connId);
      
      inputNode.lastSocketConnected = this.getMaxConnectedInputSocket(inputNode.id);

      if(!wasActive || inputNode.type === 'conmut') {

        this.evaluateBytebeat();
        return 

      }

      const sameNodeInputConnection = this.connections.find(conn => (conn.input.id === inputNode.id) && (conn.input.socket === connection.input.socket))
      
      if(sameNodeInputConnection) {
        sameNodeInputConnection.active = true
      }

      this.evaluateBytebeat();

    },
    toggleConnections(connId){

      console.log(toggleConnection,connId)
      this.selectedConnection = connId;

      const connection = this.find('connections','id',connId)
        const node = this.find('nodes','id',connection.input.id)
        connection.active = !connection.active

        if(node.type == 'switch' && connection.active) {
          this.switchChange(node,connection.input.socket)
        } else {
          this.evaluateBytebeat();
        }
        
    },
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

        this.deleteSelecteConnections()
        this.deleteSelectedNodes()

      }
    },
    nodeKeyDown(nodeId,key){
      console.log('key',nodeId, key)
    }
  },
  mounted() {
    this.evaluateBytebeat();
    document.addEventListener('keydown',this.handleKeyDown)
    document.addEventListener('keyup',this.handleKeyUp)
  },
  beforeDestroy() {

    document.removeEventListener('keydown',this.handleKeyDown)
    document.removeEventListener('keyup',this.handleKeyUp)

    if (this.byteBeatNode) {
      this.context = null;
      this.byteBeatNode.disconnect(); 
      this.byteBeatNode = null; 
    }

    this.handleCancelPath();
  },
};
</script>