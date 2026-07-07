import { ObjectRepository } from "#/repositories/ObjectRepository.js";
import { Note } from "#/types/Note.js";

const repository = new ObjectRepository();

export function createTestObject() {
  const note = new Note({
    title: "Hello ECS Object",
    body: "My first ECS object",
  });

  const { id, created } = repository.save(note);

  if (created) {
    console.log(`Evolved: new object recorded at ${id}`);
  } else {
    console.log(
      `No evolution: header and content are unchanged — this state already exists at ${id}`
    );
  }
}
