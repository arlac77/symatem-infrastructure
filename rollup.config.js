/* jslint node: true, esnext: true */
'use strict';

import commonjs from 'rollup-plugin-commonjs';

export default {
  banner: '#!/usr/bin/env node',
  format: 'cjs',
  plugins: [commonjs()],
  external: ['symatem', 'plist', 'commander', 'dns-zonefile', 'mkdirp', 'path', 'fs', 'pkginfo']
};
