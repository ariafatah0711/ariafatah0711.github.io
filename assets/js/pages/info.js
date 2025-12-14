(function () {
  "use strict";

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

  function resetLocalData() {
    showConfirmCompat(
      "Reset Data Lokal",
      "Ini akan menghapus semua data lokal (localStorage & sessionStorage). Lanjutkan?",
      (confirmed) => {
        if (!confirmed) return;
        localStorage.clear();
        sessionStorage.clear();
        showAlertCompat("✓ Data lokal berhasil dihapus!", () => {
          window.location.href = "/";
        });
      }
    );
  }

  function clearCacheAndReload() {
    showConfirmCompat(
      "Reset Cache & Service Worker",
      "Ini akan menghapus cache browser dan unregister service worker. Lanjutkan?",
      async (confirmed) => {
        if (!confirmed) return;

        try {
          if ("caches" in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
          }

          if ("serviceWorker" in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((r) => r.unregister()));
          }

          showAlertCompat("✓ Cache dan service worker berhasil dihapus!", () => {
            window.location.reload();
          });
        } catch (err) {
          console.error(err);
          showAlertCompat("✗ Gagal reset cache/service worker", () => {
            window.location.reload();
          });
        }
      }
    );
  }

  function bind() {
    const resetBtn = document.querySelector('[data-action="reset-local-data"]');
    const cacheBtn = document.querySelector('[data-action="reset-cache"]');

    if (resetBtn && resetBtn.dataset.bound !== "true") {
      resetBtn.dataset.bound = "true";
      resetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        resetLocalData();
      });
    }

    if (cacheBtn && cacheBtn.dataset.bound !== "true") {
      cacheBtn.dataset.bound = "true";
      cacheBtn.addEventListener("click", (e) => {
        e.preventDefault();
        clearCacheAndReload();
      });
    }

    if (typeof window.updateThemeIcon === "function") {
      window.updateThemeIcon();
    }
  }

  // Backward compatibility (in case old HTML still calls these)
  window.toggleResetData = resetLocalData;
  window.clearCacheAndReload = clearCacheAndReload;

  document.addEventListener("DOMContentLoaded", bind);
  document.addEventListener("app:page-load", bind);
})();
