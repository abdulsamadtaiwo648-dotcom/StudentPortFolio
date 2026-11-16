/* ===================================================
   scene.js – original code for this site (no external libraries)
   1. 3D particle scene behind the page. Each page has its own shape,
      and hovering a navigation link previews that page's shape.
   2. 3D tilt on project and service cards
   3. Skill bars that fill on load
   4. Contact form that opens the visitor's email app
   COS 106 Term Project | Abdulsamad Taiwo
   =================================================== */

(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }


  // ── 2. Cards lean toward the pointer ──
  if (!reduce) {
    document.querySelectorAll('.project-item > a, .project-static, .service-item').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(800px) rotateX(' + (-py * 7).toFixed(2) + 'deg) rotateY(' + (px * 7).toFixed(2) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }


  // ── 3. Skill bars fill from zero ──
  if (!reduce) {
    var fills = Array.prototype.slice.call(document.querySelectorAll('.skill-progress-fill'));
    var widths = fills.map(function (f) { return f.style.width; });
    fills.forEach(function (f) { f.style.width = '0%'; });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        fills.forEach(function (f, i) { f.style.width = widths[i]; });
      });
    });
  }


  // ── 4. Contact form opens the visitor's email app with the message filled in ──
  var mailForm = document.querySelector('[data-mailto]');
  if (mailForm) {
    mailForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var to = mailForm.getAttribute('data-mailto');
      var name = mailForm.elements.fullname.value.trim();
      var from = mailForm.elements.email.value.trim();
      var message = mailForm.elements.message.value.trim();
      var subject = 'Portfolio message from ' + name;
      var body = message + '\n\n' + name + '\n' + from;
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var note = document.querySelector('[data-form-note]');
      if (note) note.textContent = 'Your email app should now be open with the message ready. Press send there to deliver it.';
    });
  }


  // ── 1. The 3D particle scene ──
  if (reduce || !window.HTMLCanvasElement || !window.Path2D) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'scene-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');

  var N = window.innerWidth < 700 ? 300 : 620;
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
      var t = i / (N - 1), a = t * Math.PI * 7, y = (t - 0.5) * 2.4;
      var kind = i % 5;
      if (kind === 4) { var m = rand() * 2 - 1; return [Math.cos(a) * 0.45 * m, y, Math.sin(a) * 0.45 * m]; }
      var side = kind % 2 ? Math.PI : 0;
      return [Math.cos(a + side) * 0.45, y, Math.sin(a + side) * 0.45];
    },
    // A cubic lattice
    cube: function (i) {
      var n = Math.ceil(Math.pow(N, 1 / 3)), s = 1.5 / (n - 1);
      var x = i % n, y = Math.floor(i / n) % n, z = Math.floor(i / (n * n)) % n;
      return [x * s - 0.75, y * s - 0.75, z * s - 0.75];
    },
    // A ring
    torus: function (i) {
      var u = i * GOLDEN, v = (i / N) * Math.PI * 2 * 9;
      var R = 0.82, r = 0.26;
      return [(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)];
    }
  };

  // Build each shape as flat xyz arrays, plus lines joining nearest neighbours
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

  var home = shapes[document.body.getAttribute('data-shape')] || shapes.sphere;
  var target = home;

  // Points start scattered and fly into the page's shape
  var cur = new Float32Array(N * 3);
  for (var s = 0; s < N * 3; s++) cur[s] = (rand() - 0.5) * 4;

  // Hovering or focusing a navigation link previews that page's shape
  document.querySelectorAll('[data-shape-link]').forEach(function (a) {
    var shape = shapes[a.getAttribute('data-shape-link')];
    if (!shape) return;
    function preview() { target = shape; }
    function restore() { target = home; }
    a.addEventListener('pointerenter', preview);
    a.addEventListener('pointerleave', restore);
    a.addEventListener('focus', preview);
    a.addEventListener('blur', restore);
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

  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) return;

    px += (tx - px) * 0.05;
    py += (ty - py) * 0.05;

    var narrow = W < 900;
    var cx = W * 0.5, cy = H * 0.5;
    var R = Math.min(W, H) * (narrow ? 0.42 : 0.52);

    var ry = now * 0.00011 + px * 0.5 + window.scrollY * 0.0007;
    var rx = 0.36 + py * 0.25;
    var cosY = Math.cos(ry), sinY = Math.sin(ry), cosX = Math.cos(rx), sinX = Math.sin(rx);
    var tp = target.pos;

    for (var n = 0; n < N; n++) {
      var o = n * 3;
      // Ease each point toward its place in the target shape
      cur[o] += (tp[o] - cur[o]) * 0.06;
      cur[o + 1] += (tp[o + 1] - cur[o + 1]) * 0.06;
      cur[o + 2] += (tp[o + 2] - cur[o + 2]) * 0.06;
      var x = cur[o], y = cur[o + 1], z = cur[o + 2];
      var x1 = x * cosY + z * sinY, z1 = -x * sinY + z * cosY;
      var y1 = y * cosX - z1 * sinX, z2 = y * sinX + z1 * cosX;
      var sc = CAMERA / (CAMERA - clamp(z2, -3, 3));
      sx[n] = cx + x1 * R * sc; sy[n] = cy + y1 * R * sc; sz[n] = z2; ss[n] = sc;
    }

    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = narrow ? 0.5 : 0.8;

    // Lines appear once neighbouring points have settled close together
    var maxLen = R * 0.42, maxLen2 = maxLen * maxLen;
    var near = new Path2D(), mid = new Path2D(), far = new Path2D();
    var edges = target.edges;
    for (var k = 0; k < edges.length; k += 2) {
      var a = edges[k], b = edges[k + 1];
      var dx = sx[a] - sx[b], dy = sy[a] - sy[b];
      if (dx * dx + dy * dy > maxLen2) continue;
      var zz = (sz[a] + sz[b]) * 0.5;
      var path = zz > 0.35 ? near : (zz > -0.35 ? mid : far);
      path.moveTo(sx[a], sy[a]);
      path.lineTo(sx[b], sy[b]);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(26,209,255,0.30)'; ctx.stroke(near);
    ctx.strokeStyle = 'rgba(26,209,255,0.17)'; ctx.stroke(mid);
    ctx.strokeStyle = 'rgba(26,209,255,0.08)'; ctx.stroke(far);

    for (var m = 0; m < N; m++) {
      var depth = clamp((sz[m] + 1.2) / 2.4, 0, 1);
      ctx.fillStyle = (m % 8 === 0)
        ? 'rgba(129,140,248,' + (0.3 + depth * 0.7).toFixed(2) + ')'
        : 'rgba(26,209,255,' + (0.2 + depth * 0.7).toFixed(2) + ')';
      ctx.beginPath();
      ctx.arc(sx[m], sy[m], (0.7 + depth * 1.3) * ss[m], 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  requestAnimationFrame(frame);
})();
