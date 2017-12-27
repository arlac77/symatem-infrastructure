import { version } from '../package.json';
import { generateComputers } from './osx';
import { generateZones } from './dns';
import NativeBackend from 'SymatemJS';
import { migrate } from './migrate';

const symatem = require('symatem'),
  path = require('path'),
  fs = require('fs'),
  program = require('caporal');

program
  .description('infrastructure data utility')
  .version(version)
  .option('--store <file>', 'symatem store')
  .option('--hrl <file>', 'hrl source')
  .option('--out <dir>', 'output directory')
  .action(async (args, options, logger) => {
    const out = options.out || 'out';

    process.on('uncaughtException', err => logger.error(err));
    process.on('unhandledRejection', reason => logger.error(reason));

    let connection;

    try {
      connection = await symatem.open({
        store: options.store
      });

      await connection.upload(fs.readFileSync(options.hrl));

      const sb = new NativeBackend();

      const namespaceSymbol = sb.createSymbol(
        NativeBackend.identityOfSymbol(NativeBackend.symbolByName.Namespaces)
      );

      await migrate(
        connection,
        sb,
        NativeBackend.identityOfSymbol(namespaceSymbol)
      );

      console.log(sb.encodeJson());

      fs.writeFileSync(
        'a.json',
        /*JSON.stringify(*/ sb.encodeJson(), //undefined, 2),
        { encoding: 'utf8' }
      );

      let result = connection.upload('networkInterface');

      const symbols = await connection.query(
        false,
        symatem.queryMask.VMV,
        0,
        result[0],
        0
      );

      const decoded = await Promise.all(
        symbols.map(symbol => connection.decodeSymbolWithCache(symbol))
      );

      const promises = [];

      promises.push(
        connection.upload('network').then(result =>
          connection
            .query(false, symatem.queryMask.VIM, 0, 0, result[0])
            .then(symbols =>
              symbols.map(symbol => connection.decodeSymbolWithCache(symbol))
            )
            .then(dps => Promise.all(dps))
            .then(([network]) =>
              Promise.all([
                generateComputers(out, decoded, network),
                generateZones(out, decoded, network)
              ])
            )
        )
      );

      await Promise.all(promises);

      connection.close();
      logger.log('done');
    } catch (error) {
      if (connection !== undefined) {
        connection.close();
      }

      logger.error(error);
    }
  });

program.parse(process.argv);
