import { existsSync } from "node:fs";
import markdownIt from "markdown-it";

export default function (eleventyConfig) {
  eleventyConfig.setLibrary("md", markdownIt({
    html: true,
    linkify: false,
    typographer: false
  }));

  eleventyConfig.setLiquidOptions({
    dynamicPartials: false,
    strictFilters: false
  });

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
