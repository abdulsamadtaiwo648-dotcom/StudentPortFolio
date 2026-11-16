/* ===================================================
   story.js – Homepage scroll story (no external libraries)
   1. Letter-by-letter reveal of the hero name
   2. Scroll progress bar + chapter indicator
   3. Fixed 3D particle scene that morphs between shapes per chapter
   4. Scroll-linked 3D rotation of the project frames
   COS 106 Term Project | Abdulsamad Taiwo
   =================================================== */

(function () {
  var chapters = Array.prototype.slice.call(document.querySelectorAll('[data-chapter]'));
  if (!chapters.length) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { t = clamp((t - 0.15) / 0.7, 0, 1); return t * t * (3 - 2 * t); }


  // ── 1. Split the hero name into letters so CSS can stagger them ──
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var text = el.textContent.trim();
    var offset = parseInt(el.getAttribute('data-split-offset'), 10) || 0;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'char';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i + offset);
      s.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(s);
    });
  });
  document.body.classList.add('story-ready');


  // ── 2. Progress bar + chapter indicator ──
  var bar = document.createElement('div');
  bar.className = 'story-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var nav = document.createElement('nav');
  nav.className = 'story-nav';
  nav.setAttribute('aria-label', 'Page chapters');
  var navLinks = chapters.map(function (c) {
    var a = document.createElement('a');
    a.href = '#' + c.id;
    var label = document.createElement('span');
    label.textContent = c.getAttribute('data-chapter');
    var tick = document.createElement('i');
    a.appendChild(label);
    a.appendChild(tick);
    nav.appendChild(a);
    return a;
  });
  document.body.appendChild(nav);

  // Where are we in the story? Returns chapter index i and blend e (0..1) toward i + 1.
  var state = { i: 0, e: 0, active: -1 };
  function measure() {
    var mid = window.innerHeight * 0.5;
    var centers = chapters.map(function (c) {
      var r = c.getBoundingClientRect();
      // Tall chapters hold their shape: clamp the reference point inside the chapter.
      return clamp(mid, r.top + Math.min(r.height, window.innerHeight) * 0.5, r.bottom - Math.min(r.height, window.innerHeight) * 0.5);
    });
    var i = 0;
    for (var k = 0; k < centers.length; k++) { if (centers[k] <= mid) i = k; }
    var j = Math.min(i + 1, chapters.length - 1);
    var t = j === i ? 0 : clamp((mid - centers[i]) / Math.max(1, centers[j] - centers[i]), 0, 1);
    state.i = i;
    state.e = smooth(t);

    var active = t > 0.5 ? j : i;
    if (active !== state.active) {
      state.active = active;
      navLinks.forEach(function (a, n) { a.classList.toggle('active', n === active); });
    }

    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
  }


  // ── 4. Project frames rotate in 3D as they pass through the viewport ──
  var frames = Array.prototype.slice.call(document.querySelectorAll('.work-frame'));
  function tiltFrames() {
    if (reduce) return;
    var vh = window.innerHeight;
    var strength = window.innerWidth < 900 ? 0.4 : 1;
    frames.forEach(function (f) {
      var r = f.parentNode.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var p = clamp((r.top + r.height / 2 - vh / 2) / (vh * 0.7), -1, 1);
      var dir = parseFloat(f.getAttribute('data-dir')) || 1;
      f.style.setProperty('--ry', (dir * (5 + Math.abs(p) * 16) * strength).toFixed(2) + 'deg');
      f.style.setProperty('--rx', (-p * 9 * strength).toFixed(2) + 'deg');
      f.style.setProperty('--sc', (1 - Math.abs(p) * 0.08).toFixed(3));
    });
  }

  // Portrait leans toward the pointer
  var portrait = document.getElementById('portrait');
  if (portrait && !reduce) {
    portrait.parentNode.addEventListener('pointermove', function (e) {
      var r = portrait.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      portrait.style.setProperty('--pry', (px * 16).toFixed(2) + 'deg');
      portrait.style.setProperty('--prx', (-py * 12).toFixed(2) + 'deg');
    });
    portrait.parentNode.addEventListener('pointerleave', function () {
      portrait.style.removeProperty('--pry');
      portrait.style.removeProperty('--prx');
    });
  }

  var uiQueued = false;
  function queueUi() {
    if (uiQueued) return;
    uiQueued = true;
    requestAnimationFrame(function () { uiQueued = false; measure(); tiltFrames(); });
  }
  window.addEventListener('scroll', queueUi, { passive: true });
  window.addEventListener('resize', queueUi);
  window.addEventListener('load', queueUi);
  queueUi();


  // ── 3. The 3D particle scene ──
  if (reduce || !window.HTMLCanvasElement || !window.Path2D) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'story-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');

  var small = window.innerWidth < 700;
  var N = small ? 300 : 620;
  var GOLDEN = Math.PI * (3 - Math.sqrt(5));

  // Deterministic pseudo-random numbers so the scene looks the same on every visit
  var seed = 7;
  function rand() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

  var builders = {
    // A globe: points spread evenly with a Fibonacci lattice
    sphere: function (i) {
      var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = GOLDEN * i;
      return [Math.cos(t) * r, y, Math.sin(t) * r];
    },
    // A double helix with rungs between the two strands
    helix: function (i) {
      var t = i / (N - 1), a = t * Math.PI * 7, y = (t - 0.5) * 2.5;
      var kind = i % 5;
      if (kind === 4) { var m = rand() * 2 - 1; return [Math.cos(a) * 0.42 * m, y, Math.sin(a) * 0.42 * m]; }
      var side = kind % 2 ? Math.PI : 0;
      return [Math.cos(a + side) * 0.42, y, Math.sin(a + side) * 0.42];
    },
    // A cubic lattice: ordered, like a system design
    cube: function (i) {
      var n = Math.ceil(Math.pow(N, 1 / 3)), s = 1.5 / (n - 1);
      var x = i % n, y = Math.floor(i / n) % n, z = Math.floor(i / (n * n)) % n;
      return [x * s - 0.75, y * s - 0.75, z * s - 0.75];
    },
    // A rippling surface
    wave: function (i) {
      var n = Math.ceil(Math.sqrt(N)), s = 2.8 / (n - 1);
      var x = (i % n) * s - 1.4, z = Math.floor(i / n) * s - 1.4;
      return [x, Math.sin(x * 2.4) * Math.cos(z * 2.4) * 0.22, z];
    },
    // A ring
    torus: function (i) {
      var u = i * GOLDEN, v = (i / N) * Math.PI * 2 * 9;
      var R = 0.82, r = 0.26;
      return [(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)];
    },
    // A spiral galaxy
    galaxy: function (i) {
      var r = Math.sqrt(rand()) * 1.25, arm = (i % 3) * (Math.PI * 2 / 3);
      var a = r * 4.2 + arm + (rand() - 0.5) * 0.5;
      return [Math.cos(a) * r, (rand() - 0.5) * 0.16 * (1.3 - r), Math.sin(a) * r];
    }
  };

  // Build each shape as flat xyz arrays, plus the lines joining nearest neighbours
  var shapes = {};
  Object.keys(builders).forEach(function (name) {
    var pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var p = builders[name](i);
      pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = p[2];
    }
    var edges = [], seen = {};
    function link(a, b) {
      var key = a < b ? a * N + b : b * N + a;
      if (seen[key]) return;
      seen[key] = true;
      edges.push(a, b);
    }
    for (var a = 0; a < N; a++) {
      var best1 = -1, best2 = -1, d1 = 1e9, d2 = 1e9;
      for (var b = 0; b < N; b++) {
        if (a === b) continue;
        var dx = pos[a * 3] - pos[b * 3], dy = pos[a * 3 + 1] - pos[b * 3 + 1], dz = pos[a * 3 + 2] - pos[b * 3 + 2];
        var d = dx * dx + dy * dy + dz * dz;
        if (d < d1) { d2 = d1; best2 = best1; d1 = d; best1 = b; }
        else if (d < d2) { d2 = d; best2 = b; }
      }
      if (best1 >= 0 && d1 < 0.2) link(a, best1);
      if (best2 >= 0 && d2 < 0.2) link(a, best2);
    }
    shapes[name] = { pos: pos, edges: new Uint16Array(edges) };
  });

  // A little per-point scatter makes the morph swirl instead of sliding in straight lines
  var scatter = new Float32Array(N * 3);
  for (var s = 0; s < N * 3; s++) scatter[s] = rand() - 0.5;

  var cfg = chapters.map(function (c) {
    return {
      shape: shapes[c.getAttribute('data-shape')] || shapes.sphere,
      anchor: parseFloat(c.getAttribute('data-anchor')) || 0.5,
      alpha: parseFloat(c.getAttribute('data-alpha')) || 0.5
    };
  });

  var W = 0, H = 0;
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // Pointer steers the rotation a little
  var tx = 0, ty = 0, px = 0, py = 0;
  window.addEventListener('pointermove', function (e) {
    tx = (e.clientX / W - 0.5) * 2;
    ty = (e.clientY / H - 0.5) * 2;
  });

  var sx = new Float32Array(N), sy = new Float32Array(N), sz = new Float32Array(N), ss = new Float32Array(N);
  var CAMERA = 3.4;

  function drawEdges(edges, weight, maxLen2) {
    if (weight < 0.03) return;
    var near = new Path2D(), mid = new Path2D(), far = new Path2D();
    for (var k = 0; k < edges.length; k += 2) {
      var a = edges[k], b = edges[k + 1];
      var dx = sx[a] - sx[b], dy = sy[a] - sy[b];
      if (dx * dx + dy * dy > maxLen2) continue;
      var z = (sz[a] + sz[b]) * 0.5;
      var path = z > 0.35 ? near : (z > -0.35 ? mid : far);
      path.moveTo(sx[a], sy[a]);
      path.lineTo(sx[b], sy[b]);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,212,255,' + (0.30 * weight).toFixed(3) + ')'; ctx.stroke(near);
    ctx.strokeStyle = 'rgba(0,212,255,' + (0.17 * weight).toFixed(3) + ')'; ctx.stroke(mid);
    ctx.strokeStyle = 'rgba(0,212,255,' + (0.08 * weight).toFixed(3) + ')'; ctx.stroke(far);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) return;

    px += (tx - px) * 0.05;
    py += (ty - py) * 0.05;

    var i = state.i, j = Math.min(i + 1, cfg.length - 1), e = state.e;
    var A = cfg[i], B = cfg[j];
    var narrow = W < 900;
    var cx = (narrow ? 0.5 : lerp(A.anchor, B.anchor, e)) * W;
    var cy = H * 0.5;
    var R = Math.min(W, H) * (narrow ? 0.34 : 0.37);
    var alpha = lerp(A.alpha, B.alpha, e) * (narrow ? 0.55 : 1);

    var ry = now * 0.00012 + px * 0.5 + (i + e) * 1.1;
    var rx = 0.38 + py * 0.25;
    var cosY = Math.cos(ry), sinY = Math.sin(ry), cosX = Math.cos(rx), sinX = Math.sin(rx);
    var burst = Math.sin(e * Math.PI) * 0.5;
    var pa = A.shape.pos, pb = B.shape.pos;

    for (var n = 0; n < N; n++) {
      var o = n * 3;
      var x = pa[o] + (pb[o] - pa[o]) * e + scatter[o] * burst;
      var y = pa[o + 1] + (pb[o + 1] - pa[o + 1]) * e + scatter[o + 1] * burst;
      var z = pa[o + 2] + (pb[o + 2] - pa[o + 2]) * e + scatter[o + 2] * burst;
      var x1 = x * cosY + z * sinY, z1 = -x * sinY + z * cosY;
      var y1 = y * cosX - z1 * sinX, z2 = y * sinX + z1 * cosX;
      var sc = CAMERA / (CAMERA - z2);
      sx[n] = cx + x1 * R * sc; sy[n] = cy + y1 * R * sc; sz[n] = z2; ss[n] = sc;
    }

    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = alpha;

    var maxLen2 = R * 0.45; maxLen2 *= maxLen2;
    drawEdges(A.shape.edges, 1 - e, maxLen2);
    if (j !== i) drawEdges(B.shape.edges, e, maxLen2);

    for (var m = 0; m < N; m++) {
      var depth = clamp((sz[m] + 1.2) / 2.4, 0, 1);
      ctx.fillStyle = (m % 8 === 0)
        ? 'rgba(129,140,248,' + (0.3 + depth * 0.7).toFixed(2) + ')'
        : 'rgba(0,212,255,' + (0.2 + depth * 0.7).toFixed(2) + ')';
      ctx.beginPath();
      ctx.arc(sx[m], sy[m], (0.7 + depth * 1.3) * ss[m], 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  requestAnimationFrame(frame);
})();
