const simpleGit = require("simple-git/promise")(__dirname);
const path = require("path");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const queryString = require("query-string");

const fetchDependents = async (repoName, offsetId) => {
  const packageIdQueryParameters = offsetId ? { dependents_after: offsetId } : {};
  const url = `https://github.com/${repoName}/network/dependents?${queryString.stringify(
    packageIdQueryParameters
  )}`;

  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const dependents = $("#dependents .Box-row a:nth-of-type(2)")
    .map((index, element) => {
      const name = $(element).attr("href").slice(1);
      const url = `https://github.com/${name}`;
      return { name, url };
    })
    .get();

  const nextFetchUrl = $("#dependents div[data-test-selector=pagination] a:last-of-type")
    .first()
    .attr("href");
  const nextFetchUrlQueryParameters = queryString.parseUrl(nextFetchUrl).query;

  return {
    dependents,
    nextOffsetId: nextFetchUrlQueryParameters.dependents_after,
  };
};

const cloneRepo = async (name, url) => {
  const targetDir = path.join(__dirname, ".cache", name);

  try {
    await fs.promises.access(targetDir);
    throw new Error("Repository already exists");
  } catch (error) {
    if (error.message === "Repository already exists") throw error;
  }

  return simpleGit.clone(url, targetDir).then(() => targetDir);
};

module.exports = {
  fetchDependents,
  cloneRepo,
};
