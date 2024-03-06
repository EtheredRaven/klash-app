const { MATCH_PLAYER_1_WON } = require("../constants");

module.exports = async function (Server, eventArgs) {
  const { match } = eventArgs;
  const { player1, player2, winner, tournamentId } = match;

  console.log(match);

  const winnerAddress =
    winner == MATCH_PLAYER_1_WON ? player1.address : player2.address;
  const endTimestamp = Math.max(
    player1.lastActionTimestamp,
    player2.lastActionTimestamp
  );
  await Server.db.run(
    `UPDATE tournaments SET winner = ?, end_timestamp = ? WHERE id = ?`,
    [winnerAddress, endTimestamp, tournamentId]
  );

  await Server.updateCurrentTournamentFromDb();
  Server.emitTournamentFinished();
};
