
/* jslint node: true, esnext: true */

'use strict';

const path = require('path'),
fs = require('fs'),
mkdirp = require('mkdirp');

export function writeFile(dir, name, encoding) {
  return new Promise((fullfill, reject) => {
    mkdirp(dir, error => {
      if (error) {
        reject(error);
        return;
      }
      fs.writeFile(path.join(dir, name), encoding, error => {
        if (error) {
          reject(error);
        } else {
          fullfill();
        }
      });
    });
  });
}
