class DbModel {
  constructor(dbWrapper) {
    this.db = dbWrapper;
  }

  async loadModels() {
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS tournaments (id INTEGER PRIMARY KEY, prize INTEGER, sign_up_duration INTEGER, sign_up_start INTEGER, start_timestamp INTEGER, end_timestamp INTEGER, winner TEXT);`
    );
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS signed_up_players (address TEXT, tournament_id INTEGER, CONSTRAINT addTournamentPK PRIMARY KEY (tournament_id, address), FOREIGN KEY(tournament_id) REFERENCES tournaments(id));`
    );
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS rounds (round_number INTEGER, tournament_id INTEGER, start_timestamp INTEGER, CONSTRAINT roundPK PRIMARY KEY (tournament_id, round_number), FOREIGN KEY(tournament_id) REFERENCES tournaments(id));`
    );
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS matches (round_number INTEGER, tournament_id INTEGER, player_1 TEXT, player_2 TEXT, score_1 INTEGER, score_2 INTEGER, last_action_timestamp_1 INTEGER, last_action_timestamp_2 INTEGER, sign_1 INTEGER, sign_hash_1 TEXT, sign_2 INTEGER, sign_hash_2 TEXT, winner TEXT, CONSTRAINT matchPK PRIMARY KEY (tournament_id, player_1, player_2), FOREIGN KEY(tournament_id) REFERENCES tournaments(id));`
    );
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS waiting_players (address TEXT, round_number INTEGER, tournament_id INTEGER, CONSTRAINT waitingPlayersPK PRIMARY KEY (tournament_id, round_number, address), FOREIGN KEY(tournament_id) REFERENCES tournaments(id));`
    );
  }
}

module.exports = DbModel;
