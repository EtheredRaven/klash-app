module.exports = async function (Server, eventArgs) {
  const { winner, round, tournamentId, player1, player2 } = eventArgs.match;

  await Server.db.run(
    `UPDATE matches SET winner = ? WHERE tournament_id = ? AND round_number = ? AND player_1 = ? AND player_2 = ?`,
    [winner, tournamentId, round, player1.address, player2.address]
  );
  let updatedMatch = await Server.db.get(
    `SELECT * FROM matches WHERE tournament_id = ? AND round_number = ? AND player_1 = ? AND player_2 = ?`,
    [tournamentId, round, player1.address, player2.address]
  );

  await Server.updateCurrentTournamentFromDb();
  Server.emitMatchFinished(updatedMatch);
};
