# Road to the Final 🏆

A static website showcasing a 5-a-side football tournament — group stage, knockout bracket, fixtures, rules, and a team sign-up form.

**[Live preview](#)** — publish with GitHub Pages (instructions below).

## What's in here

```
road-to-the-final/
├── index.html      # the whole site (single page)
├── css/style.css   # design system + layout
├── js/script.js    # mobile nav + demo form handling
└── README.md
```

No build step, no dependencies — open `index.html` in a browser, or serve the folder with any static host.

## Sections

- **Hero** — tournament name, quick stats, next match
- **Format** — how the group stage and knockouts work
- **Bracket** — semi-finals → final, updates as results come in
- **Groups** — two group tables with points, GD, qualifiers highlighted
- **Fixtures** — full match schedule
- **Rules** — on-pitch rules and competition tie-break rules
- **Venue & Sign Up** — venue details and a team registration form

## Customizing it

All the tournament content is plain HTML in `index.html` — no CMS, no data files. To make it yours:

1. **Teams & fixtures** — edit the team names, dates and scores directly in the `#bracket`, `#groups`, and `#fixtures` sections.
2. **Scores** — once a match is played, replace the `–` placeholders in `.match .team .score` with the result, and add `class="winner"` to the winning `.team` div.
3. **Colors/fonts** — all design tokens are CSS variables at the top of `css/style.css` (`:root { ... }`).
4. **Sign-up form** — the form in `#venue` is a front-end placeholder. Hook it up to a real backend, e.g.:
   - [Formspree](https://formspree.io) or [Getform](https://getform.io) — add their endpoint as the form's `action`, no server needed.
   - Your own backend / serverless function.

## Publish it for free with GitHub Pages

1. Push this repo to GitHub (see below).
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
4. Save — your site will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## Pushing this to GitHub

```bash
# from inside this folder
git add .
git commit -m "Initial commit: Road to the Final tournament site"

# create a new empty repo on github.com first, then:
git branch -M main
git remote add origin https://github.com/<your-username>/road-to-the-final.git
git push -u origin main
```

## License

MIT — see `LICENSE`.

## Public site vs admin

- `index.html` — the public one-page site (hero, stats, day timeline, fixtures, FAQ, sign-up).
- `admin.html` — the full match center: standings, teams & squads, statistics, rules & info, media, scorekeeper and rosters. It is not linked from the public page and is marked `noindex`, but it is **not password-protected** by the hosting itself — anyone with the URL can open it.
