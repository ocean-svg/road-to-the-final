// ==========================================================================
// ROAD TO THE FINAL 2026 — SQLITE DATABASE CLIENT & SCOREKEEPER CONTROLLER
// Seamless sync between SQLite REST API backend and frontend UI
// ==========================================================================

const API_BASE = window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:3000';
let isDbConnected = false;
let dbStats = null;
let currentScorekeeperMatchId = null;
let currentManagerTeamId = 't1';

// ── 1. INITIALIZE DATABASE SYNC ──
async function initDatabaseSync() {
  const dbStatusBadge = document.getElementById('db-status-badge');
  const dbTopIndicator = document.getElementById('db-top-indicator');

  try {
    const res = await fetch(`${API_BASE}/api/status`);
    if (!res.ok) throw new Error('API server offline');
    
    dbStats = await res.json();
    isDbConnected = true;
    console.log('✅ Connected to SQLite Database API:', dbStats);

    if (dbStatusBadge) {
      dbStatusBadge.innerHTML = `<span class="db-dot green"></span> SQLite DB: <strong>${dbStats.counts.players} Players, ${dbStats.counts.matches} Matches</strong>`;
      dbStatusBadge.classList.add('online');
    }
    if (dbTopIndicator) {
      dbTopIndicator.innerHTML = `🟢 DB ONLINE`;
      dbTopIndicator.title = `Connected to SQLite Database (${dbStats.counts.teams} Teams, ${dbStats.counts.players} Players)`;
    }

    // Load live tournament data from SQLite DB
    await syncAllFromDatabase();

  } catch (err) {
    console.warn('⚠️ SQLite Backend API not reached (running in offline mode):', err.message);
    isDbConnected = false;
    if (dbStatusBadge) {
      dbStatusBadge.innerHTML = `<span class="db-dot yellow"></span> Local Mode (Server: <code>npm start</code>)`;
      dbStatusBadge.classList.remove('online');
    }
    if (dbTopIndicator) {
      dbTopIndicator.innerHTML = `🟡 LOCAL MODE`;
      dbTopIndicator.title = 'Start backend server with: npm start';
    }
  }
}

// ── 2. DATA SYNC FUNCTIONS ──
async function syncAllFromDatabase() {
  if (!isDbConnected) return;

  try {
    const [teamsRes, playersRes, matchesRes] = await Promise.all([
      fetch(`${API_BASE}/api/teams`),
      fetch(`${API_BASE}/api/players`),
      fetch(`${API_BASE}/api/matches`)
    ]);

    if (teamsRes.ok) {
      const dbTeams = await teamsRes.json();
      if (dbTeams && dbTeams.length > 0) {
        TEAMS = dbTeams.map(t => ({
          id: t.id,
          name: t.name,
          shortName: t.short_name,
          group: t.group_letter,
          color: t.color,
          accentColor: t.accent_color,
          logoUrl: t.logo_url
        }));
      }
    }

    if (playersRes.ok) {
      const dbPlayers = await playersRes.json();
      if (dbPlayers && dbPlayers.length > 0) {
        STAT_PLAYERS.length = 0;
        dbPlayers.forEach(p => {
          STAT_PLAYERS.push({
            id: p.id,
            name: p.name,
            teamId: p.team_id,
            role: p.role,
            jerseyNumber: p.jersey_number,
            isCaptain: p.is_captain === 1,
            goals: p.goals || 0,
            assists: p.assists || 0,
            passes: p.passes || 0,
            cleanSheets: p.clean_sheets || 0,
            tackles: p.tackles || 0,
            shots: p.shots || 0,
            saves: p.saves || 0,
            minutes: p.minutes || 0,
            yellowCards: p.yellow_cards || 0,
            redCards: p.red_cards || 0
          });
        });
      }
    }

    if (matchesRes.ok) {
      const dbMatches = await matchesRes.json();
      if (dbMatches && dbMatches.length > 0) {
        MATCHES.length = 0;
        dbMatches.forEach(m => {
          MATCHES.push({
            id: m.id,
            round: m.round,
            stage: m.stage,
            group: m.group_letter,
            date: m.match_date,
            time: m.match_time,
            pitch: m.pitch,
            homeTeam: m.home_team_id,
            awayTeam: m.away_team_id,
            homeScore: m.home_score,
            awayScore: m.away_score,
            penaltyHomeScore: m.penalty_home_score,
            penaltyAwayScore: m.penalty_away_score,
            status: m.status,
            label: m.label
          });
        });
      }
    }

    // Refresh UI components
    if (typeof renderFIFAMatches === 'function') renderFIFAMatches();
    if (typeof renderStandingsAndBracket === 'function') renderStandingsAndBracket();
    if (typeof renderStatsCentre === 'function') renderStatsCentre();
    if (typeof renderTeamsGrid === 'function') renderTeamsGrid();

  } catch (err) {
    console.error('Error syncing data from database:', err);
  }
}

// ── 3. SCOREKEEPER MODAL CONTROLLER ──
function openScorekeeperModal(target = null) {
  if (typeof isDevAuthed === 'function' && !isDevAuthed()) {
    requireDevAuth(() => openScorekeeperModal(target));
    return;
  }

  const modal = document.getElementById('modal-scorekeeper');
  if (!modal) return;

  if (target === 'signups') {
    switchScorekeeperTab('signups');
  } else {
    switchScorekeeperTab('matches');
    populateScorekeeperMatchList(typeof target === 'string' && target !== 'matches' ? target : null);
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function switchScorekeeperTab(tabName) {
  const btnMatches = document.getElementById('sk-tab-btn-matches');
  const btnSignups = document.getElementById('sk-tab-btn-signups');
  const contentMatches = document.getElementById('sk-tab-content-matches');
  const contentSignups = document.getElementById('sk-tab-content-signups');

  if (tabName === 'signups') {
    if (btnMatches) btnMatches.classList.remove('active');
    if (btnSignups) btnSignups.classList.add('active');
    if (contentMatches) contentMatches.style.display = 'none';
    if (contentSignups) contentSignups.style.display = 'block';
    fetchSignupsFromDb();
  } else {
    if (btnSignups) btnSignups.classList.remove('active');
    if (btnMatches) btnMatches.classList.add('active');
    if (contentSignups) contentSignups.style.display = 'none';
    if (contentMatches) contentMatches.style.display = 'block';
  }
}

function closeScorekeeperModal() {
  const modal = document.getElementById('modal-scorekeeper');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function populateScorekeeperMatchList(selectMatchId = null) {
  const select = document.getElementById('sk-match-select');
  if (!select) return;

  select.innerHTML = '';
  MATCHES.forEach(m => {
    const hTeam = getTeam(m.homeTeam);
    const aTeam = getTeam(m.awayTeam);
    const opt = document.createElement('option');
    opt.value = m.id;
    const scoreText = (m.homeScore !== null && m.awayScore !== null) ? `[${m.homeScore} - ${m.awayScore}]` : `[vs]`;
    opt.textContent = `${m.round} (${m.group ? 'Group ' + m.group : 'KO'}): ${hTeam.name} ${scoreText} ${aTeam.name} — ${m.status}`;
    select.appendChild(opt);
  });

  if (selectMatchId && MATCHES.some(m => m.id === selectMatchId)) {
    select.value = selectMatchId;
  } else if (MATCHES.length > 0) {
    select.value = MATCHES[0].id;
  }

  loadScorekeeperMatchData(select.value);
}

async function loadScorekeeperMatchData(matchId) {
  currentScorekeeperMatchId = matchId;
  const match = MATCHES.find(m => m.id === matchId);
  if (!match) return;

  const hTeam = getTeam(match.homeTeam);
  const aTeam = getTeam(match.awayTeam);

  document.getElementById('sk-home-name').textContent = hTeam.name;
  document.getElementById('sk-away-name').textContent = aTeam.name;
  document.getElementById('sk-home-crest').innerHTML = teamCrestHTML(hTeam, 40);
  document.getElementById('sk-away-crest').innerHTML = teamCrestHTML(aTeam, 40);

  document.getElementById('sk-home-score').value = match.homeScore !== null ? match.homeScore : '';
  document.getElementById('sk-away-score').value = match.awayScore !== null ? match.awayScore : '';
  document.getElementById('sk-status').value = match.status || 'Scheduled';
  document.getElementById('sk-pitch').value = match.pitch || 'Pitch A';
  document.getElementById('sk-date').value = match.date || '2026-10-03';
  document.getElementById('sk-time').value = match.time || '09:00';

  // Load Team players into event dropdowns
  populateEventPlayerDropdowns(match.homeTeam, match.awayTeam);

  // Load logged match events from DB
  await loadMatchEvents(matchId);
}

function populateEventPlayerDropdowns(homeTeamId, awayTeamId) {
  const teamSelect = document.getElementById('sk-event-team');
  const playerSelect = document.getElementById('sk-event-player');
  if (!teamSelect || !playerSelect) return;

  const hTeam = getTeam(homeTeamId);
  const aTeam = getTeam(awayTeamId);

  teamSelect.innerHTML = `
    <option value="${hTeam.id}">${hTeam.name} (Home)</option>
    <option value="${aTeam.id}">${aTeam.name} (Away)</option>
  `;

  updateEventPlayerOptions();
}

function updateEventPlayerOptions() {
  const teamSelect = document.getElementById('sk-event-team');
  const playerSelect = document.getElementById('sk-event-player');
  if (!teamSelect || !playerSelect) return;

  const selectedTeamId = teamSelect.value;
  const teamPlayers = STAT_PLAYERS.filter(p => p.teamId === selectedTeamId);

  playerSelect.innerHTML = '<option value="">-- Select Player --</option>';
  teamPlayers.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `#${p.jerseyNumber || '-'} ${p.name} (${p.role || 'Player'})`;
    playerSelect.appendChild(opt);
  });
}

// Save Match Score & Metadata
async function saveMatchScoreFromPanel(e) {
  if (e) e.preventDefault();
  if (!currentScorekeeperMatchId) return;

  const homeScoreVal = document.getElementById('sk-home-score').value;
  const awayScoreVal = document.getElementById('sk-away-score').value;
  const status = document.getElementById('sk-status').value;
  const pitch = document.getElementById('sk-pitch').value;
  const match_date = document.getElementById('sk-date').value;
  const match_time = document.getElementById('sk-time').value;

  const home_score = homeScoreVal === '' ? null : parseInt(homeScoreVal, 10);
  const away_score = awayScoreVal === '' ? null : parseInt(awayScoreVal, 10);

  // Update in-memory match
  const match = MATCHES.find(m => m.id === currentScorekeeperMatchId);
  if (match) {
    match.homeScore = home_score;
    match.awayScore = away_score;
    match.status = status;
    match.pitch = pitch;
    match.date = match_date;
    match.time = match_time;
  }

  if (isDbConnected) {
    try {
      const res = await fetch(`${API_BASE}/api/matches/${currentScorekeeperMatchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ home_score, away_score, status, pitch, match_date, match_time })
      });
      if (!res.ok) throw new Error('Failed to update match in database');
      showToast(`✅ Match Score Saved to SQLite DB: ${home_score ?? 0} - ${away_score ?? 0}`);
    } catch (err) {
      console.error(err);
      showToast('⚠️ Score saved locally (DB sync failed)');
    }
  } else {
    showToast(`✅ Score saved in local mode: ${home_score ?? 0} - ${away_score ?? 0}`);
  }

  // Refresh entire UI
  if (typeof renderFIFAMatches === 'function') renderFIFAMatches();
  if (typeof renderStandingsAndBracket === 'function') renderStandingsAndBracket();
  if (typeof renderStatsCentre === 'function') renderStatsCentre();

  // Update match dropdown title
  populateScorekeeperMatchList(currentScorekeeperMatchId);
}

// ── 4. MATCH EVENTS LOGGING (Goals, Cards, Saves) ──
async function loadMatchEvents(matchId) {
  const container = document.getElementById('sk-events-timeline');
  if (!container) return;

  if (!isDbConnected) {
    container.innerHTML = '<div style="font-size:12px;color:var(--text-dim);text-align:center;padding:12px;">Start backend server (`npm start`) to log live database match timeline events.</div>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/matches/${matchId}/events`);
    if (!res.ok) throw new Error('Failed to fetch events');
    const events = await res.json();

    if (!events || events.length === 0) {
      container.innerHTML = '<div style="font-size:12px;color:var(--text-dim);text-align:center;padding:10px;">No events logged for this fixture yet.</div>';
      return;
    }

    let html = '';
    events.forEach(ev => {
      const iconMap = {
        goal: '⚽ GOAL',
        assist: '🎯 ASSIST',
        yellow_card: '🟨 YELLOW CARD',
        red_card: '🟥 RED CARD',
        save: '🧤 SAVE'
      };
      const badgeText = iconMap[ev.event_type] || ev.event_type.toUpperCase();

      html += `
        <div class="sk-event-row">
          <span class="sk-event-minute">${ev.minute}'</span>
          <span class="sk-event-badge ${ev.event_type}">${badgeText}</span>
          <div class="sk-event-info">
            <strong>${ev.playerName || 'Unknown Player'}</strong>
            <span style="color:var(--text-dim);font-size:11px;">(${ev.teamName})</span>
            ${ev.notes ? `<span style="font-size:11px;color:var(--text-muted);display:block;">${ev.notes}</span>` : ''}
          </div>
          <button class="sk-delete-event-btn" onclick="deleteMatchEvent('${ev.id}')" title="Delete event">&times;</button>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div style="font-size:12px;color:red;padding:8px;">Error loading events: ${err.message}</div>`;
  }
}

async function addMatchEventFromPanel(e) {
  if (e) e.preventDefault();
  if (!currentScorekeeperMatchId) return;

  const teamId = document.getElementById('sk-event-team').value;
  const playerId = document.getElementById('sk-event-player').value;
  const eventType = document.getElementById('sk-event-type').value;
  const minute = parseInt(document.getElementById('sk-event-minute').value || '1', 10);
  const notes = document.getElementById('sk-event-notes').value || '';

  if (!teamId || !eventType) {
    showToast('⚠️ Please select a team and event type.');
    return;
  }

  if (isDbConnected) {
    try {
      const res = await fetch(`${API_BASE}/api/matches/${currentScorekeeperMatchId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId, player_id: playerId, event_type: eventType, minute, notes })
      });

      if (!res.ok) throw new Error('Failed to save event');
      showToast(`✅ Event logged: ${eventType.toUpperCase()} recorded!`);

      // Clear input fields
      document.getElementById('sk-event-notes').value = '';
      
      // Reload events and refresh player stats from DB
      await loadMatchEvents(currentScorekeeperMatchId);
      await syncAllFromDatabase();

    } catch (err) {
      console.error(err);
      showToast('❌ Failed to log event to database.');
    }
  } else {
    showToast('⚠️ SQLite server required to persist individual match events.');
  }
}

async function deleteMatchEvent(eventId) {
  if (!confirm('Are you sure you want to delete this event? Player stats will be automatically reverted.')) return;

  try {
    const res = await fetch(`${API_BASE}/api/matches/${currentScorekeeperMatchId}/events/${eventId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete event');

    showToast('🗑️ Event removed and player stats updated.');
    await loadMatchEvents(currentScorekeeperMatchId);
    await syncAllFromDatabase();
  } catch (err) {
    console.error(err);
    showToast('❌ Error deleting event');
  }
}

// ── 5. PLAYER ROSTER & PROFILES MANAGER ──
function openPlayerManagerModal(teamId = 't1') {
  if (typeof isDevAuthed === 'function' && !isDevAuthed()) {
    requireDevAuth(() => openPlayerManagerModal(teamId));
    return;
  }

  currentManagerTeamId = teamId;
  const modal = document.getElementById('modal-player-manager');
  if (!modal) return;

  populateManagerTeamList(teamId);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePlayerManagerModal() {
  const modal = document.getElementById('modal-player-manager');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function populateManagerTeamList(selectedTeamId) {
  const select = document.getElementById('pm-team-select');
  if (!select) return;

  select.innerHTML = '';
  TEAMS.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `Group ${t.group}: ${t.name} (${t.shortName})`;
    select.appendChild(opt);
  });

  select.value = selectedTeamId || TEAMS[0].id;
  loadManagerTeamRoster(select.value);
}

function loadManagerTeamRoster(teamId) {
  currentManagerTeamId = teamId;
  const team = getTeam(teamId);
  const container = document.getElementById('pm-roster-list');
  if (!container) return;

  const players = STAT_PLAYERS.filter(p => p.teamId === teamId);

  document.getElementById('pm-team-title').textContent = `${team.name} — Official Squad Roster`;
  document.getElementById('pm-team-count').textContent = `${players.length} Players Registered`;

  if (players.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:30px;background:#f8fafc;border-radius:8px;border:1px dashed var(--border-color);">
        <p style="font-size:13px;color:var(--text-dim);margin-bottom:8px;">No players registered in this team squad yet.</p>
        <button class="stage-tab-btn active" onclick="openAddPlayerForm('${teamId}')" style="font-size:12px;padding:6px 14px;border-radius:20px;">+ Add First Player</button>
      </div>
    `;
    return;
  }

  let html = '';
  players.forEach(p => {
    html += `
      <div class="pm-player-card">
        <div class="pm-jersey-badge" style="background:${team.color};color:${team.accentColor};">
          #${p.jerseyNumber || 10}
        </div>
        <div class="pm-player-details">
          <div style="display:flex;align-items:center;gap:6px;">
            <strong style="font-size:14px;color:var(--fifa-navy-dark);">${p.name}</strong>
            <span class="player-slot-tag ${p.role === 'GK' ? 'gk' : 'outfield'}">${p.role}</span>
            ${p.isCaptain ? '<span class="player-slot-tag" style="background:#fef3c7;color:#d97706;">CAPTAIN</span>' : ''}
          </div>
          <div class="pm-player-stat-row">
            <span>⚽ <strong>${p.goals}</strong> Goals</span>
            <span>🎯 <strong>${p.assists}</strong> Assists</span>
            <span>🧤 <strong>${p.saves}</strong> Saves</span>
            <span>🟨 <strong>${p.yellowCards}</strong></span>
            <span>🟥 <strong>${p.redCards}</strong></span>
          </div>
        </div>
        <div class="pm-card-actions">
          <button class="pm-btn-edit" onclick="openEditPlayerForm('${p.id}')">✏️ Edit</button>
          <button class="pm-btn-del" onclick="deletePlayerFromDb('${p.id}')">🗑️</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Add / Edit Player Modal
function openAddPlayerForm(teamId = null) {
  const targetTeamId = teamId || currentManagerTeamId;
  const team = getTeam(targetTeamId);

  document.getElementById('pe-modal-title').textContent = `➕ Add Player to ${team.name}`;
  document.getElementById('pe-player-id').value = '';
  document.getElementById('pe-team-id').value = targetTeamId;
  document.getElementById('pe-name').value = '';
  document.getElementById('pe-jersey').value = Math.floor(Math.random() * 30) + 1;
  document.getElementById('pe-role').value = 'FWD';
  document.getElementById('pe-captain').checked = false;
  document.getElementById('pe-goals').value = 0;
  document.getElementById('pe-assists').value = 0;
  document.getElementById('pe-saves').value = 0;
  document.getElementById('pe-cleansheets').value = 0;
  document.getElementById('pe-yellow').value = 0;
  document.getElementById('pe-red').value = 0;

  const modal = document.getElementById('modal-player-edit');
  if (modal) modal.classList.add('open');
}

function openEditPlayerForm(playerId) {
  const player = STAT_PLAYERS.find(p => p.id === playerId);
  if (!player) return;

  const team = getTeam(player.teamId);

  document.getElementById('pe-modal-title').textContent = `✏️ Edit Player: ${player.name} (${team.name})`;
  document.getElementById('pe-player-id').value = player.id;
  document.getElementById('pe-team-id').value = player.teamId;
  document.getElementById('pe-name').value = player.name;
  document.getElementById('pe-jersey').value = player.jerseyNumber || 10;
  document.getElementById('pe-role').value = player.role || 'FWD';
  document.getElementById('pe-captain').checked = !!player.isCaptain;
  document.getElementById('pe-goals').value = player.goals || 0;
  document.getElementById('pe-assists').value = player.assists || 0;
  document.getElementById('pe-saves').value = player.saves || 0;
  document.getElementById('pe-cleansheets').value = player.cleanSheets || 0;
  document.getElementById('pe-yellow').value = player.yellowCards || 0;
  document.getElementById('pe-red').value = player.redCards || 0;

  const modal = document.getElementById('modal-player-edit');
  if (modal) modal.classList.add('open');
}

function closePlayerEditModal() {
  const modal = document.getElementById('modal-player-edit');
  if (modal) modal.classList.remove('open');
}

async function savePlayerFromForm(e) {
  if (e) e.preventDefault();

  const id = document.getElementById('pe-player-id').value;
  const team_id = document.getElementById('pe-team-id').value;
  const name = document.getElementById('pe-name').value.trim();
  const jersey_number = parseInt(document.getElementById('pe-jersey').value || '10', 10);
  const role = document.getElementById('pe-role').value;
  const is_captain = document.getElementById('pe-captain').checked ? 1 : 0;
  const goals = parseInt(document.getElementById('pe-goals').value || '0', 10);
  const assists = parseInt(document.getElementById('pe-assists').value || '0', 10);
  const saves = parseInt(document.getElementById('pe-saves').value || '0', 10);
  const clean_sheets = parseInt(document.getElementById('pe-cleansheets').value || '0', 10);
  const yellow_cards = parseInt(document.getElementById('pe-yellow').value || '0', 10);
  const red_cards = parseInt(document.getElementById('pe-red').value || '0', 10);

  if (!name) {
    showToast('⚠️ Please enter a player name.');
    return;
  }

  const isEditing = !!id;

  if (isDbConnected) {
    try {
      const url = isEditing ? `${API_BASE}/api/players/${id}` : `${API_BASE}/api/players`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id, name, jersey_number, role, is_captain,
          goals, assists, saves, clean_sheets, yellow_cards, red_cards
        })
      });

      if (!res.ok) throw new Error('Failed to save player');
      showToast(`✅ Player ${name} ${isEditing ? 'updated' : 'created'} in SQLite DB!`);

      closePlayerEditModal();
      await syncAllFromDatabase();
      loadManagerTeamRoster(team_id);

    } catch (err) {
      console.error(err);
      showToast('❌ Error saving player to database.');
    }
  } else {
    // Local fallback
    if (isEditing) {
      const p = STAT_PLAYERS.find(item => item.id === id);
      if (p) {
        p.name = name;
        p.jerseyNumber = jersey_number;
        p.role = role;
        p.isCaptain = !!is_captain;
        p.goals = goals;
        p.assists = assists;
        p.saves = saves;
        p.cleanSheets = clean_sheets;
        p.yellowCards = yellow_cards;
        p.redCards = red_cards;
      }
    } else {
      STAT_PLAYERS.push({
        id: `p_${Date.now()}`,
        teamId: team_id,
        name,
        jerseyNumber: jersey_number,
        role,
        isCaptain: !!is_captain,
        goals,
        assists,
        passes: 50,
        cleanSheets: clean_sheets,
        tackles: 5,
        shots: 5,
        saves,
        minutes: 90,
        yellowCards: yellow_cards,
        redCards: red_cards
      });
    }

    showToast(`✅ Player ${name} saved locally!`);
    closePlayerEditModal();
    loadManagerTeamRoster(team_id);
    if (typeof renderStatsCentre === 'function') renderStatsCentre();
  }
}

async function deletePlayerFromDb(playerId) {
  const p = STAT_PLAYERS.find(item => item.id === playerId);
  if (!confirm(`Are you sure you want to delete ${p ? p.name : 'this player'}?`)) return;

  if (isDbConnected) {
    try {
      const res = await fetch(`${API_BASE}/api/players/${playerId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete player');
      showToast('🗑️ Player deleted from SQLite database.');
      await syncAllFromDatabase();
      loadManagerTeamRoster(currentManagerTeamId);
    } catch (err) {
      console.error(err);
      showToast('❌ Error deleting player');
    }
  } else {
    const idx = STAT_PLAYERS.findIndex(item => item.id === playerId);
    if (idx !== -1) {
      STAT_PLAYERS.splice(idx, 1);
      showToast('🗑️ Player deleted.');
      loadManagerTeamRoster(currentManagerTeamId);
      if (typeof renderStatsCentre === 'function') renderStatsCentre();
    }
  }
}

// ── 7. TEAM SIGNUPS & PAYMENT APPROVALS CONTROLLER ──
let devSignups = [];

async function fetchSignupsFromDb() {
  const container = document.getElementById('sk-signups-list-container');
  if (container) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-dim);font-size:13px;">⏳ Loading team registrations from database...</div>';
  }

  if (isDbConnected) {
    try {
      const res = await fetch(`${API_BASE}/api/signups`);
      if (!res.ok) throw new Error('Failed to fetch signups');
      devSignups = await res.json();
      localStorage.setItem('rttf_pending_signups', JSON.stringify(devSignups));
    } catch (err) {
      console.warn('Could not fetch signups from server, using local storage:', err);
      const stored = localStorage.getItem('rttf_pending_signups');
      devSignups = stored ? JSON.parse(stored) : [];
    }
  } else {
    const stored = localStorage.getItem('rttf_pending_signups');
    devSignups = stored ? JSON.parse(stored) : [];
  }

  updateDevPendingBadges();
  renderDevSignupsList();
}

function updateDevPendingBadges() {
  const pendingCount = devSignups.filter(s => s.status === 'pending').length;
  
  const b1 = document.getElementById('dev-pending-badge');
  const b2 = document.getElementById('dev-banner-pending-count');
  const b3 = document.getElementById('sk-tab-signups-badge');

  if (b1) b1.textContent = pendingCount;
  if (b2) b2.textContent = pendingCount;
  if (b3) b3.textContent = pendingCount;
}

async function submitTeamSignupToDb(data) {
  const localId = `signup_${Date.now()}`;
  const record = {
    id: localId,
    team_name: data.team_name,
    short_code: data.short_code || data.team_name.slice(0, 4).toUpperCase(),
    captain_name: data.captain_name,
    captain_phone: data.captain_phone,
    group_pref: data.group_pref || 'Any Group',
    kit_primary: data.kit_primary || '#001438',
    kit_secondary: data.kit_secondary || '#00d4ff',
    players_json: JSON.stringify(data.players || []),
    payment_status: 'Pending Payment',
    status: 'pending',
    created_at: new Date().toISOString()
  };

  // Always save in localStorage backup
  let localSignups = [];
  try {
    const stored = localStorage.getItem('rttf_pending_signups');
    localSignups = stored ? JSON.parse(stored) : [];
  } catch(e) { localSignups = []; }
  localSignups.unshift(record);
  localStorage.setItem('rttf_pending_signups', JSON.stringify(localSignups));
  devSignups = localSignups;
  updateDevPendingBadges();

  if (isDbConnected) {
    try {
      const res = await fetch(`${API_BASE}/api/signups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_name: data.team_name,
          short_code: data.short_code,
          captain_name: data.captain_name,
          captain_phone: data.captain_phone,
          group_pref: data.group_pref,
          kit_primary: data.kit_primary,
          kit_secondary: data.kit_secondary,
          players: data.players
        })
      });
      if (!res.ok) throw new Error('Server error registering team');
      console.log('✅ Team sign-up saved to SQLite database.');
      await fetchSignupsFromDb();
    } catch (err) {
      console.warn('Saved sign-up locally (DB sync failed):', err.message);
    }
  }
}

async function markSignupPaymentSent(signupId) {
  const item = devSignups.find(s => s.id === signupId);
  if (!item) return;

  const newStatus = (item.payment_status === 'Payment Verified') ? 'Pending Payment' : 'Payment Verified';

  if (isDbConnected) {
    try {
      const res = await fetch(`${API_BASE}/api/signups/${signupId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update payment status');
      showToast(`💵 Payment status updated: ${newStatus}`);
      await fetchSignupsFromDb();
    } catch (err) {
      console.error(err);
      item.payment_status = newStatus;
      localStorage.setItem('rttf_pending_signups', JSON.stringify(devSignups));
      showToast(`💵 Payment status updated locally: ${newStatus}`);
      renderDevSignupsList();
    }
  } else {
    item.payment_status = newStatus;
    localStorage.setItem('rttf_pending_signups', JSON.stringify(devSignups));
    showToast(`💵 Payment status updated: ${newStatus}`);
    renderDevSignupsList();
  }
}

async function admitSignupTeam(signupId) {
  const item = devSignups.find(s => s.id === signupId);
  if (!item) return;

  if (item.payment_status !== 'Payment Verified') {
    const confirmPay = confirm(`⚠️ Payment for "${item.team_name}" is currently marked as PENDING.\n\nDo you want to verify payment and admit the team now?`);
    if (!confirmPay) return;
  }

  const slotSelect = document.getElementById(`slot-select-${signupId}`);
  const targetTeamId = slotSelect ? slotSelect.value : null;

  if (isDbConnected) {
    try {
      showToast(`⏳ Admitting ${item.team_name} to tournament database...`);
      const res = await fetch(`${API_BASE}/api/signups/${signupId}/admit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTeamId })
      });

      if (!res.ok) throw new Error('Failed to admit team');
      const data = await res.json();

      showToast(`🎉 ${data.message || `Team ${item.team_name} successfully admitted!`}`);
      await syncAllFromDatabase();
      await fetchSignupsFromDb();
    } catch (err) {
      console.error(err);
      showToast('❌ Error admitting team to database.');
    }
  } else {
    // Offline / Local Mode admission fallback
    let target = TEAMS.find(t => t.id === targetTeamId) || TEAMS.find(t => t.name.startsWith('TBD')) || TEAMS[0];
    if (target) {
      target.name = item.team_name;
      target.shortName = item.short_code || item.team_name.slice(0, 4).toUpperCase();
      target.color = item.kit_primary || '#001438';
      target.accentColor = item.kit_secondary || '#00d4ff';

      // Insert registered players
      let pList = [];
      try { pList = JSON.parse(item.players_json || '[]'); } catch(e) { pList = []; }

      if (pList.length > 0) {
        // Remove dummy players
        for (let i = STAT_PLAYERS.length - 1; i >= 0; i--) {
          if (STAT_PLAYERS[i].teamId === target.id) STAT_PLAYERS.splice(i, 1);
        }

        pList.forEach((p, pIdx) => {
          STAT_PLAYERS.push({
            id: `p_${target.id}_${pIdx + 1}`,
            teamId: target.id,
            name: p.name.trim(),
            jerseyNumber: parseInt(p.number || (pIdx === 0 ? 1 : (pIdx + 5)), 10) || (pIdx + 1),
            role: (p.role === 'Goalkeeper' || p.role === 'GK') ? 'GK' : 'FWD',
            isCaptain: pIdx === 0 || !!p.isCaptain,
            goals: 0, assists: 0, passes: 40, cleanSheets: 0, tackles: 5, shots: 5, saves: 0, minutes: 0, yellowCards: 0, redCards: 0
          });
        });
      }

      item.status = 'admitted';
      item.payment_status = 'Payment Verified';
      item.assigned_team_id = target.id;
      localStorage.setItem('rttf_pending_signups', JSON.stringify(devSignups));
      localStorage.setItem('rttf_teams', JSON.stringify(TEAMS));

      showToast(`🎉 Team "${item.team_name}" admitted to Group ${target.group}!`);
      if (typeof renderFIFAMatches === 'function') renderFIFAMatches();
      if (typeof renderStandingsAndBracket === 'function') renderStandingsAndBracket();
      if (typeof renderTeamsGrid === 'function') renderTeamsGrid();
      if (typeof renderStatsCentre === 'function') renderStatsCentre();
      renderDevSignupsList();
    }
  }
}

async function deleteSignupRecord(signupId) {
  if (!confirm('Are you sure you want to remove this sign-up record?')) return;

  if (isDbConnected) {
    try {
      const res = await fetch(`${API_BASE}/api/signups/${signupId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete signup');
      showToast('🗑️ Registration record removed.');
      await fetchSignupsFromDb();
    } catch (err) {
      console.error(err);
      showToast('❌ Error deleting record.');
    }
  } else {
    devSignups = devSignups.filter(s => s.id !== signupId);
    localStorage.setItem('rttf_pending_signups', JSON.stringify(devSignups));
    showToast('🗑️ Registration record removed.');
    updateDevPendingBadges();
    renderDevSignupsList();
  }
}

function renderDevSignupsList() {
  const container = document.getElementById('sk-signups-list-container');
  if (!container) return;

  if (!devSignups || devSignups.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:36px 20px;background:#f8fafc;border:1px dashed var(--border-color);border-radius:8px;">
        <div style="font-size:32px;margin-bottom:8px;">📝</div>
        <h4 style="font-size:14px;font-weight:800;color:var(--fifa-navy-dark);margin:0 0 4px;">No Team Sign-ups Yet</h4>
        <p style="font-size:12px;color:var(--text-dim);margin:0;">
          When team captains register using the public <strong>"Sign Up Team"</strong> form, their registrations and rosters will appear here for payment confirmation and admission.
        </p>
      </div>
    `;
    return;
  }

  let html = '';
  devSignups.forEach(s => {
    let players = [];
    try {
      players = typeof s.players_json === 'string' ? JSON.parse(s.players_json || '[]') : (s.players_json || []);
    } catch(e) {
      players = [];
    }

    const isPaid = s.payment_status === 'Payment Verified';
    const isAdmitted = s.status === 'admitted';
    const dateFormatted = s.created_at ? new Date(s.created_at).toLocaleString() : 'Recent';

    // Roster chips
    let rosterHtml = '';
    if (players && players.length > 0) {
      players.forEach((p, idx) => {
        const isGK = p.role === 'Goalkeeper' || p.role === 'GK' || idx === 0;
        rosterHtml += `
          <span class="signup-player-chip ${isGK ? 'gk' : ''}">
            <span>${isGK ? '🧤' : '⚽'}</span>
            <strong>${p.name || `Player ${idx + 1}`}</strong>
            <span style="color:var(--text-dim);font-size:10px;">(#${p.number || (idx === 0 ? 1 : idx + 5)} ${p.role || ''})</span>
          </span>
        `;
      });
    } else {
      rosterHtml = '<span style="font-size:11.5px;color:var(--text-dim);">No player list provided</span>';
    }

    // Available target slot options
    let slotOptions = '';
    TEAMS.forEach(t => {
      const isPreferred = s.group_pref && s.group_pref.includes(t.group);
      const isSelected = s.assigned_team_id === t.id || (t.name.startsWith('TBD') && isPreferred);
      slotOptions += `<option value="${t.id}" ${isSelected ? 'selected' : ''}>Group ${t.group}: ${t.name} (${t.id})</option>`;
    });

    const cleanPhone = (s.captain_phone || '').replace(/[^0-9]/g, '');

    html += `
      <div class="signup-approval-card ${isAdmitted ? 'admitted' : ''}" id="signup-card-${s.id}">
        <div class="signup-header-row">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="signup-color-dot" style="background:${s.kit_primary || '#001438'};"></span>
            <span class="signup-color-dot" style="background:${s.kit_secondary || '#00d4ff'};margin-left:-4px;"></span>
            <strong style="font-size:15px;color:var(--fifa-navy-dark);">${s.team_name}</strong>
            <span style="font-family:var(--font-display);font-weight:900;color:var(--fifa-blue);font-size:12px;">[${s.short_code || s.team_name.slice(0, 4).toUpperCase()}]</span>
            <span style="font-size:11px;background:#f1f5f9;color:var(--text-dim);padding:2px 8px;border-radius:12px;">Pref: ${s.group_pref || 'Any Group'}</span>
          </div>

          <div style="display:flex;align-items:center;gap:6px;">
            <span class="sk-status-pill ${isPaid ? 'paid' : 'unpaid'}">
              ${isPaid ? '✅ Payment Verified' : '⏳ Payment Pending'}
            </span>
            ${isAdmitted ? `<span class="sk-status-pill admitted">🏆 Admitted (${s.assigned_team_id || 'Active'})</span>` : ''}
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:12px;color:var(--text-main);margin-bottom:8px;">
          <div>
            👤 <strong>Captain:</strong> ${s.captain_name} &bull;
            📱 <strong>WhatsApp:</strong> <a href="https://wa.me/${cleanPhone}" target="_blank" style="color:var(--fifa-blue);font-weight:700;">${s.captain_phone} ↗</a>
          </div>
          <div style="font-size:11px;color:var(--text-dim);">
            🕒 Submitted: ${dateFormatted}
          </div>
        </div>

        <!-- Squad Roster Sheet -->
        <div style="margin:8px 0 4px;">
          <div style="font-size:11.5px;font-weight:800;color:var(--fifa-navy-dark);margin-bottom:4px;">
            📋 Registered Squad Teamsheet (${players.length} Players):
          </div>
          <div class="signup-roster-preview">
            ${rosterHtml}
          </div>
        </div>

        <!-- Action Controls -->
        <div class="signup-actions-row">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <button type="button" class="btn-sk-pay" onclick="markSignupPaymentSent('${s.id}')" style="background:${isPaid ? '#0284c7' : '#2563eb'};">
              ${isPaid ? '🔄 Toggle Payment Status' : '💵 Mark Payment Sent / Received'}
            </button>

            ${!isAdmitted ? `
              <div style="display:inline-flex;align-items:center;gap:6px;">
                <label style="font-size:11px;font-weight:700;color:var(--text-dim);">Slot:</label>
                <select id="slot-select-${s.id}" class="signup-input" style="font-size:11.5px;padding:4px 8px;width:auto;">
                  ${slotOptions}
                </select>
                <button type="button" class="btn-sk-admit ${!isPaid ? 'disabled' : ''}" onclick="admitSignupTeam('${s.id}')" title="${isPaid ? 'Admit team to tournament' : 'Click to verify payment and admit'}">
                  🏆 Admit Team &amp; Teamsheet
                </button>
              </div>
            ` : `
              <span style="font-size:12px;font-weight:800;color:#059669;">✅ Team Sheet Active in Official Standings</span>
            `}
          </div>

          <button type="button" class="btn-sk-del" onclick="deleteSignupRecord('${s.id}')" title="Delete Registration">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ── 8. DATABASE RESET / SEED TOOL ──
async function resetTournamentDatabase() {
  if (!confirm('⚠️ WARNING: This will reset all match scores, events, and rosters back to fresh tournament defaults in SQLite. Are you sure?')) return;

  if (isDbConnected) {
    try {
      showToast('⏳ Resetting and re-seeding tournament database...');
      const res = await fetch(`${API_BASE}/api/admin/reset`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset database');
      showToast('🏆 Database successfully re-seeded with official teams & fixtures!');
      await syncAllFromDatabase();
      await fetchSignupsFromDb();
      if (document.getElementById('modal-scorekeeper').classList.contains('open')) {
        populateScorekeeperMatchList();
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Error resetting database.');
    }
  } else {
    showToast('⚠️ SQLite backend server is not reachable.');
  }
}

// Auto-run DB initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initDatabaseSync();
  fetchSignupsFromDb();
});
