<template>
  <div class="content noselect" style="color: cyan !important">{{ content }}</div>
</template>

<script setup>
const props = defineProps({
  content: String
});
</script>