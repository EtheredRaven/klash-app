<template>
  <div v-if="currentTournament">
    <span class="bg-base-200"></span>
    <div class="card items-center text-center shadow-lg bg-base-100">
      <h2 class="card-title mt-8 text-3xl">
        Tournament #{{ currentTournament.id }}
      </h2>
      <div class="card-body">
        <div class="stats stats-vertical lg:stats-horizontal">
          <div class="stat icon-left">
            <div class="stat-figure">
              <svg
                width="36px"
                height="36px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 12.4984L14 12.4984M3 12.4984L10 12.4984M7 4.5V19.4984M17 4.5V19.4984M6.2 19.5H17.8C18.9201 19.5 19.4802 19.5 19.908 19.282C20.2843 19.0903 20.5903 18.7843 20.782 18.408C21 17.9802 21 17.4201 21 16.3V10.9C21 8.65979 21 7.53968 20.564 6.68404C20.1805 5.93139 19.5686 5.31947 18.816 4.93597C17.9603 4.5 16.8402 4.5 14.6 4.5H9.4C7.15979 4.5 6.03968 4.5 5.18404 4.93597C4.43139 5.31947 3.81947 5.93139 3.43597 6.68404C3 7.53968 3 8.65979 3 10.9V16.3C3 17.4201 3 17.9802 3.21799 18.408C3.40973 18.7843 3.71569 19.0903 4.09202 19.282C4.51984 19.5 5.07989 19.5 6.2 19.5ZM10 10.4984H14V14.4984H10V10.4984Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="stat-title">Total prize</div>
            <div class="stat-value">
              {{ currentTournament.prize / 100000000 }} $KOIN
            </div>
          </div>

          <div class="stat">
            <div class="stat-title">Sign-ups end</div>
            <div clas="stat-value">
              <span class="countdown font-mono text-4xl">
                <span :style="'--value: ' + signUpEndCountdown.h"></span>:
                <span :style="'--value: ' + signUpEndCountdown.m"></span>:
                <span :style="'--value: ' + signUpEndCountdown.s"></span>
              </span>
            </div>
          </div>

          <div class="stat">
            <div class="stat-figure">
              <svg
                width="36px"
                height="36px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 19.2857L15.8 21L20 17M16.5 14.4018C16.2052 14.2315 15.8784 14.1098 15.5303 14.0472C15.4548 14.0337 15.3748 14.024 15.2842 14.0171C15.059 14 14.9464 13.9915 14.7961 14.0027C14.6399 14.0143 14.5527 14.0297 14.4019 14.0723C14.2569 14.1132 13.9957 14.2315 13.4732 14.4682C12.7191 14.8098 11.8817 15 11 15C10.1183 15 9.28093 14.8098 8.52682 14.4682C8.00429 14.2315 7.74302 14.1131 7.59797 14.0722C7.4472 14.0297 7.35983 14.0143 7.20361 14.0026C7.05331 13.9914 6.94079 14 6.71575 14.0172C6.6237 14.0242 6.5425 14.0341 6.46558 14.048C5.23442 14.2709 4.27087 15.2344 4.04798 16.4656C4 16.7306 4 17.0485 4 17.6841V19.4C4 19.9601 4 20.2401 4.10899 20.454C4.20487 20.6422 4.35785 20.7951 4.54601 20.891C4.75992 21 5.03995 21 5.6 21H10.5M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="stat-title">Participants</div>
            <div class="stat-value">
              {{ currentTournament.players.length }} players
            </div>
          </div>
        </div>
      </div>
      <div class="card-action mb-8">
        <button
          class="btn btn-neutral btn-outline no-animation cursor-default inactive-btn btn-wide"
          v-if="!activeAccountAddress"
        >
          Connect to Kondor to join
        </button>
        <button
          v-else-if="isPlayerSignedUp"
          class="btn btn-neutral btn-outline no-animation cursor-default inactive-btn btn-wide btn-success"
        >
          You're in!
        </button>
        <button v-else class="btn btn-primary btn-wide" @click="signUp">
          Sign-up
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { signUp } from "../services/signUp.js";
  import { getRemainingTime } from "../utils/dateTime";
  export default {
    name: "CurrentTournament",
    data() {
      return {
        signUpEndCountdown: {
          h: 0,
          m: 0,
          s: 0,
        },
        updateCountdownInterval: null,
      };
    },
    computed: {
      currentTournament() {
        let currentTournament = this.$store.state.currentTournament;
        return currentTournament;
      },
      activeAccountAddress: function () {
        return this.$store.state.activeAccount?.address;
      },
      isPlayerSignedUp() {
        return this.currentTournament.players
          .map((el) => el.address)
          .includes(this.activeAccountAddress);
      },
    },
    watch: {
      currentTournament() {
        this.updateCountdown();
        this.updateCountdownInterval &&
          clearInterval(this.updateCountdownInterval);
        this.updateCountdownInterval = setInterval(this.updateCountdown, 50);
      },
    },
    methods: {
      updateCountdown() {
        let signUpEndTimestamp =
          this.currentTournament.sign_up_start +
          this.currentTournament.sign_up_duration;
        this.signUpEndCountdown = getRemainingTime(signUpEndTimestamp);
      },
      signUp() {
        signUp(this);
      },
    },
  };
</script>

<style>
  .stat-figure {
    grid-row-start: 2;
  }

  .icon-left .stat-figure {
    grid-column-start: 1;
  }

  .icon-left .stat-title {
    grid-column-start: 2;
  }

  .icon-left .stat-value {
    grid-column-start: 2;
  }
</style>
