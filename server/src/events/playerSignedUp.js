module.exports = async function (Server, eventArgs) {
  const playerAddress = eventArgs.player;
  const tournamentId = eventArgs.tournamentId;

  await Server.db.run(
    "INSERT OR REPLACE INTO signed_up_players VALUES (?, ?)",
    [playerAddress, tournamentId]
  );

  if (Server.currentTournament.id == tournamentId) {
    await Server.updateSignedUpPlayersFromDb();
    Server.emitPlayerSignedUp(playerAddress);
  }
};
