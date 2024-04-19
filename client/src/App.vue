<template>
  <div>
    <div class="absolute top-4 right-4">
      <ConnectKondor />
    </div>
    <router-view />
    <InfoModal :info="infoModal" id="infoModal" />
    <ConnectModal />
  </div>
</template>

<script>
  import InfoModal from "./components/InfoModal.vue";
  import ConnectModal from "./components/ConnectModal.vue";
  import ConnectKondor from "./components/ConnectKondor.vue";
  import { initSocket } from "./services/events.js";
  export default {
    name: "App",
    components: {
      InfoModal,
      ConnectModal,
      ConnectKondor,
    },
    computed: {
      infoModal() {
        return this.$store.state.infoModal;
      },
    },
    created() {
      initSocket(this);
    },
  };
</script>
