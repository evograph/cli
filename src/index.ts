import { Command } from "commander";

const program = new Command();

program
  .name("ecs")
  .description("Evolution Control System")
  .version("0.1.0");

program.parse();