'use strict';

const net = require('net');
// const User = require('../model/user');
// const command = require('../lib/commands');
const server = module.exports = net.createServer();
const PORT = process.env.PORT;

describe('#server', () => {
  beforeAll(server.start);
  afterAll(server.stop);

  it('should be listening on port 4000', () => {
    // server.listen(PORT, () => console.log(`Listening on ${PORT}`));
    expect(PORT).toBe(4000);
  });

  it('should be on', () => {
    expect(server.isOn).toBe(true);
  });
});