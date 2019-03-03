const { join } = require("path");
const fs = require("fs");

export function writeFile(dir, name, data, encoding) {
  fs.promises
    .mkdir(dir, { recursive: true })
    .then(path => fs.promises.writeFile(join(dir, name), data, encoding));
}
