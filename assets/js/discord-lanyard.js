const elementHtmlStatus = document.getElementById("status");

async function checkDiscordStatus(DISCORD_ID, cacheTime = 15000) {
  const CACHE_KEY = "discordStatusCache";

  try {
    console.log(`fetch ${DISCORD_ID}, ${cacheTime}`);
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem("cacheTime");

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
    // idle: "🟡 Idle",
    idle: "🟢 Online",
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
        let imageUrl = activity.assets.large_image;

        if (imageUrl.startsWith("mp:external/")) {
          // Jika URL eksternal, ambil URL sebenarnya
          imageUrl = imageUrl.split("/https/").pop();
          imageUrl = "https://" + imageUrl;
        } else {
          // Jika ID internal, ambil dari CDN Discord
          imageUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${imageUrl}.png`;
        }

        let imageElement = `<img src="${imageUrl}" alt="Activity Image" width="15" height="15" style="margin-right: 5px">`;

        let message = imageElement + `<strong>${activity.name}</strong>`;
        // let message = `<strong>${activity.name}</strong>`;
        if (activity.details) message += ` - ${activity.details}`;
        return message;
      })
      .join("<br>"); // Gabungkan dengan baris baru
  }

  // Gabungkan hanya yang ada, tanpa `<br>` berlebihan
  const allMessages = [statusMessage, spotifyMessage, activityMessage].filter(Boolean).join("<br>");

  elementHtmlStatus.innerHTML = allMessages;
  return allMessages;
}
