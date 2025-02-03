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
}
