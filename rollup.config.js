/* jslint node: true, esnext: true */
'use strict';

import commonjs from 'rollup-plugin-commonjs';

export default {
  banner: '#!/usr/bin/env node',
  format: 'cjs',
  plugins: [commonjs()]
};
