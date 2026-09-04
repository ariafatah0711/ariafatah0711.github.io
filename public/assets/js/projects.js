// projects.js - project stats and PhotoSwipe previews (PJAX-safe)
(function () {
  "use strict";

  var DEFAULT_PROFILE_DATA_URL =
    "https://raw.githubusercontent.com/ariafatah0711/ariafatah0711.github.io/refs/heads/data-cache/data/profile.json";
  var PHOTOSWIPE_URL = "https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.esm.min.js";

  var repoStatsCache = Object.create(null);
  var repoStatsLoadPromise = null;
  var photoswipeModulePromise = null;
  var controller = null;
  var fallbackListeners = [];

  function getProfileDataUrl() {
    try {
      var meta = document.querySelector('meta[name="github-profile-json-url"]');
      var fromMeta = meta && meta.getAttribute("content");
      if (fromMeta && String(fromMeta).trim()) return String(fromMeta).trim();
    } catch (e) {}
    return DEFAULT_PROFILE_DATA_URL;
  }

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

  function toCount(value) {
    if (value == null || value === "-") return 0;
    var n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  function formatStats(stats) {
    if (!stats) return "";
    return toCount(stats.stars) + " stars / " + toCount(stats.forks) + " forks";
  }

  function setRepoStatsOnElement(el, stats) {
    if (!el || !stats) return;
    var starEl = el.querySelector(".star-count");
    if (starEl) starEl.textContent = String(toCount(stats.stars));
    var forkEl = el.querySelector(".fork-count");
    if (forkEl) forkEl.textContent = String(toCount(stats.forks));
  }

  function loadRepoStatsFromProfileJson() {
    if (repoStatsLoadPromise) return repoStatsLoadPromise;

    repoStatsLoadPromise = fetch(getProfileDataUrl())
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
          var key = normalizeRepoKey(repo.nameWithOwner || repoKeyFromUrl(repo.url || repo.html_url));
          if (!key || key.indexOf("/") === -1) return;

          var stars =
            repo.stargazerCount != null ? repo.stargazerCount : repo.stargazers_count != null ? repo.stargazers_count : null;
          var forks = repo.forkCount != null ? repo.forkCount : repo.forks_count != null ? repo.forks_count : null;
          if (stars == null && forks == null) return;

          repoStatsCache[key] = {
            stars: stars != null ? stars : 0,
            forks: forks != null ? forks : 0,
          };
        });
      })
      .catch(function () {});

    return repoStatsLoadPromise;
  }

  function fetchRepoStatsFromApi(repo) {
    repo = normalizeRepoKey(repo);
    if (!repo) return Promise.resolve(null);

    return fetch("https://api.github.com/repos/" + repo)
      .then(function (res) {
        if (!res.ok) throw new Error("Repo not available");
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

  function getRepoStats(repo) {
    var key = normalizeRepoKey(repo);
    if (!key) return Promise.resolve(null);
    if (repoStatsCache[key]) return Promise.resolve(repoStatsCache[key]);

    loadRepoStatsFromProfileJson();

    return Promise.resolve(repoStatsLoadPromise)
      .then(function () {
        if (repoStatsCache[key]) return repoStatsCache[key];
        return fetchRepoStatsFromApi(key);
      })
      .then(function (stats) {
        if (stats) repoStatsCache[key] = stats;
        return stats;
      });
  }

  function fillCardStats() {
    document.querySelectorAll(".github-stars").forEach(function (el) {
      var repo = el.getAttribute("data-repo");
      if (!repo) return;
      getRepoStats(repo).then(function (stats) {
        setRepoStatsOnElement(el, stats);
      });
    });
  }

  function loadPhotoSwipe() {
    if (!photoswipeModulePromise) {
      photoswipeModulePromise = import(PHOTOSWIPE_URL);
    }
    return photoswipeModulePromise;
  }

  function normalizeImages(arr) {
    if (!Array.isArray(arr)) return [];
    return arr
      .map(function (i) {
        if (!i) return "";
        i = String(i).trim();
        if (i.indexOf("http") === 0 || i.indexOf("/") === 0) return i;
        if (i.indexOf(".") !== -1) return "/" + i;
        return "";
      })
      .filter(Boolean);
  }

  function imagesFromProject(card) {
    var images = [];
    try {
      images = JSON.parse(card.getAttribute("data-images") || "[]");
    } catch (e) {
      images = [];
    }
    images = normalizeImages(images);

    if (!images.length) {
      var img = card.querySelector(".clickable-image");
      if (img) images.push(img.getAttribute("data-full-src") || img.currentSrc || img.src);
    }

    return images;
  }

  function imageSizeFromCard(card, index) {
    var mainImg = card.querySelector(".clickable-image");
    if (index === 0 && mainImg && mainImg.naturalWidth && mainImg.naturalHeight) {
      return { width: mainImg.naturalWidth, height: mainImg.naturalHeight };
    }
    return { width: 1600, height: 1000 };
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function projectFooterHtml(meta) {
    var source = meta.sourceUrl
      ? '<a class="pswp-project-link" href="' + escapeHtml(meta.sourceUrl) + '" target="_blank" rel="noopener">Source</a>'
      : "";
    var demo = meta.demoUrl
      ? '<a class="pswp-project-link pswp-project-link-primary" href="' + escapeHtml(meta.demoUrl) + '" target="_blank" rel="noopener">Demo</a>'
      : "";
    var stats = meta.stats ? '<span class="pswp-project-stats">' + escapeHtml(formatStats(meta.stats)) + "</span>" : "";

    return (
      '<div class="pswp-project-caption">' +
      '<div class="pswp-project-copy">' +
      '<div class="pswp-project-title">' +
      escapeHtml(meta.title) +
      "</div>" +
      (meta.description ? '<div class="pswp-project-description">' + escapeHtml(meta.description) + "</div>" : "") +
      "</div>" +
      '<div class="pswp-project-actions">' +
      stats +
      source +
      demo +
      "</div>" +
      "</div>"
    );
  }

  function openProjectLightbox(card, clickedSrc) {
    var images = imagesFromProject(card);
    if (!images.length) return;

    var index = images.indexOf(clickedSrc);
    if (index < 0) index = 0;

    var repo = card.getAttribute("data-repo") || "";
    var meta = {
      title: (card.querySelector(".gallery-title") || {}).textContent || "",
      description: (card.querySelector(".gallery-description") || {}).textContent || "",
      sourceUrl: card.getAttribute("data-source") || "",
      demoUrl: card.getAttribute("data-demo") || "",
      stats: null,
    };

    Promise.all([loadPhotoSwipe(), getRepoStats(repo)]).then(function (results) {
      var PhotoSwipe = results[0].default;
      meta.stats = results[1];

      var pswp = new PhotoSwipe({
        dataSource: images.map(function (src, i) {
          var size = imageSizeFromCard(card, i);
          return {
            src: src,
            width: size.width,
            height: size.height,
            alt: meta.title,
          };
        }),
        index: index,
        bgOpacity: 0.92,
        padding: { top: 36, bottom: 108, left: 72, right: 72 },
        showHideAnimationType: "fade",
        wheelToZoom: true,
        arrowPrevTitle: "Previous",
        arrowNextTitle: "Next",
        closeTitle: "Close",
        zoomTitle: "Zoom",
      });

      pswp.on("uiRegister", function () {
        pswp.ui.registerElement({
          name: "project-caption",
          order: 9,
          isButton: false,
          appendTo: "root",
          html: projectFooterHtml(meta),
        });
      });

      pswp.init();
    });
  }

  function clickedProjectSrc(target, card) {
    if (target.classList.contains("project-thumb-img")) {
      return target.getAttribute("data-thumb-src") || target.getAttribute("src") || target.currentSrc || target.src;
    }

    var img = target.closest(".clickable-image");
    if (img) {
      var images = imagesFromProject(card);
      return images[0] || img.getAttribute("data-full-src") || img.currentSrc || img.src;
    }

    return "";
  }

  function onDocumentClick(event) {
    if (!event || !event.target || !event.target.closest) return;
    if (event.target.closest("a.btn")) return;

    var target = event.target;
    var card = target.closest(".project-item");
    if (!card) return;

    if (!target.closest(".clickable-image") && !target.classList.contains("project-thumb-img")) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    openProjectLightbox(card, clickedProjectSrc(target, card));
  }

  function initProjects() {
    cleanupListeners();
    controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    fillCardStats();
    loadRepoStatsFromProfileJson();
    addListener(document, "click", onDocumentClick, true);
  }

  document.addEventListener("DOMContentLoaded", initProjects);
  document.addEventListener("app:page-load", initProjects);
})();
