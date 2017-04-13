/* jslint node: true, esnext: true */

'use strict';

import test from 'ava';

const path = require('path'),
  fs = require('fs'),
  spawn = require('child_process').spawn,
  symatem = require('symatem');


test('connection problems', async(t) => {
  //t.plan(1);
  const o = await symatem.open({
      store: path.join(__dirname, 'a.store')
    })
    .catch(e => {
      //t.pass();
      t.deepEqual(e.code, 'ECONNREFUSED');
    });

  console.log(`BBB ${JSON.stringify(o)}`);

});
