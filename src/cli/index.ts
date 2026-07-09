import { Command } from "commander";
import { browseCommand } from "#/features/explore/browse.command.js";
import { initRepository } from "#/features/init/init.command.js";
import { createCommand } from "#/features/create/create.command.js";
import { listObjectsCommand } from "#/features/objects/list.command.js";
import { showObject } from "#/features/explore/show.command.js";
import { linkObjects } from "#/features/graph/link.command.js";
import {
  neighborsCommand,
  ancestorsCommand,
  descendantsCommand,
} from "#/features/graph/traverse.command.js";
import { graphCommand } from "#/features/graph/graph.command.js";
import { RELATIONS } from "#/features/objects/edge/EdgeContent.js";

const program = new Command();

program
  .command("init")
  .description("Initialize ECS repository")
  .action(initRepository);

program
  .command("create [type]")
  .description("Create an object interactively (note, problem, decision)")
  .option("--author <name>", "Override the object author name")
  .option("--author-email <mail>", "Override the object author email")
  .action(createCommand);

program
  .command("show <id>")
  .description("Show an ECS object in a human-readable format")
  .action(showObject);

program
  .command("browse")
  .description("Interactively browse decisions/problems and follow links")
  .action(browseCommand);

program
  .command("list")
  .description("List all objects")
  .action(listObjectsCommand);

program
  .command("link <from> <to> <relation>")
  .description(`Link two objects (relations: ${RELATIONS.join(", ")})`)
  .option("--author <name>", "Override the edge author name")
  .option("--author-email <mail>", "Override the edge author email")
  .action(linkObjects);

program
  .command("neighbors <id>")
  .description("Show direct incoming and outgoing relationships")
  .action(neighborsCommand);

program
  .command("ancestors <id>")
  .description("Show all objects reachable via incoming edges")
  .action(ancestorsCommand);

program
  .command("descendants <id>")
  .description("Show all objects reachable via outgoing edges")
  .action(descendantsCommand);

program
  .command("graph <id>")
  .description("Show a textual graph starting from an object")
  .action(graphCommand);

program.parseAsync();
