<template>
  <div>
    <div class="absolute top-4 right-4">
      <ConnectKondor />
    </div>
    <div class="h-screen flex items-center justify-center flex-col">
      <div
        v-if="
          currentMatch &&
          (currentMatch.player_1 == activeAccountAddress ||
            currentMatch.player_2 == activeAccountAddress)
        "
      >
        <MatchView />
      </div>
      <div v-else>
        <MainView />
      </div>
    </div>
    <InfoModal :info="infoModal" id="infoModal" />
  </div>
</template>

<script>
  import ConnectKondor from "./components/ConnectKondor.vue";
  import MainView from "./views/MainView.vue";
  import MatchView from "./views/MatchView.vue";
  import InfoModal from "./components/InfoModal.vue";
  import { initSocket } from "./services/events.js";
  export default {
    name: "App",
    components: {
      ConnectKondor,
      MainView,
      MatchView,
      InfoModal,
    },
    computed: {
      currentMatch() {
        return this.$store.state.currentMatch;
      },
      activeAccountAddress: function () {
        return this.$store.state.activeAccount?.address;
      },
      infoModal() {
        return this.$store.state.infoModal;
      },
    },
    created() {
      initSocket(this);
    },
  };
</script>
