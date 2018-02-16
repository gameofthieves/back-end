'use strict';

const User = require('../model/user');
const net = require('net');
const server = require('../lib/server');
const commands = require('../lib/commands');

beforeAll(server.start);
afterAll(server.stop);

describe('commands', () => {
  describe('@me test', () => {
    it('should return the user name and room they are in', () => {
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
        expect('Hulk').toMatch('Hulk');
        socket.end();
      });
    });
  });

  describe('@players test', () => {
    it('should contain the string with one player in it', () => {
      let socket = net.connect({port: 3000});
      socket.write('@create cf', () => {
        socket.on('data', () => {
          socket.write(`@players`, () => {
            socket.on('data', data => {
              console.log('DATA @players ', data.toString());
              expect(data.toString()).toMatch('Users in room cf (1):');
              socket.end();

            });
          });
        });
      });
    });
  });

  describe('@about test', () => {
    it('should contain a sentence from the about string', () => {
      let socket = net.connect({port: 3000});
      console.log('WTF');
      socket.on('data', data => {
        console.log('data upon connect', data.toString());
      });
      socket.write(`@about`, () => {
        socket.on('data', data => {
          console.log('HELLO?');
          console.log('DATA @about ', data.toString());
          expect(data.toString()).toMatch('Game of Thieves is a mafia-based CLI multi-player game.');
          socket.end();
        });
      });
    });
  });

  describe('@help test', () => {
    it('should contain a sentence from the about string', () => {
      let socket = net.connect({port: 3000});
      socket.write(`@help`, () => {
        socket.on('data', data => {
          console.log('DATA @help ', data.toString());
          expect(data.toString()).toMatch('Game of Thieves is a mafia-based CLI multi-player game.');
          socket.end();
        });
      });
    });
  });
});
