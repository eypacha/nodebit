<template>
    <header>nodebit 0.1</header>
    <graph-canvas/>
</template>

<script>
import GraphCanvas from "./components/GraphCanvas.vue";


export default {
  data() {
    return {

    }
  },
  components: {
    GraphCanvas
  }
};
</script>

<style scoped>
header {
  padding: .5rem;
  border-bottom: solid 1px grey;
}
</style>