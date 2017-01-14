/* jslint node: true, esnext: true */

'use strict';

/**
 * generate object suitable as source for plist machine record
 */
export function machinePList(name, node) {
  const json = {
    name: [name],
    en_address: [],
    ip_address: [],
    ipaddressandenetaddress: []
  };

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