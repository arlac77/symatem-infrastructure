const zonefile = require('dns-zonefile'),
  path = require('path');

import { writeFile } from './util.mjs';

export function generateZones(out, decoded, network) {
  const origin = network.origin.replace(/\.$/, '');

  const zone = {
    $origin: origin + '.',
    $ttl: 3600,
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

  const reverseZone = {};

  for (let i = 0; i < decoded.length; i += 2) {
    const a = decoded[i + 0];
    const b = decoded[i + 1];

    if (a.name) {
      const name = a.name.toLowerCase();
      const fqdn = `${name}.${origin}.`;

      if (b.ipv4Address !== undefined) {
        zone.a.push({
          ip: b.ipv4Address,
          name: fqdn
        });

        zone.ptr.push({
          name: b.ipv4Address,
          host: fqdn
        });
      }
      if (b.ipv6Address !== undefined) {
        zone.aaaa.push({
          ip: b.ipv6Address,
          name: fqdn
        });

        zone.ptr.push({
          name: b.ipv6Address,
          host: fqdn
        });
      }
    }
  }

  // Library/Server/named/db.${reverse_subnet}.in-addr.arpa

  const ins = `         zone "1.0.10.in-addr.arpa" IN {
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

  return writeFile(
    path.join(out, 'Library/Server/named'),
    `db.${origin}`,
    zonefile.generate(zone)
  );
}
