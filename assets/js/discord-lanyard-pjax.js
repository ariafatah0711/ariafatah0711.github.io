(function () {
  // Discord config akan di-set by inline script di profile.html
  // Fallback ke window.DISCORD_CONFIG atau hardcoded defaults
  const config = window.DISCORD_CONFIG || {};
  const DISCORD_ID = config.discordId || "879547455941779456";
  const CACHE_TIME = config.cacheTime || 15000;

  function initDiscordLanyard() {
    var elementHtmlStatus = document.getElementById("status");
    if (!elementHtmlStatus) return; // Element not on this page

    checkDiscordStatus(DISCORD_ID, CACHE_TIME);
  }

  async function checkDiscordStatus(DISCORD_ID, cacheTime = 15000) {
    var elementHtmlStatus = document.getElementById("status");
    if (!elementHtmlStatus) return;

    const CACHE_KEY = "discordStatusCache";

    try {
      console.log(`fetch ${DISCORD_ID}, ${cacheTime}`);
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTime = parseInt(localStorage.getItem("cacheTime"), 10) || 0;

      // Jika cache masih valid, gunakan cache
      if (cachedData && cachedTime && new Date().getTime() - cachedTime < cacheTime) {
        elementHtmlStatus.innerHTML = cachedData;
        return;
      }

      const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();

      if (data.success) {
        const statusMessage = updateStatus(data.data);

        // Simpan hasilnya di localStorage
        localStorage.setItem(CACHE_KEY, statusMessage);
        localStorage.setItem("cacheTime", new Date().getTime());
      } else {
        if (elementHtmlStatus) elementHtmlStatus.innerText = "Gagal mendapatkan status.";
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      if (elementHtmlStatus) elementHtmlStatus.innerText = "Error saat mengambil data.";
    }
  }

  function updateStatus(data) {
    let statusMessage = "";

    // SVG Icons - standardized sizing
    const svgIcons = {
      online: '<svg width="12" height="12" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#3ba55d"/></svg>',
      idle: '<svg width="12" height="12" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#faa81a"/><circle cx="12" cy="12" r="5" fill="var(--body-bg)"/></svg>',
      dnd: '<svg width="12" height="12" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#ed4245"/><rect x="4" y="7" width="8" height="2" fill="var(--body-bg)"/></svg>',
      offline: '<svg width="12" height="12" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#747f8d"/></svg>',
      music:
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="#1db954"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 14h-2v-4h-4v4H8V8h2v4h4V8h2v8z"/></svg>',
      app: '<svg width="12" height="12" viewBox="0 0 24 24" fill="var(--primary-font-color)"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>',
    };

    // Status utama (online, idle, dnd, offline)
    const statusText = {
      online: "Online",
      idle: "Idle",
      dnd: "Do Not Disturb",
      offline: "Offline",
    };
    const statusIcon = svgIcons[data.discord_status] || svgIcons.offline;
    statusMessage = `<span class="discord-status">${statusIcon}${statusText[data.discord_status] || "Unknown"}</span>`;

    // Status Spotify
    let spotifyMessage = "";
    if (data.listening_to_spotify) {
      console.log("Spotify detected:", data.spotify);
      spotifyMessage = `
        <span class="discord-activity">
          ${svgIcons.music}
          <strong class="song-title">${data.spotify.song}</strong>
          <span class="song-artist"> - ${data.spotify.artist}</span>
        </span>
      `;
    }

    let activityMessage = "";
    const otherActivities = data.activities.filter((a) => a.name !== "Spotify" && a.details);
    console.log("Other activities:", otherActivities);

    if (otherActivities.length > 0) {
      activityMessage = otherActivities
        .slice(0, 2)
        .map((activity) => {
          let imageElement = "";

          if (activity.assets && activity.assets.large_image) {
            const imageUrl = activity.assets.large_image.startsWith("http")
              ? activity.assets.large_image
              : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
            imageElement = `<img src="${imageUrl}" alt="${activity.name}" class="discord-app-icon">`;
          } else {
            imageElement = svgIcons.app;
          }

          let message = `<span class="discord-activity">${imageElement}${activity.details}</span>`;
          return message;
        })
        .join("");
    }

    // Gabungkan dalam container untuk flex layout
    const messages = [statusMessage, spotifyMessage, activityMessage].filter(Boolean);
    const allMessages = messages.length > 0 ? messages.join("") : "Status tidak tersedia";

    var elementHtmlStatus = document.getElementById("status");
    if (elementHtmlStatus) elementHtmlStatus.innerHTML = allMessages;
    return allMessages;
  }

  window.initDiscordLanyard = initDiscordLanyard;
  document.addEventListener("DOMContentLoaded", initDiscordLanyard);
})();
