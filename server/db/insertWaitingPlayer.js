module.exports = async function (
  Server,
  { playerAddress, roundNumber, tournamentId }
) {
  await Server.db.run(
    `INSERT OR REPLACE INTO waiting_players VALUES (?, ?, ?)`,
    [playerAddress, roundNumber, tournamentId]
  );
};
