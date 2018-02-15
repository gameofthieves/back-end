'use strict';

const net = require('net');
const commands = require('../lib/commands.js');
const server = require('../lib/server.js');


describe('commands', () => {
  let client = net.connect({port: 3000});
  describe('valid responses for commands', () => {
    client.on('data', () => {
      client.write('hello world');
      console.log('TESTING SERVER.ALL', server.all);
    });

  });
  it('should return a success string for each valid command', () => {
    client.end();
  });
});
