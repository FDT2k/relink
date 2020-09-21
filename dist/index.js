#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var executioner = _interopDefault(require('executioner'));
var path = _interopDefault(require('path'));
var fs = _interopDefault(require('fs'));
var program = _interopDefault(require('commander'));

const rootPath = process.cwd();
program.option('-w, --watch', 'generate watchlist').parse(process.argv);

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

const node = process.argv[0];
const relink = config => {
  const packages = config.links;

  if (!config.links) {
    return console.error('no links defined');
  }

  const yarnBin = path.resolve(process.env['npm_execpath']);
  var options = {
    node: node,
    yarn: yarnBin,
    // escape package names@versions
    packages: packages.map(pkg => '"' + pkg + '"').join(' ')
  };
  executioner('"${node}" "${yarn}" link ${packages}', options, function (error, result) {
    if (error) {
      console.error('Unable to link', error);
      process.exit(1);
      return;
    } // done(result);


    console.log(result);
  });
};

const watch = config => {
  const packages = config.links;

  if (!config.links) {
    console.log('');
  } else {
    console.log(config.links.map(pk => `--watch node_modules/${pk}`).join(' '));
  }
};

if (!program.watch) {
  readPKG(rootPath, relink);
} else {
  readPKG(rootPath, watch);
}

exports.relink = relink;