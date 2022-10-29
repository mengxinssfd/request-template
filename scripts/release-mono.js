const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');
const { prompt } = require('enquirer');
const execa = require('execa');
const semver = require('semver');
const chalk = require('chalk');

const args = require('minimist')(process.argv.slice(2));

const npmTool = 'pnpm';

const bin = (name) => path.resolve(__dirname, '../node_modules/.bin/' + name);
const logStep = (msg) => console.log(chalk.cyan(msg));
const logSkip = (msg) => console.log(chalk.underline(chalk.cyan(msg)));

/**
 * @param {string} bin
 * @param {string[]} args
 * @param {{}} opts
 */
const exec = (
  bin,
  args,
  opts = {
    /*execPath: path.resolve(__dirname, '../')*/
  },
) => execa(bin, args, { stdio: 'inherit', ...opts });

const getPkgPath = (pkg) => path.resolve(__dirname, `../packages/${pkg}`);
const actions = {
  lintCheck: () => exec(npmTool, ['lint']),
  jestCheck: () => exec(bin('jest'), ['--no-cache']),
  build: () => exec(npmTool, ['build']),
  /**
   * @param {string[]} pkgs
   * @param {string} version
   */
  updateVersions(pkgs, version) {
    function updateDeps(json, depType, version) {
      const dep = json[depType];
      for (const k in dep) {
        if (pkgJsonList.some((js) => js.json.name === k)) {
          console.log(chalk.yellow(`${json.name} -> ${depType} -> ${k}@${version}`));
          dep[k] = version;
        }
      }
    }

    /**
     * @param {string} pkgPath
     * @param {string} version
     * @param {object} json
     * @param {string[]?} deps
     */
    function updatePackage(pkgPath, version, json, deps = []) {
      json.version = version;
      deps.forEach((dep) => updateDeps(json, dep, version));
      // updateDeps(json, 'peerDependencies', version); // peerDependencies不需要自动更新
      fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2), {});
    }
    const pkgJsonList = pkgs.map((pkg) => {
      const pkgPath = path.resolve(getPkgPath(pkg), 'package.json');
      const file = fs.readFileSync(pkgPath).toString();
      const json = JSON.parse(file);
      return { pkgPath, json, pkg, deps: ['devDependencies', 'dependencies'] };
    });

    const rootPkgPath = path.resolve(__dirname, `../package.json`);
    pkgJsonList.push({
      pkgPath: rootPkgPath,
      json: JSON.parse(fs.readFileSync(rootPkgPath).toString()),
      pkg: 'root',
    });

    for (const { pkgPath, json, deps } of pkgJsonList) {
      updatePackage(pkgPath, version, json, deps);
    }
  },
  async release(config) {
    async function publishPkg(pkg) {
      if (config.skippedPackages.includes(pkg)) return;
      const pkgPath = getPkgPath(pkg);
      const json = JSON.parse(fs.readFileSync(path.resolve(pkgPath, 'package.json'), 'utf-8'));
      if (json.private) return;

      /*let releaseTag = null;
      if (config.tag) {
        releaseTag = config.tag;
      } else if (config.targetVersion.includes('alpha')) {
        releaseTag = 'alpha';
      } else if (config.targetVersion.includes('beta')) {
        releaseTag = 'beta';
      } else if (config.targetVersion.includes('rc')) {
        releaseTag = 'rc';
      }*/

      logStep(`Publishing ${json.name}...`);
      try {
        /*await exec(
          // note: use of yarn is intentional here as we rely on its publishing
          // behavior.
          'yarn',
          [
            'publish',
            '--new-version',
            config.targetVersion,
            ...(releaseTag ? ['--tag', releaseTag] : []),
            '--access',
            'public',
          ],
          {
            cwd: pkgPath,
            stdio: 'pipe',
          },
        );*/
        await exec('npm', ['publish', '--access=public'], { cwd: pkgPath, stdio: 'pipe' });
        console.log(chalk.green(`Successfully published ${json.name}@${config.targetVersion}`));
      } catch (e) {
        if (e.stderr.match(/previously published/)) {
          console.log(chalk.red(`Skipping already published: ${json.name}`));
        } else {
          throw e;
        }
      }
    }
    for (const pkg of config.pkgs) {
      await publishPkg(pkg);
    }
  },
  genChangeLog: () => exec(npmTool, ['changelog']),
  async gitCommit(targetVersion) {
    const { stdout } = await exec('git', ['diff'], { stdio: 'pipe' });
    if (stdout) {
      logStep('\nCommitting changes...');
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
  pkgs: fs.readdirSync(path.resolve(__dirname, '../packages')),
  targetVersion: args._[0],
  skipTest: args.skipTest,
  skipBuild: args.skipBuild,
  skipGit: args.skipGit,
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

  logStep('\nRunning tests...');
  if (!config.skipTest) {
    await actions.lintCheck();
    await actions.jestCheck();
  } else {
    logSkip(`(skipped tests)`);
  }

  logStep('\nRunning build...');
  if (!config.skipBuild) {
    await actions.build();
  } else {
    logSkip(`(skipped build)`);
  }

  logStep('\nRunning update versions...');
  await actions.updateVersions(config.pkgs, config.targetVersion);

  // generate changelog
  logStep('\nGenerating changelog...');
  actions.genChangeLog();

  // update pnpm-lock.yaml
  logStep('\nUpdating lockfile...');
  await exec(npmTool, ['install', '--prefer-offline']);

  logStep('\ngit commit...');
  if (!config.skipGit) {
    await actions.gitCommit(config.targetVersion);
  } else {
    logSkip(`(skipped commit)`);
  }

  // publish packages
  logStep('\nPublishing packages...');
  if (!config.skipGit) {
    await actions.release(config);
  } else {
    logSkip(`(skipped Publishing)`);
  }
  console.log(config);

  return config;
}

setup().then(
  async (config) => {
    // push to GitHub
    logStep('\nPushing to GitHub...');
    if (!config.skipGit) {
      await actions.gitPush(config.targetVersion);
    } else {
      logSkip(`(skipped Pushing to GitHub)`);
    }
    console.log('end');
  },
  (e) => {
    console.log('error', e);
    actions.updateVersions(baseConfig.pkgs, baseConfig.currentVersion);
  },
);
