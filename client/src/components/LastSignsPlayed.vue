<template>
  <ul class="timeline mt-8">
    <li v-for="(round, index) in lastSignsPlayed" :key="index">
      <hr v-if="index > 0" />
      <div class="timeline-start mb-2">
        <span class="stat-value text-sm">{{ round.opponentScore }}</span>
        <KlashIcon :icon="round.opponentSign" small />
      </div>
      <div class="timeline-middle">
        <svg
          v-if="round.winner == 1"
          viewBox="70 70 954 954"
          class="w-5 h-5 text-green-700"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              fill="currentColor"
              d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336L456.192 600.384z"
            ></path>
          </g>
        </svg>
        <svg
          v-else-if="round.winner == 2"
          fill="currentColor"
          height="200px"
          width="200px"
          class="w-5 h-5 text-red-700"
          version="1.1"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 511.76 511.76"
          xml:space="preserve"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <g>
              <g>
                <path
                  d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048 c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251 l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251 c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165 c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0 c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                ></path>
              </g>
            </g>
          </g>
        </svg>
        <svg
          class="w-5 h-5 text-gray-600"
          v-else-if="round.winner == 0"
          fill="currentColor"
          viewBox="4 4 50 50"
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
          stroke-width="0.00056"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M 27.9999 51.9063 C 41.0546 51.9063 51.9063 41.0781 51.9063 28 C 51.9063 14.9453 41.0312 4.0937 27.9765 4.0937 C 14.8983 4.0937 4.0937 14.9453 4.0937 28 C 4.0937 41.0781 14.9218 51.9063 27.9999 51.9063 Z M 18.6952 25.3516 C 17.4296 25.3516 16.5624 24.7422 16.5624 23.5 C 16.5624 22.2344 17.3827 21.6016 18.6952 21.6016 L 37.2109 21.6016 C 38.5468 21.6016 39.3436 22.2344 39.3436 23.5 C 39.3436 24.7422 38.4999 25.3516 37.2109 25.3516 Z M 18.6952 34.4688 C 17.4296 34.4688 16.5624 33.8359 16.5624 32.5937 C 16.5624 31.3281 17.3827 30.6953 18.6952 30.6953 L 37.2109 30.6953 C 38.5468 30.6953 39.3436 31.3281 39.3436 32.5937 C 39.3436 33.8359 38.4999 34.4688 37.2109 34.4688 Z"
            ></path>
          </g>
        </svg>
      </div>
      <div class="timeline-end mt-2">
        <KlashIcon :icon="round.playerSign" small />
        <span class="stat-value text-sm">{{ round.playerScore }}</span>
      </div>
      <hr v-if="index < lastSignsPlayed.length - 1" />
    </li>
  </ul>
</template>
<script>
  import KlashIcon from "./KlashIcon.vue";

  export default {
    name: "LastSignsPlayed",
    components: {
      KlashIcon,
    },
    computed: {
      lastSignsPlayed() {
        return this.$store.state.lastRoundSigns;
      },
    },
  };
</script>
