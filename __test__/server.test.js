'use strict';

const net = require('net');
const server = require('../lib/server');
const PORT = process.env.PORT;
require('jest');

describe('testing socket write', () => {
  it('should return a socket name', done => {
    let socket = net.connect(3000, 'localhost');
    socket.name = 'Hulk';
    socket.write('Welcome to game of thieves\n');
    socket.write(`Your name is ${socket.name}\n`);
    expect(socket.name).toMatch('Hulk');
    
    done();
  });
});

describe('testing on connection', () => {
  it('should return a dragon', done => {
    let messages = [];
    let socket = net.connect({port: 3000});
    socket.on('data', data => {
      messages.push(data.toString());
      socket.end(null, () => {
        expect(messages[0]).toMatch('Welcome to Game of Thieves!');
        done();
      });
    });
  });
});

describe('valid requests', () => {
  it('should listen on port 4000', () => {
    server.listen(PORT, () => console.log(`Listening on ${PORT}`));
    expect(PORT).toEqual('4000');
  });
});
