const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, run, get, all, initSchema } = require('./db');
const { seedDatabase } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..')));

// ── API ROUTES ──

// 1. Status & Health Check
app.get('/api/status', async (req, res) => {
  try {
    const teamsCount = await get('SELECT COUNT(*) as count FROM teams');
    const playersCount = await get('SELECT COUNT(*) as count FROM players');
    const matchesCount = await get('SELECT COUNT(*) as count FROM matches');
    const playedMatches = await get("SELECT COUNT(*) as count FROM matches WHERE status = 'Full Time'");
    const eventsCount = await get('SELECT COUNT(*) as count FROM match_events');

    res.json({
      status: 'online',
      database: 'SQLite (rttf_tournament.db)',
      counts: {
        teams: teamsCount.count,
        players: playersCount.count,
        matches: matchesCount.count,
        playedMatches: playedMatches.count,
        matchEvents: eventsCount.count
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. TEAMS API
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await all(`
      SELECT t.*, COUNT(p.id) as playerCount 
      FROM teams t
      LEFT JOIN players p ON p.team_id = t.id
      GROUP BY t.id
      ORDER BY t.group_letter ASC, t.id ASC
    `);
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/teams/:id', async (req, res) => {
  try {
    const team = await get('SELECT * FROM teams WHERE id = ?', [req.params.id]);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const players = await all('SELECT * FROM players WHERE team_id = ? ORDER BY jersey_number ASC, role DESC', [req.params.id]);
    const matches = await all(`
      SELECT m.*, 
             ht.name as homeTeamName, ht.short_name as homeShortName, ht.color as homeColor,
             at.name as awayTeamName, at.short_name as awayShortName, at.color as awayColor
      FROM matches m
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      WHERE m.home_team_id = ? OR m.away_team_id = ?
      ORDER BY m.match_date ASC, m.match_time ASC
    `, [req.params.id, req.params.id]);

    res.json({ ...team, players, matches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const { id, name, short_name, group_letter, color, accent_color, logo_url } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'id and name are required' });

    await run(`
      INSERT INTO teams (id, name, short_name, group_letter, color, accent_color, logo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        short_name = excluded.short_name,
        group_letter = excluded.group_letter,
        color = excluded.color,
        accent_color = excluded.accent_color,
        logo_url = excluded.logo_url
    `, [id, name, short_name || name.slice(0, 4).toUpperCase(), group_letter || 'A', color || '#001438', accent_color || '#00d4ff', logo_url || '']);

    const updated = await get('SELECT * FROM teams WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. PLAYERS API
app.get('/api/players', async (req, res) => {
  try {
    const { teamId, role, group, search, sortBy = 'goals', order = 'DESC' } = req.query;
    let sql = `
      SELECT p.*, t.name as teamName, t.short_name as teamShortName, t.group_letter as groupLetter, t.color as teamColor, t.accent_color as teamAccentColor
      FROM players p
      JOIN teams t ON t.id = p.team_id
      WHERE 1=1
    `;
    const params = [];

    if (teamId) {
      sql += ` AND p.team_id = ?`;
      params.push(teamId);
    }
    if (role) {
      sql += ` AND p.role = ?`;
      params.push(role);
    }
    if (group) {
      sql += ` AND t.group_letter = ?`;
      params.push(group);
    }
    if (search) {
      sql += ` AND (p.name LIKE ? OR t.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const allowedSort = ['goals', 'assists', 'passes', 'clean_sheets', 'tackles', 'shots', 'saves', 'yellow_cards', 'red_cards', 'minutes', 'jersey_number', 'name'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'goals';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY p.${safeSort} ${safeOrder}, p.goals DESC, p.name ASC`;

    const players = await all(sql, params);
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/players/:id', async (req, res) => {
  try {
    const player = await get(`
      SELECT p.*, t.name as teamName, t.short_name as teamShortName, t.group_letter as groupLetter, t.color as teamColor, t.accent_color as teamAccentColor
      FROM players p
      JOIN teams t ON t.id = p.team_id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!player) return res.status(404).json({ error: 'Player not found' });

    const events = await all(`
      SELECT e.*, m.round, m.match_date
      FROM match_events e
      JOIN matches m ON m.id = e.match_id
      WHERE e.player_id = ?
      ORDER BY e.created_at DESC
    `, [req.params.id]);

    res.json({ ...player, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/players', async (req, res) => {
  try {
    const { team_id, name, jersey_number, role, is_captain, avatar_url } = req.body;
    if (!team_id || !name) {
      return res.status(400).json({ error: 'team_id and name are required' });
    }

    const countRow = await get('SELECT COUNT(*) as count FROM players');
    const newId = req.body.id || `p_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    await run(`
      INSERT INTO players (id, team_id, name, jersey_number, role, is_captain, avatar_url, goals, assists, passes, clean_sheets, tackles, shots, saves, minutes, yellow_cards, red_cards)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    `, [newId, team_id, name, jersey_number || 10, role || 'FWD', is_captain ? 1 : 0, avatar_url || '']);

    const created = await get('SELECT * FROM players WHERE id = ?', [newId]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/players/:id', async (req, res) => {
  try {
    const { name, jersey_number, role, is_captain, goals, assists, passes, clean_sheets, tackles, shots, saves, minutes, yellow_cards, red_cards, avatar_url, team_id } = req.body;
    
    const existing = await get('SELECT * FROM players WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Player not found' });

    await run(`
      UPDATE players SET
        name = COALESCE(?, name),
        team_id = COALESCE(?, team_id),
        jersey_number = COALESCE(?, jersey_number),
        role = COALESCE(?, role),
        is_captain = COALESCE(?, is_captain),
        goals = COALESCE(?, goals),
        assists = COALESCE(?, assists),
        passes = COALESCE(?, passes),
        clean_sheets = COALESCE(?, clean_sheets),
        tackles = COALESCE(?, tackles),
        shots = COALESCE(?, shots),
        saves = COALESCE(?, saves),
        minutes = COALESCE(?, minutes),
        yellow_cards = COALESCE(?, yellow_cards),
        red_cards = COALESCE(?, red_cards),
        avatar_url = COALESCE(?, avatar_url)
      WHERE id = ?
    `, [
      name, team_id, jersey_number, role, is_captain,
      goals, assists, passes, clean_sheets, tackles, shots, saves, minutes, yellow_cards, red_cards, avatar_url,
      req.params.id
    ]);

    const updated = await get('SELECT * FROM players WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/players/:id', async (req, res) => {
  try {
    await run('DELETE FROM players WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: `Player ${req.params.id} deleted.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. MATCHES & SCOREKEEPING API
app.get('/api/matches', async (req, res) => {
  try {
    const { round, stage, group, teamId } = req.query;
    let sql = `
      SELECT m.*,
             ht.name as homeTeamName, ht.short_name as homeShortName, ht.color as homeColor, ht.accent_color as homeAccentColor,
             at.name as awayTeamName, at.short_name as awayShortName, at.color as awayColor, at.accent_color as awayAccentColor
      FROM matches m
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      WHERE 1=1
    `;
    const params = [];

    if (round) {
      sql += ` AND m.round = ?`;
      params.push(round);
    }
    if (stage) {
      sql += ` AND m.stage = ?`;
      params.push(stage);
    }
    if (group) {
      sql += ` AND m.group_letter = ?`;
      params.push(group);
    }
    if (teamId) {
      sql += ` AND (m.home_team_id = ? OR m.away_team_id = ?)`;
      params.push(teamId, teamId);
    }

    sql += ` ORDER BY m.match_date ASC, m.match_time ASC, m.id ASC`;

    const matches = await all(sql, params);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/matches/:id', async (req, res) => {
  try {
    const match = await get(`
      SELECT m.*,
             ht.name as homeTeamName, ht.short_name as homeShortName, ht.color as homeColor, ht.accent_color as homeAccentColor,
             at.name as awayTeamName, at.short_name as awayShortName, at.color as awayColor, at.accent_color as awayAccentColor
      FROM matches m
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      WHERE m.id = ?
    `, [req.params.id]);

    if (!match) return res.status(404).json({ error: 'Match not found' });

    const events = await all(`
      SELECT e.*, p.name as playerName, p.jersey_number as playerJersey, p.role as playerRole, t.name as teamName
      FROM match_events e
      LEFT JOIN players p ON p.id = e.player_id
      JOIN teams t ON t.id = e.team_id
      WHERE e.match_id = ?
      ORDER BY e.minute ASC, e.id ASC
    `, [req.params.id]);

    res.json({ ...match, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update match score & status (Quick Scorekeeper)
app.put('/api/matches/:id', async (req, res) => {
  try {
    const { home_score, away_score, status, match_date, match_time, pitch, penalty_home_score, penalty_away_score } = req.body;
    
    await run(`
      UPDATE matches SET
        home_score = COALESCE(?, home_score),
        away_score = COALESCE(?, away_score),
        status = COALESCE(?, status),
        match_date = COALESCE(?, match_date),
        match_time = COALESCE(?, match_time),
        pitch = COALESCE(?, pitch),
        penalty_home_score = COALESCE(?, penalty_home_score),
        penalty_away_score = COALESCE(?, penalty_away_score)
      WHERE id = ?
    `, [home_score, away_score, status, match_date, match_time, pitch, penalty_home_score, penalty_away_score, req.params.id]);

    const updated = await get(`
      SELECT m.*,
             ht.name as homeTeamName, ht.short_name as homeShortName, ht.color as homeColor,
             at.name as awayTeamName, at.short_name as awayShortName, at.color as awayColor
      FROM matches m
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      WHERE m.id = ?
    `, [req.params.id]);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. MATCH EVENTS (Log goals, cards, assists)
app.get('/api/matches/:id/events', async (req, res) => {
  try {
    const events = await all(`
      SELECT e.*, p.name as playerName, p.jersey_number as playerJersey, t.name as teamName, t.color as teamColor
      FROM match_events e
      LEFT JOIN players p ON p.id = e.player_id
      JOIN teams t ON t.id = e.team_id
      WHERE e.match_id = ?
      ORDER BY e.minute ASC, e.id ASC
    `, [req.params.id]);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/matches/:id/events', async (req, res) => {
  try {
    const match_id = req.params.id;
    const { team_id, player_id, event_type, minute = 0, notes = '' } = req.body;

    if (!team_id || !event_type) {
      return res.status(400).json({ error: 'team_id and event_type are required' });
    }

    const result = await run(`
      INSERT INTO match_events (match_id, team_id, player_id, event_type, minute, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [match_id, team_id, player_id || null, event_type, minute, notes]);

    // Automatically increment player statistics if player_id is provided!
    if (player_id) {
      if (event_type === 'goal') {
        await run('UPDATE players SET goals = goals + 1, shots = shots + 1 WHERE id = ?', [player_id]);
      } else if (event_type === 'assist') {
        await run('UPDATE players SET assists = assists + 1 WHERE id = ?', [player_id]);
      } else if (event_type === 'yellow_card') {
        await run('UPDATE players SET yellow_cards = yellow_cards + 1 WHERE id = ?', [player_id]);
      } else if (event_type === 'red_card') {
        await run('UPDATE players SET red_cards = red_cards + 1 WHERE id = ?', [player_id]);
      } else if (event_type === 'save') {
        await run('UPDATE players SET saves = saves + 1 WHERE id = ?', [player_id]);
      }
    }

    const createdEvent = await get(`
      SELECT e.*, p.name as playerName, p.jersey_number as playerJersey, t.name as teamName
      FROM match_events e
      LEFT JOIN players p ON p.id = e.player_id
      JOIN teams t ON t.id = e.team_id
      WHERE e.id = ?
    `, [result.id]);

    res.status(201).json(createdEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/matches/:id/events/:eventId', async (req, res) => {
  try {
    const event = await get('SELECT * FROM match_events WHERE id = ?', [req.params.eventId]);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Reverse player stat
    if (event.player_id) {
      if (event.event_type === 'goal') {
        await run('UPDATE players SET goals = MAX(0, goals - 1), shots = MAX(0, shots - 1) WHERE id = ?', [event.player_id]);
      } else if (event.event_type === 'assist') {
        await run('UPDATE players SET assists = MAX(0, assists - 1) WHERE id = ?', [event.player_id]);
      } else if (event.event_type === 'yellow_card') {
        await run('UPDATE players SET yellow_cards = MAX(0, yellow_cards - 1) WHERE id = ?', [event.player_id]);
      } else if (event.event_type === 'red_card') {
        await run('UPDATE players SET red_cards = MAX(0, red_cards - 1) WHERE id = ?', [event.player_id]);
      }
    }

    await run('DELETE FROM match_events WHERE id = ?', [req.params.eventId]);
    res.json({ success: true, message: 'Event deleted and player stats updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. DYNAMIC TOURNAMENT STANDINGS API
app.get('/api/standings', async (req, res) => {
  try {
    const teams = await all('SELECT * FROM teams ORDER BY group_letter ASC, id ASC');
    const matches = await all("SELECT * FROM matches WHERE stage = 'Group Stage'");

    // Build stats table
    const table = {};
    teams.forEach(t => {
      table[t.id] = {
        id: t.id,
        name: t.name,
        shortName: t.short_name,
        group: t.group_letter,
        color: t.color,
        accentColor: t.accent_color,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
        form: []
      };
    });

    matches.forEach(m => {
      if (m.home_score !== null && m.away_score !== null && m.status === 'Full Time') {
        const h = table[m.home_team_id];
        const a = table[m.away_team_id];
        if (!h || !a) return;

        h.played += 1;
        a.played += 1;
        h.gf += m.home_score;
        h.ga += m.away_score;
        a.gf += m.away_score;
        a.ga += m.home_score;

        if (m.home_score > m.away_score) {
          h.won += 1;
          h.points += 3;
          h.form.push('W');
          a.lost += 1;
          a.form.push('L');
        } else if (m.home_score < m.away_score) {
          a.won += 1;
          a.points += 3;
          a.form.push('W');
          h.lost += 1;
          h.form.push('L');
        } else {
          h.drawn += 1;
          a.drawn += 1;
          h.points += 1;
          a.points += 1;
          h.form.push('D');
          a.form.push('D');
        }
      }
    });

    // Calculate GD and group by letter
    const groups = {};
    const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    GROUP_LETTERS.forEach(g => { groups[g] = []; });

    Object.values(table).forEach(row => {
      row.gd = row.gf - row.ga;
      row.form = row.form.slice(-5);
      if (groups[row.group]) {
        groups[row.group].push(row);
      }
    });

    // Sort each group by Points > GD > GF > Name
    GROUP_LETTERS.forEach(g => {
      groups[g].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.name.localeCompare(b.name);
      });
      // Assign rank
      groups[g].forEach((team, idx) => {
        team.rank = idx + 1;
      });
    });

    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. STATS & LEADERBOARDS API
app.get('/api/leaderboards', async (req, res) => {
  try {
    const topScorers = await all(`
      SELECT p.*, t.name as teamName, t.color as teamColor, t.group_letter as groupLetter
      FROM players p JOIN teams t ON t.id = p.team_id
      ORDER BY p.goals DESC, p.shots ASC, p.name ASC
      LIMIT 10
    `);

    const topAssists = await all(`
      SELECT p.*, t.name as teamName, t.color as teamColor, t.group_letter as groupLetter
      FROM players p JOIN teams t ON t.id = p.team_id
      ORDER BY p.assists DESC, p.passes DESC, p.name ASC
      LIMIT 10
    `);

    const topCleanSheets = await all(`
      SELECT p.*, t.name as teamName, t.color as teamColor, t.group_letter as groupLetter
      FROM players p JOIN teams t ON t.id = p.team_id
      WHERE p.role = 'GK' OR p.clean_sheets > 0
      ORDER BY p.clean_sheets DESC, p.saves DESC
      LIMIT 10
    `);

    const topPasses = await all(`
      SELECT p.*, t.name as teamName, t.color as teamColor, t.group_letter as groupLetter
      FROM players p JOIN teams t ON t.id = p.team_id
      ORDER BY p.passes DESC
      LIMIT 10
    `);

    const disciplined = await all(`
      SELECT p.*, t.name as teamName, t.color as teamColor, t.group_letter as groupLetter,
             (p.yellow_cards + p.red_cards * 2) as penaltyScore
      FROM players p JOIN teams t ON t.id = p.team_id
      WHERE p.yellow_cards > 0 OR p.red_cards > 0
      ORDER BY penaltyScore DESC, p.red_cards DESC
      LIMIT 10
    `);

    res.json({
      topScorers,
      topAssists,
      topCleanSheets,
      topPasses,
      disciplined
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. ADMIN SEED / RESET
app.post('/api/admin/reset', async (req, res) => {
  try {
    await seedDatabase(true);
    res.json({ success: true, message: 'Database reset and re-seeded successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback to index.html for single-page routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start Server
async function start() {
  await initSchema();
  // Check if DB needs seed
  const tRow = await get('SELECT COUNT(*) as count FROM teams');
  if (!tRow || tRow.count === 0) {
    await seedDatabase(true);
  }

  app.listen(PORT, () => {
    console.log(`\n⚽===================================================`);
    console.log(`🏆 Road to the Final 2026 — Database API Server`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`📊 SQLite Database: C:\\Users\\seanf\\Downloads\\road-to-the-final\\data\\rttf_tournament.db`);
    console.log(`⚽===================================================\n`);
  });
}

start();
