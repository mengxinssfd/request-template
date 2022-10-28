const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const { targets: allTargets, fuzzyMatchTarget } = require('./utils');
const execa = require('execa');

const args = require('minimist')(process.argv.slice(2));
const targets = args._;
const formats = args.formats || args.f;
const sourceMap = args.sourcemap || args.s;
const isRelease = args.release;
const buildTypes = args.t || args.types || isRelease;
const buildAllMatching = args.all || args.a;

async function buildAll(targets) {
  await runParallel(require('os').cpus().length, targets, build);
}

async function runParallel(maxConcurrency, source, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item, source));
    ret.push(p);

    if (maxConcurrency <= source.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

/**
 * @param {string} target
 * @return {Promise<void>}
 */
async function build(target) {
  const pkgDir = path.resolve(__dirname, `../packages/${target}`);
  const pkg = require(`${pkgDir}/package.json`);
  if (pkg.private) return;
  await fs.remove(path.resolve(pkgDir, 'dist'));

  const env = pkg.buildOptions?.env || 'production';

  await execa(
    'rollup',
    [
      '-c',
      '--environment',
      [
        `NODE_ENV:${env}`,
        `TARGET:${target}`,
        formats ? `FORMATS:${formats}` : ``,
        buildTypes ? `TYPES:true` : ``,
        sourceMap ? `SOURCE_MAP:true` : ``,
      ]
        .filter(Boolean)
        .join(','),
    ],
    { stdio: 'inherit' },
  );

  if (buildTypes && pkg.types) buildType(target, pkgDir, pkg);
}

async function buildType(target, pkgDir, pkg) {
  console.log(chalk.bold(chalk.yellow(`Rolling up type definitions for ${target}...`)));

  // build types
  const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

  const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`);
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath);
  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  });

  if (extractorResult.succeeded) {
    // concat additional d.ts to rolled-up dts
    const typesDir = path.resolve(pkgDir, 'types');
    if (await fs.exists(typesDir)) {
      const dtsPath = path.resolve(pkgDir, pkg.types);
      const existing = await fs.readFile(dtsPath, 'utf-8');
      const typeFiles = await fs.readdir(typesDir);
      const toAdd = await Promise.all(
        typeFiles.map((file) => {
          return fs.readFile(path.resolve(typesDir, file), 'utf-8');
        }),
      );
      await fs.writeFile(dtsPath, existing + '\n' + toAdd.join('\n'));
    }
    console.log(chalk.bold(chalk.green(`API Extractor completed successfully.`)));
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`,
    );
    process.exitCode = 1;
  }

  const nsPath = path.resolve(pkgDir, 'src/namespace.d.ts');
  if (await fs.exists(nsPath)) {
    const distNsPath = path.resolve(pkgDir, 'dist/namespace.d.ts');
    console.log(chalk.bold(chalk.green(`copy '${nsPath}' to '${distNsPath}'`)));
    await fs.copy(nsPath, distNsPath);
  }

  await fs.remove(`${pkgDir}/dist/packages`);
}

async function run() {
  if (!targets.length) {
    await buildAll(allTargets);
  } else {
    await buildAll(fuzzyMatchTarget(targets, buildAllMatching));
  }
}

run();
