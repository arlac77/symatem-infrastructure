import multiEntry from 'rollup-plugin-multi-entry';

export default {
  input: 'tests/**/*-test.js',
  external: ['ava'],
  plugins: [multiEntry()],
  output: {
    format: 'cjs',
    file: 'build/bundle-test.js',
    sourcemap: true
  }
};
