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

function initThemeIcon() {
  if (typeof updateThemeIcon === "function") {
    updateThemeIcon();
  }
}

function bindThemeToggle() {
  const buttons = document.querySelectorAll('[data-action="toggle-theme"]');
  buttons.forEach((btn) => {
    if (btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleNightMode();
    });
  });
}

function getCurrentLanguage() {
  return localStorage.getItem("language") === "id" ? "id" : "en";
}

function applyLanguage() {
  const lang = getCurrentLanguage();
  document.documentElement.setAttribute("lang", lang === "id" ? "id-ID" : "en-US");
  document.documentElement.setAttribute("data-language", lang);

  document.querySelectorAll("[data-i18n-en]").forEach((el) => {
    const value = el.getAttribute(lang === "id" ? "data-i18n-id" : "data-i18n-en");
    if (value == null || value === "") return;
    if (el.getAttribute("data-i18n-mode") === "html") {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });

  document.querySelectorAll("[data-language-label]").forEach((el) => {
    el.textContent = lang.toUpperCase();
  });
}

function toggleLanguage() {
  const nextLang = getCurrentLanguage() === "id" ? "en" : "id";
  localStorage.setItem("language", nextLang);
  applyLanguage();
  document.dispatchEvent(new CustomEvent("app:language-change", { detail: { language: nextLang } }));
}

function bindLanguageToggle() {
  const buttons = document.querySelectorAll('[data-action="toggle-language"]');
  buttons.forEach((btn) => {
    if (btn.dataset.boundLanguage === "true") return;
    btn.dataset.boundLanguage = "true";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleLanguage();
    });
  });
}

document.addEventListener("DOMContentLoaded", initThemeIcon);
document.addEventListener("app:page-load", initThemeIcon);
document.addEventListener("DOMContentLoaded", bindThemeToggle);
document.addEventListener("app:page-load", bindThemeToggle);
document.addEventListener("DOMContentLoaded", applyLanguage);
document.addEventListener("app:page-load", applyLanguage);
document.addEventListener("DOMContentLoaded", bindLanguageToggle);
document.addEventListener("app:page-load", bindLanguageToggle);

// mencegah drag image
document.addEventListener("dragstart", function (event) {
  event.preventDefault();
});
