'use strict';

// Application Dependencies
const net = require('net');
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
const User = require('../model/user');
const commands = require('./commands');
const superagent = require('superagent');
const PORT = process.env.PORT;
const path = `:${process.env.HTTP_PORT}/api/v1`;

// Making Things Pretty
const cowsay = require('cowsay');
const chalk = require('chalk');
const figlet = require('figlet');
const roomMsg = chalk.bold.italic.white.bgBlack;

server.on('connection', function (socket) {
  // creates new user object with nickname, current server (login), and socket
  let user = new User(socket);
  socket.write(roomMsg(chalk`\n ======== Welcome to Game of Thieves. ======== \n     Log In: {bold @login <username> <password>}      \n   Register: {bold @register <username> <password>}   \n`));

  server.getConnections((err, count) => {
    if (err) throw err;
    console.log('Connections: ', count);
  });

  // welcomes user after user is logged in
  user.welcome = id => {
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

    // gets and sets profile fields on user object
    superagent.get(`${path}/profile/${user.user}`)
      .then(res => {
        user.profileId = res.body._id;
        user.gamesPlayed = res.body.gamesPlayed;
        user.gamesWon = res.body.gamesWon;
        user.username = res.body.username;
      })
      .catch(err => console.log(err));

    // directs user to the home room after logged in
    user.currentServer = 'home';
    server.all[user.currentServer].players.push(user);
    server.all[user.currentServer].players.filter(usr => usr.user !== user.user).map(usr => usr.socket.write(`\n\t` + roomMsg(` ${user.nick} has joined the game \n`)));

    user.socket.write(chalk.yellowBright.bgBlack(`
    ____                               __   _____ _     _                       
   / ___| __ _ _ __ ___   ___    ___  / _| |_   _| |__ (_) _____   _____  ___   
  | |  _ / _' | '_ ' _ \\ / _ \\  / _ \\| |_    | | | '_ \\| |/ _ \\ \\ / / _ \\/ __|  
  | |_| | (_| | | | | | |  __/ | (_) |  _|   | | | | | | |  __/\\ V /  __/\\__ \\  
   \\____|\\__,_|_| |_| |_|\\___|  \\___/|_|     |_| |_| |_|_|\\___| \\_/ \\___||___/  
                                                                                
`));
    user.socket.write(cowsay.say({
      text: `\tWelcome, ` + chalk.bold(` ${user.nick}! `) + `\nUse @about to read about game mechanics.\nType @help to see a list of commands.`,
      f: 'dragon',
    }));
    user.socket.write(`\n`);
  };

  socket.on('data', function (data) {
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
  if (server.isOn) return Error(new Error('Server Error. Server already running.'));
  figlet('Server Started', (err, text) => {
    if (err) console.log('Error: Figlet');
    console.log(text);
  });
  server.listen(PORT, () => {
<<<<<<< HEAD
=======
    console.log(`TCP: Listening on ${PORT}`);
>>>>>>> 33b9256c21417c1e70b5e41eebe6c3c749741926
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
