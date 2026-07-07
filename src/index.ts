import { Command } from "commander";
import { initRepository } from "#/commands/init.js";

const program = new Command();

program
  .command("init")
  .description("Initialize ECS repository")
  .action(initRepository);

program.parse();