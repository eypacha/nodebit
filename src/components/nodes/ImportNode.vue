<template>
  <div class="noselect" @click="fileInput.click()">
    import
    <input
      type="file"
      ref="fileInput"
      accept=".json"
      value=""
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStudioStore } from "@/stores/studio";

const studio = useStudioStore();

const fileInput = ref();

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const fileContent = e.target.result;

    try {
      const jsonData = JSON.parse(fileContent);
      console.log("Contenido del archivo JSON:", jsonData);
      restoreDataToStore(jsonData);

      studio.fileContent = jsonData;
    } catch (error) {
      console.error("Error al parsear el archivo JSON:", error);
    }
  };

  reader.readAsText(file);
}
function restoreDataToStore(data) {
  if (!data.nodes || !data.connections || !data.expressions) return;

  if (data.nodes) {
    studio.nodes = data.nodes;
  }
  if (data.connections) {
    studio.connections = data.connections;
  }
  if (data.expressions) {
    studio.expressions = data.expressions;
  }

  console.log("Datos restaurados en el store:", studio);
}
</script>

<style scoped>
input {
  display: none;
}
</style>
