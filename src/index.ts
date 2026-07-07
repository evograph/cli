import { Command } from "commander";
import { initRepository } from "#/commands/init.js";
import { createTestObject } from "#/commands/create.js";

const program = new Command();

program
  .command("init")
  .description("Initialize ECS repository")
  .action(initRepository);

program
  .command("create")
  .description("Create a new object")
  .action(createTestObject);

program.parse();