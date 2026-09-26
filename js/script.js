// =============================================
// ROAD TO THE FINAL 2026 — Main Application JS
// =============================================

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

function getTeam(id) {
  return TEAMS.find(t => t.id === id) || { name: id, shortName: '???', color: '#555', accentColor: '#fff' };
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

function teamCrestHTML(team, size = 22) {
  return `<span class="team-crest-small" style="width:${size}px;height:${size}px;background:${team.color};color:${team.accentColor};font-size:${Math.round(size*0.45)}px;">${team.shortName}</span>`;
}

function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ──────────────────────────────────────────────
// TAB SWITCHING
// ──────────────────────────────────────────────

function switchTab(tabId) {
  // Update buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive);
  });

  // Update panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === 'panel-' + tabId);
  });

  // Close mobile menu
  const tabs = document.getElementById('main-tabs');
  tabs.classList.remove('mobile-open');
  const menuBtn = document.getElementById('mobile-menu-btn');
  if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');

  // Scroll to content
  const hero = document.getElementById('hero-banner');
  if (hero) {
    const headerH = document.getElementById('site-header')?.offsetHeight || 60;
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    if (window.scrollY < heroBottom - headerH - 20) {
      window.scrollTo({ top: heroBottom - headerH, behavior: 'smooth' });
    }
  }
}

// ──────────────────────────────────────────────
// FIXTURES
// ──────────────────────────────────────────────

let currentFixtureFilter = 'all';

function renderFixtures(filter) {
  currentFixtureFilter = filter;
  const list = document.getElementById('fixtures-list');
  if (!list) return;

  const filtered = filter === 'all'
    ? MATCHES
    : MATCHES.filter(m => m.round === filter);

  if (filtered.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);padding:24px;text-align:center;">No matches found.</p>';
    return;
  }

  // Group by date
  const byDate = {};
  filtered.forEach(m => {
    if (!byDate[m.date]) byDate[m.date] = [];
    byDate[m.date].push(m);
  });

  let html = '';
  Object.keys(byDate).sort().forEach(date => {
    html += `<div class="fixture-day-group">
      <div class="fixture-day-header">${formatDate(date)}</div>`;

    byDate[date].forEach(m => {
      const home = getTeam(m.homeTeam);
      const away = getTeam(m.awayTeam);
      const isTBD = m.homeTeam === 'TBD';

      let scoreHTML;
      if (m.status === 'FT' && m.homeScore !== null) {
        scoreHTML = `
          <div class="match-score-block">
            <div class="score-value">${m.homeScore} – ${m.awayScore}</div>
            <span class="match-status-badge badge-ft">FT</span>
          </div>`;
      } else if (m.status === 'LIVE') {
        scoreHTML = `
          <div class="match-score-block">
            <div class="score-value">${m.homeScore} – ${m.awayScore}</div>
            <span class="match-status-badge badge-live">LIVE</span>
          </div>`;
      } else if (m.status === 'Scheduled') {
        scoreHTML = `
          <div class="match-score-block">
            <div class="score-dash">vs</div>
            <span class="match-status-badge badge-scheduled">${m.time}</span>
          </div>`;
      } else {
        scoreHTML = `
          <div class="match-score-block">
            <div class="score-dash">vs</div>
            <span class="match-status-badge badge-tbd">TBD</span>
          </div>`;
      }

      html += `
        <div class="match-card" data-status="${m.status}">
          <div class="match-meta">
            <div class="match-time">${m.time}</div>
            <div class="match-pitch">${m.pitch}</div>
          </div>
          <div class="match-teams">
            <div class="match-team-row">
              ${isTBD ? `<span class="team-crest-small" style="background:var(--border)">?</span>` : teamCrestHTML(home)}
              <span class="team-name-match">${isTBD ? 'TBD' : home.name}</span>
            </div>
            <div class="match-team-row">
              ${isTBD ? `<span class="team-crest-small" style="background:var(--border)">?</span>` : teamCrestHTML(away)}
              <span class="team-name-match">${isTBD ? 'TBD' : away.name}</span>
            </div>
          </div>
          ${scoreHTML}
          <span class="round-pill">${m.round}${m.group ? ' · Grp ' + m.group : ''}</span>
        </div>`;
    });

    html += '</div>';
  });

  list.innerHTML = html;
}

function initFixturesFilter() {
  const container = document.getElementById('fixtures-filter');
  if (!container) return;
  container.addEventListener('click', e => {
    const btn = e.target.closest('.filter-pill');
    if (!btn) return;
    container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    renderFixtures(btn.dataset.filter);
  });
}

// ──────────────────────────────────────────────
// STANDINGS
// ──────────────────────────────────────────────

function renderStandings() {
  const container = document.getElementById('standings-container');
  if (!container) return;

  let html = '';
  GROUPS.forEach(group => {
    html += `
      <div class="standings-group">
        <div class="standings-group-title">
          <span>${group.id}</span>
          ${group.name}
        </div>
        <table class="standings-table" role="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th title="Played">P</th>
              <th title="Wins">W</th>
              <th title="Draws">D</th>
              <th title="Losses">L</th>
              <th title="Goals For">GF</th>
              <th title="Goals Against">GA</th>
              <th title="Goal Difference">GD</th>
              <th title="Points">PTS</th>
              <th title="Form">Form</th>
            </tr>
          </thead>
          <tbody>`;

    group.standings.forEach((row, idx) => {
      const team = getTeam(row.teamId);
      const qualify = idx < 2; // top 2 qualify

      const formDots = row.form.map(f =>
        `<span class="form-dot form-dot-${f}" title="${f}"></span>`
      ).join('');

      const gd = row.gd > 0 ? '+' + row.gd : row.gd;

      html += `
            <tr class="${qualify ? 'qualify-zone' : ''}">
              <td class="td-pos">${row.pos}</td>
              <td>
                <div class="td-team-cell">
                  <div class="td-crest" style="background:${team.color};color:${team.accentColor}">${team.shortName}</div>
                  <span class="td-team-name">${team.name}</span>
                </div>
              </td>
              <td>${row.p}</td>
              <td>${row.w}</td>
              <td>${row.d}</td>
              <td>${row.l}</td>
              <td>${row.gf}</td>
              <td>${row.ga}</td>
              <td style="color:${row.gd >= 0 ? 'var(--win)' : 'var(--loss)'}">${gd}</td>
              <td class="td-pts">${row.pts}</td>
              <td><div class="form-dots">${formDots}</div></td>
            </tr>`;
    });

    html += `
          </tbody>
        </table>
        <p style="font-size:11px;color:var(--text-muted);margin-top:6px;padding-left:4px;">
          <span style="display:inline-block;width:10px;height:10px;background:var(--accent-green);border-radius:50%;margin-right:4px;vertical-align:middle;"></span>
          Top 2 advance to Quarter Finals
        </p>
      </div>`;
  });

  container.innerHTML = html;
}

// ──────────────────────────────────────────────
// STATS
// ──────────────────────────────────────────────

let currentStatType = 'scorers';

function renderStats(type) {
  currentStatType = type;
  const container = document.getElementById('stats-table-wrap');
  if (!container) return;

  const data = type === 'scorers' ? TOP_SCORERS : TOP_ASSISTS;
  const statKey = type === 'scorers' ? 'goals' : 'assists';
  const statLabel = type === 'scorers' ? 'Goals' : 'Assists';
  const maxVal = data[0]?.[statKey] || 1;

  let html = `
    <table class="stats-table" role="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Player</th>
          <th>${statLabel}</th>
          <th style="min-width:80px">${type === 'scorers' ? 'Assists' : 'Goals'}</th>
        </tr>
      </thead>
      <tbody>`;

  data.forEach(row => {
    const team = getTeam(row.teamId);
    const rankClass = row.rank <= 3 ? ` rank-${row.rank}` : '';
    const pct = Math.round((row[statKey] / maxVal) * 100);
    const secondary = type === 'scorers' ? row.assists : row.goals;

    html += `
        <tr>
          <td class="stats-rank${rankClass}">${row.rank}</td>
          <td>
            <div class="stats-player-cell">
              <div class="stats-crest" style="background:${team.color};color:${team.accentColor}">${team.shortName}</div>
              <div>
                <div class="stats-player-name">${row.name}</div>
                <div class="stats-team-name">${team.name}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="stats-goals-bar">
              <span class="goals-count">${row[statKey]}</span>
              <div class="goals-bar-wrap">
                <div class="goals-bar-fill" style="width:${pct}%"></div>
              </div>
            </div>
          </td>
          <td style="color:var(--text-secondary);font-weight:600;">${secondary}</td>
        </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function initStatsFilter() {
  const container = document.getElementById('stats-filter');
  if (!container) return;
  container.addEventListener('click', e => {
    const btn = e.target.closest('.filter-pill');
    if (!btn) return;
    container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    renderStats(btn.dataset.stat);
  });
}

// ──────────────────────────────────────────────
// TEAMS
// ──────────────────────────────────────────────

function renderTeams() {
  const container = document.getElementById('teams-grid');
  if (!container) return;

  let html = '';
  TEAMS.forEach(team => {
    // Get standing for this team
    let standing = null;
    GROUPS.forEach(g => {
      const s = g.standings.find(s => s.teamId === team.id);
      if (s) standing = s;
    });

    html += `
      <div class="team-card" style="--tc:${team.color}">
        <div class="team-crest-large" style="background:${team.color};color:${team.accentColor}">
          ${team.shortName}
        </div>
        <div class="team-card-name">${team.name}</div>
        <div class="team-card-group">Group ${team.group}</div>
        ${standing ? `
        <div class="team-card-stats">
          <div class="team-stat-item">
            <span class="team-stat-num">${standing.pts}</span>
            <span class="team-stat-lbl">PTS</span>
          </div>
          <div class="team-stat-item">
            <span class="team-stat-num">${standing.w}</span>
            <span class="team-stat-lbl">W</span>
          </div>
          <div class="team-stat-item">
            <span class="team-stat-num">${standing.gf}</span>
            <span class="team-stat-lbl">GF</span>
          </div>
        </div>
        <div class="form-dots" style="justify-content:center">
          ${standing.form.map(f => `<span class="form-dot form-dot-${f}" title="${f}"></span>`).join('')}
        </div>` : ''}
      </div>`;
  });

  container.innerHTML = html;
}

// ──────────────────────────────────────────────
// RULES
// ──────────────────────────────────────────────

function renderRules() {
  const container = document.getElementById('rules-accordion');
  if (!container) return;

  let html = '';
  RULES.forEach((rule, idx) => {
    const items = rule.items.map(item => `<li>${item}</li>`).join('');
    html += `
      <div class="accordion-item ${idx === 0 ? 'open' : ''}" id="acc-${idx}">
        <button class="accordion-header" aria-expanded="${idx === 0}" aria-controls="acc-body-${idx}">
          <span class="acc-icon">${rule.icon}</span>
          ${rule.section}
          <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="accordion-body" id="acc-body-${idx}" ${idx !== 0 ? '' : ''}>
          <ul>${items}</ul>
        </div>
      </div>`;
  });

  container.innerHTML = html;

  // Accordion toggle
  container.addEventListener('click', e => {
    const header = e.target.closest('.accordion-header');
    if (!header) return;
    const item = header.closest('.accordion-item');
    const isOpen = item.classList.contains('open');

    // Close all
    container.querySelectorAll('.accordion-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
    });

    // Open clicked if it was closed
    if (!isOpen) {
      item.classList.add('open');
      header.setAttribute('aria-expanded', 'true');
    }
  });
}

// ──────────────────────────────────────────────
// NEWS
// ──────────────────────────────────────────────

function renderNews() {
  const container = document.getElementById('news-feed');
  if (!container) return;

  let html = '';
  NEWS.forEach(item => {
    const d = new Date(item.date + 'T00:00:00');
    const day = d.getDate();
    const month = d.toLocaleDateString('en-ZA', { month: 'short' });

    const badgeStyle = `background:${item.categoryColor}22;color:${item.categoryColor};border:1px solid ${item.categoryColor}44`;

    html += `
      <div class="news-card" style="--news-color:${item.categoryColor}">
        <div class="news-date-col">
          <span class="news-day">${day}</span>
          <span class="news-month">${month}</span>
        </div>
        <div class="news-content">
          <span class="news-category-badge" style="${badgeStyle}">${item.category}</span>
          <h3 class="news-title">${item.title}</h3>
          <p class="news-body">${item.body}</p>
        </div>
      </div>`;
  });

  container.innerHTML = html;
}

// ──────────────────────────────────────────────
// SIGN UP FORM
// ──────────────────────────────────────────────

function validateSignupForm() {
  let valid = true;

  const fields = [
    { id: 'team-name',     errId: 'err-team-name',     msg: 'Team name is required.' },
    { id: 'captain-name',  errId: 'err-captain-name',  msg: 'Captain name is required.' },
    { id: 'phone',         errId: 'err-phone',         msg: 'WhatsApp number is required.' },
    { id: 'email',         errId: 'err-email',         msg: 'Valid email is required.' },
    { id: 'jersey-colors', errId: 'err-jersey-colors', msg: 'Jersey colors are required.' },
    { id: 'squad-size',    errId: 'err-squad-size',    msg: 'Please select squad size.' },
  ];

  fields.forEach(f => {
    const el = document.getElementById(f.id);
    const err = document.getElementById(f.errId);
    const val = el ? el.value.trim() : '';
    if (!val) {
      if (err) err.textContent = f.msg;
      if (el) el.classList.add('error');
      valid = false;
    } else {
      if (err) err.textContent = '';
      if (el) el.classList.remove('error');
    }
  });

  // Email format
  const emailEl = document.getElementById('email');
  const emailErr = document.getElementById('err-email');
  if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    if (emailErr) emailErr.textContent = 'Please enter a valid email address.';
    emailEl.classList.add('error');
    valid = false;
  }

  // Checkbox
  const cb = document.getElementById('agree-rules');
  const cbErr = document.getElementById('err-agree-rules');
  if (cb && !cb.checked) {
    if (cbErr) cbErr.textContent = 'You must agree to the tournament rules.';
    valid = false;
  } else if (cbErr) {
    cbErr.textContent = '';
  }

  return valid;
}

function initSignupForm() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateSignupForm()) return;

    const btn = document.getElementById('submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

    // Collect data
    const data = {
      teamName:     document.getElementById('team-name')?.value.trim(),
      captainName:  document.getElementById('captain-name')?.value.trim(),
      phone:        document.getElementById('phone')?.value.trim(),
      email:        document.getElementById('email')?.value.trim(),
      jerseyColors: document.getElementById('jersey-colors')?.value.trim(),
      squadSize:    document.getElementById('squad-size')?.value,
      notes:        document.getElementById('extra-notes')?.value.trim(),
      submittedAt:  new Date().toISOString(),
    };

    // Try Formspree (replace YOUR_FORM_ID with actual ID)
    // const FORMSPREE_ID = 'YOUR_FORM_ID';
    // try {
    //   await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    //     body: JSON.stringify(data)
    //   });
    // } catch(err) { console.warn('Formspree error:', err); }

    // Simulate a short delay
    await new Promise(r => setTimeout(r, 900));

    // Show success
    document.getElementById('signup-form-card').style.display = 'none';
    const success = document.getElementById('signup-success');
    if (success) success.hidden = false;

    console.log('Registration data:', data);
  });

  // Clear errors on input
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('error'));
  });
}

function resetSignupForm() {
  const form = document.getElementById('signup-form');
  if (form) form.reset();

  const card = document.getElementById('signup-form-card');
  const success = document.getElementById('signup-success');
  const btn = document.getElementById('submit-btn');

  if (card) card.style.display = '';
  if (success) success.hidden = true;
  if (btn) { btn.disabled = false; btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Submit Registration'; }

  document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
}

// ──────────────────────────────────────────────
// THEME TOGGLE
// ──────────────────────────────────────────────

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const saved = localStorage.getItem('rttf-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('rttf-theme', next);
  });
}

// ──────────────────────────────────────────────
// MOBILE MENU
// ──────────────────────────────────────────────

function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const tabs = document.getElementById('main-tabs');
  if (!btn || !tabs) return;

  btn.addEventListener('click', () => {
    const isOpen = tabs.classList.toggle('mobile-open');
    btn.setAttribute('aria-expanded', isOpen);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !tabs.contains(e.target)) {
      tabs.classList.remove('mobile-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ──────────────────────────────────────────────
// TAB NAV EVENTS
// ──────────────────────────────────────────────

function initTabNav() {
  const tabsEl = document.getElementById('main-tabs');
  if (!tabsEl) return;
  tabsEl.addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    switchTab(btn.dataset.tab);
  });
}

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initTabNav();
  initFixturesFilter();
  initStatsFilter();
  initSignupForm();

  // Render all panels
  renderFixtures('all');
  renderStandings();
  renderStats('scorers');
  renderTeams();
  renderRules();
  renderNews();
});
