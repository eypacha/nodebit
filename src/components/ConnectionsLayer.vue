<template>
  <svg class="connections">
    <path
      v-for="connection in computedConnections"
      :key="connection.id"
      :d="connection.path"
      fill="transparent"
      :class="{ selected: studio.selectedConnections.includes(connection.id) }"
      stroke-width="2"
      tabindex="2"
      @focus="studio.selectedConnection = connection.id"
      @blur="studio.selectedConnection = null"
      @click.exact.stop="handleConnectionClick(connection.id)"
      @click.shift.exact.stop="studio.selectConnection(connection.id)"
      :stroke-dasharray="connection.active ? 'none' : '4'"
    />
    <path
      v-if="mode == 'routing'"
      :d="bezierPath(pathData.x1, pathData.y1, pathData.x2, pathData.y2)"
      fill="transparent"
      stroke-width="2"
    />
  </svg>
</template>

<script setup>
import { bezierPath } from "@/utils/helpers";

import { computed } from "vue";
import { useStudioStore } from "@/stores/studio";

const studio = useStudioStore();

const props = defineProps({
  mode: String,
  pathData: Object,
});

const computedConnections = computed(() => {
  return studio.connections.map((connection) => ({
    ...connection,
    path: pathNode2Node(connection.output, connection.input),
  }));
});


function handleConnectionClick(connId) {
  studio.deselectAll();
  studio.selectConnection(connId);
}
function pathNode2Node(output, input) {

  const nodeA = getNodeById(output.id);
  const nodeB = getNodeById(input.id);

  const { x: xA, y: yA, w: wA, h: hA } = nodeA;
  const { x: xB, y: yB } = nodeB;

  const startX = xA + wA - 5 - output.socket * 20;
  const startY = yA + hA;

  const endX = xB + 5 + input.socket * 20;
  const endY = yB + 1;

  return bezierPath(startX, startY, endX, endY);
}
function getNodeById(nodeId) {
  return studio.nodes.find((n) => n.id === nodeId);
}
</script>

<style lang="scss" scoped>
.connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  path {
    stroke: yellow;
    opacity: 0.7;
    cursor: pointer;

    &:focus {
      outline: none;
    }

    &.selected {
      opacity: 1;
      stroke: white;
    }
  }
}
</style>
