(async () => {
  const fs = require("fs");
  const path = require("path");

  // SERVER
  Server = {};

  var express = require("express");
  Server.app = express();

  // HTTP
  var httpServer = require("http").Server(Server.app);

  Server.io = require("socket.io")(httpServer, {
    pingTimeout: 30000,
    pingInterval: 30000,
  });
  Server.httpListeningPort = process.env.HTTP_PORT || 80;
  httpServer.listen(Server.httpListeningPort);
  console.log("Http server runnning on port " + Server.httpListeningPort);

  // HTTPS
  try {
    var httpsServer = require("https").Server(
      {
        key: fs.readFileSync("cert/privkey.pem"),
        cert: fs.readFileSync("cert/fullchain.pem"),
      },
      Server.app
    );

    Server.httpsListeningPort = process.env.HTTPS_PORT || 443;
    httpsServer.listen(Server.httpsListeningPort);
    console.log("Https server runnning on port " + Server.httpsListeningPort);
    Server.io.attach(httpsServer);

    // HTTP TO HTTPS REDIRECTION
    Server.app.all("*", (req, res, next) => {
      if (req.secure) return next();
      res.redirect("https://" + req.hostname + req.url);
    });
  } catch (e) {
    e;
  }

  // LOGGING
  require("./src/logging")(Server);

  // DATABASE
  const DbWrapper = require("./db/db_wrapper");
  const DbModel = require("./db/db_model");
  Server.db = new DbWrapper("db/data.db", Server);
  await new DbModel(Server.db).loadModels();

  // Requirements
  require("./src/contracts")(Server);

  Server.app.use("/", express.static(__dirname + "/../client/dist"));
  Server.app.get("/", function (req, res) {
    res.sendFile(path.resolve(__dirname + "/../client/dist/index.html"));
  });

  require("./src/socket")(Server);
  require("./src/processBlocks")(Server);
  require("./src/initData")(Server);
})();
