<template>
  <svg class="connections">
    <path
      v-if="mode == 'routing'"
      :d="bezierPath(pathData.x1, pathData.y1, pathData.x2, pathData.y2)"
      fill="transparent"
      stroke="yellow"
      stroke-width="2"
    />
    <path
      v-for="connection in computedConnections"
      :key="connection.id"
      :d="connection.path"
      fill="transparent"
      stroke="yellow"
      stroke-width="2"
      @mousedown="$emit('path-click', connection.id)"
      :stroke-dasharray="connection.active ? 'none' : '4'"
    />
  </svg>
</template>

<script>
import { bezierPath } from "@/utils/helpers";

export default {
  props: {
    connections: {
      type: Array,
      required: true
    },
    nodes: {
      type: Array,
      required: true
    },
    mode: {
      type: String,
      default: 'default',
    },
    pathData: {
      type: Object,
      default: () => ({})
    },
  },
  computed: {
    computedConnections() {
      return this.connections.map(connection => ({
        ...connection,
        path: this.pathNode2Node(connection.output, connection.input),
      }));
    }
  },
  methods: {
    getNodeById(nodeId) {
      return this.nodes.find((n) => n.id === nodeId);
    },
    pathNode2Node(output, input) {
      const nodeA = this.getNodeById(output.id);
      const nodeB = this.getNodeById(input.id);

      const { x: xA, y: yA, w: wA, h: hA } = nodeA;
      const { x: xB, y: yB } = nodeB;

      const startX = xA + wA - 5 - output.socket * 20;
      const startY = yA + hA;

      const endX = xB + 5 + input.socket * 20;
      const endY = yB + 1;

      return bezierPath(startX, startY, endX, endY);
    },
    bezierPath
  }
};
</script>

<style lang="scss" scoped>
.connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.7;

  path {
    cursor: pointer;
  }
}
</style>