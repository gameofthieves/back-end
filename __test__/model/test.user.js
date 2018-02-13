'use strict';

const server = require('../../lib/server');
const superagent = require('superagent');

describe('user.js', () => {
  beforeAll(server.start);
  afterAll(server.stop);

});
