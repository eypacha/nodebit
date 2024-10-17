<template>
    <label>
      <input
        type="checkbox"
        :id="id"
        :checked="modelValue"
        @change="$emit('update:modelValue', $event.target.checked)"
        :aria-label="ariaLabel"
      />
      <span class="slider round"></span>
    </label>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    modelValue: Boolean,
    id: String,
    ariaLabel: String,
  });
  
  defineEmits(['update:modelValue']);
  </script>
  
  <style lang="scss" scoped>

label {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  box-shadow: black 0px 2px 8px inset;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .slider {
      background-color: transparent;
    }

    &:checked + .slider:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
    }
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: transparent;
    -webkit-transition: 0.2s;
    transition: 0.2s;

    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: cyan;
      -webkit-transition: 0.2s;
      transition: 0.2s;
    }
  }
}

  </style>