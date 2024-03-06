const { getUTCTimestamp } = require("../utils");

module.exports = async function (Server, eventArgs) {
  let tournamentConfig = eventArgs.config;

  if (process.env.PREDEFINED_BLOCKS_TESTING) {
    tournamentConfig.tournamentSignUpStart = getUTCTimestamp();
  }

  await Server.db.run(
    "INSERT OR REPLACE INTO tournaments VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      tournamentConfig.tournamentId,
      tournamentConfig.config.prize,
      tournamentConfig.config.signUpDuration,
      tournamentConfig.tournamentSignUpStart,
      null,
      null,
      null,
    ]
  );
  await Server.updateCurrentTournamentFromDb();
  Server.emitTournamentCreated(Server.currentTournament);
  Server.infoLogging("Created tournament", tournamentConfig.tournamentId);
};
