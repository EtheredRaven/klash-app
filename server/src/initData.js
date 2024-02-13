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

    await Promise.all(
      Server.currentTournament.rounds.map(async (round) => {
        round.matches = await Server.db.all(
          "SELECT * FROM matches WHERE round_number = ? AND tournament_id = ?",
          [round.round_number, Server.currentTournament.id]
        );

        round.matches.forEach((match) => {
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

        round.waitingPlayers = await Server.db.all(
          "SELECT * FROM waiting_players WHERE round_number = ? AND tournament_id = ?",
          [round.round_number, Server.currentTournament.id]
        );
      })
    );
  };
  await Server.updateCurrentTournamentFromDb();
};
