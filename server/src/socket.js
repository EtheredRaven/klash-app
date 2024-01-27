module.exports = function (Server) {
  Server.io.engine.on("connection_error", (err) => {
    Server.errorLogging(err);
  });

  Server.io.on("connection", async function (socket) {
    Server.initSocketLogging(socket);
    Server.infoLogging(socket, "New connection to Websocket");
    socket.accounts = [];

    Server.disconnect = function (socket, reason) {
      Server.infoLogging(socket, "Disconnected from Websocket", reason);
      socket.leave(socket.accounts);
    };
  });
};
