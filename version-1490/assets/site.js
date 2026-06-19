(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var toggle = qs('.mobile-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    var prev = qs('.hero-prev');
    var next = qs('.hero-next');
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
        start();
      });
    });
    start();
  }

  function initFilters() {
    var scope = qs('[data-filter-scope]');
    if (!scope) {
      return;
    }
    var buttons = qsa('button', scope);
    var cards = qsa('.movie-card');
    var state = {
      type: 'all',
      year: ''
    };

    function apply() {
      cards.forEach(function (card) {
        var matchesType = state.type === 'all' || (card.getAttribute('data-type') || '').indexOf(state.type) !== -1;
        var matchesYear = !state.year || card.getAttribute('data-year') === state.year;
        card.classList.toggle('is-hidden', !(matchesType && matchesYear));
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        if (button.hasAttribute('data-filter-reset')) {
          state.type = 'all';
          state.year = '';
          buttons.forEach(function (item) {
            item.classList.remove('is-active');
          });
          var allButton = qs('[data-filter-type="all"]', scope);
          if (allButton) {
            allButton.classList.add('is-active');
          }
          apply();
          return;
        }
        if (button.hasAttribute('data-filter-type')) {
          state.type = button.getAttribute('data-filter-type');
          qsa('[data-filter-type]', scope).forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
        }
        if (button.hasAttribute('data-filter-year')) {
          state.year = button.getAttribute('data-filter-year');
          qsa('[data-filter-year]', scope).forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
        }
        apply();
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card movie-card-list">' +
        '<a class="card-image" href="' + escapeHtml(movie.url) + '">' +
          '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '</a>' +
        '<div class="card-body">' +
          '<a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>' +
          '<div class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function initSearch() {
    var results = qs('[data-search-results]');
    var status = qs('[data-search-status]');
    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var input = qs('.page-search input[name="q"]');
    if (input && query) {
      input.value = params.get('q') || '';
    }
    if (!query) {
      return;
    }
    var words = query.split(/\s+/).filter(Boolean);
    var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      var haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.oneLine].concat(movie.tags || []).join(' ').toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);
    if (status) {
      status.textContent = matched.length ? '搜索结果：' + (params.get('q') || '') : '未找到相关影片';
    }
    results.innerHTML = matched.length ? matched.map(renderSearchCard).join('') : '<p class="empty-state">请尝试更换关键词。</p>';
  }

  function initPlayers() {
    qsa('.player-shell').forEach(function (shell) {
      var video = qs('video', shell);
      var button = qs('.play-overlay', shell);
      var stream = shell.getAttribute('data-stream');
      var hls = null;
      if (!video || !stream) {
        return;
      }

      function attachStream() {
        if (video.getAttribute('data-ready') === 'true') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        video.setAttribute('data-ready', 'true');
      }

      function play() {
        attachStream();
        shell.classList.add('is-playing');
        video.play().catch(function () {});
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          play();
        });
      }
      video.addEventListener('click', function () {
        if (!video.getAttribute('data-ready')) {
          play();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
    initSearch();
    initPlayers();
  });
})();
