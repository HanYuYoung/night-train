(() => {
  const NT = window.NT;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => innerWidth <= 900;
  const pad = n => String(n).padStart(2, '0');

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('loading');

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      e.preventDefault();
      lenis.scrollTo(id === '#top' ? 0 : id, { duration: 1.6 });
    }));
  }

  /* ---------------- loader + hero intro ---------------- */
  const heroIn = () => {
    $('#loader').classList.add('done');
    document.body.classList.remove('loading');
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hero-bg img', { scale: 1.25, duration: 2.6, ease: 'power3.out' }, 0)
      .from('.hero-title .line > span', { yPercent: 110, duration: 1.4, stagger: .12 }, .3)
      .from('.hero .reveal-up', { y: 30, opacity: 0, duration: 1.2, stagger: .1 }, .6)
      .from('.nav', { opacity: 0, duration: 1.2, clearProps: 'opacity' }, .8)
      .from('.scroll-hint', { opacity: 0, duration: 1 }, 1.4);
  };
  let started = false;
  const start = () => { if (!started) { started = true; setTimeout(heroIn, 350); } };
  const heroImg = $('.hero-bg img');
  if (heroImg.complete) setTimeout(start, 900); else heroImg.addEventListener('load', () => setTimeout(start, 600));
  setTimeout(start, 2600);

  /* ---------------- nav ---------------- */
  let lastY = 0;
  const nav = $('#nav');
  const onScrollNav = y => {
    nav.classList.toggle('solid', y > 40);
    nav.classList.toggle('hide', y > innerHeight && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove('hide');
    lastY = y;
  };
  if (lenis) lenis.on('scroll', e => onScrollNav(e.scroll)); else addEventListener('scroll', () => onScrollNav(scrollY), { passive: true });

  /* ---------------- stars ---------------- */
  (() => {
    const c = $('#stars'), ctx = c.getContext('2d');
    let w, h, dpr, stars = [], shoot = null, mx = 0, my = 0, visible = true;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(w * h / 5200);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.pow(Math.random(), 1.6) * h * .62,
        r: Math.random() * 1.15 + .2, p: Math.random() * Math.PI * 2, s: .6 + Math.random() * 1.8, z: Math.random(),
      }));
    };
    resize(); addEventListener('resize', resize);
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(c);
    const loop = t => {
      requestAnimationFrame(loop);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = reduce ? .7 : .35 + .65 * (.5 + .5 * Math.sin(t / 1000 * s.s + s.p));
        ctx.globalAlpha = a;
        ctx.fillStyle = s.z > .92 ? '#ffe6bd' : '#f3ecdd';
        ctx.beginPath(); ctx.arc(s.x - mx * 14 * s.z, s.y - my * 10 * s.z, s.r, 0, 6.283); ctx.fill();
      }
      if (!reduce) {
        if (!shoot && Math.random() < .004) shoot = { x: Math.random() * w * .8 + w * .2, y: Math.random() * h * .3, l: 0 };
        if (shoot) {
          shoot.l += 1;
          const k = shoot.l / 60, x = shoot.x - k * 340, y = shoot.y + k * 140;
          const g = ctx.createLinearGradient(x, y, x + 90, y - 37);
          g.addColorStop(0, 'rgba(255,240,210,.9)'); g.addColorStop(1, 'rgba(255,240,210,0)');
          ctx.globalAlpha = 1 - k; ctx.strokeStyle = g; ctx.lineWidth = 1.3;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 90, y - 37); ctx.stroke();
          if (k >= 1) shoot = null;
        }
      }
      ctx.globalAlpha = 1;
    };
    requestAnimationFrame(loop);
  })();

  /* ---------------- hero scroll ---------------- */
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
    .to('.hero-bg img', { scale: 1.12, yPercent: 8, ease: 'none' }, 0)
    .to('.hero-copy', { y: -140, opacity: 0, ease: 'none' }, 0)
    .to('.scroll-hint', { opacity: 0, ease: 'none', duration: .3 }, 0);

  /* ---------------- journey ---------------- */
  (() => {
    const line = NT.lines.find(l => l.id === 'silk-road');
    const stops = line.stops.map(id => ({ id, ...NT.st[id] }));
    const N = stops.length;
    const scenes = $('#scenes');
    stops.forEach((s, i) => {
      const d = document.createElement('div');
      d.className = 'scene' + (i === 0 ? ' on' : '');
      d.innerHTML = `<img src="img/st/${s.id}.webp" alt="${s.n}" ${i > 1 ? 'loading="lazy"' : ''}><img class="night" src="img/st/${s.id}_night.webp" alt="" ${i > 1 ? 'loading="lazy"' : ''}>`;
      scenes.appendChild(d);
    });
    const route = $('#jRoute');
    route.innerHTML = '<i class="fill"></i>' + stops.map(s => `<li><span>${s.n}</span></li>`).join('');
    const dots = $$('li', route), fill = $('.fill', route);
    const win = $('#window'), ring = $('#ring');
    const C = 2 * Math.PI * 54;

    // day / night toggle — default night, it's a night train
    // day → dusk → night, driven by how far along the line you are
    const dnText = $('#dnText'), dnDot = $('.dn-dot');
    const phases = [[0, '午后'], [.25, '傍晚'], [.55, '黄昏'], [.8, '入夜'], [.97, '深夜']];
    const setTime = q => {
      const t = Math.max(0, Math.min(1, (q - .6) / (N - 1 - 1.6)));   // starts after 西安, full night near 嘉峪关
      const e = t * t * (3 - 2 * t);
      win.style.setProperty('--n', e.toFixed(3));
      win.style.setProperty('--dusk', (Math.sin(Math.PI * Math.min(1, t * 1.15)) * .75).toFixed(3));
      dnText.textContent = phases.filter(p => t >= p[0]).pop()[1];
      // the little sun cools into a moon
      dnDot.style.background = `radial-gradient(circle at 35% 35%, #fff6d8, ${t < .6 ? '#f2b45e' : '#cfd8ff'})`;
      dnDot.style.boxShadow = `0 0 10px ${t < .6 ? '#f2b45e' : '#9fb0ff'}`;
    };
    setTime(0);

    // mini map: the silk road with a train moving along it
    const NS = 'http://www.w3.org/2000/svg';
    const mini = $('#miniMap');
    const mk = (tag, attrs, parent = mini) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
    const pts = stops.map(s => s.p);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const bx = Math.min(...xs) - 14, by = Math.min(...ys) - 16, bw = Math.max(...xs) - bx + 14, bh = Math.max(...ys) - by + 12;
    mini.setAttribute('viewBox', `${bx} ${by} ${bw} ${bh}`);
    mini.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    NT.provs.forEach(p => mk('path', { d: p.d, class: 'mprov' }));
    const dStr = 'M' + pts.map(p => p.join(',')).join('L');
    mk('path', { d: dStr, class: 'mtrack' });
    const done = mk('path', { d: dStr, class: 'mdone' });
    const dLen = done.getTotalLength();
    done.style.strokeDasharray = dLen; done.style.strokeDashoffset = dLen;
    const segLen = [0];
    for (let k = 1; k < pts.length; k++) segLen.push(segLen[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    const mStops = pts.map(p => mk('circle', { cx: p[0], cy: p[1], r: 1.6, class: 'mstop' }));
    const mNames = stops.map((s, k) => { const t = mk('text', { x: s.p[0], y: s.p[1] + (k % 2 ? 7.5 : -4), 'text-anchor': 'middle', class: 'mname' }); t.textContent = s.n; return t; });
    const halo = mk('circle', { r: 4, class: 'train-halo' });
    const dot = mk('circle', { r: 2.3, class: 'train-dot' });
    const placeTrain = (i, f) => {
      const a = pts[i], b = pts[Math.min(i + 1, N - 1)];
      const x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
      dot.setAttribute('cx', x); dot.setAttribute('cy', y); halo.setAttribute('cx', x); halo.setAttribute('cy', y);
      const len = segLen[i] + (segLen[Math.min(i + 1, N - 1)] - segLen[i]) * f;
      done.style.strokeDashoffset = dLen - len * (dLen / segLen[N - 1]);
      mStops.forEach((c, k) => c.classList.toggle('done', k <= i));
      mNames.forEach((t, k) => t.classList.toggle('done', k <= i));
    };
    placeTrain(0, 0);

    let cur = -1;
    const nameEls = ['#jLabel', '#jName', '#jEn', '#jDesc'].map(s => $(s));
    const show = (i, dir) => {
      if (i === cur) return;
      const s = stops[i];
      $$('.scene', scenes).forEach((el, k) => el.classList.toggle('on', k === i));
      const label = i === 0 ? '始发站' : i === N - 1 ? '终点站 · 全程跑完' : `已到达 · 第 ${i + 1} / ${N} 站`;
      gsap.killTweensOf(nameEls);
      gsap.to(nameEls, {
        y: dir > 0 ? -24 : 24, opacity: 0, duration: .22, stagger: .03, ease: 'power2.in',
        onComplete: () => {
          nameEls[0].textContent = label; nameEls[1].textContent = s.n; nameEls[2].textContent = s.en; nameEls[3].textContent = s.desc;
          gsap.fromTo(nameEls, { y: dir > 0 ? 28 : -28, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .05, ease: 'expo.out' });
        },
      });
      if (dir > 0 && i > 0 && cur >= 0) {
        $('#stampName').textContent = s.n;
        gsap.fromTo('#stamp', { scale: 1.9, opacity: 0, rotate: -24 }, { scale: 1, opacity: .95, rotate: -14, duration: .45, ease: 'back.out(2.2)', overwrite: true });
        gsap.to('#stamp', { opacity: 0, duration: .8, delay: 1.1 });
        if (navigator.vibrate && mobile()) navigator.vibrate(12);
        clack();
      }
      cur = i;
    };
    show(0, 1);

    const INTRO = .16;
    const cover = () => {
      const r = win.getBoundingClientRect();
      // undo current transform to measure the natural box
      const tr = gsap.getProperty(win, 'scale');
      const w = r.width / tr, h = r.height / tr;
      return Math.max(innerWidth / w, innerHeight / h) * 1.08;
    };
    const offset = axis => {
      const wrap = win.parentElement.getBoundingClientRect();
      const pin = $('.journey-pin').getBoundingClientRect();
      const wcx = wrap.left + wrap.width / 2, wcy = wrap.top + win.offsetHeight / 2;
      return axis === 'x' ? innerWidth / 2 - wcx : (pin.top + innerHeight / 2) - wcy;
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.journey', start: 'top top', end: () => `+=${N * innerHeight * .42}`,
        pin: '.journey-pin', scrub: true, invalidateOnRefresh: true,
        onUpdate: self => {
          const p = self.progress;
          const q = Math.max(0, Math.min(N - 1, (p - INTRO) / (1 - INTRO - .04) * (N - 1)));
          const i = Math.min(N - 1, Math.floor(q + 1e-6));
          const f = i === N - 1 ? 1 : q - i;
          show(i, i >= cur ? 1 : -1);
          const sec = i === N - 1 ? 0 : Math.round(25 * 60 * (1 - f));
          $('#jTime').textContent = `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
          $('#jNext').textContent = i === N - 1 ? '全程跑完' : `距 ${stops[i + 1].n}`;
          ring.style.strokeDashoffset = C * (1 - f);
          dots.forEach((d, k) => d.classList.toggle('done', k <= i));
          fill.style.width = `calc((100% - 8px) * ${q / (N - 1)})`;
          placeTrain(i, i === N - 1 ? 0 : f);
          setTime(q);
        },
      },
    });
    tl.fromTo(win, { scale: () => cover(), x: () => offset('x'), y: () => offset('y'), borderRadius: 0 },
      { scale: 1, x: 0, y: 0, borderRadius: mobile() ? '22px / 30px' : '34px / 46px', ease: 'power2.inOut', duration: INTRO }, 0)
      .fromTo('.window-intro', { opacity: 1 }, { opacity: 0, duration: INTRO * .6, ease: 'none' }, INTRO * .5)
      .fromTo('.journey-info', { opacity: 0, x: () => mobile() ? 0 : 60, y: () => mobile() ? 40 : 0 }, { opacity: 1, x: 0, y: 0, duration: INTRO * .6, ease: 'power2.out' }, INTRO * .55)
      .fromTo('.sill, .daynight', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: INTRO * .5 }, INTRO * .6)
      .to({}, { duration: 1 - INTRO });
  })();

  /* ---------------- app showcase ---------------- */
  (() => {
    const steps = $$('#scSteps li'), imgs = $$('.sc-phone .screen img'), dots = $$('#scDots i');
    const n = steps.length; let cur = 0;
    const go = i => {
      if (i === cur) return;
      [steps, imgs, dots].forEach(list => list.forEach((el, k) => el.classList.toggle('on', k === i)));
      cur = i;
    };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.showcase', start: 'top top', end: () => `+=${n * innerHeight * .5}`, pin: '.sc-pin', scrub: .6, invalidateOnRefresh: true,
        onUpdate: s => go(Math.min(n - 1, Math.floor(s.progress * n))),
      },
    });
    tl.fromTo('.sc-phone', { rotateY: -16, rotateX: 6 }, { rotateY: 14, rotateX: -4, ease: 'none', duration: 1 }, 0);
    gsap.fromTo('.sc-phone-wrap', { y: 140, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.showcase', start: 'top 75%', once: true } });
    gsap.fromTo('.sc-head > *, .sc-steps', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.showcase', start: 'top 70%', once: true } });
    // click a dot to jump
    dots.forEach((d, i) => { d.style.cursor = 'pointer'; d.addEventListener('click', () => {
      const st = tl.scrollTrigger, y = st.start + (st.end - st.start) * (i + .5) / n;
      lenis ? lenis.scrollTo(y, { duration: 1 }) : scrollTo({ top: y, behavior: 'smooth' });
    }); });
  })();

  /* ---------------- manifesto char fill ---------------- */
  (() => {
    const el = $('#fillText');
    el.innerHTML = [...el.textContent].map(c => `<span class="ch">${c}</span>`).join('');
    gsap.to($$('.ch', el), {
      opacity: 1, stagger: .05, ease: 'none',
      scrollTrigger: { trigger: '.manifesto', start: 'top 65%', end: 'bottom 85%', scrub: .6 },
    });
    gsap.fromTo('.mf-bg', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: true } });
  })();

  /* ---------------- reveal helpers ---------------- */
  const rise = (targets, trigger, opts = {}) => gsap.from(targets, {
    y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .12, ...opts,
    scrollTrigger: { trigger, start: 'top 80%', once: true },
  });
  rise('.how-head > *', '.how-head');
  $$('.how-card').forEach((c, i) => {
    gsap.from(c, { y: 90, opacity: 0, duration: 1.3, ease: 'expo.out', delay: i * .12, scrollTrigger: { trigger: '.how-grid', start: 'top 82%', once: true } });
    ScrollTrigger.create({ trigger: c, start: 'top 60%', once: true, onEnter: () => setTimeout(() => c.classList.add('in'), 600 + i * 250) });
  });
  // countdown art
  (() => {
    const el = $('.art-clock span'); let s = 25 * 60, t = null;
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', end: 'bottom 10%',
      onToggle: self => {
        clearInterval(t);
        if (self.isActive) t = setInterval(() => { s = s <= 0 ? 1500 : s - 1; el.textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }, 1000);
      },
    });
  })();
  rise('.dt', '.dt-grid', { y: 40 });

  /* ---------------- map ---------------- */
  (() => {
    const svg = $('#mapSvg'), NS = 'http://www.w3.org/2000/svg';
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    for (const p of NT.provs) for (const m of p.d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)) {
      const x = +m[1], y = +m[2];
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    svg.setAttribute('viewBox', `${minX - 6} ${minY - 6} ${maxX - minX + 12} ${maxY - minY + 12}`);
    const mk = (tag, attrs, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
    const gP = mk('g', {}), gR = mk('g', {}), gS = mk('g', {}), gL = mk('g', {});
    const provEl = {};
    NT.provs.forEach(p => { provEl[p.id] = mk('path', { d: p.d, class: 'prov' }, gP); });
    const byProv = {};
    for (const [id, s] of Object.entries(NT.st)) (byProv[s.prov] ||= []).push(id);
    const routes = NT.lines.map(l => {
      const pts = l.stops.map(id => NT.st[id].p);
      const el = mk('path', { d: 'M' + pts.map(p => p.join(',')).join('L'), class: 'route', 'data-line': l.id }, gR);
      const len = el.getTotalLength();
      el.style.strokeDasharray = len; el.style.strokeDashoffset = len;
      // cumulative fraction at each stop, to light stations as the line passes them
      let acc = 0; const cum = [0];
      for (let i = 1; i < pts.length; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(acc); }
      return { l, el, len, cum: cum.map(c => c / acc) };
    });
    const stnEl = {}, lblEl = {};
    for (const [id, s] of Object.entries(NT.st)) {
      const c = mk('circle', { cx: s.p[0], cy: s.p[1], r: 1.7, class: 'stn' }, gS);
      c.dataset.id = id; stnEl[id] = c;
      const t = mk('text', { x: s.p[0] + 3.5, y: s.p[1] - 3, class: 'lbl' }, gL);
      t.textContent = s.n; lblEl[id] = t;
    }
    const total = Object.keys(byProv).length;
    $('#provCount').dataset.count = total;

    // scroll: draw lines one after another, light provinces whose stations are all reached
    const reached = new Set();
    const L = routes.length;
    const draw = p => {
      reached.clear();
      routes.forEach((r, i) => {
        const s = i / L * .65, f = Math.max(0, Math.min(1, (p - s) / .35));
        r.el.style.strokeDashoffset = r.len * (1 - f);
        r.l.stops.forEach((id, k) => { if (f > 0 && f >= r.cum[k] - 1e-6) reached.add(id); });
      });
      let lit = 0;
      for (const [prov, ids] of Object.entries(byProv)) {
        const on = ids.every(id => reached.has(id));
        provEl[prov]?.classList.toggle('lit', on);
        if (on) lit++;
      }
      for (const id in stnEl) stnEl[id].setAttribute('r', reached.has(id) ? 2 : 1.2);
      $('#provCount').textContent = lit;
    };
    draw(0);
    ScrollTrigger.create({ trigger: '.mapsec', start: 'top 75%', end: 'bottom 70%', scrub: true, onUpdate: s => draw(s.progress) });
    rise('.map-copy > *', '.map-copy', { stagger: .08 });
    $$('.stats b[data-count]').forEach(b => {
      if (b.id === 'provCount') return;
      ScrollTrigger.create({ trigger: b, start: 'top 85%', once: true, onEnter: () => gsap.fromTo({ v: 0 }, { v: 0 }, { v: +b.dataset.count, duration: 1.8, ease: 'power3.out', onUpdate() { b.textContent = Math.round(this.targets()[0].v); } }) });
    });

    // interaction
    const list = $('#lineList');
    list.innerHTML = NT.lines.map(l => `<li><button data-line="${l.id}">${l.name}</button></li>`).join('');
    const runHalo = mk('circle', { r: 5, class: 'train-halo', opacity: 0 });
    const runDot = mk('circle', { r: 2.8, class: 'train-dot', opacity: 0 });
    let run = null;
    const runTrain = id => {
      run?.kill(); run = null;
      runDot.setAttribute('opacity', id ? 1 : 0); runHalo.setAttribute('opacity', id ? 1 : 0);
      if (!id) return;
      const r = routes.find(x => x.l.id === id);
      const o = { p: 0 };
      const put = () => { const pt = r.el.getPointAtLength(o.p * r.len); for (const c of [runDot, runHalo]) { c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); } };
      put();
      run = gsap.to(o, { p: 1, duration: Math.max(2.5, r.len / 60), ease: 'power1.inOut', repeat: -1, repeatDelay: .6, onUpdate: put });
    };
    const focus = id => {
      runTrain(id);
      svg.classList.toggle('focus', !!id);
      $$('button', list).forEach(b => b.classList.toggle('on', b.dataset.line === id));
      routes.forEach(r => r.el.classList.toggle('on', r.l.id === id));
      const set = new Set(id ? NT.lines.find(l => l.id === id).stops : []);
      for (const k in stnEl) { stnEl[k].classList.toggle('on', set.has(k)); lblEl[k].classList.toggle('on', set.has(k)); }
    };
    let pinned = null;
    list.addEventListener('pointerover', e => { const b = e.target.closest('button'); if (b) focus(b.dataset.line); });
    list.addEventListener('pointerleave', () => focus(pinned));
    list.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; pinned = pinned === b.dataset.line ? null : b.dataset.line; focus(pinned); });
    const tip = $('#mapTip'), stage = $('.map-stage');
    gS.addEventListener('pointerover', e => {
      const id = e.target.dataset?.id; if (!id) return;
      const s = NT.st[id], r = e.target.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      const lines = NT.lines.filter(l => l.stops.includes(id)).map(l => l.name).join(' · ');
      tip.innerHTML = `<b>${s.n}</b> <i style="font-family:var(--latin)">${s.en}</i><br>${s.desc}<br><small style="color:#b8432f">${lines}</small>`;
      tip.style.left = r.left + r.width / 2 - sr.left + 'px'; tip.style.top = r.top - sr.top + 'px';
      tip.classList.add('on');
    });
    gS.addEventListener('pointerout', () => tip.classList.remove('on'));
  })();

  /* ---------------- lines horizontal ---------------- */
  (() => {
    const track = $('#linesTrack');
    track.innerHTML = NT.lines.map((l, i) => {
      const end = l.stops[l.stops.length - 1];
      const mins = (l.stops.length - 1) * 25;
      const dur = `${Math.floor(mins / 60)} 小时${mins % 60 ? ` ${mins % 60} 分` : ''}`;
      return `<article class="lcard">
        <img src="img/st/${end}.webp" alt="${NT.st[end].n}" loading="lazy"><img class="n" src="img/st/${end}_night.webp" alt="" loading="lazy">
        <div class="lcard-body"><span class="lcard-no">No.${pad(i + 1)}</span><h3>${l.name}</h3><p>${l.desc}</p>
        <p class="stops">${NT.st[l.stops[0]].n} → ${NT.st[end].n}</p>
        <div class="meta"><span>${l.stops.length} 站</span><span>全程专注 ${dur}</span></div></div></article>`;
    }).join('');
    const dist = () => track.scrollWidth - innerWidth;
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.lines', start: 'top top', end: () => `+=${dist()}`, pin: '.lines-pin', scrub: .8, invalidateOnRefresh: true,
        onUpdate: s => { $('#linesBar').style.width = s.progress * 100 + '%'; },
      },
    });
    // 3D tilt on hover
    $$('.lcard', track).forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
      });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
    rise('.lines-head > *', '.lines');
  })();

  /* ---------------- tickets ---------------- */
  (() => {
    const T = [
      ['xian', 'baoji', '丝绸之路线', 0], ['lanzhou', 'xining', '青藏线', 0], ['hangzhou', 'jinhua', '沪昆线', 3],
      ['guilin', 'liuzhou', '湘桂线', 0], ['taipei', 'hsinchu', '台湾环岛线', 0], ['jiayuguan', 'dunhuang', '丝绸之路线', 0],
    ];
    const stack = $('#tkStack');
    const today = new Date();
    stack.innerHTML = T.map(([a, b, ln, late], i) => {
      const d = new Date(today - (T.length - 1 - i) * 86400000 * 2);
      const date = `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
      return `<div class="ticket">
        <div class="tk-main">
          <div class="tk-top"><span>夜行列车 · NIGHT TRAIN</span><span>No.${pad(i + 1)}${pad(d.getDate())}</span></div>
          <div class="tk-route">${NT.st[a].n}<i>→</i>${NT.st[b].n}</div>
          <div class="tk-en">${NT.st[a].en} — ${NT.st[b].en}</div>
          <div class="tk-row"><span>日期<b>${date}</b></span><span>线路<b>${ln}</b></span><span>专注<b>25 分钟</b></span></div>
        </div>
        <div class="tk-stub"><i class="hole"></i><span class="seal${late ? ' late' : ''}">${late ? `晚点<br><small>${late} 分钟</small>` : `准点<br><small>到站</small>`}</span></div>
      </div>`;
    }).join('');
    const tks = $$('.ticket', stack);
    const n = tks.length;
    const final = i => ({ x: (i - (n - 1) / 2) * (mobile() ? 10 : 26), y: (i - (n - 1) / 2) * (mobile() ? 16 : 22), rotate: (i - (n - 1) / 2) * 4 + (i % 2 ? 2 : -2) });
    gsap.set(tks, { y: () => innerHeight, rotate: () => gsap.utils.random(-30, 30), opacity: 0 });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.tickets', start: 'top top', end: () => `+=${innerHeight * 1.8}`, pin: '.tk-pin', scrub: .8, invalidateOnRefresh: true },
    });
    tl.fromTo('.tk-copy > *', { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: .05, duration: .3 }, 0);
    tks.forEach((t, i) => tl.to(t, { ...final(i), opacity: 1, duration: .5, ease: 'power3.out' }, .15 + i * .22));
    // fan out at the end
    tl.to(tks, { x: (i) => (i - (n - 1) / 2) * (mobile() ? 18 : 62), y: (i) => Math.abs(i - (n - 1) / 2) * 14 - 20, rotate: (i) => (i - (n - 1) / 2) * 9, duration: .6, ease: 'power2.inOut' }, '+=.15');
    // mouse tilt on whole stack
    stack.addEventListener('pointermove', e => {
      const r = stack.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      gsap.to(stack, { rotateY: x * 14, rotateX: -y * 12, duration: .6, ease: 'power2.out', transformPerspective: 1200 });
    });
    stack.addEventListener('pointerleave', () => gsap.to(stack, { rotateY: 0, rotateX: 0, duration: .8 }));
    tks.forEach(t => {
      t.addEventListener('pointerenter', () => gsap.to(t, { z: 60, scale: 1.04, duration: .4, ease: 'power2.out' }));
      t.addEventListener('pointerleave', () => gsap.to(t, { z: 0, scale: 1, duration: .5 }));
    });
  })();

  /* ---------------- dining ---------------- */
  (() => {
    const F = [
      ['icecream', '红豆冰棍', 8, '老式纸包装，咬一口冰到脑门。'], ['seeds', '一包瓜子', 8, '绿皮车标配，嗑着嗑着就到站了。'],
      ['oranges', '几个橘子', 10, '剥开一个，整节车厢都香了。'], ['tanghulu', '冰糖葫芦', 12, '糖壳脆，山楂酸，一串刚刚好。'],
      ['eggs', '茶叶蛋', 12, '站台上买的，裂纹里全是味道。'], ['watermelon', '两牙西瓜', 14, '夏天的车厢，一口下去全是汁。'],
      ['sweetpotato', '烤红薯', 15, '掰开冒热气，捧在手里暖暖的。'], ['mungcake', '绿豆糕', 18, '清清凉凉，配茶正好。'],
      ['tea', '一杯热茶', 6, '铁托玻璃杯，茶叶慢慢沉下去。'], ['soda', '橘子汽水', 10, '玻璃瓶插根吸管，气泡往上冒。'],
      ['coffee', '热咖啡', 16, '赶路的人需要一点咖啡因。'], ['milktea', '珍珠奶茶', 20, '吸管戳下去，先喝到一颗珍珠。'],
      ['noodles', '一桶泡面', 15, '车上最香的东西，没有之一。'], ['jianbing', '煎饼果子', 18, '薄脆一咬咔嚓响，早班车的味道。'],
      ['roujiamo', '肉夹馍', 20, '馍是酥的，肉是烂的。'], ['tangyuan', '一碗汤圆', 22, '圆圆满满，咬开流芝麻。'],
      ['baozi', '小笼包', 24, '先开窗，后喝汤，小心烫。'], ['jiaozi', '一盘饺子', 26, '蘸点醋，像回到了家。'],
      ['lamian', '牛肉拉面', 32, '一清二白三红四绿，汤要喝完。'], ['bento', '铁路盒饭', 36, '红烧肉、青菜、煎蛋，热乎的。'],
    ];
    const card = f => `<div class="food"><img src="img/food/food_${f[0]}.webp" alt="${f[1]}" loading="lazy"><h4>${f[1]}</h4><p>${f[3]}</p><div class="price">${f[2]} 枚铜板</div></div>`;
    const half = Math.ceil(F.length / 2);
    const rows = [[$('#mq1'), F.slice(0, half), 1], [$('#mq2'), F.slice(half), -1]].map(([el, items, dir]) => {
      el.innerHTML = (items.map(card).join('')).repeat(3);
      return { el, dir, x: 0, w: 0, hover: false };
    });
    rows.forEach(r => {
      r.el.addEventListener('pointerenter', () => r.hover = true);
      r.el.addEventListener('pointerleave', () => r.hover = false);
    });
    const measure = () => rows.forEach(r => { r.w = r.el.scrollWidth / 3; if (r.dir < 0) r.x = -r.w; });
    measure(); addEventListener('resize', measure); addEventListener('load', measure);
    let vel = 0, active = false;
    if (lenis) lenis.on('scroll', e => { vel = e.velocity; });
    ScrollTrigger.create({ trigger: '.dining', start: 'top bottom', end: 'bottom top', onToggle: s => active = s.isActive });
    gsap.ticker.add((t, dt) => {
      if (!active || reduce) return;
      rows.forEach(r => {
        const speed = (r.hover ? .15 : 1) * (0.045 + Math.min(Math.abs(vel), 60) * .012);
        r.x -= r.dir * speed * dt;
        if (r.x <= -r.w * 2) r.x += r.w; if (r.x >= 0) r.x -= r.w;
        r.el.style.transform = `translate3d(${r.x}px,0,0)`;
      });
    });
    rise('.dn-copy > *', '.dining', { stagger: .08 });
    const coin = $('#coinNum');
    ScrollTrigger.create({ trigger: '.coin-row', start: 'top 85%', once: true, onEnter: () => gsap.to({ v: 0 }, { v: 55, duration: 2.4, ease: 'power2.out', onUpdate() { coin.textContent = Math.round(this.targets()[0].v); } }) });
    gsap.fromTo('.dn-bg img', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.dining', start: 'top bottom', end: 'bottom top', scrub: true } });
  })();

  /* ---------------- day / night compare ---------------- */
  (() => {
    const cmp = $('#cmp'), night = $('#cmpNight'), handle = $('#cmpHandle');
    let pos = .5;
    const set = p => { pos = Math.max(0, Math.min(1, p)); night.style.clipPath = `inset(0 0 0 ${pos * 100}%)`; handle.style.left = pos * 100 + '%'; };
    let drag = false;
    const at = e => set((e.clientX - cmp.getBoundingClientRect().left) / cmp.offsetWidth);
    cmp.addEventListener('pointerdown', e => { drag = true; cmp.setPointerCapture(e.pointerId); at(e); });
    cmp.addEventListener('pointermove', e => { if (drag) at(e); });
    cmp.addEventListener('pointerup', () => drag = false);
    const picks = ['lhasa', 'dunhuang', 'hangzhou', 'harbin', 'guilin', 'xiamen', 'chongqing', 'hualien'].filter(id => NT.st[id]);
    const box = $('#cmpPick');
    box.innerHTML = picks.map((id, i) => `<button data-id="${id}" class="${i ? '' : 'on'}">${NT.st[id].n}</button>`).join('');
    box.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', box).forEach(x => x.classList.toggle('on', x === b));
      const [d, n] = $$('img', cmp);
      gsap.to(cmp, { opacity: .2, duration: .25, onComplete: () => {
        d.src = `img/st/${b.dataset.id}.webp`; n.src = `img/st/${b.dataset.id}_night.webp`;
        n.onload = () => gsap.to(cmp, { opacity: 1, duration: .5 });
      } });
    });
    ScrollTrigger.create({
      trigger: cmp, start: 'top 70%', once: true,
      onEnter: () => gsap.fromTo({ p: .92 }, { p: .92 }, { p: .5, duration: 1.8, ease: 'expo.inOut', onUpdate() { set(this.targets()[0].p); } }),
    });
    rise('.cmp-head > *, .cmp-pick', '.compare', { stagger: .08 });
  })();

  /* ---------------- final ---------------- */
  gsap.timeline({ scrollTrigger: { trigger: '.final', start: 'top top', end: 'bottom bottom', scrub: true } })
    .fromTo('.fn-a', { scale: 1.12 }, { scale: 1, ease: 'none' }, 0)
    .to('.fn-b', { opacity: 1, ease: 'none', duration: .6 }, .35);
  gsap.from('.fn-copy > *', { y: 60, opacity: 0, stagger: .1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.final', start: 'top 20%', once: true } });

  /* ---------------- train ambience (WebAudio) ---------------- */
  let ac = null, master = null, clackTimer = null;
  function noiseBuffer(ctx, sec, brown) {
    const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
    }
    return b;
  }
  function hit(time, vol) {
    const s = ac.createBufferSource(); s.buffer = hit.buf;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900 + Math.random() * 300; bp.Q.value = 2.5;
    const g = ac.createGain(); g.gain.setValueAtTime(0, time); g.gain.linearRampToValueAtTime(vol, time + .004); g.gain.exponentialRampToValueAtTime(.0001, time + .12);
    s.connect(bp).connect(g).connect(master); s.start(time); s.stop(time + .15);
  }
  function clack() {
    if (!ac || ac.state !== 'running') return;
    const t = ac.currentTime + .02;
    hit(t, .5); hit(t + .13, .4); hit(t + .7, .45); hit(t + .83, .35);
  }
  function startSound() {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (!master) {
      master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
      hit.buf = noiseBuffer(ac, .2, false);
      const rumble = ac.createBufferSource(); rumble.buffer = noiseBuffer(ac, 4, true); rumble.loop = true;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320;
      const rg = ac.createGain(); rg.gain.value = .55;
      rumble.connect(lp).connect(rg).connect(master); rumble.start();
      const hum = ac.createOscillator(); hum.frequency.value = 52; const hg = ac.createGain(); hg.gain.value = .05;
      hum.connect(hg).connect(master); hum.start();
    }
    ac.resume();
    master.gain.cancelScheduledValues(ac.currentTime);
    master.gain.linearRampToValueAtTime(.35, ac.currentTime + 1.2);
    const loop = () => { clack(); clackTimer = setTimeout(loop, 2200 + Math.random() * 500); };
    clearTimeout(clackTimer); loop();
  }
  function stopSound() {
    clearTimeout(clackTimer);
    if (master) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(0, ac.currentTime + .8); }
  }
  $('#sound').addEventListener('click', e => {
    const b = e.currentTarget, on = !b.classList.contains('on');
    b.classList.toggle('on', on);
    on ? startSound() : stopSound();
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
