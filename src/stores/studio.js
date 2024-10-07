import { defineStore } from "pinia";
import { audioEngine } from "@/services/audioEngine";
import { presets } from "@/utils/presets";
import { NODE_TYPES } from "@/nodes/types";
import { generateUniqueId, trimParens } from "@/utils/helpers";

const { nodes, connections } = presets[0];

export const useStudioStore = defineStore("studio", {
  state: () => ({
    nodes,
    connections,
    mode: "default",
    isPlaying: false,
    expressions: ["", ""],
    error: null,
    nodeTypes: NODE_TYPES,
    selectedNode: null,
    selectedNodes: [],
    selectedConnection: null,
    selectedConnections: [],
    pathData: {},
    connecting: {},
  }),
  actions: {
    async playPause() {
      if (!this.isPlaying) {
        const result = await audioEngine.play();
        audioEngine.setExpressions([...this.expressions]);
        if (result) {
          this.isPlaying = true;
        }
      } else {
        const result = audioEngine.pause();
        if (result) {
          this.isPlaying = false;
        }
      }
    },
    addNode(x, y) {
      const newNode = {
        id: generateUniqueId(),
        type: "empty",
        content: "",
        w: 60,
        h: 40,
        x: x,
        y: y,
      };

      this.nodes.push(newNode);

      console.log(newNode.id);

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

      if (!this.nodes.some((node) => node.type == "play")) {
        this.stop();
      }

      this.evaluateBytebeat();
    },
    deleteSelectedNodes() {
      this.selectedNodes.forEach((nodeId) => {
        this.deleteNode(nodeId);
      });
    },
    deleteConnection(connId) {
      const connection = this.find("connections", "id", connId);
      const wasActive = connection.active;
      const inputNode = this.find("nodes", "id", connection.input.id);

      this.connections = this.connections.filter((conn) => conn.id !== connId);

      inputNode.lastSocketConnected = this.getMaxConnectedInputSocket(
        inputNode.id
      );

      if (!wasActive || inputNode.type === "conmut") {
        this.evaluateBytebeat();
        return;
      }

      const sameNodeInputConnection = this.connections.find(
        (conn) =>
          conn.input.id === inputNode.id &&
          conn.input.socket === connection.input.socket
      );

      if (sameNodeInputConnection) {
        sameNodeInputConnection.active = true;
      }

      this.evaluateBytebeat();
    },
    deleteSelecteConnections() {
      this.selectedConnections.forEach((nodeId) => {
        this.deleteConnection(nodeId);
      });
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
      try {
        const outputNode = this.find("nodes", "type", "out");

        if (!outputNode) {
          console.error("No output node found");
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
            case "negation": // Nuevo caso para negación
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
