<template>
  <svg class="connections">
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
import { useStudioStore } from "@/stores/studio";

const store = useStudioStore();

const props = defineProps({
  mode: String,
  pathData: Object,
});

</script>

<style lang="scss" scoped>
.connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  path {
    stroke: yellow;
    opacity: 0.7;
    cursor: pointer;
  }
}
</style>
