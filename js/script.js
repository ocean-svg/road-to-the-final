// ==========================================================================
// FIFA MATCH CENTER & TOURNAMENT STANDINGS JAVASCRIPT CONTROLLER
// Road to the Final 2026 — 8 Groups (A - H), Round of 16 Bracket Tree
// ==========================================================================

let currentStageFilter = 'Game 1'; // 'Game 1', 'Game 2', 'Game 3', 'Knockout', 'all'
let selectedGroupFilter = 'all';

// ── 1. HELPERS & UTILITIES ──
function getTeam(id) {
  if (id === 'TBD') {
    return { id: 'TBD', name: 'TBD', shortName: 'TBD', color: '#64748b', accentColor: '#ffffff' };
  }
  return TEAMS.find(t => t.id === id) || { id, name: id, shortName: id.slice(0, 4).toUpperCase(), color: '#001438', accentColor: '#00d4ff' };
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function teamCrestHTML(team, size = 30) {
  const initials = team.shortName || team.name.slice(0, 4);
  return `<span class="fifa-crest" style="width:${size}px;height:${size}px;background:${team.color};color:${team.accentColor};font-size:${Math.round(size * 0.35)}px;" title="${team.name}">${initials}</span>`;
}

function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── 2. TAB SWITCHING (Matches, Standings, Teams, Stats, Rules, News) ──
function switchTab(tabId) {
  document.querySelectorAll('.fifa-nav-btn').forEach(btn => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle('active', isActive);
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === 'panel-' + tabId);
  });

  const mobileNav = document.getElementById('fifa-main-nav');
  if (mobileNav) mobileNav.classList.remove('mobile-open');

  if (tabId === 'standings') renderStandingsAndBracket();
  if (tabId === 'stats') renderStats('scorers');
  if (tabId === 'teams') renderTeamsGrid();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── 3. STAGE / GAME FILTERING & MATCHES RENDERING ──
function filterByStage(stageName) {
  currentStageFilter = stageName;

  document.querySelectorAll('.stage-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.stage === stageName);
  });

  renderFIFAMatches();
}

function handleGroupSelect(e) {
  selectedGroupFilter = e.target.value;
  renderFIFAMatches();
}

function renderFIFAMatches() {
  const container = document.getElementById('fifa-matches-list-container');
  if (!container) return;

  let filtered = MATCHES;

  if (currentStageFilter === 'Knockout') {
    filtered = MATCHES.filter(m => m.stage === 'Knockout');
  } else if (currentStageFilter !== 'all') {
    filtered = MATCHES.filter(m => m.round === currentStageFilter);
  }

  if (selectedGroupFilter !== 'all') {
    filtered = filtered.filter(m => m.group === selectedGroupFilter || m.homeTeam === selectedGroupFilter || m.awayTeam === selectedGroupFilter);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:48px 20px;background:#ffffff;border-radius:12px;border:1px solid var(--border-color);">
        <h4 style="font-size:16px;font-weight:800;color:var(--fifa-navy-dark);margin-bottom:6px;">No Matches Found</h4>
        <p style="font-size:13px;color:var(--text-dim);">There are no scheduled fixtures for the selected criteria.</p>
        <button class="stage-tab-btn active" onclick="filterByStage('all')" style="margin-top:12px;border-radius:20px;background:var(--fifa-blue);color:#fff;padding:8px 18px;">Show All Matches</button>
      </div>
    `;
    return;
  }

  // Group matches by round / group
  const byRound = {};
  filtered.forEach(m => {
    const key = m.round;
    if (!byRound[key]) byRound[key] = [];
    byRound[key].push(m);
  });

  let html = '';
  Object.keys(byRound).forEach(roundKey => {
    const roundMeta = ROUNDS_METADATA.find(r => r.id === roundKey) || { title: roundKey, dateRange: '' };

    html += `
      <div class="fifa-round-section">
        <div class="fifa-round-header">
          <span class="fifa-round-title">${roundMeta.title}</span>
          <span class="fifa-round-dates">${roundMeta.dateRange}</span>
        </div>
        <div class="fifa-matches-grid">
    `;

    byRound[roundKey].forEach(m => {
      const home = getTeam(m.homeTeam);
      const away = getTeam(m.awayTeam);
      const isFT = m.status === 'FT';
      const isLive = m.status === 'LIVE';

      let centerHTML = '';
      if (isFT) {
        centerHTML = `
          <div class="fifa-score-display">${m.homeScore} &ndash; ${m.awayScore}</div>
          <span class="fifa-status-sub ft">Full Time</span>
        `;
      } else if (isLive) {
        centerHTML = `
          <div class="fifa-score-display" style="color:var(--fifa-red);">${m.homeScore} &ndash; ${m.awayScore}</div>
          <span class="fifa-status-sub live">&#9679; LIVE 0'</span>
        `;
      } else {
        centerHTML = `
          <span class="fifa-time-display">${m.time}</span>
          <span class="fifa-status-sub">Scheduled</span>
        `;
      }

      html += `
        <div class="fifa-match-card" onclick="openMatchDetail('${m.id}')">
          <div class="match-card-top-bar">
            <span class="match-stage-group">
              ${m.group ? `Group ${m.group}` : m.stage} &bull; ${m.round}
            </span>
            <span class="match-venue-location">
              ${formatDate(m.date)} &bull; ${m.pitch}
            </span>
          </div>

          <div class="match-card-body">
            <div class="fifa-team-unit home">
              <span class="fifa-team-name">${home.name}</span>
              ${teamCrestHTML(home, 36)}
            </div>

            <div class="fifa-center-box">
              ${centerHTML}
            </div>

            <div class="fifa-team-unit away">
              ${teamCrestHTML(away, 36)}
              <span class="fifa-team-name">${away.name}</span>
            </div>
          </div>

          <div class="match-card-footer">
            <span class="match-action-link" onclick="event.stopPropagation(); openLiveBlog('${m.date}', '${m.round}')">
              Live Blog &bull; Matchday Coverage ❯
            </span>
            <span class="match-action-link">
              Match Info &bull; Lineups ❯
            </span>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ── 4. STANDINGS (BRACKET TREE & 8 GROUP TABLES) ──
function renderStandingsAndBracket() {
  const container = document.getElementById('fifa-groups-container');
  if (!container) return;

  const t1 = getTeam('t1');
  const t2 = getTeam('t2');
  const t5 = getTeam('t5');
  const t6 = getTeam('t6');
  const t9 = getTeam('t9');
  const t10 = getTeam('t10');
  const t13 = getTeam('t13');
  const t14 = getTeam('t14');
  const t17 = getTeam('t17');
  const t18 = getTeam('t18');
  const t21 = getTeam('t21');
  const t22 = getTeam('t22');
  const t25 = getTeam('t25');
  const t26 = getTeam('t26');
  const t29 = getTeam('t29');
  const t30 = getTeam('t30');
  const tbd = getTeam('TBD');

  let html = `
    <!-- TOP: 7-COLUMN OFFICIAL FIFA KNOCKOUT BRACKET TREE -->
    <div class="fifa-tree-container">
      <div class="fifa-tree-header">
        <div>
          <h3 class="fifa-tree-title">Knockout Bracket Diagram</h3>
          <p style="font-size:12.5px;color:var(--text-dim);margin-top:2px;">Top 2 teams from each of the 8 groups qualify for the Round of 16.</p>
        </div>
        <button class="stage-tab-btn" onclick="exportCalendarICS()" style="background:#f1f5f9;border-radius:20px;padding:6px 14px;font-size:12px;">
          📅 Export Schedule (.ics)
        </button>
      </div>

      <div class="fifa-bracket-tree">
        
        <!-- 1. ROUND OF 16 (LEFT) -->
        <div class="tree-col">
          <div class="tree-col-title">Round of 16</div>

          <div class="tree-match-node" onclick="openMatchDetail('m_r16_1')">
            <div class="tree-node-head"><span>R16-1 &bull; 24 Oct</span><span>10:00</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t1, 16)}<span>${t1.name} (1A)</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t6, 16)}<span>${t6.name} (2B)</span></div><span class="tree-score-badge">-</span></div>
          </div>

          <div class="tree-match-node" onclick="openMatchDetail('m_r16_2')">
            <div class="tree-node-head"><span>R16-2 &bull; 24 Oct</span><span>11:30</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t9, 16)}<span>${t9.name} (1C)</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t14, 16)}<span>${t14.name} (2D)</span></div><span class="tree-score-badge">-</span></div>
          </div>

          <div class="tree-match-node" onclick="openMatchDetail('m_r16_3')">
            <div class="tree-node-head"><span>R16-3 &bull; 24 Oct</span><span>13:00</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t17, 16)}<span>${t17.name} (1E)</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t22, 16)}<span>${t22.name} (2F)</span></div><span class="tree-score-badge">-</span></div>
          </div>

          <div class="tree-match-node" onclick="openMatchDetail('m_r16_4')">
            <div class="tree-node-head"><span>R16-4 &bull; 24 Oct</span><span>14:30</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t25, 16)}<span>${t25.name} (1G)</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t30, 16)}<span>${t30.name} (2H)</span></div><span class="tree-score-badge">-</span></div>
          </div>
        </div>

        <!-- 2. QUARTER FINALS (LEFT) -->
        <div class="tree-col">
          <div class="tree-col-title">Quarter-finals</div>

          <div class="tree-match-node" style="margin-top:28px;" onclick="openMatchDetail('m_qf_1')">
            <div class="tree-node-head"><span>QF 1 &bull; 31 Oct</span><span>10:00</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 16)}<span>Winner R16-1</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 16)}<span>Winner R16-2</span></div><span class="tree-score-badge">-</span></div>
          </div>

          <div class="tree-match-node" style="margin-top:60px;" onclick="openMatchDetail('m_qf_2')">
            <div class="tree-node-head"><span>QF 2 &bull; 31 Oct</span><span>12:00</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 16)}<span>Winner R16-3</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 16)}<span>Winner R16-4</span></div><span class="tree-score-badge">-</span></div>
          </div>
        </div>

        <!-- 3. SEMI FINALS (LEFT) -->
        <div class="tree-col">
          <div class="tree-col-title">Semi-finals</div>

          <div class="tree-match-node" style="margin-top:90px;" onclick="openMatchDetail('m_sf_1')">
            <div class="tree-node-head"><span>SF 1 &bull; 4 Nov</span><span>14:00</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 16)}<span>Winner QF 1</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 16)}<span>Winner QF 2</span></div><span class="tree-score-badge">-</span></div>
          </div>
        </div>

        <!-- 4. CENTER FINALS & 3RD PLACE -->
        <div class="tree-col">
          <div class="tree-col-title" style="color:var(--fifa-gold);font-weight:900;">Grand Final</div>

          <div class="tree-match-node tree-final-card" style="margin-top:30px;" onclick="openMatchDetail('m_final')">
            <div class="tree-final-head"><span>🏆 GRAND FINAL</span><span>&bull; 7 Nov &bull; 15:00</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 18)}<strong style="color:var(--fifa-navy-dark);">Winner SF 1</strong></div><span class="tree-score-badge" style="color:var(--fifa-gold);">🏆</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 18)}<strong style="color:var(--fifa-navy-dark);">Winner SF 2</strong></div><span class="tree-score-badge">-</span></div>
          </div>

          <div class="tree-match-node" style="margin-top:24px;" onclick="openMatchDetail('m_third')">
            <div class="tree-node-head"><span>🥉 3rd Place Playoff</span><span>7 Nov &bull; 12:30</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 16)}<span>Loser SF 1</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 16)}<span>Loser SF 2</span></div><span class="tree-score-badge">-</span></div>
          </div>
        </div>

        <!-- 5. SEMI FINALS (RIGHT) -->
        <div class="tree-col">
          <div class="tree-col-title">Semi-finals</div>

          <div class="tree-match-node" style="margin-top:90px;" onclick="openMatchDetail('m_sf_2')">
            <div class="tree-node-head"><span>SF 2 &bull; 4 Nov</span><span>16:30</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 16)}<span>Winner QF 3</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 16)}<span>Winner QF 4</span></div><span class="tree-score-badge">-</span></div>
          </div>
        </div>

        <!-- 6. QUARTER FINALS (RIGHT) -->
        <div class="tree-col">
          <div class="tree-col-title">Quarter-finals</div>

          <div class="tree-match-node" style="margin-top:28px;" onclick="openMatchDetail('m_qf_3')">
            <div class="tree-node-head"><span>QF 3 &bull; 31 Oct</span><span>14:00</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 16)}<span>Winner R16-5</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 16)}<span>Winner R16-6</span></div><span class="tree-score-badge">-</span></div>
          </div>

          <div class="tree-match-node" style="margin-top:60px;" onclick="openMatchDetail('m_qf_4')">
            <div class="tree-node-head"><span>QF 4 &bull; 31 Oct</span><span>16:00</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 16)}<span>Winner R16-7</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(tbd, 16)}<span>Winner R16-8</span></div><span class="tree-score-badge">-</span></div>
          </div>
        </div>

        <!-- 7. ROUND OF 16 (RIGHT) -->
        <div class="tree-col">
          <div class="tree-col-title">Round of 16</div>

          <div class="tree-match-node" onclick="openMatchDetail('m_r16_5')">
            <div class="tree-node-head"><span>R16-5 &bull; 25 Oct</span><span>10:00</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t5, 16)}<span>${t5.name} (1B)</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t2, 16)}<span>${t2.name} (2A)</span></div><span class="tree-score-badge">-</span></div>
          </div>

          <div class="tree-match-node" onclick="openMatchDetail('m_r16_6')">
            <div class="tree-node-head"><span>R16-6 &bull; 25 Oct</span><span>11:30</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t13, 16)}<span>${t13.name} (1D)</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t10, 16)}<span>${t10.name} (2C)</span></div><span class="tree-score-badge">-</span></div>
          </div>

          <div class="tree-match-node" onclick="openMatchDetail('m_r16_7')">
            <div class="tree-node-head"><span>R16-7 &bull; 25 Oct</span><span>13:00</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t21, 16)}<span>${t21.name} (1F)</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t18, 16)}<span>${t18.name} (2E)</span></div><span class="tree-score-badge">-</span></div>
          </div>

          <div class="tree-match-node" onclick="openMatchDetail('m_r16_8')">
            <div class="tree-node-head"><span>R16-8 &bull; 25 Oct</span><span>14:30</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t29, 16)}<span>${t29.name} (1H)</span></div><span class="tree-score-badge">-</span></div>
            <div class="tree-team-row"><div class="tree-team-info">${teamCrestHTML(t26, 16)}<span>${t26.name} (2G)</span></div><span class="tree-score-badge">-</span></div>
          </div>
        </div>

      </div>
    </div>

    <!-- BOTTOM: 8 OFFICIAL FIFA GROUP STAGE ROUND-ROBIN TABLES (GROUPS A - H) -->
    <h3 class="fifa-groups-section-title">Group Stage Standings &bull; 8 Groups</h3>
    <div class="fifa-groups-grid-8">
  `;

  GROUPS.forEach(group => {
    html += `
      <div class="fifa-group-table-card">
        <div class="fifa-group-table-head">
          <span class="fifa-group-letter-title">${group.name}</span>
          <span style="font-size:11px;color:var(--text-dim);font-weight:700;">3 Matches &bull; Top 2 Qualify</span>
        </div>

        <table class="fifa-standings-table">
          <thead>
            <tr>
              <th style="width:36px;">Pos</th>
              <th>Team</th>
              <th>MP</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>PTS</th>
              <th>Form</th>
            </tr>
          </thead>
          <tbody>
    `;

    group.standings.forEach(s => {
      const team = getTeam(s.teamId);
      const isQualifying = s.pos <= 2;

      let formDots = '';
      if (s.form && s.form.length > 0) {
        s.form.forEach(f => {
          const cls = f === 'W' ? 'w' : f === 'D' ? 'd' : f === 'L' ? 'l' : '';
          formDots += `<span class="fifa-form-dot ${cls}">${f}</span>`;
        });
      }

      html += `
        <tr class="${isQualifying ? 'qualify-row' : ''}">
          <td style="font-weight:800;color:${isQualifying ? 'var(--fifa-navy-dark)' : 'var(--text-dim)'};">${s.pos}</td>
          <td>
            <div class="fifa-team-cell">
              ${teamCrestHTML(team, 22)}
              <span class="fifa-team-name-bold">${team.name}</span>
            </div>
          </td>
          <td>${s.p}</td>
          <td>${s.w}</td>
          <td>${s.d}</td>
          <td>${s.l}</td>
          <td>${s.gf}</td>
          <td>${s.ga}</td>
          <td style="font-weight:700;">${s.gd > 0 ? '+' + s.gd : s.gd}</td>
          <td style="font-weight:900;font-size:14px;color:var(--fifa-navy-dark);">${s.pts}</td>
          <td>
            <div class="fifa-form-dots">${formDots}</div>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>

        <div class="fifa-qualify-legend">
          <div class="legend-item">
            <span class="legend-bullet green"></span>
            <span>Advance to Round of 16</span>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  container.innerHTML = html;
}

// ── 5. TEAMS & SQUADS GRID ──
function renderTeamsGrid() {
  const container = document.getElementById('fifa-teams-container');
  if (!container) return;

  let html = `<div class="fifa-teams-grid">`;
  TEAMS.forEach(team => {
    html += `
      <div class="fifa-team-card">
        <div class="fifa-team-card-crest" style="background:${team.color};color:${team.accentColor};">
          ${team.shortName || team.name.slice(0, 4)}
        </div>
        <h4 class="fifa-team-card-title">${team.name}</h4>
        <span class="fifa-group-tag">${team.group ? `Group ${team.group}` : 'Tournament Team'}</span>
        <button class="match-action-link" onclick="openModal('upload-teams')" style="margin-top:6px;font-size:12px;">
          Edit Squad &amp; Colors ✏️
        </button>
      </div>
    `;
  });
  html += `</div>`;

  container.innerHTML = html;
}

// ── 6. STATISTICS ──
function renderStats(type) {
  const container = document.getElementById('fifa-stats-container');
  if (!container) return;

  const data = type === 'scorers' ? TOP_SCORERS : TOP_ASSISTS;
  const colTitle = type === 'scorers' ? 'Goals' : 'Assists';
  const valKey = type === 'scorers' ? 'goals' : 'assists';

  let html = `
    <div style="margin-bottom:16px;display:flex;gap:8px;">
      <button class="stage-tab-btn ${type === 'scorers' ? 'active' : ''}" onclick="renderStats('scorers')">Golden Boot (Goals)</button>
      <button class="stage-tab-btn ${type === 'assists' ? 'active' : ''}" onclick="renderStats('assists')">Top Assists</button>
    </div>
    <table class="fifa-table">
      <thead>
        <tr>
          <th style="width:50px;">Rank</th>
          <th>Player</th>
          <th>Club</th>
          <th>${colTitle}</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach(p => {
    const team = getTeam(p.teamId);
    html += `
      <tr>
        <td style="font-weight:800;color:var(--fifa-navy-dark);">${p.rank}</td>
        <td style="font-weight:700;">${p.name}</td>
        <td>
          <div class="fifa-table-team-cell">
            ${teamCrestHTML(team, 20)}
            <span>${team.name}</span>
          </div>
        </td>
        <td style="font-weight:900;font-size:15px;color:var(--fifa-blue);">${p[valKey]}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

// ── 7. CALENDAR EXPORT (.ICS) ──
function exportCalendarICS() {
  let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Road to the Final 2026//FIFA Schedule//EN\nCALSCALE:GREGORIAN\n";

  MATCHES.forEach(m => {
    const home = getTeam(m.homeTeam);
    const away = getTeam(m.awayTeam);
    const dt = m.date.replace(/-/g, '');
    const timeClean = m.time.replace(':', '') + '00';

    icsContent += `BEGIN:VEVENT\n`;
    icsContent += `SUMMARY:${home.name} vs ${away.name} (${m.round})\n`;
    icsContent += `DESCRIPTION:${m.round} - ${m.stage || 'Match'} at ${m.pitch}, City Sports Complex\n`;
    icsContent += `LOCATION:${m.pitch}, City Sports Complex, Cape Town\n`;
    icsContent += `DTSTART:${dt}T${timeClean}Z\n`;
    icsContent += `DTEND:${dt}T${timeClean}Z\n`;
    icsContent += `STATUS:CONFIRMED\n`;
    icsContent += `END:VEVENT\n`;
  });

  icsContent += "END:VCALENDAR";

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Road_To_The_Final_2026_FIFA_Schedule.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("📅 Tournament schedule exported to your calendar (.ics)!");
}

// ── 8. MODAL CONTROLS ──
function openModal(modalId) {
  const overlay = document.getElementById('modal-' + modalId);
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const overlay = document.getElementById('modal-' + modalId);
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.fifa-modal-overlay.open').forEach(el => el.classList.remove('open'));
    document.body.style.overflow = '';
  }
});

document.addEventListener('click', e => {
  if (e.target.classList.contains('fifa-modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// Match Detail
function openMatchDetail(matchId) {
  const m = MATCHES.find(item => item.id === matchId);
  if (!m) return;

  const home = getTeam(m.homeTeam);
  const away = getTeam(m.awayTeam);
  const isFT = m.status === 'FT';

  const modalBody = document.getElementById('modal-match-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:11px;font-weight:800;color:var(--fifa-blue);text-transform:uppercase;letter-spacing:1px;">${m.round} &bull; ${m.group ? `Group ${m.group}` : m.stage}</span>
      <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin:18px 0;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:120px;">
          ${teamCrestHTML(home, 48)}
          <strong style="font-size:14px;color:var(--fifa-navy-dark);">${home.name}</strong>
        </div>

        <div style="text-align:center;">
          <div style="font-family:var(--font-display);font-size:24px;font-weight:900;color:var(--fifa-navy-dark);background:#f1f5f9;padding:4px 18px;border-radius:8px;border:1px solid var(--border-color);">
            ${isFT ? `${m.homeScore} &ndash; ${m.awayScore}` : m.time}
          </div>
          <span style="font-size:11px;color:var(--text-dim);margin-top:4px;display:block;">${isFT ? 'Full Time' : m.pitch}</span>
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:120px;">
          ${teamCrestHTML(away, 48)}
          <strong style="font-size:14px;color:var(--fifa-navy-dark);">${away.name}</strong>
        </div>
      </div>
      <p style="font-size:12.5px;color:var(--text-dim);">${formatDate(m.date)} &bull; City Sports Complex, Cape Town</p>
    </div>

    <div style="background:#f8fafc;border:1px solid var(--border-color);border-radius:8px;padding:14px;">
      <h4 style="font-size:13px;font-weight:800;color:var(--fifa-navy-dark);margin-bottom:8px;text-transform:uppercase;">Match Information</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;color:var(--text-muted);">
        <div><strong>Venue:</strong> ${m.pitch}</div>
        <div><strong>Format:</strong> 2 x 20 Mins</div>
        <div><strong>Referee:</strong> Official Panel</div>
        <div><strong>Status:</strong> ${m.status}</div>
      </div>
    </div>
  `;

  openModal('match');
}

// Live Blog Modal
function openLiveBlog(dateStr, roundName) {
  const modalBody = document.getElementById('modal-liveblog-body');
  if (!modalBody) return;

  const matchesOnDay = MATCHES.filter(m => m.date === dateStr);
  let commentary = '';

  if (matchesOnDay.length > 0) {
    matchesOnDay.forEach(m => {
      const home = getTeam(m.homeTeam);
      const away = getTeam(m.awayTeam);
      commentary += `
        <div style="border-left:3px solid var(--fifa-blue);padding-left:12px;margin-bottom:16px;">
          <div style="font-size:11px;font-weight:800;color:var(--fifa-blue);">${m.time} &bull; ${m.pitch}</div>
          <div style="font-size:14px;font-weight:800;color:var(--fifa-navy-dark);margin:2px 0;">${home.name} vs ${away.name}</div>
          <p style="font-size:12.5px;color:var(--text-muted);line-height:1.4;">
            ${m.status === 'FT' ? `Full-time whistle blown! Final score: ${home.name} ${m.homeScore}, ${away.name} ${m.awayScore}.` : `Scheduled match for ${m.round} on ${m.pitch}. Kick-off at ${m.time}.`}
          </p>
        </div>
      `;
    });
  } else {
    commentary = `<p style="color:var(--text-dim);font-size:13px;">No live match feeds found for this date.</p>`;
  }

  modalBody.innerHTML = `
    <div style="margin-bottom:16px;border-bottom:1px solid var(--border-color);padding-bottom:8px;">
      <span style="font-size:11px;font-weight:800;color:var(--fifa-blue);text-transform:uppercase;">Official Match Center Blog</span>
      <h3 style="font-family:var(--font-display);font-size:20px;font-weight:800;color:var(--fifa-navy-dark);">${roundName} &mdash; ${formatDate(dateStr)}</h3>
    </div>
    <div style="max-height:360px;overflow-y:auto;">
      ${commentary}
    </div>
  `;

  openModal('liveblog');
}

// ── 9. TEAM UPLOADER & MANAGER (Supports all 32 Teams) ──
function initTeamUploaderUI() {
  const container = document.getElementById('team-upload-list');
  if (!container) return;

  let html = `
    <div style="max-height:380px;overflow-y:auto;padding-right:6px;">
  `;

  TEAMS.forEach((team, idx) => {
    html += `
      <div style="display:grid;grid-template-columns:70px 1fr 90px 40px;gap:8px;align-items:center;margin-bottom:8px;background:#f8fafc;padding:6px 10px;border-radius:6px;border:1px solid var(--border-color);">
        <span style="font-size:11px;font-weight:800;color:var(--text-dim);">Grp ${team.group || 'A'}</span>
        <input type="text" id="team-name-${team.id}" value="${team.name}" placeholder="Team Name" style="padding:5px 8px;border:1px solid var(--border-color);border-radius:4px;font-size:12px;">
        <input type="text" id="team-short-${team.id}" value="${team.shortName}" placeholder="Code" style="padding:5px 8px;border:1px solid var(--border-color);border-radius:4px;font-size:12px;">
        <input type="color" id="team-color-${team.id}" value="${team.color}" style="width:34px;height:28px;border:none;background:none;cursor:pointer;">
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function saveCustomTeams() {
  TEAMS.forEach(team => {
    const nameInput = document.getElementById(`team-name-${team.id}`);
    const shortInput = document.getElementById(`team-short-${team.id}`);
    const colorInput = document.getElementById(`team-color-${team.id}`);

    if (nameInput && nameInput.value.trim()) team.name = nameInput.value.trim();
    if (shortInput && shortInput.value.trim()) team.shortName = shortInput.value.trim().toUpperCase();
    if (colorInput && colorInput.value) team.color = colorInput.value;
  });

  localStorage.setItem('rttf_teams', JSON.stringify(TEAMS));
  closeModal('upload-teams');
  showToast("✅ Teams successfully updated!");

  renderFIFAMatches();
  renderStandingsAndBracket();
  renderTeamsGrid();
}

function resetToDefaultTeams() {
  localStorage.removeItem('rttf_teams');
  TEAMS = JSON.parse(JSON.stringify(DEFAULT_TEAMS));
  initTeamUploaderUI();
  renderFIFAMatches();
  renderStandingsAndBracket();
  renderTeamsGrid();
  closeModal('upload-teams');
  showToast("🔄 Reset to default TBD teams.");
}

// ── 10. INITIALIZATION ──
document.addEventListener('DOMContentLoaded', () => {
  initTeamUploaderUI();
  renderFIFAMatches();
  renderStandingsAndBracket();

  const mobileToggle = document.getElementById('fifa-menu-toggle');
  const mainNav = document.getElementById('fifa-main-nav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('mobile-open');
    });
  }

  const groupSelect = document.getElementById('fifa-group-select');
  if (groupSelect) groupSelect.addEventListener('change', handleGroupSelect);
});
