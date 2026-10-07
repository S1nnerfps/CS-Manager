(function (root) {
  'use strict';
  const E = typeof module !== 'undefined' && module.exports ? require('./engine.js') : root.GraphEngine;
  const RESULT_WIDTH = 235, GRID = RESULT_WIDTH / 10, MATCH_HEIGHT = GRID * 6, RESULT_HEIGHT = GRID * 2.5;
  const SPAWN = { match: { x: GRID * 18, y: GRID * 2 }, result: { x: GRID * 36, y: GRID * 2 } };
  const snap = value => Math.round(value / GRID) * GRID;
  const snapPosition = (x, y) => ({ x: Math.max(GRID, snap(x)), y: Math.max(GRID, snap(y)) });
  const nodeFor = (doc, ref) => (ref.kind === 'match' ? doc.matches : ref.kind === 'result' ? doc.results : ref.kind === 'group' ? doc.groups : ref.kind === 'stage' ? doc.stages : ref.kind === 'link' ? doc.links : doc.seeds).find(n => n.id === ref.id);
  const refKey = ref => `${ref.kind}:${ref.id}`;
  const groupHeight = g => GRID * 2 + g.members.length * (g.type === 'match' ? MATCH_HEIGHT : RESULT_HEIGHT);
  function layoutGroups(doc) { for (const g of doc.groups || []) g.members.forEach((ref, i) => { const n = nodeFor(doc, ref); if (n) { n.x = g.x; n.y = g.y + GRID + i * (g.type === 'match' ? MATCH_HEIGHT : RESULT_HEIGHT); } }); }
  function spawnPoint(width, scrollLeft, scrollTop, zoom) { return { x: Math.max(GRID, Math.floor(((scrollLeft + width) / zoom - RESULT_WIDTH - GRID) / GRID) * GRID), y: Math.max(GRID, Math.ceil((scrollTop / zoom + GRID) / GRID) * GRID) }; }
  function detach(doc, ref) {
    const group = E.groupOf(doc, ref.kind, ref.id); if (!group) return;
    const index = group.members.findIndex(m => refKey(m) === refKey(ref));
    if (group.mode === 'merged') { const perMember = group.type === 'match' ? 2 : 1; doc.links.filter(l => l.target === `group:${group.id}`).slice(index * perMember, (index + 1) * perMember).forEach(l => l.target = refKey(ref)); }
    group.members.splice(index, 1); if (!group.members.length) group.type = null;
    layoutGroups(doc);
  }
  function attach(doc, group, refs) {
    const types = refs.map(ref => ref.kind === 'match' ? 'match' : group.mode === 'label' ? 'result' : nodeFor(doc, ref)?.kind);
    const type = group.type || types[0];
    if (!refs.length || refs.some(r => !['match', 'result'].includes(r.kind) || !nodeFor(doc, r) || nodeFor(doc, r).stage !== group.stage) || types.some(t => t !== type)) return false;
    for (const ref of refs) {
      if (group.members.some(m => refKey(m) === refKey(ref))) continue;
      detach(doc, ref); group.members.push({ ...ref });
      if (group.mode === 'merged') doc.links.filter(l => l.target === refKey(ref)).forEach(l => l.target = `group:${group.id}`);
    }
    group.type = type; layoutGroups(doc); return true;
  }
  function makeGroup(doc, refs, mode, id, point) {
    refs = refs.slice().sort((a, b) => nodeFor(doc, a).y - nodeFor(doc, b).y || nodeFor(doc, a).x - nodeFor(doc, b).x);
    const first = refs[0] && nodeFor(doc, refs[0]);
    const g = { id, stage: first?.stage || point.stage, mode, type: null, members: [], x: snap(point.x), y: snap(point.y), label: '', algorithm: 'sequential', rankStart: first?.rank || 1 };
    const draft = E.copy(doc); draft.groups ??= []; draft.groups.push(E.copy(g));
    if (refs.length && !attach(draft, draft.groups.at(-1), refs)) return null;
    if (E.validate(draft).some(i => ['GROUP', 'GROUP_PORT', 'CYCLE'].includes(i.code))) return null;
    doc.groups ??= []; doc.groups.push(g); if (refs.length) attach(doc, g, refs); return g;
  }
  function expanded(doc, refs) {
    const output = new Map();
    for (const ref of refs) { output.set(refKey(ref), ref); if (ref.kind === 'group') for (const m of nodeFor(doc, ref)?.members || []) output.set(refKey(m), m); }
    return [...output.values()];
  }
  function deleteObjects(doc, refs) {
    const all = expanded(doc, refs), keys = new Set(all.map(refKey));
    for (const ref of all.filter(r => ['match', 'result'].includes(r.kind))) if (!keys.has(`group:${E.groupOf(doc, ref.kind, ref.id)?.id}`)) detach(doc, ref);
    doc.matches = doc.matches.filter(n => !keys.has(`match:${n.id}`)); doc.results = doc.results.filter(n => !keys.has(`result:${n.id}`));
    doc.groups = (doc.groups || []).filter(n => !keys.has(`group:${n.id}`));
    doc.links = doc.links.filter(l => !keys.has(`link:${l.id}`) && !keys.has(E.sourceNode(l.source)) && !keys.has(l.target)); layoutGroups(doc);
  }
  function setResultKind(doc, refs, kind) {
    const all = expanded(doc, refs).filter(r => r.kind === 'result'), ids = new Set(all.map(r => r.id));
    for (const ref of all) { const g = E.groupOf(doc, 'result', ref.id, true); if (g) { g.type = kind; g.members.forEach(m => ids.add(m.id)); } }
    doc.results.filter(r => ids.has(r.id)).forEach(r => r.kind = kind);
  }
  function nextRank(doc, kind, stage) {
    const slots = doc.results.filter(r => r.kind === kind && (kind === 'placement' || r.stage === stage));
    return 1 + Math.max(0, ...slots.map(r => { const g = E.groupOf(doc, 'result', r.id, true); return g ? g.rankStart + g.members.length - 1 : r.rank; }));
  }
  function bounds(doc, refs) {
    const nodes = refs.filter(r => ['match', 'result', 'group'].includes(r.kind)).map(r => ({ ref: r, n: nodeFor(doc, r) })).filter(r => r.n);
    if (!nodes.length) return { x: 0, y: 0, width: 0, height: 0 };
    const x = Math.min(...nodes.map(r => r.n.x)), y = Math.min(...nodes.map(r => r.n.y));
    return { x, y, width: Math.max(...nodes.map(r => r.n.x + RESULT_WIDTH)) - x, height: Math.max(...nodes.map(r => r.n.y + (r.ref.kind === 'group' ? groupHeight(r.n) : r.ref.kind === 'match' ? MATCH_HEIGHT : RESULT_HEIGHT))) - y };
  }
  function copyObjects(doc, refs) {
    const all = expanded(doc, refs), keys = new Set(all.map(refKey));
    const matches = all.filter(r => r.kind === 'match').map(r => { const n = nodeFor(doc, r); return { id: n.id, x: n.x, y: n.y }; });
    const results = all.filter(r => r.kind === 'result').map(r => { const n = nodeFor(doc, r); return { id: n.id, kind: n.kind, x: n.x, y: n.y }; });
    const groups = all.filter(r => r.kind === 'group').map(r => { const g = nodeFor(doc, r); return { id: g.id, mode: g.mode, type: g.type, members: E.copy(g.members), x: g.x, y: g.y }; });
    const hasNodes = matches.length + results.length + groups.length > 0;
    const links = doc.links.filter(l => hasNodes ? keys.has(E.sourceNode(l.source)) && keys.has(l.target) : keys.has(`link:${l.id}`)).map(l => ({ source: l.source, target: l.target }));
    return { matches, results, groups, links, bounds: bounds(doc, all) };
  }
  function pasteObjects(doc, clipboard, point, stage, makeId) {
    if (!clipboard || !doc.stages.some(s => s.id === stage)) return { ok: false, message: '没有可粘贴的画布缓存。' };
    const draft = E.copy(doc), map = new Map(), refs = [];
    const x = Math.max(GRID, snap(point.x - clipboard.bounds.width / 2)), y = Math.max(GRID, snap(point.y - clipboard.bounds.height / 2));
    const position = n => ({ x: n.x - clipboard.bounds.x + x, y: n.y - clipboard.bounds.y + y });
    for (const n of clipboard.matches) { const id = makeId('match'); map.set(`match:${n.id}`, `match:${id}`); refs.push({ kind: 'match', id }); draft.matches.push({ id, stage, name: '比赛', bo: 3, schedule: 'YYYY-MM-DD #X', ...position(n) }); }
    for (const n of clipboard.results) { const id = makeId('result'); map.set(`result:${n.id}`, `result:${id}`); refs.push({ kind: 'result', id }); draft.results.push({ id, stage, name: '赛果', kind: n.kind, rank: nextRank(draft, n.kind, stage), ...position(n) }); }
    for (const g of clipboard.groups) {
      const id = makeId('group'); map.set(`group:${g.id}`, `group:${id}`); refs.push({ kind: 'group', id });
      draft.groups.push({ id, stage, mode: g.mode, type: g.type, label: '', algorithm: 'sequential', rankStart: 1, members: g.members.map(m => ({ kind: m.kind, id: map.get(refKey(m)).split(':')[1] })), ...position(g) });
    }
    const rankCursor = { advance: nextRank(doc, 'advance', stage), placement: nextRank(doc, 'placement', stage) }, rankedGroups = new Set();
    for (const ref of refs.filter(r => r.kind === 'result')) {
      const n = nodeFor(draft, ref), g = E.groupOf(draft, 'result', ref.id, true);
      if (g && rankedGroups.has(g.id)) continue;
      if (g) { g.rankStart = rankCursor[n.kind]; rankedGroups.add(g.id); rankCursor[n.kind] += g.members.length; }
      else n.rank = rankCursor[n.kind]++;
    }
    const remap = endpoint => { const base = E.sourceNode(endpoint); return (map.get(base) || base) + endpoint.slice(base.length); };
    const added = clipboard.links.map(l => ({ id: makeId('link'), source: remap(l.source), target: remap(l.target) })); draft.links.push(...added); layoutGroups(draft);
    const fatal = E.validate(draft).find(i => ['GROUP', 'GROUP_PORT', 'PORT', 'CROSS_STAGE', 'SEED_ROUTE', 'CYCLE', 'FANOUT', 'ID', 'LIMIT'].includes(i.code));
    if (fatal) return { ok: false, message: fatal.message };
    Object.assign(doc, draft); return { ok: true, refs: refs.length ? refs : added.map(l => ({ kind: 'link', id: l.id })) };
  }
  class EditHistory {
    constructor() { this.past = []; this.future = []; }
    record(snapshot) { this.past.push(E.copy(snapshot)); if (this.past.length > 40) this.past.shift(); this.future = []; }
    undo(current) { if (!this.past.length) return null; this.future.push(E.copy(current)); return this.past.pop(); }
    redo(current) { if (!this.future.length) return null; this.past.push(E.copy(current)); return this.future.pop(); }
  }
  function syncAdvanceLinks(doc, makeId) {
    // The stage order determines advancement routes. Preserve IDs for unchanged edges.
    const sources = new Set(doc.results.map(r => `result:${r.id}`));
    const desired = new Map();
    for (const result of doc.results.filter(r => r.kind === 'advance')) {
      const index = doc.stages.findIndex(s => s.id === result.stage);
      const next = index < 0 ? null : doc.stages[index + 1];
      if (next) desired.set(`result:${result.id}`, `start:${next.id}`);
    }
    const retained = new Set();
    doc.links = doc.links.filter(link => {
      if (!sources.has(link.source)) return true;
      if (desired.get(link.source) !== link.target || retained.has(link.source)) return false;
      retained.add(link.source); return true;
    });
    for (const [source, target] of desired) if (!retained.has(source)) doc.links.push({ id: makeId(), source, target });
  }
  function planConnections(doc, sources, target, makeId) {
    // Never mutate the graph until the ENTIRE selection passes validation.
    if (!sources.length) return { ok: false, message: '先选择至少一个出口。' };
    if (new Set(sources).size !== sources.length) return { ok: false, message: '出口不能重复选择。' };
    if (!E.endpointExists(doc, target, false) || sources.some(s => !E.endpointExists(doc, s, true))) return { ok: false, message: '端口不存在或方向错误。' };
    if (sources.some(source => doc.links.some(link => link.source === source))) return { ok: false, message: '所选出口已有通道。先删除原通道或取消选择该出口。' };
    const capacity = E.capacityOf(doc, target);
    const used = doc.links.filter(link => link.target === target).length;
    if (used + sources.length > capacity) return { ok: false, message: `入口剩余 ${Math.max(0, capacity - used)} 个位置，不能接入 ${sources.length} 个出口。` };
    const links = sources.map(source => ({ id: makeId(), source, target }));
    const draft = E.copy(doc); draft.links.push(...links);
    const issue = E.validate(draft).find(i => ['PORT', 'GROUP', 'GROUP_PORT', 'CROSS_STAGE', 'SEED_ROUTE', 'CYCLE', 'FANOUT', 'LIMIT', 'ID'].includes(i.code));
    if (issue) return { ok: false, message: issue.message };
    return { ok: true, links };
  }
  const api = { RESULT_WIDTH, GRID, MATCH_HEIGHT, RESULT_HEIGHT, SPAWN, snap, snapPosition, syncAdvanceLinks, planConnections, nodeFor, refKey, groupHeight, layoutGroups, spawnPoint, detach, attach, makeGroup, expanded, deleteObjects, setResultKind, nextRank, bounds, copyObjects, pasteObjects, EditHistory };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.GraphEditor = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
