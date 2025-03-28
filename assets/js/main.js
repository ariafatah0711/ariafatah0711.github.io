function toggleNightMode() {
  if (document.documentElement.getAttribute("data-theme") == "light") {
    document.documentElement.setAttribute("data-theme", "dark");

    document.getElementById("mode-switcher").classList.add("active");
    // document.getElementById("mode-switcher-info").classList.add("active");
    document.getElementById("mode-switcher-info")?.classList.add("active");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");

    document.getElementById("mode-switcher").classList.remove("active");
    // document.getElementById("mode-switcher-info").classList.remove("active");
    document.getElementById("mode-switcher-info")?.classList.remove("active");
    localStorage.setItem("theme", "");
  }
}

function toggleResetData() {
  localStorage.clear();
  sessionStorage.clear();
  location.reload();
  clearCacheAndReload();
}

function clearCacheAndReload() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }
  caches.keys().then((names) => {
    for (let name of names) {
      caches.delete(name);
    }
  });
  localStorage.clear();
  sessionStorage.clear();
  location.reload();
}

// mencegah drag image
document.addEventListener("dragstart", function (event) {
  event.preventDefault();
});
