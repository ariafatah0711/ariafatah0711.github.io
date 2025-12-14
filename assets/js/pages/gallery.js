(function () {
  "use strict";

  function bindGalleryFilters() {
    const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
    const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));

    if (galleryItems.length === 0 || filterButtons.length === 0) return;

    // idempotent: only bind once per button
    filterButtons.forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";

      button.addEventListener("click", function () {
        const category = this.getAttribute("data-category");

        filterButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        galleryItems.forEach((item) => {
          const itemCategory = item.getAttribute("data-category");
          const show = category === "all" || itemCategory === category;

          item.style.display = show ? "block" : "none";
          if (show) item.style.animation = "fadeIn 0.5s ease-in-out forwards";
        });
      });
    });

    // ensure a default active button exists
    if (!filterButtons.some((b) => b.classList.contains("active"))) {
      filterButtons[0].classList.add("active");
    }
  }

  document.addEventListener("DOMContentLoaded", bindGalleryFilters);
  document.addEventListener("app:page-load", bindGalleryFilters);
})();
