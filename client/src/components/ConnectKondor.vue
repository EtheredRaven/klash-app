<template>
  <div>
    <button
      class="btn btn-neutral btn-outline no-animation cursor-default inactive-btn"
      v-if="kondorWallet && activeAccountAddress"
    >
      {{ shortenAddress(activeAccountAddress) }}
      <span class="cursor-pointer" @click="copyAddress">
        <svg
          width="24px"
          height="24px"
          viewBox="0 -0.5 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M8.94605 4.99995L13.2541 4.99995C14.173 5.00498 15.0524 5.37487 15.6986 6.02825C16.3449 6.68163 16.7051 7.56497 16.7001 8.48395V12.716C16.7051 13.6349 16.3449 14.5183 15.6986 15.1717C15.0524 15.825 14.173 16.1949 13.2541 16.2H8.94605C8.02707 16.1949 7.14773 15.825 6.50148 15.1717C5.85522 14.5183 5.495 13.6349 5.50005 12.716L5.50005 8.48495C5.49473 7.5658 5.85484 6.6822 6.50112 6.0286C7.1474 5.375 8.0269 5.00498 8.94605 4.99995Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M10.1671 19H14.9371C17.4857 18.9709 19.5284 16.8816 19.5001 14.333V9.666"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>

      <span class="cursor-pointer" @click="unlinkKondor">
        <svg
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <g
            id="Page-1"
            stroke="none"
            stroke-width="1"
            fill="none"
            fill-rule="evenodd"
          >
            <g id="Session-Leave">
              <rect
                id="Rectangle"
                fill-rule="nonzero"
                x="0"
                y="0"
                width="24"
                height="24"
              ></rect>
              <line
                x1="9"
                y1="12"
                x2="19"
                y2="12"
                id="Path"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              ></line>
              <path
                d="M16,8 L18.5858,10.5858 C19.3668,11.3668 19.3668,12.6332 18.5858,13.4142 L16,16"
                id="Path"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>
              <path
                d="M16,4 L6,4 C4.89543,4 4,4.89543 4,6 L4,18 C4,19.1046 4.89543,20 6,20 L16,20"
                id="Path"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>
            </g>
          </g>
        </svg>
      </span>
    </button>
    <button v-else class="btn btn-neutral" @click="connectToKondor">
      Connect to Kondor
    </button>
  </div>
</template>

<script>
  export default {
    computed: {
      activeAccountAddress: function () {
        return this.$store.state.activeAccount?.address;
      },
      walletList: function () {
        return this.$store.state.walletsList;
      },
      kondorWallet: function () {
        let kondorWallet =
          this.$store.state.walletsList.find(
            (wallet) => wallet.name === "Kondor"
          ) || null;

        if (kondorWallet) {
          this.$store.dispatch("unlockWallet", { name: "Kondor" });
        }

        return kondorWallet;
      },
    },
    methods: {
      connectToKondor() {
        this.$store.dispatch("linkKondor");
      },
      shortenAddress: function (addr) {
        return addr.substr(0, 10) + "..." + addr.slice(-5);
      },
      copyAddress() {
        navigator.clipboard.writeText(this.activeAccountAddress);
        this.$info("Address copied to clipboard");
      },
      unlinkKondor() {
        this.$store.dispatch("unlinkKondor");
      },
    },
  };
</script>

<style>
  .inactive-btn:hover {
    background: transparent;
    color: var(--fallback-bc, oklch(var(--bc) / var(--tw-text-opacity)));
  }
</style>
