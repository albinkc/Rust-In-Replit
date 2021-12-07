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

const switchAlias = require("./switch");
const runLesson = require("./lesson");
const runSolution = require("./solution");
const runTests = require("./test");
const resetLesson = require("./reset");
const { t, getProjectMeta } = require("./t");

const { locales, translatedLocales } = require("./locales/conf");
const setLocale = require("./set-locale");

const ARGS = process.argv;
const CURRENT_PROJECT = getProjectMeta().CURRENT_PROJECT;
const LOCALE = getProjectMeta().LOCALE;

if (!locales.includes(LOCALE)) {
  console.error(t("call-to-translate", { locale: LOCALE }));
}

if (ARGS.length < 3) {
  console.log(`${t("not-enough-arguments")}\n`);
  console.log(help());
} else if (ARGS.length > 4) {
  console.log(`${t("too-many-arguments")}\n`);
  console.log(help());
}

if (isNaN(Number(ARGS[2]))) {
  switch (ARGS[2]) {
    case "help":
    case "--help":
    case "-h":
      console.log(help());
      break;
    case "switch":
      if (CURRENT_PROJECT === ARGS[3]) {
        console.log(t("already-on-project", { project: CURRENT_PROJECT }));
      } else if (!["calculator", "combiner"].includes(ARGS[3])) {
        console.log(`${t("[project-not-exist", { project: ARGS[3] })}\n`);
        console.log("\tcalculator\n\tcombiner\n");
      } else {
        switchAlias(ARGS[3]);
      }
      break;
    case "reset":
      resetLesson(CURRENT_PROJECT, Number(ARGS[3]));
      break;
    case "solution":
      runSolution(CURRENT_PROJECT, Number(ARGS[3]));
      break;
    case "test":
      runTests(CURRENT_PROJECT, Number(ARGS[3]));
      break;
    case "welcome":
      promptForLocale();
      break;
    case "locale":
      if (
        !Object.values(translatedLocales)?.some(
          (x) => ARGS[3].toLowerCase() === x.toLowerCase()
        )
      ) {
        console.log(`This course is not translated into ${
          ARGS[3]
        }, yet. Help us translate it!
        https://contribute.freecodecamp.org/
        
Available locales:
\t- ${Object.values(translatedLocales).join("\t\n- ")}`);
      } else {
        setLocale(
          Object.entries(translatedLocales)?.find(
            ([_, val]) => val.toLowerCase() === ARGS[3].toLowerCase()
          )?.[0]
        );
      }
      break;
    default:
      console.log(ARGS, CURRENT_PROJECT, LOCALE);
      console.log(`${t("invalid-argument")}\n`);
      console.log(help());
      break;
  }
} else if (!isNaN(Number(ARGS[2]))) {
  if (CURRENT_PROJECT === "calculator") {
    if (Number(ARGS[2]) > 24) {
      resetLesson(CURRENT_PROJECT, Number(ARGS[2]));
    }
  } else {
    resetLesson(CURRENT_PROJECT, Number(ARGS[2]));
  }
  runLesson(CURRENT_PROJECT, Number(ARGS[2]));
} else {
  console.log(`${t("invalid-argument")}\n`);
  console.log(help());
}

function help() {
  return `
  chmod +x tooling/fcc - ${t("shell-permission")}

  ---

  fcc <n>              - ${t("fcc-n")}
  fcc reset <n>        - ${t("fcc-reset-n")}
  fcc solution <n>     - ${t("fcc-solution-n")}
  fcc help             - ${t("fcc-help")}
  fcc switch <project> - ${t("fcc-switch-project")}
  fcc test <n>         - ${t("fcc-test-n")}
  fcc locale <locale>  - ${t("fcc-locale")}

  ---

  cargo run --bin <project> - ${t("cargo-run")}

  https://doc.rust-lang.org/std/index.html       - ${t("rust-docs")}
  https://doc.rust-lang.org/book/title-page.html - ${t("rust-book")}
  `;
}

function welcome() {
  return t("welcome");
}

function promptForLocale() {
  const greetings = locales.map((x) => t("greeting", {}, x));
  greetings.forEach(console.log);
  console.log(`
  
  \t- ${Object.values(translatedLocales).join("\n\t- ")}
  `);
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function getInput() {
    rl.question(">>: ", (lang = "English") => {
      const ling = lang === "" ? "English" : lang;
      if (
        !Object.values(translatedLocales)?.some(
          (x) => ling.toLowerCase() === x.toLowerCase()
        )
      ) {
        getInput();
      } else {
        setLocale(
          Object.entries(translatedLocales)?.find(
            ([_, val]) => val.toLowerCase() === ling.toLowerCase()
          )?.[0]
        );
        console.log(`Language set to ${ling}`);
        rl.close();
      }
    });
  }
  getInput();

  rl.on("close", function () {
    console.log("\n\n");
    console.log(welcome());
    console.log("\n");
    process.exit(0);
  });
}
