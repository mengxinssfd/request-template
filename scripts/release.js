const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');
const { prompt } = require('enquirer');
const semver = require('semver');
const chalk = require('chalk');
const { bin, root, exec } = require('./utils');
const build = require('./build');

const args = require('minimist')(process.argv.slice(2));

const npmTool = 'pnpm';
const pkgPath = root('package.json');

const step = (msg) => console.log(chalk.cyan(msg));

const actions = {
  lintCheck: () => exec(npmTool, ['lint-check']),
  jestCheck: () => exec(bin('jest'), ['--no-cache']),
  build: () => build(),
  updateVersion(version) {
    const pkgPath = path.resolve(__dirname, `../package.json`);
    const file = fs.readFileSync(pkgPath).toString();
    const json = JSON.parse(file);
    json.version = version;
    fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2));
  },
  async release(config) {
    async function publishPkg(pkgPath) {
      const json = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (json.private) return;

      step(`Publishing ${json.name}...`);
      try {
        await exec('npm', ['publish', '--access=public'], { cwd: root(), stdio: 'pipe' });
        console.log(chalk.green(`Successfully published ${json.name}@${config.targetVersion}`));
      } catch (e) {
        if (e.stderr.match(/previously published/)) {
          console.log(chalk.red(`Skipping already published: ${json.name}`));
        } else {
          throw e;
        }
      }
    }
    await publishPkg(pkgPath);
  },
  genChangeLog: () => exec(npmTool, ['changelog']),
  async gitCommit(targetVersion) {
    const { stdout } = await exec('git', ['diff'], { stdio: 'pipe' });
    if (stdout) {
      step('\nCommitting changes...');
      await exec('git', ['add', '-A']);
      await exec('git', ['commit', '-m', `release: v${targetVersion}`]);
    } else {
      console.log('No changes to commit.');
    }
  },
  async gitPush(targetVersion) {
    // push to GitHub
    await exec('git', ['tag', `v${targetVersion}`]);
    await exec('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
    await exec('git', ['push']);
  },
};

const baseConfig = {
  targetVersion: args._[0],
  skipTest: args.skipTest,
  skipBuild: args.skipBuild,
  currentVersion: pkg.version,
  // semver.prerelease('1.2.3-alpha.3') -> [ 'alpha', 3 ]
  preId: args.preid || semver.prerelease(pkg.version)?.[0],
  skippedPackages: [],
  tag: args.tag,
};

const inc = (i) => semver.inc(baseConfig.currentVersion, i, baseConfig.preId);

async function getVersion(preId, currentVersion) {
  let targetVersion;
  const versionIncrements = [
    'patch',
    'minor',
    'major',
    ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : []),
  ];
  const { release } = await prompt({
    type: 'select',
    name: 'release',
    choices: versionIncrements
      .map((i) => ({ hint: i, value: inc(i) }))
      .concat([{ hint: `custom cur(${currentVersion})`, value: 'custom' }]),
  });
  if (release === 'custom') {
    ({ version: targetVersion } = await prompt({
      type: 'input',
      name: 'version',
      message: 'Input custom version',
      initial: currentVersion,
    }));
  } else {
    targetVersion = release;
  }
  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`);
  }
  const { yes } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion}. Confirm?`,
  });

  if (!yes) {
    throw new Error(`select NO`);
  }
  return targetVersion;
}

async function getConfig() {
  const config = {
    ...baseConfig,
  };

  config.targetVersion ||= await getVersion(config.preId, config.currentVersion);

  return config;
}

async function setup() {
  console.log('start');

  const config = await getConfig();

  step('\nRunning tests...');
  if (!config.skipTest) {
    await actions.lintCheck();
    await actions.jestCheck();
  } else {
    console.log(`(skipped)`);
  }

  step('\nRunning update versions...');
  await actions.updateVersion(config.targetVersion);

  step('\nRunning build...');
  if (!config.skipBuild) {
    await actions.build();
  } else {
    console.log(`(skipped)`);
  }

  // generate changelog
  step('\nGenerating changelog...');
  await actions.genChangeLog();

  step('\ngit commit...');
  await actions.gitCommit(config.targetVersion);

  // publish packages
  step('\nPublishing packages...');
  await actions.release(config);
  console.log(config);

  return config;
}

setup().then(
  async (config) => {
    // push to GitHub
    step('\nPushing to GitHub...');
    await actions.gitPush(config.targetVersion);
    console.log('end');
  },
  (e) => {
    console.log('error', e);
    actions.updateVersion(baseConfig.currentVersion);
  },
);
