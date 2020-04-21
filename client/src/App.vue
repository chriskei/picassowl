<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Hello world!" />
    <h1>user: {{ user }}</h1>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import axios from "axios";

axios.defaults.baseURL = "https://us-central1-picassowl.cloudfunctions.net";

export default {
  name: "App",
  components: {
    HelloWorld,
  },
  data() {
    return {
      user: "",
    };
  },
  mounted() {
    axios.get("/helloWorld").then((response) => {
      this.user = response.data;
    });
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
