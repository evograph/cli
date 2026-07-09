import fs from "node:fs";
import path from "node:path";
const folders = [
    "objects",
    "refs",
    "index",
    "artifacts",
    "tmp",
];
export function initRepository() {
    const root = process.cwd();
    const evolution = path.join(root, ".evolution");
    if (fs.existsSync(evolution)) {
        console.log("Repository already initialized.");
        return;
    }
    fs.mkdirSync(evolution);
    for (const folder of folders) {
        fs.mkdirSync(path.join(evolution, folder), {
            recursive: true,
        });
    }
    console.log("Initialized ECS repository.");
}
//# sourceMappingURL=init.command.js.map