'use strict';

// Application Dependencies
const net = require('net');
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
const User = require('../model/user');
const commands = require('./commands');

// Making Things Pretty
const cowsay = require('cowsay');
const chalk = require('chalk');
const figlet = require('figlet');
const roomMsg = chalk.bold.italic.white.bgBlack;

server.on('connection', function (socket) {
  let user = new User(socket);
  server.all[user.currentServer].players.push(user);
  server.all[user.currentServer].players.filter(usr => usr.user !== user.user).map(usr => usr.socket.write(`\n\t` + roomMsg(` ${user.nick} has joined the game \n`)));

  figlet(` Game of Thieves  `, (err, text) => {
    return new Promise((resolve, reject) => {
      if (err) return reject(new Error('Figlet'));
      socket.write(chalk.yellowBright.bgBlack(`${text}\n`));
      return resolve();
    })
      .then(() => {
        socket.write(cowsay.say({
          text: `\tWelcome, ` + chalk.bold(` ${user.nick}! `) + `\nUse @about to read about game mechanics.\nType @help to see a list of commands.`,
          f: 'dragon',
        }));
      })
      .then(() => socket.write('\n'));
  });

  server.getConnections((err, count) => {
    if (err) throw err;
    console.log('Connections: ', count);
  });

  socket.on('data', function (data) {
    commands.parse(data, user);
  });

  socket.on('close', function () {
    server.all[user.currentServer].players = server.all[user.currentServer].players.filter(usr => usr.user !== user.user);
    // if room user left is empty
    if (user.currentServer !== 'home' && !server.all[user.currentServer].players.length) delete server.all[user.currentServer];
    // if a user quits and no game is in progress
    else if (!server.all[user.currentServer].phase) {
      server.all[user.currentServer].players.map(usr => usr.socket.write(`\n\t` + roomMsg(` ${user.nick} has left the chat. \n`)));
    }
    // if game is in progress and user is still an active user
    else if (server.all[user.currentServer].phase && server.all[user.currentServer].activePlayers.indexOf(user) > -1) {
      server.all[user.currentServer].players.map(usr => usr.socket.write(`\n\t` + roomMsg(` ${user.nick} has quit the game. ${user.nick}'s role was ${user.role}. \n`)));
      server.all[user.currentServer].activePlayers = server.all[user.currentServer].activePlayers.filter(usr => usr.user !== user.user);
    }

    server.getConnections((err, count) => {
      if (err) throw err;
      console.log('Connections: ', count);
    });
  });

  socket.on('error', function (error) {
    console.error(error);
  });
});

server.start = () => {
  if (server.isOn) return Error(new Error('Server Error. Server already running.'));
  figlet('Server Started', (err, text) => {
    if (err) console.log('Error: Figlet');
    console.log(text);
  });
  server.listen(PORT, () => {
    server.isOn = true;
    console.log(`server.isOn: ${server.isOn}`);
    console.log(`Listening on ${PORT}`);
  });
};

server.stop = () => {
  if (server.isOn === false) return Error(new Error('Server Error. No server is running.'));
  server.close(() => {
    server.isOn = false;
    console.log(`server.isOn: ${server.isOn}`);
    console.log(`Server connection closed`);
  });
};

server.getConnections((err, count) => {
  if (err) throw err;
  console.log('Connections: ', count);
});
