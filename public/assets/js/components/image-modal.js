(function () {
  "use strict";

  var PHOTOSWIPE_URL = "https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.esm.min.js";
  var photoswipeModulePromise = null;

  function loadPhotoSwipe() {
    if (!photoswipeModulePromise) {
      photoswipeModulePromise = import(PHOTOSWIPE_URL);
    }
    return photoswipeModulePromise;
  }

  function sourceFor(img) {
    return img.getAttribute("data-full-src") || img.currentSrc || img.src;
  }

  function dimensionsFor(img) {
    var w = img.naturalWidth || img.width || 1600;
    var h = img.naturalHeight || img.height || 1200;

    if (w < 400 || h < 300) {
      var ratio = w > 0 && h > 0 ? w / h : 4 / 3;
      w = 1600;
      h = Math.max(900, Math.round(w / ratio));
    }

    return { width: w, height: h };
  }

  function galleryMeta(img) {
    var item = img.closest(".gallery-item");
    var titleEl = item ? item.querySelector(".gallery-title") : null;
    var descEl = item ? item.querySelector(".gallery-description") : null;
    return {
      title: (titleEl ? titleEl.textContent : "") || img.getAttribute("alt") || "",
      description: (descEl ? descEl.textContent : "") || "",
    };
  }

  function achievementMeta(img) {
    var item = img.closest(".achievement-item");
    var wrapper = img.closest(".achievement-proof-wrapper");
    var titleEl = item ? item.querySelector("h3") : null;
    var captionEl = wrapper ? wrapper.querySelector(".achievement-photo-caption") : null;
    return {
      title: (titleEl ? titleEl.textContent : "") || img.getAttribute("alt") || "",
      description: (captionEl ? captionEl.textContent : "") || "",
    };
  }

  function postMeta(img) {
    return {
      title: img.getAttribute("alt") || "",
      description: "",
    };
  }

  function buildItem(img, metaReader) {
    var size = dimensionsFor(img);
    var meta = metaReader(img);
    var caption = [meta.title, meta.description].filter(Boolean).join("<br>");

    return {
      src: sourceFor(img),
      width: size.width,
      height: size.height,
      alt: meta.title || img.getAttribute("alt") || "",
      title: caption,
    };
  }

  function openLightbox(images, clickedImg, metaReader) {
    if (!images.length) return;

    var index = images.indexOf(clickedImg);
    if (index < 0) index = 0;

    loadPhotoSwipe().then(function (mod) {
      var PhotoSwipe = mod.default;
      var pswp = new PhotoSwipe({
        dataSource: images.map(function (img) {
          return buildItem(img, metaReader);
        }),
        index: index,
        bgOpacity: 0.92,
        padding: { top: 36, bottom: 72, left: 72, right: 72 },
        showHideAnimationType: "fade",
        wheelToZoom: true,
        arrowPrevTitle: "Previous",
        arrowNextTitle: "Next",
        closeTitle: "Close",
        zoomTitle: "Zoom",
      });

      pswp.on("uiRegister", function () {
        pswp.ui.registerElement({
          name: "custom-caption",
          order: 9,
          isButton: false,
          appendTo: "root",
          html: "",
          onInit: function (el, instance) {
            function updateCaption() {
              var title = instance.currSlide && instance.currSlide.data ? instance.currSlide.data.title : "";
              el.innerHTML = title || "";
              el.style.display = title ? "block" : "none";
            }
            instance.on("change", updateCaption);
            updateCaption();
          },
        });
      });

      pswp.init();
    });
  }

  function onDocumentClick(event) {
    if (!event || !event.target || !event.target.closest) return;

    var galleryItem = event.target.closest(".gallery-item");
    if (galleryItem) {
      var galleryImg = galleryItem.querySelector(".clickable-image");
      if (!galleryImg) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openLightbox(Array.prototype.slice.call(document.querySelectorAll(".gallery-item .clickable-image")), galleryImg, galleryMeta);
      return;
    }

    var img = event.target.closest(".clickable-image");
    if (!img || img.closest(".project-item")) return;

    if (img.closest(".achievement-item")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      var achievementItem = img.closest(".achievement-item");
      openLightbox(Array.prototype.slice.call(achievementItem.querySelectorAll(".clickable-image")), img, achievementMeta);
      return;
    }

    if (img.closest(".blog-post-content")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openLightbox([img], img, postMeta);
    }
  }

  function init() {
    document.removeEventListener("click", onDocumentClick, true);
    document.addEventListener("click", onDocumentClick, true);
  }

  window.ImageModal = window.ImageModal || {};
  window.ImageModal.init = init;
  window.ImageModal.destroy = function () {
    document.removeEventListener("click", onDocumentClick, true);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("app:page-load", init);
  document.addEventListener("swup:contentReplaced", init);
})();
