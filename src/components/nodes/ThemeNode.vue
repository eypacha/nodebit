<template>
  <div class="content noselect">
    <h3>Theme</h3>
    <div>
      <div class="row">
            <Toggle
              v-model="store.theme.darkMode"
              aria-label="Toggle dark mode"
            />
            <span>{{ store.theme.darkMode ? "Dark mode" : "Light mode" }}</span>
          </div>
          <div class="row">
          <label class="switch">
            <Toggle
              v-model="store.theme.greyscale"
              aria-label="Toggle greyscale"
            />
            <span class="slider round"></span>
          </label>
          <span>{{ store.theme.greyscale ? "Greyscale" : "Color mode" }}</span>
        </div>
      <div class="row" style="margin-top: 20px">
        Hue-rotation
      </div>
      <div class="row">
        <RangeSlider
          v-model="store.theme.hueRotation"
          :min="0"
          :max="360"
          :step="30"
          aria-label="Hue rotation slider"
        />
        <span>{{ store.theme.hueRotation }} deg</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStudioStore } from "@/stores/studio";
import Toggle from "@/components/ui/Toggle.vue"
import RangeSlider from "@/components/ui/RangeSlider.vue"

const store = useStudioStore();
</script>

<style lang="scss" scoped>
.content {
  width: 100%;
  height: 100%;
  padding: 10px;
  font-size: 12px;
}
h3 {
  color: cyan;
  margin-bottom: 15px;
}

.row {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  margin-bottom: 5px;
}
</style>
