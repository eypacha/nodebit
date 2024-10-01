<template>
  <div class="evaluated">
    <button v-if="false" @click="evaluateBytebeat()">evaluate</button>
    {{ this.evaluated }}
  </div>
  <div 
    ref="canvas" 
    class="canvas" 
    :class="`mode-${mode}`" 
    @click.ctrl="addNode" 
    @click="activeNode = null"
  >
    <ConnectionsLayer
      :connections="connections"
      :nodes="nodes"
      :mode="mode"
      :path-data="pathData"
      @path-click="pathClick"
    />

    <Node
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      :is-active="activeNode === node.id"
      :is-drawing-path="mode === 'routing'"
      :is-connection-active="isConnectionActive"
      @update:node="updateNode"
      @evaluate="evaluateBytebeat"
      @node-mousedown="handleNodeMouseDown"
      @start-path="handleStartPath"
      @finish-path="handleFinishPath"
      @switch-change="switchChange"
    />
  </div>
</template>

<script>
import Node from './Node.vue';
import ConnectionsLayer from './ConnectionsLayer.vue';
import { generateUniqueId, getMousePosition} from "@/utils/helpers";
import { nodes, connections } from '@/utils/presets';
import { NODE_TYPES } from '@/utils/constants';
import './GraphCanvas.scss';

export default {
  name: 'GraphCanvas',
  components: {
    Node,
    ConnectionsLayer
  },
  data() {
    return {
      activeNode: null,
      mode: 'default',
      pathData: {},
      connecting: {},
      nodes,
      connections,
      evaluated: ''
    };
  },
  computed: {
    canvasRect() {
      return this.$refs.canvas?.getBoundingClientRect() ?? {};
    }
  },
  methods: {
    evaluateBytebeat() {
      const outputNode = this.nodes.find(node => node.type === 'out');
      if (!outputNode) {
        console.error('No output node found');
        return '';
      }

      const evaluatedExpressions = new Map();

      const evaluateNode = (nodeId, socketIndex = 0) => {
        if (evaluatedExpressions.has(nodeId)) {
          return evaluatedExpressions.get(nodeId);
        }

        const node = this.nodes.find(n => n.id === nodeId);
        if (!node) return '';

        const inputConnections = this.connections.filter(
          conn => conn.input.id === nodeId && conn.active
        );

        let result = '';
        switch (node.type) {
          case 'exp':
          case 'number':
            result = node.content;
            break;

          case 'switch':
            const activeConn = inputConnections.find(conn => conn.input.socket === node.activeSocket);
            if (activeConn) {
              result = evaluateNode(activeConn.output.id, activeConn.output.socket);
            }
            break;

          case 'conmut':
            const connectedExpressions = inputConnections.map(conn => 
              evaluateNode(conn.output.id, conn.output.socket)
            ).filter(expr => expr !== '');
            result = connectedExpressions.length > 0 ? 
              `(${connectedExpressions.join(` ${node.content} `)})` : '';
            break;

          case 'out':
            if (inputConnections.length > 0) {
              result = evaluateNode(inputConnections[0].output.id, inputConnections[0].output.socket);
            }
            break;

          default:
            result = '';
        }

        // If this node has inputs and is not a conmut or switch, wrap its result with its inputs
        if (inputConnections.length > 0 && node.type !== 'conmut' && node.type !== 'switch' && node.type !== 'out') {
          const inputExpressions = inputConnections.map(conn => 
            evaluateNode(conn.output.id, conn.output.socket)
          ).filter(expr => expr !== '');
          if (inputExpressions.length > 0) {
            result = `(${inputExpressions.join(' ')} ${result})`;
          }
        }

        evaluatedExpressions.set(nodeId, result);
        return result;
      };

      this.evaluated = evaluateNode(outputNode.id);
      console.log("Evaluated expression:", this.evaluated);
    },
    isConnectionActive(idToCheck, socketToCheck = 1, direction = 'output') {
      return this.connections.some(connection => 
        connection[direction].id === idToCheck && connection[direction].socket === (socketToCheck - 1)
      );
    },
    switchChange(nodeId, socket) {
      this.connections.forEach(connection => {
        if (connection.input.id === nodeId) {
          connection.active = connection.input.socket === socket;
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
    },
    handleNodeMouseDown(id) {
      if (this.mode == 'deleting') {
        this.deleteNode(id);
      } else {
        this.activeNode = id;
      }
    },
    deleteNode(id) {
      this.nodes = this.nodes.filter(node => node.id !== id);
      this.connections = this.connections.filter(
        connection => connection.output.id !== id && connection.input.id !== id
      );
      this.evaluateBytebeat()
    },
    updateNode(updatedNode, shouldEvaluate = true) {
      const index = this.nodes.findIndex(node => node.id === updatedNode.id);

      if (index === -1) return;

      const oldNode = this.nodes[index];
      this.nodes.splice(index, 1, updatedNode);

      // Check for invalid connections
      const nodeType = NODE_TYPES[updatedNode.type];
      if (!nodeType) {
        console.error(`Unknown node type: ${updatedNode.type}`);
        return;
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
      this.mode = 'routing';
      this.connecting = { node, socket: socket - 1 };
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
    handleFinishPath(node, socket) {
      if (this.mode !== 'routing') return;
      const newConnection = {
        id: generateUniqueId(),
        output: { id: this.connecting.node, socket: this.connecting.socket },
        input: { id: node, socket: socket - 1 },
        active: true,
      };
      if (!this.connectionExists(newConnection)) {
        this.connections.push(newConnection);
        this.evaluateBytebeat()
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
    pathClick(id) {
      if (this.mode === 'deleting') {
        this.connections = this.connections.filter(connection => connection.id !== id);
        this.evaluateBytebeat();
      } else if(this.mode === 'toggling') {
        const connection = this.connections.find(connection => connection.id === id)
        connection.active = !connection.active
        this.evaluateBytebeat();

        if(connection.active) {
          this.switchChange(connection.input.id,connection.input.socket)
        }
      }
      
    },
    handleCancelPath() {
      this.mode = 'default'
      document.removeEventListener("mouseup", this.handleCancelPath);
      document.removeEventListener('mousemove', this.drawPath);
    },
    handleKeyDown(event) {

      if (event.key.toLowerCase() === 'd') {
        this.mode = 'deleting'
      } else if (event.key.toLowerCase() === 'm') {
        this.mode = 'toggling'
      } else if(event.ctrlKey) {
        this.mode = 'adding'
      }
    },
    handleKeyUp(event) {
      if (event.key.toLowerCase() === 'd' || event.key.toLowerCase()  === 'm' || event.key === 'Control') {
        this.mode = 'default'
      }
    },
  },
  mounted() {
    this.evaluateBytebeat()
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.handleCancelPath();
  },
};
</script>