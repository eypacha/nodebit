<template>
  <div class="content noselect">
    <div v-if="studio.expressions[0] == studio.expressions[1]">
      OUT = {{ studio.expressions[0] }}
    </div>
    <div v-else>
      <div>OUT(L) => {{ studio.expressions[0] }}</div>
      <div>OUT(R) => {{ studio.expressions[1] }}</div>
    </div>
  </div>
</template>

<script setup>
import { useStudioStore } from "@/stores/studio";

const studio = useStudioStore();
</script>
