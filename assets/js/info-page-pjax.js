(function () {
  function initInfoPage() {
    // Only run if we're on info page
    if (!document.querySelector(".w-100")) return;
  }

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
                      window.location.href = "/";
                    });
                  });
                } else {
                  showAlertCompat("✓ Cache berhasil dihapus!", () => {
                    window.location.href = "/";
                  });
                }
              });
          } else {
            showAlertCompat("Cache API tidak tersedia.", () => {
              window.location.href = "/";
            });
          }
        }
      }
    );
  }

  // Expose functions globally
  window.toggleResetData = toggleResetData;
  window.clearCacheAndReload = clearCacheAndReload;
  window.initInfoPage = initInfoPage;

  // Initialize on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", initInfoPage);
})();
