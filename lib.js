import fetch from "node-fetch";

const buildApiV2 = `https://build.webkit.org/api/v2/`;

export async function fetchAsJson(path, baseUrl) {
  const response = await fetch(new URL(path, baseUrl));
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await response.json();
}

/**
 * @param {number} builder
 * @param {string[]} properties
 */
export function getBuilds(builder, properties) {
  const url = new URL(`builders/${Number(builder)}/builds`, buildApiV2);
  url.searchParams.set("limit", 20);
  url.searchParams.set("order", "-number");
  for (const property of properties) {
    url.searchParams.append("property", property);
  }
  return fetchAsJson(url);
}
