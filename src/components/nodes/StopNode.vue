<template>
  <div class="noselect" @click="studio.stop">
    Stop
  </div>
</template>

<script setup>
import { useStudioStore } from "@/stores/studio";

const studio = useStudioStore();
</script>
