module.exports = {
  getUTCTimestamp() {
    let now = new Date();
    return Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    );
  },

  fromEventsMatchToDbMatch(eventMatch) {
    return {
      tournament_id: eventMatch.tournamentId,
      round_number: eventMatch.round,
      player_1: eventMatch.player1.address,
      player_2: eventMatch.player2.address,
    };
  },
};
