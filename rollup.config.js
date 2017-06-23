import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  banner: '#!/usr/bin/env node',
  targets: [{
    dest: pkg.bin['sym-infra-util'],
    format: 'cjs'
  }],
  plugins: [commonjs()],
  external: ['symatem', 'plist', 'commander', 'dns-zonefile', 'mkdirp', 'path', 'fs', 'pkginfo']
};
