/* global describe, it, xit, before, beforeEach, after, afterEach */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const path = require('path'),
  fs = require('fs'),
  spawn = require('child_process').spawn,
  symatem = require('symatem');

describe('connection problems', () => {
  it('should fail', () =>
    symatem.open({
      store: path.join(__dirname, 'a.store')
    })
    .catch(e => assert.equal(e.code, 'ECONNREFUSED'))
  );
});
