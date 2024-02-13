<template>
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
        Step into the All-On-Chain Rock-Paper-Scissors Arena - Compete for free
        and Earn $KOIN on Koinos
      </p>
    </div>
    <CurrentTournament />
  </div>
</template>

<script>
  import CurrentTournament from "../components/CurrentTournament.vue";
  export default {
    name: "MainView",
    components: {
      CurrentTournament,
    },
  };
</script>
