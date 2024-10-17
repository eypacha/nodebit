<template>
  <div class="content noselect">
    <div v-if="store.error">{{ store.error }}</div>
    <div v-else>No errors</div>
  </div>
</template>

<script setup>
import { useStudioStore } from "@/stores/studio";

const store = useStudioStore();
</script>
