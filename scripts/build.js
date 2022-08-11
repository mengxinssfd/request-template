const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const esbuild = require('esbuild');
const rimraf = require('rimraf');
const { dist, exec, src, root, useLog } = require('./utils');

const args = require('minimist')(process.argv.slice(2));

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
async function buildOne(format) {
  const entryFile = src('index.ts');
  const outfile = dist(`index${format === 'cjs' ? '.cjs' : ''}.js`);
  const tsconfig = root('tsconfig.build.json');
  await esbuild.build({ entryPoints: [entryFile], bundle: true, outfile, format, tsconfig });
}

async function build() {
  await useLog('打包types', buildTypes());
  await Promise.all([useLog('打包esm', buildOne('esm')), useLog('打包cjs', buildOne('cjs'))]);
  await useLog('cp index.js index.mjs', () => {
    fs.copyFileSync(dist('index.js'), dist('index.mjs'));
  });
}

async function setup() {
  const { skipCheck = false } = args;
  !skipCheck && (await useLog('lint check', exec('pnpm', ['lint-check'])));
  await useLog('打包模块', build());
}

if (args.run) {
  setup();
}

module.exports = build;
