const elementHtmlStatus = document.getElementById("status");

async function checkDiscordStatus(DISCORD_ID, cacheTime = 15000) {
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
      elementHtmlStatus.innerText = "Gagal mendapatkan status.";
    }
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    elementHtmlStatus.innerText = "Error saat mengambil data.";
  }
}

function updateStatus(data) {
  let statusMessage = "";

  // Status utama (online, idle, dnd, offline)
  const statusText = {
    online: "🟢 Online",
    idle: "🟡 Idle",
    // idle: "🟢 Online",
    dnd: "🔴 Do Not Disturb",
    offline: "⚫ Offline",
  };
  statusMessage = statusText[data.discord_status] || "Unknown";

  // Status Spotify
  let spotifyMessage = "";
  if (data.listening_to_spotify) {
    spotifyMessage = `🎵 <strong>${data.spotify.song}</strong> - ${data.spotify.artist}`;
  }

  let activityMessage = "";
  const otherActivities = data.activities.filter((a) => a.name !== "Spotify");

  if (otherActivities.length > 0) {
    activityMessage = otherActivities
      .slice(0, 2) // Ambil max 2 aktivitas
      .map((activity) => {
        console.log(activity);
        // Safely handle missing assets / large_image
        let rawImage = activity.assets?.large_image ?? null;
        let imageUrl = null;
        let imageElement = "";

        if (rawImage && typeof rawImage === "string") {
          if (rawImage.startsWith("mp:external/")) {
            // Jika URL eksternal, ambil URL sebenarnya
            const parts = rawImage.split("/https/");
            const tail = parts.pop();
            imageUrl = tail ? `https://${tail}` : null;
          } else if (activity.application_id) {
            // Jika ID internal, ambil dari CDN Discord
            imageUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${rawImage}.png`;
          }

          if (imageUrl) {
            imageElement = `<img src="${imageUrl}" alt="Activity Image" width="15" height="15" style="margin-right: 5px">`;
          }
        }

        let message = imageElement;
        // let message = imageElement + `<strong>${activity.name}</strong>`;
        // let message = `<strong>${activity.name}</strong>`;
        if (activity.details) message += `${activity.details}`;
        return message;
      })
      .join(" ");
  }

  // Gabungkan hanya yang ada, tanpa `<br>` berlebihan
  const allMessages = [statusMessage, spotifyMessage, activityMessage].filter(Boolean).join("<br>");
  // const allMessages = '🟢 Online<br>🎵 <strong>Let Down</strong> - Radiohead<br><img src="https://raw.githubusercontent.com/ariafatah0711/win_aria/refs/heads/main/vscode/image/2.png" alt="Activity Image" width="15" height="15" style="margin-right: 5px"><strong>Code</strong> - Editing README.md <br> a'

  elementHtmlStatus.innerHTML = allMessages;
  return allMessages;
}
