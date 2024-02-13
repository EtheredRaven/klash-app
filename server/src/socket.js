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

      if (Server.currentTournament?.start_timestamp) {
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
    Server.infoLogging("Emitting tournament_created", tournament);
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

  Server.emitTournamentRoundStarted = (roundNumber) => {
    const round = Server.currentTournament.rounds[roundNumber - 1];
    Server.infoLogging(
      "Tournament round started",
      Server.currentTournament.id,
      roundNumber
    );
    round.matches.forEach((match) => {
      Server.io.to(match.player_1).emit("match_created", match);
      Server.io.to(match.player_2).emit("match_created", match);
      Server.infoLogging("Emitting match_created", match.player_1);
      Server.infoLogging("Emitting match_created", match.player_2);
    });
    round.waitingPlayers.forEach((player) => {
      Server.io.to(player.address).emit("player_waiting");
      Server.infoLogging("Emitting player_waiting", player.address);
    });
  };

  Server.emitPlayerMatchState = (socket) => {
    if (!socket.linkedAddress) return;
    for (let round of Server.currentTournament.rounds) {
      let match = round.matches.find((match) => {
        return (
          match.player_1 == socket.linkedAddress ||
          match.player_2 == socket.linkedAddress
        );
      });
      if (match) {
        Server.io.to(socket.linkedAddress).emit("match_created", match);
        Server.infoLogging("Emitting match_created", socket.linkedAddress);
        return;
      }

      let waitingPlayer = round.waitingPlayers.find((player) => {
        return player.address == socket.linkedAddress;
      });
      if (waitingPlayer) {
        Server.io.to(socket.linkedAddress).emit("player_waiting");
        Server.infoLogging("Emitting player_waiting", socket.linkedAddress);
        return;
      }
    }
  };
};
