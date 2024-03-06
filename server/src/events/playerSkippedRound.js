module.exports = async function (Server, eventArgs) {
  const { player, tournamentId } = eventArgs;

  await Server.db.run(
    `INSERT OR REPLACE INTO waiting_players VALUES (?, ?, ?)`,
    [player, Server.currentTournament.currentRound + 1, tournamentId]
  );

  await Server.updateWaitingPlayersFromDb();
  Server.emitPlayerWaiting(player.address);
};
