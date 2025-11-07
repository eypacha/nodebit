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
  
  return [
    { 
      id: 1, 
      label: 'Nuevo', 
      shortcut: 'Ctrl+Click',
      submenu: [
        {
          id: 'node-empty',
          label: 'Empty',
          nodeType: 'empty',
          content: ''
        },
        {
          id: 'node-number',
          label: 'Number',
          nodeType: 'number',
          content: '0'
        },
        {
          id: 'node-time',
          label: 'Time (t)',
          nodeType: 'time',
          content: 't'
        },
        {
          id: 'node-operators',
          label: 'Operadores',
          submenu: [
            {
              id: 'node-operator-add',
              label: 'Suma',
              nodeType: 'operator',
              content: '+'
            },
            {
              id: 'node-operator-subtract',
              label: 'Resta',
              nodeType: 'operator',
              content: '-'
            },
            {
              id: 'node-operator-multiply',
              label: 'Multiplicación',
              nodeType: 'operator',
              content: '*'
            },
            {
              id: 'node-operator-divide',
              label: 'División',
              nodeType: 'operator',
              content: '/'
            },
            {
              id: 'node-operator-modulo',
              label: 'Módulo',
              nodeType: 'operator',
              content: '%'
            }
          ]
        },
        {
          id: 'node-binary-operators',
          label: 'Operadores bitwise',
          submenu: [
            {
              id: 'node-operator-and',
              label: 'AND',
              nodeType: 'operator',
              content: '&'
            },
            {
              id: 'node-operator-or',
              label: 'OR',
              nodeType: 'operator',
              content: '|'
            },
            {
              id: 'node-operator-xor',
              label: 'XOR',
              nodeType: 'operator',
              content: '^'
            },
            {
              id: 'node-operator-shift-left',
              label: 'Shift Left',
              nodeType: 'operator',
              content: '<<'
            },
            {
              id: 'node-operator-shift-right',
              label: 'Shift Right',
              nodeType: 'operator',
              content: '>>'
            },
            {
              id: 'node-operator-not',
              label: 'NOT',
              nodeType: 'negation',
              content: '!'
            }
          ]
        },
        {
          id: 'node-help',
          label: 'Help',
          nodeType: 'help',
          content: 'help'
        }
      ]
    },
    {
      id: 2,
      label: 'Copiar',
      shortcut: 'Ctrl+C',
      action: 'copy',
      disabled: !hasSelection
    },
    {
      id: 3,
      label: 'Pegar',
      shortcut: 'Ctrl+V',
      action: 'paste',
      disabled: !hasClipboardContent
    }
  ];
});

// Función para obtener el contenido por defecto de cada tipo de nodo
function getDefaultContent(nodeType) {
  switch(nodeType) {
    case 'empty': return '';
    case 'number': return '0';
    case 'time': return 't';
    case 'operator': return '+';
    case 'negation': return '!';
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
  contextMenuPosition.value = { x: event.clientX, y: event.clientY - 41 };
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
