/* Web of Work — interactive force graph for research.html */
(() => {
  'use strict';
  const canvas = document.getElementById('web');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, DPR;
  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize(); addEventListener('resize', resize);

  const TYPE = {
    me: { c: '#2B2D42', r: 30, label: 'Me' },
    interest: { c: '#F4795B', r: 19, label: 'Interest' },
    project: { c: '#2BB3A3', r: 15, label: 'Project' },
    paper: { c: '#8C6BE4', r: 15, label: 'Paper' },
  };

  const N = [
    { id: 'me', label: 'Sruthi', type: 'me', desc: 'ML Research Engineer · AI Safety. Click a node to explore.', link: 'index.html' },
    { id: 'cot', label: 'CoT Monitoring', type: 'interest', desc: 'Is a model\'s chain of thought faithful to its real reasoning?', link: 'index.html#about' },
    { id: 'mi', label: 'Mech Interp', type: 'interest', desc: 'Reverse-engineering the internal circuits of neural networks.', link: 'index.html#about' },
    { id: 'meta', label: 'Metacognition', type: 'interest', desc: 'Can models monitor and control their own uncertainty?', link: 'index.html#about' },
    { id: 'brain', label: 'Brain-inspired AI', type: 'interest', desc: 'Neural computation & models of the hippocampus.', link: 'index.html#about' },
    { id: 'agent', label: 'agent-lens', type: 'project', desc: 'Agent observability & replay tooling for AI safety.', link: 'https://github.com/sruthi-sk/agent-lens' },
    { id: 'steer', label: 'Test-Awareness Steering', type: 'project', desc: 'Probe-guided steering of problematic generations.', link: 'https://github.com/sruthi-sk/Test_Awareness_Steering' },
    { id: 'sdft', label: 'Self-Distillation FT', type: 'project', desc: 'ARENA capstone — continual learning via self-distillation.', link: 'https://github.com/sruthi-sk/sdft-arena' },
    { id: 'coadapt', label: 'Human-AI Co-Adaptation', type: 'project', desc: 'Multi-agent self-play + SAC for human–robot collaboration.', link: 'https://github.com/sruthi-sk/RILI_co-adaptation' },
    { id: 'calib', label: 'Probabilistic Calibration', type: 'paper', desc: 'Calibration as a trainable capability — submitted to COLM 2026.', link: 'https://scholar.google.com/citations?hl=en&user=Ra47vbkAAAAJ' },
    { id: 'faith', label: 'Faithfulness Checks', type: 'paper', desc: 'LLMs subverting CoT checks — 2nd place, Impact First Fellowship.', link: 'https://scholar.google.com/citations?hl=en&user=Ra47vbkAAAAJ' },
    { id: 'bio', label: 'bioBLUE', type: 'paper', desc: 'Bio-inspired alignment benchmark for LLMs · arXiv.', link: 'https://github.com/sruthi-sk/bioblue' },
    { id: 'dsm', label: 'DSM Hippocampus', type: 'paper', desc: 'Distributional successor model of the hippocampus · MSc thesis.', link: 'https://github.com/sruthi-sk/dsm-hippocampus' },
  ];
  const E = [
    ['me', 'cot'], ['me', 'mi'], ['me', 'meta'], ['me', 'brain'], ['me', 'agent'],
    ['cot', 'faith'], ['cot', 'steer'],
    ['mi', 'agent'], ['mi', 'steer'], ['mi', 'sdft'],
    ['meta', 'calib'], ['meta', 'sdft'],
    ['brain', 'dsm'], ['brain', 'bio'], ['brain', 'coadapt'],
  ];
  const byId = {}; const adj = {};
  N.forEach(n => { byId[n.id] = n; adj[n.id] = new Set(); n.vx = 0; n.vy = 0; });
  E.forEach(([a, b]) => { adj[a].add(b); adj[b].add(a); });
  // seed positions in concentric rings for a balanced, centred layout
  byId.me.x = W / 2; byId.me.y = H / 2;
  const ring = (arr, rad) => arr.forEach((n, i) => {
    const a = -Math.PI / 2 + (i / arr.length) * Math.PI * 2;
    n.x = W / 2 + Math.cos(a) * rad; n.y = H / 2 + Math.sin(a) * rad;
  });
  ring(N.filter(n => n.type === 'interest'), 165);
  ring(N.filter(n => n.type === 'project' || n.type === 'paper'), 300);

  let hover = null, drag = null, selected = null, mx = -1e3, my = -1e3, down = false, moved = 0;

  function pick(x, y) {
    let best = null, bd = 1e9;
    for (const n of N) { const d = Math.hypot(n.x - x, n.y - y); const rr = TYPE[n.type].r + 12;
      if (d < rr && d < bd) { bd = d; best = n; } }
    return best;
  }
  function pos(e) { const t = e.touches ? e.touches[0] : e; return { x: t.clientX, y: t.clientY }; }

  canvas.addEventListener('mousemove', e => { const p = pos(e); mx = p.x; my = p.y;
    if (drag) { drag.x = mx; drag.y = my; drag.vx = drag.vy = 0; moved += 1; }
    else hover = pick(mx, my); });
  canvas.addEventListener('mousedown', e => { const p = pos(e); mx = p.x; my = p.y; down = true; moved = 0; drag = pick(mx, my); });
  addEventListener('mouseup', () => {
    if (down && moved < 4) { const hit = pick(mx, my); select(hit && hit.id !== 'me' ? hit : null); }
    down = false; drag = null;
  });
  // touch
  canvas.addEventListener('touchstart', e => { const p = pos(e); mx = p.x; my = p.y; down = true; moved = 0; drag = pick(mx, my); hover = drag; }, { passive: true });
  canvas.addEventListener('touchmove', e => { const p = pos(e); mx = p.x; my = p.y; if (drag) { drag.x = mx; drag.y = my; drag.vx = drag.vy = 0; moved += 1; } }, { passive: true });
  addEventListener('touchend', () => { if (down && moved < 4) { const hit = pick(mx, my); select(hit && hit.id !== 'me' ? hit : null); } down = false; drag = null; });

  const panel = document.getElementById('detail');
  function select(n) {
    selected = n;
    if (!n) { panel.classList.remove('show'); return; }
    document.getElementById('d-tag').textContent = TYPE[n.type].label;
    document.getElementById('d-tag').style.color = TYPE[n.type].c;
    document.getElementById('d-title').textContent = n.label;
    document.getElementById('d-desc').textContent = n.desc;
    const link = document.getElementById('d-link');
    link.href = n.link;
    link.textContent = n.type === 'paper' ? 'View paper ↗' : n.type === 'project' ? 'View code ↗' : 'Learn more ↗';
    panel.classList.add('show');
  }
  window.__select = id => select(byId[id]);

  function physics() {
    for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
      const a = N[i], b = N[j]; let dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy) || 1;
      const f = 2800 / (d * d); dx /= d; dy /= d; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
    }
    E.forEach(([ai, bi]) => { const a = byId[ai], b = byId[bi]; let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
      const tgt = (a.type === 'me' || b.type === 'me') ? 150 : 118; const f = (d - tgt) * .015;
      dx /= d; dy /= d; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f; });
    for (const n of N) {
      if (n.id === 'me') { n.x = W / 2; n.y = H / 2; n.vx = n.vy = 0; continue; }
      if (n === drag) continue;
      n.vx += (W / 2 - n.x) * .0016; n.vy += (H / 2 - n.y) * .0016;
      n.vx *= .85; n.vy *= .85; n.x += n.vx; n.y += n.vy;
      n.x = Math.max(70, Math.min(W - 70, n.x)); n.y = Math.max(130, Math.min(H - 110, n.y));
    }
  }

  function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const focus = hover || selected;
    const hi = focus ? new Set([focus.id, ...adj[focus.id]]) : null;
    // edges
    E.forEach(([ai, bi]) => { const a = byId[ai], b = byId[bi]; const on = hi && hi.has(ai) && hi.has(bi);
      ctx.strokeStyle = on ? 'rgba(244,121,91,.55)' : (hi ? 'rgba(43,45,66,.05)' : 'rgba(43,45,66,.13)');
      ctx.lineWidth = on ? 2 : 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
    // nodes
    for (const n of N) {
      const ty = TYPE[n.type]; const on = !hi || hi.has(n.id);
      const near = Math.hypot(n.x - mx, n.y - my) < 80;
      const r = ty.r * (n === focus ? 1.35 : near ? 1.15 : 1);
      ctx.globalAlpha = on ? 1 : .4;
      ctx.beginPath(); ctx.fillStyle = ty.c;
      ctx.shadowColor = 'rgba(43,45,66,.2)'; ctx.shadowBlur = on ? 12 : 4; ctx.shadowOffsetY = 3;
      ctx.arc(n.x, n.y, r, 0, 7); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      if (n === selected) { ctx.strokeStyle = ty.c; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(n.x, n.y, r + 6, 0, 7); ctx.stroke(); }
      if (n.type === 'me') { ctx.fillStyle = '#fff'; ctx.font = '600 13px Fredoka'; ctx.textAlign = 'center'; ctx.fillText('SK', n.x, n.y + 4); }
      ctx.fillStyle = '#4a4658'; ctx.font = (n.type === 'me' ? '600 15px' : '600 13px') + ' Nunito, sans-serif';
      ctx.textAlign = 'center'; ctx.fillText(n.label, n.x, n.y + r + 16);
      ctx.globalAlpha = 1;
    }
    // tooltip
    if (hover && hover !== selected) {
      ctx.font = '600 13px Nunito, sans-serif';
      const w = ctx.measureText(hover.label).width + 24; const h = 30;
      let tx = hover.x + 22, tyy = hover.y - h - 8;
      if (tx + w > W - 10) tx = hover.x - w - 22; if (tyy < 70) tyy = hover.y + 20;
      ctx.fillStyle = '#2B2D42'; ctx.shadowColor = 'rgba(43,45,66,.25)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
      rrect(tx, tyy, w, h, 9); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText(hover.label, tx + 12, tyy + 19);
    }
    requestAnimationFrame(draw);
  }

  for (let i = 0; i < 140; i++) physics();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    (function loop() { physics(); draw(); requestAnimationFrame(loop); })();
  });
})();
