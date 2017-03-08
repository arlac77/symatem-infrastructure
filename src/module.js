/* jslint node: true, esnext: true */

'use strict';

const symatem = require('symatem'),
  path = require('path'),
  fs = require('fs'),
  program = require('caporal');

import {
  generateComputers
}
from './osx';

import {
  generateZones
}
from './dns';

program
  .description('infrastructure data utility')
  .version(require(path.join(__dirname, '..', 'package.json')).version)
  .option('--store <file>', 'symatem store')
  .option('--hrl <file>', 'hrl source')
  .option('--out <dir>', 'output directory')
  .action((args, options, logger) => {
    const out = options.out || 'out';

    process.on('uncaughtException', err => logger.error(err));
    process.on('unhandledRejection', reason => logger.error(reason));
    symatem.open({
      store: options.store
    }).then(connection => connection.upload(fs.readFileSync(options.hrl))
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
                logger.log('done');
              })
              .catch(e => {
                connection.close();
                logger.error(e);
              });
          })
        )
      )
      .catch(error => logger.error(error)));
  });

program
  .parse(process.argv);
