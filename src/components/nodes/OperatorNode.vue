<template>
  <div class="operator noselect">
    <div class="name">
      {{ node.content }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useStudioStore } from "@/stores/studio";

import "./NumberNode.scss";

const store = useStudioStore();
const props = defineProps({
  node: Object,
});
</script>

<style lang="scss" scoped>

.name {
  color: cyan;
}

.increments {

  button {
      color: cyan;
      width: 15px;
      height: 15px;
      padding: 0;
      text-align: center;
      font-size: 11px;
      outline: solid 1px #c442c035;
      background: #17111f;
      box-shadow: black 0px 2px 2px;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }

    .prev {
      left: 5px;
    }
    .next {
      right: 5px;
    }
}
.operator {
  &:hover {
    .increments {
      opacity: 1;
    }
  }
}



</style>