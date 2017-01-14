/* jslint node: true, esnext: true */

'use strict';

const symatem = require('symatem'),
  path = require('path'),
  fs = require('fs'),
  mkdirp = require('mkdirp'),
  zonefile = require('dns-zonefile'),
  program = require('commander'),
  plist = require('plist');

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
            .then(([network]) => {

              const zone = {
                '$origin': network.origin + '.',
                '$ttl': 3600,
                soa: {
                  mname: network.primary + '.',
                  rname: network.admin.replace(/\@/, '.') + '.',
                  serial: '{time}',
                  refresh: 3600,
                  retry: 600,
                  expire: 604800,
                  minimum: 86400
                },
                ns: [],
                a: [],
                aaaa: [],
                ptr: []
              };
              for (let i = 0; i < decoded.length; i += 2) {
                const a = decoded[i + 0];
                const b = decoded[i + 1];

                if (a.name) {
                  const name = a.name.toLowerCase();

                  if (b.ipv4Address !== undefined) {
                    zone.a.push({
                      ip: b.ipv4Address,
                      name: name
                    });

                    zone.ptr.push({
                      name: b.ipv4Address,
                      host: name
                    });

                  }
                  if (b.ipv6Address !== undefined) {
                    zone.aaaa.push({
                      ip: b.ipv6Address,
                      name: name
                    });

                    zone.ptr.push({
                      name: b.ipv6Address,
                      host: name
                    });
                  }

                  if (a.manufacturer === undefined) {
                    //console.log(`${JSON.stringify(a)} <> ${JSON.stringify(b)}`);

                    const json = {
                      name: [name],
                      en_address: [],
                      ip_address: [],
                      ipaddressandenetaddress: []
                    };

                    if (b.macAddress) {
                      json.en_address.push(b.macAddress);
                    }
                    if (b.ipv4Address) {
                      json.ip_address.push(b.ipv4Address);

                      if (b.macAddress) {
                        json.ipaddressandenetaddress.push(`${b.ipv4Address}/${b.macAddress}`);
                      }
                    }

                    promises.push(writeFile(path.join(out, 'var/db/dslocal/nodes/Default/computers'),
                      `${name}.plist`, plist.build(json)));
                  }
                }
              }

              return writeFile(path.join(out, 'var/db'), 'a.zone', zonefile.generate(zone));
            })));

        // Library/Server/named/db.${network}
        // Library/Server/named/db.${reverse_subnet}.in-addr.arpa

        const ins =
          `         zone "1.0.10.in-addr.arpa" IN {
        type master;
        file "db.1.0.10.in-addr.arpa";
        allow-transfer {
                none;
        };
        allow-update {
                none;
        };
};
zone "mf.de" IN {
        type master;
        file "db.mf.de";
        allow-transfer {
                none;
        };
        allow-update {
                none;
        };
};
`;

        Promise.all(promises)
          .then(() => {
            connection.close();
            console.log('done');
          })
          .catch(e => console.error(e));
      })
    )
  )
  .catch(error => console.error(error)));


function writeFile(dir, name, encoding) {
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
