<template>
  <div class="content noselect">
    <div v-if="studio.error">{{ studio.error }}</div>
    <div v-else>No errors</div>
  </div>
</template>

<script setup>
import { useStudioStore } from "@/stores/studio";

const studio = useStudioStore();
</script>
