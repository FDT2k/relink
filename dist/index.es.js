#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import program from 'commander';
import { spawnSync } from 'child_process';

const root_path = process.cwd();
const nm_path = 'node_modules';
const max_depth = 10;
program.option('-w, --watch', 'generate watchlist').option('-m, --mod', 'generate links for all modules in package.json').parse(process.argv);

const relative_path = path => {
  return path.replace(root_path, '');
};

const readPKG = (packagePath, callback) => {
  const pkg = path.join(packagePath, 'package.json');
  fs.readFile(pkg, 'utf-8', function (error, content) {
    if (error || !content) {
      console.error('Unable to read ' + pkg + ':', error || 'no content');
      return;
    }

    try {
      const config = JSON.parse(content);

      if (config.isParseConfigFailed) {
        console.error('Unable to parse ' + pkg + ':', config.error);
        return;
      }

      callback(config);
    } catch (e) {
      console.error('pkg parse error', e);
    }
  });
};

const relink = (depth, root) => config => {
  console.log(`[RELINK] processing links in "${relative_path(root)}"`);

  if (depth > max_depth) {
    console.error('max_depth reached aborting');
    return;
  }

  const packages = config.links;

  if (!config.links) {
    console.error('no links defined');
    return;
  }

  packages.map(pkg => {
    link_pkg(root, pkg);
    let new_path = path.join(root, nm_path, pkg);
    readPKG(new_path, relink(depth + 1, new_path));
  });
};

const spawn_log = log => {
  log.stderr.length > 0 && console.error(log.stderr.toString());
  log.stdout.length > 0 && console.log(log.stdout.toString());
};

const link_pkg = (cwd, link_pkg) => {
  console.info(`linking ${link_pkg} in ${relative_path(cwd)} `);
  let log = spawnSync(`yarn`, ['link', link_pkg], {
    cwd
  });
  spawn_log(log);
};

const watch = config => {
  const packages = config.links;

  if (!config.links) {
    console.log('');
  } else {
    console.log(config.links.map(pk => {
      const dest_folder = path.join(root_path, nm_path, pk, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(dest_folder).toString('utf-8'));

      if (pkg.relink && pkg.relink.watchFolder) {
        return `--watch ${nm_path}/${pk}/${pkg.relink.watchFolder}`;
      }

      return `--watch ${nm_path}/${pk}`;
    }).join(' '));
  }
};

const create_link_pkg = pkg => {
  let log = spawnSync(`yarn`, ['link'], {
    cwd: path.join(root_path, 'node_modules', pkg)
  });
  spawn_log(log);
};

const link_module = config => {
  Object.keys(config.dependencies).map(create_link_pkg);
};

if (program.watch === true) {
  readPKG(root_path, watch);
} else if (program.mod === true) {
  readPKG(root_path, link_module);
} else {
  readPKG(root_path, relink(0, root_path));
}

export { relink };
