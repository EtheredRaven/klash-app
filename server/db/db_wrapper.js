const sqlite3 = require("sqlite3");

class DbWrapper {
  constructor(dbFilePath, Server) {
    this.server = Server;
    this.db = new sqlite3.Database(dbFilePath, (err) => {
      if (err) {
        this.server.errorLogging("SQL", "Could not connect to database", err);
      } else {
        this.server.infoLogging("SQL", "Connected to database");
      }
    });
  }

  run(sql, params = []) {
    let Server = this.server;
    return new Promise((resolve, reject) => {
      Server.infoLogging("SQL", "run", sql, ...params);
      this.db.run(sql, params, function (err) {
        if (err) {
          Server.errorLogging("SQL", "run", err);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  get(sql, params = []) {
    let Server = this.server;
    return new Promise((resolve, reject) => {
      Server.infoLogging("SQL", "get", sql, ...params);
      this.db.get(sql, params, (err, result) => {
        if (err) {
          Server.errorLogging("SQL", "get", err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  all(sql, params = []) {
    let Server = this.server;
    return new Promise((resolve, reject) => {
      Server.infoLogging("SQL", "all", sql, ...params);
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          Server.errorLogging("SQL", "all", err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = DbWrapper;
