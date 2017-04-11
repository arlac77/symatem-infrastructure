/* jslint node: true, esnext: true */

'use strict';

import test from 'ava';

const path = require('path'),
  fs = require('fs'),
  spawn = require('child_process').spawn,
  symatem = require('symatem');


test('connection problems', t => {
  symatem.open({
      store: path.join(__dirname, 'a.store')
    })
    .catch(e => t.deepEqual(e.code, 'ECONNREFUSED'));
});
