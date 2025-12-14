(function () {
  function getThreadEl() {
    return document.getElementById("disqus_thread");
  }

  function getConfigFromDom(threadEl) {
    if (!threadEl) return null;
    var shortname = threadEl.getAttribute("data-disqus-shortname");
    if (!shortname) return null;

    var url = threadEl.getAttribute("data-disqus-url");
    var identifier = threadEl.getAttribute("data-disqus-identifier");
    var title = threadEl.getAttribute("data-disqus-title");

    // sensible fallbacks for PJAX cases
    var cleanHref = String(window.location.href || "").split("#")[0];
    if (!url) url = cleanHref;
    if (!identifier) identifier = window.location.pathname || cleanHref;
    if (!title) title = document.title || "";

    return {
      shortname: String(shortname).trim(),
      url: String(url),
      identifier: String(identifier),
      title: String(title),
    };
  }

  function ensureEmbedScript(shortname) {
    if (!shortname) return;

    // Already loaded?
    if (document.querySelector('script[data-disqus-embed="true"]')) return;

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://" + shortname + ".disqus.com/embed.js";
    s.setAttribute("data-timestamp", String(+new Date()));
    s.setAttribute("data-disqus-embed", "true");
    (document.head || document.body).appendChild(s);
  }

  function initDisqus() {
    var threadEl = getThreadEl();
    if (!threadEl) return;

    var cfg = getConfigFromDom(threadEl);
    if (!cfg || !cfg.shortname) return;

    // If Disqus is already present, use reset() for AJAX/PJAX navigations.
    if (window.DISQUS && typeof window.DISQUS.reset === "function") {
      try {
        window.DISQUS.reset({
          reload: true,
          config: function () {
            this.page.identifier = cfg.identifier;
            this.page.url = cfg.url;
            this.page.title = cfg.title;
          },
        });
      } catch (e) {
        // fall back to ensuring embed is present
        ensureEmbedScript(cfg.shortname);
      }
      return;
    }

    // First load
    ensureEmbedScript(cfg.shortname);
  }

  // initial load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDisqus, { passive: true });
  } else {
    initDisqus();
  }

  // PJAX / custom lifecycle
  document.addEventListener("afterPjax", initDisqus, { passive: true });
  document.addEventListener("pjax:success", initDisqus, { passive: true });
})();
