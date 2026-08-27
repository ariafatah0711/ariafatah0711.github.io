(function () {
  "use strict";

  function setMotion(page, paused) {
    var toggle = page.querySelector("[data-music-motion]");
    if (!toggle) return;

    var label = paused ? "Play ambient animation" : "Pause ambient animation";
    page.dataset.motion = paused ? "paused" : "playing";
    toggle.classList.toggle("is-paused", paused);
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.setAttribute("aria-label", label);
    toggle.setAttribute("title", label);
  }

  function loadPanel(panel) {
    var frame = panel && panel.querySelector("[data-src]");
    if (!frame) return;

    var source = frame.getAttribute("data-src");
    if (source && frame.getAttribute("src") !== source) {
      frame.setAttribute("src", source);
    }
  }

  function unloadPanel(panel) {
    var frame = panel && panel.querySelector("[data-src]");
    if (frame && frame.getAttribute("src") !== "about:blank") {
      frame.setAttribute("src", "about:blank");
    }
  }

  function selectPlaylist(page, selectedTab, moveFocus) {
    var tabs = Array.from(page.querySelectorAll("[data-music-tab]"));
    var panels = Array.from(page.querySelectorAll("[data-music-panel]"));
    var key = selectedTab.getAttribute("data-music-tab");

    tabs.forEach(function (tab) {
      var selected = tab === selectedTab;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.setAttribute("tabindex", selected ? "0" : "-1");
    });

    panels.forEach(function (panel) {
      var selected = panel.getAttribute("data-music-panel") === key;
      panel.hidden = !selected;
      if (selected) loadPanel(panel);
      else unloadPanel(panel);
    });

    if (moveFocus) selectedTab.focus();
  }

  function handleTabKeydown(page, event) {
    var tabs = Array.from(page.querySelectorAll("[data-music-tab]"));
    var currentIndex = tabs.indexOf(event.target);
    if (currentIndex < 0) return;

    var nextIndex = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    selectPlaylist(page, tabs[nextIndex], true);
  }

  function initMusicPage() {
    var page = document.querySelector("[data-music-page]");
    if (!page || page.dataset.musicBound === "true") return;
    page.dataset.musicBound = "true";

    var prefersReducedMotion = window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMotion(page, Boolean(prefersReducedMotion));

    var motionToggle = page.querySelector("[data-music-motion]");
    if (motionToggle) {
      motionToggle.addEventListener("click", function () {
        setMotion(page, page.dataset.motion !== "paused");
      });
    }

    var tablist = page.querySelector('[role="tablist"]');
    if (tablist) {
      tablist.addEventListener("click", function (event) {
        var tab = event.target.closest("[data-music-tab]");
        if (tab && tablist.contains(tab)) selectPlaylist(page, tab, false);
      });
      tablist.addEventListener("keydown", function (event) {
        handleTabKeydown(page, event);
      });
    }

    page.querySelectorAll(".music-embed").forEach(function (frame) {
      frame.addEventListener("load", function () {
        if (frame.getAttribute("src") === "about:blank") return;
        var status = frame.parentElement.querySelector("[data-music-status]");
        if (status) {
          status.textContent = "Spotify player ready.";
          status.hidden = true;
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", initMusicPage);
  document.addEventListener("app:page-load", initMusicPage);
})();

