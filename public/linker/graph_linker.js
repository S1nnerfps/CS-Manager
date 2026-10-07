/* UI contains editing/layout only; engine.js owns graph and simulation semantics. */
(() => {
  'use strict';
  const E = GraphEngine, G = GraphEditor, $ = id => document.getElementById(id);
  const verification = new URLSearchParams(location.search).get('verify') === '1';
  let doc = E.sample(), state = E.createState(), currentStage = doc.stages[0].id;
  let selected = { kind: 'stage', id: currentStage }, pending = [], simulation = false, zoom = 1;
  const undo = [];
  try { const saved = verification ? null : localStorage.getItem('csem.graph-linker.draft.v1'); if (saved) { doc = E.parse(saved); currentStage = doc.stages[0]?.id || ''; selected = { kind: 'stage', id: currentStage }; } } catch (_) { /* Keep the example if browser storage is unavailable or an old draft is invalid. */ }
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const idFor = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  G.syncAdvanceLinks(doc, () => idFor('link'));
  state = E.createState(doc);
  function toast(message) { $('toast').textContent = message; $('toast').classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => $('toast').classList.remove('show'), 3200); }
  function save() { if (verification) return; try { localStorage.setItem('csem.graph-linker.draft.v1', JSON.stringify(doc)); } catch (_) { /* Export still works. */ }
  }
  function edit(action) { undo.push(E.copy(doc)); if (undo.length > 40) undo.shift(); action(); state = E.createState(doc); pending = []; save(); render(); }
  function selectOutlet(endpoint, multiple) {
    pending = multiple ? pending.includes(endpoint) ? pending.filter(p => p !== endpoint) : [...pending, endpoint] : [endpoint];
    render();
  }
  function tokenText(token) { return token ? token.preview ? token.candidates.map(t => t.name).join(' / ') : token.name : 'TBD'; }
  function port(endpoint, inlet = false, extra = '') { return `<button class="port ${inlet ? 'inlet' : extra} ${pending.includes(endpoint) ? 'pending' : ''}" data-endpoint="${esc(endpoint)}" data-inlet="${inlet}" ${inlet ? '' : `aria-pressed="${pending.includes(endpoint)}"`} title="${inlet ? '入口' : '出口'} ${esc(endpoint)}" aria-label="${inlet ? '入口' : '出口'} ${esc(endpoint)}"></button>`; }
  function nodeSelected(kind, id) { return selected?.kind === kind && selected.id === id ? ' selected' : ''; }
  function setSelection(kind, id) { selected = { kind, id }; render(); }
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
    $('stages').innerHTML = doc.stages.map((s, i) => `<div class="stage ${s.id === currentStage ? 'active' : ''}" data-stage="${esc(s.id)}"><span class="stage-index">${String(i + 1).padStart(2, '0')}</span><div>${esc(s.name)}<small>${s.size} 队 · ${doc.matches.filter(m => m.stage === s.id).length} 场比赛</small></div></div>`).join('');
    $('seeds').innerHTML = doc.seeds.map(t => `<div class="seed-row"><span class="seed-rank">#${t.seedRank}</span><span class="seed-name" data-seed="${esc(t.id)}">${esc(t.name)}</span><button class="${pending.includes(`seed:${t.id}`) ? 'pending' : ''}" data-seed-source="${esc(t.id)}" aria-label="出口 seed:${esc(t.id)}" aria-pressed="${pending.includes(`seed:${t.id}`)}" title="从此种子连线">↗</button></div>`).join('');
    $('seeds').style.display = simulation ? 'none' : '';
    $('addSeedBtn').style.display = simulation ? 'none' : '';
    $('canvas').classList.toggle('simulation', simulation);
    $('viewBtn').textContent = simulation ? '编辑视图' : '模拟视图';
    $('undoBtn').disabled = !undo.length;
    $('backStepBtn').disabled = !state.history.length;
    const issues = E.validate(doc);
    $('stepBtn').disabled = issues.length > 0 || !runtime.ready.length;
    $('issueCount').textContent = issues.length ? `${issues.length} 项` : '通过';
    $('issues').innerHTML = issues.length ? issues.map(i => `<div class="issue" data-issue="${esc(i.node)}">${esc(i.message)}</div>`).join('') : '<div class="valid">流程有效 · 可以按步推进</div>';
    const next = runtime.ready[0];
    $('runtimeStatus').textContent = runtime.complete ? `赛事完成 · 已结束 ${state.history.length} 场` : next ? `下一场：${next.name} · 已结束 ${state.history.length} 场` : '等待有效流程 / 两支已确认队伍';
    $('log').innerHTML = state.history.map((h, i) => `<div class="log-entry"><span>${String(i + 1).padStart(2, '0')}</span>${esc(doc.matches.find(m => m.id === h.matchId)?.name)}<br>胜方：${esc(doc.seeds.find(t => t.id === h.winnerId)?.name)}</div>`).join('') || '<div class="hint">每一步仅结束一场比赛。A/B 预推送不会进入比赛队列。</div>';
    $('linkInstruction').textContent = pending.length ? `已选 ${pending.length} 个出口：${pending.join('、')} · 点击入口整批接入（Esc 取消）` : `Shift + 点击出口可多选；拖动吸附 ${G.GRID}px 网格；Del / Backspace 删除选中对象。`;
    let html = '';
    if (stage) {
      const arrivals = doc.links.filter(l => l.target === `start:${stage.id}` && runtime.outputs.has(l.source)).length;
      const teams = runtime.starts.get(stage.id) || [];
      html += `<div class="layer-label start-label" style="left:90px;top:12px">START LAYER / 收齐后排序</div><div class="node start${nodeSelected('stage', stage.id)}" data-kind="stage" data-id="${esc(stage.id)}">${port(`start:${stage.id}`, true)}<div class="node-title">起始层 <small>${arrivals} / ${stage.size} 队</small></div>${Array.from({ length: stage.size }, (_, i) => `<div class="start-slot"><span>#${i + 1}</span>${esc(teams[i]?.name || 'TBD')}${port(`start:${stage.id}:${i}`)}</div>`).join('')}</div>`;
      for (const m of doc.matches.filter(m => m.stage === stage.id)) {
        const row = runtime.matches.get(m.id);
        const inputs = runtime.displayInputs(`match:${m.id}`).sort((a, b) => {
          const priority = token => token && !token.preview ? 0 : token ? 1 : 2;
          return priority(a.token) - priority(b.token) || (a.token?._arrival || 0) - (b.token?._arrival || 0);
        }).slice(0, 2);
        const played = state.history.find(h => h.matchId === m.id);
        html += `<div class="node match${nodeSelected('match', m.id)}" data-kind="match" data-id="${esc(m.id)}" style="left:${m.x}px;top:${m.y}px"><div class="node-title drag-handle">${esc(m.name)}<small>BO${m.bo}</small></div><div class="schedule">${esc(m.schedule || 'YYYY-MM-DD #X')}</div>${[0, 1].map(i => { const token = inputs[i]?.token; return `<div class="team-slot ${token?.preview ? 'speculative' : played && token ? token.id === played.winnerId ? 'winner' : 'loser' : ''}">${esc(tokenText(token))}</div>`; }).join('')}${port(`match:${m.id}`, true)}${port(`match:${m.id}:win`, false, 'win-port')}${port(`match:${m.id}:lose`, false, 'lose-port')}<span class="port-label" style="top:64px">胜</span><span class="port-label" style="top:99px">败</span></div>`;
      }
      for (const r of doc.results.filter(r => r.stage === stage.id)) {
        const token = runtime.results.get(r.id) || runtime.displayInputs(`result:${r.id}`)[0]?.token;
        html += `<div class="node result ${r.kind}${nodeSelected('result', r.id)}" data-kind="result" data-id="${esc(r.id)}" style="left:${r.x}px;top:${r.y}px">${port(`result:${r.id}`, true)}<span class="result-rank">#${r.rank}</span><div class="result-text"><small>${r.kind === 'advance' ? '下阶段推送 · 阶段末排名' : '淘汰结算 · 赛事最终排名'}</small><b class="${token?.preview ? 'speculative' : ''}">${esc(tokenText(token))}</b></div>${r.kind === 'advance' ? port(`result:${r.id}`, false, 'result-out') : ''}</div>`;
      }
      const nodes = [...doc.matches, ...doc.results].filter(n => n.stage === stage.id);
      $('canvas').style.width = `${Math.max(1390, ...nodes.map(n => n.x + 370))}px`;
      $('canvas').style.height = `${Math.max(850, stage.size * 42 + 110, ...nodes.map(n => n.y + 180))}px`;
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
    if (!selected) { $('inspector').innerHTML = '<p class="inspector-empty">选择比赛、赛果、阶段或通道查看属性。</p>'; return; }
    const { kind, id } = selected;
    const collection = kind === 'stage' ? doc.stages : kind === 'seed' ? doc.seeds : kind === 'match' ? doc.matches : kind === 'result' ? doc.results : doc.links;
    const node = collection.find(n => n.id === id);
    if (!node) { selected = null; renderInspector(runtime); return; }
    let html = `<span class="badge">${esc(kind.toUpperCase())} · ${esc(id)}</span><h2 class="inspector-title">${{ stage: '阶段与起始层', seed: '种子队伍', match: '单一比赛框', result: '赛果位', link: '连接通道' }[kind]}</h2>`;
    if (kind !== 'link') html += field('名称', input('name', node.name));
    if (kind === 'stage') {
      html += field('本阶段预计队伍数 X', input('size', node.size, 'number', 'min="2" max="64"'));
      const options = { '': '空选 · 保持输入顺序', seedRank: '种子排名 ↑', stageRank: '阶段末排名 ↑', liveRank: '实时积分排名 ↑' };
      node.sort.forEach((key, index) => html += field(`第 ${index + 1} 关键字`, `<select data-sort="${index}">${Object.entries(options).map(([value, label]) => `<option value="${value}" ${key.key === value ? 'selected' : ''}>${label}</option>`).join('')}</select>`));
      html += '<p class="field-note">全部只允许升序。前项相同时才比较下一项；稳定排序后赋予唯一的 1…X 起始排名。</p>';
      const ordered = runtime.starts.get(id);
      if (ordered) html += `<p class="field-note">${ordered.map(t => `#${t.startRank} ${esc(t.name)}`).join('<br>')}</p>`;
      html += '<p class="field-note">改变人数不会自动补删赛果位和连线，请在画布中调整后校验。</p>';
    } else if (kind === 'seed') {
      html += field('种子排名', input('seedRank', node.seedRank, 'number', 'min="1"')) + '<p class="field-note">实时积分排名当前固定为 0；种子层排序接口默认直接返回。</p>';
    } else if (kind === 'match') {
      html += field('比赛长度', `<select data-prop="bo">${[1, 3, 5].map(n => `<option value="${n}" ${node.bo === n ? 'selected' : ''}>BO${n}</option>`).join('')}</select>`);
      html += field('比赛时序（占位）', input('schedule', node.schedule)) + '<p class="field-note">一个入口接两条通道；确认队伍按到达顺序先上后下。胜、败出口各接一条通道。</p>';
      const row = runtime.matches.get(id);
      html += `<p class="field-note">确认队伍：${row.teams.length} / 2<br>${row.played ? '本场已结束' : '预推送不计入确认人数'}</p>`;
    } else if (kind === 'result') {
      html += field('赛果区域', `<select data-prop="kind"><option value="advance" ${node.kind === 'advance' ? 'selected' : ''}>下阶段推送</option><option value="placement" ${node.kind === 'placement' ? 'selected' : ''}>淘汰结算</option></select>`);
      html += field(node.kind === 'advance' ? '非零阶段末排名' : '赛事最终排名（可并列）', input('rank', node.rank, 'number', 'min="1"'));
      html += '<p class="field-note">推送位在下阶段创建或类型改变时自动接至下一阶段起始层。赛果层全部收齐后才发送；结算位无出口。</p>';
    } else html += field('来源出口', `<input readonly value="${esc(node.source)}">`) + field('目标入口', `<input readonly value="${esc(node.target)}">`) + '<p class="field-note">空值显示 TBD；A/B 是候选展示，不是两个队伍已入场。</p>';
    if (kind !== 'link') {
      const endpoint = `${kind === 'stage' ? 'start' : kind}:${id}`;
      const links = doc.links.filter(l => E.sourceNode(l.source) === endpoint || l.target === endpoint);
      html += '<div class="field-note">附着通道（点击检查/删除）</div>' + links.map(l => `<button class="attached-link" data-inspect-link="${esc(l.id)}">${esc(l.source)} → ${esc(l.target)}</button>`).join('');
    }
    html += `<button class="danger" id="deleteSelected">删除${kind === 'stage' ? '阶段及所属节点' : kind === 'link' ? '此通道' : '此节点'}</button>`;
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
    const { kind, id } = selected;
    edit(() => {
      let endpoints = [];
      if (kind === 'stage') {
        endpoints = [`start:${id}`, ...doc.matches.filter(m => m.stage === id).map(m => `match:${m.id}`), ...doc.results.filter(r => r.stage === id).map(r => `result:${r.id}`)];
        doc.matches = doc.matches.filter(m => m.stage !== id); doc.results = doc.results.filter(r => r.stage !== id); doc.stages = doc.stages.filter(s => s.id !== id); currentStage = doc.stages[0]?.id || '';
      } else if (kind === 'link') doc.links = doc.links.filter(l => l.id !== id);
      else { endpoints = [`${kind}:${id}`]; const key = { seed: 'seeds', match: 'matches', result: 'results' }[kind]; doc[key] = doc[key].filter(n => n.id !== id); }
      doc.links = doc.links.filter(l => !endpoints.some(e => E.sourceNode(l.source) === e || l.target === e));
      if (kind === 'stage') G.syncAdvanceLinks(doc, () => idFor('link'));
      selected = null;
    });
  }
  document.addEventListener('click', event => {
    const attached = event.target.closest('[data-inspect-link]'); if (attached) { setSelection('link', attached.dataset.inspectLink); return; }
    const portEl = event.target.closest('[data-endpoint]');
    if (portEl) { event.stopPropagation(); if (portEl.dataset.inlet === 'false') selectOutlet(portEl.dataset.endpoint, event.shiftKey); else if (pending.length) connect(portEl.dataset.endpoint); else toast('先点击一个出口，再点击入口。'); return; }
    const seedSource = event.target.closest('[data-seed-source]');
    if (seedSource) { selectOutlet(`seed:${seedSource.dataset.seedSource}`, event.shiftKey); return; }
    const stageEl = event.target.closest('[data-stage]'); if (stageEl) { currentStage = stageEl.dataset.stage; setSelection('stage', currentStage); $('canvasScroll').scrollTo(0, 0); return; }
    const seedEl = event.target.closest('[data-seed]'); if (seedEl) { setSelection('seed', seedEl.dataset.seed); return; }
    const linkEl = event.target.closest('[data-link]'); if (linkEl) { setSelection('link', linkEl.dataset.link); return; }
    const nodeEl = event.target.closest('.node'); if (nodeEl && !event.target.closest('.drag-handle')) { setSelection(nodeEl.dataset.kind, nodeEl.dataset.id); return; }
    const issueEl = event.target.closest('[data-issue]'); if (issueEl) { const id = issueEl.dataset.issue; for (const [key, kind] of [['stages', 'stage'], ['matches', 'match'], ['results', 'result'], ['seeds', 'seed'], ['links', 'link']]) { const n = doc[key].find(n => n.id === id); if (n) { if (n.stage) currentStage = n.stage; if (kind === 'stage') currentStage = n.id; setSelection(kind, id); break; } } }
    if (event.target.id === 'deleteSelected') deleteSelected();
  });
  $('inspector').addEventListener('change', event => {
    const el = event.target, { kind, id } = selected;
    const collection = kind === 'stage' ? doc.stages : kind === 'seed' ? doc.seeds : kind === 'match' ? doc.matches : doc.results;
    const n = collection.find(n => n.id === id);
    if (el.dataset.sort !== undefined) { edit(() => { n.sort[+el.dataset.sort] = { key: el.value, direction: 'asc' }; }); return; }
    if (!el.dataset.prop) return;
    const prop = el.dataset.prop, value = ['size', 'seedRank', 'rank', 'bo'].includes(prop) ? +el.value : el.value;
    if (typeof value === 'number' && (!Number.isInteger(value) || value < 1 || (prop === 'size' && (value < 2 || value > 64)))) { toast('请输入有效范围内的整数。'); render(); return; }
    edit(() => { n[prop] = value; if (kind === 'result' && prop === 'kind') G.syncAdvanceLinks(doc, () => idFor('link')); });
  });
  let drag = null;
  $('nodes').addEventListener('pointerdown', event => {
    const handle = event.target.closest('.drag-handle,.result'); if (!handle || event.target.closest('.port')) return;
    const el = handle.closest('.node'), kind = el.dataset.kind, node = (kind === 'match' ? doc.matches : doc.results).find(m => m.id === el.dataset.id);
    selected = { kind, id: node.id };
    drag = { el, node, startX: event.clientX, startY: event.clientY, x: node.x, y: node.y, before: E.copy(doc) };
    handle.setPointerCapture(event.pointerId); event.preventDefault();
  });
  $('nodes').addEventListener('pointermove', event => { if (!drag) return; Object.assign(drag.node, G.snapPosition(drag.x + (event.clientX - drag.startX) / zoom, drag.y + (event.clientY - drag.startY) / zoom)); drag.el.style.left = `${drag.node.x}px`; drag.el.style.top = `${drag.node.y}px`; drawLinks(E.derive(doc, state)); });
  const finishDrag = () => { if (!drag) return; if (drag.node.x !== drag.x || drag.node.y !== drag.y) { undo.push(drag.before); save(); } drag = null; render(); };
  $('nodes').addEventListener('pointerup', finishDrag); $('nodes').addEventListener('pointercancel', finishDrag);
  document.addEventListener('keydown', event => {
    if (event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]')) return;
    if (event.key === 'Escape') { pending = []; render(); }
    if (['Delete', 'Backspace'].includes(event.key) && !event.ctrlKey && !event.altKey && !event.metaKey && !event.repeat && selected) { event.preventDefault(); deleteSelected(); }
  });
  $('documentName').addEventListener('change', event => edit(() => doc.name = event.target.value.trim() || '未命名赛制'));
  function revealSpawn(kind) { const point = G.SPAWN[kind]; $('canvasScroll').scrollTo(Math.max(0, point.x * zoom - 40), Math.max(0, point.y * zoom - 40)); }
  $('addMatchBtn').onclick = () => { if (!currentStage) return toast('先添加一个阶段。'); edit(() => { const id = idFor('match'), n = doc.matches.filter(n => n.stage === currentStage).length; doc.matches.push({ id, stage: currentStage, name: `比赛 ${n + 1}`, bo: 3, schedule: 'YYYY-MM-DD #X', ...G.SPAWN.match }); selected = { kind: 'match', id }; }); revealSpawn('match'); };
  $('addResultBtn').onclick = () => { if (!currentStage) return toast('先添加一个阶段。'); edit(() => { const id = idFor('result'), n = doc.results.filter(n => n.stage === currentStage).length; doc.results.push({ id, stage: currentStage, kind: 'placement', rank: n + 1, name: `赛果 ${n + 1}`, ...G.SPAWN.result }); selected = { kind: 'result', id }; }); revealSpawn('result'); };
  $('addStageBtn').onclick = () => edit(() => { const id = idFor('stage'), previous = doc.stages.at(-1), advanceCount = doc.results.filter(r => r.stage === previous?.id && r.kind === 'advance').length; doc.stages.push({ id, name: `阶段 ${doc.stages.length + 1}`, size: Math.min(64, Math.max(2, advanceCount || 4)), sort: Array.from({ length: 3 }, () => ({ key: '', direction: 'asc' })) }); G.syncAdvanceLinks(doc, () => idFor('link')); currentStage = id; selected = { kind: 'stage', id }; });
  $('addSeedBtn').onclick = () => edit(() => { const id = idFor('team'); doc.seeds.push({ id, name: `Team ${doc.seeds.length + 1}`, seedRank: doc.seeds.length + 1, liveRank: 0 }); selected = { kind: 'seed', id }; });
  $('undoBtn').onclick = () => { if (!undo.length) return; doc = undo.pop(); if (!doc.stages.some(s => s.id === currentStage)) currentStage = doc.stages[0]?.id || ''; state = E.createState(doc); pending = []; selected = { kind: 'stage', id: currentStage }; save(); render(); };
  $('viewBtn').onclick = () => { simulation = !simulation; pending = []; render(); };
  $('zoomOutBtn').onclick = () => { zoom = Math.max(.2, zoom - .1); render(); };
  $('zoomInBtn').onclick = () => { zoom = Math.min(1.5, zoom + .1); render(); };
  $('fitBtn').onclick = () => { zoom = Math.max(.2, Math.min(1, ($('canvasScroll').clientWidth - 24) / parseInt($('canvas').style.width))); render(); $('canvasScroll').scrollTo(0, 0); };
  $('resetBtn').onclick = () => { state = E.createState(doc); render(); };
  $('backStepBtn').onclick = () => { E.backStep(doc, state); const runtime = E.derive(doc, state), nextStage = runtime.activeStage || currentStage; if (nextStage !== currentStage) selected = { kind: 'stage', id: nextStage }; currentStage = nextStage; render(); };
  $('stepBtn').onclick = () => { const result = E.step(doc, state); if (!result.ok) toast(result.issues[0].message); else { const runtime = E.derive(doc, state), nextStage = runtime.activeStage || result.match.stage; if (nextStage !== currentStage) selected = { kind: 'stage', id: nextStage }; currentStage = nextStage; toast(`${result.match.name} · ${result.winner.name} 胜出`); } render(); };
  $('validateBtn').onclick = () => { const issues = E.validate(doc); toast(issues.length ? `还有 ${issues.length} 项待修正。点击右侧问题定位。` : '流程校验通过，可以按步推进。'); render(); };
  $('sampleBtn').onclick = () => edit(() => { doc = E.sample(); currentStage = doc.stages[0].id; selected = { kind: 'stage', id: currentStage }; });
  $('emptyBtn').onclick = () => edit(() => { doc = { schema: 'csem.graph-linker', version: 1, name: '新赛制', appearance: E.sample().appearance, seeds: [], stages: [{ id: 's1', name: '阶段 1', size: 4, sort: Array.from({ length: 3 }, () => ({ key: '', direction: 'asc' })) }], matches: [], results: [], links: [] }; currentStage = 's1'; selected = { kind: 'stage', id: currentStage }; });
  $('importBtn').onclick = () => $('fileInput').click();
  $('fileInput').onchange = async event => { const file = event.target.files[0]; if (!file) return; try { const incoming = E.parse(await file.text()); edit(() => { doc = incoming; G.syncAdvanceLinks(doc, () => idFor('link')); currentStage = doc.stages[0]?.id || ''; selected = { kind: 'stage', id: currentStage }; }); toast('已导入赛制结构；推送通道已同步，运行状态已重置。'); } catch (error) { toast(`导入失败：${error.message}`); } event.target.value = ''; };
  $('exportBtn').onclick = () => { const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = `${doc.name.replace(/[\\/:*?"<>|]/g, '_')}.csem`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('已请求下载 .csem；未接线草稿也会保留。'); };
  // Exposed read-only snapshots make prototype verification reproducible.
  window.GraphLinkerDebug = { snapshot: () => ({ doc: E.copy(doc), state: E.copy(state), issues: E.validate(doc) }) };
  render();
})();
