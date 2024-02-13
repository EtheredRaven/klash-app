const Constants = require("../constants");

module.exports = async function (Server, eventArgs) {
  const { player, signHash, timestamp, round, tournamentId, isPlayer1 } =
    eventArgs;

  let playerNumber = isPlayer1 ? 1 : 2;
  await Server.db.run(
    `UPDATE matches SET sign_${playerNumber} = ?, sign_hash_${playerNumber} = ?, last_action_timestamp_${playerNumber} = ? WHERE tournament_id = ? AND player_${playerNumber} = ? AND round_number = ?`,
    [Constants.UNKNOWN_SIGN, signHash, timestamp, tournamentId, player, round]
  );
  let updatedMatch = await Server.db.get(
    `SELECT * FROM matches WHERE tournament_id = ? AND player_${playerNumber} = ? AND round_number = ?`,
    [tournamentId, player, round]
  );

  await Server.updateCurrentTournamentFromDb(); // TODO - only update the match
  Server.emitSignPlayed(updatedMatch, isPlayer1);
};
