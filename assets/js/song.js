const musicPlayer = document.getElementById("music-player");
const playIcon = document.getElementById("play-icon");
const pauseIcon = document.getElementById("pause-icon");

const DEFAULT_START_TIME = 15;

function toggleMusic() {
  if (musicPlayer.paused) {
    musicPlayer.play();
    musicPlayer.currentTime = DEFAULT_START_TIME;

    playIcon.style.display = "none";
    pauseIcon.style.display = "inline"; // Ganti ke ikon pause
    localStorage.setItem("music-playing", "true");
  } else {
    musicPlayer.pause();
    playIcon.style.display = "inline"; // Ganti ke ikon play
    pauseIcon.style.display = "none";
    localStorage.setItem("music-playing", "false");
  }
}

// Saat halaman dimuat, cek status musik
window.onload = function () {
  const isMusicPlaying = localStorage.getItem("music-playing") === "true";
  const lastTime = localStorage.getItem("music-time");

  if (isMusicPlaying) {
    playIcon.style.display = "none";
    pauseIcon.style.display = "inline";
    musicPlayer.currentTime = lastTime ? parseFloat(lastTime) : 0;
    musicPlayer.play();
  }
};

// Menyimpan posisi terakhir pemutaran musik ke localStorage
musicPlayer.ontimeupdate = function () {
  localStorage.setItem("music-time", musicPlayer.currentTime);
};
