module.exports = async function (Server, eventArgs) {
  const { player, tournamentId } = eventArgs;

  await Server.db.run(
    `INSERT OR REPLACE INTO waiting_players VALUES (?, ?, ?)`,
    [player.address, Server.currentTournament.currentRound, tournamentId]
  );
};
