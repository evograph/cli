import {
  getMockPaths,
  useEvolutionFixture,
} from "#/test/evolution-fixture.js";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

useEvolutionFixture();

async function store() {
  return import("./object.store.js");
}

function sampleRecord(type = "note") {
  return {
    header: { type, schemaVersion: 1 },
    content: { title: "t", body: "b" },
    metadata: { createdAt: "2020-01-01T00:00:00.000Z", version: 1 },
  };
}

describe("object.store", () => {
  it("saves under typed shard layout and does not overwrite", async () => {
    const {
      saveObject,
      loadObject,
      objectExists,
      listObjects,
    } = await store();
    const id = "aa" + "b".repeat(62);

    const first = saveObject(sampleRecord(), id);
    const second = saveObject(
      {
        ...sampleRecord(),
        content: { title: "changed", body: "nope" },
      },
      id,
    );

    expect(first).toEqual({ id, created: true });
    expect(second).toEqual({ id, created: false });
    expect(objectExists(id)).toBe(true);
    expect(loadObject(id).content).toEqual({ title: "t", body: "b" });
    expect(listObjects()).toEqual([id]);

    const expectedPath = path.join(
      getMockPaths().OBJECTS_DIR,
      "notes",
      "aa",
      "b".repeat(62),
    );
    expect(fs.existsSync(expectedPath)).toBe(true);
  });

  it("maps unknown types to misc/", async () => {
    const { saveObject } = await store();
    const id = "ff" + "0".repeat(62);
    saveObject(sampleRecord("widget"), id);

    expect(
      fs.existsSync(
        path.join(getMockPaths().OBJECTS_DIR, "misc", "ff", "0".repeat(62)),
      ),
    ).toBe(true);
  });

  it("reads legacy layout objects", async () => {
    const { loadObject, listObjects, objectExists } = await store();
    const id = "ab" + "c".repeat(62);
    const legacyPath = path.join(
      getMockPaths().OBJECTS_DIR,
      "ab",
      "c".repeat(62),
    );
    fs.mkdirSync(path.dirname(legacyPath), { recursive: true });
    fs.writeFileSync(legacyPath, JSON.stringify(sampleRecord()), "utf8");

    expect(objectExists(id)).toBe(true);
    expect(loadObject(id).header.type).toBe("note");
    expect(listObjects()).toContain(id);
  });

  it("resolves unique prefixes and rejects ambiguous ones", async () => {
    const { saveObject, resolveObjectId } = await store();
    const id1 = "aaaa1111" + "1".repeat(56);
    const id2 = "aaaa2222" + "2".repeat(56);
    saveObject(sampleRecord(), id1);
    saveObject(sampleRecord("problem"), id2);

    expect(resolveObjectId("aaaa1111")).toBe(id1);
    expect(resolveObjectId(id1.substring(2))).toBe(id1);

    expect(() => resolveObjectId("aaaa")).toThrow(/Ambiguous object id/);
    expect(() => resolveObjectId("deadbeef")).toThrow(/not found/);
  });

  it("returns an empty list when objects dir is missing", async () => {
    const { listObjects } = await store();
    fs.rmSync(getMockPaths().OBJECTS_DIR, { recursive: true, force: true });
    expect(listObjects()).toEqual([]);
  });
});
