const { getUTCTimestamp } = require("../utils");
const insertTournament = require("../../db/insertTournament");

module.exports = async function (Server, eventArgs) {
  let tournamentConfig = eventArgs.config;

  if (process.env.PREDEFINED_BLOCKS_TESTING) {
    tournamentConfig.tournamentSignUpStart = getUTCTimestamp();
  }

  await insertTournament(Server, tournamentConfig, false);
  await Server.updateCurrentTournamentFromDb();

  let timeoutDuration =
    parseInt(tournamentConfig.tournamentSignUpStart) +
    parseInt(tournamentConfig.config.signUpDuration) +
    1000 -
    getUTCTimestamp();
  setTimeout(async () => {
    try {
      await Server.klashContract.functions.start_tournament({});
      Server.infoLogging("Starting tournament", tournamentConfig.tournamentId);
    } catch (error) {
      Server.errorLogging(
        "Error calling start_tournament",
        tournamentConfig.tournamentId,
        error
      );
    }
  }, timeoutDuration + 60000);
  Server.infoLogging(
    "Set timeout for tournament start",
    tournamentConfig.tournamentId,
    timeoutDuration
  );

  Server.emitTournamentCreated(Server.currentTournament);
  Server.infoLogging("Created tournament", tournamentConfig.tournamentId);
};
