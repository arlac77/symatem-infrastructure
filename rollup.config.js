import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  output: {
    file: pkg.bin['sym-infra-util'],
    format: 'cjs',
    banner: '#!/usr/bin/env node'
  },
  plugins: [commonjs()],
  external: ['symatem', 'plist', 'commander', 'dns-zonefile', 'mkdirp', 'path', 'fs', 'pkginfo'],
  input: pkg.module
};
