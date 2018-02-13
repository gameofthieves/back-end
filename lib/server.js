'use strict';

// Application Dependencies
const net = require('net');
const User = require('../model/user');
const server = module.exports = net.createServer();
const PORT = process.env.PORT;
server.all = {
  home: {
    phase: null,
    day: null,
    players: [],
  },
};
const commands = require('./commands');

server.on('connection', function(socket) {
  socket.write(`
    =============== Welcome to Game of Thieves! ===============

    \n\n`);

  let user = new User(socket);
  server.all[user.currentServer].players.push(user);
  server.all[user.currentServer].players.map(usr => usr.socket.write(`\t${user.nick} has joined the game\n\n`));
  server.getConnections((err, count) => {
    if (err) throw err;
    console.log('connections: ', count);
  });

  socket.on('data', function(data) {
    commands.parse(data, user);
  });

  socket.on('close', function() {
    server.all[user.currentServer].players = server.all[user.currentServer].players.filter(usr => usr.user !== user.user);
    server.all[user.currentServer].players.map(usr => usr.socket.write(`\t${user.nick} has left the game\n\n`));
  });

  socket.on('error', function(error) {
    console.error(error);
  });
});

server.start = () => {
  if(server.isOn) return Error(new Error('Server Error. Server already running.'));
  server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
    server.isOn = true;
  });
};

server.getConnections((err, count) => {
  if (err) throw err;
  console.log('connections: ', count);
});