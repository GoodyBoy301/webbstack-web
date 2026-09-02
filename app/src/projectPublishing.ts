export type Visibility = "private" | "unlisted" | "public";

const reservedNames = new Set([
  "admin",
  "api",
  "dashboard",
  "help",
  "login",
  "settings",
  "support",
]);

export function slugifyProjectName(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "untitled-project";
}

export function validateUsername(username: string) {
  const value = username.trim().toLowerCase();
  if (!value) return "Add a username to publish your showcase.";
  if (!/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/.test(value)) {
    return "Use 3–30 lowercase letters, numbers, or hyphens.";
  }
  if (reservedNames.has(value)) return "That username is reserved.";
  return "";
}

export function validateSlug(slug: string) {
  const value = slug.trim().toLowerCase();
  if (!value) return "Add a project slug to publish your showcase.";
  if (!/^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])?$/.test(value)) {
    return "Use 3–60 lowercase letters, numbers, or hyphens.";
  }
  if (reservedNames.has(value)) return "That project slug is reserved.";
  return "";
}

export function publicProjectUrl(username: string, slug: string) {
  return `/@${username.trim().toLowerCase()}/${slug.trim().toLowerCase()}`;
}

export function parsePublicRoute(hash: string) {
  const match = hash.match(/^#public\/?@?([^/]+)\/([^/?#]+)\/?$/i);
  if (!match) return null;
  try {
    return {
      username: decodeURIComponent(match[1]).toLowerCase(),
      slug: decodeURIComponent(match[2]).toLowerCase(),
    };
  } catch {
    return null;
  }
}
