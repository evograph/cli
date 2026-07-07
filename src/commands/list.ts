import { ObjectRepository } from "#/repositories/ObjectRepository.js";

const repository = new ObjectRepository();

export function listObjectsCommand() {
  const ids = repository.list();

  if (ids.length === 0) {
    console.log("No objects found.");
    return;
  }

  for (const id of ids) {
    console.log(id);
  }
}