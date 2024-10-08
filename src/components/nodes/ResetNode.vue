<template>
  <div class="noselect" @click="studio.reset">
    Reset
  </div>
</template>

<script setup>
import { useStudioStore } from "@/stores/studio";

const studio = useStudioStore();
</script>
