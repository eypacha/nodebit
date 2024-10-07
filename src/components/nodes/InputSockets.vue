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
              active: studio.isConnectionActive(node.id, n - 1, 'input'),
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
  
  const studio = useStudioStore();
  
  function switchChange(socket) {
    if (props.node.type !== 'switch') return;
    studio.switchChange(props.node.id, socket);
    studio.updateNode(props.node.id, { activeSocket: socket });
  }

const newConnection = {
  id: generateUniqueId(),
  output: {
    id: studio.connecting.value.nodeId,
    socket: studio.connecting.value.socket,
  },
  input: { id: props.node.id, socket: socket },
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

if (inputNode.type == "help" && newConnection.active == true) {
  const outputNode = studio.find("nodes", "id", connecting.node);

  const subgroup = NODE_TYPES[outputNode.type].descriptions;

  studio.helpText.value = `NAME: ${
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

  