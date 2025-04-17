export const containerWidth = 600;

export const postsPerPage = 20;

export function getGardenExtraBaseUrl() {
  if (window.location.hostname === "localhost") {
    return "http://localhost:3030/";
  } else {
    return "https://garden-extra.grantcuster.com/";
  }
}
