function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function initMobileNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function initHeroSlider() {
  const slider = document.querySelector('[data-hero-slider]');

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
  const nextButton = slider.querySelector('[data-hero-next]');
  const prevButton = slider.querySelector('[data-hero-prev]');
  let current = 0;
  let timer = null;

  if (slides.length <= 1) {
    return;
  }

  const show = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(current + 1), 5000);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      show(current + 1);
      start();
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      show(current - 1);
      start();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      start();
    });
  });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  show(0);
  start();
}

function initCardFilters() {
  const filterBox = document.querySelector('[data-card-filter]');
  const list = document.querySelector('[data-filter-list]');

  if (!filterBox || !list) {
    return;
  }

  const input = filterBox.querySelector('[data-filter-input]');
  const yearSelect = filterBox.querySelector('[data-filter-year]');
  const clearButton = filterBox.querySelector('[data-filter-clear]');
  const cards = Array.from(list.querySelectorAll('[data-card], .ranking-row'));
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';

  if (input && query) {
    input.value = query;
  }

  const apply = () => {
    const keyword = input ? input.value.trim().toLowerCase() : '';
    const year = yearSelect ? yearSelect.value : '';

    cards.forEach((card) => {
      const text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      const cardYear = card.getAttribute('data-year') || '';
      const matchedKeyword = !keyword || text.includes(keyword);
      const matchedYear = !year || cardYear === year;

      card.classList.toggle('filter-hidden', !(matchedKeyword && matchedYear));
    });
  };

  if (input) {
    input.addEventListener('input', apply);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', apply);
  }

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      if (input) {
        input.value = '';
      }

      if (yearSelect) {
        yearSelect.value = '';
      }

      apply();
    });
  }

  apply();
}

export function initPlayer(config) {
  const video = document.getElementById(config.videoId);
  const button = document.getElementById(config.buttonId);
  const shell = document.getElementById(config.shellId);
  let hls = null;
  let started = false;

  if (!video || !button || !config.source) {
    return;
  }

  const play = () => {
    if (!started) {
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(config.source);
        hls.attachMedia(video);
      } else {
        video.src = config.source;
      }
    }

    button.classList.add('is-hidden');
    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        button.classList.remove('is-hidden');
      });
    }
  };

  button.addEventListener('click', play);

  if (shell) {
    shell.addEventListener('click', (event) => {
      if (event.target === shell) {
        play();
      }
    });
  }

  video.addEventListener('play', () => {
    button.classList.add('is-hidden');
  });

  video.addEventListener('pause', () => {
    if (!video.currentTime) {
      button.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', () => {
    if (hls) {
      hls.destroy();
    }
  });
}

ready(() => {
  initMobileNav();
  initHeroSlider();
  initCardFilters();
});
