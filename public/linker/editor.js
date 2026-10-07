(function (root) {
  'use strict';
  const E = typeof module !== 'undefined' && module.exports ? require('./engine.js') : root.GraphEngine;
  const RESULT_WIDTH = 235, GRID = RESULT_WIDTH / 10;
  const SPAWN = { match: { x: GRID * 18, y: GRID * 2 }, result: { x: GRID * 36, y: GRID * 2 } };
  const snap = value => Math.round(value / GRID) * GRID;
  const snapPosition = (x, y) => ({ x: Math.max(GRID * 15, snap(x)), y: Math.max(GRID, snap(y)) });
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
    const capacity = target.startsWith('match:') ? 2 : target.startsWith('start:') ? doc.stages.find(s => `start:${s.id}` === target).size : 1;
    const used = doc.links.filter(link => link.target === target).length;
    if (used + sources.length > capacity) return { ok: false, message: `入口剩余 ${Math.max(0, capacity - used)} 个位置，不能接入 ${sources.length} 个出口。` };
    const links = sources.map(source => ({ id: makeId(), source, target }));
    const draft = E.copy(doc); draft.links.push(...links);
    const issue = E.validate(draft).find(i => ['PORT', 'CROSS_STAGE', 'SEED_ROUTE', 'CYCLE', 'FANOUT', 'LIMIT', 'ID'].includes(i.code));
    if (issue) return { ok: false, message: issue.message };
    return { ok: true, links };
  }
  const api = { RESULT_WIDTH, GRID, SPAWN, snap, snapPosition, syncAdvanceLinks, planConnections };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.GraphEditor = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
