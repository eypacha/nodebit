<template>
  <button class="noselect" @click="handleClick">
    Reset
  </button>
</template>

<script setup>
import { useStudioStore } from "@/stores/studio";

const store = useStudioStore();


function handleClick(){
  if(!store.isDragging) return
  store.reset()
}
</script>
