<template>
  <div
    class="canvas"
    ref="canvas"
    :class="`mode-${mode}`"
    @click.ctrl.prevent="addNode"
    @click.exact="handleCanvasClick(false)"
    @click.shift="handleCanvasClick(true)"
    @mousedown="startMouseSelection"
    @mousemove="trackMousePosition($event)"
    @mouseleave="selectionBox = null"
  >
    <ConnectionsLayer :mode="mode" :path-data="pathData" />

    <Node
      v-for="node in studio.nodes"
      :key="node.id"
      :ref="(el) => (nodeRefs[node.id] = el)"
      :node="node"
      :is-drawing-path="mode === 'routing'"
      @start-path="handleStartPath"
      @finish-path="handleFinishPath"
    />

    <div
      v-if="selectionBoxVisibility"
      class="selection-box"
      :style="{
        left: `${selectionBox.left}px`,
        top: `${selectionBox.top}px`,
        width: `${selectionBox.width}px`,
        height: `${selectionBox.height}px`,
      }"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";

import { generateUniqueId } from "@/utils/helpers";
import { NODE_TYPES } from "@/nodes/types";

import { useMouse } from "@vueuse/core";

import Node from "./Node.vue";
import ConnectionsLayer from "./ConnectionsLayer.vue";

import { useStudioStore } from "@/stores/studio";
import "./GraphCanvas.scss";

const studio = useStudioStore();

const preSelectedNodes = ref([]);
const selectionBox = ref(null);
const mode = ref("default");
const pathData = ref({});

const nodeRefs = ref([]);
const canvas = ref(null);

const { x: mouseX, y: mouseY } = useMouse();

const canvasRect = computed(() => {
  return canvas.value?.getBoundingClientRect() ?? { left: 0, top: 0 };
});

const mousePosition = computed(() => ({
  x: mouseX.value - canvasRect.value.left,
  y: mouseY.value - canvasRect.value.top,
}));

const selectionBoxVisibility = computed(() => {
  return (
    selectionBox.value &&
    (selectionBox.value.width > 4 || selectionBox.value.height > 4)
  );
});

function find(property, key, value) {
  return this[property].find((item) => item[key] === value);
}

async function addNode(event) {
  selectionBox.value = null;
  const { offsetX, offsetY } = event;

  const newNodeId = await studio.addNode(offsetX - 30, offsetY, 20);

  await nextTick();
  studio.selectNode(newNodeId);

  await nextTick();
  nodeRefs.value[newNodeId].focusAndEdit();
}

function handleCanvasClick(shiftKey) {
  if (!selectionBox.value || selectionBox.value.width < 2) studio.deselectAll();
  selectionBox.value = null;
}

function startMouseSelection() {
  preSelectedNodes.value = [...studio.selectedNodes];

  const { x, y } = mousePosition.value;

  selectionBox.value = {
    startX: x,
    startY: y,
    left: x,
    top: y,
    width: 0,
    height: 0,
  };
}

function trackMousePosition(event) {
  if (event.buttons != 1) {
    mode.value = "default";
    return;
  }
  if (!selectionBox.value) return;

  const { startX, startY } = selectionBox.value;

  const { x, y } = mousePosition.value;

  selectionBox.value = {
    startX: startX,
    startY: startY,
    left: Math.min(x, startX),
    top: Math.min(y, startY),
    width: Math.abs(x - startX),
    height: Math.abs(y - startY),
  };

  mouseSelectNodes();
}

function mouseSelectNodes() {
  const newSelectedNodes = studio.nodes

    .filter((node) => {
      const nodeRight = node.x + node.w;
      const nodeBottom = node.y + node.h;
      const selectionRight = selectionBox.value.left + selectionBox.value.width;
      const selectionBottom =
        selectionBox.value.top + selectionBox.value.height;
      return (
        node.x < selectionRight &&
        nodeRight > selectionBox.value.left &&
        node.y < selectionBottom &&
        nodeBottom > selectionBox.value.top
      );
    })
    .map((node) => node.id);

  // Invertir la selección
  studio.selectedNodes = studio.nodes
    .filter((node) => {
      const isSelectedBefore = preSelectedNodes.value.includes(node.id);
      const isSelectedNow = newSelectedNodes.includes(node.id);

      return (
        (isSelectedBefore && !isSelectedNow) ||
        (!isSelectedBefore && isSelectedNow)
      );
    })
    .map((node) => node.id);
}
function handleStartPath(nodeId, socket) {
  mode.value = "routing";

  studio.connecting.value = { nodeId, socket };

  const { x, y } = mousePosition.value;

  pathData.value = { x1: x, y1: y, x2: x, y2: y };

  document.addEventListener("mouseup", handleCancelPath);
  document.addEventListener("mousemove", drawPath);
}

function drawPath() {
  if (mode.value !== "routing") return;

  const { x, y } = mousePosition.value;

  pathData.value.x2 = x;
  pathData.value.y2 = y;
}
function handleFinishPath(nodeId, socket) {
  if (mode.value !== "routing") return;

  const inputNode = studio.find("nodes", "id", nodeId);

  const isConnectionActive =
    inputNode.type == "conmut" ||
    (inputNode.type == "switch"
      ? !studio.connections.some(
          (conn) => conn.input.id === nodeId && conn.active
        )
      : !studio.connections.some(
          (conn) =>
            conn.input.id === nodeId &&
            conn.input.socket === socket &&
            conn.active
        ));

  const newConnection = {
    id: generateUniqueId(),
    output: {
      id: studio.connecting.value.nodeId,
      socket: studio.connecting.value.socket,
    },
    input: { id: nodeId, socket: socket },
    active: isConnectionActive,
  };

  if (inputNode.type == "switch" && newConnection.active == true) {
    inputNode.activeSocket = newConnection.input.socket;
  }

  if (!studio.connectionExists(newConnection)) {
    studio.connections.push(newConnection);
    inputNode.lastSocketConnected = studio.getMaxConnectedInputSocket(nodeId);
    studio.evaluateBytebeat();
  }

  handleCancelPath();
}

// function toggleConnections(connId) {
//   // console.log(toggleConnection,connId)
//   studio.selectedConnection = connId;

//   const connection = studio.find("connections", "id", connId);
//   const node = studio.find("nodes", "id", connection.input.id);
//   connection.active = !connection.active;

//   if (node.type == "switch" && connection.active) {
//     studio.switchChange(node, connection.input.socket);
//   } else {
//     studio.evaluateBytebeat();
//   }
// }

function handleCancelPath() {
  mode.value = "default";
  document.removeEventListener("mouseup", handleCancelPath);
  document.removeEventListener("mousemove", drawPath);
}
function handleKeyDown(event) {
  mode.value = "default";
  if (event.ctrlKey) {
    mode.value = "adding";
  }
}

function handleKeyUp(event) {
  mode.value = "default";

  if (event.key == "Delete" || event.key == "Backspace") {
    console.log("delete in canvas");

    studio.deleteSelecteConnections();
    studio.deleteSelectedNodes();
  }
}

onMounted(() => {
  studio.evaluateBytebeat();
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);

  if (studio.byteBeatNode) {
    studio.context = null;
    studio.byteBeatNode.disconnect();
    studio.byteBeatNode = null;
  }

  handleCancelPath();
});
</script>
