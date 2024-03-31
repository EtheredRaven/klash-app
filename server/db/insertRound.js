module.exports = async function (
  Server,
  { roundNumber, tournamentId, startTimestamp }
) {
  await Server.db.run(`INSERT OR REPLACE INTO rounds VALUES (?, ?, ?)`, [
    roundNumber,
    tournamentId,
    startTimestamp,
  ]);
};
