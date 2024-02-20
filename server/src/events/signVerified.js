module.exports = async function (Server, eventArgs) {
  const { isPlayer1, match } = eventArgs;
  const {
    player1,
    player2,
    score1,
    score2,
    winner,
    round,
    tournamentId,
    sign1,
    sign2,
  } = match;
  const player1Address = player1.address;
  const lastActionTimestamp1 = player1.lastActionTimestamp;
  const player2Address = player2.address;
  const lastActionTimestamp2 = player2.lastActionTimestamp;
  const player1Sign = sign1?.sign;
  const player1SignHash = sign1?.signHash;
  const player2Sign = sign2?.sign;
  const player2SignHash = sign2?.signHash;

  await Server.db.run(
    `UPDATE matches SET player_1 = ?, player_2 = ?, score_1 = ?, score_2 = ?, winner = ?, last_action_timestamp_1 = ?, last_action_timestamp_2 = ?, sign_1 = ?, sign_hash_1 = ?, sign_2 = ?, sign_hash_2 = ? WHERE tournament_id = ? AND round_number = ? AND player_1 = ? AND player_2 = ?`,
    [
      player1Address,
      player2Address,
      score1,
      score2,
      winner,
      lastActionTimestamp1,
      lastActionTimestamp2,
      player1Sign,
      player1SignHash,
      player2Sign,
      player2SignHash,
      tournamentId,
      round,
      player1Address,
      player2Address,
    ]
  );
  let updatedMatch = await Server.db.get(
    `SELECT * FROM matches WHERE tournament_id = ? AND round_number = ? AND player_1 = ? AND player_2 = ?`,
    [tournamentId, round, player1Address, player2Address]
  );

  await Server.updateCurrentTournamentFromDb();
  Server.emitSignVerified(updatedMatch, isPlayer1);
};
