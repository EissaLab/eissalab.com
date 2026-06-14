/* Eissa Lab — shared site behavior */
(function () {
  // --- Mobile nav toggle ---
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // --- Theme (dark mode) toggle ---
  function applyTheme(t) {
    if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('eissa-theme', t); } catch (e) {}
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-pressed', t === 'dark');
      b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
    window.dispatchEvent(new CustomEvent('eissa:themechange'));
  }
  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
  });
  // sync button label with the theme set by the inline head script
  (function () {
    var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-pressed', cur === 'dark');
      b.setAttribute('aria-label', cur === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  })();

  // --- Header shadow on scroll ---
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // --- Reveal on scroll (reusable so dynamically-rendered content animates too) ---
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = (!reduce && 'IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    : null;

  window.eissaObserveReveals = function (scope) {
    var els = (scope || document).querySelectorAll('.reveal:not(.in)');
    if (!io) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    els.forEach(function (el) { io.observe(el); });
  };
  window.eissaObserveReveals(document);
})();

/* ---- Hero network visualization (decision / inference network) ---- */
function initNetwork(canvas) {
  if (!canvas) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var nodes = [], edges = [], W = 0, H = 0;

  var palette = ['#1E40A8', '#4A40C9', '#11A9CC'];
  var edgeColor = 'rgba(30,64,168,0.10)';
  var accentHex = '#11A9CC';
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    var p = cs.getPropertyValue('--primary').trim();
    var i = cs.getPropertyValue('--indigo').trim();
    var a = cs.getPropertyValue('--accent').trim();
    if (p && i && a) { palette = [p, i, a]; accentHex = a; }
    var ec = cs.getPropertyValue('--canvas-edge').trim();
    if (ec) edgeColor = ec;
  }
  readColors();

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  var outStart = 0, outCount = 0, layerCount = 4;
  function build() {
    nodes = []; edges = [];
    var layers = [3, 6, 6, 3]; // final layer = the decision (3 competing options)
    layerCount = layers.length;
    var padX = W * 0.08, padY = H * 0.17;
    var usableW = W - padX * 2, usableH = H - padY * 2;
    var starts = [], off = 0;
    layers.forEach(function (count, li) {
      starts[li] = off;
      var x = padX + usableW * (li / (layers.length - 1));
      var isOut = li === layers.length - 1;
      for (var i = 0; i < count; i++) {
        var y = padY + usableH * (count === 1 ? .5 : i / (count - 1));
        nodes.push({
          x: x, y: y, bx: x, by: y, li: li,
          r: isOut ? 4.4 : 2.6 + Math.random() * 1.8,
          ph: Math.random() * Math.PI * 2,
          act: 0,
          c: isOut ? accentHex : palette[Math.floor(Math.random() * palette.length)]
        });
      }
      off += count;
    });
    // fully-ish connect adjacent layers, each edge with a random "weight"
    var o = 0, ps = 0, pc = 0;
    layers.forEach(function (count, li) {
      if (li > 0) {
        for (var a = 0; a < pc; a++) {
          for (var b = 0; b < count; b++) {
            if (Math.random() < 0.72) {
              edges.push({ a: ps + a, b: o + b, gap: li - 1, w: 0.22 + Math.random() * 0.78 });
            }
          }
        }
      }
      ps = o; pc = count; o += count;
    });
    outStart = starts[layers.length - 1];
    outCount = layers[layers.length - 1];
  }

  var t0 = performance.now();
  var sweepDur = 2.4, holdDur = 1.6, cycleDur = sweepDur + holdDur;
  function winnerForCycle(c) {
    var x = Math.sin((c + 1) * 12.9898) * 43758.5453;
    return Math.floor((x - Math.floor(x)) * outCount);
  }

  function frame(now) {
    var time = (now - t0) / 1000;
    var cycle = Math.floor(time / cycleDur);
    var ct = time - cycle * cycleDur;
    var sweep = Math.min(ct / sweepDur, 1);
    var inHold = ct > sweepDur;
    var holdT = inHold ? (ct - sweepDur) / holdDur : 0;
    var waveX = sweep * (layerCount - 1);   // position of the activation front, in layers
    var winner = winnerForCycle(cycle);
    if (reduce) { sweep = 1; inHold = true; holdT = 0.45; waveX = layerCount - 1; } // static resolved state

    ctx.clearRect(0, 0, W, H);

    // node drift + forward-pass activation (a wave sweeping input -> output)
    nodes.forEach(function (n) {
      if (!reduce) {
        n.x = n.bx + Math.sin(time * 0.45 + n.ph) * 3.5;
        n.y = n.by + Math.cos(time * 0.38 + n.ph) * 3.5;
      }
      var d = waveX - n.li;
      var a = Math.exp(-(d * d) / 0.22);   // brightens as the front reaches its layer
      if (d < -0.04) a *= 0.18;            // layers ahead of the front stay dim
      n.act = a;
    });

    // edges + travelling signals
    edges.forEach(function (e) {
      var a = nodes[e.a], b = nodes[e.b];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 0.5 + e.w * 0.8;
      ctx.stroke();

      var local = waveX - e.gap; // 0..1 as the front crosses this edge's gap
      if (!inHold && local > 0 && local < 1) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = hexA(accentHex, 0.22 * e.w);
        ctx.lineWidth = 0.7 + e.w * 1.3;
        ctx.stroke();
        var px = a.x + (b.x - a.x) * local, py = a.y + (b.y - a.y) * local;
        var g = ctx.createRadialGradient(px, py, 0, px, py, 6);
        g.addColorStop(0, hexA(accentHex, 0.95 * e.w));
        g.addColorStop(1, hexA(accentHex, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
      } else if (inHold && e.b === outStart + winner) {
        // the path into the chosen option stays lit while the decision is held
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = hexA(accentHex, (0.10 + 0.28 * (1 - holdT)) * e.w);
        ctx.lineWidth = 0.8 + e.w * 1.4;
        ctx.stroke();
      }
    });

    // nodes (the output layer resolves to a single winner = the decision)
    nodes.forEach(function (n, i) {
      var isOut = n.li === layerCount - 1;
      var isWinner = isOut && (i - outStart) === winner;
      var act = n.act, glow = 0;
      if (isOut && inHold) {
        if (isWinner) { act = 1; glow = 0.55 + 0.45 * Math.sin(holdT * Math.PI * 2 + 1); }
        else { act *= 0.12; }
      }
      var col = isWinner ? accentHex : n.c;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + (isOut ? 6 : 4) + glow * 7, 0, Math.PI * 2);
      ctx.fillStyle = hexA(col, 0.05 + 0.20 * act + glow * 0.22);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + glow * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = hexA(col, 0.45 + 0.5 * act);
      ctx.fill();
    });

    // decision commit: rings radiate from the chosen output node
    if (inHold && nodes[outStart + winner]) {
      var wn = nodes[outStart + winner];
      var spread = Math.min(W, H) * 0.05 + 16;
      [holdT, (holdT + 0.5) % 1].forEach(function (p) {
        ctx.beginPath();
        ctx.arc(wn.x, wn.y, wn.r + 4 + p * spread, 0, Math.PI * 2);
        ctx.strokeStyle = hexA(accentHex, (1 - p) * 0.45);
        ctx.lineWidth = 1.4;
        ctx.stroke();
      });
    }

    if (!reduce) requestAnimationFrame(frame);
  }

  function hexA(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('eissa:themechange', function () {
    readColors();
    nodes.forEach(function (n) {
      n.c = (n.li === layerCount - 1) ? accentHex : palette[Math.floor(Math.random() * palette.length)];
    });
    if (reduce) requestAnimationFrame(frame); // redraw static frame
  });
  requestAnimationFrame(frame);
  if (reduce) requestAnimationFrame(frame); // draw one static frame
}

/* ---- Publication filters (moved from render.js) ---- */
function initFilters() {
  var filters = document.querySelectorAll('.filter');
  var empty = document.querySelector('.pub-empty');
  if (!filters.length) return;
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter, visible = 0;
      document.querySelectorAll('.pub').forEach(function (p) {
        var show = (f === 'all') || (p.dataset.type === f);
        p.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      document.querySelectorAll('.pub-year').forEach(function (yr) {
        var any = [].slice.call(yr.querySelectorAll('.pub')).some(function (p) { return p.style.display !== 'none'; });
        yr.style.display = any ? '' : 'none';
      });
      if (empty) empty.hidden = visible !== 0;
    });
  });
}

window.addEventListener('DOMContentLoaded', function () {
  initNetwork(document.getElementById('net'));
  if (document.getElementById('pubs-mount')) initFilters();
});
