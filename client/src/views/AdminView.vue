<template>
  <div
    class="h-screen flex items-center justify-center flex-col"
    v-if="!connected"
  >
    <div class="card shadow-lg bg-base-100 mb-8 w-fit mx-auto">
      <div class="card-body items-center text-center">
        <h2 class="card-title">Administration panel</h2>
        <label class="input input-bordered flex items-center gap-2 mt-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            class="w-4 h-4 opacity-70"
          >
            <path
              fill-rule="evenodd"
              d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
              clip-rule="evenodd"
            />
          </svg>
          <input type="password" class="bg-transparent" v-model="password" />
        </label>
        <button class="btn btn-primary btn-block mt-2" @click="adminLogin">
          Login
        </button>
      </div>
    </div>
  </div>
  <div v-else>
    <TournamentOverview :isAdmin="true"></TournamentOverview>
  </div>
</template>

<script>
  import TournamentOverview from "../components/TournamentOverview.vue";

  export default {
    name: "AdminView",
    components: {
      TournamentOverview,
    },
    data() {
      return {
        password: "password",
        connected: false,
      };
    },
    methods: {
      adminLogin() {
        this.$socket.emit("admin_login", this.password);
      },
    },
    created() {
      this.$socket.on("admin_logged_in", (data) => {
        if (data.success) {
          this.$info("You are now logged in as admin", "Welcome");
          this.connected = true;
        } else {
          this.$error("Invalid password", "Error");
        }
      });
    },
  };
</script>
