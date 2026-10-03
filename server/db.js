const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'rttf_tournament.db');

// Ensure data folder exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', DB_PATH);
  }
});

// Run queries with Promise wrappers
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

async function initSchema() {
  console.log('🔧 Initializing SQLite tables...');

  await run(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT,
      group_letter TEXT NOT NULL,
      color TEXT,
      accent_color TEXT,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      jersey_number INTEGER,
      role TEXT DEFAULT 'FWD',
      is_captain INTEGER DEFAULT 0,
      avatar_url TEXT,
      goals INTEGER DEFAULT 0,
      assists INTEGER DEFAULT 0,
      passes INTEGER DEFAULT 0,
      clean_sheets INTEGER DEFAULT 0,
      tackles INTEGER DEFAULT 0,
      shots INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      minutes INTEGER DEFAULT 0,
      yellow_cards INTEGER DEFAULT 0,
      red_cards INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      round TEXT NOT NULL,
      stage TEXT NOT NULL,
      group_letter TEXT,
      match_date TEXT,
      match_time TEXT,
      pitch TEXT,
      home_team_id TEXT NOT NULL,
      away_team_id TEXT NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      status TEXT DEFAULT 'Scheduled',
      label TEXT,
      penalty_home_score INTEGER,
      penalty_away_score INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (home_team_id) REFERENCES teams(id),
      FOREIGN KEY (away_team_id) REFERENCES teams(id)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS match_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id TEXT NOT NULL,
      team_id TEXT NOT NULL,
      player_id TEXT,
      event_type TEXT NOT NULL, -- 'goal', 'assist', 'yellow_card', 'red_card', 'save'
      minute INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS tournament_info (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS team_signups (
      id TEXT PRIMARY KEY,
      team_name TEXT NOT NULL,
      short_code TEXT,
      captain_name TEXT NOT NULL,
      captain_phone TEXT NOT NULL,
      group_pref TEXT DEFAULT 'Any Group',
      kit_primary TEXT DEFAULT '#001438',
      kit_secondary TEXT DEFAULT '#00d4ff',
      players_json TEXT NOT NULL,
      payment_status TEXT DEFAULT 'Pending Payment',
      status TEXT DEFAULT 'pending',
      assigned_team_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Schema initialization complete.');
}

module.exports = {
  db,
  run,
  get,
  all,
  initSchema
};
