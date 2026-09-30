// ==========================================================================
// FIFA MATCH CENTER & TOURNAMENT STANDINGS JAVASCRIPT CONTROLLER
// Road to the Final 2026 — 8 Groups (A - H), Round of 16 Bracket Tree, Clubs Hub
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

  document.querySelectorAll('.fotmob-nav-item').forEach(btn => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle('active', isActive);
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === 'panel-' + tabId);
  });

  const mobileNav = document.getElementById('fifa-main-nav');
  if (mobileNav) mobileNav.classList.remove('mobile-open');

  if (tabId === 'standings') renderStandingsAndBracket();
  if (tabId === 'stats') renderStatsCentre();
  if (tabId === 'news') renderMediaGallery();
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

// ── 5. CLUBS / TEAMS PAGE (MATCHING REFERENCE IMAGE FORMAT IN FIFA PALETTE) ──
function renderTeamsGrid() {
  const container = document.getElementById('fifa-teams-container');
  if (!container) return;

  // First 16 / top participating clubs for featured grid
  const featuredClubs = TEAMS.slice(0, 16);

  let html = `
    <!-- Top Header Banner -->
    <div class="fifa-clubs-header-banner">
      <div>
        <h2 class="fifa-clubs-header-title">Clubs</h2>
        <div class="fifa-clubs-subpills">
          <span class="club-subpill active">2026/27 Season</span>
          <span class="club-subpill">32 Teams</span>
          <span class="club-subpill">8 Groups</span>
        </div>
      </div>
      <button class="btn-upload-nav" onclick="openModal('upload-teams')" style="padding:10px 20px;font-size:13px;">
        Upload &amp; Manage Squads ⚙️
      </button>
    </div>

    <!-- Featured 2026/27 Season Clubs Grid -->
    <h3 class="fifa-season-clubs-title">2026/27 Season Clubs</h3>
    <div class="fifa-season-clubs-grid">
  `;

  featuredClubs.forEach(team => {
    html += `
      <div class="fifa-club-card-unit" onclick="openClubDetailModal('${team.id}')">
        <div class="club-card-top-row">
          <div class="club-card-identity">
            ${teamCrestHTML(team, 32)}
            <span class="club-card-name-bold">${team.name}</span>
          </div>
          <span class="club-card-chevron">❯</span>
        </div>

        <div class="club-card-actions-row">
          <button class="club-action-pill primary-pill" onclick="event.stopPropagation(); openClubDetailModal('${team.id}')">
            Squad Profile
          </button>
          <button class="club-action-pill" onclick="event.stopPropagation(); showToast('📍 Home Pitch: Edenvale Indoor Soccer &bull; Group ${team.group || 'A'}')">
            Pitch Allocation ↗
          </button>
        </div>
      </div>
    `;
  });

  html += `
    </div>

    <!-- All-time Tournament Clubs Table List (Matching Reference Format) -->
    <h3 class="fifa-season-clubs-title">All Tournament Clubs Directory (32 Teams)</h3>
    <div class="fifa-all-clubs-table-wrap">
      <table class="fifa-clubs-directory-table">
        <thead>
          <tr>
            <th>Club</th>
            <th>Group &amp; Stadium</th>
            <th>Squad Info</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  TEAMS.forEach(team => {
    html += `
      <tr onclick="openClubDetailModal('${team.id}')" style="cursor:pointer;">
        <td>
          <div class="club-dir-name-cell">
            ${teamCrestHTML(team, 26)}
            <div>
              <div class="club-dir-name-title">${team.name}</div>
              <span style="font-size:11px;color:var(--text-dim);font-weight:700;">CODE: ${team.shortName || team.name.slice(0, 4)}</span>
            </div>
          </div>
        </td>
        <td>
          <div class="club-dir-stadium-tag">
            <span style="font-weight:800;color:var(--fifa-navy-dark);">Group ${team.group || 'A'}</span>
            <span>&bull;</span>
            <span>Edenvale Indoor Soccer Pitch ${team.group === 'A' || team.group === 'C' ? 'A' : team.group === 'B' || team.group === 'D' ? 'B' : 'C'}</span>
          </div>
        </td>
        <td>
          <span style="font-size:12px;font-weight:700;color:var(--fifa-blue);background:#f1f5f9;padding:4px 10px;border-radius:var(--radius-pill);">
            7-8 Players (5-a-side)
          </span>
        </td>
        <td style="text-align:right;">
          <button class="club-action-pill primary-pill" onclick="event.stopPropagation(); openClubDetailModal('${team.id}')" style="padding:4px 12px;font-size:11.5px;">
            Squad Profile ❯
          </button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

// Club Profile Modal
function openClubDetailModal(teamId) {
  const team = getTeam(teamId);
  const modalBody = document.getElementById('modal-match-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      ${teamCrestHTML(team, 56)}
      <h3 style="font-family:var(--font-display);font-size:24px;font-weight:800;color:var(--fifa-navy-dark);margin:8px 0 2px;">${team.name}</h3>
      <span style="font-size:11.5px;font-weight:800;color:var(--fifa-blue);text-transform:uppercase;background:#f1f5f9;padding:3px 12px;border-radius:20px;">Group ${team.group || 'A'} &bull; Code: ${team.shortName || team.name.slice(0, 4)}</span>
    </div>

    <div style="background:#f8fafc;border:1px solid var(--border-color);border-radius:8px;padding:16px;margin-bottom:16px;">
      <h4 style="font-size:13px;font-weight:800;color:var(--fifa-navy-dark);margin-bottom:8px;text-transform:uppercase;">Squad Overview</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12.5px;color:var(--text-muted);">
        <div><strong>Registered Squad:</strong> 7-8 Players Max (5-a-side)</div>
        <div><strong>Primary Kit:</strong> <span style="display:inline-block;width:12px;height:12px;background:${team.color};border-radius:2px;vertical-align:middle;"></span> ${team.color}</div>
        <div><strong>Format:</strong> 4 Outfield + 1 Goalkeeper</div>
        <div><strong>Captain:</strong> Player 1 (C)</div>
      </div>
    </div>

    <div style="display:flex;gap:10px;">
      <button class="btn-upload-nav" onclick="closeModal('match'); openModal('upload-teams');" style="width:100%;justify-content:center;padding:10px;">
        Edit Team &amp; Kit ✏️
      </button>
    </div>
  `;

  openModal('match');
}

// ── 6. STATS CENTRE & SEPARATE SUBPAGES (DASHBOARD, PLAYER, CLUB, ALL-TIME, RECORDS, PLAYER COMPARISON, HEAD-TO-HEAD) ──
let currentStatsSubpage = 'dashboard';
let activePlayerMetric = 'goals';
let activeClubMetric = 'goals';
let playerSearchQuery = '';
let playerGroupFilter = 'all';
let compPlayer1Id = 'p1';
let compPlayer2Id = 'p2';
let compTeam1Id = 't1';
let compTeam2Id = 't5';

function switchStatsSubpage(subpageKey) {
  currentStatsSubpage = subpageKey;
  renderStatsCentre();
}

function renderStatsCentre() {
  const container = document.getElementById('fifa-stats-container');
  if (!container) return;

  const subtabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'player', label: 'Player' },
    { key: 'club', label: 'Club' },
    { key: 'alltime', label: 'All-time Stats' },
    { key: 'records', label: 'Records' },
    { key: 'player-comp', label: 'Player Comparison' },
    { key: 'h2h', label: 'Head-to-head' }
  ];

  let html = `
    <!-- Top Header & Sub-navigation bar -->
    <div class="stats-centre-header">
      <h2 class="stats-centre-title">Stats Centre</h2>
      <div class="stats-subnav-bar">
        ${subtabs.map(st => `
          <button class="stats-subnav-btn ${currentStatsSubpage === st.key ? 'active' : ''}" onclick="switchStatsSubpage('${st.key}')">
            ${st.label}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Render Subpage content
  if (currentStatsSubpage === 'dashboard') {
    html += renderStatsDashboardHTML();
  } else if (currentStatsSubpage === 'player') {
    html += renderStatsPlayerHTML();
  } else if (currentStatsSubpage === 'club') {
    html += renderStatsClubHTML();
  } else if (currentStatsSubpage === 'alltime') {
    html += renderStatsAllTimeHTML();
  } else if (currentStatsSubpage === 'records') {
    html += renderStatsRecordsHTML();
  } else if (currentStatsSubpage === 'player-comp') {
    html += renderStatsPlayerComparisonHTML();
  } else if (currentStatsSubpage === 'h2h') {
    html += renderStatsH2HHTML();
  }

  container.innerHTML = html;
}

// 1. DASHBOARD SUBPAGE
function renderStatsDashboardHTML() {
  // Top 10 for each player category
  const topGoals = [...STAT_PLAYERS].sort((a, b) => b.goals - a.goals).slice(0, 10);
  const topAssists = [...STAT_PLAYERS].sort((a, b) => b.assists - a.assists).slice(0, 10);
  const topPasses = [...STAT_PLAYERS].sort((a, b) => b.passes - a.passes).slice(0, 10);
  const topCleanSheets = [...STAT_PLAYERS].filter(p => p.role === 'GK' || p.cleanSheets > 0).sort((a, b) => b.cleanSheets - a.cleanSheets).slice(0, 10);

  // Top 10 for each club category
  const clubGoals = [...STAT_CLUBS].sort((a, b) => b.goals - a.goals).slice(0, 10);
  const clubTackles = [...STAT_CLUBS].sort((a, b) => b.tackles - a.tackles).slice(0, 10);
  const clubBlocks = [...STAT_CLUBS].sort((a, b) => b.blocks - a.blocks).slice(0, 10);
  const clubPasses = [...STAT_CLUBS].sort((a, b) => b.passes - a.passes).slice(0, 10);

  const playerLeaderboardCard = (title, metricKey, list, onClickSubpage) => `
    <div class="stats-leaderboard-card fotmob-stat-card">
      <div class="stats-card-header" onclick="${onClickSubpage}">
        <div class="stats-card-header-title">${title}</div>
        <span class="stats-card-chevron">❯</span>
      </div>
      <div class="stats-card-list">
        ${list.map((p, idx) => {
          const team = getTeam(p.teamId);
          const initials = p.name.split(' ').map(n => n[0]).join('').slice(0, 2);
          const isTop = idx === 0;
          return `
            <div class="stats-row-item fotmob-stat-row" onclick="openPlayerDetail('${p.id}')" style="cursor:pointer;">
              <div class="fotmob-avatar-wrap">
                <span class="stats-avatar-circle">${initials}</span>
                <span class="fotmob-mini-crest">${teamCrestHTML(team, 12)}</span>
              </div>
              <div class="stats-info-box">
                <span class="stats-name-text">${p.name}</span>
                <span class="stats-sub-club">${team.name}</span>
              </div>
              <span class="stats-metric-value ${isTop ? 'fotmob-top-val' : ''}">${p[metricKey]}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  const clubLeaderboardCard = (title, metricKey, list, onClickSubpage) => `
    <div class="stats-leaderboard-card">
      <div class="stats-card-header" onclick="${onClickSubpage}">
        <div class="stats-card-header-title">${title}</div>
        <span class="stats-card-chevron">❯</span>
      </div>
      <div class="stats-card-list">
        ${list.map((c, idx) => {
          const team = getTeam(c.teamId);
          return `
            <div class="stats-row-item" onclick="openClubDetailModal('${team.id}')" style="cursor:pointer;">
              <span class="stats-rank-num">${idx + 1}</span>
              ${teamCrestHTML(team, 24)}
              <div class="stats-info-box">
                <span class="stats-name-text">${team.name}</span>
                <span class="stats-sub-club">Group ${team.group || 'A'}</span>
              </div>
              <span class="stats-metric-value">${c[metricKey].toLocaleString()}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  return `
    <!-- Player Stats Header -->
    <div class="stats-section-title">
      <div class="stats-section-title-left">
        Road to the Final 2026/27 Player Stats
      </div>
    </div>

    <!-- 4-Column Player Stats Cards -->
    <div class="stats-leaderboard-grid-4">
      ${playerLeaderboardCard('Goals', 'goals', topGoals, "setPlayerMetricAndOpen('goals')")}
      ${playerLeaderboardCard('Assists', 'assists', topAssists, "setPlayerMetricAndOpen('assists')")}
      ${playerLeaderboardCard('Total Passes', 'passes', topPasses, "setPlayerMetricAndOpen('passes')")}
      ${playerLeaderboardCard('Clean Sheets', 'cleanSheets', topCleanSheets, "setPlayerMetricAndOpen('cleanSheets')")}
    </div>

    <!-- Discover More Feature Cards Grid -->
    <div class="stats-section-title">
      <div class="stats-section-title-left">
        Discover more
      </div>
      <div style="display:flex;gap:6px;">
        <button class="stage-tab-btn" style="padding:4px 10px;font-size:11px;" onclick="showToast('Showing feature highlights')">❮</button>
        <button class="stage-tab-btn" style="padding:4px 10px;font-size:11px;" onclick="showToast('Showing latest tournament features')">❯</button>
      </div>
    </div>

    <div class="discover-grid">
      ${DISCOVER_ARTICLES.map(art => `
        <div class="discover-card" style="background:${art.gradient};" onclick="showToast('📰 Feature: ${art.title}')">
          <span class="discover-icon-bg">${art.icon}</span>
          <span class="discover-top-tag">${art.tag}</span>
          <div class="discover-title-text">${art.title}</div>
          <span class="discover-footer-cat">Features &bull; Analysis</span>
        </div>
      `).join('')}
    </div>

    <!-- Club Stats Header -->
    <div class="stats-section-title">
      <div class="stats-section-title-left">
        Road to the Final 2026/27 Club Stats
      </div>
    </div>

    <!-- 4-Column Club Stats Cards -->
    <div class="stats-leaderboard-grid-4">
      ${clubLeaderboardCard('Goals', 'goals', clubGoals, "setClubMetricAndOpen('goals')")}
      ${clubLeaderboardCard('Tackles Won', 'tackles', clubTackles, "setClubMetricAndOpen('tackles')")}
      ${clubLeaderboardCard('Blocks', 'blocks', clubBlocks, "setClubMetricAndOpen('blocks')")}
      ${clubLeaderboardCard('Total Passes', 'passes', clubPasses, "setClubMetricAndOpen('passes')")}
    </div>

    <!-- Disclaimer Banner -->
    <div class="stats-info-banner">
      <span>Official Road to the Final 2026 live performance metrics recorded across all 8 Group Stage matches and Knockout ties.</span>
      <button class="stage-tab-btn" onclick="openModal('upload-teams')" style="background:#fff;border-radius:14px;padding:4px 12px;font-size:11px;">
        Edit Custom Squads ⚙️
      </button>
    </div>
  `;
}

// Helper navigation for quick metrics
function setPlayerMetricAndOpen(metric) {
  activePlayerMetric = metric;
  currentStatsSubpage = 'player';
  renderStatsCentre();
}

function setClubMetricAndOpen(metric) {
  activeClubMetric = metric;
  currentStatsSubpage = 'club';
  renderStatsCentre();
}

// 2. PLAYER STATS SUBPAGE
function renderStatsPlayerHTML() {
  const metricOptions = [
    { key: 'goals', label: 'Goals' },
    { key: 'assists', label: 'Assists' },
    { key: 'passes', label: 'Total Passes' },
    { key: 'cleanSheets', label: 'Clean Sheets' },
    { key: 'shots', label: 'Shots on Target' },
    { key: 'tackles', label: 'Tackles Won' },
    { key: 'minutes', label: 'Minutes' },
    { key: 'yellowCards', label: 'Yellow Cards' }
  ];

  let filtered = [...STAT_PLAYERS];

  if (playerGroupFilter !== 'all') {
    filtered = filtered.filter(p => {
      const team = getTeam(p.teamId);
      return team.group === playerGroupFilter;
    });
  }

  if (playerSearchQuery.trim()) {
    const q = playerSearchQuery.toLowerCase();
    filtered = filtered.filter(p => {
      const team = getTeam(p.teamId);
      return p.name.toLowerCase().includes(q) || team.name.toLowerCase().includes(q);
    });
  }

  filtered.sort((a, b) => b[activePlayerMetric] - a[activePlayerMetric]);

  const activeMetricObj = metricOptions.find(m => m.key === activePlayerMetric) || metricOptions[0];

  return `
    <div class="stats-section-title">
      <div class="stats-section-title-left">
        Player Statistics &bull; ${activeMetricObj.label} Leaders
      </div>
    </div>

    <!-- Metric Filter Toolbar -->
    <div class="stats-filter-toolbar">
      <div class="stats-pill-group">
        ${metricOptions.map(m => `
          <button class="stats-filter-pill ${activePlayerMetric === m.key ? 'active' : ''}" onclick="activePlayerMetric='${m.key}'; renderStatsCentre();">
            ${m.label}
          </button>
        `).join('')}
      </div>

      <div style="display:flex;gap:8px;align-items:center;">
        <input type="text" placeholder="Search player or club..." value="${playerSearchQuery}" oninput="playerSearchQuery=this.value; renderStatsCentre();" style="padding:6px 12px;border:1px solid var(--border-color);border-radius:20px;font-size:12px;width:180px;">
        <select onchange="playerGroupFilter=this.value; renderStatsCentre();" class="fifa-select-pill" style="padding:6px 12px;font-size:12px;">
          <option value="all" ${playerGroupFilter === 'all' ? 'selected' : ''}>All Groups</option>
          ${GROUP_LETTERS.map(g => `<option value="${g}" ${playerGroupFilter === g ? 'selected' : ''}>Group ${g}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Player Table -->
    <div class="fifa-all-clubs-table-wrap">
      <table class="fifa-standings-table">
        <thead>
          <tr>
            <th style="width:40px;">Pos</th>
            <th style="text-align:left;">Player</th>
            <th style="text-align:left;">Club</th>
            <th>Role</th>
            <th>Mins</th>
            <th style="font-weight:900;color:var(--fifa-navy-dark);">${activeMetricObj.label}</th>
            <th style="text-align:right;padding-right:20px;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map((p, idx) => {
            const team = getTeam(p.teamId);
            const initials = p.name.split(' ').map(n => n[0]).join('').slice(0, 2);
            return `
              <tr onclick="openPlayerDetail('${p.id}')" style="cursor:pointer;">
                <td style="font-weight:800;color:var(--fifa-navy-dark);">${idx + 1}</td>
                <td style="text-align:left;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <span class="stats-avatar-circle">${initials}</span>
                    <span style="font-weight:800;color:var(--fifa-navy-dark);">${p.name}</span>
                  </div>
                </td>
                <td style="text-align:left;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    ${teamCrestHTML(team, 20)}
                    <span style="font-weight:700;">${team.name}</span>
                  </div>
                </td>
                <td><span style="font-size:11px;font-weight:800;background:#f1f5f9;padding:2px 8px;border-radius:4px;">${p.role}</span></td>
                <td>${p.minutes || 270}'</td>
                <td style="font-weight:900;font-size:15px;color:var(--fifa-navy-dark);">${p[activePlayerMetric]}</td>
                <td style="text-align:right;padding-right:20px;">
                  <button class="club-action-pill primary-pill" onclick="event.stopPropagation(); comparePlayer('${p.id}')" style="padding:4px 10px;font-size:11px;">
                    Compare ⇄
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 3. CLUB STATS SUBPAGE
function renderStatsClubHTML() {
  const metricOptions = [
    { key: 'goals', label: 'Goals Scored' },
    { key: 'conceded', label: 'Goals Conceded' },
    { key: 'tackles', label: 'Tackles Won' },
    { key: 'blocks', label: 'Blocks' },
    { key: 'passes', label: 'Total Passes' },
    { key: 'cleanSheets', label: 'Clean Sheets' },
    { key: 'possession', label: 'Possession %' },
    { key: 'shots', label: 'Total Shots' },
    { key: 'fouls', label: 'Fouls' }
  ];

  let clubsData = [...STAT_CLUBS];
  if (activeClubMetric === 'conceded' || activeClubMetric === 'fouls') {
    // For conceded/fouls, least is best or ascending
    clubsData.sort((a, b) => b[activeClubMetric] - a[activeClubMetric]);
  } else {
    clubsData.sort((a, b) => b[activeClubMetric] - a[activeClubMetric]);
  }

  const activeMetricObj = metricOptions.find(m => m.key === activeClubMetric) || metricOptions[0];

  return `
    <div class="stats-section-title">
      <div class="stats-section-title-left">
        Club Statistics &bull; ${activeMetricObj.label} Rankings
      </div>
    </div>

    <!-- Metric Filter Toolbar -->
    <div class="stats-filter-toolbar">
      <div class="stats-pill-group">
        ${metricOptions.map(m => `
          <button class="stats-filter-pill ${activeClubMetric === m.key ? 'active' : ''}" onclick="activeClubMetric='${m.key}'; renderStatsCentre();">
            ${m.label}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Club Table -->
    <div class="fifa-all-clubs-table-wrap">
      <table class="fifa-standings-table">
        <thead>
          <tr>
            <th style="width:40px;">Pos</th>
            <th style="text-align:left;">Club</th>
            <th>Group</th>
            <th>Matches</th>
            <th>Goals For</th>
            <th>Clean Sheets</th>
            <th style="font-weight:900;color:var(--fifa-navy-dark);">${activeMetricObj.label}</th>
            <th style="text-align:right;padding-right:20px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${clubsData.map((c, idx) => {
            const team = getTeam(c.teamId);
            const valDisplay = activeClubMetric === 'possession' ? c.possession + '%' : c[activeClubMetric].toLocaleString();
            return `
              <tr onclick="openClubDetailModal('${team.id}')" style="cursor:pointer;">
                <td style="font-weight:800;color:var(--fifa-navy-dark);">${idx + 1}</td>
                <td style="text-align:left;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    ${teamCrestHTML(team, 24)}
                    <span style="font-weight:800;color:var(--fifa-navy-dark);">${team.name}</span>
                  </div>
                </td>
                <td><span style="font-weight:700;">Group ${team.group || 'A'}</span></td>
                <td>3</td>
                <td>${c.goals}</td>
                <td>${c.cleanSheets}</td>
                <td style="font-weight:900;font-size:15px;color:var(--fifa-navy-dark);">${valDisplay}</td>
                <td style="text-align:right;padding-right:20px;">
                  <button class="club-action-pill primary-pill" onclick="event.stopPropagation(); openClubDetailModal('${team.id}')" style="padding:4px 10px;font-size:11px;">
                    Profile ❯
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 4. ALL-TIME STATS SUBPAGE
function renderStatsAllTimeHTML() {
  return `
    <div class="stats-section-title">
      <div class="stats-section-title-left">
        All-Time Tournament Statistics &amp; Milestones
      </div>
    </div>

    <!-- Milestones 6-card grid -->
    <div class="milestones-grid">
      ${ALL_TIME_STATS.map(s => `
        <div class="milestone-card">
          <span class="milestone-label">${s.label}</span>
          <span class="milestone-val">${s.value}</span>
          <span class="milestone-sub">${s.sub}</span>
        </div>
      `).join('')}
    </div>

    <!-- Detailed Historic Breakdown Table -->
    <div class="stats-section-title">
      <div class="stats-section-title-left">
        Historic Campaign Summary by Stage
      </div>
    </div>

    <div class="fifa-all-clubs-table-wrap">
      <table class="fifa-standings-table">
        <thead>
          <tr>
            <th style="text-align:left;">Stage</th>
            <th>Total Fixtures</th>
            <th>Goals Scored</th>
            <th>Avg Goals / Match</th>
            <th>Clean Sheets</th>
            <th>Cards (Y/R)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align:left;font-weight:800;color:var(--fifa-navy-dark);">Group Stage (Game 1, 2, 3)</td>
            <td>48</td>
            <td>102</td>
            <td>2.13</td>
            <td>28</td>
            <td>32 / 1</td>
          </tr>
          <tr>
            <td style="text-align:left;font-weight:800;color:var(--fifa-navy-dark);">Round of 16</td>
            <td>8</td>
            <td>22</td>
            <td>2.75</td>
            <td>5</td>
            <td>8 / 1</td>
          </tr>
          <tr>
            <td style="text-align:left;font-weight:800;color:var(--fifa-navy-dark);">Quarter Finals</td>
            <td>4</td>
            <td>11</td>
            <td>2.75</td>
            <td>2</td>
            <td>4 / 0</td>
          </tr>
          <tr>
            <td style="text-align:left;font-weight:800;color:var(--fifa-navy-dark);">Semi Finals &amp; Grand Final</td>
            <td>3</td>
            <td>8</td>
            <td>2.67</td>
            <td>2</td>
            <td>3 / 0</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// 5. RECORDS SUBPAGE
function renderStatsRecordsHTML() {
  return `
    <div class="stats-section-title">
      <div class="stats-section-title-left">
        Official Tournament Records &amp; Hall of Fame
      </div>
    </div>

    <div class="records-grid">
      ${TOURNAMENT_RECORDS.map(rec => `
        <div class="record-box-item">
          <div class="record-head">
            <span class="record-title-text">${rec.title}</span>
            <span class="record-badge-pill">RECORD HOLDER</span>
          </div>
          <div class="record-val-highlight">${rec.value}</div>
          <div class="record-holder-text">${rec.holder}</div>
          <div style="font-size:11.5px;color:var(--text-dim);">${rec.detail}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// 6. PLAYER COMPARISON SUBPAGE
function renderStatsPlayerComparisonHTML() {
  const p1 = STAT_PLAYERS.find(p => p.id === compPlayer1Id) || STAT_PLAYERS[0];
  const p2 = STAT_PLAYERS.find(p => p.id === compPlayer2Id) || STAT_PLAYERS[1];

  const t1 = getTeam(p1.teamId);
  const t2 = getTeam(p2.teamId);

  const compMetrics = [
    { label: 'Goals', v1: p1.goals, v2: p2.goals },
    { label: 'Assists', v1: p1.assists, v2: p2.assists },
    { label: 'Total Passes', v1: p1.passes, v2: p2.passes },
    { label: 'Tackles Won', v1: p1.tackles || 0, v2: p2.tackles || 0 },
    { label: 'Shots on Target', v1: p1.shots || 0, v2: p2.shots || 0 },
    { label: 'Minutes Played', v1: p1.minutes || 270, v2: p2.minutes || 270 }
  ];

  return `
    <div class="stats-section-title">
      <div class="stats-section-title-left">
        Head-to-Head Player Comparison
      </div>
    </div>

    <div class="comparison-container">
      <div class="comparison-header-boxes">
        <!-- Player 1 Card -->
        <div class="comp-player-card">
          <select class="fifa-select-pill" onchange="compPlayer1Id=this.value; renderStatsCentre();" style="width:100%;margin-bottom:12px;font-size:12px;">
            ${STAT_PLAYERS.map(p => `<option value="${p.id}" ${p.id === compPlayer1Id ? 'selected' : ''}>${p.name} (${getTeam(p.teamId).name})</option>`).join('')}
          </select>
          <div style="font-size:28px;margin-bottom:6px;">👤</div>
          <h3 style="font-size:18px;font-weight:800;color:var(--fifa-navy-dark);margin-bottom:4px;">${p1.name}</h3>
          <span style="font-size:12px;color:var(--text-dim);font-weight:700;">${teamCrestHTML(t1, 16)} ${t1.name} &bull; ${p1.role}</span>
        </div>

        <div class="comp-vs-circle">VS</div>

        <!-- Player 2 Card -->
        <div class="comp-player-card">
          <select class="fifa-select-pill" onchange="compPlayer2Id=this.value; renderStatsCentre();" style="width:100%;margin-bottom:12px;font-size:12px;">
            ${STAT_PLAYERS.map(p => `<option value="${p.id}" ${p.id === compPlayer2Id ? 'selected' : ''}>${p.name} (${getTeam(p.teamId).name})</option>`).join('')}
          </select>
          <div style="font-size:28px;margin-bottom:6px;">👤</div>
          <h3 style="font-size:18px;font-weight:800;color:var(--fifa-navy-dark);margin-bottom:4px;">${p2.name}</h3>
          <span style="font-size:12px;color:var(--text-dim);font-weight:700;">${teamCrestHTML(t2, 16)} ${t2.name} &bull; ${p2.role}</span>
        </div>
      </div>

      <!-- Comparative Stat Bars -->
      <div style="max-width:700px;margin:0 auto;">
        ${compMetrics.map(m => {
          const total = (m.v1 + m.v2) || 1;
          const p1Pct = Math.round((m.v1 / total) * 100);
          const p2Pct = 100 - p1Pct;
          return `
            <div class="comp-stat-bar-row">
              <div class="comp-stat-labels">
                <span style="font-weight:900;color:var(--fifa-blue);">${m.v1}</span>
                <span style="color:var(--text-dim);font-size:12px;text-transform:uppercase;">${m.label}</span>
                <span style="font-weight:900;color:var(--fifa-cyan);">${m.v2}</span>
              </div>
              <div class="comp-bar-track">
                <div class="comp-bar-left" style="width:${p1Pct}%;"></div>
                <div class="comp-bar-right" style="width:${p2Pct}%;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function comparePlayer(playerId) {
  compPlayer2Id = playerId;
  currentStatsSubpage = 'player-comp';
  renderStatsCentre();
}

// 7. HEAD TO HEAD SUBPAGE
function renderStatsH2HHTML() {
  const t1 = getTeam(compTeam1Id);
  const t2 = getTeam(compTeam2Id);

  const c1 = STAT_CLUBS.find(c => c.teamId === compTeam1Id) || { goals: 10, conceded: 3, possession: 55, tackles: 50, passes: 2500, cleanSheets: 2 };
  const c2 = STAT_CLUBS.find(c => c.teamId === compTeam2Id) || { goals: 8, conceded: 4, possession: 50, tackles: 45, passes: 2200, cleanSheets: 1 };

  const compClubMetrics = [
    { label: 'Goals Scored', v1: c1.goals, v2: c2.goals },
    { label: 'Goals Conceded', v1: c1.conceded, v2: c2.conceded },
    { label: 'Average Possession %', v1: c1.possession + '%', v2: c2.possession + '%', raw1: c1.possession, raw2: c2.possession },
    { label: 'Clean Sheets', v1: c1.cleanSheets, v2: c2.cleanSheets },
    { label: 'Tackles Won', v1: c1.tackles, v2: c2.tackles },
    { label: 'Total Passes', v1: c1.passes, v2: c2.passes }
  ];

  return `
    <div class="stats-section-title">
      <div class="stats-section-title-left">
        Head-to-Head Club Matchup
      </div>
    </div>

    <div class="comparison-container">
      <div class="comparison-header-boxes">
        <!-- Team 1 Card -->
        <div class="comp-player-card">
          <select class="fifa-select-pill" onchange="compTeam1Id=this.value; renderStatsCentre();" style="width:100%;margin-bottom:12px;font-size:12px;">
            ${TEAMS.map(t => `<option value="${t.id}" ${t.id === compTeam1Id ? 'selected' : ''}>${t.name} (Grp ${t.group || 'A'})</option>`).join('')}
          </select>
          <div style="display:flex;justify-content:center;margin:10px 0;">${teamCrestHTML(t1, 52)}</div>
          <h3 style="font-size:20px;font-weight:800;color:var(--fifa-navy-dark);margin-bottom:4px;">${t1.name}</h3>
          <span style="font-size:12px;color:var(--text-dim);font-weight:700;">Group ${t1.group || 'A'} &bull; Primary Pitch A</span>
        </div>

        <div class="comp-vs-circle">VS</div>

        <!-- Team 2 Card -->
        <div class="comp-player-card">
          <select class="fifa-select-pill" onchange="compTeam2Id=this.value; renderStatsCentre();" style="width:100%;margin-bottom:12px;font-size:12px;">
            ${TEAMS.map(t => `<option value="${t.id}" ${t.id === compTeam2Id ? 'selected' : ''}>${t.name} (Grp ${t.group || 'A'})</option>`).join('')}
          </select>
          <div style="display:flex;justify-content:center;margin:10px 0;">${teamCrestHTML(t2, 52)}</div>
          <h3 style="font-size:20px;font-weight:800;color:var(--fifa-navy-dark);margin-bottom:4px;">${t2.name}</h3>
          <span style="font-size:12px;color:var(--text-dim);font-weight:700;">Group ${t2.group || 'A'} &bull; Primary Pitch B</span>
        </div>
      </div>

      <!-- Comparative Stat Bars -->
      <div style="max-width:700px;margin:0 auto;">
        ${compClubMetrics.map(m => {
          const r1 = m.raw1 !== undefined ? m.raw1 : m.v1;
          const r2 = m.raw2 !== undefined ? m.raw2 : m.v2;
          const total = (r1 + r2) || 1;
          const p1Pct = Math.round((r1 / total) * 100);
          const p2Pct = 100 - p1Pct;
          return `
            <div class="comp-stat-bar-row">
              <div class="comp-stat-labels">
                <span style="font-weight:900;color:var(--fifa-blue);">${m.v1}</span>
                <span style="color:var(--text-dim);font-size:12px;text-transform:uppercase;">${m.label}</span>
                <span style="font-weight:900;color:var(--fifa-cyan);">${m.v2}</span>
              </div>
              <div class="comp-bar-track">
                <div class="comp-bar-left" style="width:${p1Pct}%;"></div>
                <div class="comp-bar-right" style="width:${p2Pct}%;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Player Detail Modal
function openPlayerDetail(playerId) {
  const p = STAT_PLAYERS.find(item => item.id === playerId);
  if (!p) return;
  const team = getTeam(p.teamId);
  const modalBody = document.getElementById('modal-match-body');
  if (!modalBody) return;

  const initials = p.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  modalBody.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <span class="stats-avatar-circle" style="width:54px;height:54px;font-size:18px;margin:0 auto 10px;">${initials}</span>
      <h3 style="font-family:var(--font-display);font-size:24px;font-weight:800;color:var(--fifa-navy-dark);margin:4px 0;">${p.name}</h3>
      <div style="display:flex;align-items:center;justify-content:center;gap:6px;font-size:13px;color:var(--text-dim);">
        ${teamCrestHTML(team, 18)}
        <span style="font-weight:700;">${team.name}</span>
        <span>&bull;</span>
        <span style="font-weight:800;color:var(--fifa-blue);">${p.role}</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;margin-bottom:18px;">
      <div style="background:#f8fafc;padding:12px;border-radius:6px;text-align:center;border:1px solid var(--border-color);">
        <span style="font-size:11px;color:var(--text-dim);font-weight:700;">GOALS</span>
        <div style="font-size:22px;font-weight:900;color:var(--fifa-navy-dark);">${p.goals}</div>
      </div>
      <div style="background:#f8fafc;padding:12px;border-radius:6px;text-align:center;border:1px solid var(--border-color);">
        <span style="font-size:11px;color:var(--text-dim);font-weight:700;">ASSISTS</span>
        <div style="font-size:22px;font-weight:900;color:var(--fifa-navy-dark);">${p.assists}</div>
      </div>
      <div style="background:#f8fafc;padding:12px;border-radius:6px;text-align:center;border:1px solid var(--border-color);">
        <span style="font-size:11px;color:var(--text-dim);font-weight:700;">PASSES</span>
        <div style="font-size:22px;font-weight:900;color:var(--fifa-navy-dark);">${p.passes}</div>
      </div>
    </div>

    <div style="display:flex;gap:10px;">
      <button class="btn-fifa-calendar" onclick="closeModal('match'); comparePlayer('${p.id}');" style="width:100%;justify-content:center;">
        Compare Player ⇄
      </button>
    </div>
  `;

  openModal('match');
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
    icsContent += `DESCRIPTION:${m.round} - ${m.stage || 'Match'} at ${m.pitch}, Edenvale Indoor Soccer\n`;
    icsContent += `LOCATION:${m.pitch}, Edenvale Indoor Soccer, Edenvale\n`;
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

// ── 8. DEVELOPER AUTHENTICATION & MODAL CONTROLS ──
let pendingDevAction = null;

function isDevAuthed() {
  return sessionStorage.getItem('rttf_dev_authed') === 'true';
}

function requireDevAuth(actionCallback) {
  if (isDevAuthed()) {
    if (actionCallback) actionCallback();
    return;
  }
  pendingDevAction = actionCallback;
  const pwInput = document.getElementById('dev-password-input');
  if (pwInput) pwInput.value = '';
  openModal('dev-auth');
  setTimeout(() => {
    if (pwInput) pwInput.focus();
  }, 100);
}

function submitDevAuth(e) {
  if (e) e.preventDefault();
  const pwInput = document.getElementById('dev-password-input');
  const val = pwInput ? pwInput.value.trim() : '';

  if (val === 'wedonthavewifi1') {
    sessionStorage.setItem('rttf_dev_authed', 'true');
    closeModal('dev-auth');
    showToast("🔓 Developer access granted!");
    if (pendingDevAction) {
      const cb = pendingDevAction;
      pendingDevAction = null;
      cb();
    }
    renderMediaGallery();
  } else {
    showToast("❌ Incorrect password. Access denied.");
    if (pwInput) {
      pwInput.value = '';
      pwInput.focus();
    }
  }
}

function lockDevAuth() {
  sessionStorage.removeItem('rttf_dev_authed');
  showToast('🔒 Developer session locked');
  renderMediaGallery();
}

function openModal(modalId) {
  if (modalId === 'upload-teams' && !isDevAuthed()) {
    requireDevAuth(() => openModal('upload-teams'));
    return;
  }
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
      <p style="font-size:12.5px;color:var(--text-dim);">${formatDate(m.date)} &bull; Edenvale Indoor Soccer, Edenvale</p>
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

  TEAMS.forEach(team => {
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
  renderStatsCentre();
}

function resetToDefaultTeams() {
  localStorage.removeItem('rttf_teams');
  TEAMS = JSON.parse(JSON.stringify(DEFAULT_TEAMS));
  initTeamUploaderUI();
  renderFIFAMatches();
  renderStandingsAndBracket();
  renderTeamsGrid();
  renderStatsCentre();
  closeModal('upload-teams');
  showToast("🔄 Reset to default TBD teams.");
}

// ── 9. OFFICIAL TEAM SIGN-UP & WHATSAPP INTEGRATION (0695462972) ──
let signupSlotsCount = 5; // Initial 5 mandatory players (1 GK + 4 Outfield)
let signupPlayersData = [
  { name: '', role: 'Goalkeeper', number: '1' },
  { name: '', role: 'Defender', number: '2' },
  { name: '', role: 'Midfielder', number: '7' },
  { name: '', role: 'Midfielder', number: '8' },
  { name: '', role: 'Forward', number: '9' }
];

function initSignupForm() {
  const primaryColor = document.getElementById('signup-kit-primary');
  const primaryText = document.getElementById('signup-kit-primary-text');
  const secondaryColor = document.getElementById('signup-kit-secondary');
  const secondaryText = document.getElementById('signup-kit-secondary-text');

  if (primaryColor && primaryText) {
    primaryColor.addEventListener('input', () => { primaryText.value = primaryColor.value; });
    primaryText.addEventListener('input', () => { primaryColor.value = primaryText.value; });
  }
  if (secondaryColor && secondaryText) {
    secondaryColor.addEventListener('input', () => { secondaryText.value = secondaryColor.value; });
    secondaryText.addEventListener('input', () => { secondaryColor.value = secondaryText.value; });
  }

  renderSignupSlots();
}

function saveCurrentSlotInputs() {
  for (let i = 1; i <= signupSlotsCount; i++) {
    const nameEl = document.getElementById(`signup-p-name-${i}`);
    const roleEl = document.getElementById(`signup-p-role-${i}`);
    const numEl = document.getElementById(`signup-p-num-${i}`);
    if (nameEl) {
      if (!signupPlayersData[i - 1]) signupPlayersData[i - 1] = {};
      signupPlayersData[i - 1].name = nameEl.value;
      if (roleEl) signupPlayersData[i - 1].role = roleEl.value;
      if (numEl) signupPlayersData[i - 1].number = numEl.value;
    }
  }
}

function renderSignupSlots() {
  const container = document.getElementById('signup-members-container');
  if (!container) return;

  let html = '';
  for (let i = 1; i <= signupSlotsCount; i++) {
    const data = signupPlayersData[i - 1] || { name: '', role: i === 1 ? 'Goalkeeper' : 'Outfield', number: '' };
    const isGK = i === 1;
    const isOutfield = i >= 2 && i <= 5;
    const isSub = i > 5;

    const tagClass = isGK ? 'gk' : isOutfield ? 'outfield' : 'sub';
    const tagLabel = isGK ? '🧤 GK (Mandatory)' : isOutfield ? `⚽ Player ${i}` : `🔄 Sub ${i}`;

    html += `
      <div class="player-slot-row">
        <div>
          <span class="player-slot-tag ${tagClass}">${tagLabel}</span>
        </div>
        <div>
          <input type="text" id="signup-p-name-${i}" class="signup-input" placeholder="${isGK ? 'Goalkeeper Full Name *' : `Player ${i} Full Name ${i <= 5 ? '*' : '(Optional)'}`}" value="${data.name || ''}" ${i <= 5 ? 'required' : ''} style="width:100%;">
        </div>
        <div>
          ${isGK ? `
            <input type="text" id="signup-p-role-${i}" class="signup-input" value="Goalkeeper" readonly style="background:#f1f5f9;cursor:not-allowed;">
          ` : `
            <select id="signup-p-role-${i}" class="signup-input" style="width:100%;">
              <option value="Defender" ${data.role === 'Defender' ? 'selected' : ''}>Defender</option>
              <option value="Midfielder" ${data.role === 'Midfielder' ? 'selected' : ''}>Midfielder</option>
              <option value="Forward" ${data.role === 'Forward' ? 'selected' : ''}>Forward</option>
            </select>
          `}
        </div>
        <div>
          <input type="number" id="signup-p-num-${i}" class="signup-input" placeholder="#" min="1" max="99" value="${data.number || ''}" style="width:100%;">
        </div>
        <div>
          ${isSub ? `
            <button type="button" class="slot-delete-btn" onclick="removeSignupSubstituteSlot(${i})" title="Remove substitute player">&times;</button>
          ` : `
            <span style="font-size:12px;color:var(--text-dim);">&bull;</span>
          `}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;

  // Update badge and next slot number
  const countBadge = document.getElementById('roster-count-badge');
  if (countBadge) {
    countBadge.textContent = `${signupSlotsCount} / 8 Members (Valid)`;
    countBadge.className = 'roster-count-pill valid';
  }

  const nextSlotEl = document.getElementById('next-slot-num');
  if (nextSlotEl) {
    nextSlotEl.textContent = Math.min(signupSlotsCount + 1, 8);
  }

  const addBtn = document.getElementById('btn-add-sub-slot');
  if (addBtn) {
    if (signupSlotsCount >= 8) {
      addBtn.disabled = true;
      addBtn.innerHTML = `<span>✓</span> Maximum 8 Players Reached`;
    } else {
      addBtn.disabled = false;
      addBtn.innerHTML = `<span>➕</span> Add Substitute Player (Slot ${signupSlotsCount + 1} of 8)`;
    }
  }
}

function addSignupSubstituteSlot() {
  if (signupSlotsCount >= 8) return;
  saveCurrentSlotInputs();
  signupSlotsCount++;
  if (!signupPlayersData[signupSlotsCount - 1]) {
    signupPlayersData[signupSlotsCount - 1] = { name: '', role: 'Midfielder', number: '' };
  }
  renderSignupSlots();
}

function removeSignupSubstituteSlot(slotIndex) {
  if (signupSlotsCount <= 5) return;
  saveCurrentSlotInputs();
  signupPlayersData.splice(slotIndex - 1, 1);
  signupSlotsCount--;
  renderSignupSlots();
}

function submitTeamSignupToWhatsApp() {
  saveCurrentSlotInputs();

  const teamName = document.getElementById('signup-team-name')?.value.trim();
  const teamCode = (document.getElementById('signup-team-code')?.value.trim() || teamName.slice(0, 4)).toUpperCase();
  const captainName = document.getElementById('signup-captain-name')?.value.trim();
  const captainPhone = document.getElementById('signup-captain-phone')?.value.trim();
  const groupPref = document.getElementById('signup-group-pref')?.value || 'Any Group';
  const kitPrimary = document.getElementById('signup-kit-primary')?.value || '#001438';
  const kitSecondary = document.getElementById('signup-kit-secondary')?.value || '#00d4ff';
  const rulesAgree = document.getElementById('signup-rules-agree')?.checked;

  if (!teamName) {
    showToast("⚠️ Please enter your Team Name!");
    return;
  }
  if (!captainName || !captainPhone) {
    showToast("⚠️ Please provide Captain Name and WhatsApp contact!");
    return;
  }

  // Validate at least 5 mandatory player names
  for (let i = 1; i <= 5; i++) {
    const pData = signupPlayersData[i - 1];
    if (!pData || !pData.name || !pData.name.trim()) {
      showToast(`⚠️ Please enter the name for Player ${i} (${i === 1 ? 'Goalkeeper' : 'Outfield'})! Minimum 5 players required.`);
      return;
    }
  }

  if (!rulesAgree) {
    showToast("⚠️ Please agree to the Official Tournament Rules to proceed.");
    return;
  }

  // Build the roster details
  const activePlayers = signupPlayersData.slice(0, signupSlotsCount).filter(p => p.name && p.name.trim());
  if (activePlayers.length < 5 || activePlayers.length > 8) {
    showToast(`⚠️ Squad size must be between 5 and 8 players (currently: ${activePlayers.length})`);
    return;
  }

  let rosterText = '';
  activePlayers.forEach((p, idx) => {
    const roleIcon = idx === 0 ? '🧤' : idx < 5 ? '⚽' : '🔄';
    const numText = p.number ? ` (#${p.number})` : '';
    rosterText += `${idx + 1}. ${roleIcon} *${p.name.trim()}* — ${p.role}${numText}\n`;
  });

  const whatsappMessage = 
`🏆 *ROAD TO THE FINAL 2026 — TEAM SIGN-UP* 🏆
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *TEAM DETAILS:*
• *Team Name:* ${teamName}
• *Short Code:* ${teamCode}
• *Kit Colors:* Primary ${kitPrimary} | Secondary ${kitSecondary}
• *Captain / Manager:* ${captainName}
• *Captain WhatsApp:* ${captainPhone}
• *Group Preference:* ${groupPref}

👥 *SQUAD ROSTER (${activePlayers.length}/8 Players — 5-a-Side):*
${rosterText}
📜 *OFFICIAL RULES & REGULATIONS ACCEPTED:*
✅ 5-a-Side format (4 outfield players + 1 goalkeeper)
✅ Roster verified: ${activePlayers.length} registered players (5 to 8 max)
✅ Rolling substitutions acknowledged
✅ Punctuality Rule: 2-min delay = penalty goal, 5-min delay = match forfeit
✅ No slide tackling rule & 5-minute sin-bin acknowledged
✅ Zero tolerance for fighting & immediate team disqualification
✅ Strict non-refundable registration fee policy accepted
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Submitted via Road to the Final 2026 Portal_`;

  const targetWhatsAppNumber = "27695462972";
  const whatsappUrl = `https://wa.me/${targetWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // Open WhatsApp in new tab
  window.open(whatsappUrl, '_blank');

  // Also offer to add team to local tournament dataset
  const assignToSlot = TEAMS.find(t => t.name.startsWith('TBD'));
  if (assignToSlot) {
    assignToSlot.name = teamName;
    assignToSlot.shortName = teamCode;
    assignToSlot.color = kitPrimary;
    assignToSlot.accentColor = kitSecondary;
    localStorage.setItem('rttf_teams', JSON.stringify(TEAMS));
    renderFIFAMatches();
    renderStandingsAndBracket();
    renderTeamsGrid();
    renderStatsCentre();
  }

  closeModal('signup-team');
  showToast("🚀 WhatsApp launched! Send the message to complete your team sign-up.");
}

// ── 10. INITIALIZATION ──
document.addEventListener('DOMContentLoaded', () => {
  initTeamUploaderUI();
  initSignupForm();
  renderFIFAMatches();
  renderStandingsAndBracket();
  renderTeamsGrid();
  renderStatsCentre();
  initMediaGallery();

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

// ==========================================================================
// 11. MEDIA GALLERY ENGINE
// Upload, browse, filter, lightbox, delete — stored in localStorage
// ==========================================================================

const MEDIA_STORAGE_KEY = 'rttf_media_items';
let mediaItems = [];
let lightboxIndex = 0;
let mediaCurrentFilter = 'all';

function loadMediaItems() {
  try {
    const stored = localStorage.getItem(MEDIA_STORAGE_KEY);
    mediaItems = stored ? JSON.parse(stored) : [];
  } catch (e) {
    mediaItems = [];
  }
}

function saveMediaItems() {
  try {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(mediaItems));
  } catch (e) {
    showToast('⚠️ Storage limit reached. Try deleting some older media.');
  }
}

function initMediaGallery() {
  loadMediaItems();

  // File input (drop zone)
  const fileInput = document.getElementById('media-file-input');
  const fileInputTop = document.getElementById('media-file-input-top');
  const dropZone = document.getElementById('media-drop-zone');

  if (fileInput) {
    fileInput.addEventListener('change', e => handleMediaFiles(e.target.files));
  }
  if (fileInputTop) {
    fileInputTop.addEventListener('change', e => handleMediaFiles(e.target.files));
  }

  // Drag and drop
  if (dropZone) {
    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      handleMediaFiles(e.dataTransfer.files);
    });
  }

  // Keyboard close lightbox
  document.addEventListener('keydown', e => {
    const lb = document.getElementById('media-lightbox');
    if (lb && lb.classList.contains('open')) {
      if (e.key === 'Escape') closeLightboxBtn();
      if (e.key === 'ArrowRight') lightboxNav(1);
      if (e.key === 'ArrowLeft') lightboxNav(-1);
    }
  });
}

function handleMediaFiles(files) {
  if (!isDevAuthed()) {
    requireDevAuth(() => handleMediaFiles(files));
    return;
  }
  if (!files || files.length === 0) return;
  const MAX_SIZE_MB = 50;
  let added = 0;

  Array.from(files).forEach(file => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showToast(`⚠️ ${file.name} exceeds ${MAX_SIZE_MB}MB limit.`);
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const item = {
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        type: isVideo ? 'video' : 'photo',
        src: ev.target.result,
        caption: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        size: formatFileSize(file.size),
        addedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      mediaItems.unshift(item);
      saveMediaItems();
      renderMediaGallery();
      added++;
      if (added === 1) showToast(`✅ ${files.length} file${files.length > 1 ? 's' : ''} added to gallery!`);
    };
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function filterMedia(filter) {
  mediaCurrentFilter = filter;
  document.querySelectorAll('.media-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderMediaGallery();
}

function renderMediaGallery() {
  loadMediaItems();
  const grid = document.getElementById('media-gallery-grid');
  if (!grid) return;

  const isAuthed = isDevAuthed();

  // Header Actions (Dev Lock / Unlock status)
  const headerBar = document.querySelector('.media-header-bar');
  if (headerBar) {
    let headerActionBtn = headerBar.querySelector('.media-header-dev-btn');
    if (!headerActionBtn) {
      headerActionBtn = document.createElement('div');
      headerActionBtn.className = 'media-header-dev-btn';
      headerBar.appendChild(headerActionBtn);
    }
    if (isAuthed) {
      headerActionBtn.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span class="dev-badge-unlocked">🔓 Dev Mode</span>
          <label class="media-upload-btn" for="media-file-input-top" style="cursor:pointer;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Media
          </label>
          <button onclick="lockDevAuth();" class="stage-tab-btn" style="background:#fee2e2;color:#991b1b;border:none;border-radius:20px;padding:6px 14px;font-size:12px;font-weight:700;">
            🔒 Lock Dev
          </button>
        </div>`;
    } else {
      headerActionBtn.innerHTML = `
        <button onclick="requireDevAuth(() => renderMediaGallery());" class="btn-upload-nav" style="padding:8px 16px;font-size:13px;">
          🔑 Dev Upload Login
        </button>`;
    }
    // Hide default static upload label in HTML header bar if present
    const staticTopBtn = headerBar.querySelector('label.media-upload-btn[for="media-file-input-top"]');
    if (staticTopBtn && staticTopBtn !== headerActionBtn.querySelector('label')) {
      staticTopBtn.style.display = 'none';
    }
  }

  // Drop Zone vs Dev Lock Banner
  const dropZone = document.getElementById('media-drop-zone');
  let devLockCard = document.getElementById('media-dev-lock-card');

  if (isAuthed) {
    if (dropZone) dropZone.style.display = 'flex';
    if (devLockCard) devLockCard.style.display = 'none';
  } else {
    if (dropZone) dropZone.style.display = 'none';
    if (!devLockCard && dropZone) {
      devLockCard = document.createElement('div');
      devLockCard.id = 'media-dev-lock-card';
      devLockCard.className = 'dev-lock-banner';
      dropZone.parentNode.insertBefore(devLockCard, dropZone.nextSibling);
    }
    if (devLockCard) {
      devLockCard.style.display = 'block';
      devLockCard.onclick = () => requireDevAuth(() => renderMediaGallery());
      devLockCard.innerHTML = `
        <div style="font-size:32px;margin-bottom:8px;">🔒</div>
        <h3 style="font-family:var(--font-display);font-size:22px;font-weight:800;margin:0 0 6px;">Developer Upload Access</h3>
        <p style="font-size:13px;color:rgba(255,255,255,0.8);max-width:540px;margin:0 auto 16px;line-height:1.45;">
          The media gallery is public for viewing. Only verified tournament developers can upload videos &amp; photos or delete files.
        </p>
        <button class="btn-upload-nav" style="display:inline-flex;align-items:center;gap:8px;padding:10px 24px;font-size:14px;background:#ffffff;color:#001438;font-weight:800;border-radius:20px;">
          🔑 Enter Dev Password to Upload Media
        </button>`;
    }
  }

  // Update stats
  const photos = mediaItems.filter(i => i.type === 'photo');
  const videos = mediaItems.filter(i => i.type === 'video');
  const elP = document.getElementById('media-count-photos');
  const elV = document.getElementById('media-count-videos');
  const elT = document.getElementById('media-count-total');
  if (elP) elP.textContent = photos.length + ' Photo' + (photos.length !== 1 ? 's' : '');
  if (elV) elV.textContent = videos.length + ' Video' + (videos.length !== 1 ? 's' : '');
  if (elT) elT.textContent = mediaItems.length + ' Total File' + (mediaItems.length !== 1 ? 's' : '');

  // Apply filter
  let filtered = mediaCurrentFilter === 'all'
    ? mediaItems
    : mediaItems.filter(i => i.type === mediaCurrentFilter);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="media-empty-state" style="grid-column:1/-1;">
        <div class="media-empty-icon">${mediaCurrentFilter === 'video' ? '🎬' : mediaCurrentFilter === 'photo' ? '📸' : '📂'}</div>
        <div class="media-empty-title">${mediaCurrentFilter === 'all' ? 'No media in gallery yet' : 'No ' + mediaCurrentFilter + 's yet'}</div>
        <p class="media-empty-sub">${isAuthed ? 'Use the upload drop zone above to add match photos &amp; videos.' : 'Public gallery is currently empty. Developers can log in above to upload photos and videos.'}</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map((item, idx) => {
    const realIdx = mediaItems.indexOf(item);
    const deleteBtnHtml = isAuthed ? `<button class="media-item-delete" onclick="event.stopPropagation(); deleteMediaItem('${item.id}')" title="Delete File">✕</button>` : '';
    if (item.type === 'video') {
      return `
        <div class="media-gallery-item" onclick="openLightbox(${realIdx})">
          <div class="media-thumb-wrap">
            <video src="${item.src}" muted preload="metadata"></video>
            <span class="media-type-badge">🎬 Video</span>
            <div class="media-play-overlay"><div class="media-play-circle">▶</div></div>
          </div>
          ${deleteBtnHtml}
          <div class="media-item-info">
            <div class="media-item-caption">${escapeHtml(item.caption)}</div>
            <div class="media-item-meta"><span>${item.addedAt}</span><span>${item.size}</span></div>
          </div>
        </div>`;
    } else {
      return `
        <div class="media-gallery-item" onclick="openLightbox(${realIdx})">
          <div class="media-thumb-wrap">
            <img src="${item.src}" alt="${escapeHtml(item.caption)}" loading="lazy">
            <span class="media-type-badge">📸 Photo</span>
            <div class="media-play-overlay"><div class="media-play-circle">🔍</div></div>
          </div>
          ${deleteBtnHtml}
          <div class="media-item-info">
            <div class="media-item-caption">${escapeHtml(item.caption)}</div>
            <div class="media-item-meta"><span>${item.addedAt}</span><span>${item.size}</span></div>
          </div>
        </div>`;
    }
  }).join('');
}

function deleteMediaItem(id) {
  if (!isDevAuthed()) {
    requireDevAuth(() => deleteMediaItem(id));
    return;
  }
  mediaItems = mediaItems.filter(i => i.id !== id);
  saveMediaItems();
  renderMediaGallery();
  showToast('🗑️ Media item removed.');
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// LIGHTBOX
function openLightbox(index) {
  lightboxIndex = index;
  updateLightboxContent();
  document.getElementById('media-lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightboxBtn() {
  document.getElementById('media-lightbox').classList.remove('open');
  document.body.style.overflow = '';
  // Pause any video
  const vid = document.querySelector('#media-lightbox-media video');
  if (vid) vid.pause();
}

function closeLightbox(e) {
  // Only close if clicking backdrop (not inner content)
  if (e.target === document.getElementById('media-lightbox')) {
    closeLightboxBtn();
  }
}

function lightboxNav(dir) {
  const len = mediaItems.length;
  if (len === 0) return;
  // Pause current video before switching
  const vid = document.querySelector('#media-lightbox-media video');
  if (vid) vid.pause();
  lightboxIndex = (lightboxIndex + dir + len) % len;
  updateLightboxContent();
}

function updateLightboxContent() {
  const item = mediaItems[lightboxIndex];
  if (!item) return;
  const mediaEl = document.getElementById('media-lightbox-media');
  const capEl = document.getElementById('media-lightbox-caption');
  if (item.type === 'video') {
    mediaEl.innerHTML = `<video src="${item.src}" controls autoplay style="width:100%;max-height:80vh;border-radius:8px;"></video>`;
  } else {
    mediaEl.innerHTML = `<img src="${item.src}" alt="${escapeHtml(item.caption)}" style="width:100%;max-height:80vh;object-fit:contain;border-radius:8px;">` ;
  }
  if (capEl) capEl.textContent = item.caption + ' — ' + item.addedAt + ' (' + (lightboxIndex + 1) + ' / ' + mediaItems.length + ')';
}
