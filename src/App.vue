<template>
    <header class="noselect">
      <nav>
        <img src="/public/favicon-32x32.png" alt="Nodebit" />  
        <h4>nodebit 0.001</h4>
      </nav>
    </header>

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
</style>