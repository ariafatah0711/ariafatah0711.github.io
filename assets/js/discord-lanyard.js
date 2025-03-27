// async function checkDiscordStatus(DISCORD_ID, cacheTime = 60000) {
//   const CACHE_KEY = "discordStatusCache";
//   console.log(`cache time: ${cacheTime}`);

//   try {
//     const cachedData = localStorage.getItem(CACHE_KEY);
//     const cachedTime = localStorage.getItem("cacheTime");

//     // Jika cache masih valid (< 1 menit), gunakan cache
//     if (cachedData && cachedTime && new Date().getTime() - cachedTime < cacheTime) {
//       document.getElementById("status").innerHTML = cachedData;
//       return;
//     }

//     // Fetch data dari Lanyard API
//     const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);

//     console.log("fetch lanyard!");
//     const data = await response.json();
//     console.log(data);

//     if (data.success) {
//       const status = data.data.discord_status;
//       const statusText = {
//         online: "🟢 Online",
//         idle: "🟡 Idle",
//         dnd: "🔴 Do Not Disturb",
//         offline: "⚫ Offline",
//       };

//       let statusMessage = statusText[status] || "Unknown";

//       // Cek apakah sedang mendengarkan Spotify
//       if (data.data.listening_to_spotify) {
//         const song = data.data.spotify.song;
//         const artist = data.data.spotify.artist;
//         statusMessage += `<br> 🎵 <strong>${song}</strong> - ${artist}`;
//       }

//       // Cek apakah ada aktivitas lain (game atau aplikasi)
//       const activities = data.data.activities;
//       if (activities.length > 0) {
//         activities.forEach((activity) => {
//           if (activity.name !== "Spotify") {
//             // Jangan tampilkan Spotify dua kali
//             statusMessage += `<br> 🎮 <strong>${activity.name}</strong>`;
//             if (activity.details) statusMessage += ` - ${activity.details}`;
//             if (activity.state) statusMessage += ` (${activity.state})`;
//           }
//         });
//       }

//       // Perbarui elemen status di dalam <a> dan simpan di localStorage
//       document.getElementById("status").innerHTML = statusMessage;
//       localStorage.setItem(CACHE_KEY, statusMessage);
//       localStorage.setItem("cacheTime", new Date().getTime()); // Menyimpan waktu cache
//     } else {
//       document.getElementById("status").innerText = "Gagal mendapatkan status.";
//     }
//   } catch (error) {
//     document.getElementById("status").innerText = "Error saat mengambil data.";
//   }
// }

// document.addEventListener("DOMContentLoaded", () => {
//   // let discordId = "{{ site.app.show_discord.discord_id }}";
//   // let cacheTime = "{{ site.app.show_discord.cacheTime }}";
//   // if (!cacheTime) cacheTime = undefined;
//   // checkDiscordStatus(discordId, cacheTime);
// });

// async function checkDiscordStatus(DISCORD_ID, cacheTime = 60000) {
//   try {
//     console.log(`fetch ${DISCORD_ID}, ${cacheTime}`);
//     const cachedData = localStorage.getItem(CACHE_KEY);
//     const cachedTime = localStorage.getItem("cacheTime");

//     // Jika cache masih valid (< 1 menit), gunakan cache
//     if (cachedData && cachedTime && new Date().getTime() - cachedTime < cacheTime) {
//       document.getElementById("status").innerHTML = cachedData;
//       return;
//     }

//     const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
//     console.log(response);
//     const data = await response.json();
//     console.log(data);

//     if (data.success) {
//       updateStatus(data.data);
//       localStorage.setItem(CACHE_KEY, statusMessage);
//       localStorage.setItem("cacheTime", new Date().getTime());
//     } else {
//       document.getElementById("status").innerText = "Gagal mendapatkan status.";
//     }
//   } catch (error) {
//     document.getElementById("status").innerText = "Error saat mengambil data.";
//   }
// }

// function updateStatus(data) {
//   // Status utama (online, idle, dnd, offline)
//   const statusText = {
//     online: "🟢 Online",
//     idle: "🟡 Idle",
//     dnd: "🔴 Do Not Disturb",
//     offline: "⚫ Offline",
//   };
//   document.getElementById("status").innerText = statusText[data.discord_status] || "Unknown";

//   // Status Spotify
//   if (data.listening_to_spotify) {
//     document.getElementById("spotify-status").innerHTML = `🎵 <strong>${data.spotify.song}</strong> - ${data.spotify.artist}`;
//   } else {
//     document.getElementById("spotify-status").innerText = ""; // Kosongin kalau gak ada
//   }

//   // Status aplikasi/game lain
//   const otherActivities = data.activities.filter((a) => a.name !== "Spotify");
//   if (otherActivities.length > 0) {
//     const activity = otherActivities[0]; // Ambil 1 aktivitas aja
//     let activityText = `🎮 <strong>${activity.name}</strong>`;
//     if (activity.details) activityText += ` - ${activity.details}`;
//     if (activity.state) activityText += ` (${activity.state})`;
//     document.getElementById("activity-status").innerHTML = activityText;
//   } else {
//     document.getElementById("activity-status").innerText = ""; // Kosongin kalau gak ada
//   }
// }

const elementHtmlStatus = document.getElementById("status");

async function checkDiscordStatus(DISCORD_ID, cacheTime = 60000) {
  const CACHE_KEY = "discordStatusCache";

  try {
    console.log(`fetch ${DISCORD_ID}, ${cacheTime}`);
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem("cacheTime");

    // Jika cache masih valid (< 1 menit), gunakan cache
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
    dnd: "🔴 Do Not Disturb",
    offline: "⚫ Offline",
  };
  statusMessage = statusText[data.discord_status] || "Unknown";

  // Status Spotify
  let spotifyMessage = "";
  if (data.listening_to_spotify) {
    spotifyMessage = `🎵 <strong>${data.spotify.song}</strong> - ${data.spotify.artist}`;
  }

  // Status aplikasi/game lain
  let activityMessage = "";
  const otherActivities = data.activities.filter((a) => a.name !== "Spotify");
  if (otherActivities.length > 0) {
    const activity = otherActivities[0]; // Ambil 1 aktivitas aja
    activityMessage = `🎮 <strong>${activity.name}</strong>`;
    // if (activity.details) activityMessage += ` - ${activity.details}`;
    // if (activity.state) activityMessage += ` (${activity.state})`;
  }

  // Gabungkan hanya yang ada, tanpa `<br>` berlebihan
  const allMessages = [statusMessage, spotifyMessage, activityMessage].filter(Boolean).join("<br>");

  elementHtmlStatus.innerHTML = allMessages;
  return allMessages;
}
