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
                Use @help to see list of commands.

    \n\n`);

  let user = new User(socket);
  let currentPlayers = server.all[user.currentServer].players;
  currentPlayers.push(user);
  currentPlayers.map(usr => usr.socket.write(`\t${user.nick} has joined the game\n\n`));
  server.getConnections((err, count) => {
    if (err) throw err;
    console.log('connections: ', count);
  });

  socket.on('data', function(data) {
    commands.parse(data, user);
  });

  socket.on('close', function() {
    currentPlayers = currentPlayers.filter(usr => usr.user !== user.user);
    currentPlayers.map(usr => usr.socket.write(`\t${user.nick} has left the game\n\n`));
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

server.stop = () => {
  if(server.isOn === false) return Error(new Error('Server Error. No server is running.'));
  server.http.close(() => {
    console.log(`Server connection closed`);
    server.isOn = false;
  });
};

server.getConnections((err, count) => {
  if (err) throw err;
  console.log('connections: ', count);
});
