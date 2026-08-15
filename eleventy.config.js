import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import markdownIt from "markdown-it";
import { DateTime } from "luxon";
import { parseFragment } from "parse5";
import YAML from "yaml";

const SITE_ORIGIN = "https://ariaf.my.id";
const TIME_ZONE = "Asia/Jakarta";

function asDateTime(value) {
  if (value instanceof Date) return DateTime.fromJSDate(value, { zone: "utc" }).setZone(TIME_ZONE);
  return DateTime.fromISO(String(value), { zone: TIME_ZONE });
}

function textContent(node) {
  if (node.nodeName === "#text") return node.value;
  return (node.childNodes || []).map(textContent).join("");
}

function normalizePost(item) {
  const sourceSlug = item.inputPath.split(/[\\/]/).at(-1)
    .replace(/\.md$/, "")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const post = {
    ...item.data,
    date: item.date,
    id: `/blog/${sourceSlug}`,
    inputPath: item.inputPath,
    outputPath: item.outputPath,
    url: item.url
  };
  Object.defineProperty(post, "content", {
    get: () => item.templateContent
  });
  return post;
}

export default function (eleventyConfig) {
  eleventyConfig.addDataExtension("yml", (contents) => YAML.parse(contents));

  eleventyConfig.setLibrary("md", markdownIt({
    html: true,
    linkify: false,
    typographer: false
  }));

  eleventyConfig.setLiquidOptions({
    dynamicPartials: false,
    strictFilters: false
  });

  eleventyConfig.addUrlTransform(({ url, urlStem }) => {
    if (url.endsWith(".html") && url !== "/404.html") return urlStem;
    return url;
  });

  for (const name of ["about", "default", "github_profile", "link", "page", "post", "repo_post", "tag"]) {
    eleventyConfig.addLayoutAlias(name, `layouts/${name}.html`);
  }

  eleventyConfig.addFilter("relative_url", (value = "") => {
    const route = String(value);
    return route.startsWith("/") ? route : `/${route}`;
  });
  eleventyConfig.addFilter("absolute_url", (value = "") =>
    new URL(String(value).replace(/^\/+/, ""), `${SITE_ORIGIN}/`).href
  );
  eleventyConfig.addFilter("date_to_xmlschema", (value) => asDateTime(value).toISO({ suppressMilliseconds: true }));
  eleventyConfig.addFilter("date", (value, format) => {
    const date = asDateTime(value);
    const formats = {
      "%d.%m.%Y": "dd.MM.yyyy",
      "%b %-d, %Y": "MMM d, yyyy"
    };
    return date.setLocale("en").toFormat(formats[format] || format);
  });
  eleventyConfig.addFilter("jsonify", (value) => JSON.stringify(value) ?? "null");
  eleventyConfig.addFilter("sha1", (value) => createHash("sha1").update(String(value)).digest("hex"));
  eleventyConfig.addFilter("strip_html", (value = "") => textContent(parseFragment(String(value))));
  eleventyConfig.addFilter("strip_newlines", (value = "") => String(value).replace(/[\r\n]+/g, ""));
  eleventyConfig.addFilter("xml_escape", (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;"));
  eleventyConfig.addFilter("uri_escape", (value = "") => encodeURI(String(value)));
  eleventyConfig.addFilter("cgi_escape", (value = "") => encodeURIComponent(String(value)).replaceAll("%20", "+"));
  eleventyConfig.addFilter("to_s", (value = "") => String(value));
  eleventyConfig.addFilter("slugify", (value = "") => String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""));
  eleventyConfig.addFilter("post_for_url", (posts = [], url = "") =>
    posts.find((post) => post.url === url)
  );

  eleventyConfig.addPreprocessor("jekyll-post-data", ["md"], function (data) {
    const inputPath = this.inputPath.replaceAll("\\", "/");
    if (!inputPath.includes("/src/content/posts/")) return;

    data.published_date = data.date;
    data.slug = inputPath.split("/").at(-1)
      .replace(/\.md$/, "")
      .replace(/^\d{4}-\d{2}-\d{2}-/, "");

    if (typeof data.permalink === "string" && !data.permalink.endsWith(".html")) {
      data.legacy_permalink = data.permalink;
      data.permalink = `${data.permalink}.html`;
    }
  });

  eleventyConfig.addCollection("posts", (collectionApi) => {
    const items = collectionApi.getFilteredByGlob("src/content/posts/*.md")
      .sort((left, right) => right.date - left.date);
    const posts = items.map(normalizePost);
    posts.forEach((post, index) => {
      post.next = posts[index - 1];
      post.previous = posts[index + 1];
    });
    return posts;
  });

  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tags = new Set();
    for (const item of collectionApi.getFilteredByGlob("src/content/posts/*.md")) {
      for (const tag of item.data.tags || []) tags.add(tag);
    }
    return [...tags].sort();
  });

  eleventyConfig.addCollection("tagPairs", (collectionApi) => {
    const pairs = new Map();
    for (const item of collectionApi.getFilteredByGlob("src/content/posts/*.md")) {
      for (const tag of item.data.tags || []) {
        if (!pairs.has(tag)) pairs.set(tag, []);
        pairs.get(tag).push(normalizePost(item));
      }
    }
    for (const posts of pairs.values()) posts.sort((left, right) => right.date - left.date);
    return [...pairs.entries()].sort(([left], [right]) => left.localeCompare(right));
  });

  eleventyConfig.addGlobalData("build", { time: new Date() });

  eleventyConfig.ignores.add("src/content/drafts/**");

  if (existsSync("public")) {
    eleventyConfig.addPassthroughCopy({ public: "/" });
  }

  return {
    pathPrefix: "/",
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    },
    templateFormats: ["liquid", "html", "md"],
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
    dataTemplateEngine: "liquid"
  };
}
