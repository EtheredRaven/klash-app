module.exports = async function (Server) {
  // Select the tournament with the highest id
  Server.updateCurrentTournamentFromDb = async () => {
    Server.currentTournament = await Server.db.get(
      "SELECT * FROM tournaments ORDER BY id DESC LIMIT 1"
    );

    if (!Server.currentTournament) return;

    Server.currentTournament.players = await Server.db.all(
      "SELECT * FROM signed_up_players WHERE tournament_id = ?",
      [Server.currentTournament.id]
    );

    Server.currentTournament.rounds = await Server.db.all(
      "SELECT * FROM rounds WHERE tournament_id = ?",
      [Server.currentTournament.id]
    );

    Server.currentTournament.currentRound = 0;
    let matches = {};

    for (const round of Server.currentTournament.rounds) {
      if (
        round.round_number >= Server.currentTournament.currentRound &&
        round.start_timestamp > 0
      ) {
        Server.currentTournament.currentRound = round.round_number;
        matches = await Server.db.all(
          "SELECT * FROM matches WHERE round_number = ? AND tournament_id = ?",
          [round.round_number, Server.currentTournament.id]
        );

        matches.forEach((match) => {
          if (process.env.PREDEFINED_BLOCKS_TESTING) {
            let now = new Date();
            let UTCTimestamp = Date.UTC(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate(),
              now.getUTCHours(),
              now.getUTCMinutes(),
              now.getUTCSeconds(),
              now.getUTCMilliseconds()
            );
            match.start_timestamp = UTCTimestamp;
            if (match.sign_hash_1 && match.sign_hash_2) {
              match.last_action_timestamp_1 = UTCTimestamp;
              match.last_action_timestamp_2 = UTCTimestamp;
            }
          } else {
            match.start_timestamp = round.start_timestamp;
          }
        });
      }
      round.waitingPlayers = await Server.db.all(
        "SELECT * FROM waiting_players WHERE round_number = ? AND tournament_id = ?",
        [round.round_number, Server.currentTournament.id]
      );
    }

    if (
      Server.currentTournament.currentRound &&
      Server.currentTournament.currentRound > 0
    ) {
      Server.currentTournament.rounds[
        Server.currentTournament.currentRound - 1
      ].matches = matches;
    }
  };
  await Server.updateCurrentTournamentFromDb();
};
