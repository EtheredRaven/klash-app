<template>
  <div class="h-screen flex items-center justify-center flex-col" v-if="!connected">
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
          <input
            type="password"
            class="bg-transparent"
            v-model="password"
          />
        </label>
        <button class="btn btn-primary btn-block mt-2" @click="adminLogin">
          Login
        </button>
      </div>
    </div>
  </div>
  <div v-else class="h-screen w-screen">
    <div class="grid gap-4 pt-20 px-4 pb-8">
      <div class="card shadow-lg bg-base-100 row-start-1 row-end-3 col-span-1">
        <div class="card-body items-center text-center">
            <h2 class="card-title">⚙️ Current tournament parameters</h2>
          <div v-if="currentTournament" class="overflow-x-auto mt-4">
            <table class="table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="parameter in tournamentParameters">
                  <td class="font-bold">{{ parameter.name }}</td>
                  <td  v-html="parameter.value" />
                </tr>
              </tbody>
            </table>
          </div>
          <button v-if="currentTournament && !currentTournament.start_timestamp" @click="startCurrentTournament"
          :class="{'btn btn-primary btn-block mt-4': true, 'btn-disabled': !canTournamentBeStarted}">
            {{ canTournamentBeStarted ? "Start the tournament" : "Sign-up period not over" }}
          </button>
          <button
          
            class="btn btn-primary btn-block mt-4"
            @click="openCreateNewTournamentModal"
          >
            Create a new tournament
          </button>
        </div>
      </div>
      <div v-if="connected && currentTournament && currentTournament.start_timestamp" class="card shadow-lg bg-base-100 col-start-2 col-end-3 row-start-1 row-end-2" >
        <div class="card-body items-center text-center">
          <h2 class="card-title">🔄 Rounds</h2>
          <div class="overflow-x-auto mt-4">
              <table class="table">
                <thead>
                  <tr>
                    <th>Round</th>
                    <th>Start</th>
                    <th>Matches number</th>
                    <th>Waiting players</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="round in currentTournament.rounds.filter(round => round.start_timestamp)">
                    <td class="font-bold">{{ round.round_number }}</td>
                    <td>{{ new Date(round.start_timestamp).toLocaleString() }}</td>
                    <td>{{ round?.match_count || 0 }}</td>
                    <td><span v-for="player in round.waitingPlayers" v-html="getAddressLink(player.address)"/></td>
                  </tr>
                </tbody>
              </table>
          </div>
        </div>
      </div>
      <div v-if="connected && currentTournament && currentTournament.start_timestamp" class="card shadow-lg bg-base-100 col-start-2 col-end-3 row-start-2 row-end-3" >
        <div class="card-body items-center text-center">
          <h2 class="card-title">⚔️ Matches - Current round #{{ currentTournament.currentRound }}</h2>
          <div class="overflow-x-auto mt-4">
            <table class="table">
              <thead>
                <tr>
                  <th>Player 1</th>
                  <th>Player 2</th>
                  <th>Score</th>
                  <th>Match status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="match in currentTournament.rounds[currentTournament.currentRound-1].matches">
                  <td v-for="playerNumber in [1, 2]">
                    <span v-html="getAddressLink(match[`player_${playerNumber}`])" />
                    <span v-if="match.winner == MATCH_NOT_FINISHED">
                      <br/>
                      <span class="text-xs">{{ getLastActionString(match, playerNumber) }}</span>
                      <br/>
                      <span v-if="IS_WAITING_FOR_OPPONENT(match, playerNumber)" class="text-xs">Waiting for opponent</span>
                      <span v-else>
                        <span v-if="getTimeoutStatus(match, playerNumber) === SERVER_TIMING_OUT" class="text-xs"><span class="loading loading-spinner loading-xs"></span> Server auto-timing out</span>
                        <span v-else-if="getTimeoutStatus(match, playerNumber) === SERVER_FAILED_TO_TIMEOUT" class="text-xs text-error">❌ Server failed to auto-timeout<br/>
                        <button class="btn btn-xs btn-error btn-outline mt-1" @click="forceTimeout(match[`player_${playerNumber}`])">Force timeout</button>
                        </span>
                        <span v-else-if="getTimeoutStatus(match, playerNumber) !== CANNOT_TIMEOUT" class="text-xs">⌛ {{ getTimeoutStatus(match, playerNumber) }} before auto-timeout</span>
                      </span>
                    </span>
                  </td>
                  <td>{{ match.score_1 }} - {{ match.score_2 }}</td>
                  <td>{{ getMatchStatusString(match.winner) || "Not played yet" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
      </div> 
      </div>
    </div>
  </div>

  <dialog id="adminModal" class="modal text-left">
    <div class="modal-box">
      <h3 class="font-bold text-lg text-primary">{{ modalTitle }}</h3>
      <p class="py-4 tex-secondary">
        <div v-if="modalTitle == 'New tournament'">
          <label class="form-control w-full max-w-xs">
            <div class="label">
              <span class="label-text">Prize (in $KOIN)</span>
            </div>
            <input placeholder="$KOIN amount" class="input input-bordered w-full max-w-xs" type="number" v-model="newTournamentPrize" />
          </label>
          <label class="form-control w-full max-w-xs">
            <div class="label">
              <span class="label-text">Signup duration (in hours)</span>
            </div>
            <input placeholder="Duration (h)" class="input input-bordered w-full max-w-xs" type="number" v-model="newTournamentDuration" />
          </label>
          <button
            class="btn btn-primary btn-wide mt-4"
            @click="createNewTournament">
            Create a new tournament
          </button>
        </div>
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
import { formatChainError, getAddressLink } from "../utils/formatting.js";
import { getUTCTime } from "../utils/dateTime.js";
import { MATCH_STATUS_TO_STRING, SIGN_INTEGER_TO_STRING, TIMEOUT_DURATION, MATCH_NOT_FINISHED, IS_WAITING_FOR_OPPONENT  } from "../utils/constants.js";
const estimatedTimeForServerToTimeout = 60000; // 1 minute

  export default {
    name: "AdminView",
    data() {
      return {
        password: "password",
        currentTournament: null,
        connected: false,
        modalTitle: "",
        newTournamentPrize: null,
        newTournamentDuration: null,
        utcTimeUpdateInterval: null,
        currentUTCTime: getUTCTime(),
        CANNOT_TIMEOUT: 0,
        SERVER_TIMING_OUT: 1,
        SERVER_FAILED_TO_TIMEOUT: 2,
        MATCH_NOT_FINISHED
      };
    },
    methods: {
      getMatchStatusString(status) {
        return MATCH_STATUS_TO_STRING(status);
      },
      IS_WAITING_FOR_OPPONENT,
      getAddressLink,
      getLastActionString(match, playerNumber){
        let s = ""
        if (match[`last_action_timestamp_${playerNumber}`]) {
          s+= `[${new Date(match[`last_action_timestamp_${playerNumber}`]).toLocaleTimeString()}] - `;
          let signPlayed = match[`sign_${playerNumber}`];
          let signHash = match[`sign_hash_${playerNumber}`];
          if(signPlayed) {
            s+= `Sign played: ${SIGN_INTEGER_TO_STRING(signPlayed, true)}`;
          } else if(signHash) {
            s+= `Sign hash submitted`;
          } else {
            s+= "New round/match started";
          }
        }
        return s;
      },
      getTimeoutStatus(match, playerNumber) { 
        let lastActionTimestamp = match[`last_action_timestamp_${playerNumber}`];
        if (lastActionTimestamp) {
          let timeSinceLastAction = this.currentUTCTime - lastActionTimestamp;
          if (timeSinceLastAction > TIMEOUT_DURATION + estimatedTimeForServerToTimeout) {
            return this.SERVER_FAILED_TO_TIMEOUT;
          } else if (timeSinceLastAction > TIMEOUT_DURATION) {
            return this.SERVER_TIMING_OUT;
          }
          return new Date(TIMEOUT_DURATION - timeSinceLastAction).toUTCString().split(" ")[4];
        }
        return this.CANNOT_TIMEOUT;
      },
      async forceTimeout(playerAddress) {
        try {
          const { transaction } = await this.$store.state.klashContract.timeout_player({player: playerAddress}, {
            rcLimit: 100000000,
            payer: window.Client.klashContractAddress,
            payee: this.activeAccountAddress,
          });
          this.$info("Transaction sent to the blockchain!", "Forcing timeout");
          await transaction.wait("byBlock", 30000);
          this.$transactionInfo("Timeout successful !", transaction);
        } catch (err) {
          this.$error(formatChainError(err), "Forcing timeout failed !");
        }
      },
      adminLogin() {
        this.$socket.emit("admin_login", this.password);
      },
      openCreateNewTournamentModal() {
        this.modalTitle = "New tournament";
        document.getElementById("adminModal").showModal();
      },
      async createNewTournament() {
        document.getElementById("adminModal").close();
        try {
          const { transaction } = await this.$store.state.klashContract.create_tournament(
            {
              config: {
                prize: this.newTournamentPrize*100000000,
                signUpDuration: this.newTournamentDuration*60*60*1000,
              },
            },
            {
              rcLimit: 100000000,
              payer: window.Client.klashContractAddress,
              payee: this.activeAccountAddress,
            }
          );
          this.$info("Transaction sent to the blockchain!", "Creating new tournament");
          await transaction.wait("byBlock", 30000);
          this.$transactionInfo("New tournament creation successful !", transaction);
        } catch (err) {
          this.$error(formatChainError(err), "Sign up failed !");
        }
      },
      async startCurrentTournament() {
        try {
          const { transaction } = await this.$store.state.klashContract.start_tournament(undefined, 
          {
            rcLimit: 100000000,
            payer: window.Client.klashContractAddress,
            payee: this.activeAccountAddress,
          });
          this.$info("Transaction sent to the blockchain!", "Starting the tournament");
          await transaction.wait("byBlock", 30000);
          this.$transactionInfo("Tournament started successfully !", transaction);
        } catch (err) {
          this.$error(formatChainError(err), "Starting the tournament failed !");
        }
      },
    },
    computed: {
      tournamentParameters() {
        let parameters = [
          { name: "🆔 Id", value: "#"+this.currentTournament.id },
          { name: "🏆 Prize", value: (this.currentTournament.prize/100000000)+" $KOIN" },
          { name: "🕜 Sign-up start", value: new Date(this.currentTournament.sign_up_start).toLocaleString() },
          { name: "⏱️ Sign-up duration", value: this.currentTournament.sign_up_duration/3600000+" hours" },
          { name: "⌛ Sign-up end", value: new Date(this.currentTournament.sign_up_start + this.currentTournament.sign_up_duration).toLocaleString()},
        ];

        this.currentTournament.players && parameters.push({ name: "👤 Signed-up players", value: this.currentTournament.players.length });
        this.currentTournament.start_timestamp && parameters.push({ name: "🏁 Tournament start", value: new Date(this.currentTournament.start_timestamp).toLocaleString() });
        this.currentTournament.end_timestamp && parameters.push({ name: "🔚 Tournament end", value: new Date(this.currentTournament.end_timestamp).toLocaleString() });
        this.currentTournament.winner && parameters.push({ name: "🏅 Winner", value: getAddressLink(this.currentTournament.winner) });
        return parameters
      },
      canTournamentBeStarted() {
        return this.currentTournament && !this.currentTournament.start_timestamp && this.currentUTCTime > this.currentTournament.sign_up_start + this.currentTournament.sign_up_duration;
      },
      activeAccountAddress() {
        return this.$store.state.activeAccount?.address;
      },
    },
    created() {
      this.$socket.on("admin_logged_in", (data) => {
        if (data.success) {
          this.$info("You are now logged in as admin", "Welcome");
          this.currentTournament = data.currentTournament;
          this.connected = true;
        } else {
          this.$error("Invalid password", "Error")
        }
      });

      this.$socket.on("admin_tournament_updated", (data) => {
        this.currentTournament = data;
      });

      this.utcTimeUpdateInterval = setInterval(() => {
        this.currentUTCTime = getUTCTime();
      }, 1000);
    },
    beforeUnmount() {
      clearInterval(this.utcTimeUpdateInterval);
    },
  };
</script>

<style>
.loading-spinner {
  vertical-align: sub;
  margin-right: 2px;
}
</style>
