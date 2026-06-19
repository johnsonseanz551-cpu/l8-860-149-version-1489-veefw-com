(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function yearMatches(filter, yearValue) {
    if (filter === "all") {
      return true;
    }
    var year = parseInt(yearValue, 10);
    if (filter === "2020s") {
      return year >= 2020 && year <= 2029;
    }
    if (filter === "2010s") {
      return year >= 2010 && year <= 2019;
    }
    if (filter === "older") {
      return year < 2010;
    }
    return String(yearValue) === filter;
  }

  function setupMobileNav() {
    var toggle = document.querySelector(".mobile-nav-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    panels.forEach(function (panel) {
      var searchInput = panel.querySelector(".js-card-search");
      var typeFilter = panel.querySelector(".js-type-filter");
      var yearFilter = panel.querySelector(".js-year-filter");
      var categoryFilter = panel.querySelector(".js-category-filter");
      var cards = Array.prototype.slice.call(panel.querySelectorAll(".movie-card"));
      var emptyState = panel.querySelector(".js-empty-state");

      function applyFilters() {
        var query = normalize(searchInput ? searchInput.value : "");
        var typeValue = normalize(typeFilter ? typeFilter.value : "all");
        var yearValue = yearFilter ? yearFilter.value : "all";
        var categoryValue = normalize(categoryFilter ? categoryFilter.value : "all");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(" "));
          var typeText = normalize(card.dataset.type);
          var genreText = normalize(card.dataset.genre);
          var categoryText = normalize(card.querySelector(".movie-meta span") ? card.querySelector(".movie-meta span").textContent : "");
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchType = typeValue === "all" || typeText.indexOf(typeValue) !== -1 || genreText.indexOf(typeValue) !== -1;
          var matchYear = yearMatches(yearValue, card.dataset.year);
          var matchCategory = categoryValue === "all" || categoryText === categoryValue;
          var isVisible = matchQuery && matchType && matchYear && matchCategory;
          card.classList.toggle("is-hidden", !isVisible);
          if (isVisible) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      [searchInput, typeFilter, yearFilter, categoryFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && searchInput) {
        searchInput.value = q;
      }
      applyFilters();
    });
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
  });
})();
