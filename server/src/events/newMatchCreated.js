const insertMatch = require("../../db/insertMatch");

module.exports = async function (Server, eventArgs) {
  await insertMatch(Server, eventArgs.match);

  // Delete if one of the players was waiting for a match, both in the object and in the database
  let waitingPlayers =
    Server.currentTournament.rounds[Server.currentTournament.currentRound - 1]
      .waitingPlayers;
  let waitingPlayerIndex = waitingPlayers.findIndex(
    (player) =>
      player.address == eventArgs.match.player1.address ||
      player.address == eventArgs.match.player2.address
  );
  if (waitingPlayerIndex != -1) {
    waitingPlayers.splice(waitingPlayerIndex, 1);
  }
  await Server.db.run(
    `DELETE FROM waiting_players WHERE (address = ? OR address = ?) AND tournament_id = ? AND round_number = ?`,
    [
      eventArgs.match.player1.address,
      eventArgs.match.player2.address,
      Server.currentTournament.id,
      Server.currentTournament.currentRound,
    ]
  );
};
