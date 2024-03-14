module.exports = function (Server) {
  Server.initAdminSocketEvents = function (socket) {
    socket.on("admin_login", (password) => {
      if (password == process.env.ADMIN_PASSWORD) {
        Server.infoLogging(socket, "Admin logged in", password);
        socket.isAdmin = true;
        Server.adminsSockets.push(socket);
      } else {
        Server.infoLogging(socket, "Admin login failed", password);
      }
      socket.emit("admin_logged_in", {
        success: socket.isAdmin,
        currentTournament: Server.currentTournament,
      });
    });

    socket.onAdmin = function (event, callback) {
      socket.on(event, function (data) {
        if (!socket.isAdmin) {
          Server.infoLogging(socket, "Admin event failed", event, data);
          return;
        }
        Server.infoLogging(socket, "Admin event", event, data);
        callback(data);
      });
    };
  };
};
