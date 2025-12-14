// meeting-js.js - Auto-minimize player on inactivity
(function () {
  "use strict";

  var playerContainer = null;
  var aplayerInstance = null;
  var inactivityTimeout = null;
  var isMinimized = false;
  var isPlayerOpen = false; // Track if player has been opened at least once

  function initMeetingJS() {
    playerContainer = document.getElementById("meeting-js-player");
    if (!playerContainer) return;

    // Wait for MetingJS to initialize
    var checkInterval = setInterval(function () {
      aplayerInstance = playerContainer.querySelector(".aplayer");
      if (aplayerInstance) {
        clearInterval(checkInterval);
        setupAutoMinimize();
      }
    }, 100);
  }

  function setupAutoMinimize() {
    if (!aplayerInstance) return;

    // Add event listeners for activity
    var events = ["mouseenter", "mouseleave", "click", "touchstart", "touchend"];

    events.forEach(function (event) {
      playerContainer.addEventListener(event, resetInactivityTimer, false);
    });

    // Start inactivity timer when player is first opened
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          var display = window.getComputedStyle(playerContainer).display;
          if (display !== "none") {
            isPlayerOpen = true;
            resetInactivityTimer();
          }
        }
      });
    });

    observer.observe(playerContainer, {
      attributes: true,
      attributeFilter: ["style"],
    });

    // Initial check
    if (window.getComputedStyle(playerContainer).display !== "none") {
      isPlayerOpen = true;
      resetInactivityTimer();
    }
  }

  function resetInactivityTimer() {
    if (!isPlayerOpen) return;

    clearTimeout(inactivityTimeout);
    if (isMinimized) {
      maximizePlayer();
    }

    inactivityTimeout = setTimeout(function () {
      minimizePlayer();
    }, 5000); // 5 seconds inactivity
  }

  function minimizePlayer() {
    if (!aplayerInstance || isMinimized) return;

    // Use APlayer's narrow mode for proper minimize
    aplayerInstance.classList.add("aplayer-narrow");

    isMinimized = true;
  }

  function maximizePlayer() {
    if (!aplayerInstance || !isMinimized) return;

    // Remove narrow mode to maximize
    aplayerInstance.classList.remove("aplayer-narrow");

    isMinimized = false;
  }

  // Initialize when DOM ready
  document.addEventListener("DOMContentLoaded", initMeetingJS);
  document.addEventListener("app:page-load", initMeetingJS);
})();
