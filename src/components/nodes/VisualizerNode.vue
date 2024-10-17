
<template>
  <canvas ref="canvas" :width="width" :height="height"></canvas>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useStudioStore } from "@/stores/studio";

const props = defineProps({
  width: {
    type: Number,
    default: 256
  },
  height: {
    type: Number,
    default: 125
  }
});

const store = useStudioStore();
const canvas = ref(null);

onMounted(() => {
  const ctx = canvas.value.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  
  watch(() => store.visualizationData, (newData) => {
    if (newData && newData.left && newData.right) {
      ctx.clearRect(0, 0, props.width, props.height);
      
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'cyan';
      ctx.beginPath();
      for (let x = 0; x < props.width; ++x) {
        const y = (newData.left[x] * 0.5 + 0.5) * props.height;
        if (x === 0) {
          ctx.moveTo(x, props.height - y+1);
        } else {
          ctx.lineTo(x, props.height - y+1);
        }
      }
      ctx.stroke();

      ctx.strokeStyle = 'yellow';
      ctx.beginPath();
      for (let x = 0; x < props.width; ++x) {
        const y = (newData.right[x] * 0.5 + 0.5) * props.height;
        if (x === 0) {
          ctx.moveTo(x, props.height - y);
        } else {
          ctx.lineTo(x, props.height - y);
        }
      }
      ctx.stroke();
    }
  });
});
</script>

<style lang="scss" scoped>
canvas {
  width: 100%;
  image-rendering: pixelated;
  image-rendering: crisp-edges; 
  image-rendering: -moz-crisp-edges; 
  box-shadow: black 0px 2px 8px inset;
}
</style>