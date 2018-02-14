'use strict';

// const net = require('net');
// const User = require('../model/user');
// const command = require('../lib/commands');
// const server = module.exports = net.createServer();
const server = require('../lib/server');
const PORT = process.env.PORT;
require('jest');

describe('#server', function() {
  beforeEach(() => {
    console.log(`starting server on ${PORT}`);
    return server.start();
  });
  afterEach(server.stop);

  it('should be listening on port 4000', () => {
    // server.listen(PORT, () => console.log(`Listening on ${PORT}`));
    console.log(PORT);
    expect(PORT).toBe('4000');
  });
});