'use strict';

// app dependencies
const net = require('net');
const User = require('../model/user');
const commands = require('./commands');
const PORT = process.env.PORT;

// server controls
const server = module.exports = net.createServer();
server.all = {
  login: {
    phase: null,
    day: null,
    players: [],
    closed: false,
  },
  home: {
    phase: null,
    day: null,
    players: [],
    closed: false,
  },
};

// Making Things Pretty
const cowsay = require('cowsay');
const chalk = require('chalk');
const figlet = require('figlet');
const roomMsg = chalk.bold.italic.white.bgBlack;

server.on('connection', function (socket) {
  // creates new user object with nickname, current server (login), and socket
  let user = new User(socket);
  socket.write(roomMsg(chalk` Welcome to Game of Thieves. Type "{bold @login <username> <password>}" to log in, or "{bold @register <username> <password>}" to create an account. \n`));

  server.getConnections((err, count) => {
    if (err) throw err;
    console.log('Connections: ', count);
  });

  // welcomes user after user is logged in
  server.welcome = id => {
    user.user = id;
    // sets default user values
    user.alignment = null;
    user.votedFor = null;
    user.role = 'Not assigned';
    user.targeting = null;
    user.targeted = ['none'];
    user.converted = false;
    user.mute = false;
    user.actionUsed = false;
    user.lastwords = 'None';
    user.nightmsg = '';

    // directs user to the home room after logged in
    user.currentServer = 'home';
    server.all[user.currentServer].players.push(user);
    server.all[user.currentServer].players.filter(usr => usr.user !== user.user).map(usr => usr.socket.write(`\n\t` + roomMsg(` ${user.nick} has joined the game \n`)));

    figlet(` Game of Thieves  `, (err, text) => {
      return new Promise((resolve, reject) => {
        if (err) return reject(new Error('Figlet'));
        user.socket.write(chalk.yellowBright.bgBlack(`\n\n${text}\n`));
        return resolve();
      })
        .then(() => {
          user.socket.write(cowsay.say({
            text: `\tWelcome, ` + chalk.bold(` ${user.nick}! `) + `\nUse @about to read about game mechanics.\nType @help to see a list of commands.`,
            f: 'dragon',
          }));
        })
        .then(() => user.socket.write('\n'));
    });
    return user;
  };

  socket.on('data', function (data) {
    // console.log(user);
    commands.parse(data, user);
  });

  socket.on('close', function () {
    server.all[user.currentServer].players = server.all[user.currentServer].players.filter(usr => usr.user !== user.user);
    // if room user left is empty
    if (user.currentServer !== 'home' && user.currentServer !== 'login' && !server.all[user.currentServer].players.length) delete server.all[user.currentServer];
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
  return new Promise((resolve, reject) => {
    if (server.isOn) return reject(new Error('Server error. Cannot start server on same port when already running.'));

    figlet('Server Started', (err, text) => {
      if (err) console.log('Error: Figlet');
      console.log(text);
    });
    server.listen(PORT, () => {
      console.log(`Listening on ${PORT}`);
      server.isOn = true;
    });

    return resolve(server);

    // server.http = app.listen(PORT, () => {
    //   figlet('Server Started', (err, text) => {
    //     if (err) console.log('Error: Figlet');
    //     console.log(text);
    //   });
    //   console.log(`Listening on ${PORT}`);
    //   server.isOn = true;
    //   mongoose.connect(MONGODB_URI);
    //   return resolve(server);
    // });
  });
};

server.stop = () => {
  return new Promise((resolve, reject) => {
    if (!server.isOn) return reject(new Error('Server error. Cannot stop server that is not running.'));
    server.http.close(() => {
      server.isOn = false;
      // mongoose.disconnect();
      console.log(`Server connection closed`);
      return resolve();
    });
  });
};

// Gets connections upon initial server start
server.getConnections((err, count) => {
  if (err) throw err;
  console.log('Connections: ', count);
});