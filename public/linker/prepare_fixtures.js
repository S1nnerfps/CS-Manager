'use strict';
const fs = require('node:fs'), E = require('./engine.js'), G = require('./editor.js'), C = require('./codec.js'), F = require('./team_info.js');
function groupDemo() {
  const doc = { schema: 'csem.graph-linker', version: 2, name: '大框算法 · 六队演示', appearance: E.sample().appearance, seeds: Array.from({length: 6}, (_, i) => ({ id: `t${i+1}`, name: `Team ${i+1}`, seedRank: i+1, liveRank: 0 })), stages: [{id: 's1', name: '六队大框', size: 6, x: 94, y: 47, sort: [{key: 'seedRank', direction: 'asc'}, {key: '', direction: 'asc'}, {key: '', direction: 'asc'}]}], matches: [], results: [], groups: [], links: [] };
  let edge = 0;
  const link = (source, target) => doc.links.push({id: `edge${++edge}`, source, target});
  for (let i = 0; i < 6; i++) link(`seed:t${i+1}`, 'start:s1');
  for (let i = 0; i < 3; i++) {
    const id = `m${i+1}`; doc.matches.push({id, name: `比赛 ${i+1}`, stage: 's1', bo: 3, schedule: 'YYYY-MM-DD #X', x: 423, y: 70.5 + i*141});
    link(`start:s1:${2*i}`, `match:${id}`); link(`start:s1:${2*i+1}`, `match:${id}`);
    for (const [port, rank] of [['win',i+1],['lose',i+4]]) { const rid = `p${rank}`; doc.results.push({id: rid, stage: 's1', kind: 'placement', rank, name: `赛果 ${rank}`, x: 846, y: 47+(rank-1)*70.5}); link(`match:${id}:${port}`, `result:${rid}`); }
  }
  const g = G.makeGroup(doc, doc.matches.map(m => ({kind:'match',id:m.id})), 'merged', 'pairs', {x:423,y:47,stage:'s1'}); g.label = '六队共享入口';
  return doc;
}
async function main() {
  const file = fs.readFileSync(`${__dirname}/fifo_queue.csem`);
  const fifoText = file[0] === 123 ? file.toString('utf8') : await C.decode(file);
  const fifo = JSON.parse(fifoText).version === 3 ? F.readSchedule(fifoText, F.parseTeamInfo(await C.decode(fs.readFileSync(`${__dirname}/fifo_queue.tinf`), 'teams'))) : E.parse(fifoText);
  G.layoutGroups(fifo);
  const groupFIFO = E.copy(fifo); groupFIFO.name = '大框入口闸门 · FIFO 回归';
  const pool = G.makeGroup(groupFIFO, [{kind:'match',id:'downstream'},{kind:'match',id:'first3'}], 'merged', 'pool', {x:799,y:47,stage:'s1'}); pool.label = '四队收齐后排赛';
  for (const [name, doc] of [['fifo_queue',fifo], ['sample',E.sample()], ['group_demo',groupDemo()], ['group_fifo',groupFIFO]]) {
    G.layoutGroups(doc); const info = F.fromLegacy(doc, `${doc.name} · 演示战队`), schedule = F.toSchedule(doc); schedule.teamInfoFile = `${name}.tinf`;
    fs.writeFileSync(`${__dirname}/${name}.csem`, await C.encode(schedule)); fs.writeFileSync(`${__dirname}/${name}.tinf`, await C.encode(info, 'teams'));
  }
}
if (require.main === module) main().catch(e => { console.error(e); process.exitCode = 1; });
module.exports = { groupDemo };
