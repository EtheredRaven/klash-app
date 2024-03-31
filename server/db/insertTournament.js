const { getUTCTimestamp } = require("../src/utils");

module.exports = async function (
  Server,
  tournamentConfig,
  checkIfExists = true
) {
  // Check if a tournament with this id already exists
  let tournament = {};
  if (checkIfExists) {
    tournament =
      (await Server.db.get("SELECT * FROM tournaments WHERE id = ?", [
        tournamentConfig.tournamentId,
      ])) || {};
  }

  if (!tournament.start_timestamp && tournamentConfig?.isTournamentStarted)
    tournament.start_timestamp = getUTCTimestamp();

  await Server.db.run(
    "INSERT OR REPLACE INTO tournaments VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      tournamentConfig.tournamentId,
      tournamentConfig.config.prize,
      tournamentConfig.config.signUpDuration,
      tournamentConfig.tournamentSignUpStart,
      tournament?.start_timestamp || null,
      tournament?.end_timestamp || null,
      tournament?.winner || null,
    ]
  );
};
