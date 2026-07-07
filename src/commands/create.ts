import { resolveAuthor } from "#/config/author.js";
import { ObjectRepository } from "#/repositories/ObjectRepository.js";
import { Note } from "#/types/Note.js";

const repository = new ObjectRepository();

export type CreateOptions = {
  author?: string;
  authorEmail?: string;
};

export function createTestObject(options: CreateOptions = {}) {
  const author = resolveAuthor({
    ...(options.author !== undefined ? { name: options.author } : {}),
    ...(options.authorEmail !== undefined ? { mail: options.authorEmail } : {}),
  });

  const note = new Note(
    {
      title: "Hello ECS Object",
      body: "My first ECS object",
    },
    author ? { author } : {}
  );

  const { id, created } = repository.save(note);

  if (created) {
    console.log(`Evolved: new object recorded at ${id}`);
  } else {
    console.log(
      `No evolution: header and content are unchanged — this state already exists at ${id}`
    );
  }
}
