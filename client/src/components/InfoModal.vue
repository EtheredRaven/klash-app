<template>
  <dialog :id="id" class="modal text-left">
    <div class="modal-box">
      <h3 class="font-bold text-lg text-primary">{{ info.title }}</h3>
      <p class="py-4 tex-secondary">
        {{ info.message
        }}<KlashIcon v-if="info.icon1" :icon="info.icon1" inline small />{{
          info.textBetween
        }}<KlashIcon v-if="info.icon2" :icon="info.icon2" inline small />
      </p>
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script>
  import KlashIcon from "./KlashIcon.vue";

  export default {
    name: "InfoModal",
    components: {
      KlashIcon,
    },
    props: {
      info: {
        type: Object,
        required: true,
      },
    },
  };
</script>
