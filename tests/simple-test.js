import test from 'ava';

const path = require('path'),
  fs = require('fs'),
  symatem = require('symatem');

test('connection', async t => {
  const connection = await symatem
    .open({
      store: path.join(__dirname, 'a.store')
    })
    .catch(e => {
      //t.pass();
      t.deepEqual(e.code, 'ECONNREFUSED');
    });

  const result = await connection.upload('networkInterface');

  t.deepEqual(result, [308]);
});
