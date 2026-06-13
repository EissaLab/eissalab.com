/* Eissa Lab — render page content from /assets/data/*.json
   Edit the JSON files to manage content; no HTML changes needed. */
(function () {
  var DATA = 'assets/data/';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  // supports **bold** and *italic* in plain-text fields
  function rich(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }
  function nl(s) { return esc(s).replace(/\n/g, '<br>'); }
  function ext(href) { return /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''; }

  function getJSON(file) {
    return fetch(DATA + file, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(file + ' ' + r.status);
      return r.json();
    });
  }
  function observe(scope) { if (window.eissaObserveReveals) window.eissaObserveReveals(scope); }
  function fail(mount, what) {
    if (!mount) return;
    mount.innerHTML = '<p style="color:var(--muted);font-family:var(--mono);font-size:.9rem;padding:24px 0;">'
      + 'Couldn\u2019t load ' + what + '. If you opened this page directly from disk (file://), '
      + 'run it through a local server or view it on GitHub Pages \u2014 browsers block loading data files over file://.</p>';
  }

  /* ---------- NEWS (home) ---------- */
  var newsMount = document.getElementById('news-mount');
  if (newsMount) {
    getJSON('news.json').then(function (items) {
      newsMount.innerHTML = '';
      items.forEach(function (n, i) {
        var li = document.createElement('li');
        li.className = 'news-item reveal' + (i ? ' d' + Math.min(i, 4) : '');
        li.innerHTML =
          '<span class="news-date">' + esc(n.date) + '</span>' +
          '<div class="news-body"><h3 class="h3">' + esc(n.title) + '</h3><p>' + esc(n.body) + '</p></div>' +
          (n.tag ? '<a class="news-tag" href="' + esc(n.tag.href) + '">' + esc(n.tag.label) + '</a>' : '');
        newsMount.appendChild(li);
      });
      observe(newsMount);
    }).catch(function (e) { console.warn(e); fail(newsMount, 'news'); });
  }

  /* ---------- MEMBERS ---------- */
  var piMount = document.getElementById('pi-mount');
  var teamGrid = document.getElementById('team-grid');
  if (piMount || teamGrid) {
    getJSON('members.json').then(function (data) {
      if (piMount && data.pi) {
        var pi = data.pi;
        var photo = pi.photo
          ? '<img src="' + esc(pi.photo) + '" alt="' + esc(pi.name) + '">'
          : '<span class="ph-initials">' + esc(pi.initials || '') + '</span><span class="ph-tag">Photo</span>';
        var affil = (pi.affiliations || []).map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('');
        var links = (pi.links || []).map(function (l) {
          return '<a class="chip" href="' + esc(l.href) + '"' + ext(l.href) + '>' + esc(l.label) + '</a>';
        }).join('');
        piMount.innerHTML =
          '<article class="pi-card reveal"><div class="pi-photo">' + photo + '</div>' +
          '<div class="pi-info"><span class="pill">' + esc(pi.badge || 'Principal Investigator') + '</span>' +
          '<h2 class="h2">' + esc(pi.name) + '</h2><p class="pi-role">' + esc(pi.title) + '</p>' +
          '<ul class="pi-affil">' + affil + '</ul><div class="pi-links">' + links + '</div></div></article>';
        observe(piMount);
      }
      if (teamGrid && data.members) {
        var joinCard = document.getElementById('join-card');
        data.members.forEach(function (m, i) {
          var art = document.createElement('article');
          art.className = 'card member-card reveal' + (i ? ' d' + Math.min(i, 4) : '');
          var photo = m.photo
            ? '<img src="' + esc(m.photo) + '" alt="' + esc(m.name) + '">'
            : '<span class="ph-initials">' + esc(m.initials || '') + '</span><span class="ph-tag">Photo</span>';
          art.innerHTML =
            '<div class="m-photo grad-' + esc(m.gradient || 'a') + '">' + photo + '</div>' +
            '<div class="m-body"><h3 class="h3">' + esc(m.name) + '</h3>' +
            '<p class="m-role">' + esc(m.role) + '</p>' +
            '<p class="m-dept">' + nl(m.dept) + '</p>' +
            '<p class="m-blurb">' + esc(m.blurb) + '</p></div>';
          teamGrid.insertBefore(art, joinCard);
        });
        observe(teamGrid);
      }
    }).catch(function (e) { console.warn(e); fail(piMount || teamGrid, 'lab members'); });
  }

  /* ---------- PUBLICATIONS ---------- */
  var pubsMount = document.getElementById('pubs-mount');
  if (pubsMount) {
    getJSON('publications.json').then(function (data) {
      var entries = (data.entries || []).slice();
      var byYear = {};
      entries.forEach(function (e) { (byYear[e.year] = byYear[e.year] || []).push(e); });
      var years = Object.keys(byYear).sort(function (a, b) { return b - a; });
      var typeLabel = { journal: 'Journal', preprint: 'Preprint', conf: 'Conference' };
      pubsMount.innerHTML = '';
      years.forEach(function (y) {
        var wrap = document.createElement('div');
        wrap.className = 'pub-year reveal';
        var list = byYear[y].map(function (p) {
          var links = (p.links || []).map(function (l) {
            return '<a href="' + esc(l.href) + '" class="pub-lnk"' + ext(l.href) + '>' + esc(l.label) + '</a>';
          }).join('');
          return '<li class="pub" data-type="' + esc(p.type) + '">' +
            '<span class="pub-type t-' + esc(p.type) + '">' + esc(typeLabel[p.type] || p.type) + '</span>' +
            '<div class="pub-main"><h3 class="pub-title">' + esc(p.title) + '</h3>' +
            '<p class="pub-authors">' + rich(p.authors) + '</p></div>' +
            '<div class="pub-links">' + links + '</div></li>';
        }).join('');
        wrap.innerHTML = '<span class="year-label">' + esc(y) + '</span><ol class="pub-list">' + list + '</ol>';
        pubsMount.appendChild(wrap);
      });
      observe(pubsMount);
      initFilters();
    }).catch(function (e) { console.warn(e); fail(pubsMount, 'publications'); });
  }

  function initFilters() {
    var filters = document.querySelectorAll('.filter');
    var empty = document.querySelector('.pub-empty');
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
})();
