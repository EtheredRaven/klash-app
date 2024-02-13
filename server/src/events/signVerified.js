module.exports = async function (Server, eventArgs) {
  const { player, sign, timestamp, round, tournamentId, isPlayer1 } = eventArgs;

  let playerNumber = isPlayer1 ? 1 : 2;
  await Server.db.run(
    `UPDATE matches SET sign_${playerNumber} = ?, last_action_timestamp_${playerNumber} = ? WHERE tournament_id = ? AND player_${playerNumber} = ? AND round_number = ?`,
    [sign, timestamp, tournamentId, player, round]
  );
  let updatedMatch = await Server.db.get(
    `SELECT * FROM matches WHERE tournament_id = ? AND player_${playerNumber} = ? AND round_number = ?`,
    [tournamentId, player, round]
  );

  await Server.updateCurrentTournamentFromDb(); // TODO - only update the match
  Server.emitSignVerified(updatedMatch, isPlayer1);
};
