import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { parseCommand } from "./commandParser";
import { createCliState, executeCommand } from "./commandHandlers";

const state = createCliState();
const readline = createInterface({ input, output });

async function main(): Promise<void> {
  console.log("Rootbase CLI");
  console.log('Type "help" to see available commands.');
  console.log('Type "exit" to quit.');
  console.log();

  let shouldExit = false;

  while (!shouldExit) {
    const line = await readline.question(`${state.fs.pwd()} > `);
    const result = executeCommand(state, parseCommand(line));

    if (result.output.length > 0) {
      console.log(result.output);
    }

    shouldExit = result.shouldExit;
  }

  readline.close();
}

void main();
