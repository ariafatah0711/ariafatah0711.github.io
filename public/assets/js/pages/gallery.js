(function () {
  "use strict";

  function bindGalleryFilters() {
    const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
    const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
    const filterSelect = document.getElementById("gallery-filter-select");

    if (galleryItems.length === 0) return;

    // Bind buttons
    filterButtons.forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";

      button.addEventListener("click", function () {
        const category = this.getAttribute("data-category");

        filterButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        // Sync select if exists
        if (filterSelect) {
          filterSelect.value = category;
        }

        filterGalleryItems(galleryItems, category);
      });
    });

    // Bind select
    if (filterSelect) {
      filterSelect.addEventListener("change", function () {
        const category = this.value;

        // Sync buttons
        filterButtons.forEach((btn) => {
          if (btn.getAttribute("data-category") === category) {
            btn.classList.add("active");
          } else {
            btn.classList.remove("active");
          }
        });

        filterGalleryItems(galleryItems, category);
      });
    }

    // ensure a default active button exists
    if (!filterButtons.some((b) => b.classList.contains("active"))) {
      filterButtons[0].classList.add("active");
      if (filterSelect) {
        filterSelect.value = filterButtons[0].getAttribute("data-category");
      }
    }
  }

  function filterGalleryItems(galleryItems, category) {
    galleryItems.forEach((item) => {
      const itemCategory = item.getAttribute("data-category");
      const show = category === "all" || itemCategory === category;

      item.style.display = show ? "block" : "none";
      if (show) item.style.animation = "fadeIn 0.5s ease-in-out forwards";
    });
  }

  document.addEventListener("DOMContentLoaded", bindGalleryFilters);
  document.addEventListener("app:page-load", bindGalleryFilters);
})();
