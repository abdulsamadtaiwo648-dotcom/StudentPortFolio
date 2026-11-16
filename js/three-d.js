/* ===================================================
   three-d.js – 3D effects (no external libraries)
   1. Rotating 3D wireframe globe behind the homepage hero
   2. Mouse-driven 3D tilt on project cards
   COS 106 Term Project | Abdulsamad Taiwo
   =================================================== */

var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;


// ── 1. Rotating 3D wireframe globe (hero background) ──
function initHeroGlobe(hero) {
  if (reduceMotion || !window.HTMLCanvasElement) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'hero-3d-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  hero.insertBefore(canvas, hero.firstChild);

  var ctx = canvas.getContext('2d');
  var width = 0, height = 0, dpr = 1;

  // Points evenly distributed on a unit sphere (Fibonacci lattice)
  var POINTS = 150;
  var pts = [];
  var golden = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < POINTS; i++) {
    var y = 1 - (i / (POINTS - 1)) * 2;
    var r = Math.sqrt(1 - y * y);
    var t = golden * i;
    pts.push({ x: Math.cos(t) * r, y: y, z: Math.sin(t) * r });
  }

  // Connect nearby points to form the wireframe
  var edges = [];
  var LINK = 0.42;
  for (var a = 0; a < POINTS; a++) {
    for (var b = a + 1; b < POINTS; b++) {
      var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y, dz = pts[a].z - pts[b].z;
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) < LINK) edges.push([a, b]);
    }
  }

  // Orbit ring that tilts around the globe
  var RING_STEPS = 120;

  var rotY = 0, rotX = 0.35;
  var targetX = 0.35, targetY = 0;
  var pointerX = 0, pointerY = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Rotate a point around Y then X, then project with perspective
  function project(p, cosY, sinY, cosX, sinX, cx, cy, radius) {
    var x1 = p.x * cosY + p.z * sinY;
    var z1 = -p.x * sinY + p.z * cosY;
    var y1 = p.y * cosX - z1 * sinX;
    var z2 = p.y * sinX + z1 * cosX;
    var camera = 3.2;
    var s = camera / (camera - z2);
    return { x: cx + x1 * radius * s, y: cy + y1 * radius * s, z: z2, s: s };
  }

  function draw() {
    // Ease toward pointer position for a parallax feel
    pointerX += (targetY - pointerX) * 0.04;
    pointerY += (targetX - pointerY) * 0.04;
    rotY += 0.0035;

    ctx.clearRect(0, 0, width, height);

    var centred = hero.classList.contains('page-hero') || width <= 900;
    var cx = centred ? width * 0.5 : width * 0.72;
    var cy = height * 0.5;
    var radius = Math.min(width, height) * (width > 900 ? 0.34 : 0.28);

    var ry = rotY + pointerX * 0.6;
    var rx = pointerY * 0.5 + rotX;
    var cosY = Math.cos(ry), sinY = Math.sin(ry);
    var cosX = Math.cos(rx), sinX = Math.sin(rx);

    var proj = new Array(POINTS);
    for (var i = 0; i < POINTS; i++) {
      proj[i] = project(pts[i], cosY, sinY, cosX, sinX, cx, cy, radius);
    }

    // Edges: fade back-facing lines
    ctx.lineWidth = 1;
    for (var e = 0; e < edges.length; e++) {
      var p1 = proj[edges[e][0]], p2 = proj[edges[e][1]];
      var depth = (p1.z + p2.z) / 2;
      var alpha = 0.06 + ((depth + 1) / 2) * 0.22;
      ctx.strokeStyle = 'rgba(0,212,255,' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Nodes
    for (var n = 0; n < POINTS; n++) {
      var q = proj[n];
      var a2 = 0.25 + ((q.z + 1) / 2) * 0.6;
      ctx.fillStyle = (n % 9 === 0) ? 'rgba(99,102,241,' + a2.toFixed(3) + ')' : 'rgba(0,212,255,' + a2.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(q.x, q.y, 1.6 * q.s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Orbit ring (a great circle tilted differently from the globe)
    var ringTilt = rx + 0.9;
    var cT = Math.cos(ringTilt), sT = Math.sin(ringTilt);
    ctx.strokeStyle = 'rgba(99,102,241,0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (var k = 0; k <= RING_STEPS; k++) {
      var ang = (k / RING_STEPS) * Math.PI * 2;
      var rp = { x: Math.cos(ang), y: 0, z: Math.sin(ang) };
      var rq = project(rp, cosY, sinY, cT, sT, cx, cy, radius * 1.18);
      if (k === 0) ctx.moveTo(rq.x, rq.y); else ctx.lineTo(rq.x, rq.y);
    }
    ctx.stroke();

    requestAnimationFrame(draw);
  }

  hero.addEventListener('pointermove', function (ev) {
    var rect = hero.getBoundingClientRect();
    targetY = ((ev.clientX - rect.left) / rect.width - 0.5) * 2;
    targetX = ((ev.clientY - rect.top) / rect.height - 0.5) * -1 * 0.6 + 0.35;
  });
  hero.addEventListener('pointerleave', function () {
    targetX = 0.35;
    targetY = 0;
  });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
}

document.querySelectorAll('.hero, .page-hero').forEach(initHeroGlobe);


// ── 2. 3D tilt on project cards ──
(function initCardTilt() {
  if (reduceMotion) return;
  var MAX_TILT = 8; // degrees

  document.querySelectorAll('.project-card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      card.classList.add('is-tilting');
      card.style.transform =
        'perspective(900px) rotateX(' + (-py * MAX_TILT).toFixed(2) + 'deg) ' +
        'rotateY(' + (px * MAX_TILT).toFixed(2) + 'deg) translateY(-6px)';
    });
    card.addEventListener('pointerleave', function () {
      card.classList.remove('is-tilting');
      card.style.transform = '';
    });
  });
})();


// ── 3. Interactive layer ──
var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

// 3a. Cursor spotlight on cards and buttons (sets --mx / --my per element)
(function initSpotlight() {
  if (reduceMotion) return;
  document.querySelectorAll('.project-card, .skill-badge, .btn, .mini-card, .hero-stats > div').forEach(function (el) {
    el.classList.add('spotlight');
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();

// 3b. Magnetic buttons: they lean toward the cursor
(function initMagnetic() {
  if (reduceMotion || !finePointer) return;
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) * 0.18;
      var y = (e.clientY - (r.top + r.height / 2)) * 0.25;
      btn.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    });
    btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
  });
})();

// 3c. Scroll parallax: hero photo and project images drift at different speeds
(function initParallax() {
  if (reduceMotion) return;
  var layers = [];
  document.querySelectorAll('.hero-photo-ring').forEach(function (el) { layers.push({ el: el, speed: -0.08 }); });
  document.querySelectorAll('.project-img').forEach(function (el) { layers.push({ el: el, speed: 0.04 }); });
  if (!layers.length) return;
  var ticking = false;
  function update() {
    var y = window.scrollY;
    layers.forEach(function (l) {
      var rect = l.el.getBoundingClientRect();
      var center = rect.top + rect.height / 2 - window.innerHeight / 2;
      l.el.style.setProperty('--parallax', (center * l.speed).toFixed(1) + 'px');
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

// 3d. Custom cursor (desktop only)
(function initCursor() {
  if (reduceMotion || !finePointer) return;
  document.body.classList.add('has-custom-cursor');
  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  var ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(ring);
  document.body.appendChild(dot);
  var x = 0, y = 0, rx = 0, ry = 0;
  window.addEventListener('pointermove', function (e) {
    x = e.clientX; y = e.clientY;
    dot.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  });
  function follow() {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
    requestAnimationFrame(follow);
  }
  follow();
  document.querySelectorAll('a, button, .project-card, .btn').forEach(function (el) {
    el.addEventListener('pointerenter', function () { ring.classList.add('is-hover'); });
    el.addEventListener('pointerleave', function () { ring.classList.remove('is-hover'); });
  });
})();

// 3e. Click anywhere on a hero: the globe sends out a pulse
window.addEventListener('pointerdown', function (e) {
  var hero = e.target.closest && e.target.closest('.hero, .page-hero, .s-hero');
  if (!hero || reduceMotion) return;
  var r = hero.getBoundingClientRect();
  var pulse = document.createElement('span');
  pulse.className = 'hero-pulse';
  pulse.style.left = (e.clientX - r.left) + 'px';
  pulse.style.top = (e.clientY - r.top) + 'px';
  hero.appendChild(pulse);
  pulse.addEventListener('animationend', function () { pulse.remove(); });
});
