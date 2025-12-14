// Update theme icon based on current theme
function updateThemeIcon() {
  const themeIcons = document.querySelectorAll(".theme-icon");
  const currentTheme = document.documentElement.getAttribute("data-theme");
  if (themeIcons.length === 0) return;

  themeIcons.forEach((themeIcon) => {
    if (currentTheme === "dark") {
      // Show sun icon (for switching to light mode)
      themeIcon.innerHTML =
        '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    } else {
      // Show moon icon (for switching to dark mode)
      themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    }
  });
}

function toggleNightMode() {
  if (document.documentElement.getAttribute("data-theme") == "light") {
    document.documentElement.setAttribute("data-theme", "dark");

    document.getElementById("mode-switcher")?.classList.add("active");
    document.getElementById("mode-switcher-info")?.classList.add("active");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");

    document.getElementById("mode-switcher")?.classList.remove("active");
    document.getElementById("mode-switcher-info")?.classList.remove("active");
    localStorage.setItem("theme", "");
  }

  // Update theme icon if exists
  if (typeof updateThemeIcon === "function") {
    updateThemeIcon();
  }
}

// mencegah drag image
document.addEventListener("dragstart", function (event) {
  event.preventDefault();
});

// Lightweight re-init after Pjax navigations
function reinitAfterPjax() {
  try {
    updateThemeIcon();
  } catch (e) {}

  // Re-run image modal delegation if component relies on fresh DOM
  try {
    document.dispatchEvent(new Event("imageModal:refresh"));
  } catch (e) {}

  // Rebind project gallery GitHub stars overlays
  try {
    if (typeof fetchStarCount === "function") {
      document.querySelectorAll(".github-stars").forEach(function (el) {
        var repo = el.getAttribute("data-repo");
        if (repo) fetchStarCount(repo, el);
      });
    }
  } catch (e) {}

  // Refresh Discord status if widget present
  try {
    var statusEl = document.getElementById("status");
    var discordIdMeta = document.querySelector('meta[name="discord-id"]');
    var discordId = discordIdMeta ? discordIdMeta.content : null;
    if (statusEl && typeof checkDiscordStatus === "function" && discordId) {
      checkDiscordStatus(discordId);
    }
  } catch (e) {}

  // Kick GitHub profile UI refresh if container exists
  try {
    var gpRoot = document.getElementById("github-profile-root");
    if (gpRoot && typeof loadProfileData === "function" && typeof updateProfileUI === "function") {
      loadProfileData()
        .then(updateProfileUI)
        .catch(function () {});
    }
  } catch (e) {}

  // Inform other modules
  try {
    document.dispatchEvent(new Event("afterPjax"));
  } catch (e) {}

  // Bind generic info-page reset button if present
  try {
    var resetBtn = document.querySelector('[data-reset="info"], #info-reset-btn');
    if (resetBtn && !resetBtn.__boundReset) {
      resetBtn.addEventListener(
        "click",
        function (e) {
          e.preventDefault();
          try {
            localStorage.clear();
          } catch (err) {}
          try {
            sessionStorage.clear();
          } catch (err) {}
          // Force full reload to ensure state resets even with Pjax
          window.location.href = window.location.pathname;
        },
        { passive: false }
      );
      resetBtn.__boundReset = true;
    }
  } catch (e) {}
}

// Expose and run init on first load + after PJAX
(function () {
  function run() {
    try {
      reinitAfterPjax();
    } catch (e) {}
  }

  // make accessible to inline PJAX hook in footer
  try {
    window.reinitAfterPjax = reinitAfterPjax;
  } catch (e) {}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { passive: true });
  } else {
    run();
  }

  document.addEventListener(
    "pjax:success",
    function () {
      run();
    },
    { passive: true }
  );
})();
