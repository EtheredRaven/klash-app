<template>
  <div>
    <PlayerCard v-if="!match.waiting" :player="opponentObject" />
    <div class="stat mb-8">
      <div class="stat-title">
        <span v-if="match.waiting">
          <span class="loading loading-dots loading-md"></span><br />
          You skipped this round! Waiting for your next opponent...</span
        >
        <span v-else-if="match.winner > 1">
          <span v-if="hasWon"
            ><span class="text-success font-bold">😊 You won!</span><br />
            <span class="loading loading-dots loading-md mt-3"></span
            ><br />Waiting for your next match...</span
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
      <div class="stat-value" v-if="match.winner <= 1 && !match.waiting">
        <span class="countdown font-mono text-2xl">
          <span :style="'--value: ' + nextStepCountdown.h"></span>:
          <span :style="'--value: ' + nextStepCountdown.m"></span>:
          <span :style="'--value: ' + nextStepCountdown.s"></span>
        </span>
      </div>
    </div>
    <PlayerCard :player="userObject" :waiting="match.waiting" />
  </div>
</template>

<script>
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
      match() {
        return this.$store.state.currentMatch;
      },
      isPlayer1() {
        return this.$store.state.activeAccount?.address === this.match.player_1;
      },
      hasWon() {
        let ret =
          (this.match.winner == MATCH_PLAYER_1_WON && this.isPlayer1) ||
          (!this.isPlayer1 && this.match.winner == MATCH_PLAYER_2_WON);
        return ret;
      },
      players() {
        let player1 = {
          address: this.match.player_1,
          score: this.match.score_1,
          last_action_timestamp: this.match.last_action_timestamp_1,
          sign: this.match.sign_1,
          sign_hash: this.match.sign_hash_1,
        };
        let player2 = {
          address: this.match.player_2,
          score: this.match.score_2,
          last_action_timestamp: this.match.last_action_timestamp_2,
          sign: this.match.sign_2,
          sign_hash: this.match.sign_hash_2,
        };
        let ret = this.isPlayer1
          ? { user: player1, opponent: player2 }
          : { user: player2, opponent: player1 };

        return ret;
      },
      userObject() {
        let ret = this.players.user;
        ret.isUser = true;
        if (this.match.waiting)
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
              : this.match.start_timestamp) / 1000
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
  };
</script>
