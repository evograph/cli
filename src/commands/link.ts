import { resolveAuthor } from "#/config/author.js";
import { GraphRepository } from "#/repositories/GraphRepository.js";
import { isRelation, RELATIONS } from "#/types/EdgeContent.js";

const graph = new GraphRepository();

export type LinkOptions = {
  author?: string;
  authorEmail?: string;
};

export function linkObjects(
  from: string,
  to: string,
  relation: string,
  options: LinkOptions = {}
) {
  if (!isRelation(relation)) {
    console.error(
      `Unknown relation '${relation}'. Valid relations: ${RELATIONS.join(", ")}`
    );
    process.exitCode = 1;
    return;
  }

  const author = resolveAuthor({
    ...(options.author !== undefined ? { name: options.author } : {}),
    ...(options.authorEmail !== undefined ? { mail: options.authorEmail } : {}),
  });

  const result = graph.link(from, to, relation, author ? { author } : {});

  if (result.created) {
    console.log(`Linked: ${result.from}`);
    console.log(`  --[${result.relation}]--> ${result.to}`);
    console.log(`Edge recorded at ${result.edgeId}`);
  } else {
    console.log(
      `No evolution: this relationship already exists at ${result.edgeId}`
    );
  }
}
