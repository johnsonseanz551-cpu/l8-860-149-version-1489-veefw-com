(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function submitSearch(form) {
    var input = qs("input[name='q']", form);
    var keyword = input ? input.value.trim() : "";
    if (keyword) {
      window.location.href = "./search.html?q=" + encodeURIComponent(keyword);
    } else {
      window.location.href = "./search.html";
    }
  }

  qsa(".site-search").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      submitSearch(form);
    });
  });

  var toggle = qs(".mobile-toggle");
  var panel = qs(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  var slides = qsa(".hero-slide");
  var dots = qsa(".hero-dot");
  if (slides.length > 1) {
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function applyCardFilter(root) {
    var cards = qsa("[data-card]", root);
    var buttons = qsa("[data-filter-value]", root);
    var input = qs("[data-local-search]", root);
    var active = "all";
    var searchValue = "";

    function update() {
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchesButton = active === "all" || text.indexOf(active) !== -1;
        var matchesSearch = !searchValue || text.indexOf(searchValue) !== -1;
        var isVisible = matchesButton && matchesSearch;
        card.style.display = isVisible ? "" : "none";
        if (isVisible) {
          visible += 1;
        }
      });
      root.classList.toggle("no-results", visible === 0);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        active = normalize(button.getAttribute("data-filter-value"));
        update();
      });
    });

    if (input) {
      input.addEventListener("input", function () {
        searchValue = normalize(input.value);
        update();
      });
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
        searchValue = normalize(query);
        update();
      }
    }
  }

  qsa("[data-filter-root]").forEach(function (root) {
    applyCardFilter(root);
  });
})();

function bindMoviePlayer(source) {
  var video = document.getElementById("movie-player");
  var layer = document.querySelector(".player-layer");
  var button = document.querySelector(".play-button");
  var started = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function safePlay() {
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  function start() {
    if (layer) {
      layer.classList.add("is-hidden");
    }

    if (!started) {
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        safePlay();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls();
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(source);
        });
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          safePlay();
        });
      } else {
        video.src = source;
        safePlay();
      }
    } else {
      safePlay();
    }
  }

  if (layer) {
    layer.addEventListener("click", start);
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      start();
    });
  }

  video.addEventListener("click", function () {
    if (!started || video.paused) {
      start();
    }
  });
}
