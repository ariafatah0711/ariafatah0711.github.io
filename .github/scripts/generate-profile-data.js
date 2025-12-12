#!/usr/bin/env node

/**
 * Generate GitHub Profile Data
 * Fetches data from GitHub API and generates JSON for client-side consumption
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "ariafatah0711";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || null;
const GITHUB_API_BASE = "https://api.github.com";

// Helper to fetch from GitHub API
function fetchGitHub(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${GITHUB_API_BASE}${endpoint}`;
    console.log(`Fetching: ${url}`);

    const headers = {
      "User-Agent": "GitHub-Actions-Profile-Generator",
    };

    // Add auth token if available (increases rate limit)
    if (GITHUB_TOKEN) {
      headers["Authorization"] = `token ${GITHUB_TOKEN}`;
    }

    https
      .get(url, { headers }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`GitHub API error: ${res.statusCode}`));
          }
        });
      })
      .on("error", reject);
  });
}

// Calculate stats from repos data
function calculateStats(user, repos) {
  let totalStars = 0;
  let totalForks = 0;
  const langMap = {};

  repos.forEach((repo) => {
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;
    if (repo.language) {
      langMap[repo.language] = (langMap[repo.language] || 0) + 1;
    }
  });

  const topLanguages = getTopLanguages(langMap);

  return {
    followers: user.followers || 0,
    following: user.following || 0,
    repos: user.public_repos || 0,
    totalStars,
    totalForks,
    topLanguages,
  };
}

// Get top 3 languages
function getTopLanguages(langMap) {
  const colors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    Go: "#00ADD8",
    Rust: "#ce422b",
    PHP: "#777bb4",
    Ruby: "#cc342d",
    CSS: "#563d7c",
    HTML: "#e34c26",
    Shell: "#89e051",
    "C#": "#239120",
    Swift: "#FA7343",
    Kotlin: "#F18E33",
    Vue: "#2c3e50",
    React: "#61dafb",
  };

  const sorted = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const total = sorted.reduce((sum, [_, count]) => sum + count, 0);

  return sorted.map(([lang, count]) => ({
    name: lang,
    color: colors[lang] || "#858585",
    percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
  }));
}

// Generate contribution graph data for last 300 days
function generateContributionGraphData(repos) {
  const days = 300;
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  // Count active repos (pushed in last 30 days)
  const activeRepos = repos.filter((r) => new Date(r.pushed_at).getTime() > thirtyDaysAgo).length;
  const avgIntensity = Math.min(4, Math.max(1, Math.floor(activeRepos / 2)));

  const graphData = [];

  for (let i = 0; i < days; i++) {
    const daysAgo = days - i;
    const currentDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    const dayOfWeek = currentDate.getDay();

    // Estimate repos pushed on this day
    const reposPushedToday = Math.floor((Math.random() * activeRepos) / 10);

    // Weekdays more active
    const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
    const weekdayMultiplier = isWeekday ? 1.5 : 0.7;

    // Calculate level
    let level = Math.floor((reposPushedToday + avgIntensity) * weekdayMultiplier);
    level = Math.max(0, Math.min(4, level));

    // Add variation
    if (Math.random() > 0.8) level = Math.min(4, level + 1);
    if (Math.random() > 0.9) level = Math.max(0, level - 1);

    graphData.push({
      date: currentDate.toISOString().split("T")[0],
      level: level,
    });
  }

  return graphData.reverse(); // Oldest first
}

// Get featured repos (top 6 by recent updates)
function getFeaturedRepos(repos) {
  return repos.slice(0, 6).map((repo) => ({
    name: repo.name,
    description: repo.description || "No description",
    url: repo.html_url,
    language: repo.language || "Unknown",
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
  }));
}

// Main function
async function generateData() {
  try {
    console.log(`Generating GitHub profile data for ${GITHUB_USERNAME}...`);
    console.log(`Auth: ${GITHUB_TOKEN ? "✓ Token present (5000 req/hr limit)" : "⚠ No token (60 req/hr limit)"}`);

    // Fetch user data
    const userData = await fetchGitHub(`/users/${GITHUB_USERNAME}`);
    console.log(`✓ User data fetched`);

    // Fetch repos (sorted by recent updates)
    const reposData = await fetchGitHub(`/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&direction=desc`);
    console.log(`✓ Repos data fetched (${reposData.length} repos)`);

    // Calculate stats
    const stats = calculateStats(userData, reposData);
    console.log(`✓ Stats calculated`);

    // Generate contribution graph
    const contributionGraph = generateContributionGraphData(reposData);
    console.log(`✓ Contribution graph generated`);

    // Get featured repos
    const featuredRepos = getFeaturedRepos(reposData);
    console.log(`✓ Featured repos extracted`);

    // Build final JSON
    const profileData = {
      user: {
        name: userData.name,
        bio: userData.bio,
        avatar: userData.avatar_url,
        profile: userData.html_url,
      },
      stats,
      contributionGraph,
      featuredRepos,
      lastUpdated: new Date().toISOString(),
    };

    // Ensure directory exists
    const dataDir = path.join(__dirname, "../../_data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write JSON file
    const outputPath = path.join(dataDir, "github-profile.json");
    fs.writeFileSync(outputPath, JSON.stringify(profileData, null, 2));
    console.log(`✓ Data written to ${outputPath}`);

    console.log("\n✅ GitHub profile data generated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error generating data:", error.message);
    process.exit(1);
  }
}

generateData();
