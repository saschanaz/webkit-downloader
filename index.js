import fetch from "node-fetch";
import unzipper from "unzipper";
import { fetchAsJson, getBuilds } from "./lib.js";

const { builds } = await getBuilds(27 /* WinCairo-64-bit-WKL-Release-Build */, [
  "revision",
]);

const latestCompleteBuild = builds.find((build) => build.complete);

const { properties } = latestCompleteBuild;
const [revision] = properties.revision;

console.log(`Fetching and unzipping ${revision}.zip...`);
const binary = await fetch(
  `https://s3-us-west-2.amazonaws.com/archives.webkit.org/wincairo-x86_64-release/${revision}.zip`
);

binary.body.pipe(unzipper.Extract({ path: `downloads/${revision}` }));

const releases = await fetchAsJson(
  "https://api.github.com/repos/WebKitForWindows/WebKitRequirements/releases"
);
const latestAssets = await fetchAsJson(releases[0].assets_url);

console.log(
  `Fetching and unzipping WebKitRequirements ${releases[0].tag_name}...`
);
const assetWin64 = latestAssets.find((asset) => asset.name.includes("Win64"));

const assetBinary = await fetch(assetWin64.browser_download_url);

assetBinary.body.pipe(unzipper.Extract({ path: `downloads/${revision}` }));
