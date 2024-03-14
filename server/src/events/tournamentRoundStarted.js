module.exports = async function (Server, eventArgs) {
  const { timestamp, round, tournamentId } = eventArgs;
  if (round <= 1) return; // This is already taken into account in tournamentStarted.js

  await Server.db.run(
    `UPDATE rounds SET start_timestamp = ? WHERE tournament_id = ? AND round_number = ?`,
    [timestamp, tournamentId, round]
  );

  Server.resetTimeouts();
  await Server.updateCurrentTournamentFromDb();
  Server.emitTournamentRoundStarted(Server.currentTournament.currentRound);
};
