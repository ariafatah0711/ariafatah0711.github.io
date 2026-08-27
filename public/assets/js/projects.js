// projects.js - project modal handling (PJAX-safe)
(function () {
  "use strict";

  // Prefer pre-generated JSON (data-cache) to avoid GitHub API calls.
  // Falls back to GitHub API only if JSON can't be loaded or repo is missing.
  var DEFAULT_PROFILE_DATA_URL =
    "https://raw.githubusercontent.com/ariafatah0711/ariafatah0711.github.io/refs/heads/data-cache/data/profile.json";

  function getProfileDataUrl() {
    try {
      var meta = document.querySelector('meta[name="github-profile-json-url"]');
      var fromMeta = meta && meta.getAttribute("content");
      if (fromMeta && String(fromMeta).trim()) return String(fromMeta).trim();
    } catch (e) {}
    return DEFAULT_PROFILE_DATA_URL;
  }

  var PROFILE_DATA_FALLBACK_URL = getProfileDataUrl();
  var repoStatsCache = Object.create(null); // { "owner/name": { stars, forks } }
  var repoStatsLoadPromise = null;

  var controller = null;
  var fallbackListeners = [];

  function addListener(target, type, handler, options) {
    if (!target) return;

    if (controller && controller.signal) {
      var opts = options || {};
      if (typeof opts === "boolean") {
        target.addEventListener(type, handler, opts);
      } else {
        opts.signal = controller.signal;
        target.addEventListener(type, handler, opts);
      }
      return;
    }

    target.addEventListener(type, handler, options || false);
    fallbackListeners.push({ target: target, type: type, handler: handler, options: options || false });
  }

  function cleanupListeners() {
    if (controller) {
      try {
        controller.abort();
      } catch (e) {}
      controller = null;
    }

    for (var i = 0; i < fallbackListeners.length; i++) {
      var l = fallbackListeners[i];
      try {
        l.target.removeEventListener(l.type, l.handler, l.options);
      } catch (e) {}
    }
    fallbackListeners = [];
  }

  function normalizeRepoKey(repo) {
    if (!repo) return null;
    return String(repo).trim().toLowerCase();
  }

  function repoKeyFromUrl(url) {
    if (!url) return null;
    var m = String(url).match(/github\.com\/([^/]+\/[^/?#]+)/i);
    return m ? normalizeRepoKey(m[1]) : null;
  }

  function setRepoStatsOnElement(el, stats) {
    if (!el || !stats) return;
    function toCount(value) {
      if (value == null) return 0;
      if (value === "-") return 0;
      var n = Number(value);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    }
    var starEl = el.querySelector(".star-count");
    if (starEl) starEl.textContent = String(toCount(stats.stars));
    var forkEl = el.querySelector(".fork-count");
    if (forkEl) forkEl.textContent = String(toCount(stats.forks));
  }

  function clearRepoStatsOnElement(el) {
    if (!el) return;
    var starEl = el.querySelector(".star-count");
    if (starEl) starEl.textContent = "0";
    var forkEl = el.querySelector(".fork-count");
    if (forkEl) forkEl.textContent = "0";
  }

  function loadRepoStatsFromProfileJson() {
    if (repoStatsLoadPromise) return repoStatsLoadPromise;

    repoStatsLoadPromise = fetch(PROFILE_DATA_FALLBACK_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("Profile JSON not available");
        return res.json();
      })
      .then(function (data) {
        var nodes =
          (data && data.user && data.user.repositories && data.user.repositories.nodes) ||
          (data && data.repositories && data.repositories.nodes) ||
          [];

        if (!Array.isArray(nodes)) nodes = [];

        nodes.forEach(function (repo) {
          if (!repo) return;
          var url = repo.url || repo.html_url;
          var key = repo.nameWithOwner || repoKeyFromUrl(url);
          key = normalizeRepoKey(key);

          // fallback: if we only have name and not owner, can't safely map
          if (!key || key.indexOf("/") === -1) return;

          var stars =
            repo.stargazerCount != null ? repo.stargazerCount : repo.stargazers_count != null ? repo.stargazers_count : null;
          var forks = repo.forkCount != null ? repo.forkCount : repo.forks_count != null ? repo.forks_count : null;

          if (stars == null && forks == null) return;

          repoStatsCache[key] = {
            stars: stars != null ? stars : "-",
            forks: forks != null ? forks : "-",
          };
        });
      })
      .catch(function () {
        // ignore; API fallback will handle
      });

    return repoStatsLoadPromise;
  }

  function fetchRepoStatsFromApi(repo) {
    repo = normalizeRepoKey(repo);
    if (!repo) return Promise.resolve(null);
    var api = "https://api.github.com/repos/" + repo;
    return fetch(api)
      .then(function (res) {
        if (!res.ok) throw new Error("no");
        return res.json();
      })
      .then(function (data) {
        return {
          stars: data.stargazers_count || 0,
          forks: data.forks_count || 0,
        };
      })
      .catch(function () {
        return null;
      });
  }

  function fetchStarCount(repo, el) {
    if (!repo || !el) return;

    var repoKey = normalizeRepoKey(repo);
    if (!repoKey) return;

    // kick off JSON load early (no await needed here)
    loadRepoStatsFromProfileJson();

    // if already cached from JSON/API, use immediately
    if (repoStatsCache[repoKey]) {
      setRepoStatsOnElement(el, repoStatsCache[repoKey]);
      return;
    }

    // otherwise wait for JSON (best case), then fall back to API
    Promise.resolve(repoStatsLoadPromise)
      .then(function () {
        if (repoStatsCache[repoKey]) {
          setRepoStatsOnElement(el, repoStatsCache[repoKey]);
          return null;
        }
        return fetchRepoStatsFromApi(repoKey);
      })
      .then(function (stats) {
        if (!stats) return;
        repoStatsCache[repoKey] = stats;
        setRepoStatsOnElement(el, stats);
      });
  }

  function initProjectsModal() {
    cleanupListeners();
    controller = typeof AbortController !== "undefined" ? new AbortController() : null;

    var projectModal = document.getElementById("projectModal");
    if (!projectModal) return;

    var modalImg = document.getElementById("projectModalImg");
    var modalTitle = document.getElementById("projectModalTitle");
    var modalDescription = document.getElementById("projectModalDescription");
    var modalCounter = document.getElementById("projectModalCounter");
    var prevBtn = document.getElementById("projectPrev");
    var nextBtn = document.getElementById("projectNext");
    var closeBtn = document.getElementById("projectClose");
    var sourceBtn = document.getElementById("projectModalSource");
    var demoBtn = document.getElementById("projectModalDemo");
    var starsEl = document.getElementById("projectModalStars");

    if (
      !modalImg ||
      !modalTitle ||
      !modalDescription ||
      !modalCounter ||
      !prevBtn ||
      !nextBtn ||
      !closeBtn ||
      !sourceBtn ||
      !demoBtn ||
      !starsEl
    ) {
      return;
    }

    var currentIndex = 0;
    var images = [];
    var scrollPosition = 0;

    function normalizeImages(arr) {
      return arr
        .map(function (i) {
          if (!i) return "";
          i = i.trim();
          if (i.indexOf("http") === 0) return i;
          if (i.indexOf("/") === 0) return i;
          if (i.indexOf(".") !== -1) return "/" + i;
          return "";
        })
        .filter(Boolean);
    }

    function updateProjectModalImage() {
      if (!images || images.length === 0) {
        modalImg.src = "";
        modalCounter.textContent = "";
        return;
      }
      var fallback = modalImg.nextElementSibling;
      if (fallback) {
        fallback.style.display = "none";
      }
      modalImg.style.display = "block";
      modalImg.src = images[currentIndex];
      modalCounter.textContent = currentIndex + 1 + " / " + images.length;
    }

    function closeProjectModal() {
      projectModal.style.display = "none";
      document.body.classList.remove("modal-open");
      document.body.style.top = "";
      if (!document.body.classList.contains("linktree-lock-scroll")) {
        document.body.style.overflow = "";
      }
      try {
        window.scrollTo(0, scrollPosition);
      } catch (e) {}
    }

    function showPrev() {
      if (images.length > 1) {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateProjectModalImage();
      }
    }
    function showNext() {
      if (images.length > 1) {
        currentIndex = (currentIndex + 1) % images.length;
        updateProjectModalImage();
      }
    }

    function openProjectModal(imgArray, title, description, sourceUrl, demoUrl, repo) {
      // force-close global image modal if open
      try {
        var globalImageModal = document.getElementById("imageModal");
        if (globalImageModal && globalImageModal.style.display === "flex") {
          globalImageModal.style.display = "none";
          var gVideo = document.getElementById("modalVideo");
          if (gVideo) {
            try {
              gVideo.pause();
            } catch (e) {}
            try {
              gVideo.removeAttribute("src");
              gVideo.load();
            } catch (e) {}
            gVideo.style.display = "none";
          }
          document.body.classList.remove("modal-open");
          document.body.style.top = "";
          // Image modal uses inline overflow lock; restore it too
          document.body.style.overflow = "";
        }
      } catch (e) {}

      images = imgArray || [];
      currentIndex = 0;
      modalTitle.textContent = title || "";
      modalDescription.textContent = description || "";
      sourceBtn.style.display = sourceUrl ? "inline-flex" : "none";
      if (sourceUrl) sourceBtn.href = sourceUrl;
      demoBtn.style.display = demoUrl ? "inline-flex" : "none";
      if (demoUrl) demoBtn.href = demoUrl;

      if (repo) {
        starsEl.style.display = "inline-flex";
        starsEl.setAttribute("data-repo", repo);
        fetchStarCount(repo, starsEl);
      } else {
        starsEl.style.display = "none";
        clearRepoStatsOnElement(starsEl);
      }

      updateProjectModalImage();

      prevBtn.style.display = images.length > 1 ? "flex" : "none";
      nextBtn.style.display = images.length > 1 ? "flex" : "none";

      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      document.body.classList.add("modal-open");
      document.body.style.top = -scrollPosition + "px";
      projectModal.style.display = "flex";
    }

    // isi semua stars overlay di grid
    document.querySelectorAll(".github-stars").forEach(function (el) {
      var repo = el.getAttribute("data-repo");
      if (repo) fetchStarCount(repo, el);
    });

    function onDocumentClick(e) {
      // kalau klik tombol Source/Demo -> biarin
      if (e.target.closest("a.btn")) return;

      // klik thumbnail dalam card
      if (e.target.classList.contains("project-thumb-img")) {
        var parentCard = e.target.closest(".project-item");
        if (!parentCard) return;
        e.preventDefault();
        e.stopImmediatePropagation();

        var dataImages = parentCard.getAttribute("data-images");
        var imgArr = [];
        try {
          imgArr = dataImages ? JSON.parse(dataImages) : [];
        } catch (err) {}
        imgArr = normalizeImages(imgArr);
        if (imgArr.length === 0) {
          var clickImg = parentCard.querySelector(".clickable-image");
          if (clickImg) imgArr.push(clickImg.src);
        }

        var clickedSrc = e.target.getAttribute("data-thumb-src") || e.target.src;
        var idx = imgArr.indexOf(clickedSrc);
        if (idx === -1) idx = 0;

        var title = parentCard.querySelector(".gallery-title")?.textContent || "";
        var desc = parentCard.querySelector(".gallery-description")?.textContent || "";
        var sourceLink = parentCard.getAttribute("data-source") || "";
        var demoLink = parentCard.getAttribute("data-demo") || "";
        var repo = parentCard.getAttribute("data-repo");

        openProjectModal(imgArr, title, desc, sourceLink, demoLink, repo);
        currentIndex = idx;
        updateProjectModalImage();
        return;
      }

      // klik gambar utama card
      if (e.target.classList.contains("clickable-image")) {
        var item = e.target.closest(".project-item");
        if (!item) return;
        e.preventDefault();
        e.stopImmediatePropagation();

        var dataImages = item.getAttribute("data-images");
        var imgArr = [];
        try {
          imgArr = dataImages ? JSON.parse(dataImages) : [];
        } catch (err) {}
        imgArr = normalizeImages(imgArr);
        if (imgArr.length === 0) {
          var clickImg = item.querySelector(".clickable-image");
          if (clickImg) imgArr.push(clickImg.src);
        }

        var title = item.querySelector(".gallery-title")?.textContent || "";
        var desc = item.querySelector(".gallery-description")?.textContent || "";
        var sourceLink = item.getAttribute("data-source") || "";
        var demoLink = item.getAttribute("data-demo") || "";
        var repo = item.getAttribute("data-repo");

        openProjectModal(imgArr, title, desc, sourceLink, demoLink, repo);
        return;
      }

      // klik area kosong card -> no action
    }

    addListener(document, "click", onDocumentClick);

    addListener(closeBtn, "click", function () {
      closeProjectModal();
    });
    addListener(prevBtn, "click", function () {
      showPrev();
    });
    addListener(nextBtn, "click", function () {
      showNext();
    });

    addListener(projectModal, "click", function (e) {
      if (e.target === projectModal) closeProjectModal();
    });

    addListener(document, "keydown", function (e) {
      if (projectModal.style.display === "flex") {
        if (e.key === "Escape") closeProjectModal();
        if (e.key === "ArrowLeft") showPrev();
        if (e.key === "ArrowRight") showNext();
      }
    });

    // start loading JSON cache ASAP
    loadRepoStatsFromProfileJson();
  }

  document.addEventListener("DOMContentLoaded", initProjectsModal);
  document.addEventListener("app:page-load", initProjectsModal);
})();
