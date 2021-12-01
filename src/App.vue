<template>
  <header class="header">{{ msg }}</header>
  <SandBox></SandBox>
  <footer class="footer">Power by Vitejs © Autel Energy</footer>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import SandBox from "./components/sandbox.vue";
export default defineComponent({
  components: {
    SandBox,
  },
  setup() {
    return {
      msg: "Autel Code Sandbox",
    };
  },
});
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100vh;
  .header,
  .footer {
    padding: 10px 0;
  }
}
html,
body,
p,
h1 {
  margin: 0;
}
* {
  box-sizing: border-box;
}
</style>
