(function (root) {
  'use strict';
  const E = typeof module !== 'undefined' && module.exports ? require('./engine.js') : root.GraphEngine;
  const FIELDS = ['id', 'name', 'region', 'vrs', 'stamina', 'wins', 'losses', 'prize_total', 'honors', 'seedRank', 'liveRank'];
  const idValid = id => typeof id === 'string' && /^[\w-]+$/.test(id);
  function parseTeamInfo(text) {
    if (typeof text !== 'string' || new TextEncoder().encode(text).length > 2_000_000) throw new Error('战队信息超过 2 MB 限制。');
    const data = JSON.parse(text);
    if (data?.schema !== 'csem.team-info' || data.version !== 1 || !Array.isArray(data.teams) || data.teams.length > 1000) throw new Error('战队信息类型、版本或数量无效。');
    if (typeof data.name !== 'string' || data.name.length > 200 || data.current_date !== null && (typeof data.current_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.current_date))) throw new Error('战队文件名称或快照日期无效。');
    const ids = new Set();
    for (const t of data.teams) {
      if (!t || !idValid(t.id) || ids.has(t.id)) throw new Error('战队 ID 无效或重复。'); ids.add(t.id);
      if (typeof t.name !== 'string' || !t.name.trim() || t.name.length > 200 || t.region !== null && (typeof t.region !== 'string' || t.region.length > 64)) throw new Error('战队名称或赛区无效。');
      for (const key of ['vrs', 'stamina', 'wins', 'losses']) if (t[key] !== null && (!Number.isSafeInteger(t[key]) || t[key] < 0 || t[key] > 2147483647 || key === 'stamina' && t[key] > 100)) throw new Error(`战队 ${t.id} 的 ${key} 无效。`);
      if (t.prize_total !== null && (typeof t.prize_total !== 'string' || !/^(0|[1-9]\d*)$/.test(t.prize_total) || t.prize_total.length > 19 || BigInt(t.prize_total) > 9223372036854775807n)) throw new Error('累计奖金须为非负 int64 十进制字符串或 null。');
      if (t.honors === undefined && t.historical_honors !== undefined) t.honors = t.historical_honors;
      if (t.honors !== null && (!Array.isArray(t.honors) || t.honors.length > 1000 || t.honors.some(h => !h || typeof h !== 'object' || Array.isArray(h)))) throw new Error('荣誉须为对象数组或 null。');
      if (!Number.isSafeInteger(t.seedRank) || t.seedRank < 1 || !Number.isSafeInteger(t.liveRank) || t.liveRank < 0) throw new Error('战队种子排名须为正整数，实时排名须为非负整数。');
    }
    return data;
  }
  function fromLegacy(doc, name = doc.name) {
    const data = { schema: 'csem.team-info', version: 1, name, current_date: null, teams: doc.seeds.map(t => ({
      id: t.id, name: t.name, region: t.region ?? null, vrs: t.vrs ?? null, stamina: t.stamina ?? null,
      wins: t.wins ?? null, losses: t.losses ?? null, prize_total: t.prize_total == null ? null : String(t.prize_total),
      honors: t.honors ?? t.historical_honors ?? null, seedRank: t.seedRank, liveRank: t.liveRank
    })) };
    return parseTeamInfo(JSON.stringify(data));
  }
  function toSchedule(doc) {
    const schedule = E.copy(doc); schedule.version = 3; schedule.seeds = doc.seeds.map(t => ({ id: t.id }));
    return schedule;
  }
  function bindTeams(doc, info) {
    const draft = E.copy(doc), lookup = new Map((info?.teams || []).map(t => [t.id, t]));
    draft.seeds = doc.seeds.map((ref, i) => {
      const t = lookup.get(ref.id);
      return t ? { id: t.id, name: t.name, seedRank: t.seedRank, liveRank: t.liveRank } : { id: ref.id, name: `待导入 · ${ref.id}`, seedRank: i + 1, liveRank: 0, _teamMissing: true };
    });
    return draft;
  }
  function readSchedule(text, info = null) {
    if (typeof text !== 'string' || new TextEncoder().encode(text).length > 2_000_000) throw new Error('赛程超过 2 MB 限制。');
    const data = JSON.parse(text);
    if (data?.schema !== 'csem.graph-linker') throw new Error('赛程内容类型无效。');
    if (data.teamInfoFile !== undefined && (typeof data.teamInfoFile !== 'string' || data.teamInfoFile.length > 200)) throw new Error('建议战队文件名称无效。');
    if (data.version === 3) {
      if (!Array.isArray(data.seeds) || data.seeds.some(t => !t || !idValid(t.id) || Object.keys(t).some(k => k !== 'id'))) throw new Error('新版赛程种子层只能保存战队 ID 引用，战队信息请使用 .tinf。');
      data.version = 2;
      return E.parse(JSON.stringify(bindTeams(data, info)));
    }
    // Old archives can still supply graph structure, but never override a .tinf database.
    return bindTeams(E.parse(text), info);
  }
  const api = { FIELDS, parseTeamInfo, fromLegacy, toSchedule, bindTeams, readSchedule };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.GraphTeamInfo = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
