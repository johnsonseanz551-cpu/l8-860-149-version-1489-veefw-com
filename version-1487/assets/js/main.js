(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMobileNavigation() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");

        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHeroCarousel() {
        var hero = document.querySelector("[data-hero]");
        var movies = window.HERO_MOVIES || [];

        if (!hero || movies.length === 0) {
            return;
        }

        var background = hero.querySelector("[data-hero-bg]");
        var title = hero.querySelector("[data-hero-title]");
        var description = hero.querySelector("[data-hero-desc]");
        var meta = hero.querySelector("[data-hero-meta]");
        var playLink = hero.querySelector("[data-hero-play]");
        var miniCards = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-index]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        function render(nextIndex) {
            index = nextIndex % movies.length;
            var movie = movies[index];

            if (background) {
                background.style.backgroundImage = "url('" + movie.cover + "')";
            }
            if (title) {
                title.textContent = movie.title;
            }
            if (description) {
                description.textContent = movie.oneLine;
            }
            if (playLink) {
                playLink.href = movie.url;
            }
            if (meta) {
                meta.innerHTML = "";
                [movie.year, movie.region, movie.type].concat(movie.tags || []).slice(0, 6).forEach(function (item) {
                    if (!item) {
                        return;
                    }
                    var span = document.createElement("span");
                    span.textContent = item;
                    meta.appendChild(span);
                });
            }

            miniCards.forEach(function (card) {
                card.classList.toggle("is-active", Number(card.dataset.heroIndex) === index);
            });
            dots.forEach(function (dot) {
                dot.classList.toggle("is-active", Number(dot.dataset.heroDot) === index);
            });
        }

        function start() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                render(index + 1);
            }, 5200);
        }

        miniCards.forEach(function (card) {
            card.addEventListener("click", function (event) {
                event.preventDefault();
                render(Number(card.dataset.heroIndex));
                start();
            });
        });

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                render(Number(dot.dataset.heroDot));
                start();
            });
        });

        render(0);
        start();
    }

    function setupSearchPage() {
        var root = document.querySelector("[data-search-page]");
        var movies = window.MOVIE_DATA || [];

        if (!root || movies.length === 0) {
            return;
        }

        var queryInput = root.querySelector("[data-search-query]");
        var regionSelect = root.querySelector("[data-search-region]");
        var typeSelect = root.querySelector("[data-search-type]");
        var yearSelect = root.querySelector("[data-search-year]");
        var results = root.querySelector("[data-search-results]");
        var note = root.querySelector("[data-search-note]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        function uniqueValues(key) {
            return movies
                .map(function (movie) {
                    return movie[key];
                })
                .filter(Boolean)
                .filter(function (value, index, array) {
                    return array.indexOf(value) === index;
                });
        }

        function fillSelect(select, values, label) {
            if (!select) {
                return;
            }
            select.innerHTML = "";
            var all = document.createElement("option");
            all.value = "";
            all.textContent = label;
            select.appendChild(all);
            values.forEach(function (value) {
                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function card(movie) {
            var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");

            return [
                "<a class="movie-card" href="" + escapeHtml(movie.url) + "">",
                "<div class="poster-wrap">",
                "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">",
                "<div class="poster-overlay"><span class="play-chip">立即观看</span></div>",
                "<span class="badge">" + escapeHtml(movie.region) + "</span>",
                "</div>",
                "<h3>" + escapeHtml(movie.title) + "</h3>",
                "<p>" + escapeHtml(movie.year) + " · " + escapeHtml(movie.type) + "</p>",
                "<div class="tag-row">" + tags + "</div>",
                "</a>"
            ].join("");
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function matches(movie, query, region, type, year) {
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.oneLine,
                (movie.tags || []).join(" ")
            ].join(" ").toLowerCase();

            if (query && haystack.indexOf(query.toLowerCase()) === -1) {
                return false;
            }
            if (region && movie.region !== region) {
                return false;
            }
            if (type && movie.type !== type) {
                return false;
            }
            if (year && movie.year !== year) {
                return false;
            }
            return true;
        }

        function render() {
            var query = queryInput ? queryInput.value.trim() : "";
            var region = regionSelect ? regionSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var matched = movies.filter(function (movie) {
                return matches(movie, query, region, type, year);
            });
            var limited = matched.slice(0, 72);

            if (note) {
                note.textContent = "匹配到 " + matched.length + " 部作品" + (matched.length > limited.length ? "，当前展示前 " + limited.length + " 部" : "");
            }
            if (results) {
                results.innerHTML = limited.map(card).join("");
            }
        }

        fillSelect(regionSelect, uniqueValues("region").sort(), "全部地区");
        fillSelect(typeSelect, uniqueValues("type").sort(), "全部类型");
        fillSelect(yearSelect, uniqueValues("year").sort().reverse(), "全部年份");

        if (queryInput) {
            queryInput.value = initialQuery;
            queryInput.addEventListener("input", render);
        }
        [regionSelect, typeSelect, yearSelect].forEach(function (select) {
            if (select) {
                select.addEventListener("change", render);
            }
        });

        render();
    }

    ready(function () {
        setupMobileNavigation();
        setupHeroCarousel();
        setupSearchPage();
    });
})();
