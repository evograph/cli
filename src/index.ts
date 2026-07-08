import { Command } from "commander";
import { browseCommand } from "#/commands/browse.js";
import { initRepository } from "#/commands/init.js";
import { createCommand } from "#/commands/create.js";
import { listObjectsCommand } from "#/commands/list.js";
import { showObject } from "#/commands/show.js";
import { linkObjects } from "#/commands/link.js";
import {
  neighborsCommand,
  ancestorsCommand,
  descendantsCommand,
  graphCommand,
} from "#/commands/graph.js";
import { RELATIONS } from "#/types/EdgeContent.js";

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
