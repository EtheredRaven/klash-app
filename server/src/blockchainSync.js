const insertMatch = require("../db/insertMatch");
const insertRound = require("../db/insertRound");
const insertTournament = require("../db/insertTournament");

module.exports = function (Server) {
  Server.syncDbWithBlockchain = async function () {
    Server.infoLogging("Syncing database with blockchain");

    let [tournament, tournamentConfig] = await Promise.all([
      Server.klashContract.functions.get_tournament_tree({}),
      Server.klashContract.functions.get_tournament_config({}),
    ]);

    if (!tournamentConfig?.result?.tournamentId) return;

    await Promise.all([
      insertTournament(Server, tournamentConfig.result),
      Server.db.run(
        `DELETE FROM tournaments WHERE id > ${tournamentConfig.result.tournamentId}`
      ),
      Server.db.run(
        `DELETE FROM rounds WHERE tournament_id > ${tournamentConfig.result.tournamentId}`
      ),
      Server.db.run(
        `DELETE FROM matches WHERE tournament_id > ${tournamentConfig.result.tournamentId}`
      ),
    ]);

    const tournamentRounds = tournament.result?.rounds || [];
    let currentRoundId =
      tournamentRounds.findIndex(
        (round) => parseInt(round.startTimestamp) > 0
      ) + 1;

    let tournamentStarted = tournamentRounds.length > 0;
    if (tournamentStarted) {
      const tournamentMatches = (
        await Promise.all(
          tournamentRounds[currentRoundId - 1].matches.map((match) =>
            Server.klashContract.functions.get_current_match({
              from: match.player1.address,
            })
          )
        )
      ).map((match) => match.result);

      await Promise.all(
        tournamentRounds.map((round, index) =>
          insertRound(Server, {
            tournamentId: tournamentConfig.result.tournamentId,
            roundNumber: index + 1,
            startTimestamp: round.startTimestamp,
          })
        )
      );

      await Promise.all(
        tournamentMatches.map((match) => insertMatch(Server, match))
      );
    }

    Server.resetTimeouts();
    await Server.updateCurrentTournamentFromDb();
    tournamentStarted &&
      Server.emitTournamentRoundStarted(Server.currentTournament.currentRound);

    Server.infoLogging("Synced database with blockchain");
  };

  Server.syncDbWithBlockchain();
};
