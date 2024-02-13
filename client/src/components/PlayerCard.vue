<template>
  <div
    class="card items-center text-center shadow-lg bg-base-100 mb-8 w-fit mx-auto"
  >
    <div class="card-body p-0">
      <div class="stats stats-horizontal">
        <div class="stat px-4">
          <div class="stat-value">
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
          <svg
            fill="currentColor"
            width="28px"
            height="28px"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M464.8 80c-26.9-.4-48.8 21.2-48.8 48h-8V96.8c0-26.3-20.9-48.3-47.2-48.8-26.9-.4-48.8 21.2-48.8 48v32h-8V80.8c0-26.3-20.9-48.3-47.2-48.8-26.9-.4-48.8 21.2-48.8 48v48h-8V96.8c0-26.3-20.9-48.3-47.2-48.8-26.9-.4-48.8 21.2-48.8 48v136l-8-7.1v-48.1c0-26.3-20.9-48.3-47.2-48.8C21.9 127.6 0 149.2 0 176v66.4c0 27.4 11.7 53.5 32.2 71.8l111.7 99.3c10.2 9.1 16.1 22.2 16.1 35.9v6.7c0 13.3 10.7 24 24 24h240c13.3 0 24-10.7 24-24v-2.9c0-12.8 2.6-25.5 7.5-37.3l49-116.3c5-11.8 7.5-24.5 7.5-37.3V128.8c0-26.3-20.9-48.4-47.2-48.8z"
            />
          </svg>
        </button>
        <button
          :class="'btn btn-square join-item ' + getStateClassButton(PAPER_SIGN)"
          @click="() => playSign(PAPER_SIGN)"
        >
          <svg
            fill="currentColor"
            width="28px"
            height="28px"
            viewBox="-32 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M408.781 128.007C386.356 127.578 368 146.36 368 168.79V256h-8V79.79c0-22.43-18.356-41.212-40.781-40.783C297.488 39.423 280 57.169 280 79v177h-8V40.79C272 18.36 253.644-.422 231.219.007 209.488.423 192 18.169 192 40v216h-8V80.79c0-22.43-18.356-41.212-40.781-40.783C121.488 40.423 104 58.169 104 80v235.992l-31.648-43.519c-12.993-17.866-38.009-21.817-55.877-8.823-17.865 12.994-21.815 38.01-8.822 55.877l125.601 172.705A48 48 0 0 0 172.073 512h197.59c22.274 0 41.622-15.324 46.724-37.006l26.508-112.66a192.011 192.011 0 0 0 5.104-43.975V168c.001-21.831-17.487-39.577-39.218-39.993z"
            />
          </svg>
        </button>
        <button
          :class="
            'btn btn-square join-item ' + getStateClassButton(SCISSORS_SIGN)
          "
          @click="() => playSign(SCISSORS_SIGN)"
        >
          <svg
            fill="currentColor"
            width="28px"
            height="28px"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M216 440c0-22.092 17.909-40 40-40v-8h-32c-22.091 0-40-17.908-40-40s17.909-40 40-40h32v-8H48c-26.51 0-48-21.49-48-48s21.49-48 48-48h208v-13.572l-177.551-69.74c-24.674-9.694-36.818-37.555-27.125-62.228 9.693-24.674 37.554-36.817 62.228-27.124l190.342 74.765 24.872-31.09c12.306-15.381 33.978-19.515 51.081-9.741l112 64A40.002 40.002 0 0 1 512 168v240c0 18.562-12.77 34.686-30.838 38.937l-136 32A39.982 39.982 0 0 1 336 480h-80c-22.091 0-40-17.908-40-40z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { ROCK_SIGN, PAPER_SIGN, SCISSORS_SIGN } from "../utils/constants";
  import { playSign } from "../services/playSign.js";

  export default {
    name: "PlayerCard",
    props: {
      player: {
        type: Object,
        required: true,
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
    },
    methods: {
      shortenAddress: function (addr) {
        return addr.substr(0, 10) + "..." + addr.slice(-5);
      },
      getStateClassButton(sign) {
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
        let seed = Math.floor(Math.random() * 18000000000000000);
        this.$store.dispatch("setTempSignPlayed", sign);
        this.$store.dispatch("setTempHashingSeed", seed);
        await playSign(this, sign, seed);
      },
    },
  };
</script>