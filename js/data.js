// =============================================
// TOURNAMENT DATA — Road to the Final 2026
// 8 Groups (Groups A - H), 32 Teams (TBD 1 - 32)
// All scores & standings zeroed out for fresh tournament start
// =============================================

const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const DEFAULT_TEAMS = [];
const GROUP_COLORS = [
  ['#38003c', '#00ff85'], ['#1e293b', '#38bdf8'], ['#3b0764', '#c084fc'], ['#18181b', '#facc15'],
  ['#064e3b', '#34d399'], ['#7c2d12', '#fb923c'], ['#1e1b4b', '#818cf8'], ['#701a75', '#f472b6']
];

let teamCounter = 1;
GROUP_LETTERS.forEach((grp, gIdx) => {
  for (let i = 1; i <= 4; i++) {
    const colPair = GROUP_COLORS[(gIdx * 4 + (i - 1)) % GROUP_COLORS.length];
    DEFAULT_TEAMS.push({
      id: `t${teamCounter}`,
      name: `TBD ${teamCounter}`,
      shortName: `TBD${teamCounter}`,
      color: colPair[0],
      accentColor: colPair[1],
      group: grp
    });
    teamCounter++;
  }
});

// Load from localStorage if custom teams were uploaded
let savedTeams = localStorage.getItem('rttf_teams');
let TEAMS = savedTeams ? JSON.parse(savedTeams) : DEFAULT_TEAMS;

const ROUNDS_METADATA = [
  { id: "Game 1", title: "Game 1", dateRange: "Sat 3 Oct - Mon 5 Oct", type: "group" },
  { id: "Game 2", title: "Game 2", dateRange: "Sat 10 Oct - Mon 12 Oct", type: "group" },
  { id: "Game 3", title: "Game 3", dateRange: "Sat 17 Oct - Mon 19 Oct", type: "group" },
  { id: "Round of 16", title: "Round of 16", dateRange: "Sat 24 Oct - Sun 25 Oct", type: "knockout" },
  { id: "Quarter Finals", title: "Quarter Finals", dateRange: "Sat 31 Oct", type: "knockout" },
  { id: "Semi Finals", title: "Semi Finals", dateRange: "Wed 4 Nov", type: "knockout" },
  { id: "Final", title: "Grand Final", dateRange: "Sat 7 Nov", type: "knockout" }
];

// All scores zeroed out (scheduled)
const MATCHES = [];
let matchId = 1;

// Group Stage: Game 1, 2, 3 across all 8 groups
GROUP_LETTERS.forEach((grp, gIdx) => {
  const baseT = gIdx * 4;
  // Game 1
  MATCHES.push({
    id: `m${matchId++}`, round: "Game 1", stage: "Group Stage", group: grp,
    date: "2026-10-03", time: `${9 + (gIdx % 4)}:00`, pitch: `Pitch ${String.fromCharCode(65 + (gIdx % 3))}`,
    homeTeam: `t${baseT + 1}`, awayTeam: `t${baseT + 2}`, homeScore: null, awayScore: null, status: "Scheduled"
  });
  MATCHES.push({
    id: `m${matchId++}`, round: "Game 1", stage: "Group Stage", group: grp,
    date: "2026-10-04", time: `${10 + (gIdx % 4)}:00`, pitch: `Pitch ${String.fromCharCode(65 + ((gIdx + 1) % 3))}`,
    homeTeam: `t${baseT + 3}`, awayTeam: `t${baseT + 4}`, homeScore: null, awayScore: null, status: "Scheduled"
  });

  // Game 2
  MATCHES.push({
    id: `m${matchId++}`, round: "Game 2", stage: "Group Stage", group: grp,
    date: "2026-10-10", time: `${9 + (gIdx % 4)}:00`, pitch: `Pitch ${String.fromCharCode(65 + (gIdx % 3))}`,
    homeTeam: `t${baseT + 1}`, awayTeam: `t${baseT + 3}`, homeScore: null, awayScore: null, status: "Scheduled"
  });
  MATCHES.push({
    id: `m${matchId++}`, round: "Game 2", stage: "Group Stage", group: grp,
    date: "2026-10-11", time: `${10 + (gIdx % 4)}:00`, pitch: `Pitch ${String.fromCharCode(65 + ((gIdx + 1) % 3))}`,
    homeTeam: `t${baseT + 2}`, awayTeam: `t${baseT + 4}`, homeScore: null, awayScore: null, status: "Scheduled"
  });

  // Game 3
  MATCHES.push({
    id: `m${matchId++}`, round: "Game 3", stage: "Group Stage", group: grp,
    date: "2026-10-17", time: `${9 + (gIdx % 4)}:00`, pitch: `Pitch ${String.fromCharCode(65 + (gIdx % 3))}`,
    homeTeam: `t${baseT + 1}`, awayTeam: `t${baseT + 4}`, homeScore: null, awayScore: null, status: "Scheduled"
  });
  MATCHES.push({
    id: `m${matchId++}`, round: "Game 3", stage: "Group Stage", group: grp,
    date: "2026-10-18", time: `${10 + (gIdx % 4)}:00`, pitch: `Pitch ${String.fromCharCode(65 + ((gIdx + 1) % 3))}`,
    homeTeam: `t${baseT + 2}`, awayTeam: `t${baseT + 3}`, homeScore: null, awayScore: null, status: "Scheduled"
  });
});

// Knockouts (Round of 16, QF, SF, Final, 3rd Place)
const KNOCKOUT_MATCHES = [
  // Round of 16 (8 matches)
  { id: "m_r16_1", round: "Round of 16", stage: "Knockout", group: null, date: "2026-10-24", time: "10:00", pitch: "Pitch A", homeTeam: "t1", awayTeam: "t6", homeScore: null, awayScore: null, status: "Scheduled", label: "1A vs 2B" },
  { id: "m_r16_2", round: "Round of 16", stage: "Knockout", group: null, date: "2026-10-24", time: "11:30", pitch: "Pitch B", homeTeam: "t9", awayTeam: "t14", homeScore: null, awayScore: null, status: "Scheduled", label: "1C vs 2D" },
  { id: "m_r16_3", round: "Round of 16", stage: "Knockout", group: null, date: "2026-10-24", time: "13:00", pitch: "Pitch A", homeTeam: "t17", awayTeam: "t22", homeScore: null, awayScore: null, status: "Scheduled", label: "1E vs 2F" },
  { id: "m_r16_4", round: "Round of 16", stage: "Knockout", group: null, date: "2026-10-24", time: "14:30", pitch: "Pitch B", homeTeam: "t25", awayTeam: "t30", homeScore: null, awayScore: null, status: "Scheduled", label: "1G vs 2H" },

  { id: "m_r16_5", round: "Round of 16", stage: "Knockout", group: null, date: "2026-10-25", time: "10:00", pitch: "Pitch A", homeTeam: "t5", awayTeam: "t2", homeScore: null, awayScore: null, status: "Scheduled", label: "1B vs 2A" },
  { id: "m_r16_6", round: "Round of 16", stage: "Knockout", group: null, date: "2026-10-25", time: "11:30", pitch: "Pitch B", homeTeam: "t13", awayTeam: "t10", homeScore: null, awayScore: null, status: "Scheduled", label: "1D vs 2C" },
  { id: "m_r16_7", round: "Round of 16", stage: "Knockout", group: null, date: "2026-10-25", time: "13:00", pitch: "Pitch A", homeTeam: "t21", awayTeam: "t18", homeScore: null, awayScore: null, status: "Scheduled", label: "1F vs 2E" },
  { id: "m_r16_8", round: "Round of 16", stage: "Knockout", group: null, date: "2026-10-25", time: "14:30", pitch: "Pitch B", homeTeam: "t29", awayTeam: "t26", homeScore: null, awayScore: null, status: "Scheduled", label: "1H vs 2G" },

  // Quarter Finals (4 matches)
  { id: "m_qf_1", round: "Quarter Finals", stage: "Knockout", group: null, date: "2026-10-31", time: "10:00", pitch: "Pitch A", homeTeam: "TBD", awayTeam: "TBD", homeScore: null, awayScore: null, status: "Scheduled", label: "W R16-1 vs W R16-2" },
  { id: "m_qf_2", round: "Quarter Finals", stage: "Knockout", group: null, date: "2026-10-31", time: "12:00", pitch: "Pitch B", homeTeam: "TBD", awayTeam: "TBD", homeScore: null, awayScore: null, status: "Scheduled", label: "W R16-3 vs W R16-4" },
  { id: "m_qf_3", round: "Quarter Finals", stage: "Knockout", group: null, date: "2026-10-31", time: "14:00", pitch: "Pitch A", homeTeam: "TBD", awayTeam: "TBD", homeScore: null, awayScore: null, status: "Scheduled", label: "W R16-5 vs W R16-6" },
  { id: "m_qf_4", round: "Quarter Finals", stage: "Knockout", group: null, date: "2026-10-31", time: "16:00", pitch: "Pitch B", homeTeam: "TBD", awayTeam: "TBD", homeScore: null, awayScore: null, status: "Scheduled", label: "W R16-7 vs W R16-8" },

  // Semi Finals (2 matches)
  { id: "m_sf_1", round: "Semi Finals", stage: "Knockout", group: null, date: "2026-11-04", time: "14:00", pitch: "Pitch A", homeTeam: "TBD", awayTeam: "TBD", homeScore: null, awayScore: null, status: "Scheduled", label: "W QF1 vs W QF2" },
  { id: "m_sf_2", round: "Semi Finals", stage: "Knockout", group: null, date: "2026-11-04", time: "16:30", pitch: "Pitch A", homeTeam: "TBD", awayTeam: "TBD", homeScore: null, awayScore: null, status: "Scheduled", label: "W QF3 vs W QF4" },

  // Finals
  { id: "m_final", round: "Final", stage: "Knockout", group: null, date: "2026-11-07", time: "15:00", pitch: "Pitch A", homeTeam: "TBD", awayTeam: "TBD", homeScore: null, awayScore: null, status: "Scheduled", label: "Grand Final" },
  { id: "m_third", round: "3rd Place Playoff", stage: "Knockout", group: null, date: "2026-11-07", time: "12:30", pitch: "Pitch B", homeTeam: "TBD", awayTeam: "TBD", homeScore: null, awayScore: null, status: "Scheduled", label: "3rd Place" }
];

MATCHES.push(...KNOCKOUT_MATCHES);

// 8 Groups, all 0 points, 0 games played
const GROUPS = GROUP_LETTERS.map((grp, gIdx) => {
  const baseT = gIdx * 4;
  return {
    id: grp,
    name: `Group ${grp}`,
    standings: [
      { teamId: `t${baseT + 1}`, pos: 1, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: ["-", "-", "-"] },
      { teamId: `t${baseT + 2}`, pos: 2, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: ["-", "-", "-"] },
      { teamId: `t${baseT + 3}`, pos: 3, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: ["-", "-", "-"] },
      { teamId: `t${baseT + 4}`, pos: 4, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: ["-", "-", "-"] }
    ]
  };
});

// =============================================
// COMPREHENSIVE STATS CENTRE DATA
// =============================================

// Player Database (Custom tournament players across clubs)
const STAT_PLAYERS = [
  { id: "p1", name: "Alex Mercer", teamId: "t1", role: "FWD", goals: 5, assists: 2, passes: 142, cleanSheets: 0, tackles: 8, shots: 16, minutes: 270, yellowCards: 1, redCards: 0 },
  { id: "p2", name: "David Silva Jr", teamId: "t5", role: "FWD", goals: 4, assists: 3, passes: 188, cleanSheets: 0, tackles: 12, shots: 14, minutes: 265, yellowCards: 0, redCards: 0 },
  { id: "p3", name: "Bruno Costa", teamId: "t9", role: "MID", goals: 3, assists: 4, passes: 245, cleanSheets: 0, tackles: 18, shots: 11, minutes: 270, yellowCards: 2, redCards: 0 },
  { id: "p4", name: "Lucas Vance", teamId: "t13", role: "FWD", goals: 3, assists: 1, passes: 98, cleanSheets: 0, tackles: 6, shots: 13, minutes: 250, yellowCards: 0, redCards: 0 },
  { id: "p5", name: "Marcus Thorne", teamId: "t17", role: "FWD", goals: 3, assists: 2, passes: 115, cleanSheets: 0, tackles: 9, shots: 10, minutes: 270, yellowCards: 1, redCards: 0 },
  { id: "p6", name: "Kenzo Tanaka", teamId: "t21", role: "MID", goals: 3, assists: 3, passes: 210, cleanSheets: 0, tackles: 22, shots: 8, minutes: 260, yellowCards: 0, redCards: 0 },
  { id: "p7", name: "Gabriel Santos", teamId: "t25", role: "MID", goals: 3, assists: 2, passes: 195, cleanSheets: 0, tackles: 15, shots: 9, minutes: 270, yellowCards: 0, redCards: 0 },
  { id: "p8", name: "Liam O'Connor", teamId: "t29", role: "FWD", goals: 3, assists: 1, passes: 84, cleanSheets: 0, tackles: 4, shots: 12, minutes: 240, yellowCards: 1, redCards: 0 },
  { id: "p9", name: "Julian Rossi", teamId: "t2", role: "FWD", goals: 3, assists: 2, passes: 130, cleanSheets: 0, tackles: 7, shots: 11, minutes: 260, yellowCards: 0, redCards: 0 },
  { id: "p10", name: "Samir Nasri Jr", teamId: "t6", role: "MID", goals: 3, assists: 3, passes: 220, cleanSheets: 0, tackles: 19, shots: 7, minutes: 270, yellowCards: 1, redCards: 0 },
  { id: "p11", name: "Victor Hugo", teamId: "t10", role: "MID", goals: 2, assists: 3, passes: 180, cleanSheets: 0, tackles: 14, shots: 6, minutes: 255, yellowCards: 0, redCards: 0 },
  { id: "p12", name: "Ethan Walker", teamId: "t14", role: "DEF", goals: 1, assists: 2, passes: 290, cleanSheets: 2, tackles: 34, shots: 3, minutes: 270, yellowCards: 2, redCards: 0 },
  { id: "p13", name: "Kofi Mensah", teamId: "t18", role: "DEF", goals: 0, assists: 1, passes: 310, cleanSheets: 2, tackles: 38, shots: 2, minutes: 270, yellowCards: 1, redCards: 0 },
  { id: "p14", name: "Ruben Dias Jr", teamId: "t22", role: "DEF", goals: 1, assists: 0, passes: 340, cleanSheets: 3, tackles: 41, shots: 4, minutes: 270, yellowCards: 0, redCards: 0 },
  { id: "p15", name: "Elliot Anderson", teamId: "t26", role: "DEF", goals: 0, assists: 2, passes: 355, cleanSheets: 3, tackles: 36, shots: 1, minutes: 270, yellowCards: 1, redCards: 0 },
  { id: "p16", name: "Virgil Van Jr", teamId: "t30", role: "DEF", goals: 2, assists: 0, passes: 325, cleanSheets: 2, tackles: 44, shots: 5, minutes: 270, yellowCards: 0, redCards: 0 },
  // Goalkeepers
  { id: "gk1", name: "Oliver Kahn Jr", teamId: "t1", role: "GK", goals: 0, assists: 0, passes: 95, cleanSheets: 3, saves: 19, minutes: 270, yellowCards: 0, redCards: 0 },
  { id: "gk2", name: "Gianluigi B.", teamId: "t5", role: "GK", goals: 0, assists: 0, passes: 82, cleanSheets: 3, saves: 22, minutes: 270, yellowCards: 0, redCards: 0 },
  { id: "gk3", name: "David Ray Jr", teamId: "t9", role: "GK", goals: 0, assists: 0, passes: 110, cleanSheets: 3, saves: 17, minutes: 270, yellowCards: 0, redCards: 0 },
  { id: "gk4", name: "Hugo Lloris Jr", teamId: "t13", role: "GK", goals: 0, assists: 0, passes: 76, cleanSheets: 3, saves: 25, minutes: 270, yellowCards: 1, redCards: 0 },
  { id: "gk5", name: "Bart Verb.", teamId: "t17", role: "GK", goals: 0, assists: 0, passes: 88, cleanSheets: 3, saves: 16, minutes: 270, yellowCards: 0, redCards: 0 },
  { id: "gk6", name: "Alisson Becker Jr", teamId: "t21", role: "GK", goals: 0, assists: 0, passes: 104, cleanSheets: 2, saves: 21, minutes: 270, yellowCards: 0, redCards: 0 },
  { id: "gk7", name: "Jordan P.", teamId: "t25", role: "GK", goals: 0, assists: 0, passes: 90, cleanSheets: 2, saves: 23, minutes: 270, yellowCards: 0, redCards: 0 },
  { id: "gk8", name: "Walter Benitez Jr", teamId: "t29", role: "GK", goals: 0, assists: 0, passes: 70, cleanSheets: 2, saves: 18, minutes: 270, yellowCards: 0, redCards: 0 },
  { id: "gk9", name: "James Trafford Jr", teamId: "t2", role: "GK", goals: 0, assists: 0, passes: 85, cleanSheets: 2, saves: 20, minutes: 270, yellowCards: 0, redCards: 0 },
  { id: "gk10", name: "Caoimhin K.", teamId: "t6", role: "GK", goals: 0, assists: 0, passes: 92, cleanSheets: 1, saves: 15, minutes: 270, yellowCards: 0, redCards: 0 }
];

// Club Stats Database
const STAT_CLUBS = [
  { teamId: "t1", goals: 16, tackles: 52, blocks: 28, passes: 2850, cleanSheets: 3, conceded: 2, possession: 59, shots: 42, yellowCards: 3, fouls: 24 },
  { teamId: "t5", goals: 13, tackles: 48, blocks: 24, passes: 3143, cleanSheets: 3, conceded: 3, possession: 64, shots: 38, yellowCards: 2, fouls: 19 },
  { teamId: "t9", goals: 10, tackles: 74, blocks: 23, passes: 2743, cleanSheets: 3, conceded: 1, possession: 55, shots: 31, yellowCards: 5, fouls: 31 },
  { teamId: "t13", goals: 10, tackles: 59, blocks: 33, passes: 2732, cleanSheets: 3, conceded: 4, possession: 52, shots: 29, yellowCards: 4, fouls: 27 },
  { teamId: "t17", goals: 9, tackles: 55, blocks: 39, passes: 2728, cleanSheets: 3, conceded: 2, possession: 54, shots: 34, yellowCards: 3, fouls: 22 },
  { teamId: "t21", goals: 8, tackles: 53, blocks: 27, passes: 2574, cleanSheets: 2, conceded: 5, possession: 51, shots: 27, yellowCards: 6, fouls: 35 },
  { teamId: "t25", goals: 8, tackles: 49, blocks: 27, passes: 2504, cleanSheets: 2, conceded: 4, possession: 49, shots: 26, yellowCards: 2, fouls: 18 },
  { teamId: "t29", goals: 7, tackles: 48, blocks: 21, passes: 2096, cleanSheets: 2, conceded: 6, possession: 46, shots: 22, yellowCards: 4, fouls: 29 },
  { teamId: "t2", goals: 7, tackles: 47, blocks: 20, passes: 2084, cleanSheets: 2, conceded: 5, possession: 47, shots: 25, yellowCards: 1, fouls: 16 },
  { teamId: "t6", goals: 7, tackles: 45, blocks: 20, passes: 2062, cleanSheets: 1, conceded: 7, possession: 45, shots: 20, yellowCards: 3, fouls: 21 },
  { teamId: "t10", goals: 6, tackles: 42, blocks: 19, passes: 1980, cleanSheets: 1, conceded: 6, possession: 44, shots: 19, yellowCards: 2, fouls: 20 },
  { teamId: "t14", goals: 6, tackles: 41, blocks: 18, passes: 1920, cleanSheets: 1, conceded: 8, possession: 43, shots: 18, yellowCards: 5, fouls: 30 }
];

// Discover More Feature Articles
const DISCOVER_ARTICLES = [
  {
    id: "art1",
    tag: "AWARDS RACE",
    title: "Golden Boot Race 2026: The Tournament's Deadliest Finishers",
    desc: "A tactical breakdown of the top strikers clinical inside the penalty box.",
    icon: "⚽",
    gradient: "linear-gradient(135deg, #001438, #0a3d62)"
  },
  {
    id: "art2",
    tag: "CREATIVITY",
    title: "Playmaker Rankings: Visionaries Leading Key Passes & Assists",
    desc: "Discover how the midfield maestros are carving open defensive blocks.",
    icon: "🎯",
    gradient: "linear-gradient(135deg, #071e4a, #0c2461)"
  },
  {
    id: "art3",
    tag: "DEFENSE",
    title: "Golden Glove Watch: Shot-stoppers with Impenetrable Clean Sheets",
    desc: "Examining reflex saves and clean sheet percentages across all 8 groups.",
    icon: "🧤",
    gradient: "linear-gradient(135deg, #002b5c, #053b75)"
  },
  {
    id: "art4",
    tag: "ANALYSIS",
    title: "Pace & Power: Top Recorded Sprint Speeds of the Tournament",
    desc: "The fastest wingers and wingbacks breaking lines at high intensity.",
    icon: "⚡",
    gradient: "linear-gradient(135deg, #001f3f, #003366)"
  },
  {
    id: "art5",
    tag: "TACTICS",
    title: "Total Football: Club Possession & Passing Sequences Unpacked",
    desc: "Which squads dominate tempo and control the pitch rhythm.",
    icon: "📊",
    gradient: "linear-gradient(135deg, #0b1e36, #142f4c)"
  }
];

// All-time Tournament Records & Milestones
const TOURNAMENT_RECORDS = [
  { title: "⚡ Fastest Goal", holder: "Alex Mercer (TBD 1)", value: "23 seconds", detail: "Scored in Group Stage Game 1" },
  { title: "🎯 Most Goals in Single Match", holder: "David Silva Jr (TBD 5)", value: "4 Goals", detail: "Achieved in 6-1 victory" },
  { title: "🛡️ Most Consecutive Clean Sheets", holder: "Oliver Kahn Jr (TBD 1)", value: "4 Matches", detail: "Unbeaten defensive record" },
  { title: "🎩 Most Tournament Hat-Tricks", holder: "Lucas Vance (TBD 13)", value: "2 Hat-Tricks", detail: "Back-to-back group fixtures" },
  { title: "🏆 Highest Scoring Match", holder: "TBD 1 vs TBD 2", value: "7 Goals (5-2)", detail: "Pitch A thriller" },
  { title: "👟 Most Tournament Assists", holder: "Bruno Costa (TBD 9)", value: "7 Assists", detail: "Campaign record across groups" }
];

const ALL_TIME_STATS = [
  { label: "Total Tournament Goals", value: "128", sub: "3.2 goals / match average" },
  { label: "Matches Completed", value: "40", sub: "Group stage & Knockouts" },
  { label: "Total Clean Sheets", value: "24", sub: "Recorded by 14 goalkeepers" },
  { label: "Average Ball Possession", value: "54.2%", sub: "High tempo playing style" },
  { label: "Total Completed Passes", value: "32,450", sub: "87.4% completion rate" },
  { label: "Yellow / Red Cards", value: "38 / 2", sub: "Disciplined sportsmanship" }
];

// Fallback legacy arrays for backward compatibility
const TOP_SCORERS = STAT_PLAYERS.map((p, idx) => ({ rank: idx + 1, name: p.name, teamId: p.teamId, goals: p.goals, assists: p.assists }));
const TOP_ASSISTS = STAT_PLAYERS.slice().sort((a, b) => b.assists - a.assists).map((p, idx) => ({ rank: idx + 1, name: p.name, teamId: p.teamId, goals: p.goals, assists: p.assists }));

const RULES = [
  {
    section: "1. Tournament Format & Roster Structure",
    icon: "⚽",
    items: [
      "Match Format: Games are played as 5-a-side (4 outfield players + 1 goalkeeper) and last 20 minutes in total: 9 minutes, a 2-minute break, then 9 minutes.",
      "Roster Size: Each team registers a squad of 5 to 8 players. Only registered roster players are eligible to play or substitute.",
      "Substitutions: Rolling substitutions are permitted at any point during the match."
    ]
  },
  {
    section: "2. Competition Progression",
    icon: "🏆",
    items: [
      "Phase 1 (Group Stage): Teams first compete in round-robin group play (3 group stage games across 8 groups A-H). Win = 3 points, draw = 1, loss = 0; goal difference then goals scored separate teams level on points.",
      "Phase 2 (Knockout Stage): The top 2 teams from each group advance to the Round of 16, then the quarter-finals, semi-finals, a third-place playoff and the final."
    ]
  },
  {
    section: "3. Punctuality & Forfeits",
    icon: "⏱️",
    items: [
      "Late Arrival Penalty: If a team is not ready at the scheduled start time, a penalty goal will be awarded to the opposing team for every 2 minutes of delay.",
      "Match Forfeit: If a team fails to field their squad within 5 minutes of the scheduled start time, the match is officially cancelled, and the tardy team automatically forfeits the match."
    ]
  },
  {
    section: "4. On-Pitch Rules & Offenses",
    icon: "🟨",
    items: [
      "No Slide Tackling: Slide tackles are strictly prohibited.",
      "Penalty: Infractions result in an immediate 5-minute yellow card / sin-bin penalty (the offending player leaves the pitch, and their team plays a man down for 5 minutes).",
      "No Tackling from Behind: Marking or tackling directly from behind is strictly forbidden.",
      "Zero Tolerance for Fighting: Any physical altercations or violent behavior will result in immediate team disqualification from the tournament."
    ]
  },
  {
    section: "5. Payment & Refund Policy",
    icon: "💳",
    items: [
      "Strict No Refund Policy: The R800 per-team registration fee is strictly non-refundable once transferred.",
      "Cut-off Deadline: No refund requests will be accepted or processed within 7 days prior to the tournament start date."
    ]
  }
];
