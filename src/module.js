/* jslint node: true, esnext: true */

'use strict';

const symatem = require('symatem'),
  path = require('path'),
  fs = require('fs'),
  program = require('commander');

import {
  generateComputers
}
from './osx';

import {
  generateZones
}
from './dns';

//require('pkginfo')(module, 'version');

program
  .description('infrastructure data utility')
  //  .version(module.exports.version)
  .option('--store <file>', 'symatem store')
  .option('--hrl <file>', 'hrl source')
  .option('--out <dir>', 'output directory')
  .parse(process.argv);

const out = program.out || 'out';

process.on('uncaughtException', err => console.error(err));
process.on('unhandledRejection', reason => console.error(reason));

symatem.open({
  store: program.store
}).then(connection => connection.upload(fs.readFileSync(program.hrl))
  .then(() => connection.upload('networkInterface')
    .then(result => connection.query(false, symatem.queryMask.VMV, 0, result[0], 0)
      .then(symbols => symbols.map(symbol => connection.decodeSymbolWithCache(symbol)))
      .then(dps => Promise.all(dps))
      .then(decoded => {
        const promises = [];

        promises.push(connection.upload('network')
          .then(result => connection.query(false, symatem.queryMask.VIM, 0, 0, result[0])
            .then(symbols => symbols.map(symbol => connection.decodeSymbolWithCache(symbol)))
            .then(dps => Promise.all(dps))
            .then(([network]) => Promise.all([
              generateComputers(out, decoded, network),
              generateZones(out, decoded, network)
            ]))));

        Promise.all(promises)
          .then(() => {
            connection.close();
            console.log('done');
          })
          .catch(e => {
            connection.close();
            console.error(e);
          });
      })
    )
  )
  .catch(error => console.error(error)));
