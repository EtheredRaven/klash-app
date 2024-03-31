<template>
  <div class="absolute top-4 left-4">
    <button
      @click="syncWithBlockchain"
      :class="['btn', 'btn-ghost', 'btn-active', { 'btn-square': isMobile }]"
    >
      <svg
        fill="currentColor"
        viewBox="0 0 24 24"
        class="h-6 w-6"
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
            id="primary"
            d="M4,12A8,8,0,0,1,18.93,8"
            style="
              fill: none;
              stroke: #000000;
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-width: 2;
            "
          ></path>
          <path
            id="primary-2"
            data-name="primary"
            d="M20,12A8,8,0,0,1,5.07,16"
            style="
              fill: none;
              stroke: #000000;
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-width: 2;
            "
          ></path>
          <polyline
            id="primary-3"
            data-name="primary"
            points="14 8 19 8 19 3"
            style="
              fill: none;
              stroke: #000000;
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-width: 2;
            "
          ></polyline>
          <polyline
            id="primary-4"
            data-name="primary"
            points="10 16 5 16 5 21"
            style="
              fill: none;
              stroke: #000000;
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-width: 2;
            "
          ></polyline>
        </g>
      </svg>
      <span v-if="!isMobile"> Sync with blockchain</span>
    </button>
  </div>
</template>

<script>
  import { syncWithBlockchain } from "../services/syncWithBlockchain.js";

  export default {
    name: "LocalSync",
    methods: {
      async syncWithBlockchain() {
        await syncWithBlockchain(this);
      },
    },
    computed: {
      isMobile() {
        return window.innerWidth < 500;
      },
    },
  };
</script>
