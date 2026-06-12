/* Shared interactions: cursor, click-particles, reveal, nav, modals, magnetic */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* Trailing cursor */
  const cur = $('#cursor');
  if (cur && hover) {
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
    (function ease() {
      x += (tx - x) * .2; y += (ty - y) * .2;
      cur.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      requestAnimationFrame(ease);
    })();
    $$('a, button, [data-mag], .interest, .proj, [data-tilt]').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('big'));
      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });
  }

  /* Background click-particles (gentle "fireworks") */
  const fx = $('#fx');
  if (fx && !reduce) {
    const ctx = fx.getContext('2d');
    let parts = [];
    const COLORS = ['#6C5CE7', '#3B82F6', '#14B8A6', '#1C2030'];
    function size() { fx.width = innerWidth * devicePixelRatio; fx.height = innerHeight * devicePixelRatio; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); }
    size(); addEventListener('resize', size);
    addEventListener('click', e => {
      if (e.target.closest('a, button, summary, input, .modal-card')) return;
      const n = 14;
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * .4;
        const sp = 2 + Math.random() * 3.5;
        parts.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, c: COLORS[(Math.random() * COLORS.length) | 0], r: 2 + Math.random() * 2 });
      }
    });
    (function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter(p => p.life > 0);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.vy += .05; p.vx *= .98; p.vy *= .98; p.life -= .022;
        ctx.globalAlpha = Math.max(p.life, 0); ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1; requestAnimationFrame(tick);
    })();
  }

  /* Nav scrolled border */
  const nav = $('#nav');
  if (nav) addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 20), { passive: true });

  /* Reveal on scroll */
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 5) * 55}ms`; io.observe(el); });

  /* Magnetic buttons */
  if (!reduce && hover) $$('[data-mag]').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .28}px)`;
    });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });

  /* Modals */
  function close() { $$('.modal.open').forEach(m => m.classList.remove('open')); }
  $$('[data-modal]').forEach(btn => btn.addEventListener('click', () => {
    const m = document.getElementById(btn.dataset.modal); if (m) m.classList.add('open');
  }));
  $$('[data-close]').forEach(el => el.addEventListener('click', close));
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  /* PDF placeholder notice */
  $$('[data-pdf]').forEach(a => a.addEventListener('click', e => {
    if (a.getAttribute('href') === '#') { e.preventDefault(); alert('Thesis PDF link coming soon — drop the URL in and it\'s live.'); }
  }));
})();
