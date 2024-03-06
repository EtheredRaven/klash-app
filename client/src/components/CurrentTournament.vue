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
        <div
          v-if="currentTournament.winner"
          class="rounded-md bg-success text-success-content p-4"
        >
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="inline-block mr-2 align-bottom"
          >
            <path
              d="M12.787 5.8071C13.0673 5.92318 13.25 6.19666 13.25 6.50001V10.5C13.25 10.9142 12.9142 11.25 12.5 11.25C12.0858 11.25 11.75 10.9142 11.75 10.5V8.31067L11.5303 8.53034C11.2374 8.82323 10.7626 8.82323 10.4697 8.53034C10.1768 8.23744 10.1768 7.76257 10.4697 7.46968L11.9697 5.96968C12.1842 5.75518 12.5068 5.69101 12.787 5.8071Z"
              fill="currentColor"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M7.4984 1.60719C8.66129 1.41099 10.1724 1.25 12.0002 1.25C13.8279 1.25 15.339 1.41099 16.5019 1.60719L16.6368 1.62983C17.647 1.79893 18.4866 1.93949 19.1432 2.74808C19.5643 3.26668 19.7001 3.82713 19.7314 4.45323L20.2231 4.61712C20.6862 4.77147 21.0921 4.90675 21.4142 5.05656C21.7623 5.21852 22.0814 5.42714 22.3253 5.76555C22.5692 6.10396 22.6662 6.47262 22.7097 6.85411C22.75 7.20701 22.75 7.63488 22.7499 8.12306L22.7499 8.26828C22.7499 8.67007 22.75 9.02499 22.7203 9.32179C22.6881 9.64348 22.6169 9.95621 22.4391 10.2584C22.2613 10.5607 22.0225 10.7748 21.7569 10.9591C21.5118 11.1292 21.2016 11.3015 20.8503 11.4966L18.2097 12.9637C17.6703 14.025 16.9292 14.9713 15.9101 15.6548C15.0354 16.2414 13.9881 16.6128 12.75 16.7187V18.75H14.1802C15.0144 18.75 15.7326 19.3388 15.8962 20.1568L16.1149 21.25H18C18.4142 21.25 18.75 21.5858 18.75 22C18.75 22.4142 18.4142 22.75 18 22.75H6C5.58579 22.75 5.25 22.4142 5.25 22C5.25 21.5858 5.58579 21.25 6 21.25H7.88515L8.10379 20.1568C8.26739 19.3388 8.98562 18.75 9.81981 18.75H11.25V16.7187C10.012 16.6127 8.9648 16.2414 8.09017 15.6548C7.07115 14.9713 6.33018 14.0252 5.79078 12.964L3.14962 11.4966C2.79836 11.3015 2.48813 11.1292 2.24307 10.9591C1.97748 10.7748 1.73867 10.5607 1.56083 10.2584C1.38299 9.95621 1.3118 9.64348 1.27965 9.32179C1.24999 9.02497 1.25 8.67008 1.25001 8.26827L1.25 8.12304C1.24996 7.63488 1.24992 7.20701 1.2902 6.85411C1.33375 6.47262 1.43076 6.10396 1.67466 5.76555C1.91857 5.42714 2.23762 5.21852 2.58577 5.05656C2.90781 4.90675 3.31373 4.77147 3.77686 4.61712L4.26891 4.4531C4.30023 3.82706 4.43608 3.26664 4.85712 2.74808C5.51366 1.93949 6.35333 1.79893 7.36355 1.62983L7.4984 1.60719ZM9.41486 21.25H14.5852L14.4253 20.451C14.402 20.3341 14.2994 20.25 14.1802 20.25H9.81981C9.70064 20.25 9.59804 20.3341 9.57467 20.451L9.41486 21.25ZM4.3021 6.02318C4.37367 7.54348 4.5454 9.22376 4.97298 10.7937L3.90729 10.2016C3.51814 9.98542 3.27447 9.84906 3.09829 9.72679C2.93588 9.61407 2.88298 9.54762 2.85363 9.49774C2.82428 9.44786 2.79187 9.36934 2.77221 9.17263C2.75089 8.95925 2.75002 8.68002 2.75001 8.23484L2.75001 8.16231C2.74999 7.62323 2.75111 7.28191 2.78053 7.02422C2.80775 6.7857 2.85231 6.69703 2.89154 6.6426C2.93077 6.58817 3.0008 6.51786 3.21847 6.4166C3.45362 6.3072 3.77708 6.19819 4.28849 6.02772L4.3021 6.02318ZM19.0274 10.7934L20.0927 10.2016C20.4818 9.98542 20.7255 9.84906 20.9016 9.72679C21.0641 9.61407 21.117 9.54762 21.1463 9.49774C21.1757 9.44786 21.2081 9.36934 21.2277 9.17263C21.2491 8.95925 21.2499 8.68002 21.2499 8.23484L21.2499 8.16231C21.25 7.62323 21.2488 7.28191 21.2194 7.02422C21.1922 6.7857 21.1476 6.69703 21.1084 6.6426C21.0692 6.58817 20.9991 6.51786 20.7815 6.4166C20.5463 6.3072 20.2229 6.19819 19.7115 6.02772L19.6982 6.0233C19.6266 7.54349 19.4549 9.22363 19.0274 10.7934ZM12.0002 2.75C10.2608 2.75 8.83319 2.90319 7.74796 3.08629C6.54104 3.28992 6.28751 3.3661 6.02161 3.69358C5.75956 4.01632 5.73468 4.32156 5.78848 5.67672C5.87815 7.93537 6.1761 10.3727 7.09884 12.2264C7.55432 13.1414 8.14983 13.8887 8.92569 14.409C9.69656 14.9261 10.6911 15.25 12.0002 15.25C13.3092 15.25 14.3037 14.9261 15.0746 14.409C15.8505 13.8887 16.446 13.1414 16.9015 12.2264C17.8242 10.3727 18.1222 7.93537 18.2118 5.67672C18.2656 4.32156 18.2407 4.01632 17.9787 3.69358C17.7128 3.3661 17.4593 3.28992 16.2524 3.08629C15.1671 2.90319 13.7395 2.75 12.0002 2.75Z"
              fill="currentColor"
            />
          </svg>
          <a
            :href="'https://koiner.app/addresses/' + currentTournament.winner"
            target="_blank"
          >
            {{ shortenAddress(currentTournament.winner) }}</a
          >
        </div>
        <button
          v-else-if="
            signUpEndCountdown.h <= 0 &&
            signUpEndCountdown.m <= 0 &&
            signUpEndCountdown.s <= 0
          "
          class="btn btn-neutral btn-outline no-animation cursor-default inactive-btn btn-wide btn-error"
        >
          Sign-ups are closed!
        </button>
        <button
          class="btn btn-neutral btn-outline no-animation cursor-default inactive-btn btn-wide"
          v-else-if="!activeAccountAddress"
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
  import { shortenAddress } from "../utils/formatting";

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
      shortenAddress,
    },
    beforeUnmount() {
      clearInterval(this.updateCountdownInterval);
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
