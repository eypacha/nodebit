<template>
  <div class="timer noselect" @click="cycleMode">
    <div v-if="mode === 0" class="time">
      t
    </div>
    <div v-else-if="mode === 1" class="t">
      {{ store.time ?? 0 }}
    </div>
    <div v-else class="t"> 
      {{ formattedTime }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStudioStore } from "@/stores/studio";

const store = useStudioStore();

const mode = ref(0)

const formattedTime = computed(() => {
  const time = store.time / 8000 ?? 0;

  const hours = Math.floor(time / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
  const seconds = Math.floor(time % 60).toString().padStart(2, '0'); 
  const centiseconds = Math.floor((time % 1) * 100).toString().padStart(2, '0'); 

  let string = ''
if (minutes < 1){
    string = `${seconds}:${centiseconds}`
} else if (hours > 0){
    string = `${hours}:${minutes}:${seconds}`;
} else {
  string = `${minutes}:${seconds}`
}
  return string;
});


function cycleMode() {
  if(!store.isDragging) return
  mode.value = (mode.value + 1) % 3; 
}
</script>

<style scoped>
.timer {
  width: 100%;
  color: yellow;
  box-shadow: black 0px 2px 8px inset;
  border-radius: 20px 20px 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .time {
    text-align: right;
    padding-inline: .5em 1em;
  }
  

  .t {
    text-align: center;
  }
}
</style>