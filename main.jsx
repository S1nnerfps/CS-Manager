import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trophy, Users, Sword, BarChart3, PlusCircle, Calendar, DollarSign, CheckCircle2, ChevronDown, ChevronUp, Check, Shield, History, ArrowDownUp, Clock, ListOrdered, ArrowLeft, ArrowRight, Globe, Sun, Moon } from 'lucide-react';

const MAP_POOL = [
  { name: "Mirage", weight: 70 }, { name: "Nuke", weight: 60 }, { name: "Ancient", weight: 50 },
  { name: "Dust 2", weight: 40 }, { name: "Inferno", weight: 30 }, { name: "Overpass", weight: 20 },
  { name: "Anubis", weight: 10 }
];

const INITIAL_SOURCE = [
  { n: "Vitality", r: "EU", v: 2090 }, { n: "Natus Vincere", r: "EU", v: 1925 }, { n: "FUT", r: "EU", v: 1882 }, { n: "Astralis", r: "EU", v: 1867 }, { n: "The MongolZ", r: "AS", v: 1858 },
  { n: "FURIA", r: "AM", v: 1852 }, { n: "MOUZ", r: "EU", v: 1847 }, { n: "Falcons", r: "EU", v: 1813 }, { n: "Aurora", r: "EU", v: 1810 }, { n: "PARIVISION", r: "EU", v: 1791 },
  { n: "Spirit", r: "EU", v: 1728 }, { n: "G2", r: "EU", v: 1676 }, { n: "3DMAX", r: "EU", v: 1598 }, { n: "paiN", r: "AM", v: 1596 }, { n: "9z", r: "AM", v: 1594 },
  { n: "B8", r: "EU", v: 1590 }, { n: "Legacy", r: "AM", v: 1529 }, { n: "BetBoom", r: "EU", v: 1519 }, { n: "Monte", r: "EU", v: 1515 }, { n: "BIG", r: "EU", v: 1499 },
  { n: "HEROIC", r: "EU", v: 1493 }, { n: "GamerLegion", r: "EU", v: 1490 }, { n: "Alliance", r: "EU", v: 1469 }, { n: "MIBR", r: "AM", v: 1467 }, { n: "SINNERS", r: "EU", v: 1461 },
  { n: "FOKUS", r: "EU", v: 1452 }, { n: "M80", r: "AM", v: 1447 }, { n: "NRG", r: "AM", v: 1429 }, { n: "EYEBALLERS", r: "EU", v: 1422 }, { n: "Ninjas in Pyjamas", r: "EU", v: 1422 },
  { n: "Nemesis", r: "EU", v: 1403 }, { n: "Sharks", r: "AM", v: 1394 }, { n: "K27", r: "EU", v: 1393 }, { n: "FaZe", r: "EU", v: 1380 }, { n: "Gaimin Gladiators", r: "AM", v: 1374 },
  { n: "Nemiga", r: "EU", v: 1371 }, { n: "TYLOO", r: "AS", v: 1370 }, { n: "1win", r: "EU", v: 1358 }, { n: "BESTIA", r: "AM", v: 1345 }, { n: "HOTU", r: "EU", v: 1342 },
  { n: "Liquid", r: "AM", v: 1339 }, { n: "illwill", r: "EU", v: 1338 }, { n: "Gentle Mates", r: "EU", v: 1335 }, { n: "100 Thieves", r: "EU", v: 1328 }, { n: "magic", r: "EU", v: 1313 },
  { n: "Passion UA", r: "AM", v: 1310 }, { n: "Voca", r: "AM", v: 1309 }, { n: "9INE", r: "EU", v: 1309 }, { n: "Lynn Vision", r: "AS", v: 1306 }, { n: "BET-M", r: "EU", v: 1299 },
  { n: "ODDIK", r: "AM", v: 1294 }, { n: "TDK", r: "EU", v: 1292 }, { n: "ShindeN", r: "AM", v: 1283 }, { n: "THUNDER dOWNUNDER", r: "AS", v: 1279 }, { n: "Inner Circle", r: "EU", v: 1277 },
  { n: "Fluxo", r: "AM", v: 1276 }, { n: "RED Canids", r: "AM", v: 1275 }, { n: "Betclic", r: "EU", v: 1272 }, { n: "Wildcard", r: "AM", v: 1265 }, { n: "ARCRED", r: "EU", v: 1255 },
  { n: "Tricked", r: "EU", v: 1249 }, { n: "FlyQuest", r: "AS", v: 1242 }, { n: "AM", r: "EU", v: 1238 }, { n: "Marsborne", r: "AM", v: 1236 }, { n: "Sashi", r: "EU", v: 1233 },
  { n: "Nuclear TigeRES", r: "EU", v: 1233 }, { n: "Imperial", r: "AM", v: 1232 }, { n: "OG", r: "EU", v: 1229 }, { n: "Johnny Speeds", r: "EU", v: 1226 }, { n: "Eternal Fire", r: "EU", v: 1223 },
  { n: "ECSTATIC", r: "EU", v: 1219 }, { n: "WW", r: "EU", v: 1215 }, { n: "BC.Game", r: "EU", v: 1207 }, { n: "AaB", r: "EU", v: 1190 }, { n: "Acend", r: "EU", v: 1188 },
  { n: "JiJieHao", r: "EU", v: 1179 }, { n: "SPARTA", r: "EU", v: 1171 }, { n: "SemperFi", r: "AS", v: 1170 }, { n: "The Huns", r: "AS", v: 1163 }, { n: "QWENTRY", r: "EU", v: 1160 },
  { n: "ex-RUBY", r: "EU", v: 1157 }, { n: "CYBERSHOKE", r: "EU", v: 1148 }, { n: "fnatic", r: "EU", v: 1147 }, { n: "Ursa", r: "EU", v: 1146 }, { n: "MOUZ NXT", r: "EU", v: 1144 },
  { n: "NEXVOID", r: "AS", v: 1139 }, { n: "FAVBET", r: "EU", v: 1136 }, { n: "Sangal", r: "EU", v: 1129 }, { n: "Metizport", r: "EU", v: 1126 }, { n: "Phantom", r: "EU", v: 1122 },
  { n: "Rebels", r: "EU", v: 1117 }, { n: "ESC", r: "EU", v: 1114 }, { n: "Galorys", r: "AM", v: 1112 }, { n: "KOLESIE", r: "EU", v: 1110 }, { n: "Bounty Hunters", r: "AM", v: 1107 },
  { n: "ENCE", r: "EU", v: 1105 }, { n: "Chinggis Warriors", r: "AS", v: 1099 }, { n: "Rare Atom", r: "AS", v: 1095 }, { n: "Fake do Biru", r: "AM", v: 1092 }, { n: "5star", r: "AS", v: 1070 }
];

const TOURNAMENT_TIERS = {
  HIGHEST: { id: 'HIGHEST', name: 'HIGHEST', delay: 60, rest: 7, banTop: 0, multiplier: 1 },
  TIER_S: { id: 'TIER_S', name: 'Tier S', delay: 30, rest: 3, banTop: 0, multiplier: 0.8 },
  TIER_1: { id: 'TIER_1', name: 'Tier 1', delay: 14, rest: 3, banTop: 16, multiplier: 0.6 },
  TIER_2: { id: 'TIER_2', name: 'Tier 2', delay: 14, rest: 3, banTop: 32, multiplier: 0.4 },
  TIER_3: { id: 'TIER_3', name: 'Tier 3', delay: 7, rest: 3, banTop: 48, multiplier: 0.2 },
  TIER_OPEN: { id: 'TIER_OPEN', name: 'Tier Open', delay: 3, rest: 3, banTop: 64, multiplier: 0.1 }
};

const TIER_ORDER = ['HIGHEST', 'TIER_S', 'TIER_1', 'TIER_2', 'TIER_3', 'TIER_OPEN'];
const REGION_ORDER = ['EU', 'AM', 'AS'];

const FORMATS = {
  MAJOR: { id: 'MAJOR', name: 'Major', teams: 32, basePrize: 2000000, allowedTiers: ['HIGHEST'] },
  IEM: { id: 'IEM', name: 'IEM', teams: 16, basePrize: 1500000, allowedTiers: ['HIGHEST', 'TIER_S', 'TIER_1'] },
  EWC: { id: 'EWC', name: 'EWC', teams: 16, basePrize: 1500000, allowedTiers: ['HIGHEST'] },
  BLAST: { id: 'BLAST', name: 'BLAST', teams: 8, basePrize: 1000000, allowedTiers: ['HIGHEST', 'TIER_S', 'TIER_1'] },
  EPL: { id: 'EPL', name: 'EPL', teams: 24, basePrize: 800000, allowedTiers: ['HIGHEST', 'TIER_S', 'TIER_1', 'TIER_2', 'TIER_3', 'TIER_OPEN'] },
};

const CITY_REQUIRED_FORMATS = new Set(['MAJOR', 'IEM', 'BLAST']);

const PLACEMENT_WEIGHTS = {
  "1st": 5000, "2nd": 2000, "3rd": 1000, "4th": 800, "3rd-4th": 900,
  "5th-6th": 400, "7th-8th": 300, "5th-8th": 350,
  "9th-11th": 150, "12th-14th": 100, "15th-16th": 75,
  "17th-19th": 50, "20th-22nd": 35, "23rd-24th": 25,
  "25th-27th": 15, "28th-30th": 10, "31st-32nd": 3.5,
  "9th-12th": 100, "13th-16th": 40,
  "9th-16th": 70, "17th-24th": 30
};

const createDefaultMajorSlots = () => ({
  stage3: { EU: 6, AM: 1, AS: 1 },
  stage2: { EU: 5, AM: 3, AS: 0 },
  stage1: { EU: 6, AM: 6, AS: 4 }
});

const normalizeMajorSlots = (slots) => {
  const base = createDefaultMajorSlots();
  const out = { stage3: { ...base.stage3 }, stage2: { ...base.stage2 }, stage1: { ...base.stage1 } };
  ['stage3', 'stage2', 'stage1'].forEach(stageKey => {
    REGION_ORDER.forEach(region => {
      const v = Number(slots?.[stageKey]?.[region]);
      if (Number.isFinite(v) && v >= 0) out[stageKey][region] = Math.floor(v);
    });
  });
  return out;
};

const ESPORTS_CITIES = [
  "Aarhus", "Abu Dhabi", "Adelaide", "Almaty", "Amsterdam", "Antwerp", "Astana", "Astata", "Atlanta", "Auckland",
  "Austin", "Bangkok", "Barcelona", "Beijing", "Belgrade", "Berlin", "Birmingham", "Bogota", "Boston", "Brasilia",
  "Bratislava", "Brisbane", "Brussels", "Bucharest", "Budapest", "Busan", "Calgary", "Chengdu", "Chicago", "Cluj-Napoca",
  "Cologne", "Copenhagen", "Curitiba", "Dallas", "Delhi", "Denver", "Doha", "Dubai", "Dusseldorf", "Edmonton",
  "Frankfurt", "Gdansk", "Gothenburg", "Guadalajara", "Guangzhou", "Hamburg", "Hangzhou", "Hanoi", "Helsinki", "Ho Chi Minh City",
  "Hong Kong", "Houston", "Istanbul", "Jakarta", "Jeddah", "Johannesburg", "Katowice", "Kiev", "Krakow", "Kuala Lumpur",
  "Kyiv", "Kyoto", "Las Vegas", "Leipzig", "Lima", "Lisbon", "London", "Los Angeles", "Lyon", "Macau",
  "Madrid", "Malmo", "Manchester", "Manila", "Marseille", "Medellin", "Melbourne", "Mexico City", "Miami", "Milan",
  "Monterrey", "Montreal", "Moscow", "Mumbai", "Munich", "Nagoya", "Nanjing", "Naples", "New York", "Odense",
  "Orlando", "Osaka", "Oslo", "Ottawa", "Paris", "Perth", "Philadelphia", "Phoenix", "Porto", "Porto Alegre",
  "Prague", "Quito", "Reykjavik", "Rio", "Rome", "Rotterdam", "Santiago", "Sao Paulo", "Sapporo", "Seattle",
  "Seoul", "Shanghai", "Shenzhen", "Singapore", "Sofia", "Stockholm", "Sydney", "Taipei", "Tallinn", "Tashkent",
  "Tbilisi", "Tel Aviv", "Tokyo", "Toronto", "Valencia", "Valletta", "Vancouver", "Vienna", "Vilnius", "Warsaw",
  "Washington", "Wellington", "Wroclaw", "Wuhan", "Xi'an", "Yokohama", "Zagreb"
];

const SCROLLBAR = "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#0f172a] [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-[#1e3a8a] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-[#2563eb]";

const STAR_TEAM_NAMES = new Set([
  'Vitality', 'FaZe', 'Natus Vincere', 'FUT', 'Falcons', 'G2', 'Spirit', 'MOUZ', 'FURIA', 'Astralis', 'The MongolZ', 'Aurora', 'PARIVISION', 'TYLOO', 'Liquid', 'Lynn Vision', 'BC.Game'
]);

const TEAM_LABELS = {
  TOP: 'TOP_TEAM',
  STRONG: 'STRONG_TEAM',
  STAR: 'STAR_TEAM'
};

const TEAM_LABEL_DISPLAY = {
  [TEAM_LABELS.TOP]: '\u9876\u7ea7\u6218\u961f',
  [TEAM_LABELS.STRONG]: '\u4e16\u754c\u5f3a\u961f',
  [TEAM_LABELS.STAR]: '\u660e\u661f\u6218\u961f'
};

const calculatePrize = (formatId, tierId) => Math.round((FORMATS[formatId]?.basePrize || 0) * (TOURNAMENT_TIERS[tierId]?.multiplier || 0));

const clamp = (v, minV, maxV) => Math.min(maxV, Math.max(minV, v));
const round2 = (v) => Math.round(v * 100) / 100;

const calculateGuessRatios = (teamA, teamB, vrsMap) => {
  const a = Math.max(1, Number(vrsMap?.[teamA?.id] || 1000));
  const b = Math.max(1, Number(vrsMap?.[teamB?.id] || 1000));
  const c = Math.min(1000, Math.min(a, b) - 1);
  const p = Math.max(1e-6, a - c);
  const q = Math.max(1e-6, b - c);
  const k = (2 * p * q) / Math.max(1e-6, p + q);
  const m = round2(1.5 - Math.log(p / k));
  const n = round2(1.5 - Math.log(q / k));
  const x = clamp(m, 1.0, 15.0);
  const y = clamp(n, 1.0, 15.0);
  return {
    ratioA: x,
    ratioB: y
  };
};

const buildTeamRankMap = (state) => {
  const ordered = [...state.teams].sort((a, b) => (state.vrsMap[b.id] || 0) - (state.vrsMap[a.id] || 0));
  const rankMap = {};
  ordered.forEach((team, index) => { rankMap[team.id] = index + 1; });
  return rankMap;
};

const getTeamIdentity = (team, rankMap) => {
  const rank = rankMap[team?.id] || 9999;
  return {
    rank,
    isTopTeam: rank <= 5,
    isStrongTeam: rank >= 6 && rank <= 20,
    isStarTeam: STAR_TEAM_NAMES.has(String(team?.name || ''))
  };
};

const calculateMatchHeat = (teamA, teamB, state, prize, r = 1) => {
  const vrsA = state.vrsMap[teamA.id] || 1000;
  const vrsB = state.vrsMap[teamB.id] || 1000;
  const d = (prize || 0) / 2000000;
  const g = vrsA * vrsB * d * d;

  const rankMap = buildTeamRankMap(state);
  const idA = getTeamIdentity(teamA, rankMap);
  const idB = getTeamIdentity(teamB, rankMap);

  let k = 1;
  const topCount = Number(idA.isTopTeam) + Number(idB.isTopTeam);
  const strongCount = Number(idA.isStrongTeam) + Number(idB.isStrongTeam);
  const starCount = Number(idA.isStarTeam) + Number(idB.isStarTeam);

  for (let i = 0; i < topCount; i++) k *= 6;
  for (let i = 0; i < strongCount; i++) k *= 2.5;
  for (let i = 0; i < starCount; i++) k *= 9.87;

  const heat = Math.round(Math.sqrt(g * k * (Number(r) > 0 ? Number(r) : 1)));
  return Math.max(0, heat);
};

const isValidYmd = (ymd) => {
  if (typeof ymd !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  return !Number.isNaN(Date.parse(`${ymd}T12:00:00Z`));
};

const addDays = (ymd, days) => {
  if (!isValidYmd(ymd)) return ymd;
  const d = new Date(`${ymd}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return ymd;
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const getTournamentFinalDate = (tour) => {
  const allDates = (tour.stages || [])
    .flatMap(st => (st.nodes || []).map(n => n.date))
    .filter(Boolean);
  if (allDates.length === 0) return tour.startDate || tour.invDate || '0000-00-00';
  return allDates.sort((a, b) => String(a).localeCompare(String(b))).at(-1);
};

const inferTournamentCity = (tour) => {
  if (tour.city) return String(tour.city);
  const n = String(tour.name || '');
  if (tour.formatId === 'MAJOR' && n.includes(' Major ')) return n.split(' Major ')[0].trim();
  if (tour.formatId === 'IEM' && n.startsWith('Intel Extreme Masters ')) {
    const rest = n.replace('Intel Extreme Masters ', '');
    const parts = rest.split(' ');
    if (parts.length >= 2) return parts.slice(0, -1).join(' ').trim();
  }
  if (tour.formatId === 'BLAST') {
    const m = n.match(/BLAST (?:Grand Final|Rivals|Open) (.+) \d{4}$/);
    if (m && m[1]) return m[1].trim();
  }
  return '';
};

const shuffleArray = (arr) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const pickMaps = (count) => {
  let available = [...MAP_POOL], picked = [];
  for(let i=0; i<count; i++) {
    let r = Math.random() * available.reduce((s, m) => s + m.weight, 0), cum = 0;
    for(let j=0; j<available.length; j++) {
      cum += available[j].weight;
      if(r <= cum) { picked.push(available[j].name); available.splice(j, 1); break; }
    }
  }
  return picked;
};

const playMatchEngine = (tA, tB, state, isBO5 = false) => {
  let vrsA = state.vrsMap[tA.id] || 1000, vrsB = state.vrsMap[tB.id] || 1000;
  const probA = vrsA / (vrsA + vrsB);
  let reqWins = isBO5 ? 3 : 2, mapsA = 0, mapsB = 0, details = [];
  const maps = pickMaps(isBO5 ? 5 : 3);

  for(let i=0; i<(isBO5 ? 5 : 3); i++) {
    let sA = 0, sB = 0, rHist = [], isOT = false, otCount = 0;
    while (true) {
      if (!isOT) {
        if (sA === 12 && sB === 12) { isOT = true; otCount = 1; }
        else if (sA === 13 || sB === 13) break;
        else { Math.random() < probA ? (sA++, rHist.push('A')) : (sB++, rHist.push('B')); }
      } else {
        let tgt = 12 + otCount * 3 + 1, tie = 12 + otCount * 3;
        if (sA === tie && sB === tie) otCount++;
        else if (sA === tgt || sB === tgt) break;
        else { Math.random() < probA ? (sA++, rHist.push('A')) : (sB++, rHist.push('B')); }
      }
    }
    details.push({ mapName: String(maps[i]), scoreA: sA, scoreB: sB, roundHistory: rHist });
    sA > sB ? mapsA++ : mapsB++;
    if (mapsA === reqWins || mapsB === reqWins) break;
  }

  const winner = mapsA > mapsB ? tA : tB, loser = mapsA > mapsB ? tB : tA;
  
  const dropA = isBO5 ? Math.floor(Math.random()*11)+10 : Math.floor(Math.random()*6)+5;
  const dropB = isBO5 ? Math.floor(Math.random()*11)+10 : Math.floor(Math.random()*6)+5;
  state.staminaMap[tA.id] = Math.max(0, (state.staminaMap[tA.id] || 100) - dropA);
  state.staminaMap[tB.id] = Math.max(0, (state.staminaMap[tB.id] || 100) - dropB);

  const expA = 1 / (1 + Math.pow(10, (vrsB - vrsA) / 400));
  const actA = winner.id === tA.id ? 1 : 0;
  let chgA = 40 * (actA - expA), chgB = 40 * ((1 - actA) - (1 - expA));
  chgA = Math.round(chgA + (1400 - vrsA)*0.005);
  chgB = Math.round(chgB + (1400 - vrsB)*0.005);
  
  state.vrsMap[tA.id] = Math.max(600, Math.min(2200, vrsA + chgA));
  state.vrsMap[tB.id] = Math.max(600, Math.min(2200, vrsB + chgB));

  return { tA, tB, scoreA: mapsA, scoreB: mapsB, winner, loser, details, chgA, chgB, change: Math.abs(chgA) };
};

const assignDatesNodes = (nodes, startDate, isPlayoff) => {
  let limit = isPlayoff ? 2 : 4;
  let cur = startDate;
  let dayCount = 0;
  nodes.forEach(n => {
     if (dayCount >= limit) { cur = addDays(cur, 1); dayCount = 0; }
     n.date = cur; dayCount++;
  });
  return dayCount > 0 ? addDays(cur, 1) : cur;
};

const createMatchNode = (id, name, group, isBO5, tag) => ({ id, name: String(name), groupName: String(group), tA: null, tB: null, winnerTo: null, loserTo: null, status: 'PENDING', isBO5, loserTag: tag ? String(tag) : null, date: null, details: [], heat: 0 });

const buildSwissStage = (name, teamCount, mIdStart, startDate) => {
  let rounds = [], nodes = [], mId = mIdStart;
  const groupsByRound = [
    [{ n: '0-0', c: teamCount/2 }],
    [{ n: '1-0', c: teamCount/4 }, { n: '0-1', c: teamCount/4 }],
    [{ n: '2-0', c: teamCount/8 }, { n: '1-1', c: teamCount/4 }, { n: '0-2', c: teamCount/8 }],
    [{ n: '2-1', c: 3 * (teamCount/16) }, { n: '1-2', c: 3 * (teamCount/16) }],
    [{ n: '2-2', c: 3 * (teamCount/16) }]
  ];
  groupsByRound.forEach((grps, idx) => {
    let groups = [];
    grps.forEach(g => {
      let matchIds = [];
      for(let i=0; i<Math.floor(g.c); i++) {
        let node = createMatchNode(`m_${mId++}`, `Round ${idx+1}`, g.n, false, null);
        nodes.push(node); matchIds.push(node.id);
      }
      if (matchIds.length > 0) groups.push({ name: String(g.n), matchIds });
    });
    if (groups.length > 0) rounds.push({ name: `Round ${idx+1}`, groups });
  });
  
  let cur = startDate, dayCount = 0, limit = 4;
  rounds.forEach(r => {
    r.groups.forEach(g => {
      g.matchIds.forEach(mId => {
        if (dayCount >= limit) { cur = addDays(cur, 1); dayCount = 0; }
        nodes.find(n=>n.id===mId).date = cur; dayCount++;
      });
    });
    if (dayCount > 0) { cur = addDays(cur, 1); dayCount = 0; }
  });

  return { type: 'SWISS', name: String(name), rounds, nodes, nextDate: cur, records: [], finalGroups: null, currentRound: 1, nextId: mId };
};

const buildSingleElim = (name, size, isHighest, mIdStart, startDate) => {
  let nodes = [], mId = mIdStart;
  let n = (nm, tag, bo5) => { let node = createMatchNode(`m_${mId++}`, nm, 'Bo3', bo5, tag); nodes.push(node); return node; };
  let rounds = [];
  if (size === 16) {
    let r16 = [], qf = [], sf = [];
    for(let i=0; i<8; i++) r16.push(n('Round of 16', '9th-16th', false));
    for(let i=0; i<4; i++) { let m=n('Quarterfinals', '5th-8th', false); qf.push(m); r16[i*2].winnerTo={id:m.id, slot:'tA'}; r16[i*2+1].winnerTo={id:m.id, slot:'tB'}; }
    for(let i=0; i<2; i++) { let m=n('Semifinals', '3rd-4th', false); sf.push(m); qf[i*2].winnerTo={id:m.id, slot:'tA'}; qf[i*2+1].winnerTo={id:m.id, slot:'tB'}; }
    let gf = n('Grand Final', '2nd', isHighest); sf[0].winnerTo={id:gf.id, slot:'tA'}; sf[1].winnerTo={id:gf.id, slot:'tB'};
    rounds = [{name:'Round of 16', groups:[{name:'Bo3', matchIds:r16.map(x=>x.id)}]}, {name:'Quarterfinals', groups:[{name:'Bo3', matchIds:qf.map(x=>x.id)}]}, {name:'Semifinals', groups:[{name:'Bo3', matchIds:sf.map(x=>x.id)}]}, {name:'Grand Final', groups:[{name:isHighest?'Bo5':'Bo3', matchIds:[gf.id]}]}];
  } else if (size === 8) {
    let qf = [], sf = [];
    for(let i=0; i<4; i++) qf.push(n('Quarterfinals', '5th-8th', false));
    for(let i=0; i<2; i++) { let m=n('Semifinals', '3rd-4th', false); sf.push(m); qf[i*2].winnerTo={id:m.id, slot:'tA'}; qf[i*2+1].winnerTo={id:m.id, slot:'tB'}; }
    let gf = n('Grand Final', '2nd', isHighest); sf[0].winnerTo={id:gf.id, slot:'tA'}; sf[1].winnerTo={id:gf.id, slot:'tB'};
    rounds = [{name:'Quarterfinals', groups:[{name:'Bo3', matchIds:qf.map(x=>x.id)}]}, {name:'Semifinals', groups:[{name:'Bo3', matchIds:sf.map(x=>x.id)}]}, {name:'Grand Final', groups:[{name:isHighest?'Bo5':'Bo3', matchIds:[gf.id]}]}];
  } else if (size === 6) {
    let qf = [n('Quarterfinals', '5th-6th', false), n('Quarterfinals', '5th-6th', false)];
    let sf = [n('Semifinals', '3rd-4th', false), n('Semifinals', '3rd-4th', false)];
    let gf = n('Grand Final', '2nd', isHighest);
    qf[0].winnerTo={id:sf[0].id, slot:'tB'}; qf[1].winnerTo={id:sf[1].id, slot:'tB'};
    sf[0].winnerTo={id:gf.id, slot:'tA'}; sf[1].winnerTo={id:gf.id, slot:'tB'};
    rounds = [{name:'Quarterfinals', groups:[{name:'Bo3', matchIds:qf.map(x=>x.id)}]}, {name:'Semifinals', groups:[{name:'Bo3', matchIds:sf.map(x=>x.id)}]}, {name:'Grand Final', groups:[{name:isHighest?'Bo5':'Bo3', matchIds:[gf.id]}]}];
  }
  
  let cur = startDate, dayCount = 0, limit = 2;
  rounds.forEach(r => {
    r.groups.forEach(g => {
      g.matchIds.forEach(mId => {
        if (dayCount >= limit) { cur = addDays(cur, 1); dayCount = 0; }
        nodes.find(x=>x.id===mId).date = cur; dayCount++;
      });
    });
    if (dayCount > 0) { cur = addDays(cur, 1); dayCount = 0; }
  });

  return { type: 'SINGLE_ELIM', name: String(name), rounds, nodes, nextDate: cur, isPlayoff: true, nextId: mId };
};

const buildIEMGroup = (prefix, mIdStart, startDate) => {
  let nodes = [], mId = mIdStart;
  let n = (nm, tag) => { let node = createMatchNode(`${prefix}_${mId++}`, nm, 'Bo3', false, tag); nodes.push(node); return node; };
  
  let u1=n('Upper R1'), u2=n('Upper R1'), u3=n('Upper R1'), u4=n('Upper R1');
  let u5=n('Upper SF'), u6=n('Upper SF'), u7=n('Upper Final');
  let l1=n('Lower R1','13th-16th'), l2=n('Lower R1','13th-16th');
  let l3=n('Lower R2','9th-12th'), l4=n('Lower R2','9th-12th');
  let l5=n('Lower Final','7th-8th');

  u1.winnerTo={id:u5.id, slot:'tA'}; u1.loserTo={id:l1.id, slot:'tA'}; 
  u2.winnerTo={id:u5.id, slot:'tB'}; u2.loserTo={id:l1.id, slot:'tB'};
  u3.winnerTo={id:u6.id, slot:'tA'}; u3.loserTo={id:l2.id, slot:'tA'}; 
  u4.winnerTo={id:u6.id, slot:'tB'}; u4.loserTo={id:l2.id, slot:'tB'};
  
  u5.winnerTo={id:u7.id, slot:'tA'}; u5.loserTo={id:l4.id, slot:'tA'}; 
  u6.winnerTo={id:u7.id, slot:'tB'}; u6.loserTo={id:l3.id, slot:'tA'};
  
  l1.winnerTo={id:l3.id, slot:'tB'}; l2.winnerTo={id:l4.id, slot:'tB'};
  l3.winnerTo={id:l5.id, slot:'tA'}; l4.winnerTo={id:l5.id, slot:'tB'};
  
  let upperRounds = [{ name: 'Opening round', matchIds: [u1.id, u2.id, u3.id, u4.id] }, { name: 'Upper semi-finals', matchIds: [u5.id, u6.id] }, { name: 'Upper final', matchIds: [u7.id] }];
  let lowerRounds = [{ name: 'Lower round 1', matchIds: [l1.id, l2.id] }, { name: 'Lower semi-finals', matchIds: [l3.id, l4.id] }, { name: 'Lower final', matchIds: [l5.id] }];
  
  let nextDate = assignDatesNodes(nodes, startDate, false);
  return { nodes, upperRounds, lowerRounds, nextId: mId, nextDate };
};

const buildBLASTBracket = (name, isHighest, mIdStart, startDate) => {
  let nodes = [], mId = mIdStart;
  let n = (nm, tag, bo5) => { let node = createMatchNode(`m_${mId++}`, nm, 'Bo3', !!bo5, tag); nodes.push(node); return node; };
  
  let u1=n('Upper R1'), u2=n('Upper R1'), u3=n('Upper R1'), u4=n('Upper R1');
  let u5=n('Upper SF'), u6=n('Upper SF'), u7=n('Upper Final');
  let l1=n('Lower R1','7th-8th'), l2=n('Lower R1','7th-8th');
  let l3=n('Lower R2','5th-6th'), l4=n('Lower R2','5th-6th');
  let l5=n('Lower SF','4th'), l6=n('Lower Final','3rd');
  let gf=n('Grand Final','2nd', isHighest);

  u1.winnerTo={id:u5.id, slot:'tA'}; u1.loserTo={id:l1.id, slot:'tA'}; u2.winnerTo={id:u5.id, slot:'tB'}; u2.loserTo={id:l1.id, slot:'tB'};
  u3.winnerTo={id:u6.id, slot:'tA'}; u3.loserTo={id:l2.id, slot:'tA'}; u4.winnerTo={id:u6.id, slot:'tB'}; u4.loserTo={id:l2.id, slot:'tB'};
  u5.winnerTo={id:u7.id, slot:'tA'}; u5.loserTo={id:l4.id, slot:'tA'}; u6.winnerTo={id:u7.id, slot:'tB'}; u6.loserTo={id:l3.id, slot:'tA'};
  l1.winnerTo={id:l3.id, slot:'tB'}; l2.winnerTo={id:l4.id, slot:'tB'};
  l3.winnerTo={id:l5.id, slot:'tA'}; l4.winnerTo={id:l5.id, slot:'tB'};
  l5.winnerTo={id:l6.id, slot:'tA'}; u7.loserTo={id:l6.id, slot:'tB'};
  u7.winnerTo={id:gf.id, slot:'tA'}; l6.winnerTo={id:gf.id, slot:'tB'};
  
  let upperRounds = [{ name: 'Opening round', matchIds: [u1.id, u2.id, u3.id, u4.id] }, { name: 'Upper semi-finals', matchIds: [u5.id, u6.id] }, { name: 'Upper final', matchIds: [u7.id] }];
  let lowerRounds = [{ name: 'Lower round 1', matchIds: [l1.id, l2.id] }, { name: 'Lower semi-finals', matchIds: [l3.id, l4.id] }, { name: 'Lower SF', matchIds: [l5.id] }, { name: 'Consolidation', matchIds: [l6.id] }];
  let gfRounds = [{ name: 'Grand Final', matchIds: [gf.id] }];
  
  let nextDate = assignDatesNodes(nodes, startDate, true);
  return { type: 'BLAST_BRACKET', name: String(name), nodes, upperRounds, lowerRounds, gfRounds, nextDate, isPlayoff: true, nextId: mId };
};

const buildStagesForTournament = (tour) => {
  let curDate = tour.startDate, sId = 1000;
  if(tour.formatId === 'EWC') {
    return [buildSingleElim('Playoffs', 16, tour.tierId==='HIGHEST', sId, curDate)];
  } else if (tour.formatId === 'MAJOR') {
    let st1 = buildSwissStage('Stage 1', 16, sId, curDate); curDate = addDays(st1.nextDate, TOURNAMENT_TIERS[tour.tierId].rest); sId = st1.nextId;
    let st2 = buildSwissStage('Stage 2', 16, sId, curDate); curDate = addDays(st2.nextDate, TOURNAMENT_TIERS[tour.tierId].rest); sId = st2.nextId;
    let st3 = buildSwissStage('Stage 3', 16, sId, curDate); curDate = addDays(st3.nextDate, TOURNAMENT_TIERS[tour.tierId].rest); sId = st3.nextId;
    let po = buildSingleElim('Playoffs', 8, tour.tierId==='HIGHEST', sId, curDate);
    return [st1, st2, st3, po];
  } else if (tour.formatId === 'EPL') {
    let st1 = buildSwissStage('Stage 1', 16, sId, curDate); curDate = addDays(st1.nextDate, TOURNAMENT_TIERS[tour.tierId].rest); sId = st1.nextId;
    let st2 = buildSwissStage('Stage 2', 16, sId, curDate); curDate = addDays(st2.nextDate, TOURNAMENT_TIERS[tour.tierId].rest); sId = st2.nextId;
    let po = buildSingleElim('Playoffs', 8, tour.tierId==='HIGHEST', sId, curDate);
    return [st1, st2, po];
  } else if (tour.formatId === 'IEM') {
    let grA = buildIEMGroup('GrA', sId, curDate); sId = grA.nextId;
    let grB = buildIEMGroup('GrB', sId, curDate); sId = grB.nextId;
    let nextDate = grB.nextDate;
    let allNodes = [...grA.nodes, ...grB.nodes];
    let combGrp = { type: 'IEM_GROUPS', name: 'Group Stage', nodes: allNodes, nextDate, groups: [{name:'Group A', upperRounds: grA.upperRounds, lowerRounds: grA.lowerRounds}, {name:'Group B', upperRounds: grB.upperRounds, lowerRounds: grB.lowerRounds}] };
    let po = buildSingleElim('Playoffs', 6, tour.tierId==='HIGHEST', sId, addDays(nextDate, TOURNAMENT_TIERS[tour.tierId].rest));
    return [combGrp, po];
  } else if (tour.formatId === 'BLAST') {
    return [buildBLASTBracket('Blast Finals', tour.tierId==='HIGHEST', sId, curDate)];
  }
  return [];
};

const doInvitationAndInit = (tour, state) => {
  const invitedStageLabel = { stage3: 'Stage 3 Direct', stage2: 'Stage 2 Direct', stage1: 'Stage 1' };
  const stageOrder = ['stage3', 'stage2', 'stage1'];
  const bannedTop = TOURNAMENT_TIERS[tour.tierId].banTop;
  const sortedPool = [...state.teams].sort((a,b) => (state.vrsMap[b.id]||1000) - (state.vrsMap[a.id]||1000)).slice(bannedTop);

  if (!tour.stages || tour.stages.length === 0) {
    tour.stages = buildStagesForTournament(tour);
  }

  if (tour.formatId === 'MAJOR') {
    const slots = normalizeMajorSlots(tour.majorSlots || state.majorSlots);
    tour.majorSlots = slots;
    const byRegion = {
      EU: sortedPool.filter(t => t.region === 'EU'),
      AM: sortedPool.filter(t => t.region === 'AM'),
      AS: sortedPool.filter(t => t.region === 'AS')
    };
    const majorDirect = { stage3: [], stage2: [], stage1: [] };
    const selectedIds = new Set();

    REGION_ORDER.forEach(region => {
      let candidates = [...byRegion[region]];
      let declined = [];
      const pickOne = () => {
        while (candidates.length > 0) {
          const team = candidates.shift();
          if (selectedIds.has(team.id)) continue;
          if (Math.random() < ((state.staminaMap[team.id]||100)/100)) return team;
          declined.push(team);
        }
        while (declined.length > 0) {
          const fallback = declined.shift();
          if (!selectedIds.has(fallback.id)) return fallback;
        }
        return null;
      };

      stageOrder.forEach(stageKey => {
        const need = slots[stageKey][region] || 0;
        for (let i = 0; i < need; i++) {
          const picked = pickOne();
          if (!picked) continue;
          selectedIds.add(picked.id);
          majorDirect[stageKey].push({ ...picked, invitedStage: invitedStageLabel[stageKey] });
        }
      });
    });

    if (selectedIds.size < tour.size) {
      sortedPool.forEach(t => {
        if (selectedIds.size >= tour.size) return;
        if (selectedIds.has(t.id)) return;
        selectedIds.add(t.id);
        majorDirect.stage1.push({ ...t, invitedStage: invitedStageLabel.stage1 });
      });
    }

    stageOrder.forEach(stageKey => {
      majorDirect[stageKey] = majorDirect[stageKey]
        .sort((a,b)=>(state.vrsMap[b.id]||1000)-(state.vrsMap[a.id]||1000))
        .map((t, i) => ({ ...t, stageSeed: i + 1 }));
    });

    const merged = [...majorDirect.stage3, ...majorDirect.stage2, ...majorDirect.stage1].slice(0, tour.size);
    tour.majorDirect = {
      stage3: [...majorDirect.stage3],
      stage2: [...majorDirect.stage2],
      stage1: [...majorDirect.stage1].slice(0, 16)
    };
    tour.participants = merged.map((t, i) => ({ ...t, seed: i + 1 }));
  } else {
    let accepted = [], rejected = [];
    for(let t of sortedPool) {
      if(accepted.length >= tour.size) break;
      Math.random() < ((state.staminaMap[t.id]||100)/100) ? accepted.push(t) : rejected.push(t);
    }
    if(accepted.length < tour.size) accepted.push(...rejected.slice(0, tour.size - accepted.length));
    const ordered = accepted
      .sort((a,b)=>(state.vrsMap[b.id]||1000)-(state.vrsMap[a.id]||1000))
      .map((t,i)=>({ ...t, seed: i+1 }));
    if (tour.formatId === 'EPL') {
      tour.participants = ordered.map((t, i) => {
        const stageLabel = i < 8 ? 'Stage 2 Direct' : 'Stage 1';
        const stageSeed = i < 8 ? i + 1 : i - 7;
        return { ...t, invitedStage: stageLabel, stageSeed };
      });
    } else {
      tour.participants = ordered;
    }
  }

  tour.initialVrs = {};
  tour.participants.forEach(t => { tour.initialVrs[t.id] = state.vrsMap[t.id] || 1000; });

  let stg0 = tour.stages[0];
  let firstPool = tour.participants;
  if(tour.formatId === 'MAJOR') firstPool = [...(tour.majorDirect?.stage1 || [])];
  else if (tour.formatId === 'EPL') firstPool = tour.participants.slice(8,24);

  if (stg0.type === 'SWISS') {
    const swissPool = shuffleArray(firstPool);
    let g00 = stg0.rounds[0].groups[0].matchIds;
    for(let i=0; i<swissPool.length-1; i+=2) {
      let m = stg0.nodes.find(n=>n.id===g00[i/2]);
      if(m) { m.tA={...swissPool[i]}; m.tB={...swissPool[i+1]}; }
    }
    stg0.records = firstPool.map((t, idx) => ({ team: t, seed: t.seed || idx + 1, w: 0, l: 0 }));
  }
  else if (stg0.type === 'SINGLE_ELIM') {
    let startMatches = stg0.rounds[0].groups[0].matchIds;
    for(let i=0; i<startMatches.length; i++) {
      let m = stg0.nodes.find(n=>n.id===startMatches[i]);
      if(m) { m.tA={...firstPool[i*2]}; m.tB={...firstPool[i*2+1]}; }
    }
  }
  else if (stg0.type === 'IEM_GROUPS') {
    let t = firstPool;
    const fill = (prefix, nm, tA_idx, tB_idx) => {
      let mList = stg0.nodes.filter(n=>n.id.startsWith(prefix) && n.name===nm);
      let target = mList.find(x => !x.tA);
      if(target) { target.tA={...t[tA_idx]}; target.tB={...t[tB_idx]}; }
    };
    fill('GrA','Upper R1',0,7); fill('GrA','Upper R1',3,4); fill('GrA','Upper R1',1,6); fill('GrA','Upper R1',2,5);
    fill('GrB','Upper R1',8,15); fill('GrB','Upper R1',11,12); fill('GrB','Upper R1',9,14); fill('GrB','Upper R1',10,13);
  }
  else if (stg0.type === 'BLAST_BRACKET') {
    let t = firstPool;
    let uR1 = stg0.nodes.filter(n=>n.name==='Upper R1');
    if(uR1[0]) { uR1[0].tA={...t[0]}; uR1[0].tB={...t[7]}; }
    if(uR1[1]) { uR1[1].tA={...t[3]}; uR1[1].tB={...t[4]}; }
    if(uR1[2]) { uR1[2].tA={...t[1]}; uR1[2].tB={...t[6]}; }
    if(uR1[3]) { uR1[3].tA={...t[2]}; uR1[3].tB={...t[5]}; }
  }

  tour.status = 'WAITING';
  tour.vrsDeltaMap = tour.vrsDeltaMap || {};
};

const finishTournament = (tour, state) => {
  tour.status = 'COMPLETED';
  tour.totalHeat = tour.totalHeat || 0;
  const validPrize = tour.prize || 0;
  let totalW = tour.placements.reduce((sum, p) => sum + (PLACEMENT_WEIGHTS[p.tag] || 0), 0) || 1;
  
  tour.standings = tour.placements.map(p => ({
    placement: String(p.tag), team: p.team, 
    prize: Math.round(validPrize * ((PLACEMENT_WEIGHTS[p.tag] || 0) / totalW)),
    vrsBefore: tour.initialVrs?.[p.team.id] ?? p.vrsBefore ?? 1000, 
    vrsAfter: state.vrsMap[p.team.id] || 1000,
    deltaVrs: (tour.vrsDeltaMap && Number.isFinite(tour.vrsDeltaMap[p.team.id])) ? tour.vrsDeltaMap[p.team.id] : ((state.vrsMap[p.team.id] || 1000) - (tour.initialVrs?.[p.team.id] ?? p.vrsBefore ?? 1000))
  })).sort((a, b) => {
     const diff = (PLACEMENT_WEIGHTS[b.placement] || 0) - (PLACEMENT_WEIGHTS[a.placement] || 0);
     if (diff !== 0) return diff;
     return b.vrsAfter - a.vrsAfter;
  });

  tour.champion = tour.standings.find(s=>s.placement==='1st')?.team;

  if (tour.formatId === 'MAJOR') {
    const ordered = [...tour.standings];
    const top8 = ordered.slice(0, 8);
    const next8 = ordered.slice(8, 16);
    const nextSlots = createDefaultMajorSlots();
    nextSlots.stage3 = { EU: 0, AM: 0, AS: 0 };
    nextSlots.stage2 = { EU: 0, AM: 0, AS: 0 };
    top8.forEach(x => {
      const r = x.team?.region;
      if (REGION_ORDER.includes(r)) nextSlots.stage3[r]++;
    });
    next8.forEach(x => {
      const r = x.team?.region;
      if (REGION_ORDER.includes(r)) nextSlots.stage2[r]++;
    });
    state.majorSlots = normalizeMajorSlots(nextSlots);
  }

  tour.standings.forEach(s => {
    let globalT = state.teams.find(t=>t.id===s.team.id);
    if(globalT) {
      globalT.prizeTotal = (globalT.prizeTotal || 0) + s.prize;
      globalT.honors = [...(globalT.honors || [])];
      if (s.placement === '1st' || (s.placement === '2nd' && ['HIGHEST', 'TIER_S'].includes(tour.tierId))) {
        globalT.honors.unshift({ tourId: tour.id, name: String(tour.name), date: String(tour.startDate), prize: s.prize, tier: String(tour.tierId), placement: String(s.placement) });
      }
    }
  });

  for(let id in state.staminaMap) {
    state.staminaMap[id] = Math.min(100, (state.staminaMap[id]||100) + Math.floor(Math.random()*21)+10);
  }

  state.funds = (state.funds || 0) + Math.round(tour.totalHeat || 0);
};

const getSwissElimTag = (b, w) => {
  if (b === 24) return w === 2 ? "25th-27th" : w === 1 ? "28th-30th" : "31st-32nd";
  if (b === 16) return w === 2 ? "17th-19th" : w === 1 ? "20th-22nd" : "23rd-24th";
  if (b === 8)  return w === 2 ? "9th-11th" : w === 1 ? "12th-14th" : "15th-16th";
  return "Unknown";
};

const playMatchEngineInstance = (m, state, tourPrize) => {
  const getHeatRoundMultiplier = (match) => {
    const name = String(match?.name || '').toLowerCase();
    if (name.includes('quarterfinal')) return 2;
    if (name.includes('semifinal') || name.includes('semi-final') || name.includes('semi final') || name.includes('upper sf') || name.includes('lower sf')) return 5;
    if (name.includes('final')) return 20;
    return 1;
  };
  const r = getHeatRoundMultiplier(m);
  m.heat = calculateMatchHeat(m.tA, m.tB, state, tourPrize, r);
  let res = playMatchEngine(m.tA, m.tB, state, m.isBO5);
  Object.assign(m, res); m.status = 'PLAYED';
  return m;
};

const processDayTick = (tour, state, dateStr) => {
  if (tour.status !== 'ACTIVE') return;
  if (tour.rest > 0) { tour.rest--; return; }
  
  let stg = tour.stages[tour.currentStageIdx];
  // Catch up any overdue pending matches to avoid stuck tournaments when date passes a scheduled day.
  let unplayedToday = stg.nodes.filter(m => m.status === 'PENDING' && m.date && m.date <= dateStr && m.tA && m.tB);
  
  unplayedToday.forEach(m => {
    playMatchEngineInstance(m, state, tour.prize || 0);
    tour.totalHeat = (tour.totalHeat || 0) + (m.heat || 0);
    tour.vrsDeltaMap = tour.vrsDeltaMap || {};
    tour.vrsDeltaMap[m.tA.id] = (tour.vrsDeltaMap[m.tA.id] || 0) + (m.chgA || 0);
    tour.vrsDeltaMap[m.tB.id] = (tour.vrsDeltaMap[m.tB.id] || 0) + (m.chgB || 0);
    
    if (stg.type === 'SWISS') {
      let rA = stg.records.find(r=>r.team.id === m.tA.id);
      let rB = stg.records.find(r=>r.team.id === m.tB.id);
      if(rA) rA[m.winner.id===m.tA.id?'w':'l']++;
      if(rB) rB[m.winner.id===m.tB.id?'w':'l']++;
    } else {
      if (m.winnerTo) { let tn = stg.nodes.find(n=>n.id===m.winnerTo.id); if(tn) { tn[m.winnerTo.slot] = {...m.winner}; } }
      if (m.loserTo) { let tn = stg.nodes.find(n=>n.id===m.loserTo.id); if(tn) { tn[m.loserTo.slot] = {...m.loser}; } }
      if (!m.winnerTo && !m.loserTo) { tour.placements.push({ team: m.winner, tag: '1st', vrsBefore: state.vrsMap[m.winner.id] || 1000 }); }
      if (m.loserTag) { tour.placements.push({ team: m.loser, tag: m.loserTag, vrsBefore: state.vrsMap[m.loser.id] || 1000 }); }
    }

    if (m.prediction && !m.prediction.settled) {
      const success = m.prediction.pickTeamId === m.winner?.id;
      const payout = success ? Math.round((m.prediction.amount || 0) * (m.prediction.chosenOdds || 0)) : 0;
      state.funds = (state.funds || 0) + payout;
      m.prediction = { ...m.prediction, settled: true, success, payout, settleDate: dateStr, winnerName: m.winner?.name || '' };
      if (!Array.isArray(state.guessHistory)) state.guessHistory = [];
      state.guessHistory = state.guessHistory.map(item => {
        if (item.id !== m.prediction.guessId) return item;
        return { ...item, status: 'SETTLED', success, payout, settleDate: dateStr, winnerName: m.winner?.name || '' };
      });
    }
    
    if(!state.matchLog[dateStr]) state.matchLog[dateStr] = []; 
    state.matchLog[dateStr].push({ tourId: tour.id, tourName: String(tour.name), ...m });
  });

  if (stg.type === 'SWISS') {
    let pendingInRound = stg.nodes.filter(m => m.status === 'PENDING' && m.name === `Round ${stg.currentRound}`);
    if (pendingInRound.length === 0 && stg.currentRound < 5 && !stg.records.every(r=>r.w===3||r.l===3)) {
      let groups = {};
      stg.records.filter(r=>r.w<3 && r.l<3).forEach(r => { let k = `${r.w}-${r.l}`; if(!groups[k]) groups[k]=[]; groups[k].push(r); });
      let nextRnd = stg.rounds[stg.currentRound];
      Object.keys(groups).forEach(k => {
        let p = shuffleArray(groups[k]);
        let tgtGrp = nextRnd.groups.find(g=>g.name===k);
        if (tgtGrp) {
          for(let i=0; i<p.length-1; i+=2) {
            let m = stg.nodes.find(n=>n.id===tgtGrp.matchIds[i/2]);
            if (m) { m.tA = {...p[i].team, seed: p[i].seed}; m.tB = {...p[i+1].team, seed: p[i+1].seed}; }
          }
        }
      });
      stg.currentRound++;
    }
  }

  if (stg.nodes.every(m => m.status === 'PLAYED')) {
    if (stg.type === 'SWISS') {
      stg.finalGroups = { "3-0": [], "3-1": [], "3-2": [], "2-3": [], "1-3": [], "0-3": [] };
      stg.records.forEach(r => stg.finalGroups[`${r.w}-${r.l}`].push(r));
      
      let b = 0;
      if(tour.formatId === 'MAJOR' && tour.currentStageIdx === 0) b = 24;
      if(tour.formatId === 'MAJOR' && tour.currentStageIdx === 1) b = 16;
      if(tour.formatId === 'MAJOR' && tour.currentStageIdx === 2) b = 8;
      if(tour.formatId === 'EPL' && tour.currentStageIdx === 0) b = 16;
      if(tour.formatId === 'EPL' && tour.currentStageIdx === 1) b = 8;
      
      stg.records.filter(r=>r.l===3).forEach(r => {
          let tag = getSwissElimTag(b, r.w);
          tour.placements.push({ team: r.team, tag, vrsBefore: state.vrsMap[r.team.id] || 1000 });
      });
      tour.advancedPool = stg.records.filter(r=>r.w===3).map(r=>r.team);
    }
    else if (stg.type === 'IEM_GROUPS') {
      let getW = (prefix, nm) => stg.nodes.find(m=>m.id.startsWith(prefix) && m.name===nm)?.winner;
      let getL = (prefix, nm) => stg.nodes.find(m=>m.id.startsWith(prefix) && m.name===nm)?.loser;
      tour.advancedPool = [ 
         getW('GrA','Upper Final'), getW('GrB','Lower Final'), 
         getL('GrA','Upper Final'), getL('GrB','Upper Final'), 
         getW('GrB','Upper Final'), getW('GrA','Lower Final') 
      ].filter(Boolean);
    }
    
    if (tour.currentStageIdx === tour.stages.length - 1) {
      finishTournament(tour, state);
    } else {
      tour.currentStageIdx++;
      tour.rest = TOURNAMENT_TIERS[tour.tierId].rest;
      
      let nextStg = tour.stages[tour.currentStageIdx];
      let pool = tour.advancedPool;
      if(tour.formatId === 'MAJOR' && tour.currentStageIdx === 1) pool = [...(tour.majorDirect?.stage2 || []), ...pool];
      if(tour.formatId === 'MAJOR' && tour.currentStageIdx === 2) pool = [...(tour.majorDirect?.stage3 || []), ...pool];
      if(tour.formatId === 'EPL' && tour.currentStageIdx === 1) pool = [...tour.participants.slice(0,8), ...pool];
      
      pool = pool.sort((a,b)=>(state.vrsMap[b.id]||1000)-(state.vrsMap[a.id]||1000)).map((t,i)=>({...t, seed: i+1}));
      
      if (nextStg.type === 'SWISS') {
        const drawPool = shuffleArray(pool);
        let g00 = nextStg.rounds[0].groups[0].matchIds;
        for(let i=0; i<drawPool.length-1; i+=2) {
          let m = nextStg.nodes.find(n=>n.id===g00[i/2]);
          if(m) { m.tA={...drawPool[i]}; m.tB={...drawPool[i+1]}; }
        }
        nextStg.records = pool.map(t => ({ team: t, seed: t.seed, w: 0, l: 0 }));
      }
      else if (nextStg.type === 'SINGLE_ELIM') {
        let startMatches = nextStg.rounds[0].groups[0].matchIds;
        if(pool.length === 16 || pool.length === 8) {
          for(let i=0; i<startMatches.length; i++) { 
            let m = nextStg.nodes.find(n=>n.id===startMatches[i]);
            if(m) { m.tA={...pool[i*2]}; m.tB={...pool[i*2+1]}; }
          }
        } else if (pool.length === 6) {
          let sMatches = nextStg.rounds[0].groups[0].matchIds.map(id => nextStg.nodes.find(n=>n.id===id));
          if(sMatches[0]) { sMatches[0].tA = {...pool[0]}; sMatches[0].tB = {...pool[1]}; }
          if(sMatches[1]) { sMatches[1].tA = {...pool[2]}; sMatches[1].tB = {...pool[3]}; }
          let sfMatches = nextStg.rounds[1].groups[0].matchIds.map(id => nextStg.nodes.find(n=>n.id===id));
          if(sfMatches[0]) { sfMatches[0].tA = {...pool[4]}; }
          if(sfMatches[1]) { sfMatches[1].tA = {...pool[5]}; }
        }
      }
    }
  }
};


// --- UI Components ---
const RoundHistoryBar = ({ history, tA, tB }) => {
  if (!history || history.length === 0) return null;
  const half1 = history.slice(0, 12), half2 = history.slice(12, 24), ot = history.slice(24);

  const renderRow = (target, halfData) => (
    <div className="flex gap-0.5 px-2 h-6 items-center border-b border-[#2d3540] last:border-0 min-w-max">
       {halfData.map((winner, i) => (
         <div key={i} className="w-3.5 flex justify-center items-center">
            {winner === target ? (
              target === 'A' ? <span className="text-[#38bdf8] text-xs">*</span> : <span className="text-[#fbbf24] text-xs">*</span>
            ) : <span className="w-3.5"/>}
         </div>
       ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-1 mt-1 font-sans">
      <div className="flex text-[9px] text-slate-500 uppercase font-bold tracking-widest pl-1 mb-1">Round History</div>
      <div className={`flex bg-[#14191f] border border-[#2d3540] rounded overflow-hidden w-full overflow-x-auto ${SCROLLBAR}`}>
        <div className="flex flex-col border-r border-[#2d3540] bg-[#1b2129] w-10 flex-shrink-0 sticky left-0 z-10">
          <div className="h-6 flex items-center justify-center text-[8px] font-bold text-[#38bdf8] border-b border-[#2d3540] truncate px-1"><Shield size={10} className="mr-1 opacity-60"/>{tA?.name?.substring(0,3) || 'TBD'}</div>
          <div className="h-6 flex items-center justify-center text-[8px] font-bold text-[#fbbf24] truncate px-1"><Shield size={10} className="mr-1 opacity-60"/>{tB?.name?.substring(0,3) || 'TBD'}</div>
        </div>
        <div className="flex flex-col border-r border-[#2d3540]">{renderRow('A', half1)}{renderRow('B', half1)}</div>
        {half2.length > 0 && <div className="flex flex-col border-r border-[#2d3540]">{renderRow('A', half2)}{renderRow('B', half2)}</div>}
      </div>

      {ot.length > 0 && (
        <div className="mt-2">
          <div className="flex text-[9px] text-slate-500 uppercase font-bold tracking-widest pl-1 mb-1">Overtime</div>
          <div className={`flex bg-[#14191f] border border-[#2d3540] rounded overflow-hidden w-full overflow-x-auto ${SCROLLBAR}`}>
            <div className="flex flex-col border-r border-[#2d3540] bg-[#1b2129] w-10 flex-shrink-0 sticky left-0 z-10">
              <div className="h-6 flex items-center justify-center text-[8px] font-bold text-[#38bdf8] border-b border-[#2d3540] truncate px-1"><Shield size={10} className="mr-1 opacity-60"/>{tA?.name?.substring(0,3) || 'TBD'}</div>
              <div className="h-6 flex items-center justify-center text-[8px] font-bold text-[#fbbf24] truncate px-1"><Shield size={10} className="mr-1 opacity-60"/>{tB?.name?.substring(0,3) || 'TBD'}</div>
            </div>
            <div className="flex flex-col">{renderRow('A', ot)}{renderRow('B', ot)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const UnifiedMatchNode = ({ m }) => {
  const [open, setOpen] = useState(false);
  if (!m) return null;
  const isPlayed = m.status === 'PLAYED';
  const isAWin = isPlayed && m.winner?.id === m.tA?.id;
  const isBWin = isPlayed && m.winner?.id === m.tB?.id;

  const getTextA = () => {
    if (!isPlayed) return 'text-slate-300 calendar-team-white';
    return isAWin ? 'text-green-400' : 'text-red-500 opacity-80';
  };
  const getTextB = () => {
    if (!isPlayed) return 'text-slate-300 calendar-team-white';
    return isBWin ? 'text-green-400' : 'text-red-500 opacity-80';
  };
  const getBgA = () => {
    if (!isPlayed) return '';
    return isAWin ? 'bg-green-900/20' : 'bg-red-950/30';
  };
  const getBgB = () => {
    if (!isPlayed) return '';
    return isBWin ? 'bg-green-900/20' : 'bg-red-950/30';
  };

  return (
    <div className="bg-[#121926] border border-[#1e293b] rounded-xl overflow-hidden flex flex-col min-w-[240px] shadow-lg mb-4 font-sans relative">
       <div className="flex flex-col relative pt-1">
          <div className="absolute right-3 top-2 text-[9px] text-[#475569] font-mono tracking-wider z-10 bg-[#121926] px-1 rounded">{m.date || 'TBD'}</div>
          <div className={`flex items-center justify-between px-3 py-2 mt-5 border-b border-[#1e293b] transition-colors ${getBgA()}`}>
             <div className="flex items-center gap-2">
                 {isAWin ? <Check size={12} className="text-green-400" /> : <span className="w-3" />}
                 <span className="text-[#475569] font-mono text-[10px] w-4 text-right inline-block">{m.tA?.seed || '-'}</span>
                 <span className={`font-bold text-sm truncate w-[130px] ${getTextA()}`}>{m.tA ? m.tA.name : 'TBD'}</span>
             </div>
             <div className={`font-mono font-bold text-sm ${getTextA()}`}>{isPlayed ? (m.scoreA ?? '-') : (m.isBO5 ? 'BO5' : 'BO3')}</div>
          </div>
          <div className={`flex items-center justify-between px-3 py-2 transition-colors ${getBgB()}`}>
             <div className="flex items-center gap-2">
                 {isBWin ? <Check size={12} className="text-green-400" /> : <span className="w-3" />}
                 <span className="text-[#475569] font-mono text-[10px] w-4 text-right inline-block">{m.tB?.seed || '-'}</span>
                 <span className={`font-bold text-sm truncate w-[130px] ${getTextB()}`}>{m.tB ? m.tB.name : 'TBD'}</span>
             </div>
             <div className={`font-mono font-bold text-sm ${getTextB()}`}>{isPlayed ? (m.scoreB ?? '-') : '-'}</div>
          </div>
       </div>
       <div className="bg-[#0b101a] border-t border-[#1e293b] flex flex-col">
          <button onClick={() => setOpen(!open)} className="w-full py-1.5 flex justify-center items-center gap-1 text-[#475569] hover:text-slate-300 transition-colors">
             {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            <span className="text-[9px]">灞曞紑璇︽儏</span>
          </button>
          {isPlayed && (
            <div className="px-3 py-1.5 border-t border-[#1e293b]/70 text-[10px] flex justify-between items-center">
              <span className="text-slate-500 font-bold tracking-wider uppercase">Heat</span>
              <span className="text-orange-400 font-mono font-black">{Math.round(m.heat || 0).toLocaleString()}</span>
            </div>
          )}
          {open && m.details && m.details.length > 0 && (
             <div className="p-2 pt-0 space-y-2 mt-1 border-t border-[#1e293b]/50">
                {m.details.map((d, idx) => (
                  <div key={idx} className="flex flex-col bg-[#0f172a] p-2 rounded border border-[#1e3a8a]/30">
                    <div className="flex justify-between text-xs items-center mb-1">
                      <span className="text-slate-400 font-bold tracking-wide">{d.mapName}</span>
                      <div className="flex-1 flex justify-end items-center gap-2 font-mono">
                        <span className={d.scoreA > d.scoreB ? 'text-white font-bold' : 'text-[#475569]'}>{d.scoreA}</span>
                        <span className="text-slate-700">-</span>
                        <span className={d.scoreB > d.scoreA ? 'text-white font-bold' : 'text-[#475569]'}>{d.scoreB}</span>
                      </div>
                    </div>
                    <RoundHistoryBar history={d.roundHistory || []} tA={m.tA} tB={m.tB} />
                  </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
};

const IEMDoubleElimViewer = ({ stage }) => {
  const isBlast = stage.type === 'BLAST_BRACKET';
  if (!isBlast && stage.groups) {
    return (
      <div className="flex flex-col gap-12">
        {stage.groups.map((gr, idx) => (
          <div key={idx} className={`bg-[#1b2129] p-6 rounded-xl border border-slate-800 text-slate-300 font-sans overflow-x-auto ${SCROLLBAR}`}>
            <h2 className="text-xl font-bold text-white mb-6 tracking-widest">{gr.name}</h2>
            <div className="flex gap-12">
              <div className="flex flex-col gap-12">
                <div>
                  <h3 className="font-bold text-slate-400 mb-4 uppercase text-xs tracking-widest">Upper Bracket</h3>
                  <div className="flex gap-8">
                    {gr.upperRounds?.map((r, i) => (
                      <div key={i} className="flex flex-col justify-around min-w-[260px]">
                        <h4 className="text-center text-slate-500 font-semibold text-[10px] mb-3 uppercase tracking-wider">{r.name}</h4>
                        <div className="flex flex-col gap-4 justify-center flex-1">
                          {r.matchIds.map((mId, idx2) => {
                             let m = stage.nodes.find(n=>n.id===mId);
                             return m ? <UnifiedMatchNode key={idx2} m={m} /> : null;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-400 mb-4 uppercase text-xs tracking-widest border-t border-slate-800 pt-6">Lower Bracket</h3>
                  <div className="flex gap-8">
                    {gr.lowerRounds?.map((r, i) => (
                      <div key={i} className="flex flex-col justify-around min-w-[260px]">
                        <h4 className="text-center text-slate-500 font-semibold text-[10px] mb-3 uppercase tracking-wider">{r.name}</h4>
                        <div className="flex flex-col gap-4 justify-center flex-1">
                          {r.matchIds.map((mId, idx2) => {
                             let m = stage.nodes.find(n=>n.id===mId);
                             return m ? <UnifiedMatchNode key={idx2} m={m} /> : null;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={`bg-[#1b2129] p-6 rounded-xl border border-slate-800 text-slate-300 font-sans overflow-x-auto ${SCROLLBAR}`}>
      <div className="flex gap-12">
        <div className="flex flex-col gap-12">
          <div>
            <h3 className="font-bold text-slate-400 mb-4 uppercase text-xs tracking-widest">Upper Bracket</h3>
            <div className="flex gap-8">
              {stage.upperRounds?.map((r, i) => (
                <div key={i} className="flex flex-col justify-around min-w-[260px]">
                  <h4 className="text-center text-slate-500 font-semibold text-[10px] mb-3 uppercase tracking-wider">{r.name}</h4>
                  <div className="flex flex-col gap-4 justify-center flex-1">
                    {r.matchIds.map((mId, idx) => {
                       let m = stage.nodes.find(n=>n.id===mId);
                       return m ? <UnifiedMatchNode key={idx} m={m} /> : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-400 mb-4 uppercase text-xs tracking-widest border-t border-slate-800 pt-6">Lower Bracket</h3>
            <div className="flex gap-8">
              {stage.lowerRounds?.map((r, i) => (
                <div key={i} className="flex flex-col justify-around min-w-[260px]">
                  <h4 className="text-center text-slate-500 font-semibold text-[10px] mb-3 uppercase tracking-wider">{r.name}</h4>
                  <div className="flex flex-col gap-4 justify-center flex-1">
                    {r.matchIds.map((mId, idx) => {
                       let m = stage.nodes.find(n=>n.id===mId);
                       return m ? <UnifiedMatchNode key={idx} m={m} /> : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {stage.gfRounds && (
          <div className="flex flex-col justify-center border-l border-[#2d3540] pl-12 min-w-[280px] ml-12">
            {stage.gfRounds.map((r, i) => (
              <div key={`gf-${i}`} className="flex flex-col w-full">
                <h4 className="text-center text-yellow-500 font-black text-xs mb-6 uppercase tracking-widest">{r.name}</h4>
                <div className="flex flex-col gap-4">
                  {r.matchIds.map((mId, idx) => {
                     let m = stage.nodes.find(n=>n.id===mId);
                     return m ? <UnifiedMatchNode key={idx} m={m} /> : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StageViewer = ({ stage }) => {
  if (stage.type === 'IEM_GROUPS' || stage.type === 'BLAST_BRACKET') {
    return <IEMDoubleElimViewer stage={stage} />;
  }

  return (
    <div className={`flex flex-col gap-6 pb-6 overflow-x-auto ${SCROLLBAR} bg-[#0b1320] p-6 rounded-xl border border-slate-800`}>
      <div className="flex gap-6">
        {stage.rounds?.map((r, i) => (
          <div key={i} className="flex flex-col gap-4 min-w-[280px]">
            <h3 className="text-center font-bold text-slate-100 tracking-wider mb-2">{r.name}</h3>
            {stage.type === 'SWISS' ? (
              <div className="flex flex-col min-h-[760px] justify-between gap-4">
                <div className="space-y-4">
                  {r.groups?.filter(g => {
                    const [w, lose] = g.name.split('-').map(Number);
                    return Number.isFinite(w) && Number.isFinite(lose) && w > lose;
                  }).map((g, j) => (
                    <div key={`u-${j}`} className="flex flex-col gap-2">
                      <div className="text-center text-[10px] text-blue-400 font-black mb-1 tracking-widest uppercase bg-blue-500/10 py-1 rounded">Bracket {g.name}</div>
                      {g.matchIds.map((mId, k) => {
                         let m = stage.nodes.find(n=>n.id===mId);
                         return m ? <UnifiedMatchNode key={k} m={m} /> : null;
                      })}
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {r.groups?.filter(g => {
                    const [w, lose] = g.name.split('-').map(Number);
                    return Number.isFinite(w) && Number.isFinite(lose) && w === lose;
                  }).map((g, j) => (
                    <div key={`m-${j}`} className="flex flex-col gap-2">
                      <div className="text-center text-[10px] text-blue-400 font-black mb-1 tracking-widest uppercase bg-blue-500/10 py-1 rounded">Bracket {g.name}</div>
                      {g.matchIds.map((mId, k) => {
                         let m = stage.nodes.find(n=>n.id===mId);
                         return m ? <UnifiedMatchNode key={k} m={m} /> : null;
                      })}
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {r.groups?.filter(g => {
                    const [w, lose] = g.name.split('-').map(Number);
                    return Number.isFinite(w) && Number.isFinite(lose) && w < lose;
                  }).map((g, j) => (
                    <div key={`l-${j}`} className="flex flex-col gap-2">
                      <div className="text-center text-[10px] text-blue-400 font-black mb-1 tracking-widest uppercase bg-blue-500/10 py-1 rounded">Bracket {g.name}</div>
                      {g.matchIds.map((mId, k) => {
                         let m = stage.nodes.find(n=>n.id===mId);
                         return m ? <UnifiedMatchNode key={k} m={m} /> : null;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : r.groups?.map((g, j) => (
              <div key={j} className="flex flex-col gap-2">
                {g.matchIds.map((mId, k) => {
                   let m = stage.nodes.find(n=>n.id===mId);
                   return m ? <UnifiedMatchNode key={k} m={m} /> : null;
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {stage.type === 'SWISS' && stage.finalGroups && (
        <div className="mt-4 border-t border-slate-800 pt-6">
          <h3 className="font-black text-blue-500 mb-4 text-center text-sm uppercase tracking-widest">Swiss Stage Tracker</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {['3-0','3-1','3-2','2-3','1-3','0-3', '2-0','2-1','2-2','1-0','1-1','1-2','0-1','0-2','0-0'].map(k => {
              const groupTeams = stage.finalGroups[k] || [];
              if (groupTeams.length === 0) return null;
              return (
                <div key={k} className="bg-slate-900 border border-slate-800 rounded-lg p-3 min-w-[120px] shadow-md">
                  <div className="text-center font-black text-slate-400 mb-2">{k}</div>
                  {groupTeams.map(r => (
                    <div key={r.team.id} className={`text-xs font-bold text-center py-1 truncate ${r.w===3?'text-green-400':r.l===3?'text-red-400':'text-slate-300'}`}>{r.team.name}</div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const TournamentStandingsTable = ({ standings, onTeamClick, isDayMode }) => (
  <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
    <div className="p-6 border-b border-slate-800 flex items-center gap-2">
      <Trophy className="text-yellow-500" />
      <h2 className="text-xl font-bold text-slate-100">Tournament Final Standings & Earnings</h2>
    </div>
    <div className={`overflow-x-auto ${SCROLLBAR}`}>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
          <tr>
            <th className="px-6 py-4">Placement</th>
            <th className="px-6 py-4">Team</th>
            <th className="px-6 py-4 text-right">Prize Earned</th>
            <th className="px-6 py-4">Initial VRS</th>
            <th className="px-6 py-4">Final VRS</th>
            <th className="px-6 py-4 text-right">? VRS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {(standings || []).map((s, i) => (
            <tr key={i} className="hover:bg-slate-800/30 transition-colors">
              <td className="px-6 py-3 font-bold text-slate-300">{s.placement}</td>
              <td className="px-6 py-3 font-bold cursor-pointer hover:text-blue-400 hover:underline text-slate-200" onClick={() => onTeamClick(s.team)}>{s.team.name}</td>
              <td className="px-6 py-3 text-right text-green-500 font-mono font-bold">${(s.prize || 0).toLocaleString()}</td>
              <td className="px-6 py-3 font-mono text-slate-500">{s.vrsBefore}</td>
              <td className={`px-6 py-3 font-mono ${isDayMode ? 'text-black' : 'text-white'}`}>{s.vrsAfter}</td>
              <td className={`px-6 py-3 font-mono font-bold text-right ${(s.deltaVrs ?? (s.vrsAfter - s.vrsBefore)) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {(s.deltaVrs ?? (s.vrsAfter - s.vrsBefore)) >= 0 ? '+' : ''}{s.deltaVrs ?? (s.vrsAfter - s.vrsBefore)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const TournamentParticipantsTable = ({ participants, onTeamClick, getRegionBadgeClass, globalRankByTeamId }) => (
  <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
    <div className="p-6 border-b border-slate-800 flex items-center gap-2">
      <Users className="text-blue-500" />
      <h2 className="text-xl font-bold text-slate-100">Invited Teams List</h2>
    </div>
    <div className={`overflow-x-auto max-h-[60vh] ${SCROLLBAR}`}>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-950 text-slate-400 uppercase text-xs sticky top-0 z-10">
          <tr><th className="px-6 py-4">SEED</th><th className="px-6 py-4">CSEMTV RANK</th><th className="px-6 py-4">Team</th><th className="px-6 py-4 text-center">Region</th><th className="px-6 py-4">Entry</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {(participants || []).map((t, i) => {
            const prev = participants[i - 1];
            const stageChanged = i > 0 && t.invitedStage && prev?.invitedStage && t.invitedStage !== prev.invitedStage;
            return (
              <tr key={i} className={`hover:bg-slate-800/30 transition-colors ${stageChanged ? 'border-t-2 border-sky-500/70' : ''}`}>
                <td className="px-6 py-3 font-mono text-slate-400 font-bold">#{t.seed}</td>
                <td className="px-6 py-3 font-mono text-slate-500 font-bold">#{globalRankByTeamId[t.id] || '-'}</td>
                <td className="px-6 py-3 font-bold cursor-pointer hover:text-blue-400 text-slate-200 hover:underline" onClick={() => onTeamClick(t)}>{t.name}</td>
                <td className="px-6 py-3 text-center"><span className={`text-[10px] px-2.5 py-1 rounded-md font-black ${getRegionBadgeClass(t.region)}`}>{t.region}</span></td>
                <td className="px-6 py-3 font-semibold text-slate-300">{t.invitedStage || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

const TournamentPredictTable = ({ tour, state, getRegionBadgeClass }) => {
  let pool = [...state.teams].sort((a,b) => (state.vrsMap[b.id]||1000) - (state.vrsMap[a.id]||1000)).slice(TOURNAMENT_TIERS[tour.tierId].banTop);
  let predicted = pool.slice(0, tour.size);
  const majorSlots = normalizeMajorSlots(tour.majorSlots || state.majorSlots);
  const byRegion = REGION_ORDER.map(region => ({
    region,
    stage3: pool.filter(t => t.region === region).slice(0, majorSlots.stage3[region]),
    stage2: pool.filter(t => t.region === region).slice(majorSlots.stage3[region], majorSlots.stage3[region] + majorSlots.stage2[region]),
    stage1: pool.filter(t => t.region === region).slice(majorSlots.stage3[region] + majorSlots.stage2[region], majorSlots.stage3[region] + majorSlots.stage2[region] + majorSlots.stage1[region])
  }));
  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <Clock className="text-blue-500" />
        <h2 className="text-xl font-bold text-slate-100">VRS 閭€璇烽娴?(VRS Invitation Prediction)</h2>
      </div>
      {tour.formatId === 'MAJOR' ? (
        <div className="p-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
          {byRegion.map(group => (
            <div key={group.region} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className={`text-[10px] px-2.5 py-1 rounded-md font-black ${getRegionBadgeClass(group.region)}`}>{group.region}</span>
                <span className="text-xs text-slate-500">S3 {majorSlots.stage3[group.region]} / S2 {majorSlots.stage2[group.region]} / S1 {majorSlots.stage1[group.region]}</span>
              </div>
              <div className={`max-h-80 overflow-y-auto ${SCROLLBAR}`}>
                {[{ key: 'stage3', label: '\u76f4\u9080 Stage 3' }, { key: 'stage2', label: '\u76f4\u9080 Stage 2' }, { key: 'stage1', label: '\u8fdb\u5165 Stage 1' }].map(sec => (
                  <div key={sec.key} className="border-b last:border-b-0 border-slate-800 p-3">
                    <div className="text-xs font-bold text-slate-400 mb-2">{sec.label}</div>
                    {group[sec.key].length === 0 ? <div className="text-xs text-slate-600">No slot</div> : group[sec.key].map(t => (
                      <div key={t.id} className="flex justify-between text-sm py-0.5">
                        <span className="text-slate-200 font-semibold truncate pr-2">{t.name}</span>
                        <span className="text-orange-400 font-mono">{state.vrsMap[t.id]}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`overflow-x-auto max-h-[60vh] ${SCROLLBAR}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs sticky top-0 z-10">
              <tr><th className="px-6 py-4">Predicted Seed</th><th className="px-6 py-4">Team</th><th className="px-6 py-4 text-center">Region</th><th className="px-6 py-4">Current VRS</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {predicted.map((t, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3 font-mono text-slate-400 font-bold">#{i+1}</td>
                  <td className="px-6 py-3 font-bold text-slate-200">{t.name}</td>
                  <td className="px-6 py-3 text-center"><span className={`text-[10px] px-2.5 py-1 rounded-md font-black ${getRegionBadgeClass(t.region)}`}>{t.region}</span></td>
                  <td className="px-6 py-3 font-mono text-orange-400">{state.vrsMap[t.id]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

class LetUsGuessBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {}
  componentDidUpdate(prevProps) {
    if (this.props.resetKey !== prevProps.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto bg-[#060000] border border-[#4d0a0a] rounded-2xl p-6 text-[#ff8a8a]">
          <div className="text-xl font-black mb-3">LETUSGUESS 页面渲染异常</div>
          <div className="text-sm mb-4">已触发防白屏保护。请返回主页面后重试。</div>
          <button
            onClick={this.props.onExit}
            className="px-4 py-2 rounded-lg border border-[#8f1414] bg-[#1a0303] hover:bg-[#2a0606] text-[#ffb3b3] font-bold"
          >
            返回主页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const GuessMatchPreview = ({ m }) => {
  const isPlayed = m?.status === 'PLAYED';
  const aWin = isPlayed && m?.winner?.id === m?.tA?.id;
  const bWin = isPlayed && m?.winner?.id === m?.tB?.id;
  const tAName = m?.tA?.name || 'TBD';
  const tBName = m?.tB?.name || 'TBD';
  const scoreA = isPlayed ? (m?.scoreA ?? '-') : 'BO3';
  const scoreB = isPlayed ? (m?.scoreB ?? '-') : '-';
  return (
    <div className="w-full rounded-xl border border-[#6b1212] bg-[#0e0202] p-3">
      <div className="text-[10px] text-[#ff9a9a] mb-2 font-mono">{m?.date || 'TBD'} · {m?.name || 'Match'}</div>
      <div className={`flex items-center justify-between px-2 py-2 rounded ${aWin ? 'bg-green-900/30' : isPlayed ? 'bg-red-950/30' : 'bg-[#140404]'}`}>
        <span className="truncate">{tAName}</span>
        <span className={`${aWin ? 'text-green-400' : 'text-[#ffb2b2]'} font-black`}>{scoreA}</span>
      </div>
      <div className={`flex items-center justify-between px-2 py-2 rounded mt-1 ${bWin ? 'bg-green-900/30' : isPlayed ? 'bg-red-950/30' : 'bg-[#140404]'}`}>
        <span className="truncate">{tBName}</span>
        <span className={`${bWin ? 'text-green-400' : 'text-[#ffb2b2]'} font-black`}>{scoreB}</span>
      </div>
    </div>
  );
};

// --- React App Component ---
export default function App() {
  const [state, setState] = useState(() => {
    let t = INITIAL_SOURCE.map((x, i) => ({
       id: `t-${i}`, name: x.n, region: x.r, vrs: x.v, stamina: 100, wins: 0, losses: 0, prizeTotal: 0, honors: []
    }));
    let vMap = {}, sMap = {};
    t.forEach(x => { vMap[x.id] = x.vrs; sMap[x.id] = x.stamina; });
    return {
      currentDate: '2026-01-01',
      teams: t, vrsMap: vMap, staminaMap: sMap,
      tournaments: [], matchLog: {}, nextTournamentId: 1,
      guessHistory: [],
      funds: 10000000,
      majorSlots: createDefaultMajorSlots(),
      eplCounters: { HIGHEST:1, TIER_S:1, TIER_1:1, TIER_2:1, TIER_3:1, TIER_OPEN:1, EWC:1 }
    };
  });
  
  const [view, setView] = useState('ranking');
  const [config, setConfig] = useState({ format: 'MAJOR', tier: 'HIGHEST', nameInput: '', invDate: '2026-01-02' });
  const [errorMsg, setErrorMsg] = useState('');
  const [sortMode, setSortMode] = useState('VRS');
  const [regionFilter, setRegionFilter] = useState('Global');
  const [activeTourId, setActiveTourId] = useState(null);
  const [activeStageIdx, setActiveStageIdx] = useState('standings');
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('2026-01-01');
  const [historyTierFilter, setHistoryTierFilter] = useState('ALL');
  const [trackCalendarToday, setTrackCalendarToday] = useState(true);
  const [citySearch, setCitySearch] = useState('');
  const [isDayMode, setIsDayMode] = useState(false);
  const [guessTab, setGuessTab] = useState('predict');
  const [guessFocus, setGuessFocus] = useState(null);
  const [guessAmountInput, setGuessAmountInput] = useState('');
  const [guessPickTeamId, setGuessPickTeamId] = useState(null);
  const [guessMsg, setGuessMsg] = useState('');
  const [lastMainView, setLastMainView] = useState('ranking');
  const organizeDateInputRef = useRef(null);
  const scheduleDateInputRef = useRef(null);

  const cityLookup = useMemo(() => {
    const map = {};
    ESPORTS_CITIES.forEach(c => { map[c.toLowerCase()] = c; });
    return map;
  }, []);

  const citySearchResult = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return ESPORTS_CITIES;
    return ESPORTS_CITIES.filter(c => c.toLowerCase().includes(q));
  }, [citySearch]);

  const handleFormatChange = (newFormatId) => {
    const format = FORMATS[newFormatId];
    const newTier = format.allowedTiers.includes(config.tier) ? config.tier : format.allowedTiers[0];
    setConfig({ ...config, format: newFormatId, tier: newTier, nameInput: '' });
    setCitySearch('');
    setErrorMsg('');
  };

  const activeTour = useMemo(() => state.tournaments.find(t => t.id === activeTourId), [state.tournaments, activeTourId]);
  const activeTourHeat = useMemo(() => {
    if (!activeTour) return 0;
    if (Number.isFinite(activeTour.totalHeat)) return activeTour.totalHeat;
    return (activeTour.stages || []).reduce((sum, st) => sum + (st.nodes || []).reduce((inner, node) => inner + (node.heat || 0), 0), 0);
  }, [activeTour]);
  const selectedTeam = useMemo(() => {
    if(!selectedTeamId) return null;
    let t = state.teams.find(x=>x.id===selectedTeamId);
    if (!t) return null;
    return { ...t, vrs: state.vrsMap[t.id], stamina: state.staminaMap[t.id] };
  }, [state.teams, state.vrsMap, state.staminaMap, selectedTeamId]);

  const displayTeams = useMemo(() => {
    let list = state.teams.map(t => ({ ...t, vrs: state.vrsMap[t.id], stamina: state.staminaMap[t.id] }))
                          .sort((a,b) => b.vrs - a.vrs);
    list.forEach((t, i) => t.globalRank = i + 1);

    let filtered = regionFilter === 'Global' ? list : list.filter(t => t.region === regionFilter);
    if (regionFilter !== 'Global') {
        filtered.forEach((t, i) => t.regionalRank = i + 1);
    }

    if (sortMode === 'PRIZE') {
        filtered.sort((a,b) => (b.prizeTotal||0) - (a.prizeTotal||0) || b.vrs - a.vrs);
    } else {
        filtered.sort((a,b) => b.vrs - a.vrs); 
    }
    return filtered;
  }, [state.teams, state.vrsMap, state.staminaMap, regionFilter, sortMode]);

  const globalRankByTeamId = useMemo(() => {
    const ordered = [...state.teams].sort((a, b) => (state.vrsMap[b.id] || 0) - (state.vrsMap[a.id] || 0));
    const map = {};
    ordered.forEach((t, i) => { map[t.id] = i + 1; });
    return map;
  }, [state.teams, state.vrsMap]);

  const getTeamLevelLabel = (team) => {
    const rank = globalRankByTeamId[team?.id] || 9999;
    const labels = [];
    if (rank <= 5) labels.push(TEAM_LABELS.TOP);
    else if (rank <= 20) labels.push(TEAM_LABELS.STRONG);
    if (STAR_TEAM_NAMES.has(String(team?.name || ''))) labels.push(TEAM_LABELS.STAR);
    return labels;
  };

  const openDatePicker = (inputRef) => {
    const input = inputRef?.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') input.showPicker();
    else input.focus();
  };

  const handleAdvanceDay = () => {
    setState(prev => {
      let nextTours = prev.tournaments.map(t => {
        if (t.status === 'COMPLETED') return t;
        return {
          ...t,
          stages: t.stages.map(st => ({
             ...st,
             rounds: st.rounds?.map(r => ({ ...r, groups: r.groups?.map(g => ({ ...g, matchIds: [...g.matchIds] })) })),
             nodes: st.nodes?.map(n=>({...n, details: [...n.details]})),
             records: st.records?.map(r=>({...r})),
             finalGroups: st.finalGroups ? { ...st.finalGroups } : null,
             upperRounds: st.upperRounds?.map(ur => ({ ...ur, matchIds: [...ur.matchIds] })),
             lowerRounds: st.lowerRounds?.map(lr => ({ ...lr, matchIds: [...lr.matchIds] })),
             gfRounds: st.gfRounds?.map(gr => ({ ...gr, matchIds: [...gr.matchIds] })),
             groups: st.groups?.map(ggr => ({
               ...ggr,
               upperRounds: ggr.upperRounds?.map(ur => ({ ...ur, matchIds: [...ur.matchIds] })),
               lowerRounds: ggr.lowerRounds?.map(lr => ({ ...lr, matchIds: [...lr.matchIds] }))
             }))
          }))
        };
      });

      let next = {
        ...prev, currentDate: addDays(prev.currentDate, 1),
        tournaments: nextTours, vrsMap: {...prev.vrsMap}, staminaMap: {...prev.staminaMap}, matchLog: {...prev.matchLog}
      };

      next.tournaments.forEach(t => {
        if (t.status === 'PENDING' && next.currentDate >= t.invDate) {
          doInvitationAndInit(t, next);
        }
        if (t.status === 'WAITING' && next.currentDate >= t.startDate) {
          t.status = 'ACTIVE';
        }
        if (t.status === 'ACTIVE') {
          processDayTick(t, next, next.currentDate);
        }
      });
      Object.keys(next.staminaMap).forEach(id => {
        next.staminaMap[id] = Math.min(100, (next.staminaMap[id] || 0) + 1);
      });
      next.teams = prev.teams.map(t => ({...t, vrs: next.vrsMap[t.id], stamina: next.staminaMap[t.id]}));
      return next;
    });
    if (view === 'calendar' && trackCalendarToday) {
      setScheduleDate(addDays(state.currentDate, 1));
    }
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = String(e.target?.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable;
      if (isTyping) return;
      if (e.key === '>' || (e.key === '.' && e.shiftKey)) {
        e.preventDefault();
        handleAdvanceDay();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [view, trackCalendarToday, state.currentDate]);

  const handleCreateTournament = () => {
    setErrorMsg('');
    let eName = config.nameInput.trim();
    const tournamentPrize = calculatePrize(config.format, config.tier);
    if (CITY_REQUIRED_FORMATS.has(config.format) && !eName) return setErrorMsg("Please select a city from the preset list.");
    if (CITY_REQUIRED_FORMATS.has(config.format) && !ESPORTS_CITIES.includes(eName)) return setErrorMsg("City must come from the preset list.");
    if (config.invDate <= state.currentDate) return setErrorMsg("Invitation date must be after current date.");
    if (state.tournaments.some(t => t.invDate === config.invDate)) return setErrorMsg("Cannot set two tournaments with same invitation date.");
    if (config.format === 'MAJOR' && state.tournaments.filter(t => t.formatId === 'MAJOR' && t.invDate.startsWith(config.invDate.substring(0,4))).length >= 2) return setErrorMsg("Major can only be held twice per year.");
    if (config.format === 'EWC' && state.tournaments.some(t => t.formatId === 'EWC' && t.invDate.startsWith(config.invDate.substring(0,4)))) return setErrorMsg("EWC can only be held once per year.");
    if (CITY_REQUIRED_FORMATS.has(config.format) && state.tournaments.some(t =>
      t.formatId === config.format &&
      t.invDate.startsWith(config.invDate.substring(0,4)) &&
      inferTournamentCity(t).toLowerCase() === eName.toLowerCase()
    )) return setErrorMsg("Same format cannot be hosted twice in the same city within one year.");
    if (config.format === 'MAJOR') {
      const prevMajors = state.tournaments
        .filter(t => t.formatId === 'MAJOR' && t.invDate < config.invDate)
        .sort((a, b) => String(b.invDate).localeCompare(String(a.invDate)));
      if (prevMajors.length > 0) {
        const lastMajorFinalDate = getTournamentFinalDate(prevMajors[0]);
        if (config.invDate <= lastMajorFinalDate) {
          return setErrorMsg("Next Major invitation deadline must be later than previous Major grand final date (" + lastMajorFinalDate + ").");
        }
      }
    }
    if ((state.funds || 0) < tournamentPrize) return setErrorMsg("Insufficient funds to create this tournament.");

    setState(prev => {
      if ((prev.funds || 0) < tournamentPrize) return prev;
      const year = config.invDate.substring(0,4);
      const newCounters = { ...prev.eplCounters };
      let tName = '';

      if(config.format==='MAJOR') tName = eName + ' Major ' + year;
      else if(config.format==='EWC') { tName = 'Esports World Cup ' + newCounters.EWC; newCounters.EWC++; }
      else if(config.format==='IEM') tName = 'Intel Extreme Masters ' + eName + ' ' + year;
      else if(config.format==='BLAST') {
        if(config.tier==='HIGHEST') tName = 'BLAST Grand Final ' + eName + ' ' + year;
        else if(config.tier==='TIER_S') tName = 'BLAST Rivals ' + eName + ' ' + year;
        else tName = 'BLAST Open ' + eName + ' ' + year;
      } else if(config.format==='EPL') {
        let c = newCounters[config.tier];
        if(config.tier==='HIGHEST') tName = 'ESL PRO LEAGUE ' + c; else if(config.tier==='TIER_S') tName = 'ESL HIGH ' + c;
        else if(config.tier==='TIER_1') tName = 'ESL POWER ' + c; else if(config.tier==='TIER_2') tName = 'ESL WILD ' + c;
        else if(config.tier==='TIER_3') tName = 'ECL PRO ' + c; else tName = 'ECL OPEN ' + c;
        newCounters[config.tier]++;
      }

      const newTour = {
        id: prev.nextTournamentId, status: 'PENDING',
        name: String(tName), formatId: String(config.format), tierId: String(config.tier),
        city: CITY_REQUIRED_FORMATS.has(config.format) ? String(eName) : '',
        prize: tournamentPrize,
        size: FORMATS[config.format].teams,
        invDate: String(config.invDate), startDate: addDays(config.invDate, TOURNAMENT_TIERS[config.tier].delay),
        stages: [], currentStageIdx: 0, rest: 0, placements: [], date: String(config.invDate), initialVrs: {},
        vrsDeltaMap: {},
        totalHeat: 0,
        majorSlots: config.format === 'MAJOR' ? normalizeMajorSlots(prev.majorSlots) : null,
        majorDirect: null
      };
      newTour.stages = buildStagesForTournament(newTour);

      return {
        ...prev, nextTournamentId: prev.nextTournamentId + 1, eplCounters: newCounters, funds: (prev.funds || 0) - tournamentPrize,
        tournaments: [...prev.tournaments, newTour]
      };
    });
    setView('calendar');
    setScheduleDate(config.invDate);
  };
  const getHonorColor = (tier, placement) => {
    if (placement === '2nd') return { text: tier === 'HIGHEST' ? 'text-slate-300' : 'text-slate-500', border: tier === 'HIGHEST' ? 'border-slate-300/30' : 'border-slate-500/30' };
    switch (tier) {
        case 'HIGHEST': return { text: 'text-yellow-500', border: 'border-yellow-500/30' }; 
        case 'TIER_S': return { text: 'text-red-500', border: 'border-red-500/30' }; 
        case 'TIER_1': return { text: 'text-pink-500', border: 'border-pink-500/30' }; 
        case 'TIER_2': return { text: 'text-purple-500', border: 'border-purple-500/30' }; 
        case 'TIER_3': return { text: 'text-blue-600', border: 'border-blue-600/30' }; 
        case 'TIER_OPEN': return { text: 'text-sky-400', border: 'border-sky-400/30' }; 
        default: return { text: 'text-slate-400', border: 'border-slate-400/30' };
    }
  };

  const groupedHistory = useMemo(() => {
    return state.tournaments.reduce((acc, h) => {
      if (!acc[h.formatId]) acc[h.formatId] = {};
      if (!acc[h.formatId][h.tierId]) acc[h.formatId][h.tierId] = [];
      acc[h.formatId][h.tierId].push(h);
      return acc;
    }, {});
  }, [state.tournaments]);

  const orderedHistoryFormats = useMemo(
    () => ['MAJOR', 'IEM', 'EWC', 'BLAST', 'EPL'].filter(fid => groupedHistory[fid]),
    [groupedHistory]
  );

  const teamTournaments = useMemo(() => {
    if (!selectedTeam) return [];
    return state.tournaments
      .filter(t => t.status === 'COMPLETED' && t.standings?.some(s => s.team.id === selectedTeam.id))
      .sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || '')) || b.id - a.id);
  }, [state.tournaments, selectedTeam]);

  const changeScheduleDate = (offset) => setScheduleDate(addDays(scheduleDate, offset));

  const getRegionBadgeClass = (region) => {
    if (region === 'EU') return 'bg-blue-900 text-white';
    if (region === 'AM') return 'bg-red-900 text-white';
    if (region === 'AS') return 'bg-yellow-700 text-white';
    return 'bg-slate-700 text-white';
  };

  const scheduledMatchesForDay = useMemo(() => {
    let all = [];
    state.tournaments.forEach(t => {
      t.stages.forEach(st => {
        st.nodes?.forEach(m => {
          if (m.date === scheduleDate) {
             all.push({tourId: t.id, tourName: t.name, ...m});
          }
        });
      });
    });
    return all.sort((a,b) => String(a.tourName).localeCompare(String(b.tourName)) || String(a.name).localeCompare(String(b.name)));
  }, [state.tournaments, scheduleDate]);

  const guessDate = useMemo(() => addDays(state.currentDate, 1), [state.currentDate]);

  const guessMatches = useMemo(() => {
    const all = [];
    state.tournaments.forEach(t => {
      t.stages.forEach((st, stageIdx) => {
        (st.nodes || []).forEach(m => {
          if (m.date === guessDate) {
            const odds = (m.tA && m.tB) ? calculateGuessRatios(m.tA, m.tB, state.vrsMap) : { ratioA: 1, ratioB: 1 };
            all.push({
              tourId: t.id,
              stageIdx,
              matchId: m.id,
              tourName: t.name,
              ...m,
              oddsA: odds.ratioA,
              oddsB: odds.ratioB
            });
          }
        });
      });
    });
    return all.sort((a, b) => String(a.tourName).localeCompare(String(b.tourName)) || String(a.name).localeCompare(String(b.name)));
  }, [state.tournaments, state.vrsMap, guessDate]);

  const activeGuessMatch = useMemo(() => {
    if (!guessFocus) return null;
    const tour = state.tournaments.find(t => t.id === guessFocus.tourId);
    const st = tour?.stages?.[guessFocus.stageIdx];
    const m = st?.nodes?.find(n => n.id === guessFocus.matchId);
    if (!m) return null;
    const odds = (m.tA && m.tB) ? calculateGuessRatios(m.tA, m.tB, state.vrsMap) : { ratioA: 1, ratioB: 1 };
    return { ...m, tourId: tour.id, stageIdx: guessFocus.stageIdx, matchId: m.id, tourName: tour.name, oddsA: odds.ratioA, oddsB: odds.ratioB };
  }, [guessFocus, state.tournaments, state.vrsMap]);

  const openGuessMatch = (m) => {
    setGuessFocus({ tourId: m.tourId, stageIdx: m.stageIdx, matchId: m.matchId });
    setGuessAmountInput('');
    setGuessPickTeamId(null);
    setGuessMsg('');
  };

  const appendGuessDigit = (digit) => {
    const d = String(digit);
    if (!/^\d$/.test(d)) return;
    const nextRaw = (guessAmountInput === '0' ? d : `${guessAmountInput}${d}`).replace(/^0+(\d)/, '$1');
    const nextVal = Number(nextRaw || 0);
    if (nextVal > (state.funds || 0)) return;
    setGuessAmountInput(nextRaw);
  };

  const placeGuess = () => {
    if (!activeGuessMatch || !activeGuessMatch.tA || !activeGuessMatch.tB) return setGuessMsg('该场比赛尚未确定对阵。');
    const amount = Math.floor(Number(guessAmountInput || 0));
    if (!guessPickTeamId) return setGuessMsg('请先选择预测胜者。');
    if (!Number.isFinite(amount) || amount < 0) return setGuessMsg('请输入有效金额。');
    if (amount > (state.funds || 0)) return setGuessMsg('金额不能大于当前资金。');
    const pickOdds = guessPickTeamId === activeGuessMatch.tA.id ? activeGuessMatch.oddsA : activeGuessMatch.oddsB;
    const pickName = guessPickTeamId === activeGuessMatch.tA.id ? activeGuessMatch.tA.name : activeGuessMatch.tB.name;
    setState(prev => {
      if (amount > (prev.funds || 0)) return prev;
      let placed = false;
      const tours = prev.tournaments.map(t => {
        if (t.id !== activeGuessMatch.tourId) return t;
        return {
          ...t,
          stages: t.stages.map((st, idx) => {
            if (idx !== activeGuessMatch.stageIdx) return st;
            return {
              ...st,
              nodes: st.nodes.map(n => {
                if (n.id !== activeGuessMatch.matchId) return n;
                if (n.prediction) return n;
                placed = true;
                return {
                  ...n,
                  prediction: {
                    guessId: `${t.id}:${n.id}`,
                    pickTeamId: guessPickTeamId,
                    pickTeamName: pickName,
                    amount,
                    oddsA: activeGuessMatch.oddsA,
                    oddsB: activeGuessMatch.oddsB,
                    chosenOdds: pickOdds,
                    settled: false,
                    success: null,
                    payout: 0,
                    placeDate: prev.currentDate
                  }
                };
              })
            };
          })
        };
      });
      if (!placed) return prev;
      const historyEntry = {
        id: `${activeGuessMatch.tourId}:${activeGuessMatch.matchId}`,
        status: 'PENDING',
        tourId: activeGuessMatch.tourId,
        tourName: activeGuessMatch.tourName,
        stageIdx: activeGuessMatch.stageIdx,
        matchId: activeGuessMatch.matchId,
        matchName: activeGuessMatch.name,
        matchDate: activeGuessMatch.date,
        teamAName: activeGuessMatch.tA.name,
        teamBName: activeGuessMatch.tB.name,
        pickTeamId: guessPickTeamId,
        pickTeamName: pickName,
        amount,
        oddsA: activeGuessMatch.oddsA,
        oddsB: activeGuessMatch.oddsB,
        chosenOdds: pickOdds,
        payout: 0,
        success: null,
        placeDate: prev.currentDate
      };
      return {
        ...prev,
        tournaments: tours,
        funds: (prev.funds || 0) - amount,
        guessHistory: [historyEntry, ...(prev.guessHistory || [])]
      };
    });
    setGuessFocus(null);
    setGuessAmountInput('');
    setGuessPickTeamId(null);
    setGuessMsg('');
  };

  const exitLetUsGuess = () => {
    setGuessFocus(null);
    setGuessMsg('');
    const target = (lastMainView && lastMainView !== 'letusguess') ? lastMainView : 'ranking';
    setView(target);
  };
  const appRootClass = isDayMode
    ? "day-mode min-h-screen bg-slate-100 text-slate-900 p-4 md:p-8 font-sans"
    : "min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans";

  return (
    <div className={appRootClass}>
      <style>{`
        .day-mode .bg-slate-950 { background-color: #f8fafc !important; }
        .day-mode .bg-slate-900, .day-mode .bg-slate-900\\/80, .day-mode .bg-slate-900\\/95 { background-color: #ffffff !important; }
        .day-mode .bg-slate-900\\/50, .day-mode .bg-slate-900\\/40 { background-color: #f8fafc !important; }
        .day-mode .bg-slate-800, .day-mode .bg-slate-800\\/50 { background-color: #e2e8f0 !important; }
        .day-mode .border-slate-800, .day-mode .border-slate-700 { border-color: #cbd5e1 !important; }
        .day-mode .text-slate-100, .day-mode .text-slate-200, .day-mode .text-slate-300 { color: #0f172a !important; }
        .day-mode .text-slate-400, .day-mode .text-slate-500 { color: #475569 !important; }
        .day-mode .shadow-2xl, .day-mode .shadow-xl, .day-mode .shadow-lg { box-shadow: 0 6px 16px rgba(15,23,42,0.08) !important; }
        .day-mode .calendar-team-white { color: #ffffff !important; }
      `}</style>
      <div className="max-w-[1400px] mx-auto w-full flex justify-center mb-6">
        <h1 className="text-2xl md:text-4xl lg:text-[42px] xl:text-[46px] font-black text-slate-100 tracking-widest uppercase whitespace-nowrap">
          Counter-Strike 2 Event Manager
        </h1>
      </div>

      <nav className={`max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4 mb-8 bg-slate-900/80 p-4 rounded-2xl shadow-xl border border-slate-800`}>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <button onClick={() => setView('ranking')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-bold ${view === 'ranking' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}`}><Globe size={16}/> 榜单</button>
          <button onClick={() => { setView('organize'); setConfig(prev => ({ ...prev, invDate: addDays(state.currentDate, 1) })); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-bold ${view === 'organize' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}`}><PlusCircle size={16}/> 办赛</button>
          <button onClick={() => setView('history')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-bold ${view === 'history' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}`}><ListOrdered size={16}/> 赛事库</button>
          <button onClick={() => { setView('calendar'); setScheduleDate(state.currentDate); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-bold ${view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}`}><Calendar size={16}/> 赛事日历</button>
          {activeTour && <button onClick={() => setView('tournament')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-bold ${view === 'tournament' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-yellow-500 hover:bg-slate-800'}`}><Sword size={16}/> 现场</button>}
        </div>
      </nav>


      <div className="fixed top-4 right-4 z-50 bg-slate-900/95 border border-slate-700 rounded-2xl p-3 shadow-2xl backdrop-blur-sm">
        <div className="font-mono text-xs md:text-sm font-black text-green-500 tracking-wide text-right mb-1">{'\u5f53\u524d\u8d44\u91d1'}: ${(state.funds || 0).toLocaleString()}</div>
        <div className="font-mono text-sm md:text-base font-black text-orange-500 tracking-widest text-right mb-2">{state.currentDate}</div>
        <button
          onClick={handleAdvanceDay}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 px-5 py-2 rounded-lg font-black transition-all shadow-lg hover:shadow-orange-500/30 flex flex-col items-center leading-tight"
        >
          <span className="flex items-center gap-2">涓嬩竴澶?<Clock size={15}/></span>
          <span className="text-[10px] text-orange-900">Press or Enter '&gt;'</span>
        </button>
        <button
          onClick={() => setIsDayMode(v => !v)}
          className={`mt-2 w-full rounded-full px-3 py-2.5 border transition-all shadow-inner font-black tracking-wide text-[12px] flex items-center ${
            isDayMode
              ? 'bg-slate-100 border-slate-300 text-slate-800 justify-between'
              : 'bg-[#2f3338] border-slate-600 text-slate-100 justify-start gap-2'
          }`}
        >
          {isDayMode ? (
            <>
              <span>DAYMODE</span>
              <span className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center">
                <Sun size={16} className="text-slate-800" />
              </span>
            </>
          ) : (
            <>
              <span className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center">
                <Moon size={16} className="text-slate-800" />
              </span>
              <span>NIGHTMODE</span>
            </>
          )}
        </button>
      </div>
      <button
        onClick={() => {
          if (view !== 'letusguess') setLastMainView(view || 'ranking');
          setGuessTab('predict');
          setGuessFocus(null);
          setGuessMsg('');
          setView('letusguess');
        }}
        className="fixed left-4 bottom-4 z-50 border-2 border-[#b71c1c] bg-black text-[#ff3b3b] font-black px-4 py-2 rounded-lg tracking-wide hover:bg-[#220000] hover:border-[#ff2d2d] transition shadow-[0_0_18px_rgba(183,28,28,0.45)]"
      >
        LETUSGUESS
      </button>

      <main className="max-w-[1400px] mx-auto">
        {view === 'letusguess' && (() => { try { return (
          <LetUsGuessBoundary onExit={exitLetUsGuess} resetKey={`${guessTab}|${guessFocus ? `${guessFocus.tourId}:${guessFocus.matchId}` : 'none'}`}>
          <div className="fixed inset-0 z-[70] overflow-auto p-6 md:p-10 bg-[radial-gradient(circle_at_20%_20%,#2a0505_0%,#080000_45%,#020000_100%)]">
          <div className="relative max-w-6xl mx-auto border border-[#4d0a0a] rounded-2xl shadow-[0_0_42px_rgba(120,0,0,0.45)] p-6 space-y-5 text-[#ff6a6a] bg-[#060000]/95">
            <button
              onClick={exitLetUsGuess}
              className="fixed left-6 top-6 z-[60] px-4 py-2 rounded-lg border border-[#8f1414] bg-[#1a0303] hover:bg-[#2a0606] text-[#ff8585] font-bold shadow-[0_0_14px_rgba(140,20,20,0.45)]"
            >
              返回主页面
            </button>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-3xl font-black tracking-widest text-[#ff4e4e]">LETUSGUESS</h2>
            </div>
            {!guessFocus && (
              <>
                <div className="flex items-center gap-2 border border-[#5f1010] p-1 rounded-xl w-fit bg-[#120202]">
                  <button onClick={() => setGuessTab('predict')} className={`px-4 py-1.5 rounded-lg font-bold ${guessTab === 'predict' ? 'bg-[#a11414] text-[#ffd2d2]' : 'bg-[#0a0000] text-[#ff8a8a] border border-[#5f1010]'}`}>预测</button>
                  <button onClick={() => setGuessTab('history')} className={`px-4 py-1.5 rounded-lg font-bold ${guessTab === 'history' ? 'bg-[#a11414] text-[#ffd2d2]' : 'bg-[#0a0000] text-[#ff8a8a] border border-[#5f1010]'}`}>历史</button>
                </div>
                <div className="text-xs leading-relaxed text-[#ffb7b7] bg-[#130404] border border-[#5d1010] rounded-xl p-4">
                  提示2：返还比例计算公式为：设两支战队 VRS 为 a、b。令 c=min(1000, min(a,b)-1)，p=a-c，q=b-c，k=2pq/(p+q)，m=1.50-ln(p/k)，n=1.50-ln(q/k)，对 m、n 保留两位小数。再令 x=clamp(m,1.00,15.00)，y=clamp(n,1.00,15.00)，分别作为两队返还比例。
                </div>
              </>
            )}
            {guessFocus && activeGuessMatch ? (
              <div className="space-y-4">
                <button onClick={() => { setGuessFocus(null); setGuessMsg(''); }} className="px-3 py-1.5 rounded-lg border border-[#7a1212] text-[#ff9999] hover:bg-[#260707]">返回预测列表</button>
                <div className="border border-[#6f1111] rounded-xl p-4 bg-[#120404]">
                  <div className="text-xs text-[#ffb7b7] mb-2">{activeGuessMatch.tourName} - {activeGuessMatch.name}</div>
                  <div className="max-w-[520px]">
                    <GuessMatchPreview m={activeGuessMatch} />
                  </div>
                  {activeGuessMatch.tA && activeGuessMatch.tB && (
                    <div className="mt-2 text-sm text-[#ffb3b3]">
                      返还比例：{activeGuessMatch.tA.name} <span className="font-black">{activeGuessMatch.oddsA.toFixed(2)}x</span> / {activeGuessMatch.tB.name} <span className="font-black">{activeGuessMatch.oddsB.toFixed(2)}x</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button disabled={!activeGuessMatch.tA} onClick={() => setGuessPickTeamId(activeGuessMatch.tA?.id || null)} className={`p-3 rounded-xl border font-bold ${guessPickTeamId === activeGuessMatch.tA?.id ? 'border-[#cf2d2d] bg-[#9e1717] text-[#ffe8e8]' : 'border-[#651212] bg-[#0b0000] text-[#ffaaaa]'} disabled:opacity-40`}>
                    预测 {activeGuessMatch.tA?.name || 'TBD'} 胜利
                  </button>
                  <button disabled={!activeGuessMatch.tB} onClick={() => setGuessPickTeamId(activeGuessMatch.tB?.id || null)} className={`p-3 rounded-xl border font-bold ${guessPickTeamId === activeGuessMatch.tB?.id ? 'border-[#cf2d2d] bg-[#9e1717] text-[#ffe8e8]' : 'border-[#651212] bg-[#0b0000] text-[#ffaaaa]'} disabled:opacity-40`}>
                    预测 {activeGuessMatch.tB?.name || 'TBD'} 胜利
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 items-start">
                  <div className="bg-[#070000] border border-[#6a1111] rounded-xl p-4">
                    <div className="text-xs text-[#ffb0b0] mb-2">输入金额（仅非负整数）</div>
                    <div className="bg-[#100101] border border-[#7f1616] rounded-lg px-3 py-2 font-mono text-xl text-green-500 mb-3">${(Number(guessAmountInput || 0)).toLocaleString()}</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1,2,3,4,5,6,7,8,9,'C',0,'⌫'].map((k, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (k === 'C') return setGuessAmountInput('');
                            if (k === '⌫') return setGuessAmountInput(v => String(v || '').slice(0, -1));
                            appendGuessDigit(k);
                          }}
                          className="h-11 rounded-lg border border-[#6d1313] bg-[#150303] text-[#ffb1b1] font-black hover:bg-[#2a0707]"
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="text-sm text-[#ffb3b3]">当前资金：<span className="text-green-500 font-black">${(state.funds || 0).toLocaleString()}</span></div>
                    <button onClick={placeGuess} className="px-5 py-3 rounded-xl bg-[#a71a1a] hover:bg-[#c12727] text-[#ffe6e6] font-black">
                      投入资金进行预测
                    </button>
                    {guessMsg && <div className="text-sm text-[#ffb3b3]">{guessMsg}</div>}
                  </div>
                </div>
              </div>
            ) : guessTab === 'predict' ? (
              <div className="space-y-4">
                <div className="text-sm text-[#ffb6b6]">预测板块：展示 {guessDate} 的全部赛程。</div>
                {guessMatches.length === 0 ? (
                  <div className="border border-[#6b1212] bg-[#130303] rounded-xl p-6 text-center text-[#ffb3b3]">下一天暂无比赛。</div>
                ) : (
                  guessMatches.map((m, idx) => (
                    <div key={`${m.tourId}:${m.matchId}:${idx}`} className="border border-[#6b1212] bg-[#130303] rounded-xl p-3 flex flex-col lg:flex-row gap-4 items-start">
                      <div className="w-full lg:w-[360px]"><GuessMatchPreview m={m} /></div>
                      <div className="flex-1 space-y-2">
                        <div className="text-sm text-[#ffd1d1] font-bold">{m.tourName} - {m.name}</div>
                        {m.tA && m.tB ? (
                          <div className="text-sm text-[#ffb3b3]">
                            返还比例：{m.tA.name} <span className="font-black">{m.oddsA.toFixed(2)}x</span> / {m.tB.name} <span className="font-black">{m.oddsB.toFixed(2)}x</span>
                          </div>
                        ) : (
                          <div className="text-sm text-[#ffb3b3]">返还比例：待定（TBD vs TBD）</div>
                        )}
                        {m.prediction ? (
                          <div className="text-sm text-[#ffcdcd]">
                            您预测 {m.prediction.pickTeamName} 胜利。已投入预测资金：<span className="text-green-500 font-black">{m.prediction.amount}$</span>
                          </div>
                        ) : (
                          <button
                            disabled={!m.tA || !m.tB}
                            onClick={() => openGuessMatch(m)}
                            className="px-4 py-2 rounded-lg border border-[#7e1717] bg-[#2a0707] hover:bg-[#401010] text-[#ffb0b0] font-bold disabled:opacity-40"
                          >
                            预测本场比赛
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-[#ffb6b6]">历史板块：从新到旧展示你的预测记录。</div>
                {(state.guessHistory || []).length === 0 ? (
                  <div className="border border-[#6b1212] bg-[#130303] rounded-xl p-6 text-center text-[#ffb3b3]">暂无预测历史。</div>
                ) : (
                  (state.guessHistory || []).map((g, idx) => {
                    const t = state.tournaments.find(tt => tt.id === g.tourId);
                    const st = t?.stages?.[g.stageIdx];
                    const m = st?.nodes?.find(n => n.id === g.matchId);
                    return (
                      <div key={`${g.id}:${idx}`} className="border border-[#6b1212] bg-[#130303] rounded-xl p-3 flex flex-col lg:flex-row gap-4 items-start">
                        <div className="w-full lg:w-[360px]">{m ? <GuessMatchPreview m={m} /> : <div className="text-xs text-[#ffb3b3] p-3">比赛卡片不可用</div>}</div>
                        <div className="flex-1 text-sm space-y-1 text-[#ffd3d3]">
                          <div className="font-bold text-[#ffdede]">{g.tourName} - {g.matchName}</div>
                          <div>预测胜者：<span className="font-black">{g.pickTeamName}</span></div>
                          <div>投入资金：<span className="text-green-500 font-black">{g.amount}$</span></div>
                          <div>返还比例：{g.teamAName} {Number(g.oddsA || 1).toFixed(2)}x / {g.teamBName} {Number(g.oddsB || 1).toFixed(2)}x</div>
                          <div>预测结果：{g.status === 'PENDING' ? '待结算' : g.success ? <span className="text-green-500 font-black">成功</span> : <span className="text-red-400 font-black">失败</span>}</div>
                          <div>结算资金：<span className="text-green-500 font-black">{Number(g.payout || 0).toLocaleString()}$</span></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
          </div>
          </LetUsGuessBoundary>
        ); } catch (e) { return (
          <div className="max-w-4xl mx-auto bg-[#060000] border border-[#4d0a0a] rounded-2xl p-6 text-[#ff8a8a]">
            <div className="text-xl font-black mb-3">LETUSGUESS 页面渲染异常</div>
            <div className="text-sm mb-4">已触发兜底保护。请先返回主页面再重试。</div>
            <button
              onClick={exitLetUsGuess}
              className="px-4 py-2 rounded-lg border border-[#8f1414] bg-[#1a0303] hover:bg-[#2a0606] text-[#ffb3b3] font-bold"
            >
              返回主页面
            </button>
          </div>
        ); } })()}
        {view === 'ranking' && (
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2"><BarChart3 className="text-blue-500" /><h2 className="text-xl font-bold text-slate-100">全球 VRS 排行榜 (Top 100)</h2></div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                 <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
                  {['Global', 'EU', 'AM', 'AS'].map(r => (
                    <button key={r} onClick={() => setRegionFilter(r)} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${regionFilter === r ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                      {r === 'Global' ? r : <span className={`text-[10px] px-2.5 py-1 rounded-md font-black ${getRegionBadgeClass(r)}`}>{r}</span>}
                    </button>
                  ))}
                 </div>
                 <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
                  <button onClick={() => setSortMode('VRS')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${sortMode === 'VRS' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}>按 VRS</button>
                   <button onClick={() => setSortMode('PRIZE')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${sortMode === 'PRIZE' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}>按赏金</button>
                 </div>
              </div>
            </div>
            <div className={`overflow-x-auto max-h-[75vh] ${SCROLLBAR}`}>
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-500 text-xs uppercase sticky top-0 z-10 shadow-md">
                  <tr><th className="px-6 py-4">Rank</th><th className="px-6 py-4 text-center">Region</th><th className="px-6 py-4">Team</th><th className="px-6 py-4"><div className="flex items-center gap-1">VRS Points {sortMode === 'VRS' && <ArrowDownUp size={12}/>}</div></th><th className="px-6 py-4 text-center">接受邀请成功率</th><th className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-1">Career Earnings {sortMode === 'PRIZE' && <ArrowDownUp size={12}/>}</div></th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {displayTeams.map((team) => (
                    <tr key={team.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono">
                         <span className="text-slate-400 font-bold">#{team.globalRank}</span>
                         {team.regionalRank && <span className="ml-2 text-blue-500 text-xs font-bold">({regionFilter} #{team.regionalRank})</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`text-[10px] px-2.5 py-1 rounded-md font-black ${getRegionBadgeClass(team.region)}`}>{team.region}</span>
                      </td>
                      <td className="px-6 py-4 font-bold cursor-pointer hover:text-blue-400 text-slate-200 hover:underline" onClick={() => { setSelectedTeamId(team.id); setView('team'); }}>
                        <div>{team.name}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {getTeamLevelLabel(team).map(tag => (
                            <span key={tag} className={`text-[10px] px-2 py-0.5 rounded ${tag === TEAM_LABELS.TOP ? 'bg-yellow-500/20 text-yellow-400' : tag === TEAM_LABELS.STRONG ? 'bg-orange-500/20 text-orange-400' : 'bg-fuchsia-500/20 text-fuchsia-400'}`}>{TEAM_LABEL_DISPLAY[tag] || tag}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-orange-400 font-mono font-bold">{team.vrs}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-cyan-300">{Math.max(0, Math.min(100, Math.round(team.stamina || 0)))}%</td>
                      <td className="px-6 py-4 text-right text-green-500 font-mono font-bold">${(team.prizeTotal || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {view === 'team' && selectedTeam && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl flex flex-col items-center shadow-2xl">
              <Shield size={64} className="text-blue-500 mb-4" />
              <h2 className="text-4xl font-black mb-2 tracking-wide text-slate-100">{selectedTeam.name}</h2>
              <div className="mb-3 flex flex-wrap gap-1 justify-center">
                {getTeamLevelLabel(selectedTeam).map(tag => (
                  <span key={tag} className={`text-[10px] px-2 py-0.5 rounded ${tag === TEAM_LABELS.TOP ? 'bg-yellow-500/20 text-yellow-400' : tag === TEAM_LABELS.STRONG ? 'bg-orange-500/20 text-orange-400' : 'bg-fuchsia-500/20 text-fuchsia-400'}`}>{TEAM_LABEL_DISPLAY[tag] || tag}</span>
                ))}
              </div>
              <div className="mb-4">
                <span className={`text-[10px] px-3 py-1 rounded-md font-black ${getRegionBadgeClass(selectedTeam.region)}`}>{selectedTeam.region}</span>
              </div>
              <div className="text-orange-500 font-mono text-2xl font-bold mb-6">VRS: {selectedTeam.vrs} <span className="text-xs text-slate-500 ml-2">STM: {selectedTeam.stamina}</span></div>
              <div className="flex gap-12 text-slate-400 w-full justify-center border-t border-slate-800/80 pt-6">
                <div className="text-center"><div className="text-xs uppercase tracking-widest mb-1 text-slate-500 font-bold">Global Rank</div><div className={`text-2xl font-black ${isDayMode ? 'text-black' : 'text-white'}`}>#{globalRankByTeamId[selectedTeam.id] || '-'}</div></div>
                <div className="text-center"><div className="text-xs uppercase tracking-widest mb-1 text-slate-500 font-bold">Total Earnings</div><div className="text-2xl font-black text-green-500">${(selectedTeam.prizeTotal || 0).toLocaleString()}</div></div>
              </div>
            </div>
            
            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl shadow-xl">
               <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-100"><Trophy className="text-yellow-500"/> 鍘嗗彶鑽ｈ獕璁板綍 (Historical Honors)</h3>
               {(!selectedTeam.honors || selectedTeam.honors.length === 0) ? <div className="text-slate-500 text-center py-12 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">鏆傛棤鍘嗗彶鑽ｈ獕</div> :
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {selectedTeam.honors.map((h, i) => {
                     const c = getHonorColor(h.tier, h.placement);
                     return (
                       <div key={i} onClick={() => {setActiveTourId(h.tourId); setActiveStageIdx('standings'); setView('tournament');}} className={`flex flex-col bg-slate-950 p-5 rounded-xl border ${c.border} shadow-md cursor-pointer hover:scale-[1.02] transition-transform`}>
                         <div className="flex justify-between items-center mb-1"><span className="text-xs text-slate-500 font-mono">{h.date}</span><span className={`text-[10px] font-bold uppercase tracking-wider ${c.text}`}>{h.placement==='1st'?'Champion':'Runner-up'}</span></div>
                         <span className={`font-bold text-lg mb-2 ${c.text}`}>{h.name}</span>
                         <span className="text-green-500 font-mono text-sm">Prize: +${(h.prize || 0).toLocaleString()}</span>
                       </div>
                     );
                   })}
                 </div>
               }
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl shadow-xl mt-6">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-100"><ListOrdered className="text-blue-500"/> 璧涗簨璁板綍 (Tournament History)</h3>
                {teamTournaments.length === 0 ? <div className="text-slate-500 text-center py-12 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">鏆傛棤璧涗簨璁板綍</div> :
                <div className={`overflow-x-auto ${SCROLLBAR}`}>
                    <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                        <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Tournament</th><th className="px-4 py-3">Placement</th><th className="px-4 py-3 text-right">Prize</th><th className="px-4 py-3 text-right">螖 VRS</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {teamTournaments.map(tt => {
                            let standing = tt.standings.find(s => s.team.id === selectedTeam.id);
                            if (!standing) return null;
                            return (
                                <tr key={tt.id} className="hover:bg-slate-800/30 cursor-pointer transition-colors" onClick={() => {setActiveTourId(tt.id); setActiveStageIdx('standings'); setView('tournament');}}>
                                    <td className="px-4 py-3 text-slate-500 font-mono">{tt.startDate}</td>
                                    <td className="px-4 py-3 font-bold text-slate-200">{tt.name}</td>
                                    <td className="px-4 py-3 font-bold text-slate-400">{standing.placement}</td>
                                    <td className="px-4 py-3 text-right text-green-500 font-mono">${(standing.prize || 0).toLocaleString()}</td>
                                    <td className={`px-4 py-3 text-right font-mono font-bold ${(standing.deltaVrs ?? (standing.vrsAfter - standing.vrsBefore)) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {(standing.deltaVrs ?? (standing.vrsAfter - standing.vrsBefore)) >= 0 ? '+' : ''}{standing.deltaVrs ?? (standing.vrsAfter - standing.vrsBefore)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    </table>
                </div>
                }
            </div>
          </div>
        )}

        {view === 'calendar' && (
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black flex items-center gap-2 text-slate-100"><Calendar className="text-blue-500"/> 璧涗簨鏃ュ巻</h2>
              <div className="flex items-center gap-2">
                 <button onClick={() => changeScheduleDate(-1)} className="bg-slate-800 p-2 rounded hover:bg-slate-700 transition"><ArrowLeft size={16}/></button>
                 <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded-lg px-2">
                   <input ref={scheduleDateInputRef} type="date" value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)} className={`bg-transparent px-2 py-2 rounded-lg outline-none font-mono ${isDayMode ? 'text-black' : 'text-white'}`}/>
                   <button type="button" onClick={() => openDatePicker(scheduleDateInputRef)} className="p-1 rounded hover:bg-slate-800/60 transition" aria-label="Open calendar">
                     <Calendar size={14} className={isDayMode ? 'text-slate-700' : 'text-slate-300'} />
                   </button>
                 </div>
                 <button onClick={() => changeScheduleDate(1)} className="bg-slate-800 p-2 rounded hover:bg-slate-700 transition"><ArrowRight size={16}/></button>
              </div>
            </div>
            <div className="mb-6 flex items-center gap-2 text-sm text-slate-300">
              <input id="track-today" type="checkbox" checked={trackCalendarToday} onChange={e => setTrackCalendarToday(e.target.checked)} className="accent-blue-500" />
              <label htmlFor="track-today" className="cursor-pointer">璺熻釜褰撳ぉ锛堝嬀閫夊悗鍦ㄦ湰鐣岄潰鐐瑰嚮鈥滀笅涓€澶┾€濅細鑷姩璺宠浆鍒板綋澶╋級</label>
            </div>
            <div className="space-y-4">
              {scheduledMatchesForDay.length === 0 ? <div className="text-center py-12 text-slate-500 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">当天暂无已排期比赛</div> :
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scheduledMatchesForDay.map((m, idx) => (
                    <div key={idx} className={`relative ${m.status === 'PLAYED' ? 'opacity-80' : ''}`}>
                      <div onClick={() => {setActiveTourId(m.tourId); setActiveStageIdx(0); setView('tournament');}} className={`absolute -top-3 left-4 text-[10px] font-bold tracking-widest uppercase cursor-pointer z-20 px-1 rounded hover:underline ${m.status === 'PLAYED' ? 'text-green-400 bg-[#121926]' : 'text-blue-400 bg-slate-950'}`}>{m.tourName} - {m.name}</div>
                      <UnifiedMatchNode m={m} />
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-12">
            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
               <span className="font-bold text-sm text-slate-400">赛事级别筛选</span>
               {['ALL', ...TIER_ORDER].map(tf => (
                <button key={tf} onClick={()=>setHistoryTierFilter(tf)} className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${historyTierFilter===tf ? 'bg-blue-600 text-white':'bg-slate-800 text-slate-500 hover:text-slate-300'}`}>{TOURNAMENT_TIERS[tf]?.name || 'ALL'}</button>
               ))}
            </div>

            {Object.keys(groupedHistory).length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-inner">鏆傛棤璧涗簨鍘嗗彶璁板綍</div>
            ) : (
              orderedHistoryFormats.map((formatId) => {
                const formatGroup = groupedHistory[formatId];
                let sortedTiers = TIER_ORDER.filter(tId => formatGroup[tId] && (historyTierFilter === 'ALL' || historyTierFilter === tId));
                if(sortedTiers.length === 0) return null;
                
                return (
                  <div key={formatId} className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                    <h2 className="text-3xl font-black text-blue-500 mb-6 border-b border-slate-800 pb-4">{FORMATS[formatId].name} Series</h2>
                    {sortedTiers.map(tierId => (
                      <div key={tierId} className="mb-8 last:mb-0 pl-4 border-l-2 border-slate-800">
                        <h3 className="text-lg font-bold text-slate-300 mb-4">{TOURNAMENT_TIERS[tierId].name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {formatGroup[tierId].map(h => (
                            <div key={h.id} onClick={() => { setActiveTourId(h.id); setActiveStageIdx('standings'); setView('tournament'); }} className={`border p-6 rounded-2xl cursor-pointer transition-all shadow-lg flex flex-col ${h.status==='COMPLETED'?'bg-slate-900/80 border-slate-800 hover:border-blue-500':'bg-slate-950 border-orange-500/30 hover:border-orange-500'}`}>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-500 font-mono">Inv: {h.invDate} | Start: {h.startDate}</span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${h.status==='COMPLETED'?'bg-slate-800 text-slate-400':h.status==='ACTIVE'?'bg-green-500/20 text-green-500':'bg-orange-500/20 text-orange-500'}`}>{h.status}</span>
                              </div>
                              <h3 className={`text-xl font-black mb-auto pb-4 ${isDayMode ? 'text-black' : 'text-white'}`}>{h.name}</h3>
                              {h.status === 'COMPLETED' ? (
                                <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
                                  <div className="flex items-center gap-2"><Trophy size={16} className="text-yellow-500" /><span className="font-bold text-slate-300">{h.champion?.name}</span></div>
                                  <span className="text-green-500 font-mono text-sm">${(h.prize || 0).toLocaleString()}</span>
                                </div>
                              ) : (
                                <div className="border-t border-slate-800 pt-4 mt-2 text-xs text-slate-500">Prize: ${(h.prize || 0).toLocaleString()}</div>
                              )}
                            </div>
                          )).reverse()}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })
            )}
          </div>
        )}

        {view === 'organize' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-3xl font-black mb-8 flex items-center gap-3 text-slate-100"><span className="bg-blue-500/20 text-blue-500 p-2 rounded-xl"><Calendar /></span> 鍒涘缓璧涗簨</h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">1. 鍩虹璧涘埗</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(FORMATS).map(f => (
                    <div key={f.id} onClick={() => handleFormatChange(f.id)} className={`p-3 rounded-xl border cursor-pointer font-bold transition-all text-center ${config.format === f.id ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'}`}>{f.name}</div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">2. 璧涗簨妗ｆ (Tiers)</label>
                <div className="grid grid-cols-3 gap-2">
                  {FORMATS[config.format].allowedTiers.map(tId => (
                    <div key={tId} onClick={() => setConfig({...config, tier: tId})} className={`p-3 rounded-xl border cursor-pointer transition-all text-center ${config.tier === tId ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'}`}>
                      <div className="font-bold text-sm">{TOURNAMENT_TIERS[tId].name}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">3. 邀请截止日期</label>
                <div className="w-full flex items-center gap-1 bg-slate-950 border border-slate-700 focus-within:border-blue-500 rounded-xl px-2">
                  <input ref={organizeDateInputRef} type="date" value={config.invDate} min={addDays(state.currentDate, 1)} onChange={e => setConfig({...config, invDate: e.target.value})} className={`w-full bg-transparent px-2 py-3 font-mono outline-none ${isDayMode ? 'text-black' : 'text-white'}`}/>
                  <button type="button" onClick={() => openDatePicker(organizeDateInputRef)} className="p-1 rounded hover:bg-slate-800/60 transition" aria-label="Open calendar">
                    <Calendar size={15} className={isDayMode ? 'text-slate-700' : 'text-slate-300'} />
                  </button>
                </div>
              </div>
              {['MAJOR', 'IEM', 'BLAST'].includes(config.format) && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">4. 涓惧姙鍩庡競</label>
                  <input
                    type="text"
                    value={citySearch}
                    onChange={e => {
                      const value = e.target.value;
                      const exact = cityLookup[value.trim().toLowerCase()] || '';
                      setCitySearch(value);
                      setConfig({ ...config, nameInput: exact });
                    }}
                    placeholder="Search city, e.g. Copenhagen"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white font-bold outline-none"
                  />
                  <div className="mt-2 max-h-40 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-2 space-y-1">
                    {citySearchResult.map(city => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => { setCitySearch(city); setConfig({ ...config, nameInput: city }); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${config.nameInput === city ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                      >
                        {city}
                      </button>
                    ))}
                    {citySearchResult.length === 0 && (
                      <div className="px-3 py-2 text-sm text-slate-500">No city found in preset list.</div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    宸查€夋嫨: <span className="text-slate-300 font-semibold">{config.nameInput || '鏈€夋嫨'}</span>
                  </div>
                </div>
              )}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center mt-4">
                 <div><div className="text-[10px] text-slate-500 uppercase font-bold mb-1">鎬诲閲戦</div><div className="text-2xl font-mono font-black text-green-500">${calculatePrize(config.format, config.tier).toLocaleString()}</div></div>
                 <DollarSign size={32} className="text-slate-800" />
              </div>
              {errorMsg && <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm font-bold">{errorMsg}</div>}
              <button onClick={handleCreateTournament} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] mt-4">创建赛事并加入赛事日历</button>
            </div>
          </div>
        )}

        {view === 'tournament' && activeTour && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
              <h2 className="text-3xl font-black mb-2 text-slate-100">{activeTour.name}</h2>
              <div className="flex justify-center gap-6 text-slate-400 text-xs mb-6 font-mono">
                <span>INV: {activeTour.invDate}</span><span>START: {activeTour.startDate}</span>
                <span className="text-green-500">PRIZE: ${(activeTour.prize || 0).toLocaleString()}</span>
                <span className="text-orange-500">HEAT SUM: {Math.round(activeTourHeat || 0).toLocaleString()}</span>
                <span className="text-orange-400 uppercase tracking-widest">STATUS: {activeTour.status}</span>
              </div>
              {activeTour.champion && (
                <div className="bg-green-600/10 border border-green-500/30 p-4 rounded-xl inline-block min-w-[200px] shadow-lg">
                  <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest mb-1">Champion</p>
                  <h3 className={`text-xl font-black cursor-pointer hover:underline ${isDayMode ? 'text-black' : 'text-white'}`} onClick={() => {setSelectedTeamId(activeTour.champion.id); setView('team');}}>{activeTour.champion.name}</h3>
                </div>
              )}
            </div>

            {activeTour.status === 'PENDING' && (
              <TournamentPredictTable tour={activeTour} state={state} getRegionBadgeClass={getRegionBadgeClass} />
            )}

            {activeTour.stages?.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2">
                <button onClick={() => setActiveStageIdx('standings')} className={`px-6 py-2 rounded-xl font-bold whitespace-nowrap text-sm ${activeStageIdx === 'standings' ? 'bg-yellow-600 text-slate-900 shadow-md' : 'bg-slate-900 border border-slate-800 text-yellow-500 hover:bg-slate-800'}`}>Standings</button>
                <button onClick={() => setActiveStageIdx('participants')} className={`px-6 py-2 rounded-xl font-bold whitespace-nowrap text-sm ${activeStageIdx === 'participants' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-900 border border-slate-800 text-blue-400 hover:bg-slate-800'}`}>Participants</button>
                {activeTour.stages.map((stage, idx) => (
                  <button key={idx} onClick={() => setActiveStageIdx(idx)} className={`px-6 py-2 rounded-xl font-bold whitespace-nowrap text-sm ${activeStageIdx === idx ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'}`}>{stage.name}</button>
                ))}
              </div>
            )}

            {activeStageIdx === 'standings' ? (
              activeTour.status === 'COMPLETED' ? (
                <TournamentStandingsTable standings={activeTour.standings} onTeamClick={(t) => {setSelectedTeamId(t.id); setView('team');}} isDayMode={isDayMode} />
              ) : activeTour.stages?.[0] ? <StageViewer stage={activeTour.stages[0]} /> : <div className="text-center p-12 text-slate-500">鏆傛棤鍙睍绀虹殑璧涚▼鏁版嵁</div>
            ) : activeStageIdx === 'participants' ? (
              <TournamentParticipantsTable participants={activeTour.participants} onTeamClick={(t) => {setSelectedTeamId(t.id); setView('team');}} getRegionBadgeClass={getRegionBadgeClass} globalRankByTeamId={globalRankByTeamId} />
            ) : activeStageIdx !== 'standings' && activeStageIdx !== 'participants' && activeTour.stages[activeStageIdx] ? (
              <StageViewer stage={activeTour.stages[activeStageIdx]} />
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}

