module.exports = async function (Server, eventArgs) {
  let tournamentConfig = eventArgs.config;

  if (process.env.PREDEFINED_BLOCKS_TESTING) {
    let now = new Date();
    let UTCTimestamp = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    );
    tournamentConfig.tournamentSignUpStart = UTCTimestamp;
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
