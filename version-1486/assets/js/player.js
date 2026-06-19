(function () {
  var activeHls = null;
  var activeSource = "";

  function attachSource(video, source) {
    if (!video || !source || activeSource === source) {
      return;
    }

    activeSource = source;

    if (activeHls) {
      activeHls.destroy();
      activeHls = null;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      activeHls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      activeHls.loadSource(source);
      activeHls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function mount(source) {
    var video = document.getElementById("moviePlayer");
    var button = document.querySelector("[data-player-button]");
    var frame = video ? video.closest(".player-frame") : null;

    if (!video || !source) {
      return;
    }

    var start = function () {
      attachSource(video, source);
      if (button) {
        button.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    };

    if (button) {
      button.addEventListener("click", start);
    }

    if (frame) {
      frame.addEventListener("click", function (event) {
        if (event.target === video && !video.src) {
          start();
        }
      });
    }

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
  }

  window.SitePlayer = {
    mount: mount
  };
})();
