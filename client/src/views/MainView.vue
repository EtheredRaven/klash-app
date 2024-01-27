<template>
  <div>
    <div class="absolute top-4 right-4">
      <ConnectKondor />
    </div>
  </div>
</template>

<script>
  import ConnectKondor from "../components/ConnectKondor.vue";
  export default {
    name: "MainView",
    components: {
      ConnectKondor,
    },
  };
</script>
