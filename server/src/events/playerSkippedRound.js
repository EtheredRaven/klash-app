module.exports = async function (Server, eventArgs) {
  const { player, tournamentId } = eventArgs;

  await Server.db.run(
    `INSERT OR REPLACE INTO waiting_players VALUES (?, ?, ?)`,
    [player, Server.currentTournament.currentRound, tournamentId]
  );

  await Server.updateCurrentTournamentFromDb();
  Server.emitPlayerWaiting(player.address);
};
