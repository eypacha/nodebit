<template>
     <div class="inputs">
      <div
        v-for="n in NODE_TYPES[node.type].inputs"
        :key="`input-socket-${n - 1}`"
        class="socket-wrapper"
      >
        <div
          class="socket"
          :class="[
            `socket-${n - 1}`,
            {
              active: store.isConnectionActive(node.id, n - 1, 'input'),
              switched: node.activeSocket == n - 1,
            },
          ]"
          @mouseup="handleFinishPath(n-1)"
        />
        <span
          v-if="NODE_TYPES[node.type].inputs > 3"
          @click="switchChange(n - 1)"
          class="label noselect"
          >{{ n }}</span
        >
      </div>
    </div>
  </template>
  
  <script setup>
  import { NODE_TYPES } from "@/nodes/types";

  import { useStudioStore } from "@/stores/studio";
  
  const props = defineProps({
    node: Object, 
  });
  
  const emit = defineEmits(['start-path', 'finish-path']);
  
  const store = useStudioStore();
  
  function switchChange(socket) {
    if (props.node.type !== 'switch') return;
    store.switchChange(props.node.id, socket);
    store.updateNode(props.node.id, { activeSocket: socket });
  }

const newConnection = {
  id: generateUniqueId(),
  output: {
    id: store.connecting.value.nodeId,
    socket: store.connecting.value.socket,
  },
  input: { id: props.node.id, socket: socket },
  active: isConnectionActive,
};

if (inputNode.type == "switch" && newConnection.active == true) {
  inputNode.activeSocket = newConnection.input.socket;
}

if (!store.connectionExists(newConnection)) {
  
  store.connections.push(newConnection);
  inputNode.lastSocketConnected = store.getMaxConnectedInputSocket(nodeId);
  store.evaluateBytebeat();
}

if (inputNode.type == "help" && newConnection.active == true) {
  const outputNode = store.find("nodes", "id", connecting.node);

  const subgroup = NODE_TYPES[outputNode.type].descriptions;

  store.helpText.value = `NAME: ${
    subgroup
      ? subgroup[outputNode.content].name
      : NODE_TYPES[outputNode.type].name
  }

DESCRIPTION:
${
subgroup
  ? subgroup[outputNode.content].description
  : NODE_TYPES[outputNode.type].description
}`;
}

  </script>

  