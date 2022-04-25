import fetch from "node-fetch";
import unzipper from "unzipper";
import { fetchAsJson, getBuilds } from "./lib.js";

const { builds } = await getBuilds(27 /* WinCairo-64-bit-WKL-Release-Build */, [
  "identifier",
]);

const latestSuccessfulBuild = builds.find(
  (build) => build.state_string === "build successful"
);

const { properties } = latestSuccessfulBuild;
const [identifier] = properties.identifier;

console.log(`Fetching and unzipping ${identifier}.zip...`);
const binary = await fetch(
  `https://s3-us-west-2.amazonaws.com/archives.webkit.org/wincairo-x86_64-release/${identifier}.zip`
);

binary.body.pipe(unzipper.Extract({ path: `downloads/${identifier}` }));

const releases = await fetchAsJson(
  "https://api.github.com/repos/WebKitForWindows/WebKitRequirements/releases"
);
const latestAssets = await fetchAsJson(releases[0].assets_url);

console.log(
  `Fetching and unzipping WebKitRequirements ${releases[0].tag_name}...`
);
const assetWin64 = latestAssets.find((asset) => asset.name.includes("Win64"));

const assetBinary = await fetch(assetWin64.browser_download_url);

assetBinary.body.pipe(unzipper.Extract({ path: `downloads/${identifier}` }));
