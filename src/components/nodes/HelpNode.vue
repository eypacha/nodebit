<template>
  <div class="content noselect">
    <textarea ref="textarea" readOnly>{{helpText}}</textarea>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

import { useStudioStore } from "@/stores/studio";

const props = defineProps({
  nodeId: Number,
  content: String,
  connectionActive: Boolean,
});

const store = useStudioStore();

const DEFAULT_MESSAGE = 'Connect a node to display help message'

const isActive = ref(props.connectionActive)

const helpText = computed(()=>{
    return isActive.value ? props.content : DEFAULT_MESSAGE
})

watch(() => props.connectionActive, (newValue, oldValue) => {

    isActive.value = newValue

    if(newValue) {
        store.setHelpText(props.nodeId)
    } else {
        store.updateNode(props.nodeId, { content: DEFAULT_MESSAGE})
    }

    
});
</script>

<style lang="css" scoped>
.content {
  width: 100%;
  height: 100%;
  text-align: left;

  textarea {
    text-align: left;
    height: 100% !important;
    overflow-y: visible;
  }
}
</style>
