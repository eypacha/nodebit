<template>
  <button class="noselect" @click="handleClick()">
    {{ store.isPlaying ? "pause" : "play" }}
  </button>
</template>

<script setup>
import { useStudioStore } from "@/stores/studio";

function handleClick(){
  if(!store.isDragging) return
  store.playPause()
}

const store = useStudioStore();
</script>
