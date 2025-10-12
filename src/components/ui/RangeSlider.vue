<template>
  <label>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :style="{ width: width ? `${width}px` : '139px' }"
      @mousedown.stop="isSliding = true"
      @touchstart.stop="isSliding = true"
      @mouseup.stop="isSliding = false"
      @touchend.stop="isSliding = false"
      @input="$emit('update:modelValue', +$event.target.value)"
      :aria-label="ariaLabel"
    />
    <span :class="{isSliding}">{{ modelValue }}</span>
  </label>
</template>

<script setup>
import { defineProps, ref, defineEmits } from "vue";

const props = defineProps({
  modelValue: Number,
  min: Number,
  max: Number,
  step: Number,
  width: Number,
  ariaLabel: String,
});

const isSliding = ref(false);

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

    span {
    opacity: 0;
    font-size: 15px;
    pointer-events: none;
    right: 7px;
    color: yellow;
    mix-blend-mode: exclusion;
    position: absolute;
    transition: opacity 100ms;

    &.isSliding {
      opacity: 1;
    }
  }
}
</style>
