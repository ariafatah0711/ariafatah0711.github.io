async function checkDiscordStatus(DISCORD_ID, LYNARD_TOKEN) {
  // const DISCORD_ID = "879547455941779456";
  // LYNARD_TOKEN = "aria123";

  const CACHE_KEY = "discordStatusCache";

  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem("cacheTime");

    // Jika data ada dan cache belum lebih dari 1 menit
    if (cachedData && cachedTime) {
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - cachedTime;

      if (elapsedTime < 60000) {
        // Gunakan data dari cache jika kurang dari 1 menit
        document.getElementById("status").innerHTML = cachedData;
        return;
      }
    }

    // Jika tidak ada data cache atau sudah lebih dari 1 menit, request data baru
    const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`, {
      headers: { Authorization: `Bearer ${LYNARD_TOKEN}` },
    });
    const data = await response.json();

    if (data.success) {
      const status = data.data.discord_status;
      const statusText = {
        online: "🟢 Online",
        idle: "🟡 Idle",
        dnd: "🔴 Do Not Disturb",
        offline: "⚫ Offline",
      };

      let statusMessage = statusText[status] || "Unknown";

      // Cek apakah sedang mendengarkan Spotify
      if (data.data.listening_to_spotify) {
        const song = data.data.spotify.song;
        const artist = data.data.spotify.artist;
        statusMessage += `<br> 🎵 <strong>${song}</strong> - ${artist}`;
      }

      // Perbarui elemen status di dalam <a> dan simpan di localStorage
      document.getElementById("status").innerHTML = statusMessage;
      localStorage.setItem(CACHE_KEY, statusMessage);
      localStorage.setItem("cacheTime", new Date().getTime()); // Menyimpan waktu cache
    } else {
      document.getElementById("status").innerText = "Gagal mendapatkan status.";
    }
  } catch (error) {
    document.getElementById("status").innerText = "Error saat mengambil data.";
  }
}

// async function checkDiscordStatusDummy() {
//   const DISCORD_ID = "879547455941779456"; // Ganti dengan ID Discord milikmu

//   try {
//     // Data dummy (tanpa mengambil data dari API)
//     const data = {
//       success: true,
//       data: {
//         discord_status: "online", // Status dummy
//         listening_to_spotify: true, // Status dummy mendengarkan Spotify
//         spotify: {
//           song: "Shape of You", // Nama lagu dummy
//           artist: "Ed Sheeran", // Nama artis dummy
//         },
//       },
//     };

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

//       // Perbarui elemen status di dalam <a>
//       document.getElementById("status").innerHTML = statusMessage;
//     } else {
//       document.getElementById("status").innerText = "Gagal mendapatkan status.";
//     }
//   } catch (error) {
//     document.getElementById("status").innerText = "Error saat mengambil data.";
//   }
// }
