!(function () {
  "use strict";
  try {
    self["workbox:sw:5.1.4"] && _();
  } catch (t) {}
  const t = {
    backgroundSync: "background-sync",
    broadcastUpdate: "broadcast-update",
    cacheableResponse: "cacheable-response",
    core: "core",
    expiration: "expiration",
    googleAnalytics: "offline-ga",
    navigationPreload: "navigation-preload",
    precaching: "precaching",
    rangeRequests: "range-requests",
    routing: "routing",
    strategies: "strategies",
    streams: "streams",
  };
  self.workbox = new (class {
    constructor() {
      return (
        (this.v = {}),
        (this.t = { debug: "localhost" === self.location.hostname, modulePathPrefix: null, modulePathCb: null }),
        (this.s = this.t.debug ? "dev" : "prod"),
        (this.o = !1),
        new Proxy(this, {
          get(e, s) {
            if (e[s]) return e[s];
            const o = t[s];
            return o && e.loadModule("workbox-" + o), e[s];
          },
        })
      );
    }
    setConfig(t = {}) {
      if (this.o) throw new Error("Config must be set before accessing workbox.* modules");
      Object.assign(this.t, t), (this.s = this.t.debug ? "dev" : "prod");
    }
    loadModule(t) {
      const e = this.i(t);
      try {
        importScripts(e), (this.o = !0);
      } catch (s) {
        throw (console.error(`Unable to import module '${t}' from '${e}'.`), s);
      }
    }
    i(t) {
      if (this.t.modulePathCb) return this.t.modulePathCb(t, this.t.debug);
      let e = ["https://storage.googleapis.com/workbox-cdn/releases/5.1.4"];
      const s = `${t}.${this.s}.js`,
        o = this.t.modulePathPrefix;
      return o && ((e = o.split("/")), "" === e[e.length - 1] && e.splice(e.length - 1, 1)), e.push(s), e.join("/");
    }
  })();
})();
//# sourceMappingURL=workbox-sw.js.map
