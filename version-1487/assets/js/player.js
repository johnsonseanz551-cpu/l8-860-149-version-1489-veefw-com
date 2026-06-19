import { H as Hls } from "./hls-dru42stk.js";

document.addEventListener("DOMContentLoaded", function () {
    var video = document.querySelector("[data-hls-player]");
    var button = document.querySelector("[data-player-start]");
    var status = document.querySelector("[data-player-status]");
    var hlsInstance = null;
    var sourceBound = false;

    if (!video) {
        return;
    }

    var source = video.dataset.src;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function bindSource() {
        if (sourceBound || !source) {
            return;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus("播放源已就绪，正在缓冲高清内容。");
            });
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus("播放遇到网络或媒体错误，请刷新页面后重试。");
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            setStatus("浏览器原生 HLS 播放已就绪。");
        } else {
            video.src = source;
            setStatus("当前浏览器可能不支持 HLS，请使用新版 Chrome、Edge、Safari 或移动端浏览器。");
        }

        sourceBound = true;
    }

    function playVideo() {
        bindSource();
        video.controls = true;

        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                setStatus("已加载播放源，请点击播放器上的播放键继续观看。");
            });
        }

        if (button) {
            button.style.display = "none";
        }
    }

    if (button) {
        button.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
        if (button) {
            button.style.display = "none";
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
});
