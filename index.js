#!/usr/bin/env node

require('colors');
const commander = require('commander');
const shell = require('shelljs');
const fs = require('fs');
const path = require('path');

const packageJson = require(path.join(__dirname, 'package.json'));

shell.set('-e');

const REPLACER_CONST = 'create-express-typescript-app';
const replaceTemplateStr = (filePath, projectName) => {
  const templatePackageJsonStr = fs
  .readFileSync(filePath, { encoding: 'utf-8' })
  .replace(REPLACER_CONST, projectName);
  fs.writeFileSync(filePath, templatePackageJsonStr);
};

commander
  .version(packageJson.version)
  .description(packageJson.description)
  .command('<projectName>', 'project name')
  .action(projectName => {
    try {
      console.log('[Bootstrapping] project'.cyan.bold, `${projectName}`.magenta);
      // Read project name
      if (!projectName || !projectName.trim()) {
        throw new Error('Project name is mandatory');
      }
    
      // Copy template
      // Make sure to ignore node_modules & build folders
      console.log('[Copying] template'.gray);
      shell.mkdir([`${projectName}`]);
      shell.cp('-R', path.join(__dirname, 'template', '*'), `${projectName}`);
      console.log('   [Done]'.green.bold);
    
      // Replace files with project name, where needed
      console.log('[Adding] project name'.gray, `${projectName}`.magenta);
      // Replace package.json name 'create-express-typescript-app'
      replaceTemplateStr(`./${projectName}/package.json`, projectName);
      // Replace pm2.json name
      replaceTemplateStr(`./${projectName}/pm2.json`, projectName);
      // Replace README.md first line
      replaceTemplateStr(`./${projectName}/README.md`, projectName);
      // index.html HEAD innerHTML
      replaceTemplateStr(`./${projectName}/public/index.html`, projectName);
      console.log('   [Done]'.green.bold);
    
      // Init git
      console.log('[Initializing] git'.green);
      shell.exec(`cd ${projectName} && git init`);
      console.log('   [Done]'.green.bold);
    
      // Check if yarn is installed, if not exit
      console.log('[Installing] dependency using'.green, 'yarn'.magenta);
      shell.exec(`cd ${projectName} && yarn`);
      console.log('   [Done]'.green.bold);
    
    } catch(e) {
      console.error(`${e.message}`.red);
      process.exit(1);
    }
  })
  .parse(process.argv);
