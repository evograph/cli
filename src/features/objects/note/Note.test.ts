import { describe, expect, it } from "vitest";
import { Note } from "./Note.js";

describe("Note", () => {
  it("validates title and body", () => {
    expect(() =>
      new Note({ title: "t", body: "b" }).validate(),
    ).not.toThrow();
  });

  it("rejects whitespace-only title or body", () => {
    expect(() =>
      new Note({ title: "  ", body: "b" }).validate(),
    ).toThrow("Note title is required");
    expect(() =>
      new Note({ title: "t", body: "\n" }).validate(),
    ).toThrow("Note body is required");
  });

  it("round-trips through fromJSON", () => {
    const note = new Note(
      { title: "Hello", body: "World" },
      { createdAt: "2020-01-01T00:00:00.000Z", version: 1 },
    );
    const restored = Note.fromJSON(note.toJSON());

    expect(restored.type).toBe("note");
    expect(restored.content).toEqual({ title: "Hello", body: "World" });
  });
});
