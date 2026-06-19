(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length || !dots.length) {
            return;
        }
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
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
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

        var hero = document.querySelector(".hero-slider");
        if (hero) {
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
        }
        show(0);
        start();
    }

    function setupFilters() {
        var searchInput = document.querySelector("[data-filter-search]");
        var categorySelect = document.querySelector("[data-filter-category]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
        var empty = document.querySelector("[data-empty-state]");
        if (!cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }

        function apply() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var category = categorySelect ? categorySelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var matchesQuery = !query || card.dataset.search.indexOf(query) !== -1;
                var matchesCategory = !category || card.dataset.category === category;
                var matchesYear = !year || card.dataset.year === year;
                var show = matchesQuery && matchesCategory && matchesYear;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [searchInput, categorySelect, yearSelect].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
        apply();
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
