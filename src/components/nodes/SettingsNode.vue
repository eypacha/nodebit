<template>
  <div class="content noselect">
    <h3>Settings</h3>
    <div>
      <div class="row">
        <label for="sampleRate">Sample Rate:</label>
      </div>
      <div class="row">
        <Select
          ariaLabel="Select a sample rate"
          :options="sampleRatesList"
          :selectedValue="selectedSampleRate"
          @update:selected="updateSampleRate"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStudioStore } from "@/stores/studio";
import Select from '@/components/ui/Select.vue';

const store = useStudioStore();
const sampleRatesList = [
  { name: 8000, label: ' 8kHz' },
  { name: 11000, label: '11kHz' },
  { name: 22000, label: '22kHz' },
  { name: 32000, label: '32kHz' },
  { name: 44100, label: '44kHz' },
  { name: 48000, label: '48kHz' },
];

const selectedSampleRate = ref(store.sampleRate);

const updateSampleRate = (rate) => {
  if (rate === 'custom') {
    console.log('Custom rate selected');
  } else {
    selectedSampleRate.value = rate;
    store.setSampleRate(rate); 
  }
};
</script>


<style lang="scss" scoped>
.content {
  width: 100%;
  height: 100%;
  padding: 10px;
  font-size: 12px;
}
</style>
