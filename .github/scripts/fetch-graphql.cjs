#!/usr/bin/env node

const https = require("https");
const fs = require("fs");
const path = require("path");

const TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME;

function gql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });

    const req = https.request(
      {
        hostname: "api.github.com",
        path: "/graphql",
        method: "POST",
        headers: {
          "User-Agent": "GitHub-Profile-Generator",
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const QUERY = `
  query($login: String!) {
    user(login: $login) {
      name
      bio
      avatarUrl
      url
      followers { totalCount }
      following { totalCount }
      repositories(first: 100, orderBy: {field:UPDATED_AT, direction:DESC}) {
        nodes {
          name
          description
          url
          stargazerCount
          forkCount
          primaryLanguage { name color }
        }
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
              weekday
            }
          }
        }
      }
    }
  }
  `;

  console.log("Fetching GraphQL data...");

  const result = await gql(QUERY, { login: USERNAME });

  const outputPath = path.join(__dirname, "../../data/profile.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result.data, null, 2));

  console.log("Saved to data/profile.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
