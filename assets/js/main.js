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
