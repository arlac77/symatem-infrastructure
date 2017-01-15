/* jslint node: true, esnext: true */

'use strict';

const plist = require('plist'),
  path = require('path');

import {
  writeFile
}
from './util';

/**
 * generate object suitable as source for plist computer record
 */
export function computerPList(name, node) {
  const json = {
    name: [name],
    en_address: [],
    ip_address: [],
    ipaddressandenetaddress: []
  };

  if (node.uuid) {
    json.generateduid = node.uuid;
  }

  if (node.macAddress) {
    json.en_address.push(node.macAddress);
  }
  if (node.ipv4Address) {
    json.ip_address.push(node.ipv4Address);

    if (node.macAddress) {
      json.ipaddressandenetaddress.push(`${node.ipv4Address}/${node.macAddress}`);
    }
  }

  return json;
}


export function generateComputers(out, decoded, network) {

  const promises = [];

  for (let i = 0; i < decoded.length; i += 2) {
    const a = decoded[i + 0];

    if (a.name) {
      const name = a.name.toLowerCase();
      const b = decoded[i + 1];

      if (a.manufacturer === undefined) {
        //console.log(`${JSON.stringify(a)} <> ${JSON.stringify(b)}`);
        promises.push(writeFile(path.join(out, 'var/db/dslocal/nodes/Default/computers'),
          `${name}.plist`, plist.build(computerPList(name, b))));
      }
    }
  }

  return Promise.all(promises);
}
