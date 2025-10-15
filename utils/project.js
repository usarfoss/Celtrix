import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import boxen from "boxen";
import { logger } from "./logger.js";
import { copyTemplates } from "./templateManager.js";
import { HonoReactSetup,mernTailwindSetup, installDependencies, mernSetup, serverAuthSetup, serverSetup, mevnSetup } from "./installer.js";
import { angularSetup, angularTailwindSetup } from "./installer.js";

export async function setupProject(projectName, config) {
  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    logger.error(`❌ Directory ${chalk.red(projectName)} already exists`);
    process.exit(1);
  }

  fs.mkdirSync(projectPath);

  // --- Pretty Project Config (Boxed) ---
  const configText = `
    ${chalk.bold("🌐 Stack:")}  ${chalk.green(config.stack)}
    ${chalk.bold("📦 Project Name:")}  ${chalk.blue(projectName)}
    ${chalk.bold("📖 Language:")}  ${chalk.red(config.language)}
    `;

  console.log(
    boxen(configText, {
      padding: 1,
      margin: 1,
      borderColor: "cyan",
      borderStyle: "round",
      title: chalk.cyanBright("📋 Project Configuration"),
      titleAlignment: "center",
    })
  );

  // --- Copy & Install ---
  if(config.stack !== "mean" && config.stack !== "mean+tailwind+auth" && config.stack!=="hono"){
    copyTemplates(projectPath, config);
    installDependencies(projectPath, config, projectName);
  }

  if(config.stack==="mern+tailwind+auth"){
    mernSetup(projectPath,config,projectName);
    copyTemplates(projectPath, config);
    mernTailwindSetup(projectPath, config, projectName);
    installDependencies(projectPath, config, projectName);
    serverAuthSetup(projectPath,config,projectName);
  }

  if(config.stack === 'mevn'){
    mevnSetup(projectPath,config,projectName)
    copyTemplates(projectPath,config)
    installDependencies(projectPath,config,projectName)
    serverSetup(projectPath,config,projectName)
  }

  if(config.stack === "mean"){
    angularSetup(projectPath, config);
    installDependencies(projectPath, config, projectName);
    copyTemplates(projectPath, config);
    serverSetup(projectPath,config,projectName)
  }
  
  if(config.stack === "mean+tailwind+auth"){
    angularTailwindSetup(projectPath, config, projectName);
    installDependencies(projectPath, config, projectName);
    copyTemplates(projectPath, config);
  }
  
  if(config.stack === "hono"){
   try{

     HonoReactSetup(projectPath,config,projectName);
     installDependencies(projectPath, config, projectName,false);
    }
    catch{
      copyTemplates(projectPath, config);
    }
  }

  if (config.stack ==="mern") {
    mernSetup(projectPath,config,projectName);
    copyTemplates(projectPath, config);
    installDependencies(projectPath, config, projectName,false,[])
  }

  // --- Success + Next Steps ---
  console.log(chalk.gray("-------------------------------------------"))
  console.log(`${chalk.greenBright(`✅ Project ${chalk.bold.yellow(`${projectName}`)} created successfully! 🎉`)}`);
  console.log(chalk.gray("-------------------------------------------"))
  console.log(chalk.cyan("👉 Next Steps:\n"));

  let nextStepsLines = [];
  if(config.stack === "mean" || config.stack === "mean+tailwind+auth") {
    nextStepsLines.push(`${chalk.yellow("cd")} ${chalk.bold(`${projectName}/client`)} && ${chalk.green("npm start")}`);
    nextStepsLines.push(`${chalk.yellow("cd")} ${chalk.bold(`${projectName}/server`)} && ${chalk.green("npm start")}`);
  } else if(config.stack === "t3-stack") {
    nextStepsLines.push(`${chalk.yellow("cd")} ${chalk.bold(`${projectName}/t3-app`)} && ${chalk.green("npm run dev")}`);
  } else if(config.stack === "hono"){
    nextStepsLines.push(`${chalk.yellow("cd")} ${chalk.bold(`${projectName}/client`)} && ${chalk.green("npm run dev")}`);
    nextStepsLines.push(`${chalk.yellow("cd")} ${chalk.bold(`${projectName}/server`)} && ${chalk.green("npm run dev")}`);
  } else if(config.stack === "next-express"){
    nextStepsLines.push(`${chalk.yellow("cd")} ${chalk.bold(`${projectName}/client`)} && ${chalk.green("npm run dev")}`);
    nextStepsLines.push(`${chalk.yellow("cd")} ${chalk.bold(`${projectName}/server`)} && ${chalk.green("npm run dev")}`);
  } else if(config.stack === "mern-turbo"){
    nextStepsLines.push(`${chalk.yellow("cd")} ${chalk.bold(projectName)}`);
    nextStepsLines.push(`${chalk.green("npm install")}`);
    nextStepsLines.push(`${chalk.green("npm run dev")} ${chalk.gray("# runs all apps via Turbo")}`);
  } else if(config.stack === "pern"){
    nextStepsLines.push(`${chalk.yellow("cd")} ${chalk.bold(`${projectName}/client`)} && ${chalk.green("npm run dev")}`);
    nextStepsLines.push(`${chalk.yellow("cd")} ${chalk.bold(`${projectName}/server`)} && ${chalk.green("npm run dev")}`);
  } else {
    nextStepsLines.push(`${chalk.yellow("cd")} ${chalk.bold(`${projectName}/client`)} && ${chalk.green("npm run dev")}`);
    nextStepsLines.push(`${chalk.yellow("cd")} ${chalk.bold(`${projectName}/server`)} && ${chalk.green("npm start")}`);
  }

  for(const line of nextStepsLines){
    console.log(`   ${line}`);
  }

  const boxText = [
    `${chalk.green.bold("Next Steps")}`,
    '',
    ...nextStepsLines.map(s => `• ${s}`),
    '',
    `${chalk.cyan("Tip:")} Use ${chalk.bold("docker-compose up")} to run containers if Docker files are present.`
  ].join("\n");

  console.log('\n' + boxen(boxText, { padding: 1, margin: 1, borderColor: "green", borderStyle: "round" }));

  console.log(chalk.gray("-------------------------------------------"))
  console.log(chalk.gray("\n✨ Made with ❤️  by Celtrix ✨\n"));
}