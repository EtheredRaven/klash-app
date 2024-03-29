const insertMatch = require("../../db/insertMatch");

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
    tournamentRounds.map(async (round, index) => {
      await Server.db.run(`INSERT OR REPLACE INTO rounds VALUES (?, ?, ?)`, [
        index + 1,
        Server.currentTournament.id,
        round.startTimestamp,
      ]);
    })
  );

  // Insert matches
  await Promise.all(
    tournamentMatches.map(async (match) => {
      await insertMatch(Server, match);
    })
  );

  // Insert waiting players
  await Promise.all(
    waitingPlayers.players.map(async (player) => {
      await Server.db.run(
        `INSERT OR REPLACE INTO waiting_players VALUES (?, ?, ?)`,
        [player.address, 1, Server.currentTournament.id]
      );
    })
  );

  await Server.updateCurrentTournamentFromDb();
  Server.emitTournamentRoundStarted(1);
  Server.infoLogging("Started tournament", Server.currentTournament.id);
};
