import {
  SIGN_INTEGER_TO_STRING,
  COMPUTE_WINNER,
  MATCH_PLAYER_1_WON,
  MATCH_PLAYER_2_WON,
} from "../utils/constants";

export function initSocket(vue) {
  vue.$socket.on("tournament_created", (tournament) => {
    vue.$store.commit("setCurrentTournament", tournament);
  });

  vue.$socket.on("player_signed_up", (address) => {
    vue.$store.commit("addPlayerToCurrentTournament", address);
  });

  vue.$socket.on("match_created", (match) => {
    vue.$store.dispatch("setCurrentMatch", match);
    vue.$store.commit("setCanPlayTimeout");
    vue.$store.commit("resetLastRoundSigns");
  });

  vue.$socket.on("player_waiting", () => {
    vue.$store.commit("openInfoModal", {
      title: "Waiting for your next opponent...",
      message:
        "Please stay online while waiting for the next match to start ⏳",
    });
    vue.$store.dispatch("setCurrentMatch", {
      waiting: true,
      player_1: vue.$store.state.activeAccount?.address,
    });
  });

  vue.$socket.on("sign_played", (isUser, match) => {
    vue.$store.dispatch("setCurrentMatch", match);
    if (isUser) {
      vue.$store.dispatch("setSignPlayed", vue.$store.state.tempSignPlayed);
      let tempHashingSeed = vue.$store.state.tempHashingSeed;
      let hashingSeed = vue.$store.state.hashingSeed;
      vue.$store.dispatch("setHashingSeed", tempHashingSeed);
      vue.$store.dispatch("setTempHashingSeed", hashingSeed);
      vue.$store.commit("setCanPlayTimeout");
    }
  });

  vue.$socket.on("sign_verified", (match) => {
    vue.$store.dispatch("setCurrentMatch", match);
  });

  vue.$socket.on("match_round_finished", (match) => {
    let currentMatch = vue.$store.state.currentMatch; // The new match has the signs reset
    let isPlayer1 =
      currentMatch.player_1 == vue.$store.state.activeAccount?.address;
    let opponentSign = isPlayer1 ? currentMatch.sign_2 : currentMatch.sign_1;
    let userSign = isPlayer1 ? currentMatch.sign_1 : currentMatch.sign_2;
    let winner = COMPUTE_WINNER(userSign, opponentSign);

    let userScore = isPlayer1 ? match.score_1 : match.score_2;
    let opponentScore = isPlayer1 ? match.score_2 : match.score_1;

    let title =
      winner == 0
        ? "It's a draw!"
        : "You " + (winner == 1 ? "won this round!" : "lost this round!");

    vue.$store.commit("openInfoModal", {
      title,
      message: "You played",
      icon1: SIGN_INTEGER_TO_STRING(userSign),
      textBetween: "against",
      icon2: SIGN_INTEGER_TO_STRING(opponentSign),
    });

    vue.$store.dispatch("setCurrentMatch", match);
    vue.$store.commit("addLastRoundSign", {
      playerSign: SIGN_INTEGER_TO_STRING(userSign),
      opponentSign: SIGN_INTEGER_TO_STRING(opponentSign),
      winner: winner,
      playerScore: userScore,
      opponentScore: opponentScore,
    });
    vue.$store.commit("setCanPlayTimeout");
  });

  vue.$socket.on("match_finished", (match) => {
    let isPlayer1 = match.player_1 == vue.$store.state.activeAccount?.address;
    let hasWon =
      (isPlayer1 && match.winner == MATCH_PLAYER_1_WON) ||
      (!isPlayer1 && match.winner == MATCH_PLAYER_2_WON);
    let title = hasWon ? "You won the match!" : "You lost the match!";
    let message = hasWon
      ? "Congratulations 🎉 Please, wait for the next round to start !"
      : "Tough battle, but there’s always a next time! 🤝 You can now follow the tournament with the dashboard !";
    vue.$store.commit("openInfoModal", {
      title,
      message,
    });

    vue.$store.dispatch("setCurrentMatch", match);
    vue.$store.commit("setCanPlayTimeout");
  });

  vue.$socket.on("tournament_finished", (tournament) => {
    if (tournament.winner == vue.$store.state.activeAccount?.address) {
      vue.$store.commit("openInfoModal", {
        title: "Congratulations!",
        message: "You won the tournament! 🥇",
      });
    }
    vue.$store.commit("setCurrentTournament", tournament);
  });

  vue.$socket.on("tournament_stats_updated", (stats) => {
    vue.$store.commit("setCurrentTournamentStats", stats);
  });
}
