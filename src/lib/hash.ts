import crypto from "node:crypto";

export function hashContent(url: string, title: string) {
  return crypto
    .createHash("sha256")
    .update(`${url.trim()}::${title.trim()}`)
    .digest("hex");
}
