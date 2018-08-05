import cleanup from 'rollup-plugin-cleanup';
import executable from 'rollup-plugin-executable';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import pkg from './package.json';

export default {
  output: {
    file: pkg.bin['sym-infra-util'],
    format: 'cjs',
    banner: '#!/usr/bin/env node'
  },
  plugins: [commonjs(), json()],
  external: [
    'symatem',
    'plist',
    'commander',
    'dns-zonefile',
    'mkdirp',
    'path',
    'fs',
    'pkginfo',
    'SymatemJS'
  ],
  input: pkg.module
};
