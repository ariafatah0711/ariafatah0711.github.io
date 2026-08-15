(function () {
  "use strict";

  function enhancePostImages() {
    const postContent = document.querySelector(".blog-post-content");
    if (!postContent) return;

    const images = postContent.querySelectorAll("img");
    images.forEach((img) => {
      if (img.closest("a")) return;
      img.classList.add("clickable-image");

      // avoid modal showing "Preview" from default alt values
      if (!img.alt || img.alt === "Preview") {
        img.alt = "";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", enhancePostImages);
  document.addEventListener("app:page-load", enhancePostImages);
})();
