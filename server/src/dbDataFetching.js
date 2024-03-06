const { getUTCTimestamp, fromEventsMatchToDbMatch } = require("./utils");

module.exports = async function (Server) {
  Server.updateMatchFromDb = async (match, cachedMatch = false) => {
    if (!match.tournament_id) match = fromEventsMatchToDbMatch(match); // Format the match object if it comes from the events
    let newMatch = cachedMatch
      ? match
      : await Server.db.get(
          "SELECT * FROM matches WHERE round_number = ? AND tournament_id = ? AND player_1 = ? AND player_2 = ?",
          [
            match.round_number,
            match.tournament_id,
            match.player_1,
            match.player_2,
          ]
        );

    if (process.env.PREDEFINED_BLOCKS_TESTING) {
      // For testing purposes
      let UTCTimestamp = getUTCTimestamp();
      newMatch.start_timestamp = UTCTimestamp;
      if (newMatch.sign_hash_1 && newMatch.sign_hash_2) {
        newMatch.last_action_timestamp_1 = UTCTimestamp;
        newMatch.last_action_timestamp_2 = UTCTimestamp;
      }
    } else {
      let round = Server.currentTournament.rounds[match.round_number - 1];

      newMatch.start_timestamp = round.start_timestamp;
      !newMatch.last_action_timestamp_1 &&
        (newMatch.last_action_timestamp_1 = round.start_timestamp);
      !newMatch.last_action_timestamp_2 &&
        (newMatch.last_action_timestamp_2 = round.start_timestamp);

      Server.setMatchTimeouts(newMatch);

      // Replace the match in the current tournament object
      if (!cachedMatch) {
        for (let i = 0; i < round.matches.length; i++) {
          if (
            round.matches[i].player_1 === newMatch.player_1 &&
            round.matches[i].player_2 === newMatch.player_2
          ) {
            round.matches[i] = newMatch;
            break;
          }
        }
      }
    }

    return newMatch;
  };

  Server.updateWaitingPlayersFromDb = async () => {
    let waitingPlayers = await Server.db.all(
      "SELECT * FROM waiting_players WHERE tournament_id = ?",
      [Server.currentTournament.id]
    );

    const waitingPlayersByRound = {};
    for (const player of waitingPlayers) {
      if (!waitingPlayersByRound[player.round_number]) {
        waitingPlayersByRound[player.round_number] = [];
      }
      waitingPlayersByRound[player.round_number].push(player);
    }

    for (const round of Server.currentTournament.rounds) {
      round.waitingPlayers = waitingPlayersByRound[round.round_number] || [];
    }
  };

  Server.updateSignedUpPlayersFromDb = async () => {
    let signedUpPlayers = await Server.db.all(
      "SELECT * FROM signed_up_players WHERE tournament_id = ?",
      [Server.currentTournament.id]
    );
    Server.currentTournament.players = signedUpPlayers || [];
  };

  // Select the tournament with the highest id
  Server.updateCurrentTournamentFromDb = async () => {
    Server.currentTournament = await Server.db.get(
      "SELECT * FROM tournaments ORDER BY id DESC LIMIT 1"
    );

    if (!Server.currentTournament) return;

    let roundsDB = await Promise.all([
      Server.db.all("SELECT * FROM rounds WHERE tournament_id = ?", [
        Server.currentTournament.id,
      ]),
      Server.db.get(
        "SELECT round_number FROM rounds WHERE tournament_id = ? AND start_timestamp > 0 ORDER BY round_number DESC LIMIT 1",
        [Server.currentTournament.id]
      ),
    ]);
    Server.currentTournament.rounds = roundsDB[0] || [];
    Server.currentTournament.currentRound = roundsDB[1]?.round_number || 0;
    await Promise.all([
      Server.updateSignedUpPlayersFromDb(),
      Server.updateWaitingPlayersFromDb(),
    ]);

    if (
      Server.currentTournament.currentRound &&
      Server.currentTournament.currentRound > 0
    ) {
      let matches = await Server.db.all(
        "SELECT * FROM matches WHERE round_number = ? AND tournament_id = ?",
        [Server.currentTournament.currentRound, Server.currentTournament.id]
      );

      await Promise.all(
        matches.map((match) => Server.updateMatchFromDb(match, true))
      );
      Server.currentTournament.rounds[
        Server.currentTournament.currentRound - 1
      ].matches = matches;
    }
  };
  await Server.updateCurrentTournamentFromDb();
};
