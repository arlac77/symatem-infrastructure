const symatem = require('symatem');
import NativeBackend from 'SymatemJS';

const predefinedMapping = {
  Void: 'Void',
  // 'Entity', 'Attribute', 'Value',
  BlobType: 'Encoding',
  Natural: 'BinaryNumber',
  Integer: 'TwosComplement',
  Float: 'IEEE754',
  UTF8: 'UTF8'
};

/**
 *
 */
export async function migrate(connection, sb, namespace) {
  const symbolMap = new Map();

  console.log(symatem.PredefinedSymbols);

  for (const srcName in predefinedMapping) {
    symbolMap.set(
      symatem.PredefinedSymbols[srcName],
      NativeBackend.symbolByName[predefinedMapping[srcName]]
    );
  }

  async function migrateSymbol(os) {
    let ns = symbolMap.get(os);
    if (ns !== undefined) {
      return ns;
    }

    ns = sb.createSymbol(namespace);
    symbolMap.set(os, ns);

    const data = await connection.readBlob(os);
    if (data.length > 0) {
      //console.log(`${os} -> ${data}`);
      sb.setRawData(ns, data);
    }

    //console.log(`${os} -> ${ns}`);
    return ns;
  }

  const symbols = await connection.query(false, symatem.queryMask.VVV, 0, 0, 0);

  //console.log(symbols);

  for (let i = 0; i < symbols.length; i += 3) {
    if (symbols[i + 0] <= 12) continue;
    sb.setTriple(
      [
        await migrateSymbol(symbols[i + 0]),
        await migrateSymbol(symbols[i + 1]),
        await migrateSymbol(symbols[i + 2])
      ],
      true
    );
  }
}
