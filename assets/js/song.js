const DEFAULT_START_TIME = 15;

function getSongEls() {
  return {
    switcher: document.getElementById("music-switcher"),
    musicPlayer: document.getElementById("music-player"),
    playIcon: document.getElementById("play-icon"),
    pauseIcon: document.getElementById("pause-icon"),
  };
}

function setIconsPlaying(playIcon, pauseIcon, isPlaying) {
  if (!playIcon || !pauseIcon) return;
  playIcon.style.display = isPlaying ? "none" : "inline";
  pauseIcon.style.display = isPlaying ? "inline" : "none";
}

function toggleMusic() {
  const { musicPlayer, playIcon, pauseIcon } = getSongEls();
  if (!musicPlayer) return;

  if (musicPlayer.paused) {
    musicPlayer.play();
    if (!Number.isFinite(musicPlayer.currentTime) || musicPlayer.currentTime < DEFAULT_START_TIME) {
      musicPlayer.currentTime = DEFAULT_START_TIME;
    }
    setIconsPlaying(playIcon, pauseIcon, true);
    localStorage.setItem("music-playing", "true");
  } else {
    musicPlayer.pause();
    setIconsPlaying(playIcon, pauseIcon, false);
    localStorage.setItem("music-playing", "false");
  }
}

function restoreMusicState() {
  const { musicPlayer, playIcon, pauseIcon } = getSongEls();
  if (!musicPlayer) return;

  const isMusicPlaying = localStorage.getItem("music-playing") === "true";
  const lastTime = localStorage.getItem("music-time");

  if (isMusicPlaying) {
    setIconsPlaying(playIcon, pauseIcon, true);
    musicPlayer.currentTime = lastTime ? parseFloat(lastTime) : 0;
    musicPlayer.play();
  } else {
    setIconsPlaying(playIcon, pauseIcon, false);
  }

  if (!musicPlayer.dataset.bound) {
    musicPlayer.dataset.bound = "true";
    musicPlayer.addEventListener("timeupdate", function () {
      localStorage.setItem("music-time", String(musicPlayer.currentTime));
    });
  }
}

function bindSongControls() {
  const { switcher } = getSongEls();
  if (!switcher) return;
  if (switcher.dataset.bound === "true") return;
  switcher.dataset.bound = "true";

  switcher.addEventListener("click", function (e) {
    e.preventDefault();
    toggleMusic();
  });

  switcher.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleMusic();
    }
  });
}

function initSong() {
  bindSongControls();
  restoreMusicState();
}

// Backward compatibility for any remaining inline calls
window.toggleMusic = toggleMusic;

window.addEventListener("load", initSong);
document.addEventListener("app:page-load", initSong);
