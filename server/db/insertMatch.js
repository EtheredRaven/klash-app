module.exports = async function (Server, match) {
  await Server.db.run(
    `INSERT OR REPLACE INTO matches VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      match.round,
      match.tournamentId,
      match.player1.address,
      match.player2.address,
      match.score1,
      match.score2,
      match.player1.lastActionTimestamp,
      match.player2.lastActionTimestamp,
      match.sign1?.sign,
      match.sign1?.signHash,
      match.sign2?.sign,
      match.sign2?.signHash,
      match.winner,
      0,
    ]
  );
};
