<template>
  <div
    class="card items-center text-center shadow-lg bg-base-100 mb-8 w-fit mx-auto"
  >
    <div class="card-body p-0">
      <div class="stats stats-horizontal">
        <div class="stat px-4">
          <div class="stat-value" v-if="!waiting">
            {{ player.score }}
          </div>
          <div class="stat-title">
            {{ shortenAddress(player.address) }}
          </div>
        </div>
      </div>
    </div>
    <div class="card-action mb-4" v-if="player.isUser">
      <div class="join join-vertical lg:join-horizontal">
        <button
          :class="'btn btn-square join-item ' + getStateClassButton(ROCK_SIGN)"
          @click="() => playSign(ROCK_SIGN)"
        >
          <KlashIcon icon="rock" />
        </button>
        <button
          :class="'btn btn-square join-item ' + getStateClassButton(PAPER_SIGN)"
          @click="() => playSign(PAPER_SIGN)"
        >
          <KlashIcon icon="paper" />
        </button>
        <button
          :class="
            'btn btn-square join-item ' + getStateClassButton(SCISSORS_SIGN)
          "
          @click="() => playSign(SCISSORS_SIGN)"
        >
          <KlashIcon icon="scissors" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { ROCK_SIGN, PAPER_SIGN, SCISSORS_SIGN } from "../utils/constants";
  import { playSign } from "../services/playSign.js";
  import { shortenAddress } from "../utils/formatting";
  import KlashIcon from "./KlashIcon.vue";

  export default {
    name: "PlayerCard",
    components: {
      KlashIcon,
    },
    props: {
      player: {
        type: Object,
        required: true,
      },
      waiting: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        ROCK_SIGN,
        PAPER_SIGN,
        SCISSORS_SIGN,
      };
    },
    computed: {
      currentMatch() {
        return this.$store.state.currentMatch;
      },
      signPlayed() {
        if (this.player.isOpponent) return null;
        let sign = this.player.sign || this.$store.state.signPlayed;
        if (!sign && this.player.sign_hash && this.tempSignPlayed) {
          sign = this.tempSignPlayed;
        }
        return sign;
      },
      tempSignPlayed() {
        if (this.player.isOpponent) return null;
        return this.$store.state.tempSignPlayed;
      },
      hasPlayed() {
        if (this.player.isOpponent) return !!this.player.sign;
        return this.signPlayed != null || this.tempSignPlayed != null;
      },
      cantPlayTimeout() {
        return this.$store.state.cantPlayTimeout;
      },
    },
    methods: {
      shortenAddress,
      getStateClassButton(sign) {
        if (this.waiting || this.currentMatch.winner > 1) return "btn-disabled";
        if (this.signPlayed == sign) {
          return "btn-primary";
        } else if (this.signPlayed) {
          return "btn-disabled";
        } else if (this.tempSignPlayed == sign) {
          return "btn-neutral";
        } else if (this.tempSignPlayed) {
          return "btn-disabled";
        } else {
          return "";
        }
      },
      async playSign(sign) {
        // Generate a random seed for the sign (uint64)
        if (this.cantPlayTimeout)
          return this.$error(
            "You need to wait 30s before trying to send the transaction again."
          );
        let seed = Math.floor(Math.random() * 18000000000000000);
        this.$store.dispatch(
          "setHashingSeed",
          this.$store.state.tempHashingSeed
        );
        this.$store.dispatch("setTempSignPlayed", sign);
        this.$store.dispatch("setTempHashingSeed", seed);
        await playSign(this, sign, seed);
        this.$store.commit("setCantPlayTimeout");
      },
    },
  };
</script>
