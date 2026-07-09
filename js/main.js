/* ===================================================
   main.js – Shared JavaScript for all pages
   COS 106 Term Project | Abdulsamad Taiwo
   =================================================== */

// ── Navbar: scroll effect + active link detection ──
(function initNavbar() {
  var navbar = document.getElementById('navbar');
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');

  // Scroll effect
  window.addEventListener('scroll', function () {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Hamburger toggle (mobile)
  if (hamburger && navLinks) {
    function toggleMenu() {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    }

    hamburger.addEventListener('click', toggleMenu);
    hamburger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') toggleMenu();
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
      if (!navbar.contains(e.target)) {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      }
    });
  }
})();


// ── Scroll-triggered fade-in animation ──
(function initScrollAnimations() {
  var elements = document.querySelectorAll('.fade-in-on-scroll');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();


// ── Typewriter effect (Homepage only) ──
(function initTypewriter() {
  var el = document.getElementById('typewriter');
  if (!el) return;

  var words = ['Backend Developer', 'Problem Solver', 'Golang Enthusiast', 'System Builder'];
  var wordIndex = 0;
  var charIndex = 0;
  var isDeleting = false;
  var speed = 100;

  function type() {
    var current = words[wordIndex];
    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      speed = 60;
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      speed = 110;
    }

    if (!isDeleting && charIndex === current.length) {
      isDeleting = true;
      speed = 1800; // pause before deleting
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 400;
    }

    setTimeout(type, speed);
  }

  setTimeout(type, 600);
})();


// ── Smooth number counter animation (stats) ──
(function initCounters() {
  var statNums = document.querySelectorAll('.hero-stat-num');
  if (!statNums.length) return;

  statNums.forEach(function (el) {
    var finalText = el.textContent.trim();
    var numMatch = finalText.match(/[\d.]+/);
    if (!numMatch) return;

    var finalNum = parseFloat(numMatch[0]);
    var suffix = finalText.replace(numMatch[0], '');
    var start = 0;
    var duration = 1500;
    var startTime = null;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(finalNum * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(animate);
    }

    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(animate);
        observer.disconnect();
      }
    });
    observer.observe(el);
  });
})();


// ── Profile photo fallback ──
(function initPhotoFallback() {
  var photos = document.querySelectorAll('#hero-photo, #about-photo');
  photos.forEach(function (img) {
    img.addEventListener('error', function () {
      // Generate a simple SVG avatar as fallback
      var svg = `<svg xmlns="http://www.w3.org/2000/svg" width="312" height="312" viewBox="0 0 312 312">
        <rect width="312" height="312" fill="#111d2e" rx="156"/>
        <circle cx="156" cy="120" r="56" fill="#1a2d40"/>
        <ellipse cx="156" cy="240" rx="90" ry="60" fill="#1a2d40"/>
        <text x="156" y="290" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" fill="#94a3b8">AT</text>
      </svg>`;
      img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    });
  });
})();


// ── Mini card hover glow ──
(function initCardHover() {
  var cards = document.querySelectorAll('[style*="background:var(--bg-card)"]');
  cards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      card.style.borderColor = 'rgba(0,212,255,0.4)';
      card.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.borderColor = '';
      card.style.transform = '';
    });
  });
})();
