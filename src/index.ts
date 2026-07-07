import { Command } from "commander";
import { initRepository } from "#/commands/init.js";
import { createTestObject } from "#/commands/create.js";
import { listObjectsCommand } from "#/commands/list.js";
import { showObject } from "./commands/show.js";

const program = new Command();

program
  .command("init")
  .description("Initialize ECS repository")
  .action(initRepository);

program
  .command("create")
  .description("Create a new object")
  .action(createTestObject);
program
  .command("show <id>")
  .description("Show an ECS object")
  .action(showObject);
program
  .command("list")
  .description("List all objects")
  .action(listObjectsCommand);

program.parse();
