// This file acts as the environment communication layer between commands
// Execution: Bash alias
// fcc='node tooling/fcc.js <project> [<n>] [reset <n>] [solution <n>] [help] [switch <project>]'
// Overloads:
// fcc <n>              - Runs the nth lesson
// fcc reset <n>        - Resets the nth lesson
// fcc solution <n>     - Prints the solution for the nth lesson
// fcc help             - Prints this help message
// fcc switch <project> - Switches between the lessons for <project>
// *fcc test <n>        - Runs the regex tests for the nth lesson

const util = require("util");
const execute = util.promisify(require("child_process").exec);

const switchAlias = require("./switch");
const runLesson = require("./lesson");
const runSolution = require("./solution");
const runTests = require("./test");
const resetLesson = require("./reset");

const ARGS = process.argv;
const CURRENT_PROJECT = ARGS[2];

if (ARGS.length < 4) {
  console.log("Not enough arguments given\n");
  console.log(help());
} else if (ARGS.length > 5) {
  console.log("Too many arguments given\n");
  console.log(help());
}

if (
  isNaN(Number(ARGS[3])) &&
  (ARGS[3] === "switch" || !isNaN(Number(ARGS[4])))
) {
  switch (ARGS[3]) {
    case "help":
    case "--help":
    case "-h":
      console.log(help());
      break;
    case "switch":
      if (CURRENT_PROJECT === ARGS[4]) {
        console.log("Already on project " + CURRENT_PROJECT);
      } else if (!["cli-calculator", "image-combiner"].includes(ARGS[4])) {
        console.log(
          "Project " +
            ARGS[4] +
            " does not exist. Here are the available projects:\n"
        );
        console.log("\tcli-calculator\n\timage-combiner\n");
      } else {
        switchAlias(ARGS[4]);
      }
      break;
    case "reset":
      resetLesson(CURRENT_PROJECT, Number(ARGS[4]));
      break;
    case "solution":
      runSolution(CURRENT_PROJECT, Number(ARGS[4]));
      break;
    case "test":
      runTests(CURRENT_PROJECT, Number(ARGS[4]));
      break;
    default:
      console.log("Invalid argument\n");
      console.log(help());
  }
} else if (!isNaN(Number(ARGS[3]))) {
  if (CURRENT_PROJECT === "cli-calculator") {
    (async () => {
      const { stdout, stderr } = await execute(`./tooling/fcc ${ARGS[3]}`);
      if (stderr) {
        console.log(stderr);
      } else {
        console.log(stdout);
      }
    })();
  }
  runLesson(CURRENT_PROJECT, Number(ARGS[3]));
} else {
  console.log("Invalid arguments\n");
  console.log(help());
}

function help() {
  return `
  fcc <n>              - Runs the nth lesson
  fcc reset <n>        - Resets the nth lesson
  fcc solution <n>     - Prints the solution for the nth lesson
  fcc help             - Prints this help message
  fcc switch <project> - Switches between the lessons for <project>
  *fcc test <n>        - Runs the regex tests for the nth lesson
  `;
}
