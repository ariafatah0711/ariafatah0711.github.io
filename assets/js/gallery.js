// Gallery page behavior (filter buttons). Safe to load on all pages.
(function () {
  function initGallery() {
    var galleryItems = document.querySelectorAll(".gallery-item");
    var filterButtons = document.querySelectorAll(".filter-btn");

    if (!galleryItems.length || !filterButtons.length) return;

    // Mark as bound to prevent re-binding (but allow on new PJAX swap)
    var body = document.body;
    if (body.dataset && body.dataset.galleryBound === "true") {
      // Already bound on this DOM - don't re-bind
      return;
    }

    // Mark as bound
    if (body && body.dataset) {
      body.dataset.galleryBound = "true";
    }

    // Remove old listeners to prevent duplicates
    filterButtons.forEach(function (button) {
      var cloned = button.cloneNode(true);
      button.parentNode.replaceChild(cloned, button);
    });

    // Re-query after cloning
    filterButtons = document.querySelectorAll(".filter-btn");
    galleryItems = document.querySelectorAll(".gallery-item");

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var category = this.getAttribute("data-category");

        filterButtons.forEach(function (btn) {
          btn.classList.remove("active");
        });
        this.classList.add("active");

        galleryItems.forEach(function (item) {
          var itemCategory = item.getAttribute("data-category");
          if (category === "all" || itemCategory === category) {
            item.style.display = "block";
            item.style.animation = "fadeIn 0.5s ease-in-out forwards";
          } else {
            item.style.display = "none";
          }
        });
      });
    });

    // Default active = first button
    if (filterButtons[0]) filterButtons[0].classList.add("active");
  }

  window.initGallery = initGallery;
  document.addEventListener("DOMContentLoaded", initGallery);
})();
