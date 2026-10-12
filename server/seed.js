const { db, run, get, all, initSchema } = require('./db');
const fs = require('fs');
const path = require('path');

const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const GROUP_COLORS = [
  ['#38003c', '#00ff85'], ['#1e293b', '#38bdf8'], ['#3b0764', '#c084fc'], ['#18181b', '#facc15'],
  ['#064e3b', '#34d399'], ['#7c2d12', '#fb923c'], ['#1e1b4b', '#818cf8'], ['#701a75', '#f472b6']
];

// Sample default player roster generator for 32 teams (5 players each minimum)
function generateDefaultPlayers(teams) {
  const firstNames = ['Alex', 'David', 'Bruno', 'Lucas', 'Marcus', 'Kenzo', 'Gabriel', 'Liam', 'Julian', 'Samir', 'Victor', 'Ethan', 'Kofi', 'Ruben', 'Elliot', 'Virgil', 'Oliver', 'Gianluigi', 'Hugo', 'Bart', 'Alisson', 'Jordan', 'Walter', 'James', 'Mateo', 'Leo', 'Noah', 'Zack', 'Tariq', 'Carlos', 'Diego', 'Kai'];
  const lastNames = ['Mercer', 'Silva', 'Costa', 'Vance', 'Thorne', 'Tanaka', 'Santos', "O'Connor", 'Rossi', 'Nasri', 'Hugo', 'Walker', 'Mensah', 'Dias', 'Anderson', 'Van Dijk', 'Kahn', 'Buffon', 'Lloris', 'Verbruggen', 'Becker', 'Pickford', 'Benitez', 'Trafford', 'Sterling', 'Gomez', 'Nkosi', 'Dlamini', 'Khumalo', 'Botha', 'Naidoo', 'Van Zyl'];
  const roles = ['GK', 'DEF', 'MID', 'FWD', 'FWD'];

  const players = [];
  let pIndex = 1;

  teams.forEach((t, tIdx) => {
    // 5 players per team
    for (let i = 0; i < 5; i++) {
      const pId = `p${pIndex++}`;
      const fName = firstNames[(tIdx * 5 + i) % firstNames.length];
      const lName = lastNames[(tIdx * 7 + i) % lastNames.length];
      const role = roles[i];
      const jersey = i === 0 ? 1 : (i + 6 + (tIdx % 5));
      const goals = role === 'FWD' ? Math.floor(Math.random() * 4) : (role === 'MID' ? Math.floor(Math.random() * 2) : 0);
      const assists = role === 'MID' ? Math.floor(Math.random() * 4) : (role === 'FWD' ? Math.floor(Math.random() * 2) : 0);
      const saves = role === 'GK' ? Math.floor(Math.random() * 18) + 5 : 0;
      const cleanSheets = role === 'GK' ? Math.floor(Math.random() * 2) : 0;

      players.push({
        id: pId,
        team_id: t.id,
        name: `${fName} ${lName}`,
        jersey_number: jersey,
        role: role,
        is_captain: i === 1 ? 1 : 0,
        avatar_url: '',
        goals: goals,
        assists: assists,
        passes: Math.floor(Math.random() * 120) + 40,
        clean_sheets: cleanSheets,
        tackles: role === 'DEF' ? Math.floor(Math.random() * 25) + 10 : Math.floor(Math.random() * 10),
        shots: role === 'FWD' ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 5),
        saves: saves,
        minutes: 270,
        yellow_cards: Math.random() > 0.8 ? 1 : 0,
        red_cards: 0
      });
    }
  });

  return players;
}

async function seedDatabase(force = false) {
  await initSchema();

  const countRow = await get('SELECT COUNT(*) as count FROM teams');
  if (countRow && countRow.count > 0 && !force) {
    console.log(`ℹ️ Database already populated (${countRow.count} teams found). Skipping seed.`);
    return;
  }

  console.log('🌱 Seeding database with official tournament teams, players, and match schedules...');

  if (force) {
    await run('DELETE FROM match_events');
    await run('DELETE FROM matches');
    await run('DELETE FROM players');
    await run('DELETE FROM teams');
    await run('DELETE FROM tournament_info');
  }

  // 1. Build 32 Teams across 8 groups
  const teams = [];
  let teamCounter = 1;
  GROUP_LETTERS.forEach((grp, gIdx) => {
    for (let i = 1; i <= 4; i++) {
      const colPair = GROUP_COLORS[(gIdx * 4 + (i - 1)) % GROUP_COLORS.length];
      teams.push({
        id: `t${teamCounter}`,
        name: `TBD ${teamCounter}`,
        short_name: `TBD${teamCounter}`,
        group_letter: grp,
        color: colPair[0],
        accent_color: colPair[1],
        logo_url: ''
      });
      teamCounter++;
    }
  });

  for (const t of teams) {
    await run(
      `INSERT INTO teams (id, name, short_name, group_letter, color, accent_color, logo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.name, t.short_name, t.group_letter, t.color, t.accent_color, t.logo_url]
    );
  }
  console.log(`✅ Seeded ${teams.length} teams.`);

  // 2. Build and insert Players
  const players = generateDefaultPlayers(teams);
  for (const p of players) {
    await run(
      `INSERT INTO players (id, team_id, name, jersey_number, role, is_captain, avatar_url, goals, assists, passes, clean_sheets, tackles, shots, saves, minutes, yellow_cards, red_cards)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.team_id, p.name, p.jersey_number, p.role, p.is_captain, p.avatar_url, p.goals, p.assists, p.passes, p.clean_sheets, p.tackles, p.shots, p.saves, p.minutes, p.yellow_cards, p.red_cards]
    );
  }
  console.log(`✅ Seeded ${players.length} players.`);

  // 3. Build Matches (Group Stage + Knockout)
  const matches = [];
  let matchId = 1;

  // Group Stage Games 1, 2, 3
  GROUP_LETTERS.forEach((grp, gIdx) => {
    const baseT = gIdx * 4;
    // Game 1
    matches.push({
      id: `m${matchId++}`, round: "Game 1", stage: "Group Stage", group_letter: grp,
      match_date: "2026-10-03", match_time: `${9 + (gIdx % 4)}:00`, pitch: `Pitch ${String.fromCharCode(65 + (gIdx % 3))}`,
      home_team_id: `t${baseT + 1}`, away_team_id: `t${baseT + 2}`, home_score: null, away_score: null, status: "Scheduled", label: null
    });
    matches.push({
      id: `m${matchId++}`, round: "Game 1", stage: "Group Stage", group_letter: grp,
      match_date: "2026-10-04", match_time: `${10 + (gIdx % 4)}:00`, pitch: `Pitch ${String.fromCharCode(65 + ((gIdx + 1) % 3))}`,
      home_team_id: `t${baseT + 3}`, away_team_id: `t${baseT + 4}`, home_score: null, away_score: null, status: "Scheduled", label: null
    });

    // Game 2
    matches.push({
      id: `m${matchId++}`, round: "Game 2", stage: "Group Stage", group_letter: grp,
      match_date: "2026-10-10", match_time: `${9 + (gIdx % 4)}:00`, pitch: `Pitch ${String.fromCharCode(65 + (gIdx % 3))}`,
      home_team_id: `t${baseT + 1}`, away_team_id: `t${baseT + 3}`, home_score: null, away_score: null, status: "Scheduled", label: null
    });
    matches.push({
      id: `m${matchId++}`, round: "Game 2", stage: "Group Stage", group_letter: grp,
      match_date: "2026-10-11", match_time: `${10 + (gIdx % 4)}:00`, pitch: `Pitch ${String.fromCharCode(65 + ((gIdx + 1) % 3))}`,
      home_team_id: `t${baseT + 2}`, away_team_id: `t${baseT + 4}`, home_score: null, away_score: null, status: "Scheduled", label: null
    });

    // Game 3
    matches.push({
      id: `m${matchId++}`, round: "Game 3", stage: "Group Stage", group_letter: grp,
      match_date: "2026-10-17", match_time: `${9 + (gIdx % 4)}:00`, pitch: `Pitch ${String.fromCharCode(65 + (gIdx % 3))}`,
      home_team_id: `t${baseT + 1}`, away_team_id: `t${baseT + 4}`, home_score: null, away_score: null, status: "Scheduled", label: null
    });
    matches.push({
      id: `m${matchId++}`, round: "Game 3", stage: "Group Stage", group_letter: grp,
      match_date: "2026-10-18", match_time: `${10 + (gIdx % 4)}:00`, pitch: `Pitch ${String.fromCharCode(65 + ((gIdx + 1) % 3))}`,
      home_team_id: `t${baseT + 2}`, away_team_id: `t${baseT + 3}`, home_score: null, away_score: null, status: "Scheduled", label: null
    });
  });

  // Knockouts (R16, QF, SF, Final, 3rd)
  const knockouts = [
    { id: "m_r16_1", round: "Round of 16", stage: "Knockout", group_letter: null, match_date: "2026-10-24", match_time: "10:00", pitch: "Pitch A", home_team_id: "t1", away_team_id: "t6", home_score: null, away_score: null, status: "Scheduled", label: "1A vs 2B" },
    { id: "m_r16_2", round: "Round of 16", stage: "Knockout", group_letter: null, match_date: "2026-10-24", match_time: "11:30", pitch: "Pitch B", home_team_id: "t9", away_team_id: "t14", home_score: null, away_score: null, status: "Scheduled", label: "1C vs 2D" },
    { id: "m_r16_3", round: "Round of 16", stage: "Knockout", group_letter: null, match_date: "2026-10-24", match_time: "13:00", pitch: "Pitch A", home_team_id: "t17", away_team_id: "t22", home_score: null, away_score: null, status: "Scheduled", label: "1E vs 2F" },
    { id: "m_r16_4", round: "Round of 16", stage: "Knockout", group_letter: null, match_date: "2026-10-24", match_time: "14:30", pitch: "Pitch B", home_team_id: "t25", away_team_id: "t30", home_score: null, away_score: null, status: "Scheduled", label: "1G vs 2H" },
    { id: "m_r16_5", round: "Round of 16", stage: "Knockout", group_letter: null, match_date: "2026-10-25", match_time: "10:00", pitch: "Pitch A", home_team_id: "t5", away_team_id: "t2", home_score: null, away_score: null, status: "Scheduled", label: "1B vs 2A" },
    { id: "m_r16_6", round: "Round of 16", stage: "Knockout", group_letter: null, match_date: "2026-10-25", match_time: "11:30", pitch: "Pitch B", home_team_id: "t13", away_team_id: "t10", home_score: null, away_score: null, status: "Scheduled", label: "1D vs 2C" },
    { id: "m_r16_7", round: "Round of 16", stage: "Knockout", group_letter: null, match_date: "2026-10-25", match_time: "13:00", pitch: "Pitch A", home_team_id: "t21", away_team_id: "t18", home_score: null, away_score: null, status: "Scheduled", label: "1F vs 2E" },
    { id: "m_r16_8", round: "Round of 16", stage: "Knockout", group_letter: null, match_date: "2026-10-25", match_time: "14:30", pitch: "Pitch B", home_team_id: "t29", away_team_id: "t26", home_score: null, away_score: null, status: "Scheduled", label: "1H vs 2G" },
    { id: "m_qf_1", round: "Quarter Finals", stage: "Knockout", group_letter: null, match_date: "2026-10-31", match_time: "10:00", pitch: "Pitch A", home_team_id: "t1", away_team_id: "t9", home_score: null, away_score: null, status: "Scheduled", label: "QF 1" },
    { id: "m_qf_2", round: "Quarter Finals", stage: "Knockout", group_letter: null, match_date: "2026-10-31", match_time: "11:30", pitch: "Pitch B", home_team_id: "t17", away_team_id: "t25", home_score: null, away_score: null, status: "Scheduled", label: "QF 2" },
    { id: "m_qf_3", round: "Quarter Finals", stage: "Knockout", group_letter: null, match_date: "2026-10-31", match_time: "13:00", pitch: "Pitch A", home_team_id: "t5", away_team_id: "t13", home_score: null, away_score: null, status: "Scheduled", label: "QF 3" },
    { id: "m_qf_4", round: "Quarter Finals", stage: "Knockout", group_letter: null, match_date: "2026-10-31", match_time: "14:30", pitch: "Pitch B", home_team_id: "t21", away_team_id: "t29", home_score: null, away_score: null, status: "Scheduled", label: "QF 4" },
    { id: "m_sf_1", round: "Semi Finals", stage: "Knockout", group_letter: null, match_date: "2026-11-04", match_time: "18:30", pitch: "Pitch A", home_team_id: "t1", away_team_id: "t17", home_score: null, away_score: null, status: "Scheduled", label: "SF 1" },
    { id: "m_sf_2", round: "Semi Finals", stage: "Knockout", group_letter: null, match_date: "2026-11-04", match_time: "20:00", pitch: "Pitch A", home_team_id: "t5", away_team_id: "t21", home_score: null, away_score: null, status: "Scheduled", label: "SF 2" },
    { id: "m_final", round: "Final", stage: "Knockout", group_letter: null, match_date: "2026-11-07", match_time: "17:00", pitch: "Pitch A", home_team_id: "t1", away_team_id: "t5", home_score: null, away_score: null, status: "Scheduled", label: "Grand Final" }
  ];

  matches.push(...knockouts);

  for (const m of matches) {
    await run(
      `INSERT INTO matches (id, round, stage, group_letter, match_date, match_time, pitch, home_team_id, away_team_id, home_score, away_score, status, label)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [m.id, m.round, m.stage, m.group_letter, m.match_date, m.match_time, m.pitch, m.home_team_id, m.away_team_id, m.home_score, m.away_score, m.status, m.label]
    );
  }
  console.log(`✅ Seeded ${matches.length} matches.`);

  // 4. Tournament metadata
  await run(`INSERT OR REPLACE INTO tournament_info (key, value) VALUES ('name', 'Road to the Final')`);
  await run(`INSERT OR REPLACE INTO tournament_info (key, value) VALUES ('edition', '2026')`);
  await run(`INSERT OR REPLACE INTO tournament_info (key, value) VALUES ('season', 'Summer Edition')`);
  await run(`INSERT OR REPLACE INTO tournament_info (key, value) VALUES ('venue', 'Edenvale Indoor Soccer')`);
  await run(`INSERT OR REPLACE INTO tournament_info (key, value) VALUES ('registrationFee', 'R350 per team')`);

  console.log('🏆 Tournament database seeding complete!');
}

module.exports = { seedDatabase };

if (require.main === module) {
  seedDatabase(true).then(() => {
    console.log('Done!');
    process.exit(0);
  }).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
