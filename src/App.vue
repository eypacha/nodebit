<template>
  <div :style="computedStyle" class="content">
    <header class="noselect">
      <nav>
        <img src="/public/favicon-32x32.png" alt="Nodebit" />  
        <h4>nodebit 0.8</h4>
      </nav>
    </header>

    <main>
      <graph-canvas/>
    </main>
  </div>
</template>
<script setup>
import { useFilterStyle } from '@/composables/useFilterStyle'; 
const { computedStyle } = useFilterStyle();

import GraphCanvas from "./components/GraphCanvas.vue";

</script>

<style scoped>

.content {
  height: 100%;
  background-color: #17111f;
  display: flex;
  flex-direction: column;
}
header {
  padding: .5rem;
  color: cyan;
  border-bottom: solid 1px #c542c157;

  nav {
    display: flex;
    gap: .5em;
    align-items: flex-end;

    img {
      width: 20px;
      height: 20px;
    }
  }
}

main {
  position: relative;
}
</style>