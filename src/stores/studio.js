import { defineStore } from "pinia";
import { audioEngine } from "@/services/audioEngineService";
import { presets } from "@/utils/presets";
import { NODE_TYPES } from "@/nodes/types";
import { generateUniqueId, trimParens } from "@/utils/helpers";


const { nodes, connections } = presets[0];

const MAX_HISTORY = 50;

export const useStudioStore = defineStore("studio", {
  state: () => ({
    nodes,
    connections,
    mode: "default",
    isPlaying: false,
    sampleRate: 8000,
    expressions: ["", ""],
    error: null,
    nodeTypes: NODE_TYPES,
    selectedNode: null,
    selectedNodes: [],
    selectedConnection: null,
    selectedConnections: [],
    copiedNodes: [],
    pathData: {},
    connecting: {},
    time: 0,
    visualizationData: { left: null, right: null },
    num: 0,
    hasVisualizerNode: false,
    visualizationInterval: null,
    isDragging: false,
    isResizing: false,
    history: [],
    historyIndex: -1,
    theme: {
      darkMode: true,
      greyscale: false,
      hueRotation: 0
    }
  }),
  actions: {
    initializeHistory() {
      const initialState = {
        nodes: this.nodes.map(node => ({ ...node })),
        connections: this.connections.map(conn => ({
          ...conn,
          output: { ...conn.output },
          input: { ...conn.input }
        })),
        selectedNodes: [...this.selectedNodes],
        selectedConnections: [...this.selectedConnections],
      };
      this.history = [initialState];
      this.historyIndex = 0;
    },
    saveState() {
      console.info('💾 saveState')
      const currentState = {
        nodes: this.nodes.map(node => ({ ...node })),
        connections: this.connections.map(conn => ({ 
          ...conn, 
          output: { ...conn.output }, 
          input: { ...conn.input } 
        })),
        selectedNodes: [...this.selectedNodes],
        selectedConnections: [...this.selectedConnections],
      };

      // Eliminar estados futuros si estamos en medio del historial
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }

      this.history.push(currentState);
      if (this.history.length > MAX_HISTORY) {
        this.history.shift();
      }
      this.historyIndex = this.history.length - 1;
      console.log('💾 historyIndex',this.historyIndex)
    },
    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        console.log('↩️ undo','historyIndex',this.historyIndex)
        this.applyState(this.history[this.historyIndex]);
        
      }
    },
    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        console.log('↪️ redo', 'historyIndex', this.historyIndex);
        this.applyState(this.history[this.historyIndex]);
      }
    },
    applyState(state) {
      console.log('aplyState',this.historyIndex,'of',this.history.length)
      this.nodes = state.nodes;
      this.connections = state.connections;
      this.selectedNodes = state.selectedNodes;
      this.selectedConnections = state.selectedConnections;
    },
    setIsDragging(value) {
      this.isDragging = value
      console.log('🖱 setIsDragging',value)
      if(!this.isDragging) {
        this.saveState()
      }
    },
    setIsResizing(value) {
      this.isResizing = value
      if(!this.isResizing) {
        this.saveState()
      }
    },
    async updateVisualization(width) {
      this.visualizationData = await audioEngine.getSamplesForVisualization(width);
    },
    startRendering() {

      if (this.visualizationInterval) {
        clearInterval(this.visualizationInterval);
      }
    
      const updateTime = () => {
      
        if(this.isPlaying) {
          const time = audioEngine.getTime();
          this.time = time;
          requestAnimationFrame(updateTime)
        }
      }

      const updateVisualization = () => {
        if (this.isPlaying) {
          if (this.hasVisualizerNode) {
            this.updateVisualization(256); 
          }
        } else {
          
          clearInterval(this.visualizationInterval);
        }
      };
    
      requestAnimationFrame(updateTime)
      this.visualizationInterval = setInterval(updateVisualization, 128);
    },
    setSampleRate(sampleTime = 8000) {
      this.sampleRate = sampleTime
      audioEngine.setSampleRate(sampleTime)
    },
    getSampleRate(){
      return audioEngine.getDesiredSampleRate();
    },
    async playPause() {
      if (!this.isPlaying) {
        const result = await audioEngine.play();
        
        this.hasVisualizerNode = this.nodes.some(node => node.type === 'visualizer');

        audioEngine.setExpressions([...this.expressions]);
        if (result) {
          this.isPlaying = true;
          this.startRendering()
        }
      } else {
        const result = audioEngine.pause();
        if (result) {
          this.isPlaying = false;
          this.startRendering()
        }
      }
    },
    async stop() {
      
      const result = await audioEngine.stop();
      this.time = 0
      if (result) {
        this.isPlaying = false;
        this.visualizationData = null;
      }
    },
    async reset() {
      await audioEngine.reset();
      this.time = 0
      this.visualizationData = null;
    },
    addNode(x, y) {
      const newNode = {
        id: generateUniqueId(),
        type: "empty",
        content: "",
        w: 65,
        h: 44,
        x: x,
        y: y,
      };

      this.nodes.push(newNode);

      console.log(newNode.id);

      this.deselectAll();

      return newNode.id;
    },
    addNodeWithType(x, y, nodeType, content) {
      const nodeTypeConfig = NODE_TYPES[nodeType] || {};
      
      const newNode = {
        id: generateUniqueId(),
        type: nodeType,
        content: content || "",
        w: nodeTypeConfig.minWidth || 65,
        h: nodeTypeConfig.minHeight || 44,
        x: x,
        y: y,
      };

      this.nodes.push(newNode);

      console.log('🆕 new Node created with type:', nodeType, newNode.id);

      this.deselectAll();

      return newNode.id;
    },
    deleteNode(nodeId) {
      this.deselectAll();
      this.nodes = this.nodes.filter((node) => node.id !== nodeId);

      this.connections = this.connections.filter(
        (connection) =>
          connection.output.id !== nodeId && connection.input.id !== nodeId
      );

      this.hasVisualizerNode = this.nodes.some((node) => node.type == "visualizer")
    },
    deleteSelectedNodes() {
      if(this.selectedNodes.length === 0) return
      
      this.selectedNodes.forEach((nodeId) => {
        this.deleteNode(nodeId);
      });

      if (!this.nodes.some((node) => node.type == "play" || node.type == "stop")) this.stop();
    },
    copySelection() {
      this.copiedNodes = [...this.selectedNodes];
    },
    pasteSelection(mousePosition) {

      const startTime = Date.now()
      console.log('⏰ startTime:',startTime)
      this.saveState();
      this.deselectAll();

      const copiedNodes = this.copiedNodes.map(nodeId => this.find("nodes", "id", nodeId));
  
      const deltaX = Math.min(...copiedNodes.map(node => node.x));
      const deltaY = Math.min(...copiedNodes.map(node => node.y));

      const newIdsMap = new Map();

      copiedNodes.forEach(copiedNode => {
        const newNode = {
          ...copiedNode,
          id: generateUniqueId(),
          x: mousePosition.x + (copiedNode.x - deltaX),
          y: mousePosition.y + (copiedNode.y - deltaY),
        };
        this.nodes.push(newNode);
    
        newIdsMap.set(copiedNode.id, newNode.id);
      });

      let newConnectionCounter = 0
      this.connections.forEach(connection => {
        const isInputCopied = newIdsMap.has(connection.input.id);
        const isOutputCopied = newIdsMap.has(connection.output.id);
    
        if (isInputCopied && isOutputCopied) {
          const newConnection = {
            ...connection,
            id: generateUniqueId(),
            input: {
              ...connection.input,
              id: isInputCopied ? newIdsMap.get(connection.input.id) : connection.input.id
            },
            output: {
              ...connection.output,
              id: isOutputCopied ? newIdsMap.get(connection.output.id) : connection.output.id
            }
          };
    
          this.connections.push(newConnection);
          newConnectionCounter++
        }
      });

      const duration = Date.now() - startTime
      console.log('⏰ Method took',duration,"ms.", copiedNodes.length, "nodos",newConnectionCounter,"cononectores")
      
    },
    addNode(x, y) {
      const newNode = {
        id: generateUniqueId(),
        type: "empty",
        content: "",
        w: 65,
        h: 44,
        x: x,
        y: y,
      };

      this.nodes.push(newNode);

      console.log(newNode.id);

      this.deselectAll();

      return newNode.id;
    },
    deleteConnection(connId) {
      const connection = this.find("connections", "id", connId);
      const wasActive = connection.active;
      const inputNode = this.find("nodes", "id", connection.input.id);

      this.connections = this.connections.filter((conn) => conn.id !== connId);

      inputNode.lastSocketConnected = this.getMaxConnectedInputSocket(inputNode.id);

      if (!wasActive || inputNode.type === "conmut") return;

      const nextConnection = this.connections.find(
        (conn) =>
          conn.input.id === inputNode.id &&
          conn.input.socket === connection.input.socket
      );

      if (nextConnection) {
        nextConnection.active = true;
      }
    },
    toggleConnection(connId) {
      console.log('toggleConnection',connId)
      const connection = this.find("connections", "id", connId);
      connection.active = !connection.active;
    },
    deleteSelectedConnections() {
      this.selectedConnections.forEach((nodeId) => {
        this.deleteConnection(nodeId);
      });
    },
    toggleSelectedConnections() {
      console.log('toggling connections')
      this.selectedConnections.forEach((nodeId) => {
        this.toggleConnection(nodeId);
      });
      this.evaluateBytebeat();
    },
    deselectAll() {
      this.selectedNodes = [];
      this.selectedConnections = [];
      this.seletionBox = null;
    },
    selectNode(nodeId) {
      if (!this.selectedNodes.includes(nodeId)) {
        this.selectedNodes.push(nodeId);
      }
    },
    toggleSelection(nodeId) {
      if (this.selectedNodes.includes(nodeId)) {
        this.selectedNodes = this.selectedNodes.filter((id) => id !== nodeId);
      } else {
        this.selectedNodes.push(nodeId);
      }
    },
    selectConnection(connId) {
      if (!this.selectedConnections.includes(connId)) {
        this.selectedConnections.push(connId);
      }
    },
    updateNode(nodeId, updatedProps) {

      const index = this.nodes.findIndex((node) => node.id === nodeId);
      if (index === -1) return;

      const updatedNode = {
        ...this.nodes[index],
        ...updatedProps,
      };

      console.log('📝 updateNode',nodeId, updatedProps)

      this.nodes.splice(index, 1, updatedNode);

    
      if (updatedProps.type) {
        this.checkInvalidConnections(index);
      }

      if (
        updatedProps.type ||
        updatedProps.content ||
        updatedProps.activeSocket !== undefined
      ) {
        this.evaluateBytebeat();
      }

      if(updatedProps.type == 'visualizer') this.hasVisualizerNode = true
    },
    checkInvalidConnections(nodeIndex) {
      const node = this.nodes[nodeIndex];

      const nodeType = NODE_TYPES[node.type];
      if (!nodeType) {
        console.error(`Unknown node type: ${node.type}`);
        return;
      }

      if (node.type == "conmut") {
        node.content = node.content[0];
      }

      this.connections = this.connections.filter((conn) => {
        if (conn.input.id === node.id) {
          // Check if the connection's input socket is still valid
          return conn.input.socket < nodeType.inputs;
        }
        if (conn.output.id === node.id) {
          // Check if the connection's output socket is still valid
          return conn.output.socket < nodeType.outputs;
        }
        return true;
      });
    },
    getMaxConnectedInputSocket(nodeId) {
      const inputConnections = this.connections.filter(
        (conn) => conn.input.id === nodeId
      );
      if (inputConnections.length === 0) return null;
      const maxSocket = Math.max(
        ...inputConnections.map((conn) => conn.input.socket)
      );
      return maxSocket;
    },
    async evaluateBytebeat() {
      console.log('🧮 Evaluating')
      try {
        const outputNode = this.find("nodes", "type", "out");

        if (!outputNode) {
          console.warn("🔌 No output node found");
          this.error = "No output node found";
          audioEngine.pause();
          return "0";
        }
        const evaluateNode = (nodeId, socketIndex = 0) => {
          // let connectionArray = this.getConnectionArray(nodeId)
          // console.log(connectionArray)

          const node = this.find("nodes", "id", nodeId);
          if (!node) return "";

          const inputConnections = this.connections.filter(
            (conn) =>
              conn.input.id === nodeId &&
              conn.active &&
              conn.input.socket === socketIndex
          );

          const leftConn = this.connections.find(
            (conn) =>
              conn.input.id === nodeId && conn.active && conn.input.socket === 0
          );
          const rightConn = this.connections.find(
            (conn) =>
              conn.input.id === nodeId && conn.active && conn.input.socket === 1
          );

          let result = "";
            switch (node.type) {
              case "number":
                result = node.content;
                break;
              case "exp":
                result = `(${node.content})`;
                break;
              case "toggle":
                result = (node.content === 0) ? (leftConn ? evaluateNode(leftConn.output.id, leftConn.output.socket) : "0") : (rightConn ? evaluateNode(rightConn.output.id, rightConn.output.socket) : "0") 
                break;
              case "range":
                // Interpolación entre los valores de los nodos conectados
                // Si no hay conexiones, usa 0 y 1 como valores por defecto
                const leftValue = leftConn ? parseFloat(evaluateNode(leftConn.output.id, leftConn.output.socket)) : 0;
                const rightValue = rightConn ? parseFloat(evaluateNode(rightConn.output.id, rightConn.output.socket)) : 1;
                // El valor del slider está en node.content (debe estar entre 0 y 1)
                const slider = typeof node.content === 'number' ? node.content : parseFloat(node.content);
                // Interpolación lineal
                result = `(${leftValue} + (${rightValue} - ${leftValue}) * ${slider})`;
                break;
            case "switch":
              const activeConn = this.connections.find(
                (conn) => conn.input.id === nodeId && conn.active
              );
              if (activeConn) {
                result = evaluateNode(
                  activeConn.output.id,
                  activeConn.output.socket
                );
              }
              break;
            case "operator":
              result = `(${
                leftConn
                  ? evaluateNode(leftConn.output.id, leftConn.output.socket)
                  : "0"
              }${node.content}${
                rightConn
                  ? evaluateNode(rightConn.output.id, rightConn.output.socket)
                  : "0"
              })`;
              break;
            case "negation":
              result = `!${
                leftConn
                  ? evaluateNode(leftConn.output.id, leftConn.output.socket)
                  : "0"
              }`;
              break;
            case "function":
              result = `${node.content}(${
                leftConn
                  ? trimParens(
                      evaluateNode(leftConn.output.id, leftConn.output.socket)
                    )
                  : "0"
              })`;
              break;
            case "conmut":
              const connectedExpressions = inputConnections
                .map((conn) => evaluateNode(conn.output.id, conn.output.socket))
                .filter((expr) => expr !== "");
              result =
                connectedExpressions.length > 0
                  ? `(${connectedExpressions.join(`${node.content}`)})`
                  : "";
              break;
            case "mouse":
              result = `mouse${socketIndex ? "X" : "Y"}`;
              break;
            case "out":
              result =
                inputConnections.length > 0
                  ? evaluateNode(inputConnections[0].output.id, socketIndex)
                  : "0";
              break;
            case "time":
              result = "t";
              break;
            default:
              result = "0";
          }
          return result;
        };

        this.expressions = [
          trimParens(evaluateNode(outputNode.id, 0)),
          trimParens(evaluateNode(outputNode.id, 1)),
        ];

        if (!this.isPlaying) return;
        audioEngine.setExpressions([...this.expressions]);
        this.error = "";
      } catch (error) {
        this.error = error;
      }
    },
    connectionExists(newConnection) {
      return this.connections.some(
        (conn) =>
          this.isEqual(conn.input, newConnection.input) &&
          this.isEqual(conn.output, newConnection.output)
      );
    },
    isEqual(a, b) {
      return a.id === b.id && a.socket === b.socket;
    },
    getConnectionArray(nodeId) {
      const connsArray = [];
      let socketIndex = 0;
      let conn;

      do {

        conn = this.connections.find(
          (c) => c.input.id === nodeId && c.input.socket === socketIndex
        );

        if (conn) {
          connsArray.push(...conn);
          socketIndex++;
        }
      } while (conn);

      return connsArray;
    },
    isConnectionActive(idToCheck, socketToCheck = 0, direction = "output") {
      return this.connections.some(
        (connection) =>
          connection[direction].id === idToCheck &&
          connection[direction].socket === socketToCheck
      );
    },
    find(property, key, value) {
      return this[property].find((item) => item[key] === value);
    },
    setHelpText(nodeHelpId) {

      const conn = this.connections.find(c => c.input.id === nodeHelpId && c.active)
      
      const outputNode = this.find(
        "nodes",
        "id",
        conn.output.id
      );

      const nodeType = NODE_TYPES[outputNode.type];

      const subgroup = nodeType.descriptions;
      const name = subgroup ? subgroup[outputNode.content].name: nodeType.name;
      const description = subgroup ? subgroup[outputNode.content].description : nodeType.description;

      const content = this.helpText = `NAME: ${ name }

DESCRIPTION:
${ description }`;

      this.updateNode(nodeHelpId,{
        content
      })
      
    },
    switchChange(nodeId, socket) {
      let firstMatchFound = false;

      this.connections.forEach((connection) => {
        if (connection.input.id === nodeId) {
          if (!firstMatchFound && connection.input.socket === socket) {
            connection.active = true; // Activa la primera coincidencia
            firstMatchFound = true; // Marca que ya encontramos la primera
            this.find("nodes", "id", nodeId).activeSocket;
          } else {
            connection.active = false; // Desactiva las demás conexiones
          }
        }
      });
    },
  },
});
