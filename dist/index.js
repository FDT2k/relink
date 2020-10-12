#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var fs = require('fs');
var program = require('commander');
var child_process = require('child_process');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var program__default = /*#__PURE__*/_interopDefaultLegacy(program);

const root_path = process.cwd();
const node = process.argv[0];
const nm_path = 'node_modules';
const yarnBin = path__default['default'].resolve(process.env['npm_execpath']);
const max_depth = 10;
program__default['default'].option('-w, --watch', 'generate watchlist').option('-m, --mod', 'generate links for all modules in package.json').parse(process.argv);

const relative_path = path => {
  return path.replace(root_path, '');
};

const readPKG = (packagePath, callback) => {
  const pkg = path__default['default'].join(packagePath, 'package.json');
  console.log(`[RELINK] Reading ${relative_path(pkg)}`);
  fs__default['default'].readFile(pkg, 'utf-8', function (error, content) {
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

const relink = depth => config => {
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
    link_pkg(root_path, pkg);
    readPKG(path__default['default'].join(root_path, nm_path, pkg), relink(depth + 1));
  });
};

const spawn_log = log => {
  log.stderr.length > 0 && console.error(log.stderr.toString());
  log.stdout.length > 0 && console.log(log.stdout.toString());
};

const link_pkg = (cwd, link_pkg) => {
  const relativepath = cwd.replace(root_path, './');
  console.info(`linking ${link_pkg} in ${relativepath} `);
  let log = child_process.spawnSync(`yarn`, ['link', link_pkg], {
    cwd
  });
  spawn_log(log);
};

const watch = config => {
  const packages = config.links;

  if (!config.links) {
    console.log('');
  } else {
    console.log(config.links.map(pk => `--watch node_modules/${pk}`).join(' '));
  }
};

const create_link_pkg = pkg => {
  let log = child_process.spawnSync(`yarn`, ['link'], {
    cwd: path__default['default'].join(root_path, 'node_modules', pkg)
  });
  spawn_log(log);
};

const link_module = config => {
  Object.keys(config.dependencies).map(create_link_pkg);
};

if (program__default['default'].watch === true) {
  readPKG(root_path, watch);
} else if (program__default['default'].mod === true) {
  readPKG(root_path, link_module);
} else {
  readPKG(root_path, relink(0));
}

exports.relink = relink;
