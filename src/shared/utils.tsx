import slugify from "slugify";

export function makeSlug(text: string) {
  return slugify(text, {
    lower: true, // Convert to lowercase
    strict: true, // Remove special characters
    replacement: "-", // Replace spaces with hyphens (default)
  });
}
