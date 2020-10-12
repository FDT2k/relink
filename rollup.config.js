import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import url from 'rollup-plugin-url'
import includePaths from 'rollup-plugin-includepaths';
import shebang from 'rollup-plugin-preserve-shebang';
import pkg from './package.json'


let includePathOptions = {
  include: {},
  paths: ['src'],
  external: ['stream', 'fs', 'nats'],
  extensions: ['.js', '.json', '.html']
};

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: false
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: false
    }
  ],
  watch: {
    include: ["src/**"],
    clearScreen: true
  },
  external:
    ['bluebird',
      'joi',
      'lodash',
      'serialised-error',
      'mongoose',
      'express',
      'nats',
      'winston',
      'winston-graylog2',
      'body-parser',
      'uuid/v4',
      'async-lock',
      '@geekagency/composite-js',
      'parameter-validator',
      '@geekagency/composite-js/Minux',
      '@geekagency/composite-js/ObjectUtils',
      '@geekagency/composite-js/Chain',
      '@geekagency/composite-js/ReduxUtils',
      '@geekagency/composite-js/ReactUtils',
      '@geekagency/composite-js/Configure',
      'regenerator-runtime/runtime',
      'core-js/stable',
      '@geekagency/composite-js/Monad',
      'express-useragent',
      'uid',
      'uuid',
      'serialize-error',
      'mongodb',
      'executioner',
      'path',
      'commander'
    ],
  plugins: [
    shebang(),
    url({ exclude: ['**/*.svg'] }),
    babel({
      exclude: 'node_modules/**'
    }),
    includePaths(includePathOptions),
    commonjs(),
  ]
}
