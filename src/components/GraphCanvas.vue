<template>
  <div
    class="canvas"
    id="canvas"
    ref="canvas"
    :class="`mode-${mode}`"
    @click.meta.prevent="addNodeMac"
    @click.ctrl.prevent="addNode"
    @click.exact="handleCanvasClick(false)"
    @click.shift="handleCanvasClick(true)"
    @mousedown="startMouseSelection"
    @mousemove="trackMousePosition($event)"
    @mouseleave="selectionBox = null"
  >
    <ConnectionsLayer />
    <Node
      v-for="node in store.nodes"
      :key="node.id"
      :data-id="`node-${node.id}`"
      :ref="(el) => (nodeRefs[node.id] = el)"
      :node="node"
      :is-drawing-path="mode === 'routing'"
      @start-path="handleStartPath"
      @finish-path="handleFinishPath"
    />
    <ConnectingRoute :mode="mode" :path-data="pathData" />
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
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useStudioStore } from "@/stores/studio";
import { useSelection } from "@/composables/useSelection";
import { useRouting } from "@/composables/useRouting";
import Node from "./Node.vue";
import ConnectionsLayer from "./ConnectionsLayer.vue";
import ConnectingRoute from "./ConnectingRoute.vue";
import "./GraphCanvas.scss";

const store = useStudioStore();
const canvas = ref(null);
const nodeRefs = ref([]);
const allowedKeyEvent = ref(true);
const isMac = ref(false);

const {
  selectionBox,
  selectionBoxVisibility,
  startMouseSelection,
  trackMousePosition,
  handleCanvasClick,
  mousePosition,
} = useSelection(canvas);

const { mode, pathData, handleStartPath, handleFinishPath, handleCancelPath } =
  useRouting(mousePosition);

async function addNodeMac(event){
  if(!isMac.value) return
  addNode(event)
}

async function addNode(event) {
  selectionBox.value = null;
  const { offsetX, offsetY } = event;
  const newNodeId = await store.addNode(offsetX - 30, offsetY, 20);
  console.log('🆕 new Node created',newNodeId)
  await nextTick();
  store.selectNode(newNodeId);
  await nextTick();
  nodeRefs.value[newNodeId].focusAndEdit();
}

function handleKeyUp(event) {

  allowedKeyEvent.value = true

  const combo = getKeyCombo(event);
  const shortcut = keyboardShortcutsKeyUp[combo];

  if (shortcut) {
    if (shortcut.preventDefault) {
      event.preventDefault();
    }
    shortcut.action();
    console.log(`Executed: ${combo}`);
  }
}

async function handleKeyDown(event) {

  if(!allowedKeyEvent.value) return
  const combo = getKeyCombo(event);
  const shortcut = keyboardShortcutsKeyDown[combo];

  if (shortcut) {
    console.log('allowedKeyEvent.value',allowedKeyEvent.value)
    allowedKeyEvent.value = false
    
    await shortcut.action();
    console.log(`⌨️ Executed: ${combo}`);
  }
}


function handleDeletion() {
  console.log('🗑 Deleting')
  if (store.selectedNodes.length > 0 || store.selectedConnections.length > 0) {
    store.deleteSelectedConnections();
    store.deleteSelectedNodes();
    store.evaluateBytebeat();
    store.saveState();
  }
}

const keyboardShortcutsKeyUp = {
  'delete': { action: handleDeletion },
  'backspace': { action: handleDeletion },
  't': {
    action: () => {
      if (store.selectedConnections.length > 0) {
        store.toggleSelectedConnections();
        store.saveState();
      }
    }
  }
};

const keyboardShortcutsKeyDown = {
  'ctrl+c': {
    action: () => store.copySelection(),
    preventDefault: true
  },
  'ctrl+v': {
    action: () => store.pasteSelection(mousePosition.value),
    preventDefault: true
  },
  'ctrl+z': {
    action: () => store.undo(),
    preventDefault: true
  },
  'ctrl+y': {
    action: () => store.redo(),
    preventDefault: true
  },
  'ctrl+shift+z': {
    action: () => store.redo(),
    preventDefault: true
  },
};

function getKeyCombo(event) {
  const keys = [];

  if (isMac.value && event.metaKey) {
    keys.push('ctrl');
  } else if (event.ctrlKey) {
    keys.push('ctrl');
  }
  if (event.shiftKey) keys.push('shift');
  if (event.altKey) keys.push('alt');

  keys.push(event.key.toLowerCase());
  return keys.join('+');
}
onMounted(() => {
  store.initializeHistory()
  store.evaluateBytebeat();
  isMac.value = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  document.addEventListener("keyup", handleKeyUp);
  document.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);
  if (store.byteBeatNode) {
    store.context = null;
    store.byteBeatNode.disconnect();
    store.byteBeatNode = null;
  }
  handleCancelPath();
});
</script>
