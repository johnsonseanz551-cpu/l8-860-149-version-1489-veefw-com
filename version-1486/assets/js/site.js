(function () {
  var ready = function (fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      var show = function (nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          var active = slideIndex === index;
          slide.classList.toggle("active", active);
          slide.setAttribute("aria-hidden", active ? "false" : "true");
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      };

      var start = function () {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5600);
      };

      var stop = function () {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      };

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

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var scope = panel.nextElementSibling && panel.nextElementSibling.hasAttribute("data-filter-scope") ? panel.nextElementSibling : document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-movie-card"));
      var input = panel.querySelector(".js-filter-input");
      var region = panel.querySelector(".js-filter-region");
      var year = panel.querySelector(".js-filter-year");
      var genre = panel.querySelector(".js-filter-genre");
      var empty = panel.querySelector("[data-filter-empty]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (query && input) {
        input.value = query;
      }

      var normalize = function (value) {
        return (value || "").toString().toLowerCase().trim();
      };

      var apply = function () {
        var keyword = normalize(input ? input.value : "");
        var selectedRegion = normalize(region ? region.value : "");
        var selectedYear = normalize(year ? year.value : "");
        var selectedGenre = normalize(genre ? genre.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var title = normalize(card.getAttribute("data-title"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardGenre = normalize(card.getAttribute("data-genre"));
          var ok = true;

          if (keyword && title.indexOf(keyword) === -1 && cardGenre.indexOf(keyword) === -1 && cardRegion.indexOf(keyword) === -1) {
            ok = false;
          }
          if (selectedRegion && cardRegion !== selectedRegion) {
            ok = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            ok = false;
          }
          if (selectedGenre && cardGenre.indexOf(selectedGenre) === -1) {
            ok = false;
          }

          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      };

      [input, region, year, genre].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });

      apply();
    });
  });
})();
