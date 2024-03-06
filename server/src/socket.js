module.exports = function (Server) {
  Server.io.engine.on("connection_error", (err) => {
    Server.errorLogging(err);
  });

  Server.io.on("connection", function (socket) {
    Server.initSocketLogging(socket);
    Server.infoLogging(socket, "New connection to Websocket");
    socket.linkedAddress = null;

    socket.emit("tournament_created", Server.currentTournament);

    socket.on("link_socket_to_address", function (address) {
      if (socket.linkedAddress == address) return;
      Server.unlinkSocketToAddress(socket);
      Server.infoLogging(socket, "Linking socket to address", address);

      socket.linkedAddress = address;
      socket.join(socket.linkedAddress);

      if (
        Server.currentTournament?.start_timestamp &&
        !Server.currentTournament?.end_timestamp
      ) {
        Server.emitPlayerMatchState(socket);
      }
    });

    socket.on("unlink_socket_to_address", function () {
      Server.unlinkSocketToAddress(socket);
    });

    socket.on("disconnect", function (reason) {
      Server.disconnect(socket, reason);
    });
  });

  Server.disconnect = function (socket, reason) {
    Server.infoLogging(
      socket,
      "Disconnected from Websocket",
      reason,
      socket.linkedAddress
    );
    Server.unlinkSocketToAddress(socket);
  };

  Server.unlinkSocketToAddress = (socket) => {
    if (!socket.linkedAddress) return;
    Server.infoLogging(
      socket,
      "Unlinking socket from address",
      socket.linkedAddress
    );
    socket.leave(socket.linkedAddress);
    socket.linkedAddress = null;
  };

  Server.emitTournamentCreated = (tournament) => {
    Server.io.sockets.emit("tournament_created", tournament);
    Server.infoLogging("Emitting tournament_created", tournament.id);
  };

  Server.emitPlayerSignedUp = (playerAddress) => {
    Server.io.sockets.emit("player_signed_up", playerAddress);
    Server.infoLogging("Emitting player_signed_up", playerAddress);
  };

  Server.emitSignPlayed = (match, isPlayer1) => {
    Server.io.to(match.player_1).emit("sign_played", isPlayer1, match);
    Server.io.to(match.player_2).emit("sign_played", !isPlayer1, match);
    Server.infoLogging("Emitting sign_played", match.player_1, match.player_2);
  };

  Server.emitSignVerified = (match) => {
    Server.io.to(match.player_1).emit("sign_verified", match);
    Server.io.to(match.player_2).emit("sign_verified", match);
    Server.infoLogging(
      "Emitting sign_verified",
      match.player_1,
      match.player_2
    );
  };

  Server.emitMatchRoundFinished = (match) => {
    Server.io.to(match.player_1).emit("match_round_finished", match);
    Server.io.to(match.player_2).emit("match_round_finished", match);
    Server.infoLogging(
      "Emitting match_round_finished",
      match.player_1,
      match.player_2
    );
  };

  Server.emitMatchFinished = (match) => {
    Server.io.to(match.player_1).emit("match_finished", match);
    Server.io.to(match.player_2).emit("match_finished", match);
    Server.infoLogging(
      "Emitting match_finished",
      match.player_1,
      match.player_2
    );
  };

  Server.emitMatchCreated = (playerAddress, match, socket = null) => {
    (socket ? socket : Server.io.to(playerAddress)).emit(
      "match_created",
      match
    );
    Server.infoLogging("Emitting new_match_created", playerAddress);
  };

  Server.emitPlayerWaiting = (playerAddress, socket = null) => {
    (socket ? socket : Server.io.to(playerAddress)).emit("player_waiting");
    Server.infoLogging("Emitting player_waiting", playerAddress);
  };

  Server.emitTournamentRoundStarted = (roundNumber) => {
    const round = Server.currentTournament.rounds[roundNumber - 1];
    console.log(Server.currentTournament.rounds);
    console.log(round);
    Server.infoLogging(
      "Tournament round started",
      Server.currentTournament.id,
      roundNumber
    );
    round.matches.forEach((match) => {
      Server.emitMatchCreated(match.player_1, match);
      Server.emitMatchCreated(match.player_2, match);
    });
    round.waitingPlayers.forEach((player) => {
      Server.emitPlayerWaiting(player.address);
    });
  };

  Server.emitTournamentFinished = () => {
    Server.io.sockets.emit("tournament_finished", Server.currentTournament);
    Server.infoLogging(
      "Emitting tournament_finished",
      Server.currentTournament.id
    );
  };

  Server.emitPlayerMatchState = (socket) => {
    if (!socket.linkedAddress) return;
    const round =
      Server.currentTournament.rounds[
        Server.currentTournament.currentRound - 1
      ];
    let match = round.matches.find((match) => {
      return (
        match.player_1 == socket.linkedAddress ||
        match.player_2 == socket.linkedAddress
      );
    });
    if (match) {
      Server.emitMatchCreated(socket.linkedAddress, match, socket);
      return;
    }

    // A player can be waiting in a later round if he skipped a round
    for (
      let i = Server.currentTournament.currentRound;
      i <= Server.currentTournament.rounds.length;
      i++
    ) {
      const waitingPlayer = Server.currentTournament.rounds[
        i - 1
      ].waitingPlayers.find((player) => {
        return player.address == socket.linkedAddress;
      });
      if (waitingPlayer) {
        Server.emitPlayerWaiting(socket.linkedAddress, socket);
        return;
      }
    }
  };
};
