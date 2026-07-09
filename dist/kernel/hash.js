import crypto from "node:crypto";
export function hash(content) {
    return crypto
        .createHash("sha256")
        .update(content)
        .digest("hex");
}
//# sourceMappingURL=hash.js.map