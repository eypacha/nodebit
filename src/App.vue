<template>
    <header class="noselect">nodebit 0.0001</header>
    <main>
      <graph-canvas/>
    </main>
</template>

<script>
import GraphCanvas from "./components/GraphCanvas.vue";
export default {
  data() {
    return {

    }
  },
  components: {
    GraphCanvas,
  }
};
</script>

<style scoped>
header {
  padding: .5rem;
  border-bottom: solid 1px grey;
}
</style>