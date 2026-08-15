(function () {
  "use strict";

  function getRedirectNode() {
    return document.querySelector("[data-redirect-handler]");
  }

  function readAttr(node, name) {
    if (!node) return "";
    var value = node.getAttribute(name);
    return value ? String(value) : "";
  }

  function isProbablyExternal(url) {
    return /^https?:\/\//i.test(url) || /^\/\//.test(url);
  }

  function stripHash(url) {
    var idx = url.indexOf("#");
    return idx >= 0 ? url.slice(0, idx) : url;
  }

  function resolveUrl(href) {
    try {
      return new URL(href, window.location.href);
    } catch (e) {
      return null;
    }
  }

  function getResolvedCurrentUrl() {
    return window.location.origin + window.location.pathname + window.location.search;
  }

  function getResolvedUrlKey(urlObj) {
    if (!urlObj) return "";
    return urlObj.origin + urlObj.pathname + urlObj.search;
  }

  function swupNavigate(href, historyMode) {
    // Prefer Swup navigation when available.
    // Use Swup API instead of programmatic clicks to avoid full reloads.
    var urlObj = resolveUrl(href);
    if (!urlObj) {
      window.location.assign(href);
      return;
    }

    // External redirects must be full navigations.
    if (urlObj.origin !== window.location.origin) {
      window.location.assign(urlObj.href);
      return;
    }

    var swup = window.__swup;
    if (swup && window.__swupInitialized && typeof swup.loadPage === "function") {
      var urlForSwup = urlObj.pathname + urlObj.search + urlObj.hash;
      // Defer to avoid triggering navigation mid-transition.
      setTimeout(function () {
        try {
          swup.loadPage({ url: urlForSwup, history: historyMode || "replace" });
        } catch (e) {
          window.location.assign(urlObj.href);
        }
      }, 0);
      return;
    }

    window.location.assign(urlObj.href);
  }

  function handleRedirect() {
    var node = getRedirectNode();
    if (!node) return;

    // Prevent loops on the same url+hash
    var key = window.location.pathname + window.location.search + window.location.hash;
    if (window.__redirectLastKey === key) return;
    window.__redirectLastKey = key;

    var redirectUrl = readAttr(node, "data-redirect-url");
    var nextUrl = readAttr(node, "data-next-url");
    var prevUrl = readAttr(node, "data-prev-url");

    // 1) Primary redirect (used by link/redirect pages)
    if (redirectUrl) {
      var target = resolveUrl(redirectUrl);
      var currentKey = getResolvedCurrentUrl();
      var targetKey = getResolvedUrlKey(target);

      // If the redirect points to itself (common with url_to_redirect: "./slug"),
      // continue to next/prev based on hash markers.
      if (targetKey && targetKey === currentKey) {
        var h = window.location.hash;
        if (h === "#next" && nextUrl) {
          swupNavigate(nextUrl, "replace");
          return;
        }
        if (h === "#prev" && prevUrl) {
          swupNavigate(prevUrl, "replace");
          return;
        }

        // No direction info; avoid infinite loops.
        return;
      }

      // Normal redirect.
      if (isProbablyExternal(redirectUrl)) {
        window.location.assign(redirectUrl);
        return;
      }

      swupNavigate(redirectUrl, "replace");
      return;
    }

    // 2) Optional hash-based navigation helper (legacy)
    // If someone lands on a page with #next/#prev, keep moving.
    var hash = window.location.hash;
    if (hash === "#next" && nextUrl) {
      swupNavigate(nextUrl);
      return;
    }

    if (hash === "#prev" && prevUrl) {
      swupNavigate(prevUrl);
      return;
    }

    // 3) If the url includes only a hash with no redirect, do nothing.
  }

  if (!window.__redirectHandlerBound) {
    window.__redirectHandlerBound = true;

    document.addEventListener("DOMContentLoaded", handleRedirect);
    document.addEventListener("app:page-load", handleRedirect);

    // hash changes without page loads
    window.addEventListener("hashchange", handleRedirect);
  }
})();
