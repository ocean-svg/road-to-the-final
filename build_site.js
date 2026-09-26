
const fs = require('fs');

// ─────────────────────────────────────────────
// INDEX.HTML
// ─────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Road to the Final 2026 - Summer Edition Tournament</title>
  <meta name="description" content="Road to the Final 2026 Summer Edition - Follow live fixtures, standings, top scorers, rules and tournament news. Register your team today.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Barlow+Condensed:wght@500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <header class="site-header" id="site-header">
    <div class="header-inner">
      <a class="brand" href="#" id="logo-home" aria-label="Road to the Final Home">
        <div class="brand-icon">
          <svg viewBox="0 0 36 36" fill="none" width="36" height="36">
            <circle cx="18" cy="18" r="17" stroke="url(#bgrad)" stroke-width="2"/>
            <path d="M18 6 L22 15 L32 15 L24 21 L27 30 L18 24 L9 30 L12 21 L4 15 L14 15 Z" fill="url(#bgrad)" opacity="0.9"/>
            <defs>
              <linearGradient id="bgrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#f7b731"/>
                <stop offset="100%" stop-color="#fc5c7d"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-main">ROAD TO</span>
          <span class="brand-sub">THE FINAL</span>
        </div>
        <div class="brand-year">2026</div>
      </a>

      <nav class="main-tabs" id="main-tabs" role="tablist">
        <button class="tab-btn active" data-tab="fixtures" id="tab-fixtures" role="tab" aria-selected="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Fixtures
        </button>
        <button class="tab-btn" data-tab="standings" id="tab-standings" role="tab" aria-selected="false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
          Standings
        </button>
        <button class="tab-btn" data-tab="stats" id="tab-stats" role="tab" aria-selected="false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Stats
        </button>
        <button class="tab-btn" data-tab="teams" id="tab-teams" role="tab" aria-selected="false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Teams
        </button>
        <button class="tab-btn" data-tab="rules" id="tab-rules" role="tab" aria-selected="false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Rules
        </button>
        <button class="tab-btn signup-tab" data-tab="signup" id="tab-signup" role="tab" aria-selected="false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          Sign Up
        </button>
        <button class="tab-btn" data-tab="news" id="tab-news" role="tab" aria-selected="false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
          News
        </button>
      </nav>

      <div class="header-actions">
        <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark/light mode">
          <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
        </button>
        <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>

  <div class="hero-banner" id="hero-banner">
    <div class="hero-bg">
      <div class="hero-pitch-lines"></div>
      <div class="hero-glow hero-glow-1"></div>
      <div class="hero-glow hero-glow-2"></div>
    </div>
    <div class="hero-content">
      <div class="hero-season-badge">&#9917; Summer Edition 2026</div>
      <h1 class="hero-title">
        <span class="hero-title-road">ROAD</span>
        <span class="hero-title-to">TO THE</span>
        <span class="hero-title-final">FINAL</span>
      </h1>
      <p class="hero-subtitle">8 Teams &middot; 3 Groups &middot; 1 Champion</p>
      <div class="hero-cta-group">
        <button class="btn-primary" onclick="switchTab('fixtures')">View Fixtures</button>
        <button class="btn-secondary" onclick="switchTab('signup')">Register Team</button>
      </div>
    </div>
    <div class="hero-stats-bar">
      <div class="hero-stat"><span class="hero-stat-val">17</span><span class="hero-stat-label">Total Matches</span></div>
      <div class="hero-stat-divider"></div>
      <div class="hero-stat"><span class="hero-stat-val">8</span><span class="hero-stat-label">Teams</span></div>
      <div class="hero-stat-divider"></div>
      <div class="hero-stat"><span class="hero-stat-val">50</span><span class="hero-stat-label">Goals Scored</span></div>
      <div class="hero-stat-divider"></div>
      <div class="hero-stat"><span class="hero-stat-val">Oct 3</span><span class="hero-stat-label">Kick-off Date</span></div>
    </div>
  </div>

  <main class="main-content" id="main-content">

    <section class="tab-panel active" id="panel-fixtures" role="tabpanel" aria-labelledby="tab-fixtures">
      <div class="panel-inner">
        <div class="panel-header">
          <h2 class="panel-title">Fixtures &amp; Results</h2>
          <div class="filter-pills" id="fixtures-filter" role="group" aria-label="Filter fixtures by round">
            <button class="filter-pill active" data-filter="all">All</button>
            <button class="filter-pill" data-filter="Group Stage">Group Stage</button>
            <button class="filter-pill" data-filter="Quarter Finals">Quarter Finals</button>
            <button class="filter-pill" data-filter="Semi Finals">Semi Finals</button>
            <button class="filter-pill" data-filter="Final">Final</button>
          </div>
        </div>
        <div class="fixtures-list" id="fixtures-list"></div>
      </div>
    </section>

    <section class="tab-panel" id="panel-standings" role="tabpanel" aria-labelledby="tab-standings">
      <div class="panel-inner">
        <div class="panel-header"><h2 class="panel-title">Standings</h2></div>
        <div class="standings-container" id="standings-container"></div>
        <div class="bracket-section">
          <h3 class="section-sub-title">Knockout Bracket</h3>
          <div class="bracket-grid" id="bracket-grid">
            <div class="bracket-round">
              <div class="bracket-round-label">Quarter Finals<br><small>Oct 24</small></div>
              <div class="bracket-match">
                <div class="bracket-team"><span class="bracket-crest" style="background:#e63946"></span><span>FC Predators</span></div>
                <div class="bracket-vs">vs</div>
                <div class="bracket-team"><span class="bracket-crest" style="background:#ff6b35"></span><span>Phoenix Rising</span></div>
              </div>
              <div class="bracket-match">
                <div class="bracket-team"><span class="bracket-crest" style="background:#06d6a0"></span><span>Dynamo Stars</span></div>
                <div class="bracket-vs">vs</div>
                <div class="bracket-team"><span class="bracket-crest" style="background:#457b9d"></span><span>Thunder United</span></div>
              </div>
            </div>
            <div class="bracket-round">
              <div class="bracket-round-label">Semi Finals<br><small>Oct 31</small></div>
              <div class="bracket-match tbd">
                <div class="bracket-team tbd-team"><span class="bracket-crest tbd-crest"></span><span>TBD</span></div>
                <div class="bracket-vs">vs</div>
                <div class="bracket-team tbd-team"><span class="bracket-crest tbd-crest"></span><span>TBD</span></div>
              </div>
              <div class="bracket-match tbd">
                <div class="bracket-team tbd-team"><span class="bracket-crest tbd-crest"></span><span>TBD</span></div>
                <div class="bracket-vs">vs</div>
                <div class="bracket-team tbd-team"><span class="bracket-crest tbd-crest"></span><span>TBD</span></div>
              </div>
            </div>
            <div class="bracket-round bracket-final-round">
              <div class="bracket-round-label">Final<br><small>Nov 7</small></div>
              <div class="bracket-match tbd bracket-final-match">
                <div class="bracket-team tbd-team"><span class="bracket-crest tbd-crest"></span><span>TBD</span></div>
                <div class="bracket-vs">vs</div>
                <div class="bracket-team tbd-team"><span class="bracket-crest tbd-crest"></span><span>TBD</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="tab-panel" id="panel-stats" role="tabpanel" aria-labelledby="tab-stats">
      <div class="panel-inner">
        <div class="panel-header">
          <h2 class="panel-title">Stats &amp; Leaders</h2>
          <div class="filter-pills" id="stats-filter" role="group" aria-label="Switch stats table">
            <button class="filter-pill active" data-stat="scorers">&#127945; Golden Boot</button>
            <button class="filter-pill" data-stat="assists">&#127919; Assist Kings</button>
          </div>
        </div>
        <div class="stats-table-wrap" id="stats-table-wrap"></div>
      </div>
    </section>

    <section class="tab-panel" id="panel-teams" role="tabpanel" aria-labelledby="tab-teams">
      <div class="panel-inner">
        <div class="panel-header"><h2 class="panel-title">Teams</h2></div>
        <div class="teams-grid" id="teams-grid"></div>
      </div>
    </section>

    <section class="tab-panel" id="panel-rules" role="tabpanel" aria-labelledby="tab-rules">
      <div class="panel-inner">
        <div class="panel-header"><h2 class="panel-title">Rules &amp; Info</h2></div>
        <div class="venue-card">
          <div class="venue-map-placeholder">
            <div class="map-pin-anim">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="venue-pitch-grid"></div>
          </div>
          <div class="venue-info">
            <div class="venue-badge">&#128205; Venue</div>
            <h3 class="venue-name">City Sports Complex</h3>
            <p class="venue-address">123 Stadium Drive, Cape Town, 8001</p>
            <div class="venue-details">
              <div class="venue-detail-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                3 Pitches available (A, B &amp; C)
              </div>
              <div class="venue-detail-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Matches: Saturdays from 09:00
              </div>
              <div class="venue-detail-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                Free parking on-site
              </div>
            </div>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" class="btn-venue-map">Get Directions &#8599;</a>
          </div>
        </div>
        <div class="rules-accordion" id="rules-accordion"></div>
      </div>
    </section>

    <section class="tab-panel" id="panel-signup" role="tabpanel" aria-labelledby="tab-signup">
      <div class="panel-inner panel-inner-narrow">
        <div class="panel-header"><h2 class="panel-title">Team Registration</h2></div>
        <div class="payment-notice-banner">
          <div class="notice-icon">&#128172;</div>
          <div class="notice-text">
            <strong>No online payment required.</strong>
            Registration fee details and payment instructions will be communicated directly via <strong>WhatsApp</strong> or <strong>Email</strong> after form submission.
            <br><small>Registration Fee: R350 per team</small>
          </div>
        </div>
        <div class="signup-card" id="signup-form-card">
          <form class="signup-form" id="signup-form" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label for="team-name">Team Name <span class="req">*</span></label>
                <input type="text" id="team-name" name="teamName" placeholder="e.g. FC Predators" required maxlength="50">
                <span class="field-error" id="err-team-name"></span>
              </div>
              <div class="form-group">
                <label for="captain-name">Captain Name <span class="req">*</span></label>
                <input type="text" id="captain-name" name="captainName" placeholder="Full name" required maxlength="60">
                <span class="field-error" id="err-captain-name"></span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="phone">WhatsApp Number <span class="req">*</span></label>
                <input type="tel" id="phone" name="phone" placeholder="+27 81 234 5678" required>
                <span class="field-error" id="err-phone"></span>
              </div>
              <div class="form-group">
                <label for="email">Email Address <span class="req">*</span></label>
                <input type="email" id="email" name="email" placeholder="captain@email.com" required>
                <span class="field-error" id="err-email"></span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="jersey-colors">Preferred Jersey Colors <span class="req">*</span></label>
                <input type="text" id="jersey-colors" name="jerseyColors" placeholder="e.g. Red and White" required maxlength="80">
                <span class="field-error" id="err-jersey-colors"></span>
              </div>
              <div class="form-group">
                <label for="squad-size">Squad Size <span class="req">*</span></label>
                <select id="squad-size" name="squadSize" required>
                  <option value="">Select squad size</option>
                  <option value="6">6 players</option>
                  <option value="7">7 players</option>
                  <option value="8">8 players</option>
                  <option value="9">9 players</option>
                  <option value="10">10 players</option>
                  <option value="11">11 players</option>
                  <option value="12">12 players (max)</option>
                </select>
                <span class="field-error" id="err-squad-size"></span>
              </div>
            </div>
            <div class="form-group">
              <label for="extra-notes">Additional Notes <span class="optional">(optional)</span></label>
              <textarea id="extra-notes" name="notes" rows="3" placeholder="Any special requests, kit conflicts, or questions..."></textarea>
            </div>
            <div class="form-checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="agree-rules" name="agreeRules" required>
                <span class="checkbox-custom"></span>
                I confirm all players are available and I have read and agree to the
                <button type="button" class="link-btn" onclick="switchTab('rules')">tournament rules</button>. <span class="req">*</span>
              </label>
              <span class="field-error" id="err-agree-rules"></span>
            </div>
            <button type="submit" class="btn-submit" id="submit-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Submit Registration
            </button>
          </form>
        </div>
        <div class="signup-success" id="signup-success" hidden>
          <div class="success-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3 class="success-title">Team Submitted Successfully!</h3>
          <p class="success-msg">We will reach out on <strong>WhatsApp</strong> within 24 hours to confirm your spot and share payment details.</p>
          <div class="success-contact">
            <a href="https://wa.me/27812345678" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              Chat on WhatsApp
            </a>
            <button class="btn-secondary-sm" onclick="resetSignupForm()">Register Another Team</button>
          </div>
        </div>
      </div>
    </section>

    <section class="tab-panel" id="panel-news" role="tabpanel" aria-labelledby="tab-news">
      <div class="panel-inner">
        <div class="panel-header"><h2 class="panel-title">News &amp; Announcements</h2></div>
        <div class="news-feed" id="news-feed"></div>
      </div>
    </section>

  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <svg viewBox="0 0 36 36" fill="none" width="28" height="28">
          <circle cx="18" cy="18" r="17" stroke="url(#fg2)" stroke-width="2"/>
          <path d="M18 6 L22 15 L32 15 L24 21 L27 30 L18 24 L9 30 L12 21 L4 15 L14 15 Z" fill="url(#fg2)"/>
          <defs><linearGradient id="fg2" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#f7b731"/><stop offset="100%" stop-color="#fc5c7d"/></linearGradient></defs>
        </svg>
        <div>
          <strong>Road to the Final 2026</strong>
          <small>Summer Edition &middot; Cape Town</small>
        </div>
      </div>
      <div class="footer-links">
        <button class="footer-link" onclick="switchTab('fixtures')">Fixtures</button>
        <button class="footer-link" onclick="switchTab('standings')">Standings</button>
        <button class="footer-link" onclick="switchTab('rules')">Rules</button>
        <button class="footer-link" onclick="switchTab('signup')">Register</button>
      </div>
      <div class="footer-contact">
        <a href="https://wa.me/27812345678" target="_blank" rel="noopener noreferrer" class="footer-wa">&#128172; +27 81 234 5678</a>
        <a href="mailto:rttf2026@gmail.com" class="footer-email">rttf2026@gmail.com</a>
      </div>
      <div class="footer-copy">&copy; 2026 Road to the Final. All rights reserved.</div>
    </div>
  </footer>

  <div class="toast" id="toast" role="alert" aria-live="polite"></div>
  <script src="js/data.js"></script>
  <script src="js/script.js"></script>
</body>
</html>`;

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ index.html', fs.statSync('index.html').size, 'bytes');

// ─────────────────────────────────────────────
// CSS/STYLE.CSS
// ─────────────────────────────────────────────
const css = `/* =============================================
   ROAD TO THE FINAL 2026 — FotMob Style Theme
   ============================================= */

/* ---- DESIGN TOKENS ---- */
:root {
  --bg-primary: #0f1117;
  --bg-secondary: #181c24;
  --bg-card: #1e2330;
  --bg-card-hover: #252b3a;
  --bg-input: #252b3a;
  --border: #2a3042;
  --border-subtle: #1e2330;
  --text-primary: #f0f2f8;
  --text-secondary: #8892a4;
  --text-muted: #555f72;
  --accent: #f7b731;
  --accent-2: #fc5c7d;
  --accent-green: #06d6a0;
  --accent-blue: #4cc9f0;
  --win: #06d6a0;
  --draw: #8892a4;
  --loss: #ef4444;
  --header-h: 60px;
  --radius: 10px;
  --radius-sm: 6px;
  --shadow: 0 4px 24px rgba(0,0,0,0.35);
  --trans: all 0.22s cubic-bezier(0.4,0,0.2,1);
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Barlow Condensed', 'Inter', sans-serif;
}

[data-theme="light"] {
  --bg-primary: #f2f4f8;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --bg-card-hover: #f7f9fc;
  --bg-input: #f2f4f8;
  --border: #dde1eb;
  --border-subtle: #eaecf2;
  --text-primary: #0d1117;
  --text-secondary: #4a5568;
  --text-muted: #9aa5b4;
  --shadow: 0 2px 12px rgba(0,0,0,0.08);
}

/* ---- RESET & BASE ---- */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-body);
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
  min-height: 100vh;
  transition: background 0.3s, color 0.3s;
}
a { color: inherit; text-decoration: none; }
button { cursor: pointer; border: none; background: none; font-family: inherit; }
img { display: block; max-width: 100%; }
ul { list-style: none; }

/* ---- SCROLLBAR ---- */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-primary); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

/* =============================================
   HEADER
   ============================================= */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
  margin-right: 8px;
}
.brand-icon { display: flex; align-items: center; }
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.brand-main {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}
.brand-sub {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, #f7b731, #fc5c7d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.brand-year {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  border: 1px solid var(--border);
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

/* Nav Tabs */
.main-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}
.main-tabs::-webkit-scrollbar { display: none; }

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  transition: var(--trans);
  height: 36px;
  position: relative;
}
.tab-btn:hover { color: var(--text-primary); background: var(--bg-card); }
.tab-btn.active {
  color: var(--text-primary);
  background: var(--bg-card);
  font-weight: 600;
}
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -13px;
  left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  border-radius: 2px 2px 0 0;
}
.tab-btn.signup-tab { color: var(--accent-2); }
.tab-btn.signup-tab:hover, .tab-btn.signup-tab.active { background: rgba(252,92,125,0.12); color: var(--accent-2); }

/* Header Actions */
.header-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-shrink: 0; }

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px; height: 36px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border);
  transition: var(--trans);
}
.theme-toggle:hover { color: var(--accent); border-color: var(--accent); }
.icon-sun { display: none; }
[data-theme="light"] .icon-moon { display: none; }
[data-theme="light"] .icon-sun { display: block; }

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px; height: 36px;
  padding: 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border);
}
.mobile-menu-btn span {
  display: block;
  width: 100%;
  height: 2px;
  background: var(--text-secondary);
  border-radius: 2px;
  transition: var(--trans);
}

/* =============================================
   HERO BANNER
   ============================================= */
.hero-banner {
  position: relative;
  min-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 60px 20px 0;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0a0e1a 0%, #0d1524 40%, #111827 100%);
}

[data-theme="light"] .hero-bg {
  background: linear-gradient(135deg, #1a1f2e 0%, #1e2740 50%, #0f172a 100%);
}

.hero-pitch-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(247,183,49,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(247,183,49,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.hero-glow-1 {
  width: 500px; height: 300px;
  background: rgba(247,183,49,0.12);
  top: -80px; left: -100px;
  animation: glow-pulse 6s ease-in-out infinite alternate;
}
.hero-glow-2 {
  width: 400px; height: 300px;
  background: rgba(252,92,125,0.1);
  bottom: 40px; right: -80px;
  animation: glow-pulse 8s ease-in-out infinite alternate-reverse;
}

@keyframes glow-pulse {
  from { opacity: 0.6; transform: scale(1); }
  to   { opacity: 1;   transform: scale(1.1); }
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 20px 0 40px;
}

.hero-season-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(247,183,49,0.15);
  border: 1px solid rgba(247,183,49,0.3);
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 20px;
  text-transform: uppercase;
}

.hero-title {
  font-family: var(--font-display);
  font-weight: 800;
  line-height: 0.92;
  letter-spacing: -0.01em;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}
.hero-title-road {
  font-size: clamp(64px, 12vw, 110px);
  color: var(--text-primary);
  text-shadow: 0 4px 32px rgba(247,183,49,0.3);
}
.hero-title-to {
  font-size: clamp(22px, 5vw, 42px);
  color: var(--text-secondary);
  letter-spacing: 0.2em;
  font-weight: 500;
}
.hero-title-final {
  font-size: clamp(72px, 14vw, 130px);
  background: linear-gradient(135deg, #f7b731 0%, #fc5c7d 60%, #c44aff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

.hero-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
  margin-bottom: 28px;
}

.hero-cta-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  padding: 11px 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f7b731, #fc5c7d);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
  transition: var(--trans);
  box-shadow: 0 4px 20px rgba(247,183,49,0.3);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(247,183,49,0.4); }

.btn-secondary {
  padding: 11px 28px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  transition: var(--trans);
}
.btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.35); }

/* Hero Stats Bar */
.hero-stats-bar {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius) var(--radius) 0 0;
  padding: 16px 32px;
  gap: 0;
}
.hero-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.hero-stat-val {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}
.hero-stat-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.hero-stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255,255,255,0.12);
  margin: 0 16px;
}

/* =============================================
   MAIN CONTENT / TABS
   ============================================= */
.main-content { max-width: 1400px; margin: 0 auto; padding: 0 16px; }

.tab-panel { display: none; }
.tab-panel.active { display: block; animation: fade-in 0.25s ease; }

@keyframes fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.panel-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 0;
}
.panel-inner-narrow { max-width: 720px; }

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.panel-title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: var(--text-primary);
}

/* Filter Pills */
.filter-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.filter-pill {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border);
  transition: var(--trans);
}
.filter-pill:hover { color: var(--text-primary); border-color: var(--text-muted); }
.filter-pill.active {
  background: linear-gradient(135deg, rgba(247,183,49,0.15), rgba(252,92,125,0.1));
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 600;
}

/* =============================================
   FIXTURES
   ============================================= */
.fixtures-list { display: flex; flex-direction: column; gap: 0; }

.fixture-day-group { margin-bottom: 16px; }

.fixture-day-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.fixture-day-header::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.match-card {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  margin-bottom: 2px;
  transition: var(--trans);
  cursor: default;
  position: relative;
  overflow: hidden;
}
.match-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--border);
  transition: var(--trans);
}
.match-card[data-status="FT"]::before { background: var(--text-muted); }
.match-card[data-status="Scheduled"]::before { background: var(--accent); }
.match-card[data-status="LIVE"]::before { background: var(--accent-green); }
.match-card:hover { background: var(--bg-card-hover); transform: translateX(2px); }

.match-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 80px;
  flex-shrink: 0;
}
.match-time {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}
.match-pitch {
  font-size: 10.5px;
  color: var(--text-muted);
}

.match-teams {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 12px;
}

.match-team-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.team-crest-small {
  width: 22px; height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
}
.team-name-match {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.match-score-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 64px;
}
.score-value {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}
.score-dash {
  font-size: 13px;
  color: var(--text-muted);
}

.match-status-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}
.badge-ft { background: rgba(136,146,164,0.15); color: var(--text-secondary); }
.badge-scheduled { background: rgba(247,183,49,0.15); color: var(--accent); }
.badge-live { background: rgba(6,214,160,0.2); color: var(--accent-green); animation: pulse-live 1.5s infinite; }
.badge-tbd { background: rgba(136,146,164,0.1); color: var(--text-muted); }
@keyframes pulse-live { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }

.round-pill {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

/* =============================================
   STANDINGS TABLE
   ============================================= */
.standings-group { margin-bottom: 28px; }

.standings-group-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.standings-group-title span {
  width: 28px; height: 28px;
  background: linear-gradient(135deg, rgba(247,183,49,0.2), rgba(252,92,125,0.15));
  border: 1px solid rgba(247,183,49,0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.standings-table { width: 100%; border-collapse: collapse; }
.standings-table thead tr th {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
  text-align: center;
  padding: 8px 6px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}
.standings-table thead tr th:first-child { text-align: left; padding-left: 12px; }
.standings-table thead tr th:nth-child(2) { text-align: left; }

.standings-table tbody tr {
  border-bottom: 1px solid var(--border-subtle);
  transition: var(--trans);
}
.standings-table tbody tr:hover { background: var(--bg-card-hover); }
.standings-table tbody tr.qualify-zone td:first-child {
  border-left: 3px solid var(--accent-green);
}

.standings-table td {
  padding: 10px 6px;
  text-align: center;
  font-size: 13px;
  color: var(--text-primary);
}
.standings-table td:first-child { text-align: center; padding-left: 12px; width: 40px; }
.standings-table td:nth-child(2) { text-align: left; }

.td-pos {
  font-weight: 700;
  color: var(--text-secondary);
  font-size: 13px;
}
.td-team-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.td-crest {
  width: 26px; height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 900;
  color: #fff;
  flex-shrink: 0;
}
.td-team-name { font-weight: 600; font-size: 13px; }
.td-pts {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 16px;
  color: var(--text-primary);
}

/* Form dots */
.form-dots { display: flex; gap: 3px; justify-content: center; }
.form-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
}
.form-dot-W { background: var(--win); }
.form-dot-D { background: var(--draw); }
.form-dot-L { background: var(--loss); }

/* Bracket */
.bracket-section { margin-top: 36px; }
.section-sub-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.bracket-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  overflow-x: auto;
}
.bracket-round {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.bracket-round-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 4px;
}
.bracket-round-label small { font-weight: 400; font-size: 11px; display: block; }
.bracket-final-round .bracket-round-label { color: var(--accent); }

.bracket-match {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}
.bracket-match.tbd { opacity: 0.5; }
.bracket-final-match { border-color: rgba(247,183,49,0.35); }

.bracket-team {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12.5px;
  font-weight: 600;
}
.bracket-crest {
  width: 18px; height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tbd-crest { background: var(--border); }
.tbd-team { color: var(--text-muted); }
.bracket-vs {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  text-align: center;
  padding: 2px 0;
  letter-spacing: 0.05em;
}

/* =============================================
   STATS TABLE
   ============================================= */
.stats-table { width: 100%; border-collapse: collapse; }
.stats-table thead tr th {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-align: center;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}
.stats-table thead tr th:nth-child(2) { text-align: left; }
.stats-table tbody tr {
  border-bottom: 1px solid var(--border-subtle);
  transition: var(--trans);
}
.stats-table tbody tr:hover { background: var(--bg-card-hover); }
.stats-table td {
  padding: 11px 12px;
  text-align: center;
  font-size: 13px;
  color: var(--text-primary);
}
.stats-table td:nth-child(2) { text-align: left; }

.stats-rank {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  color: var(--text-muted);
}
.rank-1 { color: #f7b731; }
.rank-2 { color: #c0c0c0; }
.rank-3 { color: #cd7f32; }

.stats-player-cell { display: flex; align-items: center; gap: 10px; }
.stats-crest {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 900;
  color: #fff;
  flex-shrink: 0;
}
.stats-player-name { font-weight: 600; font-size: 13.5px; }
.stats-team-name { font-size: 11px; color: var(--text-secondary); }

.stats-goals-bar { display: flex; align-items: center; gap: 8px; }
.goals-count {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  min-width: 24px;
}
.goals-bar-wrap {
  flex: 1;
  background: var(--border);
  border-radius: 3px;
  height: 5px;
  overflow: hidden;
}
.goals-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f7b731, #fc5c7d);
  border-radius: 3px;
  transition: width 0.6s ease;
}

/* =============================================
   TEAMS GRID
   ============================================= */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.team-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: var(--trans);
  text-align: center;
  position: relative;
  overflow: hidden;
}
.team-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--tc), transparent);
  opacity: 0;
  transition: var(--trans);
}
.team-card:hover { background: var(--bg-card-hover); transform: translateY(-3px); box-shadow: var(--shadow); }
.team-card:hover::before { opacity: 1; }

.team-crest-large {
  width: 64px; height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 900;
  color: #fff;
  position: relative;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
.team-crest-large::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0.2;
}

.team-card-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}
.team-card-group {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 3px 10px;
  border-radius: 10px;
}
.team-card-stats {
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: center;
}
.team-stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.team-stat-num { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text-primary); }
.team-stat-lbl { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

/* =============================================
   RULES
   ============================================= */
.venue-card {
  display: flex;
  gap: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 24px;
}

.venue-map-placeholder {
  width: 260px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #0d1a2e, #0f2040);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.venue-pitch-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(6,214,160,0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6,214,160,0.08) 1px, transparent 1px);
  background-size: 30px 30px;
}
.map-pin-anim {
  position: relative;
  z-index: 2;
  color: var(--accent);
  animation: pin-bounce 2s ease-in-out infinite;
}
@keyframes pin-bounce {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.venue-info {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.venue-badge {
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  background: rgba(247,183,49,0.1);
  border: 1px solid rgba(247,183,49,0.2);
  padding: 3px 10px;
  border-radius: 10px;
  align-self: flex-start;
}
.venue-name { font-size: 20px; font-weight: 700; color: var(--text-primary); }
.venue-address { font-size: 13px; color: var(--text-secondary); }

.venue-details { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
.venue-detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}
.venue-detail-item svg { color: var(--text-muted); flex-shrink: 0; }

.btn-venue-map {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, rgba(247,183,49,0.15), rgba(252,92,125,0.1));
  border: 1px solid rgba(247,183,49,0.3);
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
  transition: var(--trans);
  align-self: flex-start;
  margin-top: 4px;
}
.btn-venue-map:hover { background: rgba(247,183,49,0.25); }

/* Accordion */
.rules-accordion { display: flex; flex-direction: column; gap: 6px; }

.accordion-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: var(--trans);
}
.accordion-item.open { border-color: rgba(247,183,49,0.3); }

.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  text-align: left;
  background: none;
  font-family: var(--font-body);
  font-size: 14.5px;
  font-weight: 600;
  color: var(--text-primary);
  transition: var(--trans);
}
.accordion-header:hover { background: var(--bg-card-hover); }
.accordion-header .acc-icon { font-size: 18px; }
.accordion-header .acc-chevron {
  margin-left: auto;
  transition: transform 0.25s ease;
  color: var(--text-muted);
}
.accordion-item.open .acc-chevron { transform: rotate(180deg); }

.accordion-body {
  display: none;
  padding: 0 18px 16px 50px;
}
.accordion-item.open .accordion-body { display: block; }
.accordion-body ul { display: flex; flex-direction: column; gap: 8px; }
.accordion-body li {
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.55;
  position: relative;
  padding-left: 14px;
}
.accordion-body li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--accent);
}

/* =============================================
   SIGN UP
   ============================================= */
.payment-notice-banner {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: linear-gradient(135deg, rgba(6,214,160,0.08), rgba(76,201,240,0.05));
  border: 1px solid rgba(6,214,160,0.25);
  border-radius: var(--radius);
  padding: 16px 20px;
  margin-bottom: 20px;
}
.notice-icon { font-size: 24px; flex-shrink: 0; }
.notice-text { font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; }
.notice-text strong { color: var(--text-primary); }
.notice-text small { font-size: 12px; color: var(--text-muted); }

.signup-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px;
}
.signup-form { display: flex; flex-direction: column; gap: 16px; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-group { display: flex; flex-direction: column; gap: 6px; }

label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
}
.req { color: var(--accent-2); }
.optional { color: var(--text-muted); font-weight: 400; }

input, select, textarea {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  width: 100%;
  transition: var(--trans);
  -webkit-appearance: none;
}
input::placeholder, textarea::placeholder { color: var(--text-muted); }
input:focus, select:focus, textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(247,183,49,0.12);
}
input.error, select.error { border-color: var(--loss); }
textarea { resize: vertical; min-height: 80px; }

.field-error {
  font-size: 11.5px;
  color: var(--loss);
  min-height: 16px;
}

.form-checkbox-group { margin-top: 4px; }
.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  line-height: 1.5;
}
.checkbox-label input[type="checkbox"] { display: none; }
.checkbox-custom {
  width: 18px; height: 18px;
  border: 2px solid var(--border);
  border-radius: 4px;
  flex-shrink: 0;
  margin-top: 1px;
  background: var(--bg-input);
  transition: var(--trans);
  position: relative;
}
.checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
  background: var(--accent);
  border-color: var(--accent);
}
.checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 4px; top: 1px;
  width: 5px; height: 9px;
  border: 2px solid #fff;
  border-top: none; border-left: none;
  transform: rotate(45deg);
}

.link-btn {
  color: var(--accent);
  font-size: inherit;
  font-family: inherit;
  text-decoration: underline;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #f7b731, #fc5c7d);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
  transition: var(--trans);
  box-shadow: 0 4px 20px rgba(247,183,49,0.25);
  margin-top: 8px;
}
.btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(247,183,49,0.35); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

/* Success */
.signup-success {
  text-align: center;
  padding: 48px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.success-icon { color: var(--accent-green); }
.success-title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
}
.success-msg { font-size: 14.5px; color: var(--text-secondary); max-width: 400px; line-height: 1.6; }
.success-contact { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }

.btn-whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: var(--radius-sm);
  background: #25D366;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  transition: var(--trans);
}
.btn-whatsapp:hover { background: #1da851; transform: translateY(-2px); }

.btn-secondary-sm {
  padding: 10px 22px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  background: var(--bg-card);
  transition: var(--trans);
}
.btn-secondary-sm:hover { color: var(--text-primary); border-color: var(--text-muted); }

/* =============================================
   NEWS
   ============================================= */
.news-feed { display: flex; flex-direction: column; gap: 10px; }

.news-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 24px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  transition: var(--trans);
  position: relative;
  overflow: hidden;
}
.news-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--news-color, var(--accent));
}
.news-card:hover { background: var(--bg-card-hover); transform: translateX(2px); }

.news-date-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  min-width: 48px;
  text-align: center;
}
.news-day {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}
.news-month {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.news-content { flex: 1; }
.news-category-badge {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  display: inline-block;
}
.news-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  line-height: 1.3;
}
.news-body {
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* =============================================
   FOOTER
   ============================================= */
.site-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  margin-top: 48px;
}
.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.footer-brand strong { display: block; font-size: 14px; font-weight: 700; color: var(--text-primary); }
.footer-brand small { display: block; font-size: 12px; color: var(--text-muted); }

.footer-links { display: flex; gap: 4px; flex-wrap: wrap; }
.footer-link {
  padding: 6px 12px;
  font-size: 13px;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: var(--trans);
}
.footer-link:hover { color: var(--text-primary); background: var(--bg-card); }

.footer-contact { display: flex; gap: 12px; flex-wrap: wrap; margin-left: auto; }
.footer-wa {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #25D366;
  font-weight: 600;
}
.footer-email { font-size: 13px; color: var(--text-secondary); }
.footer-email:hover { color: var(--accent); }

.footer-copy { width: 100%; text-align: center; font-size: 12px; color: var(--text-muted); }

/* =============================================
   TOAST
   ============================================= */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 20px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text-primary);
  box-shadow: var(--shadow);
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  z-index: 9999;
  pointer-events: none;
}
.toast.show { transform: translateY(0); opacity: 1; }

/* =============================================
   RESPONSIVE
   ============================================= */
@media (max-width: 900px) {
  .main-tabs { gap: 1px; }
  .tab-btn { padding: 6px 8px; font-size: 12.5px; gap: 4px; }
  .bracket-grid { grid-template-columns: 1fr; }
  .venue-card { flex-direction: column; }
  .venue-map-placeholder { width: 100%; min-height: 140px; }
  .panel-inner { padding: 20px 0; }
}

@media (max-width: 680px) {
  .brand-year { display: none; }
  .main-tabs { display: none; }
  .main-tabs.mobile-open {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: var(--header-h);
    left: 0; right: 0;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    padding: 12px;
    gap: 4px;
    z-index: 99;
    box-shadow: var(--shadow);
  }
  .main-tabs.mobile-open .tab-btn { width: 100%; height: 44px; border-radius: 8px; }
  .main-tabs.mobile-open .tab-btn.active::after { display: none; }
  .mobile-menu-btn { display: flex; }
  .hero-stats-bar { padding: 12px 16px; }
  .hero-stat-divider { margin: 0 8px; }
  .hero-stat-val { font-size: 22px; }
  .form-row { grid-template-columns: 1fr; }
  .match-card { padding: 10px 12px; }
  .teams-grid { grid-template-columns: repeat(2, 1fr); }
  .bracket-grid { grid-template-columns: 1fr; }
  .news-card { flex-direction: column; gap: 12px; }
  .news-date-col { flex-direction: row; align-items: center; }
}

@media (max-width: 380px) {
  .teams-grid { grid-template-columns: 1fr; }
}
`;

fs.writeFileSync('css/style.css', css, 'utf8');
console.log('✓ css/style.css', fs.statSync('css/style.css').size, 'bytes');

// ─────────────────────────────────────────────
// JS/DATA.JS
// ─────────────────────────────────────────────
const dataJs = `// =============================================
// TOURNAMENT DATA — Edit this file to update
// scores, standings, stats, rules, and news.
// =============================================

const TOURNAMENT = {
  name: "Road to the Final",
  edition: "2026",
  season: "Summer Edition",
  venue: "City Sports Complex",
  address: "123 Stadium Drive, Cape Town, 8001",
  registrationFee: "R350 per team",
  contactWhatsApp: "+27812345678",
  contactEmail: "rttf2026@gmail.com"
};

// All teams — update color and accentColor per team
const TEAMS = [
  { id: "t1", name: "FC Predators",   shortName: "PRD", color: "#e63946", accentColor: "#fff", group: "A" },
  { id: "t2", name: "Thunder United", shortName: "THU", color: "#457b9d", accentColor: "#fff", group: "A" },
  { id: "t3", name: "Rapid FC",       shortName: "RPD", color: "#f4a261", accentColor: "#1a1a1a", group: "A" },
  { id: "t4", name: "Black Eagles",   shortName: "BEG", color: "#2d2d2d", accentColor: "#ffd60a", group: "A" },
  { id: "t5", name: "Dynamo Stars",   shortName: "DYN", color: "#06d6a0", accentColor: "#1a1a1a", group: "B" },
  { id: "t6", name: "Phoenix Rising", shortName: "PHX", color: "#ff6b35", accentColor: "#fff", group: "B" },
  { id: "t7", name: "Steel City FC",  shortName: "SCF", color: "#6c757d", accentColor: "#fff", group: "B" },
  { id: "t8", name: "Golden Boys",    shortName: "GLD", color: "#ffc300", accentColor: "#1a1a1a", group: "B" },
];

const GROUPS = [
  {
    id: "A", name: "Group A",
    standings: [
      { teamId: "t1", pos: 1, p: 3, w: 2, d: 1, l: 0, gf: 8, ga: 3, gd: 5,  pts: 7, form: ["W","W","D"] },
      { teamId: "t2", pos: 2, p: 3, w: 2, d: 0, l: 1, gf: 6, ga: 5, gd: 1,  pts: 6, form: ["W","L","W"] },
      { teamId: "t3", pos: 3, p: 3, w: 1, d: 1, l: 1, gf: 4, ga: 5, gd: -1, pts: 4, form: ["D","W","L"] },
      { teamId: "t4", pos: 4, p: 3, w: 0, d: 0, l: 3, gf: 2, ga: 7, gd: -5, pts: 0, form: ["L","L","L"] },
    ]
  },
  {
    id: "B", name: "Group B",
    standings: [
      { teamId: "t5", pos: 1, p: 3, w: 3, d: 0, l: 0, gf: 9, ga: 2, gd: 7,  pts: 9, form: ["W","W","W"] },
      { teamId: "t6", pos: 2, p: 3, w: 1, d: 1, l: 1, gf: 5, ga: 4, gd: 1,  pts: 4, form: ["L","W","D"] },
      { teamId: "t7", pos: 3, p: 3, w: 1, d: 1, l: 1, gf: 3, ga: 5, gd: -2, pts: 4, form: ["W","D","L"] },
      { teamId: "t8", pos: 4, p: 3, w: 0, d: 0, l: 3, gf: 1, ga: 7, gd: -6, pts: 0, form: ["L","L","L"] },
    ]
  }
];

const MATCHES = [
  { id:"m1",  round:"Group Stage",   group:"A", date:"2026-10-03", time:"09:00", pitch:"Pitch A", homeTeam:"t1", awayTeam:"t2", homeScore:3,    awayScore:2,    status:"FT" },
  { id:"m2",  round:"Group Stage",   group:"A", date:"2026-10-03", time:"10:00", pitch:"Pitch B", homeTeam:"t3", awayTeam:"t4", homeScore:2,    awayScore:0,    status:"FT" },
  { id:"m3",  round:"Group Stage",   group:"B", date:"2026-10-03", time:"11:00", pitch:"Pitch A", homeTeam:"t5", awayTeam:"t6", homeScore:4,    awayScore:1,    status:"FT" },
  { id:"m4",  round:"Group Stage",   group:"B", date:"2026-10-03", time:"12:00", pitch:"Pitch B", homeTeam:"t7", awayTeam:"t8", homeScore:2,    awayScore:0,    status:"FT" },
  { id:"m5",  round:"Group Stage",   group:"A", date:"2026-10-10", time:"09:00", pitch:"Pitch A", homeTeam:"t1", awayTeam:"t3", homeScore:2,    awayScore:2,    status:"FT" },
  { id:"m6",  round:"Group Stage",   group:"A", date:"2026-10-10", time:"10:00", pitch:"Pitch B", homeTeam:"t2", awayTeam:"t4", homeScore:3,    awayScore:1,    status:"FT" },
  { id:"m7",  round:"Group Stage",   group:"B", date:"2026-10-10", time:"11:00", pitch:"Pitch A", homeTeam:"t5", awayTeam:"t7", homeScore:3,    awayScore:1,    status:"FT" },
  { id:"m8",  round:"Group Stage",   group:"B", date:"2026-10-10", time:"12:00", pitch:"Pitch C", homeTeam:"t6", awayTeam:"t8", homeScore:3,    awayScore:1,    status:"FT" },
  { id:"m9",  round:"Group Stage",   group:"A", date:"2026-10-17", time:"09:00", pitch:"Pitch A", homeTeam:"t1", awayTeam:"t4", homeScore:3,    awayScore:1,    status:"FT" },
  { id:"m10", round:"Group Stage",   group:"A", date:"2026-10-17", time:"10:00", pitch:"Pitch B", homeTeam:"t2", awayTeam:"t3", homeScore:1,    awayScore:0,    status:"FT" },
  { id:"m11", round:"Group Stage",   group:"B", date:"2026-10-17", time:"11:00", pitch:"Pitch A", homeTeam:"t5", awayTeam:"t8", homeScore:2,    awayScore:1,    status:"FT" },
  { id:"m12", round:"Group Stage",   group:"B", date:"2026-10-17", time:"12:00", pitch:"Pitch C", homeTeam:"t6", awayTeam:"t7", homeScore:1,    awayScore:0,    status:"FT" },
  { id:"m13", round:"Quarter Finals",group:null, date:"2026-10-24", time:"10:00", pitch:"Pitch A", homeTeam:"t1", awayTeam:"t6", homeScore:null, awayScore:null, status:"Scheduled" },
  { id:"m14", round:"Quarter Finals",group:null, date:"2026-10-24", time:"11:30", pitch:"Pitch B", homeTeam:"t5", awayTeam:"t2", homeScore:null, awayScore:null, status:"Scheduled" },
  { id:"m15", round:"Semi Finals",   group:null, date:"2026-10-31", time:"12:00", pitch:"Pitch A", homeTeam:"TBD", awayTeam:"TBD", homeScore:null, awayScore:null, status:"TBD" },
  { id:"m16", round:"Semi Finals",   group:null, date:"2026-10-31", time:"14:00", pitch:"Pitch A", homeTeam:"TBD", awayTeam:"TBD", homeScore:null, awayScore:null, status:"TBD" },
  { id:"m17", round:"Final",         group:null, date:"2026-11-07", time:"15:00", pitch:"Pitch A", homeTeam:"TBD", awayTeam:"TBD", homeScore:null, awayScore:null, status:"TBD" },
];

const TOP_SCORERS = [
  { rank:1, name:"Marco Silva",   teamId:"t1", goals:6, assists:2 },
  { rank:2, name:"Jayden Nkosi",  teamId:"t5", goals:5, assists:3 },
  { rank:3, name:"Carlos Mendez", teamId:"t2", goals:4, assists:1 },
  { rank:4, name:"Thabo Mokoena", teamId:"t6", goals:3, assists:4 },
  { rank:5, name:"Daniel Osei",   teamId:"t5", goals:3, assists:2 },
  { rank:6, name:"Ryan Peters",   teamId:"t3", goals:2, assists:1 },
  { rank:7, name:"Ahmed Hassan",  teamId:"t7", goals:2, assists:0 },
  { rank:8, name:"Luca Ferreira", teamId:"t1", goals:2, assists:1 },
];

const TOP_ASSISTS = [
  { rank:1, name:"Thabo Mokoena", teamId:"t6", goals:3, assists:4 },
  { rank:2, name:"Jayden Nkosi",  teamId:"t5", goals:5, assists:3 },
  { rank:3, name:"Marco Silva",   teamId:"t1", goals:6, assists:2 },
  { rank:4, name:"Daniel Osei",   teamId:"t5", goals:3, assists:2 },
  { rank:5, name:"Carlos Mendez", teamId:"t2", goals:4, assists:1 },
];

const NEWS = [
  {
    id:"n1", date:"2026-09-25", category:"Announcement", categoryColor:"#f7b731",
    title:"Road to the Final 2026 — Registration Now Open!",
    body:"We are thrilled to announce that team registration for the Road to the Final 2026 Summer Edition is now officially open. Secure your spot before slots fill up — only 16 teams will be accepted. Contact us on WhatsApp for payment details after submitting your registration."
  },
  {
    id:"n2", date:"2026-09-22", category:"Info", categoryColor:"#4cc9f0",
    title:"Venue Confirmed: City Sports Complex",
    body:"All group stage and knockout matches will be held at the City Sports Complex, 123 Stadium Drive, Cape Town. Three pitches (A, B & C) will be operational. Parking is available on-site. Spectators welcome free of charge."
  },
  {
    id:"n3", date:"2026-09-20", category:"Rules Update", categoryColor:"#fc5c7d",
    title:"Updated Match Rules for 2026 Edition",
    body:"Please review the updated rules for the 2026 edition. Key changes: squad size increased to 12 (up from 10), rolling substitutions now allowed in group stage, yellow card accumulation reset after group stage. Full rules available in the Rules tab."
  },
  {
    id:"n4", date:"2026-09-15", category:"Preview", categoryColor:"#06d6a0",
    title:"Team Spotlight: Dynamo Stars Looking Unbeatable",
    body:"After a perfect 3-0 record in the last edition, Dynamo Stars return this year with an even stronger squad. With Jayden Nkosi leading the attack and a rock-solid defensive line, they are the team to beat heading into the 2026 tournament."
  },
  {
    id:"n5", date:"2026-09-10", category:"Announcement", categoryColor:"#f7b731",
    title:"Prizes & Awards Revealed",
    body:"The 2026 prize structure has been confirmed. Champions: R5,000 + Trophy. Runners-up: R2,000. Golden Boot (Top Scorer): R500 + Medal. Best Goalkeeper: R500 + Medal. Fair Play Award: Merchandise Pack. All finalists receive medals."
  },
];

const RULES = [
  {
    section:"Match Format", icon:"⏱️",
    items:[
      "Each match consists of two halves of 20 minutes each (40 min total).",
      "5-minute half-time break.",
      "Knockout matches that are tied after 40 mins proceed directly to penalty shootout (5 kicks each, then sudden death).",
      "Matches start on time — teams not present within 5 minutes forfeit the match."
    ]
  },
  {
    section:"Squad & Substitutions", icon:"👥",
    items:[
      "Maximum squad size: 12 players per team.",
      "Minimum players to start a match: 6 (including goalkeeper).",
      "Rolling substitutions are allowed during Group Stage (unlimited).",
      "Knockout Stage: Maximum 5 substitutions per team per match.",
      "Players must be registered before the tournament starts — no late additions."
    ]
  },
  {
    section:"Disciplinary", icon:"🟨",
    items:[
      "Yellow Card: Warning. Two yellows in one match = Red Card (ejection).",
      "Two yellow cards accumulated across different group stage matches = 1 match ban.",
      "Red Card: Immediate ejection. Player misses the next match.",
      "Violent conduct: Immediate tournament ban (no appeal).",
      "Yellow card tally resets after the Group Stage."
    ]
  },
  {
    section:"Scoring & Advancement", icon:"🏆",
    items:[
      "Win: 3 points. Draw: 1 point. Loss: 0 points.",
      "Top 2 teams from each group advance to the Quarter Finals.",
      "Tie-breaker order: 1) Points, 2) Goal Difference, 3) Goals Scored, 4) Head-to-Head.",
      "Group Stage: 3 matches per team.",
      "Finals structure: Quarter Finals → Semi Finals → Final."
    ]
  },
  {
    section:"General Conduct", icon:"🤝",
    items:[
      "All players must wear matching team kits. Goalkeepers must wear a different color.",
      "No slide tackles — this is a non-contact tournament.",
      "Referee decisions are final. Arguing with referee may result in yellow card.",
      "Spectators and team officials must remain in designated areas.",
      "Teams are responsible for the conduct of their supporters."
    ]
  },
];
`;

fs.writeFileSync('js/data.js', dataJs, 'utf8');
console.log('✓ js/data.js', fs.statSync('js/data.js').size, 'bytes');
console.log('All files written successfully!');
