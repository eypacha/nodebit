<template>
    <div class="content-toggle">
       <Toggle v-model="toggleRef" aria-label="Toggle node" />
    </div>
   </template>
   
   <script setup>
   import { ref, watch, onMounted } from "vue";
   import Toggle from "@/components/ui/Toggle.vue";
   import { useStudioStore } from "@/stores/studio";
   
   const store = useStudioStore();

   const props = defineProps({
     node: Object,
   });
   
   function updateNodeContent(value) {
     store.updateNode(props.node.id, { content: value ? 1 : 0 });
     store.evaluateBytebeat();
   }
   
   const toggleRef = ref(props.node.content === 1);

   watch(toggleRef, (newValue) => {
     updateNodeContent(newValue);
   });
   </script>
   
   <style lang="scss" scoped>
   span {
     right: -10px;
     position: absolute;
   }
   </style>