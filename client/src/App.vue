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
            currentMatch.player_2 == activeAccountAddress ||
            currentMatch.waiting)
        "
      >
        <MatchView />
      </div>
      <div v-else>
        <MainView />
      </div>
    </div>
  </div>
</template>

<script>
  import ConnectKondor from "./components/ConnectKondor.vue";
  import MainView from "./views/MainView.vue";
  import MatchView from "./views/MatchView.vue";
  export default {
    name: "App",
    components: {
      ConnectKondor,
      MainView,
      MatchView,
    },
    computed: {
      currentMatch() {
        return this.$store.state.currentMatch;
      },
      activeAccountAddress: function () {
        return this.$store.state.activeAccount?.address;
      },
    },
    created() {
      this.$socket.on("tournament_created", (tournament) => {
        this.$store.commit("setCurrentTournament", tournament);
      });
      this.$socket.on("player_signed_up", (address) => {
        this.$store.commit("addPlayerToCurrentTournament", address);
      });
      this.$socket.on("match_created", (match) => {
        this.$store.dispatch("setCurrentMatch", match);
      });
      this.$socket.on("player_waiting", () => {
        this.$info(
          "Waiting for your next opponent... Stay online!",
          "Please wait"
        );
        this.$store.dispatch("setCurrentMatch", {
          waiting: true,
        });
      });
      this.$socket.on("sign_played", (isUser, match) => {
        this.$store.dispatch("setCurrentMatch", match);
        if (isUser) {
          this.$store.dispatch(
            "setSignPlayed",
            this.$store.state.tempSignPlayed
          );
          this.$store.dispatch(
            "setHashingSeed",
            this.$store.state.tempHashingSeed
          );
        }
      });
      this.$socket.on("sign_verified", (match) => {
        this.$store.dispatch("setCurrentMatch", match);
      });

      this.$socket.on("match_round_finished", (match) => {
        this.$store.dispatch("setCurrentMatch", match);
      });

      this.$socket.on("match_finished", (match) => {
        this.$store.dispatch("setCurrentMatch", match);
      });

      this.$socket.on("tournament_finished", (tournament) => {
        if (tournament.winner == this.$store.state.activeAccount?.address) {
          this.$info("You won the tournament!", "Congratulations!");
        }
        this.$store.commit("setCurrentTournament", tournament);
      });

      // TODO : player waiting, round started
    },
  };
</script>
