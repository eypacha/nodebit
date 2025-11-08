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
    @contextmenu.prevent="showContextMenuAt($event)"
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
    <ContextualMenu
      v-if="showContextMenu"
      :position="contextMenuPosition"
      :options="contextMenuOptions"
      @option-selected="handleContextMenuOption"
      @close="closeContextMenu"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useStudioStore } from "@/stores/studio";
import { useSelection } from "@/composables/useSelection";
import { useRouting } from "@/composables/useRouting";
import { NODE_TYPES } from "@/nodes/types";
import { CONTEXT_MENU_OPTIONS } from "@/constants/contextMenuOptions";
import Node from "./Node.vue";
import ConnectionsLayer from "./ConnectionsLayer.vue";
import ConnectingRoute from "./ConnectingRoute.vue";
import ContextualMenu from "./ContextualMenu.vue";
import "./GraphCanvas.scss";

const store = useStudioStore();
const canvas = ref(null);
const nodeRefs = ref([]);
const allowedKeyEvent = ref(true);
const isMac = ref(false);

const showContextMenu = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });

// Generar opciones del menú dinámicamente basado en los tipos de nodos
const contextMenuOptions = computed(() => {
  const hasSelection = store.selectedNodes.length > 0 || store.selectedConnections.length > 0;
  const hasClipboardContent = store.copiedNodes.length > 0;
  
  return CONTEXT_MENU_OPTIONS.map(option => {
    if (option.action === 'copy') {
      return { ...option, disabled: !hasSelection };
    }
    if (option.action === 'paste') {
      return { ...option, disabled: !hasClipboardContent };
    }
    if (option.action === 'delete') {
      return { ...option, disabled: !hasSelection };
    }
    return option;
  });
});

// Función para obtener el contenido por defecto de cada tipo de nodo
function getDefaultContent(nodeType) {
  switch(nodeType) {
    case 'empty': return '';
    case 'number': return '0';
    case 'time': return 't';
    case 'operator': return '+';
    case 'negation': return '!';
    case 'out': return 'out';
    case 'play': return 'play';
    case 'stop': return 'stop';
    case 'reset': return 'reset';
    case 'help': return 'help';
    default: return '';
  }
}

const {
  selectionBox,
  selectionBoxVisibility,
  startMouseSelection,
  trackMousePosition,
  handleCanvasClick: originalHandleCanvasClick,
  mousePosition,
} = useSelection(canvas);

// Wrapper para handleCanvasClick que también cierra el menú contextual
function handleCanvasClick(shiftKey) {
  closeContextMenu();
  originalHandleCanvasClick(shiftKey);
}

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

function showContextMenuAt(event) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const menuWidth = 180; // Ancho estimado del menú principal
  const menuHeight = 300; // Altura estimada del menú principal
  
  let x = event.clientX;
  let y = event.clientY - 41;
  
  // Ajustar si el menú se sale por la derecha
  if (x + menuWidth > windowWidth) {
    x = windowWidth - menuWidth - 10;
  }
  
  // Ajustar si el menú se sale por abajo
  if (y + menuHeight > windowHeight) {
    y = windowHeight - menuHeight - 10;
  }
  
  // Asegurar que no se vaya a números negativos
  x = Math.max(10, x);
  y = Math.max(10, y);
  
  contextMenuPosition.value = { x, y };
  showContextMenu.value = true;
}

function closeContextMenu() {
  showContextMenu.value = false;
}

async function handleContextMenuOption(option) {
  console.log('Selected option:', option);
  
  // Manejar acciones específicas
  if (option.action) {
    switch (option.action) {
      case 'copy':
        store.copySelection();
        console.log('📋 Copied selection');
        break;
      case 'paste':
        const rect = canvas.value.getBoundingClientRect();
        const canvasX = contextMenuPosition.value.x - rect.left + canvas.value.scrollLeft;
        const canvasY = contextMenuPosition.value.y - rect.top + canvas.value.scrollTop;
        await store.pasteSelection({ x: canvasX, y: canvasY });
        store.evaluateBytebeat();
        store.saveState();
        console.log('📋 Pasted selection');
        break;
      case 'delete':
        store.deleteSelectedConnections && store.deleteSelectedConnections();
        store.deleteSelectedNodes && store.deleteSelectedNodes();
        store.evaluateBytebeat && store.evaluateBytebeat();
        store.saveState && store.saveState();
        console.log('🗑️ Eliminated selection');
        break;
    }
    return;
  }
  
  // Si es una opción de crear nodo
  if (option.nodeType && option.content !== undefined) {
    const rect = canvas.value.getBoundingClientRect();
    const canvasX = contextMenuPosition.value.x - rect.left + canvas.value.scrollLeft;
    const canvasY = contextMenuPosition.value.y - rect.top + canvas.value.scrollTop;
    
    const newNodeId = await store.addNodeWithType(
      canvasX - 30, 
      canvasY + 41, 
      option.nodeType, 
      option.content
    );
    
    await nextTick();
    store.selectNode(newNodeId);
    
    // Si es un nodo editable (empty, number), activar modo editable
    if (option.nodeType === 'empty' || option.nodeType === 'number') {
      await nextTick();
      nodeRefs.value[newNodeId]?.focusAndEdit();
    }
    
    store.evaluateBytebeat();
    store.saveState();
  }
}

function handleDocumentClick(event) {
  // Verificar si el click fue dentro del menú contextual o submenu
  const contextMenuElement = document.querySelector('.context-menu');
  if (contextMenuElement && contextMenuElement.contains(event.target)) {
    return; // No cerrar si el click fue dentro del menú
  }
  
  // Verificar submenus también
  const submenuElements = document.querySelectorAll('.context-menu.submenu');
  for (let submenu of submenuElements) {
    if (submenu.contains(event.target)) {
      return; // No cerrar si el click fue dentro de un submenu
    }
  }
  
  // Cerrar el menú si el click fue fuera
  closeContextMenu();
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
  document.addEventListener("click", handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);
  document.removeEventListener("click", handleDocumentClick);
  if (store.byteBeatNode) {
    store.context = null;
    store.byteBeatNode.disconnect();
    store.byteBeatNode = null;
  }
  handleCancelPath();
});
</script>
