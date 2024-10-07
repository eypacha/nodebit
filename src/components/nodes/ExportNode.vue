<template>
  <div class="noselect" @click="exportByte()">export</div>
</template>

<script setup>
import { useStudioStore } from "@/stores/studio";

const studio = useStudioStore();

function exportByte() {
  const stringData = generateStringData();
  downloadFile(stringData, "bytebeat.json", "application/json");
}
function generateStringData() {
  const data = {
    expressions: studio.expressions,
    nodes: studio.nodes,
    connections: studio.connections,
  };
  return JSON.stringify(data, null, 0);
}

function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}
</script>
