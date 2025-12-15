(function () {
  "use strict";

  var state = {
    initialized: false,
    modalEl: null,
    abortController: null,
    fallbackListeners: [],

    modalImg: null,
    modalVideo: null,
    modalTitle: null,
    modalDescription: null,
    modalCounter: null,
    prevBtn: null,
    nextBtn: null,

    scrollPosition: 0,

    imageData: [],
    metaData: [],
    currentIndex: 0,
    isGalleryMode: false,

    touchStartX: 0,
    touchStartY: 0,
    touchMoved: false,
    SWIPE_THRESHOLD: 40,
  };

  function getEl(id) {
    return document.getElementById(id);
  }

  function hasAbortController() {
    return typeof AbortController !== "undefined";
  }

  function addListener(target, type, handler, options) {
    if (!target) return;

    if (state.abortController && state.abortController.signal) {
      var opts = options || {};
      if (typeof opts === "boolean") {
        target.addEventListener(type, handler, opts);
      } else {
        opts.signal = state.abortController.signal;
        target.addEventListener(type, handler, opts);
      }
      return;
    }

    target.addEventListener(type, handler, options || false);
    state.fallbackListeners.push({ target: target, type: type, handler: handler, options: options || false });
  }

  function removeFallbackListeners() {
    for (var i = 0; i < state.fallbackListeners.length; i++) {
      var l = state.fallbackListeners[i];
      try {
        l.target.removeEventListener(l.type, l.handler, l.options);
      } catch (e) {
        // ignore
      }
    }
    state.fallbackListeners = [];
  }

  function applyModalMode() {
    if (!state.modalEl) return;
    if (state.isGalleryMode) {
      state.modalEl.classList.add("modal--stacked");
    } else {
      state.modalEl.classList.remove("modal--stacked");
    }
  }

  function isVideoUrl(url) {
    if (!url) return false;
    var lower = String(url).toLowerCase();
    return lower.indexOf(".mp4") !== -1 || lower.indexOf(".webm") !== -1 || lower.indexOf(".mov") !== -1;
  }

  function preloadAdjacent(index) {
    if (!state.imageData || state.imageData.length === 0) return;

    if (index > 0) {
      var prevImg = new Image();
      prevImg.src = state.imageData[index - 1];
    }
    if (index < state.imageData.length - 1) {
      var nextImg = new Image();
      nextImg.src = state.imageData[index + 1];
    }
  }

  function updateModalContent() {
    if (!state.modalEl) return;

    var currentImage = state.imageData[state.currentIndex];

    if (isVideoUrl(currentImage)) {
      if (state.modalImg) state.modalImg.style.display = "none";
      if (state.modalVideo) {
        state.modalVideo.style.display = "block";
        state.modalVideo.src = currentImage;
      }
    } else {
      if (state.modalImg) {
        state.modalImg.style.display = "block";
        state.modalImg.src = currentImage;
      }
      if (state.modalVideo) {
        state.modalVideo.style.display = "none";
        state.modalVideo.removeAttribute("src");
        try {
          state.modalVideo.load();
        } catch (e) {
          // ignore
        }
      }
    }

    var meta = state.metaData[state.currentIndex] || { title: "", description: "" };
    if (state.modalTitle) state.modalTitle.textContent = meta.title || "";
    if (state.modalDescription) state.modalDescription.textContent = meta.description || "";

    if (state.modalCounter) {
      if (state.imageData.length > 1) {
        state.modalCounter.textContent = String(state.currentIndex + 1) + " / " + String(state.imageData.length);
        state.modalCounter.style.display = "block";
      } else {
        state.modalCounter.style.display = "none";
      }
    }
  }

  function openModal(index, showNav) {
    if (!state.modalEl) return;

    state.scrollPosition = window.scrollY || 0;
    document.body.classList.add("modal-open");

    state.currentIndex = index;
    state.modalEl.style.display = "flex";

    if (state.prevBtn) state.prevBtn.style.display = showNav ? "flex" : "none";
    if (state.nextBtn) state.nextBtn.style.display = showNav ? "flex" : "none";

    updateModalContent();
  }

  function closeModal() {
    if (!state.modalEl) return;

    state.modalEl.style.display = "none";
    document.body.classList.remove("modal-open");

    try {
      window.scrollTo(0, state.scrollPosition);
    } catch (e) {
      // ignore
    }

    state.imageData = [];
    state.metaData = [];
    state.isGalleryMode = false;
    applyModalMode();

    if (state.modalTitle) state.modalTitle.textContent = "";
    if (state.modalDescription) state.modalDescription.textContent = "";

    if (state.modalVideo) {
      state.modalVideo.pause();
      state.modalVideo.removeAttribute("src");
      try {
        state.modalVideo.load();
      } catch (e) {
        // ignore
      }
    }
  }

  function showPrev() {
    if (!state.imageData || state.imageData.length === 0) return;
    state.currentIndex = (state.currentIndex - 1 + state.imageData.length) % state.imageData.length;
    updateModalContent();
    preloadAdjacent(state.currentIndex);
  }

  function showNext() {
    if (!state.imageData || state.imageData.length === 0) return;
    state.currentIndex = (state.currentIndex + 1) % state.imageData.length;
    updateModalContent();
    preloadAdjacent(state.currentIndex);
  }

  function setupPhotoGalleryMode(img) {
    state.isGalleryMode = true;
    applyModalMode();

    var allGalleryImages = Array.prototype.slice.call(document.querySelectorAll(".gallery-item .clickable-image"));

    state.imageData = allGalleryImages.map(function (el) {
      return el.currentSrc || el.src;
    });

    state.metaData = allGalleryImages.map(function (el) {
      var item = el.closest(".gallery-item");
      var titleEl = item ? item.querySelector(".gallery-title") : null;
      var descEl = item ? item.querySelector(".gallery-description") : null;

      return {
        title: (titleEl ? titleEl.textContent : "") || el.getAttribute("alt") || "",
        description: (descEl ? descEl.textContent : "") || "",
      };
    });

    var clickedIndex = allGalleryImages.indexOf(img);
    state.currentIndex = clickedIndex >= 0 ? clickedIndex : 0;

    if (state.imageData.length > 0) {
      openModal(state.currentIndex, state.imageData.length > 1);
      preloadAdjacent(state.currentIndex);
    }
  }

  function setupProjectItemMode(img) {
    var projectItem = img.closest(".project-item");
    var imagesAttr = projectItem ? projectItem.getAttribute("data-images") : null;

    state.imageData = imagesAttr ? JSON.parse(imagesAttr) : [];
    state.metaData = [];
    state.currentIndex = 0;

    state.imageData = state.imageData
      .map(function (u) {
        return String(u).trim();
      })
      .filter(function (u) {
        return !!u;
      });

    state.isGalleryMode = false;
    applyModalMode();

    if (state.imageData.length > 0) {
      openModal(0, state.imageData.length > 1);
      preloadAdjacent(0);
    }
  }

  function setupRepoMode(img) {
    state.isGalleryMode = false;
    applyModalMode();

    state.imageData = [img.src];
    state.metaData = [{ title: "", description: "" }];
    state.currentIndex = 0;

    openModal(0, false);
  }

  function onDocumentClick(event) {
    if (!event || !event.target) return;

    // Gallery page: allow clicking overlay/text area to open modal too
    var galleryItem = event.target.closest && event.target.closest(".gallery-item");
    if (galleryItem) {
      var galleryImg = galleryItem.querySelector(".clickable-image");
      if (galleryImg) {
        setupPhotoGalleryMode(galleryImg);
        return;
      }
    }

    if (event.target.classList && event.target.classList.contains("clickable-image")) {
      var img = event.target;

      // 1) Gallery page (photos)
      if (img.closest && img.closest(".gallery-item")) {
        setupPhotoGalleryMode(img);
        return;
      }

      // 2) Project-item image gallery (legacy / other pages)
      if (img.closest && img.closest(".project-item")) {
        // If the dedicated Project Modal exists, let projects.js handle it
        // to avoid double-modals and stuck scroll lock.
        if (getEl("projectModal")) {
          return;
        }

        setupProjectItemMode(img);
        return;
      }

      // 3) Single image inside blog post content
      if (img.closest && img.closest(".blog-post-content")) {
        setupRepoMode(img);
        return;
      }
    }
  }

  function onModalClick(event) {
    if (!state.modalEl) return;
    if (event.target === state.modalEl) {
      closeModal();
    }
  }

  function onKeydown(event) {
    if (!state.modalEl) return;
    if (state.modalEl.style.display !== "flex") return;

    if (event.key === "ArrowLeft") showPrev();
    if (event.key === "ArrowRight") showNext();
    if (event.key === "Escape") closeModal();
  }

  function onTouchStart(e) {
    state.touchStartX = e.touches[0].clientX;
    state.touchStartY = e.touches[0].clientY;
    state.touchMoved = false;
  }

  function onTouchMove(e) {
    if (state.touchMoved) return;

    var deltaX = Math.abs(e.touches[0].clientX - state.touchStartX);
    var deltaY = Math.abs(e.touches[0].clientY - state.touchStartY);

    // mostly horizontal movement
    if (deltaX > deltaY) {
      state.touchMoved = true;
      e.preventDefault();
    }
  }

  function onTouchEnd(e) {
    if (!state.touchMoved) return;

    var endX = e.changedTouches[0].clientX;
    if (endX < state.touchStartX - state.SWIPE_THRESHOLD) {
      showNext();
    } else if (endX > state.touchStartX + state.SWIPE_THRESHOLD) {
      showPrev();
    }
  }

  function wireListeners() {
    // Event delegation for open
    addListener(document, "click", onDocumentClick);

    // Close by clicking backdrop
    addListener(state.modalEl, "click", onModalClick);

    // Close button + nav
    var modalCloseBtn = state.modalEl ? state.modalEl.querySelector(".close") : null;
    if (modalCloseBtn) {
      addListener(modalCloseBtn, "click", function () {
        closeModal();
      });
    }

    if (state.prevBtn) addListener(state.prevBtn, "click", showPrev);
    if (state.nextBtn) addListener(state.nextBtn, "click", showNext);

    // Keyboard
    addListener(document, "keydown", onKeydown);

    // Swipe
    addListener(state.modalEl, "touchstart", onTouchStart, { passive: true });
    addListener(state.modalEl, "touchmove", onTouchMove, { passive: false });
    addListener(state.modalEl, "touchend", onTouchEnd, { passive: true });
  }

  function bindDom() {
    state.modalEl = getEl("imageModal");
    if (!state.modalEl) return false;

    state.modalImg = getEl("modalImg");
    state.modalVideo = getEl("modalVideo");
    state.modalTitle = getEl("modalTitle");
    state.modalDescription = getEl("modalDescription");
    state.modalCounter = getEl("modalCounter");
    state.prevBtn = getEl("prevBtn");
    state.nextBtn = getEl("nextBtn");

    return true;
  }

  function init() {
    var modalFound = bindDom();
    if (!modalFound) return;

    // If modal element changed (PJAX swapped layout), re-init cleanly.
    if (state.initialized && state.modalEl && state.modalEl !== getEl("imageModal")) {
      destroy();
      bindDom();
    }

    if (state.initialized) return;

    state.abortController = hasAbortController() ? new AbortController() : null;
    state.fallbackListeners = [];

    state.imageData = [];
    state.metaData = [];
    state.currentIndex = 0;
    state.isGalleryMode = false;
    applyModalMode();

    wireListeners();

    state.initialized = true;
  }

  function destroy() {
    if (state.abortController) {
      try {
        state.abortController.abort();
      } catch (e) {
        // ignore
      }
    }

    removeFallbackListeners();

    state.abortController = null;
    state.initialized = false;

    closeModal();

    // keep DOM refs; they will be refreshed on next init
  }

  function openVideoModal(src, title, description) {
    if (!state.initialized) init();
    if (!state.modalEl) return;

    state.isGalleryMode = false;
    applyModalMode();

    state.imageData = [src];
    state.metaData = [{ title: title || "", description: description || "" }];
    state.currentIndex = 0;

    openModal(0, false);
  }

  // Expose API for page scripts
  window.ImageModal = window.ImageModal || {};
  window.ImageModal.init = init;
  window.ImageModal.destroy = destroy;
  window.ImageModal.openVideoModal = openVideoModal;

  // Auto-init (normal load)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init();
    });
  } else {
    init();
  }

  // Auto-init again after partial navigation libraries swap content
  var reinitEvents = ["pjax:complete", "pjax:end", "swup:contentReplaced", "turbo:load", "turbolinks:load", "barba:after"];

  for (var i = 0; i < reinitEvents.length; i++) {
    document.addEventListener(reinitEvents[i], function () {
      // Idempotent init; safe to call multiple times
      init();
    });
  }

  // Also listen to app:page-load to ensure modal is closed on page changes
  document.addEventListener("app:page-load", function () {
    if (state.modalEl && state.modalEl.style.display === "flex") {
      closeModal();
    }
  });
})();
