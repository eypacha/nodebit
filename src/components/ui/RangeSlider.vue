<template>
  <label>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :aria-label="ariaLabel"
      @mousedown.stop
      @touchstart.stop
    />
  </label>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: Number,
  min: Number,
  max: Number,
  step: Number,
  ariaLabel: String,
});

defineEmits(["update:modelValue"]);
</script>

<style scoped>
label {
  position: relative;
  display: inline-block;
  
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    padding: 5px !important;
    background-color: transparent;
    box-shadow: black 0px 2px 8px inset;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      background-color: cyan;
      height: 16px;
      width: 16px;
    }

    &[disabled]::-webkit-slider-thumb {
      opacity: 0.5;
    }
  }
}
</style>
