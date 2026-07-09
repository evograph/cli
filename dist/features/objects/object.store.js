import fs from "node:fs";
import path from "node:path";
import { OBJECTS_DIR } from "../../kernel/paths.js";
function getTypeFolder(type) {
    switch (type) {
        case "note":
            return "notes";
        case "problem":
            return "problems";
        case "decision":
            return "decisions";
        case "edge":
            return "edges";
        case "change":
            return "changes";
        default:
            return "misc";
    }
}
function getLegacyObjectPath(id) {
    const dir = id.substring(0, 2);
    const file = id.substring(2);
    return path.join(OBJECTS_DIR, dir, file);
}
function getTypedObjectPath(type, id) {
    const dir = id.substring(0, 2);
    const file = id.substring(2);
    return path.join(OBJECTS_DIR, getTypeFolder(type), dir, file);
}
function findObjectPath(id) {
    const legacyPath = getLegacyObjectPath(id);
    if (fs.existsSync(legacyPath)) {
        return legacyPath;
    }
    const typeFolders = ["notes", "problems", "decisions", "edges", "changes", "misc"];
    for (const folder of typeFolders) {
        const typedPath = path.join(OBJECTS_DIR, folder, id.substring(0, 2), id.substring(2));
        if (fs.existsSync(typedPath)) {
            return typedPath;
        }
    }
    return undefined;
}
export function resolveObjectId(input) {
    if (objectExists(input)) {
        return input;
    }
    const allIds = listObjects();
    const matches = allIds.filter((id) => id.startsWith(input) ||
        id.substring(2) === input ||
        id.substring(2).startsWith(input));
    if (matches.length === 1) {
        return matches[0];
    }
    if (matches.length > 1) {
        throw new Error(`Ambiguous object id '${input}'. Matches: ${matches.join(", ")}`);
    }
    throw new Error(`Object '${input}' not found.`);
}
export function saveObject(record, id) {
    const filePath = getTypedObjectPath(record.header.type, id);
    fs.mkdirSync(path.dirname(filePath), {
        recursive: true,
    });
    const created = !fs.existsSync(filePath);
    if (created) {
        fs.writeFileSync(filePath, JSON.stringify(record), "utf8");
    }
    return { id, created };
}
export function loadObject(id) {
    const resolvedId = resolveObjectId(id);
    const filePath = findObjectPath(resolvedId);
    if (!filePath) {
        throw new Error(`Object '${resolvedId}' not found.`);
    }
    const json = fs.readFileSync(filePath, "utf8");
    return JSON.parse(json);
}
export function objectExists(id) {
    return findObjectPath(id) !== undefined;
}
export function listObjects() {
    if (!fs.existsSync(OBJECTS_DIR)) {
        return [];
    }
    const ids = new Set();
    for (const topLevelEntry of fs.readdirSync(OBJECTS_DIR)) {
        const topLevelPath = path.join(OBJECTS_DIR, topLevelEntry);
        if (!fs.statSync(topLevelPath).isDirectory()) {
            continue;
        }
        // Backward-compatible: legacy layout at objects/<shard>/<hash>
        if (/^[a-f0-9]{2}$/.test(topLevelEntry)) {
            for (const file of fs.readdirSync(topLevelPath)) {
                ids.add(topLevelEntry + file);
            }
            continue;
        }
        // Typed layout: objects/<type-folder>/<shard>/<hash>
        for (const shardDir of fs.readdirSync(topLevelPath)) {
            if (!/^[a-f0-9]{2}$/.test(shardDir)) {
                continue;
            }
            const shardPath = path.join(topLevelPath, shardDir);
            if (!fs.statSync(shardPath).isDirectory()) {
                continue;
            }
            for (const file of fs.readdirSync(shardPath)) {
                ids.add(shardDir + file);
            }
        }
    }
    return [...ids];
}
//# sourceMappingURL=object.store.js.map