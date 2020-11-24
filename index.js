import fetch from "node-fetch";
import unzipper from "unzipper";

const webkitJsonUrl = "https://build.webkit.org/json/";

/**
 * @param {string} path
 */
async function fetchAsJson(path, baseUrl) {
  const response = await fetch(new URL(path, baseUrl));
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await response.json();
}

/**
 * @param {string} path
 */
function fetchAsJsonFromWebKitOrg(path) {
  return fetchAsJson(path, webkitJsonUrl);
}

/**
 * @param {[string, any, string][]} properties
 */
async function propertiesAsMap(properties) {
  return new Map(properties.map(
    property => [
      property[0],
      { value: property[1], source: property[2] }
    ]
  ));
}

const builders = await fetchAsJsonFromWebKitOrg("builders/WinCairo-64-bit-WKL-Release-Build");

const latestBuild = builders.cachedBuilds[builders.cachedBuilds.length - 1];

const build = await fetchAsJsonFromWebKitOrg(`builders/WinCairo-64-bit-WKL-Release-Build/builds/${latestBuild}`);

const properties = await propertiesAsMap(build.properties);

const revision = properties.get("revision").value;

console.log(`Fetching and unzipping ${revision}.zip...`);
const binary = await fetch(`https://s3-us-west-2.amazonaws.com/archives.webkit.org/wincairo-x86_64-release/${revision}.zip`);

binary.body.pipe(unzipper.Extract({ path: revision }));

const releases = await fetchAsJson("https://api.github.com/repos/WebKitForWindows/WebKitRequirements/releases");
const latestAssets = await fetchAsJson(releases[0].assets_url);

console.log(`Fetching and unzipping WebKitRequirements ${releases[0].tag_name}...`);
const assetWin64 = latestAssets.find(asset => asset.name.includes("Win64"));

const assetBinary = await fetch(assetWin64.browser_download_url);

assetBinary.body.pipe(unzipper.Extract({ path: revision }));
