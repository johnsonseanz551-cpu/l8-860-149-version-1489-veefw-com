(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function openSearch(query) {
        var value = String(query || '').trim();
        if (value) {
            window.location.href = './search.html?q=' + encodeURIComponent(value);
        } else {
            window.location.href = './search.html';
        }
    }

    function initMenu() {
        var button = qs('.menu-button');
        var panel = qs('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
        });
    }

    function initSearchForms() {
        qsa('.search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input[name="q"]', form);
                openSearch(input ? input.value : '');
            });
        });
    }

    function initHero() {
        var hero = qs('.hero-shell');
        if (!hero) {
            return;
        }
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('.hero-dot', hero);
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        if (slides.length > 1) {
            start();
        }
    }

    function initInlineFilters() {
        qsa('[data-card-filter]').forEach(function (input) {
            var targetSelector = input.getAttribute('data-card-filter');
            var cards = qsa(targetSelector);
            var typeSelect = qs('[data-type-filter="' + targetSelector + '"]');
            function apply() {
                var query = normalize(input.value);
                var type = typeSelect ? normalize(typeSelect.value) : '';
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchType = !type || cardType === type;
                    card.style.display = matchQuery && matchType ? '' : 'none';
                });
            }
            input.addEventListener('input', apply);
            if (typeSelect) {
                typeSelect.addEventListener('change', apply);
            }
        });
    }

    function renderSearchResults() {
        var mount = qs('#search-results');
        var input = qs('#search-page-input');
        if (!mount || !input || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        function card(movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="./' + escapeHtml(movie.file) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="watch-badge">立即观看</span>',
                '</a>',
                '<div class="movie-card-body">',
                '<p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
                '<h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '<p class="movie-brief">' + escapeHtml(movie.brief) + '</p>',
                '<div class="tag-row">' + tags + '</div>',
                '</div>',
                '</article>'
            ].join('');
        }
        function render() {
            var query = normalize(input.value);
            if (!query) {
                mount.innerHTML = '<div class="empty-state">输入片名、地区、年份或类型即可查找影片。</div>';
                return;
            }
            var results = window.SEARCH_MOVIES.filter(function (movie) {
                return normalize(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year + ' ' + movie.genre + ' ' + movie.tags.join(' ')).indexOf(query) !== -1;
            }).slice(0, 80);
            if (!results.length) {
                mount.innerHTML = '<div class="empty-state">没有找到相关影片。</div>';
                return;
            }
            mount.innerHTML = '<div class="movie-grid">' + results.map(card).join('') + '</div>';
        }
        input.addEventListener('input', render);
        var form = qs('#search-page-form');
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                render();
            });
        }
        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initSearchForms();
        initHero();
        initInlineFilters();
        renderSearchResults();
    });
})();
