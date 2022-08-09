const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const esbuild = require('esbuild');
const rimraf = require('rimraf');
const execa = require('execa');

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

async function buildTypes() {
  rimraf.sync(dist());
  await exec('pnpm', ['build:types']);
  rimraf.sync(dist());
  // build types
  const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

  const extractorConfigPath = path.resolve(__dirname, `../api-extractor.json`);
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath);
  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  });

  if (extractorResult.succeeded) {
    // concat additional d.ts to rolled-up dts
    console.log(chalk.bold(chalk.green(`API Extractor completed successfully.`)));
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`,
    );
    process.exitCode = 1;
  }
}

/**
 * @param {'esm'|'cjs'} format
 */
async function build(format) {
  console.log(chalk.bold(chalk.yellow(`\n 打包${format} \n`)));
  const entryFile = src('index.ts');
  const outfile = dist(`index${format === 'cjs' ? '.cjs' : ''}.js`);
  const tsconfig = root('tsconfig.build.json');
  await esbuild.build({ entryPoints: [entryFile], bundle: true, outfile, format, tsconfig });
  console.log(chalk.bold(chalk.green(`\n 打包${format}完成 \n`)));
}

async function setup() {
  await useLog('lint check', exec('pnpm', ['lint-check']));
  await useLog('打包types', buildTypes());
  await useLog('打包模块', Promise.all([build('esm'), build('cjs')]));

  await useLog('cp index.js index.mjs', () => {
    fs.copyFileSync(dist('index.js'), dist('index.mjs'));
  });
}

setup();

module.exports = setup;
