(function () {
  function setupMoviePlayer(videoSource) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playerOverlay");
    var hlsInstance = null;

    if (!video || !videoSource) {
      return;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function bindSource() {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(videoSource);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoSource;
      } else {
        video.src = videoSource;
      }
    }

    function startPlayback() {
      hideOverlay();
      if (!video.src && !(hlsInstance && hlsInstance.url)) {
        bindSource();
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    bindSource();

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", hideOverlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
