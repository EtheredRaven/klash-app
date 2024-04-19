const { MATCH_PLAYER_1_WON } = require("../constants");

module.exports = async function (Server, eventArgs) {
  const { match } = eventArgs;
  const { player1, player2, winner, tournamentId } = match;

  const winnerAddress =
    winner == MATCH_PLAYER_1_WON ? player1.address : player2.address;
  const endTimestamp = Math.max(
    player1.lastActionTimestamp,
    player2.lastActionTimestamp,
    Server.currentTournament.rounds[Server.currentTournament.currentRound - 1]
      .start_timestamp
  );
  await Server.db.run(
    `UPDATE tournaments SET winner = ?, end_timestamp = ? WHERE id = ?`,
    [winnerAddress, endTimestamp, tournamentId]
  );

  // Send the prize to the winner
  const prize = Server.currentTournament.prize;

  try {
    await Server.koinContract.functions.transfer(
      {
        from: Server.koinContract.signer.address,
        to: winnerAddress,
        value: prize,
      },
      {
        rcLimit: 100000000,
      }
    );
    Server.infoLogging(
      `Prize of ${prize} KOIN sent to the winner`,
      winnerAddress
    );
  } catch (error) {
    Server.errorLogging(
      "Error sending the prize to the winner",
      winnerAddress,
      prize,
      error
    );
  }

  await Server.updateCurrentTournamentFromDb();
  Server.emitTournamentFinished();
};
