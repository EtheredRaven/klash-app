<template>
  <div
    v-if="
      currentMatch &&
      (currentMatch.player_1 || currentMatch.player_2) &&
      (currentMatch.player_1 == activeAccountAddress ||
        currentMatch.player_2 == activeAccountAddress)
    "
  >
    <LocalSync />
    <div class="flex flex-col mt-28">
      <TournamentStats />
      <PlayerCard v-if="!currentMatch.waiting" :player="opponentObject" />
      <div class="stat mb-8">
        <div class="stat-title">
          <span v-if="currentMatch.waiting">
            <span class="loading loading-dots loading-md"></span><br />
            You automatically won this round due to a odd number of players.
            Please wait for the next round to start...</span
          >
          <span v-else-if="currentMatch.winner > 1">
            <span v-if="hasWon"
              ><span class="text-success font-bold">😊 You won!</span><br />
              <span class="loading loading-dots loading-md mt-3"></span
              ><br />Waiting for the next round to start...</span
            >
            <span v-else
              ><span class="text-error font-bold">🙁 You lost!</span><br />Try
              again in the next tournament!</span
            >
          </span>
          <span v-else-if="!userObject.sign_hash || !opponentObject.sign_hash">
            {{ getMatchInfoSentence() }}
          </span>
          <button
            class="btn btn-primary mb-4"
            v-else-if="!userObject.sign"
            @click="unveilSign"
          >
            <svg
              width="24px"
              height="24px"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0h48v48H0z" fill="none" />
              <g id="Shopicon">
                <circle cx="24" cy="24" r="4" />
                <path
                  d="M24,38c12,0,20-14,20-14s-8-14-20-14S4,24,4,24S12,38,24,38z M24,16c4.418,0,8,3.582,8,8s-3.582,8-8,8s-8-3.582-8-8
		S19.582,16,24,16z"
                />
              </g>
            </svg>
            Unveil your sign
          </button>
          <span v-else-if="!opponentObject.sign">
            Waiting for your opponent to unveil his sign...
          </span>
          <span v-else>Match is being resolved...</span>
        </div>
        <div
          class="stat-value"
          v-if="currentMatch.winner <= 1 && !currentMatch.waiting"
        >
          <span class="countdown font-mono text-2xl">
            <span :style="'--value: ' + nextStepCountdown.h"></span>:
            <span :style="'--value: ' + nextStepCountdown.m"></span>:
            <span :style="'--value: ' + nextStepCountdown.s"></span>
          </span>
        </div>
      </div>
      <PlayerCard :player="userObject" :waiting="currentMatch.waiting" />
    </div>
    <LastSignsPlayed />
  </div>
  <div v-else class="flex flex-col mt-24 m-auto w-fit">
    <div class="absolute top-4 left-4">
      <button
        @click="showHowToPlay"
        :class="['btn', 'btn-ghost', 'btn-active', { 'btn-square': isMobile }]"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-6 w-6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M4 19V6.2C4 5.0799 4 4.51984 4.21799 4.09202C4.40973 3.71569 4.71569 3.40973 5.09202 3.21799C5.51984 3 6.0799 3 7.2 3H16.8C17.9201 3 18.4802 3 18.908 3.21799C19.2843 3.40973 19.5903 3.71569 19.782 4.09202C20 4.51984 20 5.0799 20 6.2V17H6C4.89543 17 4 17.8954 4 19ZM4 19C4 20.1046 4.89543 21 6 21H20M9 7H15M9 11H15M19 17V21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </g>
        </svg>
        <span v-if="!isMobile"> How to play ?</span>
      </button>
    </div>
    <div class="w-full my-12">
      <h1 class="text-6xl font-bold">
        <img
          src="../assets/logo.png"
          alt="Klash"
          class="w-16 inline align-bottom"
        />
        Klash
      </h1>
      <div class="text-2xl mt-4">
        <span
          >The first all-on-chain
          <span class="font-bold">Rock-Paper-Scissors</span> Arena</span
        >
      </div>
      <div class="mt-4">
        <div class="kbd kbd-md">
          Klash, Klash, Klash ! Earn KOIN, and soar ! 🚀
        </div>
        <div class="kbd kbd-md ml-1 cursor-pointer" @click="playTheme">🎵</div>
      </div>
    </div>
    <CurrentTournament />
  </div>
</template>

<script>
  import CurrentTournament from "../components/CurrentTournament.vue";
  import PlayerCard from "../components/PlayerCard.vue";
  import LastSignsPlayed from "../components/LastSignsPlayed.vue";
  import LocalSync from "../components/LocalSync.vue";
  import TournamentStats from "../components/TournamentStats.vue";
  import KlashIcon from "../components/KlashIcon.vue";

  import {
    MATCH_PLAYER_1_WON,
    MATCH_PLAYER_2_WON,
  } from "../utils/constants.js";
  import { TIMEOUT_DURATION } from "../utils/constants.js";
  import { getRemainingTime } from "../utils/dateTime";
  import { verifySign } from "../services/verifySign";
  export default {
    name: "MatchView",
    components: {
      PlayerCard,
      CurrentTournament,
      LastSignsPlayed,
      LocalSync,
      TournamentStats,
      KlashIcon,
    },
    created() {
      this.setCountdown();
    },
    data() {
      return {
        nextStepCountdown: {
          h: 0,
          m: 0,
          s: 0,
        },
        updateCountdownInterval: null,
      };
    },
    computed: {
      isMobile() {
        return window.innerWidth < 500;
      },
      currentMatch() {
        return this.$store.state.currentMatch || {};
      },
      activeAccountAddress: function () {
        return this.$store.state.activeAccount?.address;
      },
      isPlayer1() {
        return (
          this.$store.state.activeAccount?.address ===
          this.currentMatch.player_1
        );
      },
      hasWon() {
        let ret =
          (this.currentMatch.winner == MATCH_PLAYER_1_WON && this.isPlayer1) ||
          (!this.isPlayer1 && this.currentMatch.winner == MATCH_PLAYER_2_WON);
        return ret;
      },
      players() {
        let player1 = {
          address: this.currentMatch.player_1,
          score: this.currentMatch.score_1,
          last_action_timestamp: this.currentMatch.last_action_timestamp_1,
          sign: this.currentMatch.sign_1,
          sign_hash: this.currentMatch.sign_hash_1,
        };
        let player2 = {
          address: this.currentMatch.player_2,
          score: this.currentMatch.score_2,
          last_action_timestamp: this.currentMatch.last_action_timestamp_2,
          sign: this.currentMatch.sign_2,
          sign_hash: this.currentMatch.sign_hash_2,
        };
        let ret = this.isPlayer1
          ? { user: player1, opponent: player2 }
          : { user: player2, opponent: player1 };

        return ret;
      },
      userObject() {
        let ret = this.players.user;
        ret.isUser = true;
        if (this.currentMatch.waiting)
          ret.address = this.$store.state.activeAccount?.address;
        return ret || {};
      },
      opponentObject() {
        let ret = this.players.opponent;
        ret.isOpponent = true;
        return ret || {};
      },
    },
    methods: {
      setCountdown() {
        this.updateCountdownInterval &&
          clearInterval(this.updateCountdownInterval);
        this.updateCountdownInterval = setInterval(this.updateCountdown, 50);
      },
      updateCountdown() {
        let actionTimestamp =
          Math.floor(
            (this.userObject.last_action_timestamp > 0 &&
            this.opponentObject.last_action_timestamp > 0
              ? Math.min(
                  this.userObject.last_action_timestamp,
                  this.opponentObject.last_action_timestamp
                )
              : this.currentMatch.start_timestamp) / 1000
          ) *
            1000 +
          TIMEOUT_DURATION;
        this.nextStepCountdown = getRemainingTime(actionTimestamp);
      },
      getMatchInfoSentence() {
        if (this.userObject.sign_hash) {
          if (this.opponentObject.sign_hash) {
            return "Unveil your sign to the opponent by clicking on the button to compute the round winner!";
          } else {
            return "Waiting for your opponent to chose his sign...";
          }
        } else {
          if (this.opponentObject.sign_hash) {
            return "Your opponent has chosen its sign: click quickly on the sign you would like to play!";
          } else {
            return "Click on the sign you would like to play";
          }
        }
      },
      unveilSign() {
        verifySign(
          this,
          this.$store.state.signPlayed || this.$store.state.tempSignPlayed,
          this.$store.state.hashingSeed,
          this.$store.state.tempHashingSeed
        );
      },
      showHowToPlay() {
        this.$store.commit("openInfoModal", {
          title: "How to play Klash?",
          html:
            "<b>🎮 Welcome to Klash!</b><br/>" +
            "Klash is an on-chain Rock-Paper-Scissors game on the Koinos blockchain. First, you will need to connect your Koinos wallet with Kondor. If you don't have a wallet or Kondor, please check <a href='https://kanvas-app.com/docs/playing/howtobuykoin.html' target='_blank'>this tutorial.</a><br/><br/>" +
            "<b>Signing-up for a tournament</b><br/>" +
            "You will then be able to sign-up for any opened tournament by clicking on the dedicated button. Once you are signed-up after sending the transaction to the blockchain, don't forget to be there where the tournament starts at the end of the countdown or you will automatically lose after 3 minutes of inactivity!<br/><br/>" +
            "<b>Playing the match</b><br/>" +
            "You will be matched in the first round of the tournament with another player. " +
            "You can play by clicking on one of the three signs: Rock, Paper or Scissors. " +
            "Once both you and your opponent have chosen their sign, you can unveil your sign to compute the winner of the round. " +
            "Rock beats Scissors, Scissors beats Paper and Paper beats Rock.<br/><br/>" +
            "<b>Advancing in the next rounds</b><br/>" +
            "Each match is direct elimination and played in a best of 7 rounds. The winner of the match advance in the next round of the tournament. " +
            "You must wait for all the matches of the previous round to be resolved before the next round starts. You will then be matched with your next opponent. Please, keep your connection up as you will have only 3 minutes to play your sign in your next match.<br/><br/>" +
            "<b>End of the tournament</b><br/>" +
            "The total number of rounds depends on the number of players in the tournament. The tournament ends when there is only one player left. " +
            "If you win the final round of the tournament, you will earn KOIN tokens!",
        });
      },
      playTheme() {
        // Play the theme song
        const audio = new Audio("/theme.mp3");
        audio.play();
        this.$store.commit("openInfoModal", {
          title: "Klash! Klash! Klash!",
          html:
            "<b>[Verse]</b><br/>" +
            "Jump in Klash, here fun's free<br/>" +
            "Play endlessly, without a fee.<br/>" +
            "Adventure calls, it's time to dive in,<br/>" +
            "Battles await, ready to win.<br/><br/>" +
            "It's so simple, pick your move,<br/>" +
            "Rock, paper, scissors: that’s the groove!<br/>" +
            "Through the rounds, climb to the top<br/>" +
            "Glory awaits, let champions pop !<br/><br/>" +
            "<b>[Chorus]</b><br/>" +
            "Into the arena, like never before !<br/>" +
            "Rock, paper, scissors, settle the score.<br/>" +
            "Klash, Klash, Klash ! <br/>" +
            "Hear the victory's roar !<br/>" +
            "Klash, Klash, Klash !<br/>" +
            "Earn KOIN, and soar !<br/><br/>" +
            "<b>[Verse]</b><br/>" +
            "Grab your chance, battle’s here,<br/>" +
            "Fight the top, have no fear.<br/>" +
            "Every match, a chance to prove,<br/>" +
            "Be the best, make your move !<br/><br/>" +
            "Feel the rush, take your stand,<br/>" +
            "Victory's close, just at hand.<br/>" +
            "Join the game, let's aim high,<br/>" +
            "In Klash, we battle, under the sky.<br/><br/>" +
            "<b>[Chorus x3]</b><br/>" +
            "Into the arena, like never before !<br/>" +
            "Rock, paper, scissors, settle the score.<br/>" +
            "Klash, Klash, Klash !<br/>" +
            "Hear the victory's roar !<br/>" +
            "Klash, Klash, Klash !<br/>" +
            "Earn KOIN, and soar !<br/><br/>" +
            "<b>[Outro]</b><br/>" +
            "Klash, Klash, Klash !<br/>" +
            "Earn KOIN, and soar !<br/>" +
            "Into the play, earn KOIN and more !",
        });
      },
    },
    beforeUnmount() {
      clearInterval(this.updateCountdownInterval);
    },
  };
</script>
