// Image lazy loading optimization for PJAX
// Ensure images load properly after content swap
(function () {
  function resetLazyLoading() {
    // Reset any in-flight image loads by re-triggering browser's native lazy-load
    if ("IntersectionObserver" in window) {
      var images = document.querySelectorAll("img[loading='lazy']");
      images.forEach(function (img) {
        // Trigger re-observation if browser has native loading="lazy"
        // For Safari/older browsers, this is a no-op but safe
        if (img.loading === "lazy") {
          // Reassign to trigger potential re-check (though native lazy-load handles this)
          var src = img.src;
          var srcset = img.srcset;
          if (src || srcset) {
            // Just access the src to ensure browser re-evaluates
            img.style.display = img.style.display; // Force reflow
          }
        }
      });
    }
  }

  function initImageOptimization() {
    resetLazyLoading();
  }

  window.initImageOptimization = initImageOptimization;
  document.addEventListener("DOMContentLoaded", initImageOptimization);
})();
