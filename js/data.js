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

const TOP_SCORERS = [
  { rank: 1, name: "Player 1", teamId: "t1", goals: 0, assists: 0 },
  { rank: 2, name: "Player 2", teamId: "t5", goals: 0, assists: 0 },
  { rank: 3, name: "Player 3", teamId: "t9", goals: 0, assists: 0 },
  { rank: 4, name: "Player 4", teamId: "t13", goals: 0, assists: 0 },
  { rank: 5, name: "Player 5", teamId: "t17", goals: 0, assists: 0 },
  { rank: 6, name: "Player 6", teamId: "t21", goals: 0, assists: 0 },
  { rank: 7, name: "Player 7", teamId: "t25", goals: 0, assists: 0 },
  { rank: 8, name: "Player 8", teamId: "t29", goals: 0, assists: 0 }
];

const TOP_ASSISTS = [
  { rank: 1, name: "Player 4", teamId: "t13", goals: 0, assists: 0 },
  { rank: 2, name: "Player 2", teamId: "t5", goals: 0, assists: 0 },
  { rank: 3, name: "Player 1", teamId: "t1", goals: 0, assists: 0 },
  { rank: 4, name: "Player 5", teamId: "t17", goals: 0, assists: 0 },
  { rank: 5, name: "Player 3", teamId: "t9", goals: 0, assists: 0 }
];

const RULES = [
  {
    section: "Match Format", icon: "⏱️",
    items: [
      "Each match consists of two halves of 20 minutes each (40 min total).",
      "5-minute half-time break.",
      "Knockout matches tied after 40 mins proceed directly to penalty shootout (5 kicks each, then sudden death).",
      "Matches start promptly — teams not present within 5 minutes forfeit."
    ]
  },
  {
    section: "Squad & Substitutions", icon: "👥",
    items: [
      "Maximum squad size: 12 players per team.",
      "Minimum players to start a match: 6 (including goalkeeper).",
      "Rolling substitutions are allowed during all 3 Group Stage Games (Game 1, Game 2, Game 3).",
      "Knockout Stage: Maximum 5 substitutions per team per match."
    ]
  },
  {
    section: "Tournament Scoring & Qualification", icon: "🏆",
    items: [
      "Win: 3 points. Draw: 1 point. Loss: 0 points.",
      "Group Stage: Exactly 3 games per team (Game 1, Game 2, Game 3) across 8 groups (Groups A to H).",
      "Top 2 teams from each of the 8 groups qualify for the Round of 16.",
      "Tie-breaker order: 1) Points, 2) Goal Difference, 3) Goals Scored, 4) Head-to-Head."
    ]
  },
  {
    section: "Disciplinary Rules", icon: "🟨",
    items: [
      "Yellow Card: Warning. Two yellows in one match = Red Card.",
      "Red Card: Immediate ejection and 1-match suspension.",
      "Yellow card tally resets completely after the 3 Group Stage Games.",
      "No slide tackles allowed — this is a non-contact competitive tournament."
    ]
  }
];
