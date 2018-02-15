'use strict';

const User = require('../model/user');
const net = require('net');
const server = require('../lib/server');
const commands = require('../lib/commands');

describe('Valid commands', () => {
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
    expect('@me'.toString('base64')).toMatch('@me');
    done();
  });

  it('should return the help commands', done => {
    let socket = net.connect(3000, 'localhost');
    let user = new User(socket);
    server.all[user.currentServer].players.push(user);
    server.all[user.currentServer].players.map(usr => usr.socket.write(`\t${user.nick} has joined the game\n\n`));
    server.getConnections((err, count) => {
      if (err) throw err;
      console.log('connections: ', count);
    });
    socket.on('data', function () {
      commands.parse('@help'.toString('base64'), user);
    });
    expect('@help'.toString('base64')).toMatch('@help');
    done();
  });

  it('should return the player roles', done => {
    let socket = net.connect(3000, 'localhost');
    let user = new User(socket);
    server.all[user.currentServer].players.push(user);
    server.all[user.currentServer].players.map(usr => usr.socket.write(`\t${user.nick} has joined the game\n\n`));
    server.getConnections((err, count) => {
      if (err) throw err;
      console.log('connections: ', count);
    });
    socket.on('data', function () {
      commands.parse('@help'.toString('base64'), user);
    });
    expect('@roles'.toString('base64')).toMatch('@roles');
    done();
  });

  it('should return the game mechanics', done => {
    let socket = net.connect(3000, 'localhost');
    let user = new User(socket);
    server.all[user.currentServer].players.push(user);
    server.all[user.currentServer].players.map(usr => usr.socket.write(`\t${user.nick} has joined the game\n\n`));
    server.getConnections((err, count) => {
      if (err) throw err;
      console.log('connections: ', count);
    });
    socket.on('data', function () {
      commands.parse('@help'.toString('base64'), user);
    });
    expect('@about'.toString('base64')).toMatch('@about');
    done();
  });
});