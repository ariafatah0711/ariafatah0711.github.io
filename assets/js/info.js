function showConfirmCompat(title, message, callback) {
  if (typeof window.showConfirm === "function") {
    window.showConfirm(title, message, callback);
    return;
  }
  const confirmed = window.confirm((title ? title + "\n\n" : "") + (message || ""));
  if (typeof callback === "function") callback(confirmed);
}

function showAlertCompat(message, callback) {
  if (typeof window.showAlert === "function") {
    window.showAlert(message, callback);
    return;
  }
  window.alert(message || "");
  if (typeof callback === "function") callback();
}

function toggleResetData() {
  showConfirmCompat(
    "Reset Data Lokal",
    "Ini akan menghapus semua data lokal (localStorage & sessionStorage). Lanjutkan?",
    (confirmed) => {
      if (confirmed) {
        localStorage.clear();
        sessionStorage.clear();
        showAlertCompat("✓ Data lokal berhasil dihapus!", () => {
          // location.reload();
          window.location.href = "/";
        });
      }
    }
  );
}

function clearCacheAndReload() {
  showConfirmCompat(
    "Reset Cache & Service Worker",
    "Ini akan menghapus cache browser dan unregister service worker. Lanjutkan?",
    (confirmed) => {
      if (confirmed) {
        if ("caches" in window) {
          caches
            .keys()
            .then(function (cacheNames) {
              return Promise.all(
                cacheNames.map(function (cacheName) {
                  return caches.delete(cacheName);
                })
              );
            })
            .then(() => {
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                  for (let registration of registrations) {
                    registration.unregister();
                  }
                  showAlertCompat("✓ Cache dan service worker berhasil dihapus!", () => {
                    location.reload(true);
                  });
                });
              } else {
                showAlertCompat("✓ Cache berhasil dihapus!", () => {
                  location.reload(true);
                });
              }
            });
        } else {
          showAlertCompat("✗ Browser tidak mendukung cache API", () => {
            location.reload(true);
          });
        }
      }
    }
  );
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof updateThemeIcon === "function") {
    updateThemeIcon();
  }
});
