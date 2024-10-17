<template>
  <button class="noselect" @click="handleClick()">
    import
  </button>
  <input
    type="file"
    ref="fileInput"
    accept=".b1t,.jpg"
    value=""
    @change="handleFileChange"
  />
</template>

<script setup>
import { ref } from "vue";
import { useStudioStore } from "@/stores/studio";
import piexif from 'piexifjs';

const store = useStudioStore();
const fileInput = ref();

function handleClick() {
  if (!store.isDragging) return;
  fileInput.value.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileExtension = file.name.split('.').pop().toLowerCase();

  if (fileExtension === 'b1t') {
    handleB1TFile(file);
  } else if (fileExtension === 'jpg') {
    handleJPGFile(file);
  } else {
    console.error("Tipo de archivo no soportado");
  }
}

function handleB1TFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const fileContent = e.target.result;
    try {
      const jsonData = JSON.parse(fileContent);
      console.log("Contenido del archivo JSON:", jsonData);
      restoreDataToStore(jsonData);
      store.fileContent = jsonData;
    } catch (error) {
      console.error("Error al parsear el archivo JSON:", error);
    }
  };
  reader.readAsText(file);
}

function handleJPGFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const fileContent = e.target.result;
    try {
      const exifData = piexif.load(fileContent);
      const software = exifData["0th"][piexif.ImageIFD.Software];
      if (software === "nodebit") {
        const userComment = exifData["Exif"][piexif.ExifIFD.UserComment];
        const jsonData = JSON.parse(userComment);
        console.log("Datos EXIF extraídos:", jsonData);
        restoreDataToStore(jsonData);
      } else {
        console.error("El archivo JPG no fue creado por nodebit");
      }
    } catch (error) {
      console.error("Error al procesar el archivo JPG:", error);
    }
  };
  reader.readAsDataURL(file);
}

function restoreDataToStore(data) {
  if (!data.nodes || !data.connections || !data.expressions) return;
  if (data.nodes) {
    store.nodes = data.nodes;
  }
  if (data.connections) {
    store.connections = data.connections;
  }
  if (data.expressions) {
    store.expressions = data.expressions;
  }
  console.log("Datos restaurados en el store:", store);
}
</script>

<style scoped>
input {
  display: none;
}
</style>