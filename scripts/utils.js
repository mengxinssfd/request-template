const path = require('path');
const chalk = require('chalk');
const execa = require('execa');
const fs = require('fs');

const root = (p = '') => path.resolve(__dirname, '../' + p);
const dist = (p = '') => root('dist/' + p);
const src = (p = '') => root('src/' + p);

const logStart = (desc = '') => console.log(chalk.bold(chalk.yellow(`\n ${desc} \n`)));
const logEnd = (desc = '') => console.log(chalk.bold(chalk.green(`\n ${desc} finished\n`)));
/**
 * @param {string} desc
 * @param {Promise|void|function} doing
 * @return {Promise<void>}
 */
const useLog = async (desc, doing) => {
  logStart(desc);
  await (typeof doing === 'function' ? doing() : doing);
  logEnd(desc);
};

/**
 * @param {string} bin
 * @param {string[]?} args
 * @param {{}} opts
 * @returns Promise<any>
 */
const exec = (bin, args, opts = {}) => execa(bin, args, { stdio: 'inherit', cwd: root(), ...opts });

const bin = (name) => path.resolve(__dirname, '../node_modules/.bin/' + name);

const targets = fs.readdirSync(path.resolve(__dirname, '../packages')).filter((f) => {
  if (!fs.statSync(path.resolve(__dirname, `../packages/${f}`)).isDirectory()) {
    return false;
  }
  const pkg = require(`../packages/${f}/package.json`);
  return !(pkg.private && !pkg.buildOptions);
});

function checkFileSize(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const file = fs.readFileSync(filePath);
  const minSize = (file.length / 1024).toFixed(2) + 'kb';
  console.log(`${chalk.gray(chalk.bold(path.basename(filePath)))} min:${minSize}`);
}

module.exports = { root, dist, src, useLog, exec, bin, targets, checkFileSize };
