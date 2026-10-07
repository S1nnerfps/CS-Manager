(function (root) {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  const groupOf = (doc, kind, id, mergedOnly = false) => (doc.groups || []).find(g => (!mergedOnly || g.mode === 'merged') && g.members.some(m => m.kind === kind && m.id === id));
  const inputTarget = (doc, kind, id) => { const group = groupOf(doc, kind, id, true); return group ? `group:${group.id}` : `${kind}:${id}`; };
  const capacityOf = (doc, target) => {
    const [kind, id] = target.split(':');
    if (kind === 'match') return 2;
    if (kind === 'result') return 1;
    if (kind === 'start') return doc.stages.find(s => s.id === id)?.size || 0;
    const group = (doc.groups || []).find(g => g.id === id);
    return group?.mode === 'merged' ? group.members.length * (group.type === 'match' ? 2 : 1) : 0;
  };
  function pairing(teams, algorithm) {
    const ordered = teams.slice().sort((a, b) => a.startRank - b.startRank), n = ordered.length / 2;
    return Array.from({ length: n }, (_, i) => algorithm === 'interleaved' ? [ordered[i], ordered[i + n]] : algorithm === 'outer' ? [ordered[i], ordered[ordered.length - 1 - i]] : [ordered[i * 2], ordered[i * 2 + 1]]);
  }
  const sourceNode = source => source.startsWith('match:') ? source.split(':').slice(0, 2).join(':') : source.startsWith('start:') ? source.split(':').slice(0, 2).join(':') : source;
  const stageOf = (doc, endpoint) => {
    const [kind, id] = endpoint.split(':');
    if (kind === 'start') return id;
    return (kind === 'match' ? doc.matches : kind === 'result' ? doc.results : kind === 'group' ? doc.groups || [] : []).find(n => n.id === id)?.stage;
  };
  function endpointExists(doc, endpoint, source) {
    const [kind, id, port] = endpoint.split(':');
    if (kind === 'seed') return source && !port && doc.seeds.some(n => n.id === id);
    if (kind === 'start') {
      const stage = doc.stages.find(s => s.id === id);
      return !!stage && (source ? /^\d+$/.test(port || '') && +port < stage.size : !port);
    }
    if (kind === 'match') return doc.matches.some(n => n.id === id) && (source ? ['win', 'lose'].includes(port) : !port);
    if (kind === 'result') return !port && doc.results.some(n => n.id === id && (!source || n.kind === 'advance'));
    if (kind === 'group') return !source && !port && (doc.groups || []).some(g => g.id === id && g.mode === 'merged');
    return false;
  }
  function validate(doc) {
    const issues = [];
    const error = (code, message, node = '') => issues.push({ code, message, node });
    if (!doc || doc.schema !== 'csem.graph-linker' || ![1, 2].includes(doc.version)) return [{ code: 'SCHEMA', message: '文件类型或版本不支持。' }];
    for (const key of ['seeds', 'stages', 'matches', 'results', 'links', ...(doc.version === 2 || doc.groups !== undefined ? ['groups'] : [])]) {
      if (!Array.isArray(doc[key])) return [{ code: 'SCHEMA', message: `缺少数组 ${key}。` }];
      if (doc[key].length > 1000) return [{ code: 'LIMIT', message: `${key} 超过原型限制 1000 项。` }];
      const ids = new Set();
      for (const item of doc[key]) {
        if (!item || typeof item.id !== 'string' || !/^[\w-]+$/.test(item.id) || ids.has(item.id)) error('ID', `${key} 的 ID 无效或重复。`);
        ids.add(item?.id);
      }
    }
    if (issues.length) return issues;
    const memberships = new Set();
    for (const group of doc.groups || []) {
      if (!['merged', 'label'].includes(group.mode) || !Array.isArray(group.members) || !['match', 'advance', 'placement', 'result', null].includes(group.type) || !Number.isFinite(group.x) || !Number.isFinite(group.y) || !doc.stages.some(s => s.id === group.stage)) { error('GROUP', '大框类型、成员、位置或阶段无效。', group.id); continue; }
      for (const member of group.members) {
        const node = (member?.kind === 'match' ? doc.matches : member?.kind === 'result' ? doc.results : []).find(n => n.id === member?.id);
        const key = `${member?.kind}:${member?.id}`;
        const type = member?.kind === 'match' ? 'match' : group.mode === 'label' ? 'result' : node?.kind;
        if (!node || node.stage !== group.stage || memberships.has(key) || type !== group.type) error('GROUP', '大框成员必须存在、同阶段、同类型且仅属于一个大框。', group.id);
        memberships.add(key);
      }
      if (group.mode === 'merged' && group.type === 'match' && !['sequential', 'interleaved', 'outer', 'custom'].includes(group.algorithm)) error('GROUP', '大框排序算法无效。', group.id);
      if (group.mode === 'merged' && ['advance', 'placement'].includes(group.type) && (!Number.isSafeInteger(group.rankStart) || group.rankStart < 1)) error('GROUP', '赛果大框的区间左端须为安全范围内的正整数。', group.id);
    }
    if (issues.some(i => i.code === 'GROUP')) return issues;
    for (const group of doc.groups || []) {
      if (group.mode === 'merged' && !group.members.length) error('GROUP_EMPTY', '空大框需要拖入比赛或赛果。', group.id);
      if (group.mode === 'merged' && group.type === 'match' && group.algorithm === 'custom') error('CUSTOM_ALGORITHM', '自定义算法暂为占位，请选择预设算法后模拟。', group.id);
    }
    if (!doc.stages.length || !doc.seeds.length) error('EMPTY', '至少需要一个阶段和一支种子队伍。');
    for (const seed of doc.seeds) {
      if (seed._teamMissing) error('TEAM_MISSING', `缺少战队 ${seed.id}，请导入包含该 ID 的 .tinf 文件。`, seed.id);
      if (!Number.isInteger(seed.seedRank) || seed.seedRank < 1 || !Number.isFinite(seed.liveRank)) error('SEED', '种子排名必须为正整数，实时积分排名必须为数值。', seed.id);
    }
    for (const stage of doc.stages) {
      if ((stage.x !== undefined && !Number.isFinite(stage.x)) || (stage.y !== undefined && !Number.isFinite(stage.y))) error('POSITION', '起始层坐标必须是有限数值。', stage.id);
      if (!Number.isInteger(stage.size) || stage.size < 2 || stage.size > 64) error('SIZE', '阶段队伍数必须为 2–64。', stage.id);
      if (!Array.isArray(stage.sort) || stage.sort.length !== 3 || stage.sort.some(k => !['', 'seedRank', 'stageRank', 'liveRank'].includes(k.key) || k.direction !== 'asc')) error('SORT', '起始层需要三个有效排序关键字。', stage.id);
      const slots = doc.results.filter(r => r.stage === stage.id);
      if (slots.length !== stage.size) error('RESULT_SIZE', `${stage.name}：赛果位数量 ${slots.length}，应为 ${stage.size}。`, stage.id);
      const advances = slots.filter(r => r.kind === 'advance');
      const last = doc.stages.at(-1).id === stage.id;
      if ((last && advances.length) || (!last && !advances.length)) error('ADVANCE', last ? '最后阶段不能有下阶段推送位。' : '非最后阶段至少需要一个推送位。', stage.id);
    }
    for (const node of [...doc.matches, ...doc.results]) {
      if (!doc.stages.some(s => s.id === node.stage)) error('STAGE', '节点所属阶段不存在。', node.id);
      if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) error('POSITION', '节点坐标必须是有限数值。', node.id);
    }
    for (const node of doc.matches) if (![1, 3, 5].includes(node.bo)) error('BO', '比赛只支持 BO1 / BO3 / BO5。', node.id);
    for (const node of doc.results) if (!['advance', 'placement'].includes(node.kind) || !Number.isSafeInteger(node.rank) || node.rank < 1) error('RANK', '赛果位需要推送/结算类型及安全范围内的非零整数排名。', node.id);
    const outgoing = new Map(), incoming = new Map();
    for (const link of doc.links) {
      if (typeof link.source !== 'string' || typeof link.target !== 'string' || !endpointExists(doc, link.source, true) || !endpointExists(doc, link.target, false)) { error('PORT', '通道引用了不存在或方向错误的端口。', link.id); continue; }
      const [targetKind, targetId] = link.target.split(':');
      if (['match', 'result'].includes(targetKind) && groupOf(doc, targetKind, targetId, true)) error('GROUP_PORT', '大框内小框的输入必须连接到大框共用入口。', link.id);
      outgoing.set(link.source, (outgoing.get(link.source) || 0) + 1);
      incoming.set(link.target, (incoming.get(link.target) || 0) + 1);
      const [kind] = link.source.split(':');
      const fromStage = stageOf(doc, link.source), toStage = stageOf(doc, link.target);
      if (kind === 'seed' && !link.target.startsWith('start:')) error('SEED_ROUTE', '种子队伍必须先进入某阶段起始层。', link.id);
      if (kind === 'result') {
        const next = doc.stages[doc.stages.findIndex(s => s.id === fromStage) + 1];
        if (!next || link.target !== `start:${next.id}`) error('CROSS_STAGE', '推送位只能连接紧邻下一阶段的起始层。', link.id);
      } else if (kind !== 'seed' && (fromStage !== toStage || link.target.startsWith('start:'))) error('CROSS_STAGE', '起始出口和比赛出口只能接本阶段比赛或赛果位。', link.id);
    }
    for (const [port, count] of outgoing) if (count > 1) error('FANOUT', '每个出口仅允许一根通道。', port);
    for (const seed of doc.seeds) if (outgoing.get(`seed:${seed.id}`) !== 1) error('SEED_UNUSED', `${seed.name} 的种子出口必须恰好接出一次。`, seed.id);
    for (const stage of doc.stages) {
      if (incoming.get(`start:${stage.id}`) !== stage.size) error('START_SIZE', `${stage.name} 起始层需要恰好 ${stage.size} 条入口。`, stage.id);
      for (let i = 0; i < stage.size; i++) if (outgoing.get(`start:${stage.id}:${i}`) !== 1) error('START_UNUSED', `${stage.name} 起始位 ${i + 1} 必须接出一次。`, stage.id);
    }
    for (const match of doc.matches) {
      if (!groupOf(doc, 'match', match.id, true) && incoming.get(`match:${match.id}`) !== 2) error('MATCH_INPUT', `${match.name} 的共用入口必须接两根通道。`, match.id);
      for (const port of ['win', 'lose']) if (outgoing.get(`match:${match.id}:${port}`) !== 1) error('MATCH_OUTPUT', `${match.name} 的${port === 'win' ? '胜' : '败'}出口必须接出一次。`, match.id);
    }
    for (const result of doc.results) {
      if (!groupOf(doc, 'result', result.id, true) && incoming.get(`result:${result.id}`) !== 1) error('RESULT_INPUT', '每个赛果位必须恰好接入一次。', result.id);
      if (result.kind === 'advance' && outgoing.get(`result:${result.id}`) !== 1) error('ADVANCE_OUTPUT', '推送位必须接到下一阶段。', result.id);
    }
    for (const group of (doc.groups || []).filter(g => g.mode === 'merged' && g.members.length)) if (incoming.get(`group:${group.id}`) !== capacityOf(doc, `group:${group.id}`)) error('GROUP_INPUT', `大框 ${group.label || group.id} 需要恰好 ${capacityOf(doc, `group:${group.id}`)} 条输入通道。`, group.id);
    function checkRanks(slots, expected, label, scope) {
      const units = [], handled = new Set(), occupied = new Set();
      for (const result of slots) {
        const group = groupOf(doc, 'result', result.id, true);
        if (group) { if (handled.has(group.id)) continue; handled.add(group.id); units.push({ id: group.id, start: group.rankStart, count: group.members.length }); }
        else units.push({ id: result.id, start: result.rank, count: 1 });
      }
      for (const unit of units) for (let offset = 0; offset < unit.count; offset++) {
        const rank = unit.start + offset;
        if (occupied.has(rank)) error('RANK_OVERLAP', `${label}排名 ${rank} 重叠；并列排名必须合并为一个大框。`, unit.id);
        occupied.add(rank);
      }
      if (occupied.size !== expected || [...occupied].some(r => r < 1 || r > expected)) error('RANK_COVERAGE', `${label}排名须不重且全覆盖 1～${expected}。`, scope);
    }
    for (const stage of doc.stages) { const advancing = doc.results.filter(r => r.stage === stage.id && r.kind === 'advance'); if (advancing.length) checkRanks(advancing, advancing.length, `${stage.name} 推送`, stage.id); }
    checkRanks(doc.results.filter(r => r.kind === 'placement'), doc.seeds.length, '全赛事最终', '');
    const vertices = new Set([...doc.seeds.map(n => `seed:${n.id}`), ...doc.stages.map(n => `start:${n.id}`), ...doc.matches.map(n => `match:${n.id}`), ...doc.results.map(n => `result:${n.id}`), ...(doc.groups || []).filter(g => g.mode === 'merged').map(g => `group:${g.id}`)]);
    const degrees = new Map([...vertices].map(v => [v, 0])), adjacent = new Map([...vertices].map(v => [v, []]));
    for (const link of doc.links) if (endpointExists(doc, link.source, true) && endpointExists(doc, link.target, false)) {
      const from = sourceNode(link.source), to = link.target;
      adjacent.get(from).push(to); degrees.set(to, degrees.get(to) + 1);
    }
    for (const group of (doc.groups || []).filter(g => g.mode === 'merged')) for (const member of group.members) { const to = `${member.kind}:${member.id}`; adjacent.get(`group:${group.id}`).push(to); degrees.set(to, degrees.get(to) + 1); }
    const queue = [...vertices].filter(v => !degrees.get(v));
    let visited = 0;
    while (queue.length) { const v = queue.shift(); visited++; for (const to of adjacent.get(v)) { degrees.set(to, degrees.get(to) - 1); if (!degrees.get(to)) queue.push(to); } }
    if (visited !== vertices.size) error('CYCLE', '流程包含环路；类拓扑步进不能执行。');
    return issues;
  }
  // Seed sorting is an explicit extension point. Default preserves input order.
  function seedSort(teams) { return teams.slice(); }
  function startSort(teams, keys) {
    return teams.map((team, index) => ({ team, index })).sort((a, b) => {
      for (const sort of keys) {
        if (!sort.key) continue;
        const delta = (a.team[sort.key] || 0) - (b.team[sort.key] || 0);
        if (delta) return delta;
      }
      return a.index - b.index;
    }).map(row => row.team);
  }
  function createState(doc) {
    const state = { history: [], queue: [], queueHistory: null };
    if (doc) { state.queue = appendReady([], propagate(doc, [])); state.queueHistory = historyKey(state.history); }
    return state;
  }
  function propagate(doc, history) {
    const outputs = new Map(), starts = new Map(), matches = new Map(), results = new Map(), groups = new Map(), assignments = new Map();
    for (const team of seedSort(doc.seeds)) outputs.set(`seed:${team.id}`, { ...team, stageRank: 0, _arrival: 0 });
    const played = new Map(history.map(h => [h.matchId, h]));
    const inputs = target => doc.links.filter(l => l.target === target).map(l => ({ link: l, team: outputs.get(l.source) })).filter(row => row.team).sort((a, b) => a.team._arrival - b.team._arrival);
    // Monotone propagation of confirmed teams; previews are calculated separately.
    for (let pass = 0; pass <= doc.links.length + doc.matches.length + (doc.groups || []).length; pass++) {
      let changed = false;
      for (const stage of doc.stages) {
        if (starts.has(stage.id)) continue;
        const arrivals = inputs(`start:${stage.id}`).map(row => row.team);
        if (arrivals.length === stage.size && new Set(arrivals.map(t => t.id)).size === stage.size) {
          const arrival = Math.max(...arrivals.map(t => t._arrival));
          const sorted = startSort(arrivals, stage.sort).map((team, index) => ({ ...team, startRank: index + 1, _arrival: arrival })); starts.set(stage.id, sorted);
          sorted.forEach((team, index) => outputs.set(`start:${stage.id}:${index}`, team)); changed = true;
        }
      }
      for (const group of (doc.groups || []).filter(g => g.mode === 'merged')) {
        const teams = inputs(`group:${group.id}`).map(row => row.team), capacity = capacityOf(doc, `group:${group.id}`);
        const full = capacity > 0 && teams.length === capacity && new Set(teams.map(t => t.id)).size === capacity;
        groups.set(group.id, { teams, capacity, full });
        if (full && !assignments.has(`group:${group.id}`) && (group.type !== 'match' || group.algorithm !== 'custom')) {
          const arranged = group.type === 'match' ? pairing(teams, group.algorithm) : teams.slice().sort((a, b) => a.startRank - b.startRank).map(t => [t]);
          group.members.forEach((member, i) => assignments.set(`${member.kind}:${member.id}`, arranged[i]));
          assignments.set(`group:${group.id}`, true); changed = true;
        }
      }
      for (const match of doc.matches) {
        const teams = groupOf(doc, 'match', match.id, true) ? assignments.get(`match:${match.id}`) || [] : inputs(`match:${match.id}`).map(row => row.team);
        matches.set(match.id, { teams, played: played.has(match.id) });
        if (played.has(match.id) && teams.length === 2 && !outputs.has(`match:${match.id}:win`)) {
          const winner = teams.find(t => t.id === played.get(match.id).winnerId);
          const loser = teams.find(t => t.id !== played.get(match.id).winnerId);
          if (winner && loser) { const arrival = history.findIndex(h => h.matchId === match.id) + 1; outputs.set(`match:${match.id}:win`, { ...winner, _arrival: arrival }); outputs.set(`match:${match.id}:lose`, { ...loser, _arrival: arrival }); changed = true; }
        }
      }
      for (const result of doc.results) {
        if (results.has(result.id)) continue;
        const group = groupOf(doc, 'result', result.id, true), teams = group ? assignments.get(`result:${result.id}`) || [] : inputs(`result:${result.id}`).map(r => r.team);
        const rank = group ? group.rankStart : result.rank;
        if (teams.length === 1) { results.set(result.id, { ...teams[0], stageRank: rank, finalRank: result.kind === 'placement' ? rank : undefined, rankEnd: group ? rank + group.members.length - 1 : rank }); changed = true; }
      }
      // Release advancement only after the WHOLE stage result layer is full.
      for (const stage of doc.stages) {
        const slots = doc.results.filter(r => r.stage === stage.id);
        if (slots.length === stage.size && slots.every(r => results.has(r.id))) for (const result of slots.filter(r => r.kind === 'advance')) {
          if (!outputs.has(`result:${result.id}`)) { outputs.set(`result:${result.id}`, { ...results.get(result.id), _arrival: Math.max(...slots.map(r => results.get(r.id)._arrival)) }); changed = true; }
        }
      }
      if (!changed) break;
    }
    const previews = new Map();
    for (const match of doc.matches) {
      const row = matches.get(match.id);
      if (row.teams.length === 2 && !row.played) for (const port of ['win', 'lose']) previews.set(`match:${match.id}:${port}`, { preview: true, candidates: row.teams });
    }
    const displayInputs = target => { const [kind, id] = target.split(':'); const group = ['match', 'result'].includes(kind) && groupOf(doc, kind, id, true); if (group) return (assignments.get(target) || []).map(token => ({ source: `group:${group.id}`, token })); return doc.links.filter(l => l.target === target).map(l => ({ source: l.source, token: outputs.get(l.source) || previews.get(l.source) || null })); };
    const activeStage = doc.stages.find(stage => { const slots = doc.results.filter(r => r.stage === stage.id); return slots.length !== stage.size || !slots.every(r => results.has(r.id)); });
    const ready = doc.matches.filter(m => m.stage === activeStage?.id && matches.get(m.id).teams.length === 2 && new Set(matches.get(m.id).teams.map(t => t.id)).size === 2 && !played.has(m.id));
    return { outputs, starts, matches, results, groups, previews, displayInputs, ready, activeStage: activeStage?.id, complete: !activeStage };
  }
  const historyKey = history => JSON.stringify(history.map(h => [h.matchId, h.winnerId]));
  function appendReady(queue, runtime) {
    const eligible = new Set(runtime.ready.map(m => m.id)), seen = new Set();
    const next = [];
    for (const id of queue) if (eligible.has(id) && !seen.has(id)) { next.push(id); seen.add(id); }
    // Storage order breaks ties ONLY for matches that become ready in the same step.
    // Previously waiting matches keep their positions; newcomers always join the tail.
    for (const match of runtime.ready) if (!seen.has(match.id)) { next.push(match.id); seen.add(match.id); }
    return next;
  }
  function derive(doc, state = createState()) {
    let runtime, queue;
    if (Array.isArray(state.queue) && state.queueHistory === historyKey(state.history)) {
      runtime = propagate(doc, state.history);
      queue = appendReady(state.queue, runtime);
    } else {
      // Reconstruct the actual sequence of enqueue events after rewind or legacy history load.
      // Looking only at the final snapshot would lose when a match FIRST became ready.
      runtime = propagate(doc, []); queue = appendReady([], runtime);
      for (let i = 0; i < state.history.length; i++) {
        queue = queue.filter(id => id !== state.history[i].matchId);
        runtime = propagate(doc, state.history.slice(0, i + 1));
        queue = appendReady(queue, runtime);
      }
    }
    const byId = new Map(runtime.ready.map(m => [m.id, m]));
    return { ...runtime, queue, ready: queue.map(id => byId.get(id)) };
  }
  function backStep(doc, state) {
    if (!state.history.length) return false;
    state.history.pop();
    const runtime = derive(doc, state);
    state.queue = runtime.queue.slice(); state.queueHistory = historyKey(state.history);
    return true;
  }
  function step(doc, state, winner = '') {
    const issues = validate(doc); if (issues.length) return { ok: false, issues };
    const runtime = derive(doc, state), match = runtime.ready[0];
    if (!match) return { ok: false, issues: [{ code: 'QUEUE', message: runtime.complete ? '赛事已完成。' : '没有可结束的比赛：检查重复队伍或等待中的通道。' }] };
    const teams = runtime.matches.get(match.id).teams;
    const winnerId = winner || teams[Math.random() < .5 ? 0 : 1].id;
    if (!teams.some(t => t.id === winnerId)) return { ok: false, issues: [{ code: 'WINNER', message: '胜方不在本场对阵中。' }] };
    state.history.push({ matchId: match.id, winnerId });
    // Consume exactly the head, propagate this match, then append newly ready matches.
    state.queue = appendReady(runtime.queue.slice(1), propagate(doc, state.history));
    state.queueHistory = historyKey(state.history);
    return { ok: true, match, winner: teams.find(t => t.id === winnerId) };
  }
  function sample() {
    const doc = { schema: 'csem.graph-linker', version: 2, name: '8 队 · 两阶段淘汰赛', appearance: { unresolved: '#183757', winner: '#254d44', loser: '#622a37' }, seeds: Array.from({ length: 8 }, (_, i) => ({ id: `t${i + 1}`, name: `Team ${i + 1}`, seedRank: i + 1, liveRank: 0 })), stages: [], matches: [], results: [], groups: [], links: [] };
    const sort = () => [{ key: 'seedRank', direction: 'asc' }, { key: '', direction: 'asc' }, { key: '', direction: 'asc' }];
    doc.stages = [{ id: 's1', name: '资格赛', size: 8, sort: sort(), x: 94, y: 47 }, { id: 's2', name: '决赛阶段', size: 4, sort: sort(), x: 94, y: 47 }];
    const link = (source, target) => doc.links.push({ id: `l${doc.links.length + 1}`, source, target });
    const match = (id, stage, name, x, y) => doc.matches.push({ id, stage, name, bo: 3, schedule: 'YYYY-MM-DD #X', x, y });
    const result = (id, stage, kind, rank, x, y) => doc.results.push({ id, stage, kind, rank, name: kind === 'advance' ? `推送 ${rank}` : `最终第 ${rank} 名`, x, y });
    doc.seeds.forEach(t => link(`seed:${t.id}`, 'start:s1'));
    for (let i = 0; i < 4; i++) {
      const m = `q${i + 1}`; match(m, 's1', `资格赛 ${i + 1}`, 420, 45 + i * 155);
      link(`start:s1:${i}`, `match:${m}`); link(`start:s1:${7 - i}`, `match:${m}`);
      result(`a${i}`, 's1', 'advance', i + 1, 820, 35 + i * 65);
      result(`e${i}`, 's1', 'placement', 5, 820, 340 + i * 65);
      link(`match:${m}:win`, `result:a${i}`); link(`match:${m}:lose`, `result:e${i}`); link(`result:a${i}`, 'start:s2');
    }
    match('semi1', 's2', '半决赛 A', 390, 90); match('semi2', 's2', '半决赛 B', 390, 320);
    match('final', 's2', '决赛', 700, 90); match('bronze', 's2', '季军赛', 700, 320);
    [0, 3].forEach(i => link(`start:s2:${i}`, 'match:semi1')); [1, 2].forEach(i => link(`start:s2:${i}`, 'match:semi2'));
    for (const id of ['semi1', 'semi2']) { link(`match:${id}:win`, 'match:final'); link(`match:${id}:lose`, 'match:bronze'); }
    for (let i = 1; i <= 4; i++) result(`p${i}`, 's2', 'placement', i, 1050, 65 + (i - 1) * 115);
    link('match:final:win', 'result:p1'); link('match:final:lose', 'result:p2'); link('match:bronze:win', 'result:p3'); link('match:bronze:lose', 'result:p4');
    doc.groups.push({ id: 'losers', stage: 's1', mode: 'merged', type: 'placement', label: '资格赛淘汰', algorithm: 'sequential', rankStart: 5, x: 822.5, y: 329, members: Array.from({ length: 4 }, (_, i) => ({ kind: 'result', id: `e${i}` })) });
    doc.links.forEach(l => { if (/^result:e[0-3]$/.test(l.target)) l.target = 'group:losers'; });
    doc.results.filter(r => r.id.startsWith('e')).forEach((r, i) => { r.x = 822.5; r.y = 352.5 + i * 58.75; });
    return doc;
  }
  function parse(text) {
    if (text.length > 2_000_000) throw new Error('文件超过 2 MB 原型限制。');
    const doc = JSON.parse(text);
    if (doc?.schema === 'csem.graph-linker' && doc.version === 1) {
      doc.version = 2; doc.groups ??= []; doc.stages?.forEach(s => { s.x ??= 94; s.y ??= 47; });
      // Legacy drafts used ungrouped ties. Upgrade only intervals that preserve
      // existing standings without crossing stages or colliding with other ranks.
      if (Array.isArray(doc.results) && Array.isArray(doc.links) && Array.isArray(doc.groups) && !doc.groups.length) {
        const ties = new Map();
        for (const r of doc.results) {
          if (!r || !['advance', 'placement'].includes(r.kind) || !Number.isSafeInteger(r.rank) || r.rank < 1) continue;
          const key = `${r.stage}:${r.kind}:${r.rank}`; if (!ties.has(key)) ties.set(key, []); ties.get(key).push(r);
        }
        const targets = new Map();
        for (const members of ties.values()) {
          if (members.length < 2) continue;
          const first = members[0], end = first.rank + members.length - 1;
          const scope = doc.results.filter(r => r?.kind === first.kind && (first.kind === 'placement' || r.stage === first.stage));
          const expected = first.kind === 'placement' ? doc.seeds?.length : scope.length;
          if (end > expected || scope.some(r => !members.includes(r) && r.rank >= first.rank && r.rank <= end) || members.some(r => !Number.isFinite(r.x) || !Number.isFinite(r.y))) continue;
          members.sort((a, b) => a.y - b.y || a.x - b.x);
          const id = `legacy_rank_${doc.groups.length + 1}`;
          const group = { id, stage: first.stage, mode: 'merged', type: first.kind, members: members.map(r => ({kind:'result',id:r.id})), x: members[0].x, y: Math.max(23.5, members[0].y - 23.5), label: `并列 ${first.rank}～${end}（旧草稿迁移）`, algorithm: 'sequential', rankStart: first.rank };
          doc.groups.push(group); members.forEach(r => targets.set(`result:${r.id}`, `group:${id}`));
        }
        doc.links.forEach(l => { if (l && targets.has(l.target)) l.target = targets.get(l.target); });
      }
    }
    // Drafts may be disconnected; structural/type issues are rejected at import.
    const fatal = validate(doc).filter(i => ['SCHEMA', 'LIMIT', 'ID', 'SIZE', 'SORT', 'SEED', 'POSITION', 'STAGE', 'BO', 'RANK', 'GROUP', 'PORT', 'GROUP_PORT'].includes(i.code));
    if (fatal.length) throw new Error(fatal[0].message);
    return doc;
  }
  const api = { copy, validate, derive, step, backStep, createState, sample, parse, seedSort, startSort, endpointExists, sourceNode, stageOf, groupOf, inputTarget, capacityOf, pairing };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.GraphEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
