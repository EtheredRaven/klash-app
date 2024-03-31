const insertMatch = require("../../db/insertMatch");
const insertRound = require("../../db/insertRound");
const insertWaitingPlayer = require("../../db/insertWaitingPlayer");

module.exports = async function (Server, eventArgs) {
  const tournamentRounds = eventArgs.tree.rounds;
  const tournamentMatches = tournamentRounds[0].matches;
  const waitingPlayers = eventArgs.waitingPlayers.waitingPlayersRounds[0];

  await Server.db.run(
    `UPDATE tournaments SET start_timestamp = ? WHERE id = ?`,
    [tournamentRounds[0].startTimestamp, Server.currentTournament.id]
  );

  // Insert rounds
  await Promise.all(
    tournamentRounds.map((round, index) =>
      insertRound(Server, {
        tournamentId: Server.currentTournament.id,
        roundNumber: index + 1,
        startTimestamp: round.startTimestamp,
      })
    )
  );

  // Insert matches
  await Promise.all(
    tournamentMatches.map((match) => insertMatch(Server, match))
  );

  // Insert waiting players
  await Promise.all(
    waitingPlayers.players.map((player) =>
      insertWaitingPlayer(Server, {
        playerAddress: player.address,
        roundNumber: 1,
        tournamentId: Server.currentTournament.id,
      })
    )
  );

  await Server.updateCurrentTournamentFromDb();
  Server.emitTournamentRoundStarted(1);
  Server.infoLogging("Started tournament", Server.currentTournament.id);
};
