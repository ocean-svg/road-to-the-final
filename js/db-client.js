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
function openScorekeeperModal(matchId = null) {
  const modal = document.getElementById('modal-scorekeeper');
  if (!modal) return;

  populateScorekeeperMatchList(matchId);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
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

  if (selectMatchId) {
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

// ── 6. DATABASE RESET / SEED TOOL ──
async function resetTournamentDatabase() {
  if (!confirm('⚠️ WARNING: This will reset all match scores, events, and rosters back to fresh tournament defaults in SQLite. Are you sure?')) return;

  if (isDbConnected) {
    try {
      showToast('⏳ Resetting and re-seeding tournament database...');
      const res = await fetch(`${API_BASE}/api/admin/reset`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset database');
      showToast('🏆 Database successfully re-seeded with official teams & fixtures!');
      await syncAllFromDatabase();
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
});
