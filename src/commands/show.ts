import { ObjectRepository } from "#/repositories/ObjectRepository.js";

const repository = new ObjectRepository();

export function showObject(id: string) {
  const object = repository.load(id);

  console.log(JSON.stringify(object, null, 2));
}