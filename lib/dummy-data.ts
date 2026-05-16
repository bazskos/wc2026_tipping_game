export interface Team {
  name: string;
  code: string; // A flagcdn.com országkódja
}

export interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  time: string;
  group?: string;
  status: "scheduled" | "live" | "finished";
}

export interface Group {
  name: string;
  teams: Team[];
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  perfectTips: number;
  streak: number;
}

// --- TOPLISTA (LEADERBOARD) ADATOK ---
// Itt vannak a hiányzó mezők, amik miatt crash-elt a /points oldal!
export const leaderboardData: Player[] = [
  {
    id: "1",
    name: "Bence",
    avatar: "BE",
    points: 124,
    rank: 1,
    perfectTips: 8,
    streak: 3,
  },
  {
    id: "2",
    name: "Dani",
    avatar: "DA",
    points: 117,
    rank: 2,
    perfectTips: 4,
    streak: 1,
  },
  {
    id: "3",
    name: "Márk",
    avatar: "MÁ",
    points: 102,
    rank: 3,
    perfectTips: 2,
    streak: 0,
  },
  {
    id: "4",
    name: "Peti",
    avatar: "PE",
    points: 98,
    rank: 4,
    perfectTips: 2,
    streak: 2,
  },
  {
    id: "5",
    name: "Gergő",
    avatar: "GE",
    points: 85,
    rank: 5,
    perfectTips: 1,
    streak: 0,
  },
];

// --- MÉRKŐZÉSEK (CSOPORTKÖR + EGYENES KIESÉS) ---
export const matches: Match[] = [
  // --- Mai és Holnapi meccsek (Match Center) ---
  {
    id: 1,
    homeTeam: { name: "USA", code: "us" },
    awayTeam: { name: "Germany", code: "de" },
    date: "Jun 11",
    time: "12:00 PM",
    group: "Group A",
    status: "scheduled",
  },
  {
    id: 2,
    homeTeam: { name: "Brazil", code: "br" },
    awayTeam: { name: "France", code: "fr" },
    date: "Jun 11",
    time: "3:00 PM",
    group: "Group B",
    status: "scheduled",
  },
  {
    id: 3,
    homeTeam: { name: "Hungary", code: "hu" },
    awayTeam: { name: "England", code: "gb-eng" },
    date: "Jun 12",
    time: "6:00 PM",
    group: "Group C",
    status: "scheduled",
  },
  {
    id: 4,
    homeTeam: { name: "Argentina", code: "ar" },
    awayTeam: { name: "Algeria", code: "dz" },
    date: "Jun 12",
    time: "9:00 PM",
    group: "Group D",
    status: "scheduled",
  },
  {
    id: 5,
    homeTeam: { name: "Spain", code: "es" },
    awayTeam: { name: "Cabo Verde", code: "cv" },
    date: "Jun 13",
    time: "12:00 PM",
    group: "Group E",
    status: "scheduled",
  },
  {
    id: 6,
    homeTeam: { name: "Japan", code: "jp" },
    awayTeam: { name: "Croatia", code: "hr" },
    date: "Jun 13",
    time: "3:00 PM",
    group: "Group F",
    status: "scheduled",
  },

  // --- Round of 32 (A legjobb 32 meccsei) ---
  {
    id: 73,
    homeTeam: { name: "Netherlands", code: "nl" },
    awayTeam: { name: "Senegal", code: "sn" },
    date: "Jun 28",
    time: "10:00 AM",
    status: "scheduled",
  },
  {
    id: 74,
    homeTeam: { name: "Portugal", code: "pt" },
    awayTeam: { name: "South Korea", code: "kr" },
    date: "Jun 28",
    time: "2:00 PM",
    status: "scheduled",
  },
  {
    id: 75,
    homeTeam: { name: "Italy", code: "it" },
    awayTeam: { name: "Uruguay", code: "uy" },
    date: "Jun 29",
    time: "10:00 AM",
    status: "scheduled",
  },
  {
    id: 76,
    homeTeam: { name: "Colombia", code: "co" },
    awayTeam: { name: "Morocco", code: "ma" },
    date: "Jun 29",
    time: "2:00 PM",
    status: "scheduled",
  },
  {
    id: 77,
    homeTeam: { name: "Belgium", code: "be" },
    awayTeam: { name: "Mexico", code: "mx" },
    date: "Jun 30",
    time: "10:00 AM",
    status: "scheduled",
  },
];

// --- 12 CSOPORT (A-tól L-ig) A 2026-OS SZABÁLYOK SZERINT ---
export const groups: Group[] = [
  {
    name: "Group A",
    teams: [
      { name: "Mexico", code: "mx" },
      { name: "South Africa", code: "za" },
      { name: "South Korea", code: "kr" },
      { name: "Play-off Winner", code: "un" },
    ],
  },
  {
    name: "Group B",
    teams: [
      { name: "Canada", code: "ca" },
      { name: "Play-off Winner", code: "un" },
      { name: "Qatar", code: "qa" },
      { name: "Switzerland", code: "ch" },
    ],
  },
  {
    name: "Group C",
    teams: [
      { name: "Brazil", code: "br" },
      { name: "Morocco", code: "ma" },
      { name: "Haiti", code: "ht" },
      { name: "Scotland", code: "gb-sct" },
    ],
  },
  {
    name: "Group D",
    teams: [
      { name: "USA", code: "us" },
      { name: "Paraguay", code: "py" },
      { name: "Australia", code: "au" },
      { name: "Play-off Winner", code: "un" },
    ],
  },
  {
    name: "Group E",
    teams: [
      { name: "Germany", code: "de" },
      { name: "Curaçao", code: "cw" },
      { name: "Côte d'Ivoire", code: "ci" },
      { name: "Play-off Winner", code: "un" },
    ],
  },
  {
    name: "Group F",
    teams: [
      { name: "Netherlands", code: "nl" },
      { name: "Japan", code: "jp" },
      { name: "Play-off Winner", code: "un" },
      { name: "Panama", code: "pa" },
    ],
  },
  {
    name: "Group G",
    teams: [
      { name: "Belgium", code: "be" },
      { name: "Egypt", code: "eg" },
      { name: "Iran", code: "ir" },
      { name: "New Zealand", code: "nz" },
    ],
  },
  {
    name: "Group H",
    teams: [
      { name: "Spain", code: "es" },
      { name: "Cabo Verde", code: "cv" },
      { name: "Saudi Arabia", code: "sa" },
      { name: "Uruguay", code: "uy" },
    ],
  },
  {
    name: "Group I",
    teams: [
      { name: "England", code: "gb-eng" },
      { name: "Nigeria", code: "ng" },
      { name: "Jamaica", code: "jm" },
      { name: "Play-off Winner", code: "un" },
    ],
  },
  {
    name: "Group J",
    teams: [
      { name: "Argentina", code: "ar" },
      { name: "Sweden", code: "se" },
      { name: "Mali", code: "ml" },
      { name: "Play-off Winner", code: "un" },
    ],
  },
  {
    name: "Group K",
    teams: [
      { name: "France", code: "fr" },
      { name: "Ecuador", code: "ec" },
      { name: "Tunisia", code: "tn" },
      { name: "Play-off Winner", code: "un" },
    ],
  },
  {
    name: "Group L",
    teams: [
      { name: "Portugal", code: "pt" },
      { name: "Chile", code: "cl" },
      { name: "Algeria", code: "dz" },
      { name: "Play-off Winner", code: "un" },
    ],
  },
];
