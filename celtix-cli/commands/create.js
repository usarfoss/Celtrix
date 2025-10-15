const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

async function createProject(projectName) {
  const targetDir = path.join(process.cwd(), projectName);

  // Check if the directory already exists
  if (fs.existsSync(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: chalk.yellow(`Directory "${projectName}" already exists. Overwrite?`),
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.red('Operation cancelled.'));
      return;
    }
    console.log(chalk.yellow(`Overwriting directory: ${targetDir}...`));
    await fs.remove(targetDir);
  }

  // Create the project directory
  await fs.mkdir(targetDir);

  // Define the source of the template
  const templateDir = path.join(__dirname, '..', 'templates', 'default-backend');

  try {
    // Copy the template files to the new project directory
    await fs.copy(templateDir, targetDir);

    console.log(chalk.green('\n✅ Project created successfully!'));
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray(`  1. cd ${projectName}`));
    console.log(chalk.gray('  2. npm install'));
    console.log(chalk.gray('  3. cp .env.example .env (and edit it)'));
    console.log(chalk.gray('  4. npm start\n'));
  } catch (error) {
    console.error(chalk.red('Error creating project:', error));
    // Clean up created directory on failure
    await fs.remove(targetDir);
  }
}

module.exports = createProject;
