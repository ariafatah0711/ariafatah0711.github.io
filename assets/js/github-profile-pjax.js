(function () {
  let profileDataCache = null;
  let loadingPromise = null;

  function initGithubProfile() {
    // Only run if github-profile wrapper exists
    if (!document.querySelector(".github-profile-wrapper")) return;

    loadProfileDataAndRender();
  }

  async function loadProfileDataAndRender() {
    try {
      // If already loading, wait for that promise
      if (loadingPromise) {
        const data = await loadingPromise;
        if (data) {
          renderProfileData(data);
        }
        return;
      }

      // If cached, use cache
      if (profileDataCache) {
        renderProfileData(profileDataCache);
        return;
      }

      // Start new load
      loadingPromise = loadProfileData();
      const data = await loadingPromise;
      loadingPromise = null;

      if (data) {
        profileDataCache = data;
        renderProfileData(data);
      }
    } catch (e) {
      loadingPromise = null;
      console.error("[GitHub Profile] Error:", e);
    }
  }

  const DEFAULT_PROFILE_DATA_URL =
    "https://raw.githubusercontent.com/ariafatah0711/ariafatah0711.github.io/refs/heads/data-cache/data/profile.json";

  const DEBUG_GITHUB_PROFILE = false;
  const debugLog = DEBUG_GITHUB_PROFILE ? console.log.bind(console) : function () {};

  function getProfileDataUrl() {
    try {
      const meta = document.querySelector('meta[name="github-profile-json-url"]');
      const fromMeta = meta && meta.getAttribute("content");
      if (fromMeta && String(fromMeta).trim()) return String(fromMeta).trim();
    } catch (e) {}
    return DEFAULT_PROFILE_DATA_URL;
  }

  async function loadProfileData() {
    try {
      debugLog("[GitHub Profile] Loading data from data-cache branch...");
      // Add cache-buster to prevent stale cache
      const url = getProfileDataUrl() + "?t=" + Date.now();
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        debugLog("[GitHub Profile] Data loaded");
        const converted = convertGraphQLDataToProfileFormat(data);
        if (converted) return converted;
      }
      throw new Error("Failed to load profile data");
    } catch (error) {
      console.error("[GitHub Profile] Error:", error.message);
      return null;
    }
  }

  function convertGraphQLDataToProfileFormat(graphqlData) {
    if (!graphqlData || !graphqlData.user) return null;

    const user = graphqlData.user;
    const repos = graphqlData.repositories?.nodes || user.repositories?.nodes || [];

    let totalStars = 0;
    let totalForks = 0;
    const langMap = {};

    repos.forEach((repo) => {
      totalStars += repo.stargazerCount || 0;
      totalForks += repo.forkCount || 0;
      if (repo.primaryLanguage?.name) {
        langMap[repo.primaryLanguage.name] = (langMap[repo.primaryLanguage.name] || 0) + 1;
      }
    });

    return {
      name: user.name,
      bio: user.bio,
      followers: user.followers?.totalCount || 0,
      following: user.following?.totalCount || 0,
      repos: repos.length,
      totalStars,
      totalForks,
      topLanguages: Object.entries(langMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang]) => lang),
    };
  }

  function renderProfileData(profileData) {
    var elements = {
      followers: document.querySelector('[data-gp-stat="followers"]'),
      following: document.querySelector('[data-gp-stat="following"]'),
      repos: document.querySelector('[data-gp-stat="repos"]'),
      commits: document.querySelector('[data-gp-stat="commits"]'),
      issues: document.querySelector('[data-gp-stat="issues"]'),
      prs: document.querySelector('[data-gp-stat="prs"]'),
      stars: document.querySelector('[data-gp-stat="stars"]'),
      forks: document.querySelector('[data-gp-stat="forks"]'),
      languages: document.querySelector('[data-gp-stat="languages"]'),
      topLanguages: document.querySelector('[data-gp-stat="top-languages"]'),
    };

    if (elements.followers) elements.followers.textContent = profileData.followers || "--";
    if (elements.following) elements.following.textContent = profileData.following || "--";
    if (elements.repos) elements.repos.textContent = profileData.repos || "--";
    if (elements.stars) elements.stars.textContent = profileData.totalStars || "--";
    if (elements.forks) elements.forks.textContent = profileData.totalForks || "--";
  }

  window.initGithubProfile = initGithubProfile;
  document.addEventListener("DOMContentLoaded", initGithubProfile);
})();
