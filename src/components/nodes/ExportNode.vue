<template>
  <button class="noselect" @click="exportData">export</button>
</template>

<script setup>
import { useStudioStore } from "@/stores/studio";
import { exportData as exportDataService } from '@/services/dataExportService';

const store = useStudioStore();

function exportData() {
  exportDataService(store);
}
</script>