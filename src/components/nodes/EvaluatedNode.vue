<template>
  <div class="content noselect">
    <div v-if="store.expressions[0] == store.expressions[1]">
      OUT = {{ store.expressions[0] }}
    </div>
    <div v-else>
      <div>OUT(L) => {{ store.expressions[0] }}</div>
      <div>OUT(R) => {{ store.expressions[1] }}</div>
    </div>
  </div>
</template>

<script setup>
import { useStudioStore } from "@/stores/studio";
const store = useStudioStore();
</script>
