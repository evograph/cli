import { ObjectRepository } from "#/features/objects/object.repository.js";
import { objectTitle } from "./object.view.js";
import { requireRepository } from "#/kernel/repository.js";
const repository = new ObjectRepository();

export function listObjectsCommand(
  options: { json?: boolean; ids?: boolean } = {},
) {
  requireRepository();
  const ids = repository.list();
  if (options.ids) {
    console.log(ids.join("\n"));
    return;
  }
  const records = ids
    .flatMap((id) => {
      try {
        const object = repository.load(id);
        return object.type === "edge"
          ? []
          : [
              {
                id,
                type: object.type,
                title: objectTitle(object),
                createdAt: object.metadata.createdAt,
              },
            ];
      } catch {
        return [];
      }
    })
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
    );
  if (options.json) console.log(JSON.stringify(records, null, 2));
  else if (!records.length)
    console.log(
      'No reasoning saved yet. Try: ecs remember "Choice" --because "Reason"',
    );
  else
    for (const record of records)
      console.log(
        `${record.id.slice(0, 8)}  ${record.type.padEnd(8)}  ${record.title}`,
      );
}
