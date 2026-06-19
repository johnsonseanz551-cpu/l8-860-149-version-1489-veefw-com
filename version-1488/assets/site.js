(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", menu.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }

      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupHeaderSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".site-search-form"));

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";

        if (query) {
          window.location.href = "search.html?q=" + encodeURIComponent(query);
        }
      });
    });
  }

  function setupFilters() {
    var input = document.querySelector("[data-page-filter]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    var active = "all";

    if (!cards.length) {
      return;
    }

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function apply() {
      var query = input ? normalize(input.value.trim()) : "";

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var typeMatched = active === "all" || cardType.indexOf(active) !== -1 || cardGenre.indexOf(active) !== -1 || haystack.indexOf(active) !== -1;
        var queryMatched = !query || haystack.indexOf(query) !== -1;
        card.style.display = typeMatched && queryMatched ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        active = normalize(chip.getAttribute("data-filter-chip"));
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        apply();
      });
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-page-input]");

    if (!results || typeof movieSearchIndex === "undefined") {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
      input.addEventListener("input", function () {
        render(input.value.trim());
      });
    }

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function render(query) {
      var cleaned = normalize(query);
      var pool = movieSearchIndex;

      if (cleaned) {
        pool = movieSearchIndex.filter(function (movie) {
          return normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.oneLine,
            movie.category
          ].join(" ")).indexOf(cleaned) !== -1;
        });
      }

      var limited = pool.slice(0, 60);

      if (!limited.length) {
        results.innerHTML = '<div class="empty-result">未找到相关影片</div>';
        return;
      }

      results.innerHTML = limited.map(function (movie) {
        return [
          '<article class="movie-card">',
          '<a class="poster-link" href="' + movie.url + '">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 在线观看" loading="lazy">',
          '<span class="movie-badge">' + escapeHtml(movie.year) + '</span>',
          '<span class="movie-type">' + escapeHtml(movie.type) + '</span>',
          '<span class="movie-play">▶</span>',
          '</a>',
          '<div class="movie-card-body">',
          '<a class="movie-card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
          '<div class="movie-card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
          '<p class="movie-card-desc">' + escapeHtml(movie.oneLine) + '</p>',
          '</div>',
          '</article>'
        ].join("");
      }).join("");
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"]/g, function (item) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[item];
      });
    }

    render(initialQuery);
  }

  window.initMoviePlayer = function (videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var loaded = false;
    var hls = null;
    var hlsReady = false;
    var pendingPlay = false;

    if (!video) {
      return;
    }

    function loadSource() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        hlsReady = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          hlsReady = true;
          if (pendingPlay) {
            playNow();
          }
        });
        return;
      }

      video.src = sourceUrl;
      hlsReady = true;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function playNow() {
      hideOverlay();
      pendingPlay = false;
      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    function startPlayback() {
      loadSource();
      hideOverlay();

      if (hls && !hlsReady) {
        pendingPlay = true;
        return;
      }

      playNow();
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", hideOverlay);
  };

  onReady(function () {
    setupMenu();
    setupHero();
    setupHeaderSearch();
    setupFilters();
    setupSearchPage();
  });
})();
