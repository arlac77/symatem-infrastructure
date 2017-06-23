const path = require('path');
const fs = require('fs');
const makeDir = require('make-dir');

const {
  promisify
} = require('util');

const _writeFile = promisify(fs.writeFile);

export function writeFile(dir, name, data, encoding) {
  makeDir(dir).then(path => _writeFile(path.join(dir, name), data, encoding));
}
