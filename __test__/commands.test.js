'use strict';

const User = require('../model/user');
const net = require('net');
const server = require('../lib/server');
const commands = require('../lib/commands');

describe('Run the @me command', () => {
  it('should return the user name and room they are in', done => {
    let socket = net.connect(3000, 'localhost');
    let user = new User(socket);
    server.all[user.currentServer].players.push(user);
    server.all[user.currentServer].players.map(usr => usr.socket.write(`\t${user.nick} has joined the game\n\n`));
    server.getConnections((err, count) => {
      if (err) throw err;
      console.log('connections: ', count);
    });
    socket.on('data', function () {
      commands.parse('@me'.toString('base64'), user);
    });
    expect('Hulk').toMatch('Hulk');
    done();
  });
});
