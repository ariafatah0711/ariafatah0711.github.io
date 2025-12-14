(function () {
  function initSongPlayer() {
    var musicPlayer = document.getElementById("music-player");
    var playIcon = document.getElementById("play-icon");
    var pauseIcon = document.getElementById("pause-icon");

    if (!musicPlayer || !playIcon || !pauseIcon) return; // Song player not on this page

    const DEFAULT_START_TIME = 15;

    function toggleMusic() {
      if (musicPlayer.paused) {
        musicPlayer.play();
        musicPlayer.currentTime = DEFAULT_START_TIME;
        playIcon.style.display = "none";
        pauseIcon.style.display = "inline";
        localStorage.setItem("music-playing", "true");
      } else {
        musicPlayer.pause();
        playIcon.style.display = "inline";
        pauseIcon.style.display = "none";
        localStorage.setItem("music-playing", "false");
      }
    }

    // Attach toggle to play/pause button (if it exists)
    var playPauseBtn = document.getElementById("play-pause-btn");
    if (playPauseBtn) {
      playPauseBtn.removeEventListener("click", toggleMusic); // Clear old listener
      playPauseBtn.addEventListener("click", toggleMusic);
    }

    // Restore playback state from localStorage
    const isMusicPlaying = localStorage.getItem("music-playing") === "true";
    const lastTime = localStorage.getItem("music-time");

    if (isMusicPlaying) {
      playIcon.style.display = "none";
      pauseIcon.style.display = "inline";
      musicPlayer.currentTime = lastTime ? parseFloat(lastTime) : 0;
      musicPlayer.play();
    }

    // Save playback time
    if (musicPlayer.ontimeupdate === null) {
      musicPlayer.ontimeupdate = function () {
        localStorage.setItem("music-time", musicPlayer.currentTime);
      };
    }
  }

  window.initSongPlayer = initSongPlayer;
  document.addEventListener("DOMContentLoaded", initSongPlayer);
})();
