<template>
  <div class="mb-12">
    <h2 class="text-3xl font-bold">
      Round {{ tournamentStats.currentRound }}/{{ tournamentStats.totalRounds }}
    </h2>
    <div class="kbd kbd-md mt-2">
      <span>
        <span class="font-bold">{{
          tournamentStats.totalMatches - tournamentStats.finishedMatches
        }}</span>
        unfinished matches</span
      >
    </div>
  </div>
</template>

<script>
  export default {
    name: "TournamentStats",
    computed: {
      tournamentStats() {
        return this.$store.state.currentTournamentStats || {};
      },
    },
  };
</script>
