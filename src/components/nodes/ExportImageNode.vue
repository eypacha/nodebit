<template>
  <button class="noselect" @click="handleExport" :disabled="isLoading">
    <div v-if="!isLoading">
      <div>export</div>
      <small>as img</small>
    </div>
    <div v-else>
        wait...
    </div>
  </button>
</template>

<script setup>
import { ref } from 'vue';
import { useStudioStore } from "@/stores/studio";
import { exportImage as exportImageService } from '@/services/imageExportService';

const store = useStudioStore();
const isLoading = ref(false);

async function handleExport() {
  if (isLoading.value) return;
  
  isLoading.value = true;
  try {
    await exportImageService(store);
  } catch (error) {
    console.error('Error exporting image:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>