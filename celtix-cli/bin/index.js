#!/usr/bin/env node

const { program } = require('commander');
const createCommand = require('../commands/create');

// Define the main program
program
  .version('1.0.0')
  .description('A CLI tool for creating project structures');

// Define the 'create' command
program
  .command('create <project-name>')
  .description('Create a new project from a template')
  .action(createCommand);

// Parse the arguments from the command line
program.parse(process.argv);
