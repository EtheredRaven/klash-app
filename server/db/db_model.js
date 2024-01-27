class DbModel {
  constructor(dbWrapper) {
    this.db = dbWrapper;
  }

  async loadModels() {
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS tournaments (id PRIMARY KEY, prize INTEGER, sign_up_duration INTEGER, sign_up_start INTEGER, start_timestamp INTEGER, end_timestamp INTEGER, players_number INTEGER, winner TEXT);`
    );
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS rounds (id PRIMARY_KEY, round_number INTEGER, tournament_id INTEGER, start_timestamp INTEGER, FOREIGN KEY(tournament_id) REFERENCES tournaments(id));`
    );
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS matches (id PRIMARY KEY, round_number INTEGER, tournament_id INTEGER, player_1 TEXT, player_2 TEXT, score_1 INTEGER, score_2 INTEGER, last_action_timestamp_1 INTEGER, last_action_timestamp_2 INTEGER, sign_1 INTEGER, sign_hash_1 TEXT, sign_2 INTEGER, sign_hash_2 TEXT, winner TEXT, FOREIGN KEY(tournament_id) REFERENCES tournaments(id));`
    );
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS waiting_players_rounds (id PRIMARY KEY, address TEXT, round_number INTEGER, tournament_id INTEGER, FOREIGN KEY(tournament_id) REFERENCES tournaments(id));`
    );
  }
}

module.exports = DbModel;
