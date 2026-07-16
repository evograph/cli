import { describe, expect, it } from "vitest";
import { Note } from "#/features/objects/note/Note.js";

describe("ECSObject", () => {
  it("defaults schemaVersion, createdAt, and version", () => {
    const note = new Note({ title: "t", body: "b" });

    expect(note.schemaVersion).toBe(1);
    expect(note.metadata.version).toBe(1);
    expect(note.metadata.createdAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    );
    expect(note.metadata.author).toBeUndefined();
  });

  it("preserves explicit metadata and omits author when unset", () => {
    const note = new Note(
      { title: "t", body: "b" },
      { createdAt: "2020-01-01T00:00:00.000Z", version: 3 },
    );

    expect(note.metadata).toEqual({
      createdAt: "2020-01-01T00:00:00.000Z",
      version: 3,
    });
  });

  it("includes author only when provided", () => {
    const note = new Note(
      { title: "t", body: "b" },
      { author: { name: "Ada", mail: "ada@example.com" } },
    );

    expect(note.metadata.author).toEqual({
      name: "Ada",
      mail: "ada@example.com",
    });
  });

  it("canonicalize excludes metadata so content-equal objects hash the same", () => {
    const a = new Note(
      { title: "same", body: "body" },
      { createdAt: "2020-01-01T00:00:00.000Z", author: { name: "A" } },
    );
    const b = new Note(
      { title: "same", body: "body" },
      { createdAt: "2021-01-01T00:00:00.000Z", author: { name: "B" } },
    );

    expect(a.canonicalize()).toBe(b.canonicalize());
    expect(a.toJSON().metadata).not.toEqual(b.toJSON().metadata);
  });

  it("toJSON includes header, content, and metadata", () => {
    const note = new Note(
      { title: "t", body: "b" },
      { createdAt: "2020-01-01T00:00:00.000Z", version: 1 },
    );

    expect(note.toJSON()).toEqual({
      header: { type: "note", schemaVersion: 1 },
      content: { title: "t", body: "b" },
      metadata: { createdAt: "2020-01-01T00:00:00.000Z", version: 1 },
    });
  });
});
