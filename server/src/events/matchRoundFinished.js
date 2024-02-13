module.exports = async function (Server, eventArgs) {
  const { score1, score2, winner, round, tournamentId, player1, player2 } =
    eventArgs.match;

  await Server.db.run(
    `UPDATE matches SET score_1 = ?, score_2 = ?, winner = ?, last_action_timestamp_1 = ?, last_action_timestamp_2 = ?, sign_hash_1 = ?, sign_1 = ?, sign_hash_2 = ?, sign_2 = ? WHERE tournament_id = ? AND player_1 = ? AND player_2 = ? AND round_number = ?`,
    [
      score1,
      score2,
      winner,
      player1.lastActionTimestamp,
      player2.lastActionTimestamp,
      null,
      null,
      null,
      null,
      tournamentId,
      player1.address,
      player2.address,
      round,
    ]
  );
  let updatedMatch = await Server.db.get(
    `SELECT * FROM matches WHERE tournament_id = ? AND player_1 = ? AND player_2 = ? AND round_number = ?`,
    [tournamentId, player1.address, player2.address, round]
  );

  await Server.updateCurrentTournamentFromDb();
  Server.emitMatchRoundFinished(updatedMatch);
};
