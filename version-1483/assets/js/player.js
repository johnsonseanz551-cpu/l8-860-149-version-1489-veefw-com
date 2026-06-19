(function () {
    function playVideo(video) {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    function attachHls(video, source, onReady) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            onReady();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                onReady();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    video.src = source;
                }
            });
            return;
        }

        video.src = source;
        onReady();
    }

    window.initMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var button = document.getElementById(config.buttonId);
        var started = false;
        if (!video || !button || !config.source) {
            return;
        }

        function start() {
            if (started) {
                playVideo(video);
                return;
            }
            started = true;
            button.classList.add("is-hidden");
            attachHls(video, config.source, function () {
                playVideo(video);
            });
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
    };
})();
