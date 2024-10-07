<template>
  <div class="noselect" @click="studio.playPause">
    {{ studio.isPlaying ? "pause" : "play" }}
  </div>
</template>

<script setup>
import { useStudioStore } from "@/stores/studio";

const studio = useStudioStore();
</script>
