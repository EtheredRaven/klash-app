<template>
  <div class="h-screen flex items-center justify-center flex-col">
    <div
      v-if="
        currentMatch &&
        (currentMatch.player_1 == activeAccountAddress ||
          currentMatch.player_2 == activeAccountAddress)
      "
    >
      <div>
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
            <span
              v-else-if="!userObject.sign_hash || !opponentObject.sign_hash"
            >
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
    </div>
    <div v-else>
      <div class="h-screen flex items-center justify-center flex-col">
        <div class="w-full my-8">
          <h1 class="text-5xl font-bold">
            <span class="klashIcon mr-3 inline-block align-bottom">
              <svg
                width="38px"
                height="38px"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
              >
                <path
                  d="m2.75 9.25 1.5 2.5 2 1.5m-4.5 0 1 1m1.5-2.5-1.5 1.5m3-1 8.5-8.5v-2h-2l-8.5 8.5"
                /></svg></span
            >Klash<span class="klashIcon ml-3 inline-block align-bottom">
              <svg
                width="38px"
                height="38px"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                transform="scale(-1,1)"
                transform-origin="center"
              >
                <path
                  d="m2.75 9.25 1.5 2.5 2 1.5m-4.5 0 1 1m1.5-2.5-1.5 1.5m3-1 8.5-8.5v-2h-2l-8.5 8.5"
                /></svg
            ></span>
          </h1>
          <p class="py-6">
            Step into the All-On-Chain Rock-Paper-Scissors Arena - Compete for
            free and Earn $KOIN on Koinos
          </p>
        </div>
        <CurrentTournament />
      </div>
    </div>
  </div>
</template>

<script>
  import CurrentTournament from "../components/CurrentTournament.vue";
  import PlayerCard from "../components/PlayerCard.vue";
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
      currentMatch() {
        return this.$store.state.currentMatch;
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
        return ret;
      },
      opponentObject() {
        let ret = this.players.opponent;
        ret.isOpponent = true;
        return ret;
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
    },
    beforeUnmount() {
      clearInterval(this.updateCountdownInterval);
    },
  };
</script>
