// meeting-js.js - Hover to toggle minimize/maximize
(function () {
  "use strict";

  var playerContainer = null;
  var aplayerInstance = null;
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

    // Add event listeners for hover to toggle
    playerContainer.addEventListener("mouseenter", maximizePlayer, false);
    playerContainer.addEventListener("mouseleave", minimizePlayer, false);

    // Add manual toggle for minimize/maximize on pic click
    var pic = aplayerInstance.querySelector(".aplayer-pic");
    if (pic) {
      pic.addEventListener("click", function (e) {
        e.stopPropagation();
        if (isMinimized) {
          maximizePlayer();
        } else {
          minimizePlayer();
        }
      });
    }

    // Observer for class changes
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          var hasNarrow = aplayerInstance.classList.contains("aplayer-narrow");
          var wasMinimized = isMinimized;
          isMinimized = hasNarrow;
          if (!hasNarrow && wasMinimized) {
            // Just maximized
          } else if (!hasNarrow && !isPlayerOpen) {
            isPlayerOpen = true;
          }
        }
      });
    });

    observer.observe(aplayerInstance, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Initial check
    var initialHasNarrow = aplayerInstance.classList.contains("aplayer-narrow");
    isMinimized = initialHasNarrow;
    if (!initialHasNarrow) {
      isPlayerOpen = true;
    }
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
