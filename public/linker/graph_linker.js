/* UI contains editing/layout only; engine.js owns graph and simulation semantics. */
(() => {
  'use strict';
  const E = GraphEngine, G = GraphEditor, F = GraphTeamInfo, $ = id => document.getElementById(id);
  const verification = new URLSearchParams(location.search).get('verify') === '1';
  let doc = F.bindTeams(E.sample(), null), state = E.createState(), currentStage = doc.stages[0].id;
  let teamInfo = null;
  let selected = { kind: 'stage', id: currentStage }, selection = [], pending = [], simulation = false, zoom = 1;
  let clipboard = null, hovered = false, cursor = { x: 0, y: 0 }, contextPoint = null, suppressClick = false;
  const history = new G.EditHistory();
  try {
    if (!verification) {
      const saved = localStorage.getItem('csem.graph-linker.draft.v3'), teams = localStorage.getItem('csem.graph-linker.teams.v1');
      if (saved) { teamInfo = teams ? F.parseTeamInfo(teams) : null; doc = F.readSchedule(saved, teamInfo); }
      else { const legacy = localStorage.getItem('csem.graph-linker.draft.v1'); if (legacy) { doc = E.parse(legacy); teamInfo = F.fromLegacy(doc, '旧草稿战队（只读迁移）'); } }
      currentStage = doc.stages[0]?.id || ''; selected = { kind: 'stage', id: currentStage };
    }
  } catch (_) { /* Invalid storage never overwrites the original saved draft. */ }
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const idFor = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  G.syncAdvanceLinks(doc, () => idFor('link'));
  G.layoutGroups(doc);
  selection = [selected];
  state = E.createState(doc);
  function toast(message) { $('toast').textContent = message; $('toast').classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => $('toast').classList.remove('show'), 3200); }
  function save() { if (verification) return; try { localStorage.setItem('csem.graph-linker.draft.v3', JSON.stringify(F.toSchedule(doc))); if (teamInfo) localStorage.setItem('csem.graph-linker.teams.v1', JSON.stringify(teamInfo)); } catch (_) { /* Export still works. */ }
  }
  const snapshot = () => ({ doc, teamInfo, state, currentStage, selected, selection });
  function edit(action, layoutOnly = false) {
    const before = E.copy(snapshot());
    if (action() === false) return;
    history.record(before); G.layoutGroups(doc);
    if (!layoutOnly) { state = E.createState(doc); pending = []; }
    if (selected && !selection.some(r => G.refKey(r) === G.refKey(selected))) selection = [selected];
    selection = selection.filter(r => G.nodeFor(doc, r)); selected = selection[0] || null;
    save(); render();
  }
  function restore(direction) {
    const value = history[direction](snapshot()); if (!value) return;
    ({ doc, teamInfo, state, currentStage, selected, selection } = value); pending = [];
    G.layoutGroups(doc); save(); render();
  }
  function selectOutlet(endpoint, multiple) {
    pending = multiple ? pending.includes(endpoint) ? pending.filter(p => p !== endpoint) : [...pending, endpoint] : [endpoint];
    render();
  }
  function tokenText(token) { return token ? token.preview ? token.candidates.map(t => t.name).join(' / ') : token.name : 'TBD'; }
  function port(endpoint, inlet = false, extra = '') { return `<button class="port ${inlet ? 'inlet' : extra} ${pending.includes(endpoint) ? 'pending' : ''}" data-endpoint="${esc(endpoint)}" data-inlet="${inlet}" ${inlet ? '' : `aria-pressed="${pending.includes(endpoint)}"`} title="${inlet ? '入口' : '出口'} ${esc(endpoint)}" aria-label="${inlet ? '入口' : '出口'} ${esc(endpoint)}"></button>`; }
  function nodeSelected(kind, id) { return selection.some(r => r.kind === kind && r.id === id) ? ' selected' : ''; }
  function setSelection(kind, id, multiple = false) {
    const ref = { kind, id };
    selection = multiple ? selection.some(r => G.refKey(r) === G.refKey(ref)) ? selection.filter(r => G.refKey(r) !== G.refKey(ref)) : [...selection, ref] : [ref];
    selected = selection[0] || null; render();
  }
  function render() {
    for (const [key, variable] of [['unresolved', '--blue'], ['winner', '--green'], ['loser', '--red']]) {
      const color = doc.appearance?.[key];
      if (/^#[a-f0-9]{6}$/i.test(color || '')) document.documentElement.style.setProperty(variable, color);
    }
    $('canvas').style.zoom = zoom;
    $('canvas').style.setProperty('--grid-size', `${G.GRID}px`);
    $('canvas').style.setProperty('--result-width', `${G.RESULT_WIDTH}px`);
    $('zoomValue').textContent = `${Math.round(zoom * 100)}%`;
    const runtime = E.derive(doc, state), stage = doc.stages.find(s => s.id === currentStage);
    $('documentName').value = doc.name;
    $('stageHeading').textContent = stage?.name || '添加第一个阶段';
    $('seedCount').textContent = `${doc.seeds.length} 队`;
    const resolved = doc.seeds.filter(t => !t._teamMissing).length;
    $('teamInfoStatus').textContent = `${teamInfo?.name || '尚未导入战队信息'} · 已匹配 ${resolved}/${doc.seeds.length} 队${doc.teamInfoFile ? ` · 建议文件 ${doc.teamInfoFile}` : ''}`;
    $('stages').innerHTML = doc.stages.map((s, i) => `<div class="stage ${s.id === currentStage ? 'active' : ''}" data-stage="${esc(s.id)}"><span class="stage-index">${String(i + 1).padStart(2, '0')}</span><div>${esc(s.name)}<small>${s.size} 队 · ${doc.matches.filter(m => m.stage === s.id).length} 场比赛</small></div></div>`).join('');
    $('seeds').innerHTML = doc.seeds.map(t => `<div class="seed-row"><span class="seed-rank">#${t.seedRank}</span><span class="seed-name" data-seed="${esc(t.id)}">${esc(t.name)}</span><button class="${pending.includes(`seed:${t.id}`) ? 'pending' : ''}" data-seed-source="${esc(t.id)}" aria-label="出口 seed:${esc(t.id)}" aria-pressed="${pending.includes(`seed:${t.id}`)}" title="从此种子连线">↗</button></div>`).join('');
    $('seeds').style.display = simulation ? 'none' : '';
    $('addSeedBtn').style.display = simulation ? 'none' : '';
    $('addSeedBtn').disabled = !teamInfo?.teams.some(t => !doc.seeds.some(s => s.id === t.id));
    $('canvas').classList.toggle('simulation', simulation);
    $('viewBtn').textContent = simulation ? '编辑视图' : '模拟视图';
    $('undoBtn').disabled = !history.past.length;
    $('redoBtn').disabled = !history.future.length;
    $('backStepBtn').disabled = !state.history.length;
    const issues = E.validate(doc);
    $('stepBtn').disabled = issues.length > 0 || !runtime.ready.length;
    $('issueCount').textContent = issues.length ? `${issues.length} 项` : '通过';
    $('issues').innerHTML = issues.length ? issues.map(i => `<div class="issue" data-issue="${esc(i.node)}">${esc(i.message)}</div>`).join('') : '<div class="valid">流程有效 · 可以按步推进</div>';
    const next = runtime.ready[0];
    $('runtimeStatus').textContent = runtime.complete ? `赛事完成 · 已结束 ${state.history.length} 场` : next ? `下一场：${next.name} · 已结束 ${state.history.length} 场` : '等待有效流程 / 两支已确认队伍';
    $('log').innerHTML = state.history.map((h, i) => `<div class="log-entry"><span>${String(i + 1).padStart(2, '0')}</span>${esc(doc.matches.find(m => m.id === h.matchId)?.name)}<br>胜方：${esc(doc.seeds.find(t => t.id === h.winnerId)?.name)}</div>`).join('') || '<div class="hint">每一步仅结束一场比赛。A/B 预推送不会进入比赛队列。</div>';
    $('linkInstruction').textContent = pending.length ? `已选 ${pending.length} 个出口：${pending.join('、')} · 点击入口整批接入（Esc 取消）` : `右键拖动框选 · Ctrl+C/X/V 画布缓存 · Ctrl+Z/Y 撤销/重做 · ${G.GRID}px 网格`;
    let html = '';
    if (stage) {
      const arrivals = doc.links.filter(l => l.target === `start:${stage.id}` && runtime.outputs.has(l.source)).length;
      const teams = runtime.starts.get(stage.id) || [];
      html += `<div class="layer-label start-label" style="left:${stage.x ?? 94}px;top:${(stage.y ?? 47) - 22}px">START LAYER / 收齐后排序</div><div class="node start${nodeSelected('stage', stage.id)}" data-kind="stage" data-id="${esc(stage.id)}" style="left:${stage.x ?? 94}px;top:${stage.y ?? 47}px">${port(`start:${stage.id}`, true)}<div class="node-title drag-handle">起始层 <small>${arrivals} / ${stage.size} 队</small></div>${Array.from({ length: stage.size }, (_, i) => `<div class="start-slot"><span>#${i + 1}</span>${esc(teams[i]?.name || 'TBD')}${port(`start:${stage.id}:${i}`)}</div>`).join('')}</div>`;
      for (const g of (doc.groups || []).filter(g => g.stage === stage.id)) {
        const pool = runtime.groups.get(g.id), range = g.mode === 'merged' && ['advance', 'placement'].includes(g.type) ? ` · ${g.rankStart}～${g.rankStart + g.members.length - 1}` : '';
        html += `<div class="node bigframe ${g.mode}${nodeSelected('group', g.id)}" data-kind="group" data-id="${esc(g.id)}" style="left:${g.x}px;top:${g.y}px;height:${G.groupHeight(g)}px"><div class="group-title drag-handle" title="选择大框，在检查器编辑标签">${esc(g.label || (g.mode === 'merged' ? '大框' : '仅标签'))}${esc(range)}</div>${g.mode === 'merged' && g.members.length ? port(`group:${g.id}`, true) + `<span class="pool-count">${pool?.teams.length || 0}/${E.capacityOf(doc, `group:${g.id}`)}</span>` : ''}</div>`;
      }
      for (const m of doc.matches.filter(m => m.stage === stage.id)) {
        const row = runtime.matches.get(m.id);
        const inputs = runtime.displayInputs(`match:${m.id}`).sort((a, b) => {
          const priority = token => token && !token.preview ? 0 : token ? 1 : 2;
          return priority(a.token) - priority(b.token) || (a.token?._arrival || 0) - (b.token?._arrival || 0);
        }).slice(0, 2);
        const played = state.history.find(h => h.matchId === m.id);
        html += `<div class="node match${nodeSelected('match', m.id)}" data-kind="match" data-id="${esc(m.id)}" style="left:${m.x}px;top:${m.y}px"><div class="node-title drag-handle">${esc(m.name)}<small>BO${m.bo}</small></div><div class="schedule">${esc(m.schedule || 'YYYY-MM-DD #X')}</div>${[0, 1].map(i => { const token = inputs[i]?.token; return `<div class="team-slot ${token?.preview ? 'speculative' : played && token ? token.id === played.winnerId ? 'winner' : 'loser' : ''}">${esc(tokenText(token))}</div>`; }).join('')}${E.groupOf(doc, 'match', m.id, true) ? '' : port(`match:${m.id}`, true)}${port(`match:${m.id}:win`, false, 'win-port')}${port(`match:${m.id}:lose`, false, 'lose-port')}<span class="port-label" style="top:64px">胜</span><span class="port-label" style="top:99px">败</span></div>`;
      }
      for (const r of doc.results.filter(r => r.stage === stage.id)) {
        const token = runtime.results.get(r.id) || runtime.displayInputs(`result:${r.id}`)[0]?.token;
        const g = E.groupOf(doc, 'result', r.id, true);
        html += `<div class="node result ${r.kind}${nodeSelected('result', r.id)}" data-kind="result" data-id="${esc(r.id)}" style="left:${r.x}px;top:${r.y}px">${g ? '' : port(`result:${r.id}`, true)}<span class="result-rank">#${g ? g.rankStart : r.rank}</span><div class="result-text"><small>${r.kind === 'advance' ? '下阶段推送 · 阶段末排名' : '淘汰结算 · 赛事最终排名'}</small><b class="${token?.preview ? 'speculative' : ''}">${esc(tokenText(token))}</b></div>${r.kind === 'advance' ? port(`result:${r.id}`, false, 'result-out') : ''}</div>`;
      }
      const nodes = [...doc.matches, ...doc.results, ...(doc.groups || [])].filter(n => n.stage === stage.id);
      $('canvas').style.width = `${Math.max(1390, (stage.x ?? 94) + 370, ...nodes.map(n => n.x + 370))}px`;
      $('canvas').style.height = `${Math.max(850, (stage.y ?? 47) + stage.size * 42 + 110, ...nodes.map(n => n.y + (n.members ? G.groupHeight(n) : 180)))}px`;
    }
    $('nodes').innerHTML = html;
    drawLinks(runtime);
    renderInspector(runtime);
  }
  function drawLinks(runtime) {
    const canvasRect = $('canvas').getBoundingClientRect();
    function pos(endpoint, inlet) {
      const portElement = [...$('nodes').querySelectorAll('[data-endpoint]')].find(el => el.dataset.endpoint === endpoint && el.dataset.inlet === String(inlet));
      if (!portElement) return null;
      const rect = portElement.getBoundingClientRect();
      return { x: (rect.left + rect.width / 2 - canvasRect.left) / zoom, y: (rect.top + rect.height / 2 - canvasRect.top) / zoom };
    }
    let paths = '<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#7b93b6"/></marker></defs>';
    const boundaries = [];
    for (const link of doc.links) {
      const sourceStage = E.stageOf(doc, link.source), targetStage = E.stageOf(doc, link.target);
      if (sourceStage !== currentStage && targetStage !== currentStage) continue;
      if (simulation && (link.source.startsWith('seed:') || link.source.startsWith('start:') || link.target.startsWith('start:'))) continue;
      let from = pos(link.source, false), to = pos(link.target, true);
      if (!from && to && link.target.startsWith('start:')) {
        const i = doc.links.filter(l => l.target === link.target).indexOf(link);
        from = { x: 25, y: 100 + i * 28 };
        const team = link.source.startsWith('seed:') ? doc.seeds.find(t => `seed:${t.id}` === link.source)?.name : `上阶段 ${doc.results.find(r => `result:${r.id}` === link.source)?.name || ''}`;
        boundaries.push(`<div class="boundary" style="left:8px;top:${from.y - 15}px">${esc(team)}</div>`);
      }
      if (from && !to && link.source.startsWith('result:')) {
        to = { x: parseInt($('canvas').style.width) - 55, y: from.y };
        const target = doc.stages.find(s => `start:${s.id}` === link.target);
        boundaries.push(`<div class="boundary" style="left:${to.x - 130}px;top:${to.y - 24}px">→ ${esc(target?.name)} 起始层</div>`);
      }
      if (!from || !to) continue;
      const bend = Math.max(45, Math.abs(to.x - from.x) * .48);
      const curve = `M${from.x},${from.y} C${from.x + bend},${from.y} ${to.x - bend},${to.y} ${to.x},${to.y}`;
      paths += `<path class="channel ${link.source.endsWith(':win') ? 'win-line' : link.source.endsWith(':lose') ? 'lose-line' : ''} ${runtime.previews.has(link.source) ? 'preview-line' : ''}${nodeSelected('link', link.id)}" d="${curve}" marker-end="url(#arrow)" data-link="${esc(link.id)}"><title>${esc(link.source)} → ${esc(link.target)}</title></path>`;
    }
    $('links').innerHTML = paths;
    $('nodes').querySelectorAll('.boundary').forEach(n => n.remove());
    $('nodes').insertAdjacentHTML('beforeend', boundaries.join(''));
  }
  const field = (label, html) => `<div class="field"><label>${label}</label>${html.replace(/<(input|select)\b/, `<$1 aria-label="${esc(label)}"`)}</div>`;
  const input = (key, value, type = 'text', extra = '') => `<input data-prop="${key}" value="${esc(value)}" type="${type}" ${extra}>`;
  function renderInspector(runtime) {
    if (selection.length > 1) { $('inspector').innerHTML = `<span class="badge">已选 ${selection.length} 个对象</span><h2 class="inspector-title">批量操作</h2>${operationButtons()}<p class="field-note">拖动任一已选框可整体移动。右键拖动重新框选；Shift 点击增选。</p>`; return; }
    if (!selected) { $('inspector').innerHTML = '<p class="inspector-empty">选择比赛、赛果、阶段或通道查看属性。</p>'; return; }
    const { kind, id } = selected;
    const node = G.nodeFor(doc, selected);
    if (!node) { selected = null; renderInspector(runtime); return; }
    let html = `<span class="badge">${esc(kind.toUpperCase())} · ${esc(id)}</span><h2 class="inspector-title">${{ stage: '阶段与起始层', seed: '种子队伍', match: '单一比赛框', result: '赛果位', link: '连接通道', group: node.mode === 'merged' ? '大框 · 共享入口' : '大框 · 仅标签' }[kind]}</h2>`;
    if (!['link', 'group', 'seed'].includes(kind)) html += field('名称', input('name', node.name));
    if (kind === 'stage') {
      html += field('本阶段预计队伍数 X', input('size', node.size, 'number', 'min="2" max="64"'));
      const options = { '': '空选 · 保持输入顺序', seedRank: '种子排名 ↑', stageRank: '阶段末排名 ↑', liveRank: '实时积分排名 ↑' };
      node.sort.forEach((key, index) => html += field(`第 ${index + 1} 关键字`, `<select data-sort="${index}">${Object.entries(options).map(([value, label]) => `<option value="${value}" ${key.key === value ? 'selected' : ''}>${label}</option>`).join('')}</select>`));
      html += '<p class="field-note">全部只允许升序。前项相同时才比较下一项；稳定排序后赋予唯一的 1…X 起始排名。</p>';
      const ordered = runtime.starts.get(id);
      if (ordered) html += `<p class="field-note">${ordered.map(t => `#${t.startRank} ${esc(t.name)}`).join('<br>')}</p>`;
      html += '<p class="field-note">改变人数不会自动补删赛果位和连线，请在画布中调整后校验。</p>';
    } else if (kind === 'seed') {
      const team = teamInfo?.teams.find(t => t.id === id);
      html += '<p class="field-note">战队信息只读，来自 .tinf；编辑器只编辑赛程与接线。</p>';
      for (const [key, label] of Object.entries({name:'名称',region:'赛区',vrs:'VRS',stamina:'体力',wins:'胜场',losses:'负场',prize_total:'累计奖金',seedRank:'种子排名',liveRank:'实时排名'})) html += field(label, `<span>${esc(team?.[key] ?? '未知')}</span>`);
      html += field('荣誉', `<span>${team?.honors == null ? '未知' : esc(JSON.stringify(team.honors))}</span>`);
    } else if (kind === 'match') {
      html += field('比赛长度', `<select data-prop="bo">${[1, 3, 5].map(n => `<option value="${n}" ${node.bo === n ? 'selected' : ''}>BO${n}</option>`).join('')}</select>`);
      html += field('比赛时序（占位）', input('schedule', node.schedule)) + '<p class="field-note">一个入口接两条通道；确认队伍按到达顺序先上后下。胜、败出口各接一条通道。</p>';
      const row = runtime.matches.get(id);
      html += `<p class="field-note">确认队伍：${row.teams.length} / 2<br>${row.played ? '本场已结束' : '预推送不计入确认人数'}</p>`;
    } else if (kind === 'result') {
      html += field('赛果区域', `<select data-prop="kind"><option value="advance" ${node.kind === 'advance' ? 'selected' : ''}>下阶段推送</option><option value="placement" ${node.kind === 'placement' ? 'selected' : ''}>淘汰结算</option></select>`);
      const g = E.groupOf(doc, 'result', id, true);
      if (g) html += `<p class="field-note">并列排名 ${g.rankStart}～${g.rankStart + g.members.length - 1}，请在大框属性中设置区间左端。</p>`;
      else html += field(node.kind === 'advance' ? '非零阶段末排名' : '赛事最终排名', input('rank', node.rank, 'number', 'min="1"'));
      html += '<p class="field-note">推送位在下阶段创建或类型改变时自动接至下一阶段起始层。赛果层全部收齐后才发送；结算位无出口。</p>';
    } else if (kind === 'group') {
      html += field('标签', input('label', node.label));
      if (node.mode === 'merged' && node.type === 'match') html += field('配对算法', `<select data-prop="algorithm">${Object.entries({ sequential: '按排名顺序 · 1-2 / 3-4 / 5-6', interleaved: '上下交错 · 1-4 / 2-5 / 3-6', outer: '首尾结合 · 1-6 / 2-5 / 3-4', custom: '自导入代码（占位）' }).map(([key, label]) => `<option value="${key}" ${node.algorithm === key ? 'selected' : ''}>${label}</option>`).join('')}</select>`) + '<p class="field-note">所有输入确认后，按本阶段唯一起始排名配对。自导入代码尚未执行。</p>';
      if (node.mode === 'merged' && ['advance', 'placement'].includes(node.type)) html += field('排名区间左端', input('rankStart', node.rankStart, 'number', 'min="1"')) + `<p class="field-note">区间 ${node.rankStart}～${node.rankStart + node.members.length - 1} · 框内战队并列。</p>`;
      html += `<p class="field-note">${node.members.length} 个小框 · ${node.mode === 'merged' ? '入口共享，出口独立' : '入口、比赛与排名设置均独立'}。拖入同类小框自动排列，拖出解除归属。</p>`;
    } else html += field('来源出口', `<input readonly value="${esc(node.source)}">`) + field('目标入口', `<input readonly value="${esc(node.target)}">`) + '<p class="field-note">空值显示 TBD；A/B 是候选展示，不是两个队伍已入场。</p>';
    if (kind !== 'link') {
      const endpoint = `${kind === 'stage' ? 'start' : kind}:${id}`;
      const links = doc.links.filter(l => E.sourceNode(l.source) === endpoint || l.target === endpoint);
      html += '<div class="field-note">附着通道（点击检查/删除）</div>' + links.map(l => `<button class="attached-link" data-inspect-link="${esc(l.id)}">${esc(l.source)} → ${esc(l.target)}</button>`).join('');
    }
    if (['match', 'result'].includes(kind) && E.groupOf(doc, kind, id)) html += '<button data-operation="detach" class="full">移出大框</button>';
    html += kind === 'seed' ? '' : ['match', 'result', 'group', 'link'].includes(kind) ? operationButtons() : '<button class="danger" id="deleteSelected">删除阶段及所属节点</button>';
    $('inspector').innerHTML = html;
  }
  function connect(target) {
    const plan = G.planConnections(doc, pending, target, () => idFor('link'));
    if (!plan.ok) { toast(plan.message); render(); return; }
    edit(() => { doc.links.push(...plan.links); selected = { kind: 'link', id: plan.links[0].id }; });
    toast(`已连接 ${plan.links.length} 条通道。`);
  }
  function deleteSelected() {
    if (!selected) return;
    if (selected.kind === 'seed') { toast('战队信息只读，请在战队文件中维护。'); return; }
    const { kind, id } = selected;
    const layoutOnly = selection.length > 0 && selection.every(r => r.kind === 'group' && G.nodeFor(doc, r)?.mode === 'label' && !G.nodeFor(doc, r).members.length);
    edit(() => {
      if (selection.every(r => ['match', 'result', 'group', 'link'].includes(r.kind))) { G.deleteObjects(doc, selection); selection = []; selected = null; return; }
      let endpoints = [];
      if (kind === 'stage') {
        endpoints = [`start:${id}`, ...(doc.groups || []).filter(g => g.stage === id).map(g => `group:${g.id}`), ...doc.matches.filter(m => m.stage === id).map(m => `match:${m.id}`), ...doc.results.filter(r => r.stage === id).map(r => `result:${r.id}`)];
        doc.groups = doc.groups.filter(g => g.stage !== id);
        doc.matches = doc.matches.filter(m => m.stage !== id); doc.results = doc.results.filter(r => r.stage !== id); doc.stages = doc.stages.filter(s => s.id !== id); currentStage = doc.stages[0]?.id || '';
      } else if (kind === 'link') doc.links = doc.links.filter(l => l.id !== id);
      else { endpoints = [`${kind}:${id}`]; const key = { seed: 'seeds', match: 'matches', result: 'results' }[kind]; doc[key] = doc[key].filter(n => n.id !== id); }
      doc.links = doc.links.filter(l => !endpoints.some(e => E.sourceNode(l.source) === e || l.target === e));
      if (kind === 'stage') G.syncAdvanceLinks(doc, () => idFor('link'));
      selected = null;
      selection = [];
    }, layoutOnly);
  }
  function canMerge() { return selection.length && selection.every(r => ['match', 'result'].includes(r.kind) && r.kind === selection[0].kind && (r.kind !== 'result' || G.nodeFor(doc, r).kind === G.nodeFor(doc, selection[0]).kind)); }
  function operationButtons() {
    const button = (op, label) => `<button data-operation="${op}" class="full">${label}</button>`;
    let html = canMerge() ? button('merge', '设为大框') + button('label', '设为大框（仅标签）') : '';
    if (selection.length && selection.every(r => r.kind === 'result')) html += button('advance', '全部设为下阶段推送') + button('placement', '全部设为淘汰');
    return html + button('copy', '复制 · Ctrl+C') + button('cut', '剪切 · Ctrl+X') + button('delete', '全部删除 · Del');
  }
  function copySelection(cut = false) {
    const refs = selection.filter(r => ['match', 'result', 'group', 'link'].includes(r.kind));
    if (!refs.length) return;
    clipboard = G.copyObjects(doc, refs);
    if (cut) deleteSelected();
    toast(cut ? '已剪切到画布缓存。' : '已复制到画布缓存，悬停画布后 Ctrl+V 粘贴。');
  }
  function operate(op) {
    $('contextMenu').hidden = true;
    if (op === 'copy' || op === 'cut') return copySelection(op === 'cut');
    if (op === 'paste' && contextPoint) return pasteSelection(contextPoint);
    if (op === 'delete') return deleteSelected();
    if (op === 'advance' || op === 'placement') return edit(() => { G.setResultKind(doc, selection, op); G.syncAdvanceLinks(doc, () => idFor('link')); });
    if (op === 'detach' && selected) return edit(() => { const n = G.nodeFor(doc, selected); const p = spawn(); G.detach(doc, selected); Object.assign(n, p); }, E.groupOf(doc, selected.kind, selected.id)?.mode === 'label');
    if (['merge', 'label'].includes(op) && canMerge()) edit(() => {
      const box = G.bounds(doc, selection), g = G.makeGroup(doc, selection, op === 'merge' ? 'merged' : 'label', idFor('group'), { x: box.x, y: Math.max(G.GRID, box.y - G.GRID), stage: currentStage });
      if (!g) { toast('所选框不能合并。'); return false; }
      selected = { kind: 'group', id: g.id }; selection = [selected];
    }, op === 'label');
  }
  function pasteSelection(point) {
    edit(() => { const result = G.pasteObjects(doc, clipboard, point, currentStage, idFor); if (!result.ok) { toast(result.message); return false; } selection = roots(result.refs); selected = selection[0] || null; G.syncAdvanceLinks(doc, () => idFor('link')); }, clipboard && !clipboard.matches.length && !clipboard.results.length && !clipboard.links.length && clipboard.groups.every(g => g.mode === 'label'));
  }
  document.addEventListener('click', event => {
    if (suppressClick) { suppressClick = false; return; }
    const operation = event.target.closest('[data-operation]'); if (operation) { operate(operation.dataset.operation); return; }
    if (!event.target.closest('#contextMenu')) $('contextMenu').hidden = true;
    const attached = event.target.closest('[data-inspect-link]'); if (attached) { setSelection('link', attached.dataset.inspectLink); return; }
    const portEl = event.target.closest('[data-endpoint]');
    if (portEl) { event.stopPropagation(); if (portEl.dataset.inlet === 'false') selectOutlet(portEl.dataset.endpoint, event.shiftKey); else if (pending.length) connect(portEl.dataset.endpoint); else toast('先点击一个出口，再点击入口。'); return; }
    const seedSource = event.target.closest('[data-seed-source]');
    if (seedSource) { selectOutlet(`seed:${seedSource.dataset.seedSource}`, event.shiftKey); return; }
    const stageEl = event.target.closest('[data-stage]'); if (stageEl) { currentStage = stageEl.dataset.stage; setSelection('stage', currentStage); $('canvasScroll').scrollTo(0, 0); return; }
    const seedEl = event.target.closest('[data-seed]'); if (seedEl) { setSelection('seed', seedEl.dataset.seed); return; }
    const linkEl = event.target.closest('[data-link]'); if (linkEl) { setSelection('link', linkEl.dataset.link, event.shiftKey); return; }
    const nodeEl = event.target.closest('.node'); if (nodeEl) { setSelection(nodeEl.dataset.kind, nodeEl.dataset.id, event.shiftKey); return; }
    const issueEl = event.target.closest('[data-issue]'); if (issueEl) { const id = issueEl.dataset.issue; for (const [key, kind] of [['stages', 'stage'], ['groups', 'group'], ['matches', 'match'], ['results', 'result'], ['seeds', 'seed'], ['links', 'link']]) { const n = doc[key].find(n => n.id === id); if (n) { if (n.stage) currentStage = n.stage; if (kind === 'stage') currentStage = n.id; setSelection(kind, id); break; } } }
    if (event.target.id === 'deleteSelected') deleteSelected();
  });
  $('inspector').addEventListener('change', event => {
    if (!selected) return;
    const el = event.target, { kind, id } = selected;
    if (kind === 'seed') return;
    const n = G.nodeFor(doc, selected);
    if (el.dataset.sort !== undefined) { edit(() => { n.sort[+el.dataset.sort] = { key: el.value, direction: 'asc' }; }); return; }
    if (!el.dataset.prop) return;
    const prop = el.dataset.prop, value = ['size', 'seedRank', 'rank', 'rankStart', 'bo'].includes(prop) ? +el.value : el.value;
    if (typeof value === 'number' && (!Number.isSafeInteger(value) || value < 1 || (prop === 'size' && (value < 2 || value > 64)))) { toast('请输入有效范围内的整数。'); render(); return; }
    edit(() => { if (kind === 'result' && prop === 'kind') { G.setResultKind(doc, [selected], value); G.syncAdvanceLinks(doc, () => idFor('link')); } else n[prop] = value; }, prop === 'label' || prop === 'name');
  });
  let drag = null, marquee = null;
  const logicalPoint = event => { const box = $('canvas').getBoundingClientRect(); return { x: (event.clientX - box.left) / zoom, y: (event.clientY - box.top) / zoom }; };
  const roots = refs => refs.filter(r => !['match', 'result'].includes(r.kind) || !refs.some(p => p.kind === 'group' && E.groupOf(doc, r.kind, r.id)?.id === p.id));
  $('canvasScroll').addEventListener('pointerenter', () => hovered = true);
  $('canvasScroll').addEventListener('pointerleave', () => hovered = false);
  $('canvas').addEventListener('contextmenu', event => event.preventDefault());
  $('canvas').addEventListener('pointerdown', event => {
    $('contextMenu').hidden = true;
    cursor = logicalPoint(event);
    if (event.button === 2 || (event.button === 0 && !event.target.closest('.node,[data-link],.port'))) {
      const point = logicalPoint(event);
      marquee = { start: point, button: event.button, clientX: event.clientX, clientY: event.clientY, target: event.target.closest('.node,[data-link]') };
      $('canvas').setPointerCapture(event.pointerId); event.preventDefault(); return;
    }
    if (event.button !== 0 || event.target.closest('.port') || event.shiftKey) return;
    const handle = event.target.closest('.drag-handle,.result'); if (!handle) return;
    const el = handle.closest('.node'), ref = { kind: el.dataset.kind, id: el.dataset.id };
    if (!selection.some(r => G.refKey(r) === G.refKey(ref))) { selection = [ref]; selected = ref; }
    const refs = roots(selection).filter(r => ['stage', 'match', 'result', 'group'].includes(r.kind));
    drag = { ref, refs, start: logicalPoint(event), positions: refs.map(r => ({ ref: r, x: G.nodeFor(doc, r).x ?? 94, y: G.nodeFor(doc, r).y ?? 47 })), before: E.copy(snapshot()), moved: false };
    $('canvas').setPointerCapture(event.pointerId); event.preventDefault();
  });
  $('canvas').addEventListener('pointermove', event => {
    cursor = logicalPoint(event);
    if (marquee) {
      const box = $('selectionBox'); box.hidden = false;
      Object.assign(box.style, { left: `${Math.min(cursor.x, marquee.start.x)}px`, top: `${Math.min(cursor.y, marquee.start.y)}px`, width: `${Math.abs(cursor.x - marquee.start.x)}px`, height: `${Math.abs(cursor.y - marquee.start.y)}px` }); return;
    }
    if (!drag) return;
    const anchor = drag.positions[0];
    let dx = G.snap(anchor.x + cursor.x - drag.start.x) - anchor.x, dy = G.snap(anchor.y + cursor.y - drag.start.y) - anchor.y;
    dx = Math.max(dx, G.GRID - Math.min(...drag.positions.map(p => p.x))); dy = Math.max(dy, G.GRID - Math.min(...drag.positions.map(p => p.y)));
    if (!drag.moved && !dx && !dy) return;
    if (!drag.moved) { for (const ref of drag.refs.filter(r => ['match', 'result'].includes(r.kind))) G.detach(doc, ref); drag.moved = true; }
    drag.positions.forEach(p => Object.assign(G.nodeFor(doc, p.ref), { x: p.x + dx, y: p.y + dy })); G.layoutGroups(doc); render();
  });
  function showMenu(x, y) {
    if (!selection.length && !clipboard) return;
    contextPoint = { ...cursor };
    const menu = $('contextMenu'); menu.innerHTML = (selection.length ? operationButtons() : '') + (clipboard ? '<button data-operation="paste" class="full">粘贴 · Ctrl+V</button>' : ''); menu.hidden = false;
    menu.style.left = `${Math.min(x, innerWidth - menu.offsetWidth - 8)}px`; menu.style.top = `${Math.max(8, Math.min(y, innerHeight - menu.offsetHeight - 8))}px`;
  }
  function finishPointer(event, cancelled = false) {
    cursor = logicalPoint(event);
    if (marquee) {
      const start = marquee.start, end = logicalPoint(event), x1 = Math.min(start.x, end.x), y1 = Math.min(start.y, end.y), x2 = Math.max(start.x, end.x), y2 = Math.max(start.y, end.y);
      if (Math.abs(event.clientX - marquee.clientX) + Math.abs(event.clientY - marquee.clientY) > 5) {
        const canvasRect = $('canvas').getBoundingClientRect(), refs = [];
        for (const element of $('canvas').querySelectorAll('.node:not(.start),[data-link]')) {
          const ref = element.dataset.link ? { kind: 'link', id: element.dataset.link } : { kind: element.dataset.kind, id: element.dataset.id };
          if (ref.kind === 'link') { const link = G.nodeFor(doc, ref); if (link.source.startsWith('seed:') && link.target.startsWith('start:')) continue; }
          const r = element.getBoundingClientRect(), left = (r.left - canvasRect.left) / zoom, top = (r.top - canvasRect.top) / zoom;
          if (left >= x1 && top >= y1 && (r.right - canvasRect.left) / zoom <= x2 && (r.bottom - canvasRect.top) / zoom <= y2) refs.push(ref);
        }
        selection = roots(refs); selected = selection[0] || null;
      } else if (marquee.target) {
        const target = marquee.target, ref = target.dataset.link ? { kind: 'link', id: target.dataset.link } : { kind: target.dataset.kind, id: target.dataset.id };
        const link = ref.kind === 'link' && G.nodeFor(doc, ref);
        if (ref.kind !== 'stage' && !(link && link.source.startsWith('seed:'))) { if (!selection.some(r => G.refKey(r) === G.refKey(ref))) selection = [ref]; selected = selection[0]; }
      }
      selection = selection.filter(r => !['stage', 'seed'].includes(r.kind)); selected = selection[0] || null;
      if (marquee.button === 0) suppressClick = true;
      marquee = null; $('selectionBox').hidden = true; render(); if (!cancelled) showMenu(event.clientX, event.clientY); return;
    }
    if (!drag) return;
    if (cancelled) { ({ doc, teamInfo, state, currentStage, selected, selection } = drag.before); }
    else if (drag.moved) {
      let structural = JSON.stringify(doc.groups.filter(g => g.mode === 'merged').map(g => g.members)) !== JSON.stringify(drag.before.doc.groups.filter(g => g.mode === 'merged').map(g => g.members));
      const moving = drag.refs.filter(r => ['match', 'result'].includes(r.kind)), target = doc.groups.filter(g => g.stage === currentStage && !drag.refs.some(r => r.kind === 'group' && r.id === g.id)).find(g => cursor.x >= g.x - G.GRID / 5 && cursor.x <= g.x + G.RESULT_WIDTH + G.GRID / 5 && cursor.y >= g.y && cursor.y <= g.y + G.groupHeight(g));
      if (target && moving.length) {
        const draft = E.copy(doc), group = draft.groups.find(g => g.id === target.id);
        if (G.attach(draft, group, moving) && !E.validate(draft).some(i => ['GROUP', 'GROUP_PORT', 'CYCLE'].includes(i.code))) { doc = draft; structural ||= target.mode === 'merged'; }
      }
      history.record(drag.before); if (structural) { state = E.createState(doc); pending = []; } save(); suppressClick = true;
    }
    else { selected = drag.ref; selection = [selected]; }
    drag = null; render();
  }
  $('canvas').addEventListener('pointerup', event => finishPointer(event)); $('canvas').addEventListener('pointercancel', event => finishPointer(event, true));
  document.addEventListener('keydown', event => {
    if (event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]')) return;
    const control = event.ctrlKey || event.metaKey, key = event.key.toLowerCase();
    if (control && ['c', 'x'].includes(key) && window.getSelection?.()?.toString()) return;
    if (control && ['z', 'y'].includes(key)) { event.preventDefault(); restore(key === 'y' || event.shiftKey ? 'redo' : 'undo'); return; }
    if (control && ['c', 'x'].includes(key) && selection.some(r => ['match', 'result', 'group', 'link'].includes(r.kind))) { event.preventDefault(); copySelection(key === 'x'); return; }
    if (control && key === 'v' && hovered && clipboard) { event.preventDefault(); pasteSelection(cursor); return; }
    if (event.key === 'Escape') { pending = []; $('contextMenu').hidden = true; render(); }
    if (['Delete', 'Backspace'].includes(event.key) && !event.ctrlKey && !event.altKey && !event.metaKey && !event.repeat && selected) { event.preventDefault(); deleteSelected(); }
  });
  $('documentName').addEventListener('change', event => edit(() => doc.name = event.target.value.trim() || '未命名赛制'));
  function spawn() { const scroll = $('canvasScroll'); return G.spawnPoint(scroll.clientWidth, scroll.scrollLeft, scroll.scrollTop, zoom); }
  $('addMatchBtn').onclick = () => { if (!currentStage) return toast('先添加一个阶段。'); edit(() => { const id = idFor('match'), n = doc.matches.filter(n => n.stage === currentStage).length; doc.matches.push({ id, stage: currentStage, name: `比赛 ${n + 1}`, bo: 3, schedule: 'YYYY-MM-DD #X', ...spawn() }); selected = { kind: 'match', id }; }); };
  $('addResultBtn').onclick = () => { if (!currentStage) return toast('先添加一个阶段。'); edit(() => { const id = idFor('result'), n = doc.results.filter(n => n.stage === currentStage).length; doc.results.push({ id, stage: currentStage, kind: 'placement', rank: G.nextRank(doc, 'placement', currentStage), name: `赛果 ${n + 1}`, ...spawn() }); selected = { kind: 'result', id }; }); };
  const addGroup = mode => { if (!currentStage) return toast('先添加一个阶段。'); edit(() => { const g = G.makeGroup(doc, [], mode, idFor('group'), { ...spawn(), stage: currentStage }); selected = { kind: 'group', id: g.id }; }, mode === 'label'); };
  $('addGroupBtn').onclick = () => addGroup('merged'); $('addLabelGroupBtn').onclick = () => addGroup('label');
  $('addStageBtn').onclick = () => edit(() => { const id = idFor('stage'), previous = doc.stages.at(-1), advanceCount = doc.results.filter(r => r.stage === previous?.id && r.kind === 'advance').length; doc.stages.push({ id, name: `阶段 ${doc.stages.length + 1}`, size: Math.min(64, Math.max(2, advanceCount || 4)), x: 94, y: 47, sort: Array.from({ length: 3 }, () => ({ key: '', direction: 'asc' })) }); G.syncAdvanceLinks(doc, () => idFor('link')); currentStage = id; selected = { kind: 'stage', id }; });
  $('addSeedBtn').onclick = () => { if (!teamInfo) return toast('先导入 .tinf 战队文件。'); edit(() => { const known = new Set(doc.seeds.map(t => t.id)); doc.seeds.push(...teamInfo.teams.filter(t => !known.has(t.id)).map(t => ({id:t.id}))); doc = F.bindTeams(doc, teamInfo); selected = {kind:'stage',id:currentStage}; }); };
  $('undoBtn').onclick = () => restore('undo'); $('redoBtn').onclick = () => restore('redo');
  $('viewBtn').onclick = () => { simulation = !simulation; pending = []; render(); };
  $('zoomOutBtn').onclick = () => { zoom = Math.max(.2, zoom - .1); render(); };
  $('zoomInBtn').onclick = () => { zoom = Math.min(1.5, zoom + .1); render(); };
  $('fitBtn').onclick = () => { zoom = Math.max(.2, Math.min(1, ($('canvasScroll').clientWidth - 24) / parseInt($('canvas').style.width))); render(); $('canvasScroll').scrollTo(0, 0); };
  $('resetBtn').onclick = () => { state = E.createState(doc); currentStage = E.derive(doc, state).activeStage || doc.stages[0]?.id || ''; selected = currentStage ? {kind:'stage',id:currentStage} : null; selection = selected ? [selected] : []; render(); };
  $('backStepBtn').onclick = () => { E.backStep(doc, state); const runtime = E.derive(doc, state), nextStage = runtime.activeStage || currentStage; if (nextStage !== currentStage) { selected = { kind: 'stage', id: nextStage }; selection = [selected]; } currentStage = nextStage; render(); };
  $('stepBtn').onclick = () => { const result = E.step(doc, state); if (!result.ok) toast(result.issues[0].message); else { const runtime = E.derive(doc, state), nextStage = runtime.activeStage || result.match.stage; if (nextStage !== currentStage) { selected = { kind: 'stage', id: nextStage }; selection = [selected]; } currentStage = nextStage; toast(`${result.match.name} · ${result.winner.name} 胜出`); } render(); };
  $('validateBtn').onclick = () => { const issues = E.validate(doc); toast(issues.length ? `还有 ${issues.length} 项待修正。点击右侧问题定位。` : '流程校验通过，可以按步推进。'); render(); };
  $('sampleBtn').onclick = () => edit(() => { doc = F.bindTeams(E.sample(), teamInfo); doc.teamInfoFile = 'sample.tinf'; currentStage = doc.stages[0].id; selected = { kind: 'stage', id: currentStage }; });
  $('emptyBtn').onclick = () => edit(() => { doc = { schema: 'csem.graph-linker', version: 2, name: '新赛制', appearance: E.sample().appearance, seeds: [], stages: [{ id: 's1', name: '阶段 1', size: 4, x: 94, y: 47, sort: Array.from({ length: 3 }, () => ({ key: '', direction: 'asc' })) }], matches: [], results: [], groups: [], links: [] }; currentStage = 's1'; selected = { kind: 'stage', id: currentStage }; selection = [selected]; });
  $('importBtn').onclick = () => $('fileInput').click();
  $('importTeamsBtn').onclick = () => $('teamFileInput').click();
  function importFile(kind) { return async event => {
    const file = event.target.files[0]; if (!file) return;
    try {
      if (file.size > CsemCodec.MAX_COMPRESSED) throw new Error('文件过大。');
      const decoded = await CsemCodec.decodeFile(await file.arrayBuffer(), kind);
      if (kind === 'teams') {
        const incoming = F.parseTeamInfo(decoded.text);
        edit(() => { teamInfo = incoming; if (!doc.seeds.length) doc.seeds = incoming.teams.map(t => ({id:t.id})); doc = F.bindTeams(doc, incoming); selected = currentStage ? {kind:'stage',id:currentStage} : null; selection = selected ? [selected] : []; });
        toast(`已导入 .tinf · ${incoming.teams.length} 队；信息只读，按 ID 匹配赛程。`);
      } else {
        const incoming = F.readSchedule(decoded.text, teamInfo);
        edit(() => { doc = incoming; G.syncAdvanceLinks(doc, () => idFor('link')); currentStage = doc.stages[0]?.id || ''; selected = currentStage ? { kind: 'stage', id: currentStage } : null; selection = selected ? [selected] : []; });
        const missing = doc.seeds.filter(t => t._teamMissing).length;
        toast(`已导入压缩 .csem；${missing ? `缺少 ${missing} 支战队，请导入匹配的 .tinf。` : '战队 ID 已全部匹配。'}${decoded.version === 2 ? '旧文件内置战队信息不作为导入数据。' : ''}`);
      }
    } catch (error) { toast(`导入失败：${error.message}`); }
    event.target.value = '';
  }; }
  $('fileInput').onchange = importFile('schedule'); $('teamFileInput').onchange = importFile('teams');
  $('exportBtn').onclick = async () => { try { const bytes = await CsemCodec.encode(F.toSchedule(doc)), blob = new Blob([bytes], { type: 'application/octet-stream' }), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = `${doc.name.replace(/[\\/:*?"<>|]/g, '_')}.csem`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000); toast(`已请求下载 .csem v3 · ${bytes.length} 字节；仅包含赛程与战队 ID。`); } catch (error) { toast(`导出失败：${error.message}`); } };
  // Exposed read-only snapshots make prototype verification reproducible.
  window.GraphLinkerDebug = { snapshot: () => ({ doc: E.copy(doc), teamInfo: E.copy(teamInfo), state: E.copy(state), issues: E.validate(doc) }) };
  render();
})();
