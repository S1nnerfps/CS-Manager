import React, { useState, useMemo } from 'react';
import { Trophy, Users, Sword, BarChart3, PlusCircle, Calendar, DollarSign, CheckCircle2, ChevronDown, ChevronUp, Check, Shield, History, ArrowDownUp, Clock, ListOrdered, ArrowLeft, ArrowRight, CheckSquare, Globe } from 'lucide-react';

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

const FORMATS = {
  MAJOR: { id: 'MAJOR', name: 'Major', teams: 32, basePrize: 2000000, allowedTiers: ['HIGHEST'] },
  IEM: { id: 'IEM', name: 'IEM', teams: 16, basePrize: 1500000, allowedTiers: ['HIGHEST', 'TIER_S', 'TIER_1'] },
  EWC: { id: 'EWC', name: 'EWC', teams: 16, basePrize: 1500000, allowedTiers: ['HIGHEST'] },
  BLAST: { id: 'BLAST', name: 'BLAST', teams: 8, basePrize: 1000000, allowedTiers: ['HIGHEST', 'TIER_S', 'TIER_1'] },
  EPL: { id: 'EPL', name: 'EPL', teams: 24, basePrize: 800000, allowedTiers: ['HIGHEST', 'TIER_S', 'TIER_1', 'TIER_2', 'TIER_3', 'TIER_OPEN'] },
};

const PLACEMENT_WEIGHTS = {
  "1st": 5000, "2nd": 2000, "3rd": 1000, "4th": 800, "3rd-4th": 900,
  "5th-6th": 400, "7th-8th": 300, "5th-8th": 350,
  "9th-11th": 150, "12th-14th": 100, "15th-16th": 75,
  "17th-19th": 50, "20th-22nd": 35, "23rd-24th": 25,
  "25th-27th": 15, "28th-30th": 10, "31st-32nd": 3.5,
  "9th-12th": 100, "13th-16th": 40,
  "9th-16th": 70, "17th-24th": 30
};

const ESPORTS_CITIES = [
  "Shanghai", "Beijing", "Chengdu", "Guangzhou", "Shenzhen", "Wuhan", "Hangzhou", "Nanjing", "Xi'an", "Chongqing",
  "Hong Kong", "Taipei", "Seoul", "Busan", "Tokyo", "Yokohama", "Osaka", "Kyoto", "Nagoya", "Sapporo",
  "Singapore", "Bangkok", "Kuala Lumpur", "Jakarta", "Manila", "Ho Chi Minh City", "Hanoi", "Mumbai", "Delhi", "Bengaluru",
  "Sydney", "Melbourne", "Perth", "Brisbane", "Auckland", "Wellington", "Los Angeles", "San Francisco", "Seattle", "Austin",
  "Dallas", "Houston", "Chicago", "Atlanta", "New York", "Boston", "Philadelphia", "Washington", "Miami", "Phoenix",
  "Las Vegas", "Denver", "San Diego", "Orlando", "Toronto", "Vancouver", "Montreal", "Ottawa", "Calgary", "Edmonton",
  "Mexico City", "Guadalajara", "Monterrey", "Sao Paulo", "Rio de Janeiro", "Brasilia", "Curitiba", "Porto Alegre", "Buenos Aires", "Santiago",
  "Lima", "Bogota", "Quito", "Medellin", "London", "Manchester", "Birmingham", "Paris", "Lyon", "Marseille",
  "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Amsterdam", "Rotterdam", "Brussels", "Madrid", "Barcelona",
  "Valencia", "Lisbon", "Porto", "Rome", "Milan", "Naples", "Stockholm", "Copenhagen", "Helsinki", "Warsaw"
];

const SCROLLBAR = "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#0f172a] [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-[#1e3a8a] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-[#2563eb]";

const calculatePrize = (formatId, tierId) => Math.round((FORMATS[formatId]?.basePrize || 0) * (TOURNAMENT_TIERS[tierId]?.multiplier || 0));

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

  return { tA, tB, scoreA: mapsA, scoreB: mapsB, winner, loser, details, change: Math.abs(chgA) };
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

const createMatchNode = (id, name, group, isBO5, tag) => ({ id, name: String(name), groupName: String(group), tA: null, tB: null, winnerTo: null, loserTo: null, status: 'PENDING', isBO5, loserTag: tag ? String(tag) : null, date: null, details: [] });

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

const doInvitationAndInit = (tour, state) => {
  let pool = [...state.teams].sort((a,b) => (state.vrsMap[b.id]||1000) - (state.vrsMap[a.id]||1000)).slice(TOURNAMENT_TIERS[tour.tierId].banTop);
  let accepted = [], rejected = [];
  for(let t of pool) {
    if(accepted.length >= tour.size) break;
    Math.random() < ((state.staminaMap[t.id]||100)/100) ? accepted.push(t) : rejected.push(t);
  }
  if(accepted.length < tour.size) accepted.push(...rejected.slice().reverse().slice(0, tour.size - accepted.length));
  
  tour.participants = accepted.sort((a,b)=>(state.vrsMap[b.id]||1000)-(state.vrsMap[a.id]||1000)).map((t,i)=>({ ...t, seed: i+1 }));
  tour.initialVrs = {};
  tour.participants.forEach(t => { tour.initialVrs[t.id] = state.vrsMap[t.id] || 1000; });
  
  let curDate = tour.startDate, sId = 1000;
  if(tour.formatId === 'EWC') {
    tour.stages = [buildSingleElim('Playoffs', 16, tour.tierId==='HIGHEST', sId, curDate)];
  } else if (tour.formatId === 'MAJOR') {
    let st1 = buildSwissStage('Challengers', 16, sId, curDate); curDate = addDays(st1.nextDate, TOURNAMENT_TIERS[tour.tierId].rest); sId = st1.nextId;
    let st2 = buildSwissStage('Legends', 16, sId, curDate); curDate = addDays(st2.nextDate, TOURNAMENT_TIERS[tour.tierId].rest); sId = st2.nextId;
    let st3 = buildSwissStage('Champions', 16, sId, curDate); curDate = addDays(st3.nextDate, TOURNAMENT_TIERS[tour.tierId].rest); sId = st3.nextId;
    let po = buildSingleElim('Playoffs', 8, tour.tierId==='HIGHEST', sId, curDate);
    tour.stages = [st1, st2, st3, po];
  } else if (tour.formatId === 'EPL') {
    let st1 = buildSwissStage('Stage 1', 16, sId, curDate); curDate = addDays(st1.nextDate, TOURNAMENT_TIERS[tour.tierId].rest); sId = st1.nextId;
    let st2 = buildSwissStage('Stage 2', 16, sId, curDate); curDate = addDays(st2.nextDate, TOURNAMENT_TIERS[tour.tierId].rest); sId = st2.nextId;
    let po = buildSingleElim('Playoffs', 8, tour.tierId==='HIGHEST', sId, curDate);
    tour.stages = [st1, st2, po];
  } else if (tour.formatId === 'IEM') {
    let grA = buildIEMGroup('GrA', sId, curDate); sId = grA.nextId;
    let grB = buildIEMGroup('GrB', sId, curDate); sId = grB.nextId;
    let nextDate = grB.nextDate; 
    let allNodes = [...grA.nodes, ...grB.nodes];
    let combGrp = { type: 'IEM_GROUPS', name: 'Group Stage', nodes: allNodes, nextDate, groups: [{name:'Group A', upperRounds: grA.upperRounds, lowerRounds: grA.lowerRounds}, {name:'Group B', upperRounds: grB.upperRounds, lowerRounds: grB.lowerRounds}] };
    let po = buildSingleElim('Playoffs', 6, tour.tierId==='HIGHEST', sId, addDays(nextDate, TOURNAMENT_TIERS[tour.tierId].rest));
    tour.stages = [combGrp, po];
  } else if (tour.formatId === 'BLAST') {
    tour.stages = [buildBLASTBracket('Blast Finals', tour.tierId==='HIGHEST', sId, curDate)];
  }

  let stg0 = tour.stages[0];
  let firstPool = tour.participants;
  if(tour.formatId === 'MAJOR') firstPool = tour.participants.slice(16,32);
  else if (tour.formatId === 'EPL') firstPool = tour.participants.slice(8,24);
  
  if (stg0.type === 'SWISS') {
    let g00 = stg0.rounds[0].groups[0].matchIds;
    for(let i=0; i<firstPool.length-1; i+=2) { 
      let m = stg0.nodes.find(n=>n.id===g00[i/2]);
      if(m) { m.tA={...firstPool[i]}; m.tB={...firstPool[i+1]}; }
    }
    stg0.records = firstPool.map(t => ({ team: t, seed: t.seed, w: 0, l: 0 }));
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
};

const finishTournament = (tour, state) => {
  tour.status = 'COMPLETED';
  const validPrize = tour.prize || 0;
  let totalW = tour.placements.reduce((sum, p) => sum + (PLACEMENT_WEIGHTS[p.tag] || 0), 0) || 1;
  
  tour.standings = tour.placements.map(p => ({
    placement: String(p.tag), team: p.team, 
    prize: Math.round(validPrize * ((PLACEMENT_WEIGHTS[p.tag] || 0) / totalW)),
    vrsBefore: tour.initialVrs?.[p.team.id] ?? p.vrsBefore ?? 1000, 
    vrsAfter: state.vrsMap[p.team.id] || 1000
  })).sort((a, b) => {
     const diff = (PLACEMENT_WEIGHTS[b.placement] || 0) - (PLACEMENT_WEIGHTS[a.placement] || 0);
     if (diff !== 0) return diff;
     return b.vrsAfter - a.vrsAfter;
  });

  tour.champion = tour.standings.find(s=>s.placement==='1st')?.team;

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
};

const getSwissElimTag = (b, w) => {
  if (b === 24) return w === 2 ? "25th-27th" : w === 1 ? "28th-30th" : "31st-32nd";
  if (b === 16) return w === 2 ? "17th-19th" : w === 1 ? "20th-22nd" : "23rd-24th";
  if (b === 8)  return w === 2 ? "9th-11th" : w === 1 ? "12th-14th" : "15th-16th";
  return "Unknown";
};

const playMatchEngineInstance = (m, state) => {
  let res = playMatchEngine(m.tA, m.tB, state, m.isBO5);
  Object.assign(m, res); m.status = 'PLAYED';
  return m;
};

const processDayTick = (tour, state, dateStr) => {
  if (tour.status !== 'ACTIVE') return;
  if (tour.rest > 0) { tour.rest--; return; }
  
  let stg = tour.stages[tour.currentStageIdx];
  let unplayedToday = stg.nodes.filter(m => m.status === 'PENDING' && m.date === dateStr && m.tA && m.tB);
  
  unplayedToday.forEach(m => {
    playMatchEngineInstance(m, state);
    
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
        let p = groups[k].sort((a,b)=>a.seed-b.seed);
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
      if(tour.formatId === 'MAJOR' && tour.currentStageIdx === 1) pool = [...tour.participants.slice(8,16), ...pool];
      if(tour.formatId === 'MAJOR' && tour.currentStageIdx === 2) pool = [...tour.participants.slice(0,8), ...pool];
      if(tour.formatId === 'EPL' && tour.currentStageIdx === 1) pool = [...tour.participants.slice(0,8), ...pool];
      
      pool = pool.sort((a,b)=>(state.vrsMap[b.id]||1000)-(state.vrsMap[a.id]||1000)).map((t,i)=>({...t, seed: i+1}));
      
      if (nextStg.type === 'SWISS') {
        let g00 = nextStg.rounds[0].groups[0].matchIds;
        for(let i=0; i<pool.length-1; i+=2) { 
          let m = nextStg.nodes.find(n=>n.id===g00[i/2]);
          if(m) { m.tA={...pool[i]}; m.tB={...pool[i+1]}; }
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
              target === 'A' ? <span className="text-[#38bdf8] text-xs">☠</span> : <span className="text-[#fbbf24] text-xs">☠</span>
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
    if (!isPlayed) return 'text-slate-300';
    return isAWin ? 'text-green-400' : 'text-red-500 opacity-80';
  };
  const getTextB = () => {
    if (!isPlayed) return 'text-slate-300';
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
             <span className="text-[9px]">展开详情</span>
          </button>
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
            {r.groups?.map((g, j) => (
              <div key={j} className="flex flex-col gap-2">
                {stage.type === 'SWISS' && <div className="text-center text-[10px] text-blue-400 font-black mb-1 tracking-widest uppercase bg-blue-500/10 py-1 rounded">Bracket {g.name}</div>}
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

const TournamentStandingsTable = ({ standings, onTeamClick }) => (
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
            <th className="px-6 py-4 text-right">Δ VRS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {(standings || []).map((s, i) => (
            <tr key={i} className="hover:bg-slate-800/30 transition-colors">
              <td className="px-6 py-3 font-bold text-slate-300">{s.placement}</td>
              <td className="px-6 py-3 font-bold cursor-pointer hover:text-blue-400 hover:underline text-slate-200" onClick={() => onTeamClick(s.team)}>{s.team.name}</td>
              <td className="px-6 py-3 text-right text-green-500 font-mono font-bold">${(s.prize || 0).toLocaleString()}</td>
              <td className="px-6 py-3 font-mono text-slate-500">{s.vrsBefore}</td>
              <td className="px-6 py-3 font-mono text-white">{s.vrsAfter}</td>
              <td className={`px-6 py-3 font-mono font-bold text-right ${s.vrsAfter-s.vrsBefore >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {s.vrsAfter-s.vrsBefore >= 0 ? '+' : ''}{s.vrsAfter-s.vrsBefore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const TournamentParticipantsTable = ({ participants, onTeamClick }) => (
  <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
    <div className="p-6 border-b border-slate-800 flex items-center gap-2">
      <Users className="text-blue-500" />
      <h2 className="text-xl font-bold text-slate-100">Invited Teams List</h2>
    </div>
    <div className={`overflow-x-auto max-h-[60vh] ${SCROLLBAR}`}>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-950 text-slate-400 uppercase text-xs sticky top-0 z-10">
          <tr><th className="px-6 py-4">Seed (CSTV Rank)</th><th className="px-6 py-4">Team</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {(participants || []).map((t, i) => (
            <tr key={i} className="hover:bg-slate-800/30 transition-colors">
              <td className="px-6 py-3 font-mono text-slate-400 font-bold">#{t.seed}</td>
              <td className="px-6 py-3 font-bold cursor-pointer hover:text-blue-400 text-slate-200 hover:underline" onClick={() => onTeamClick(t)}>{t.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const TournamentPredictTable = ({ tour, state }) => {
  let pool = [...state.teams].sort((a,b) => (state.vrsMap[b.id]||1000) - (state.vrsMap[a.id]||1000)).slice(TOURNAMENT_TIERS[tour.tierId].banTop);
  let predicted = pool.slice(0, tour.size);
  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <Clock className="text-blue-500" />
        <h2 className="text-xl font-bold text-slate-100">VRS 邀请名额预测 (VRS Invitation Prediction)</h2>
      </div>
      <div className={`overflow-x-auto max-h-[60vh] ${SCROLLBAR}`}>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950 text-slate-400 uppercase text-xs sticky top-0 z-10">
            <tr><th className="px-6 py-4">Predicted Seed</th><th className="px-6 py-4">Team</th><th className="px-6 py-4">Current VRS</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {predicted.map((t, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-3 font-mono text-slate-400 font-bold">#{i+1}</td>
                <td className="px-6 py-3 font-bold text-slate-200">{t.name}</td>
                <td className="px-6 py-3 font-mono text-orange-400">{state.vrsMap[t.id]}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
  const [citySearch, setCitySearch] = useState('');

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
      next.teams = prev.teams.map(t => ({...t, vrs: next.vrsMap[t.id], stamina: next.staminaMap[t.id]}));
      return next;
    });
  };

  const handleCreateTournament = () => {
    setErrorMsg('');
    let eName = config.nameInput.trim();
    if(['MAJOR','IEM','BLAST'].includes(config.format) && !eName) return setErrorMsg("Please select a city from the preset list.");
    if(['MAJOR','IEM','BLAST'].includes(config.format) && !ESPORTS_CITIES.includes(eName)) return setErrorMsg("City must come from the preset list.");
    if(config.invDate <= state.currentDate) return setErrorMsg("邀请日期必须在当前日期之后！");
    if(state.tournaments.some(t => t.invDate === config.invDate)) return setErrorMsg("不能在同一天设置两个赛事的邀请日！");
    if(config.format === 'EWC' && state.tournaments.some(t => t.formatId === 'EWC' && t.invDate.startsWith(config.invDate.substring(0,4)))) return setErrorMsg("EWC 每年只能举办一次！");

    setState(prev => {
      const year = config.invDate.substring(0,4);
      const newCounters = { ...prev.eplCounters };
      let tName = '';

      if(config.format==='MAJOR') tName = `${eName} Major ${year}`;
      else if(config.format==='EWC') { tName = `Esports World Cup ${newCounters.EWC}`; newCounters.EWC++; }
      else if(config.format==='IEM') tName = `Intel Extreme Masters ${eName} ${year}`;
      else if(config.format==='BLAST') {
        if(config.tier==='HIGHEST') tName = `BLAST Grand Final ${eName} ${year}`;
        else if(config.tier==='TIER_S') tName = `BLAST Rivals ${eName} ${year}`;
        else tName = `BLAST Open ${eName} ${year}`;
      } else if(config.format==='EPL') {
        let c = newCounters[config.tier];
        if(config.tier==='HIGHEST') tName = `ESL PRO LEAGUE ${c}`; else if(config.tier==='TIER_S') tName = `ESL HIGH ${c}`;
        else if(config.tier==='TIER_1') tName = `ESL POWER ${c}`; else if(config.tier==='TIER_2') tName = `ESL WILD ${c}`;
        else if(config.tier==='TIER_3') tName = `ECL PRO ${c}`; else tName = `ECL OPEN ${c}`;
        newCounters[config.tier]++;
      }

      return {
        ...prev, nextTournamentId: prev.nextTournamentId + 1, eplCounters: newCounters,
        tournaments: [...prev.tournaments, {
          id: prev.nextTournamentId, status: 'PENDING',
          name: String(tName), formatId: String(config.format), tierId: String(config.tier),
          prize: calculatePrize(config.format, config.tier),
          size: FORMATS[config.format].teams,
          invDate: String(config.invDate), startDate: addDays(config.invDate, TOURNAMENT_TIERS[config.tier].delay),
          stages: [], currentStageIdx: 0, rest: 0, placements: [], date: String(config.invDate), initialVrs: {}
        }]
      };
    });
    setView('ongoing');
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

  const teamTournaments = useMemo(() => {
    if (!selectedTeam) return [];
    return state.tournaments
      .filter(t => t.status === 'COMPLETED' && t.standings?.some(s => s.team.id === selectedTeam.id))
      .sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || '')) || b.id - a.id);
  }, [state.tournaments, selectedTeam]);

  const changeScheduleDate = (offset) => setScheduleDate(addDays(scheduleDate, offset));

  const scheduledMatchesForDay = useMemo(() => {
    let formal = [], ongoing = [];
    state.tournaments.forEach(t => {
      t.stages.forEach(st => {
        st.nodes?.forEach(m => {
          if (m.date === scheduleDate && m.tA && m.tB) {
             m.status === 'PLAYED' ? formal.push({tourId: t.id, tourName: t.name, ...m}) : ongoing.push({tourId: t.id, tourName: t.name, ...m});
          }
        });
      });
    });
    return { formal, ongoing };
  }, [state.tournaments, scheduleDate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto w-full flex justify-center mb-6">
        <h1 className="text-2xl md:text-4xl lg:text-[42px] xl:text-[46px] font-black text-slate-100 tracking-widest uppercase whitespace-nowrap">
          Counter-Strike 2 Event Manager
        </h1>
      </div>

      <nav className={`max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4 mb-8 bg-slate-900/80 p-4 rounded-2xl shadow-xl border border-slate-800`}>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <button onClick={() => setView('ranking')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-bold ${view === 'ranking' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}`}><Globe size={16}/> 榜单</button>
          <button onClick={() => setView('organize')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-bold ${view === 'organize' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}`}><PlusCircle size={16}/> 办赛</button>
          <button onClick={() => setView('history')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-bold ${view === 'history' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}`}><ListOrdered size={16}/> 赛事库</button>
          <button onClick={() => { setView('ongoing'); setScheduleDate(state.currentDate); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-bold ${view === 'ongoing' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}`}><Calendar size={16}/> Ongoing</button>
          <button onClick={() => { setView('formal'); setScheduleDate(state.currentDate); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-bold ${view === 'formal' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}`}><CheckSquare size={16}/> Formal</button>
          {activeTour && <button onClick={() => setView('tournament')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-bold ${view === 'tournament' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-yellow-500 hover:bg-slate-800'}`}><Sword size={16}/> 现场</button>}
        </div>
        <div className="flex flex-wrap items-center gap-4 min-w-0">
          <div className="font-mono text-xl font-black text-orange-500 tracking-widest">{state.currentDate}</div>
          <button onClick={handleAdvanceDay} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 px-6 py-2 rounded-lg font-black transition-all shadow-lg hover:shadow-orange-500/30 flex items-center gap-2">下一天 <Clock size={16}/></button>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto">
        {view === 'ranking' && (
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2"><BarChart3 className="text-blue-500" /><h2 className="text-xl font-bold text-slate-100">世界战队 VRS 排名 (Top 100)</h2></div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                 <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
                   {['Global', 'EU', 'AM', 'AS'].map(r => (
                     <button key={r} onClick={() => setRegionFilter(r)} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${regionFilter === r ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>{r}</button>
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
                  <tr><th className="px-6 py-4">Rank</th><th className="px-6 py-4 text-center">Region</th><th className="px-6 py-4">Team</th><th className="px-6 py-4"><div className="flex items-center gap-1">VRS Points {sortMode === 'VRS' && <ArrowDownUp size={12}/>}</div></th><th className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-1">Career Earnings {sortMode === 'PRIZE' && <ArrowDownUp size={12}/>}</div></th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {displayTeams.map((team) => (
                    <tr key={team.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono">
                         <span className="text-slate-400 font-bold">#{team.globalRank}</span>
                         {team.regionalRank && <span className="ml-2 text-blue-500 text-xs font-bold">({regionFilter} #{team.regionalRank})</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="text-[10px] bg-slate-800 px-2 py-1 rounded-md font-black text-slate-400">{team.region}</span>
                      </td>
                      <td className="px-6 py-4 font-bold cursor-pointer hover:text-blue-400 text-slate-200 hover:underline" onClick={() => { setSelectedTeamId(team.id); setView('team'); }}>{team.name}</td>
                      <td className="px-6 py-4 text-orange-400 font-mono font-bold">{team.vrs}</td>
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
              <div className="text-orange-500 font-mono text-2xl font-bold mb-6">VRS: {selectedTeam.vrs} <span className="text-xs text-slate-500 ml-2">STM: {selectedTeam.stamina}</span></div>
              <div className="flex gap-12 text-slate-400 w-full justify-center border-t border-slate-800/80 pt-6">
                <div className="text-center"><div className="text-xs uppercase tracking-widest mb-1 text-slate-500 font-bold">Global Rank</div><div className="text-2xl font-black text-white">#{globalRankByTeamId[selectedTeam.id] || '-'}</div></div>
                <div className="text-center"><div className="text-xs uppercase tracking-widest mb-1 text-slate-500 font-bold">Total Earnings</div><div className="text-2xl font-black text-green-500">${(selectedTeam.prizeTotal || 0).toLocaleString()}</div></div>
              </div>
            </div>
            
            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl shadow-xl">
               <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-100"><Trophy className="text-yellow-500"/> 历史荣誉记录 (Historical Honors)</h3>
               {(!selectedTeam.honors || selectedTeam.honors.length === 0) ? <div className="text-slate-500 text-center py-12 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">暂无卓越荣誉</div> :
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
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-100"><ListOrdered className="text-blue-500"/> 比赛记录 (Tournament History)</h3>
                {teamTournaments.length === 0 ? <div className="text-slate-500 text-center py-12 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">暂无比赛记录</div> :
                <div className={`overflow-x-auto ${SCROLLBAR}`}>
                    <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                        <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Tournament</th><th className="px-4 py-3">Placement</th><th className="px-4 py-3 text-right">Prize</th><th className="px-4 py-3 text-right">Δ VRS</th></tr>
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
                                    <td className={`px-4 py-3 text-right font-mono font-bold ${standing.vrsAfter - standing.vrsBefore >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {standing.vrsAfter - standing.vrsBefore >= 0 ? '+' : ''}{standing.vrsAfter - standing.vrsBefore}
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

        {(view === 'ongoing' || view === 'formal') && (
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black flex items-center gap-2 text-slate-100"><Calendar className="text-blue-500"/> {view === 'ongoing' ? 'Ongoing Events (待办/未来赛程)' : 'Formal Events (已结束赛程)'}</h2>
              <div className="flex items-center gap-2">
                 <button onClick={() => changeScheduleDate(-1)} className="bg-slate-800 p-2 rounded hover:bg-slate-700 transition"><ArrowLeft size={16}/></button>
                 <input type="date" value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)} className="bg-slate-950 border border-slate-700 text-white px-4 py-2 rounded-lg outline-none font-mono"/>
                 <button onClick={() => changeScheduleDate(1)} className="bg-slate-800 p-2 rounded hover:bg-slate-700 transition"><ArrowRight size={16}/></button>
              </div>
            </div>
            <div className="space-y-4">
              {view === 'ongoing' ? (
                 scheduledMatchesForDay.ongoing.length === 0 ? <div className="text-center py-12 text-slate-500 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">该日无待办赛事</div> : 
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {scheduledMatchesForDay.ongoing.map((m, idx) => (
                       <div key={idx} className="relative">
                         <div onClick={() => {setActiveTourId(m.tourId); setActiveStageIdx('standings'); setView('tournament');}} className="absolute -top-3 left-4 text-[10px] text-blue-400 font-bold tracking-widest uppercase cursor-pointer z-20 bg-slate-950 px-1 rounded hover:underline">{m.tourName} - {m.name}</div>
                         <UnifiedMatchNode m={m} />
                       </div>
                     ))}
                   </div>
              ) : (
                 scheduledMatchesForDay.formal.length === 0 ? <div className="text-center py-12 text-slate-500 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">该日无完结记录</div> : 
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {scheduledMatchesForDay.formal.map((m, idx) => (
                       <div key={idx} className="relative opacity-80">
                         <div onClick={() => {setActiveTourId(m.tourId); setActiveStageIdx('standings'); setView('tournament');}} className="absolute -top-3 left-4 text-[10px] text-green-400 font-bold tracking-widest uppercase cursor-pointer z-20 bg-[#121926] px-1 rounded hover:underline">{m.tourName} - {m.name}</div>
                         <UnifiedMatchNode m={m} />
                       </div>
                     ))}
                   </div>
              )}
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-12">
            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
               <span className="font-bold text-sm text-slate-400">级别筛选：</span>
               {['ALL', ...TIER_ORDER].map(tf => (
                 <button key={tf} onClick={()=>setHistoryTierFilter(tf)} className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${historyTierFilter===tf ? 'bg-blue-600 text-white':'bg-slate-800 text-slate-500 hover:text-slate-300'}`}>{TOURNAMENT_TIERS[tf]?.name || '全部'}</button>
               ))}
            </div>

            {Object.keys(groupedHistory).length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-inner">暂无赛事记录。</div>
            ) : (
              Object.entries(groupedHistory).map(([formatId, formatGroup]) => {
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
                              <h3 className="text-xl font-black mb-auto pb-4 text-white">{h.name}</h3>
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
            <h2 className="text-3xl font-black mb-8 flex items-center gap-3 text-slate-100"><span className="bg-blue-500/20 text-blue-500 p-2 rounded-xl"><Calendar /></span> 创建世界级赛事</h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">1. 基础赛制</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(FORMATS).map(f => (
                    <div key={f.id} onClick={() => handleFormatChange(f.id)} className={`p-3 rounded-xl border cursor-pointer font-bold transition-all text-center ${config.format === f.id ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'}`}>{f.name}</div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">2. 赛事档次 (Tiers)</label>
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
                <input type="date" value={config.invDate} min={addDays(state.currentDate, 1)} onChange={e => setConfig({...config, invDate: e.target.value})} className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white font-mono outline-none"/>
              </div>
              {['MAJOR', 'IEM', 'BLAST'].includes(config.format) && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">4. Host City (Search & Select)</label>
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
                    Selected: <span className="text-slate-300 font-semibold">{config.nameInput || 'None'}</span>
                  </div>
                </div>
              )}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center mt-4">
                 <div><div className="text-[10px] text-slate-500 uppercase font-bold mb-1">总奖金池</div><div className="text-2xl font-mono font-black text-green-500">${calculatePrize(config.format, config.tier).toLocaleString()}</div></div>
                 <DollarSign size={32} className="text-slate-800" />
              </div>
              {errorMsg && <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm font-bold">{errorMsg}</div>}
              <button onClick={handleCreateTournament} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] mt-4">立项赛事，锁定排期</button>
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
                <span className="text-orange-400 uppercase tracking-widest">STATUS: {activeTour.status}</span>
              </div>
              {activeTour.champion && (
                <div className="bg-green-600/10 border border-green-500/30 p-4 rounded-xl inline-block min-w-[200px] shadow-lg">
                  <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest mb-1">Champion</p>
                  <h3 className="text-xl font-black text-white cursor-pointer hover:underline" onClick={() => {setSelectedTeamId(activeTour.champion.id); setView('team');}}>{activeTour.champion.name}</h3>
                </div>
              )}
            </div>

            {activeTour.status === 'PENDING' && (
              <TournamentPredictTable tour={activeTour} state={state} />
            )}

            {activeTour.status !== 'PENDING' && (
              <div className="flex flex-wrap gap-2 pb-2">
                <button onClick={() => setActiveStageIdx('standings')} className={`px-6 py-2 rounded-xl font-bold whitespace-nowrap text-sm ${activeStageIdx === 'standings' ? 'bg-yellow-600 text-slate-900 shadow-md' : 'bg-slate-900 border border-slate-800 text-yellow-500 hover:bg-slate-800'}`}>Standings</button>
                <button onClick={() => setActiveStageIdx('participants')} className={`px-6 py-2 rounded-xl font-bold whitespace-nowrap text-sm ${activeStageIdx === 'participants' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-900 border border-slate-800 text-blue-400 hover:bg-slate-800'}`}>Participants</button>
                {activeTour.stages.map((stage, idx) => (
                  <button key={idx} onClick={() => setActiveStageIdx(idx)} className={`px-6 py-2 rounded-xl font-bold whitespace-nowrap text-sm ${activeStageIdx === idx ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'}`}>{stage.name}</button>
                ))}
              </div>
            )}

            {activeStageIdx === 'standings' && activeTour.status !== 'PENDING' ? (
              activeTour.status === 'COMPLETED' ? (
                <TournamentStandingsTable standings={activeTour.standings} onTeamClick={(t) => {setSelectedTeamId(t.id); setView('team');}} />
              ) : <div className="text-center p-12 text-slate-500">赛事尚未完结，最终名次待定...</div>
            ) : activeStageIdx === 'participants' && activeTour.status !== 'PENDING' ? (
              <TournamentParticipantsTable participants={activeTour.participants} onTeamClick={(t) => {setSelectedTeamId(t.id); setView('team');}} />
            ) : activeStageIdx !== 'standings' && activeStageIdx !== 'participants' && activeTour.stages[activeStageIdx] ? (
              <StageViewer stage={activeTour.stages[activeStageIdx]} />
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
