'use strict';

// Application Dependencies
const net = require('net');
const User = require('../model/user');
const cowsay = require('cowsay');
const server = module.exports = net.createServer();
const PORT = process.env.PORT;
server.all = {
  home: {
    phase: null,
    day: null,
    players: [],
    closed: false,
  },
};
const commands = require('./commands');

server.on('connection', function (socket) {
  socket.write(cowsay.say({
    text : `=============== Welcome to Game of Thieves! ===============
    Use @help to see list of commands.
`}));

  let user = new User(socket);
  server.all[user.currentServer].players.push(user);
  server.all[user.currentServer].players.map(usr => usr.socket.write(`\t${user.nick} has joined the game\n\n`));
  server.getConnections((err, count) => {
    if (err) throw err;
    console.log('connections: ', count);
  });

  socket.on('data', function (data) {
    commands.parse(data, user);
  });

  socket.on('close', function () {
    server.all[user.currentServer].players = server.all[user.currentServer].players.filter(usr => usr.user !== user.user);
    // if a user quits and no game is in progress
    if (!server.all[user.currentServer].phase) {
      server.all[user.currentServer].players.map(usr => usr.socket.write(`\t${user.nick} has left the chat.\n\n`));
    }
    // if game is in progress and user is still an active user
    else if (server.all[user.currentServer].phase && server.all[user.currentServer].activePlayers.indexOf(user) > -1) {
      server.all[user.currentServer].players.map(usr => usr.socket.write(`\t${user.nick} has quit the game. ${user.nick}'s role was ${user.role}.\n\n`));
      server.all[user.currentServer].activePlayers = server.all[user.currentServer].activePlayers.filter(usr => usr.user !== user.user);
    }

    server.getConnections((err, count) => {
      if (err) throw err;
      console.log('connections: ', count);
    });
  });

  socket.on('error', function (error) {
    console.error(error);
  });
});

server.start = () => {
  if (server.isOn) return Error(new Error('Server Error. Server already running.'));
  server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
    server.isOn = true;
  });
};

server.stop = () => {
  if(server.isOn === false) return Error(new Error('Server Error. No server is running.'));
  server.isOn = false;
  server.close();
  console.log('Server connection closed');
};

server.getConnections((err, count) => {
  if (err) throw err;
  console.log('connections: ', count);
});
