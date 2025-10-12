<template>
  <div class="content-toggle">
      <RangeSlider
        v-model="value"
        :min="0"
        :max="1"
        :step="0.01"
        aria-label="RangeSlider"/>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";

import RangeSlider from "@/components/ui/RangeSlider.vue";
import { useStudioStore } from "@/stores/studio";

const store = useStudioStore();

const value = ref(0);

const props = defineProps({
  node: Object,
});

function updateNodeContent(value) {
  store.updateNode(props.node.id, { content: value ?? 0 });
  store.evaluateBytebeat();
}

watch(value, (newValue) => {
  updateNodeContent(newValue);
});
</script>

<style lang="scss" scoped>

</style>
