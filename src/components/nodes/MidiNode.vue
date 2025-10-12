<template>
  <div>
    <p v-if="midiInitialized">MIDI inicializado</p>
    <p v-else>MIDI no inicializado</p>
    <p v-if="latestMessage">
      Último mensaje MIDI: <strong>{{ latestMessage }}</strong>
    </p>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useMidiStore } from '@/stores/midiStore';
import { useStudioStore } from '@/stores/studio';

const store = useStudioStore();
const midiStore = useMidiStore();

const props = defineProps({
  node: Object,
});

function updateNodeContent(value) {
  store.updateNode(props.node.id, { content: value ?? 0 });
}

const { initializeMidi, midiInitialized, latestMessage } = midiStore;

onMounted(() => {
  initializeMidi();
});

// Watcher para actualizar el contenido del nodo cada vez que cambie latestMessage
watch(
  () => latestMessage,
  (newMessage) => {
    if (newMessage) {
      updateNodeContent(newMessage);
    }
  }
);
</script>
