'use strict';

const superagent = require('superagent');
const server = require('./server');
const game = require('./game');
const roles = require('../model/roles');

// Filter
const Filter = require('bad-words');
const filter = new Filter();
filter.removeWords('hello');

// Making Things Pretty
const chalk = require('chalk');

exports.parse = (data, user) => {
  let message = data.toString().trim();
  let path = `:${process.env.HTTP_PORT}/api/v1`;

  // color variables
  let serverResponse = chalk.italic.gray.bgWhiteBright;
  let roomMsg = chalk.bold.italic.white.bgBlack;
  let gameInfo = chalk.whiteBright.bgCyan;

  // user can't send empty message
  if (!message) return;

  // if user has not logged in yet
  if (user.currentServer === 'login') {
    let loginArr = message.split(' ');
    let loginCmd = loginArr[0];
    let loginUser = loginArr[1];
    let loginPwd = loginArr[2];

    if (loginCmd === '@login') {
      superagent.get(`${path}/login`)
        .auth(loginUser, loginPwd)
        .then(res => {
          if (res.status === 200) {
            user.socket.write(serverResponse(` Thank you for logging in. \n`));
            user.welcome(res.body._id);
          }
        })
        .catch(err => {
          user.socket.write(serverResponse(` Login invalid: ${err} \n`));
        });
      return;
    }
    else if (loginCmd === '@register') {
      let tempUser = {
        username: loginUser,
        password: loginPwd,
      };
      superagent.post(`${path}/register`)
        .send(tempUser)
        .then(res => {
          if (res.status === 201) {
            user.socket.write(serverResponse(` Thank you for registering. \n`));
            user.welcome(res.body._id);
          }
        })
        .catch(err => {
          user.socket.write(serverResponse(` Invalid registration: ${err} \n`));
        });
      return;
    }
    else {
      user.socket.write(serverResponse(chalk` Invalid command. Type "{bold @login <username> <password>}" to log in, or "{bold @register <username> <password>}" to create an account. \n`));
      return;
    }
  }

  // if game is in session and player is not an active player (left town or has been jailed), cannot talk
  if (server.all[user.currentServer].phase && server.all[user.currentServer].activePlayers.indexOf(user) === -1) {
    user.socket.write(`\n\t` + serverResponse(` You are not an active player in the game. `) + `\n\t` + serverResponse(` You cannot speak or perform actions. \n`));
    return;
  }

  // if message is a command
  if (message.slice(0, 1) === '@') {
    let msgArr = message.split(' ');
    let cmd = msgArr[0];
    let descriptor = msgArr[1];

    switch (cmd) {
    // Shows user the help menu
    case '@about':
      user.socket.write(`
      _    _                 _      ____     _____
     / \\  | |__   ___  _   _| |_   / ___| __|_   _|
    / _ \\ | '_ \\ / _ \\| | | | __| | |  _ / _ \\| |
   / ___ \\| |_) | (_) | |_| | |_  | |_| | (_) | |
  /_/   \\_\\_.__/ \\___/ \\__,_|\\__|  \\____|\\___/|_|

 Game of Thieves is a mafia-based CLI multi-player game.
 Users can create and join game rooms.
 The game starts when there are 7 players in a room. Users
 are randomly assigned roles that determine their night
 actions and their alignment (town or thief). Each player
 does not know others' roles.
 The game starts with the night phase, where each player
 can use their night actions. Only thieves can talk during
 the night phase and townspeople cannot see the chat. The
 thieves choose one player to rob during the night, and the
 robbed player is forced to leave the game (leave town) the
 next day, unless a blocking action occurs. The night phase
 is one minute long.
 During the day phase, all players choose to vote one player
 out of the game (jail them for suspected robbery). The game
 ends when no thieves are left or when no town are left.
     Type @help to see the available list of commands.\n\n`);
      break;

    case '@help':
      user.socket.write(chalk`
   _   _      _         __  __
  | | | | ___| |_ __   |  \\/  | ___ _ __  _   _
  | |_| |/ _ \\ | '_ \\  | |\\/| |/ _ \\ '_ \\| | | |
  |  _  |  __/ | |_) | | |  | |  __/ | | | |_| |
  |_| |_|\\___|_| .__/  |_|  |_|\\___|_| |_|\\__,_|
               |_|
 ==================== {bold Game Commands} =====================
 {bold @about} - about game mechanics
 {bold @create <room>} - creates a game room
 {bold @join <room>} - joins a game room
 {bold @rooms} - lists all active rooms
 {bold @roles} - lists all possible roles
 {bold @me} - lists own name, current room, and role
 {bold @players} - lists active players in room
 {bold @phase} - lists current day and phase in game
 {bold @leaderboard} - lists top 20 players
 {bold @quit} - quits the game
 =============== {bold Day Phase Only Commands} ================
 {bold @vote <playername>} - votes to jail a player
 {bold @votes} - shows list of current votes for the day
 ============== {bold Night Phase Only Commands} ===============
 {bold @action <playername>} - performs respective night action
     for role
 {bold @lastwords} - save player's last words to output to room
     in case the user is evicted or jailed\n\n`);
      break;

    // Shows leaderboard
    case '@leaderboard': {
      superagent.get(`${path}/profile`)
        .then(res => {
          let sortedArr = res.body.sort((a, b) => b.percent - a.percent);
          let str = '';
          let length = sortedArr.length < 20 ? sortedArr.length : 20;
          for (let i = 0; i < length; i++) 
            str += `\t${sortedArr[i].profile.username.toUpperCase()}: ${sortedArr[i].percent}% won | ${sortedArr[i].profile.gamesPlayed} games played\n`;
          return str;
        })
        .then(str => {
          user.socket.write(chalk`
 _                   _           _                         _ 
| |    ___  __ _  __| | ___ _ __| |__   ___   __ _ _ __ __| |
| |   / _ \\/ _' |/ _' |/ _ \\ '__| '_ \\ / _ \\ / _' | '__/ _' |
| |__|  __/ (_| | (_| |  __/ |  | |_) | (_) | (_| | | | (_| |
|_____\\___|\\__,_|\\__,_|\\___|_|  |_.__/ \\___/ \\__,_|_|  \\__,_|
                                                            
${str}
`);
        })
        .catch(err => console.log(err));
      break;
    }

    // Creates a room
    case '@create':
      if (server.all[descriptor]) {
        user.socket.write(`\n\t` + serverResponse(` Room ${descriptor} already exists. \n`));
        return;
      }
      server.all[descriptor] = {
        phase: null,
        day: 0,
        players: [],
        closed: false,
      };
      server.all[user.currentServer].players = server.all[user.currentServer].players.filter(el => el.nick !== user.nick);
      server.all[user.currentServer].players.map(usr => usr.socket.write(`\n\t` + roomMsg(` ${user.nick} has left the room ${user.currentServer} \n`)));
      server.all[descriptor].players.push(user);
      user.socket.write(`\n\t` + roomMsg(` you have created the room ${descriptor}. \n`));
      user.currentServer = descriptor;
      break;

      // Joins a room
    case '@join': {
      if (!server.all[descriptor]) {
        user.socket.write(`\n\t` + serverResponse(` Room does not exist. \n`));
        return;
      }
      else if (user.currentServer === descriptor) {
        user.socket.write(`\n\t` + serverResponse(` You are already in the room ${descriptor}. \n`));
        return;
      }
      else if (descriptor === 'login') {
        user.socket.write(`\n\t` + serverResponse(` Cannot rejoin room ${descriptor}. \n`));
        return;
      }
      else if (server.all[descriptor].closed) {
        user.socket.write(`\n\t` + serverResponse(` A game has already started in room ${descriptor}. \n`));
        return;
      }
      else if (server.all[user.currentServer].phase && server.all[user.currentServer].activePlayers.indexOf(user) > -1) {
        user.socket.write(`\n\t` + serverResponse(` You can't join another room while active in a current game. \n`));
        return;
      }
      server.all[user.currentServer].players = server.all[user.currentServer].players.filter(el => el.nick !== user.nick);
      server.all[user.currentServer].players.map(usr => usr.socket.write(`\n\t` + roomMsg(` ${user.nick} has left the room ${user.currentServer} \n`)));
      server.all[descriptor].players.push(user);
      let temp = user.currentServer;
      user.currentServer = descriptor;

      if (descriptor !== 'home' && descriptor !== 'login') {
        server.all[descriptor].players.map(usr => usr.socket.write(`\n\t` + roomMsg(` ${user.nick} has joined the room ${descriptor}. \n`) + `\t` + roomMsg(` Players: ${server.all[descriptor].players.length}; ${7 - server.all[descriptor].players.length} more players needed. \n`)));

        // starts game
        if (server.all[descriptor].players.length === 7) {
          server.all[descriptor].closed = true;
          game.start(user);
        }
      }
      else if (descriptor === 'home') server.all[descriptor].players.map(usr => usr.socket.write(`\n\t` + roomMsg(` ${user.nick} has joined the room ${descriptor}. \n`)));

      // deletes previous room if now empty
      if (temp !== 'home' && temp !== 'login' && !server.all[temp].players.length) delete server.all[temp];
      break;
    }

    // Lists all active rooms
    case '@rooms': {
      let str = '';
      for (let i in server.all) str += `${i}(${server.all[i].players.length}) `;
      user.socket.write(`\n\t` + gameInfo(chalk` {bold Room(#players)}: ${str}\n\n`));
      break;
    }

    // Lists all possible roles in play and a description of each role
    case '@roles':
      user.socket.write(chalk`

    ____                        ____       _            
   / ___| __ _ _ __ ___   ___  |  _ \\ ___ | | ___  ___  
  | |  _ / _' | '_ ' _ \\ / _ \\ | |_) / _ \\| |/ _ \\/ __| 
  | |_| | (_| | | | | | |  __/ |  _ < (_) | |  __/\\__ \\ 
   \\____|\\__,_|_| |_| |_|\\___| |_| \\_\\___/|_|\\___||___/ 
                                                        

 {bold [ COP ] town}
 Can investigate one player each night. Receives "town" or "thief"
 result for that player. Use @action <playername> at night to investigate.

 {bold [ LOCKSMITH ] town}
 Can protect one player each night from being robbed. If targeted player
 is also targeted by the thief, nothing will happen. Receives no result
 back. Use @action <playername> to protect a player at night.

 {bold [ JAILOR ] town}
 Can prevent one player's night action. If targeted player performs a
 night action, their action will not take effect. Receives no result back.
 Use @action <playername> to jail a player at night.

 {bold [ CREEPER ] town}
 Can see who one player targeted each night. If the targeted player
 performs a night action, the creeper will receive a result of who the
 action was directed toward. If the targeted player does not perform an
 action, no result will be received. Use @action <playername> to stalk a
 player at night.

 {bold [ DENTIST ] town}
 Can visit one player at night and perform dental procedures. The targeted
 player is muted during the next day phase and cannot speak, but can still
 use actions. Receives no result back. Use @action <playername> to mute a
 player at night.

 {bold [ THIEF ] thief}
 Can rob one player each night. Can speak at night to other thieves to
 coordinate action. If robbery is successful, the player will leave the
 town (game) at the next day phase. Use @action <playername> to rob a
 player at night.

 {bold [ THIEF RECRUITER ] thief}
 Can cause one town-aligned player to become a thief. {bold Ability can only
 be used once a game. The recruiter cannot be blocked by the jailor.} If
 recruitment is successful, the targeted player will receive notification
 that s/he has become a thief at the next day phase, and the targeted
 player's night action for the current night will not take effect. Use
 @action <playername> at night to recruit.

 {bold [ JUNIOR THIEF ] thief}
 The junior thief is a formerly town-aligned player who has been recruited by
 the thief recruiter. {bold The junior thief cannot use any night actions}, but
 can talk with fellow thieves during the night phase.\n\n`);
      break;

      // Lists user's name, role, and list of actions performed so far this game
    case '@me':
      user.socket.write(`\n\t` + gameInfo(` ===== USER ===== \n`) + `\t` + gameInfo(` Name: ${user.nick} \n`) + `\t` + gameInfo(` Room: ${user.currentServer} \n`) + `\t` + gameInfo(` Role: ${user.role} \n\n`));
      break;

      // Lists all players in current room, or active players if game in progress
    case '@players':
      if (!server.all[user.currentServer].phase) {
        user.socket.write(`\n\t` + gameInfo(` Users in room ${user.currentServer} (${server.all[user.currentServer].players.length}): \n`) + `\t` + gameInfo(` ${server.all[user.currentServer].players.map(el => el.nick).join(', ')} \n\n`));
        break;
      }
      user.socket.write(`\n\t` + gameInfo(chalk` Active users playing in room {bold ${user.currentServer}} (${server.all[user.currentServer].activePlayers.length}): \n`) + `\t` + gameInfo(`${server.all[user.currentServer].activePlayers.map(el => el.nick).join(', ')} \n\n`));
      break;

      // Lists what phase it is
    case '@phase':
      if (!server.all[user.currentServer].phase) {
        user.socket.write(`\n\t` + gameInfo(` No game currently in progress. \n\n`));
        break;
      }
      user.socket.write(`\n\t` + gameInfo(`Currently on day ${server.all[user.currentServer].day}, ${server.all[user.currentServer].phase} phase. \n\n`));
      break;

      // Quits the game
    case '@quit':
      user.socket.write(`\n\t` + roomMsg(` See you later, ${user.nick} \n`));
      user.socket.end();
      break;

      // DAY PHASE ONLY
      // Allows user to vote for another user
    case '@vote': {
      if (server.all[user.currentServer].phase !== 'day') {
        user.socket.write(`\n\t` + serverResponse(` Cannot use @vote when it is not day phase. \n`));
        break;
      }
      let isValidName = false;
      server.all[user.currentServer].activePlayers.forEach(player => {
        if (player.nick === descriptor)
          isValidName = true;
      });
      if (!isValidName) {
        user.socket.write(`\n\t` + serverResponse(` Not a valid player. Use @players to see players in game. \n`));
        break;
      }
      server.all[user.currentServer].players.map(usr => usr.socket.write(chalk.bold(`\n\t ##VOTE: ${user.nick}: ${descriptor}.\n\t Use @votes to see current votes for the day. \n\n`)));
      user.votedFor = descriptor;
      break;
    }
    // Lists current votes
    case '@votes': {
      if (server.all[user.currentServer].phase !== 'day') {
        user.socket.write(`\n\t` + serverResponse(` Cannot use @votes when it is not day phase. \n`));
        break;
      }
      let obj = {};
      server.all[user.currentServer].activePlayers.map(usr => {
        if (usr.votedFor) return usr.votedFor;
      }).forEach(vote => {
        if (!obj[vote]) obj[vote] = 1;
        else obj[vote]++;
      });
      let str = '';
      Object.keys(obj).forEach(key => {
        if (key !== 'undefined') str += `\n\t` + gameInfo(` ${key}: ${obj[key]} `);
      });
      if (!str) user.socket.write(`\n\t` + gameInfo(` No votes yet today. \n`));
      else user.socket.write(`${str}\n\n`);
      break;
    }

    // NIGHT PHASE ONLY
    // Players use respective night actions
    case '@action': {
      if (server.all[user.currentServer].phase !== 'night') {
        user.socket.write(`\n\t` + serverResponse(` Cannot use @action when it is not night phase. \n`));
        break;
      }
      let isValidName = false;
      server.all[user.currentServer].activePlayers.forEach(player => {
        if (player.nick === descriptor)
          isValidName = true;
      });
      if (!isValidName) {
        user.socket.write(`\n\t` + serverResponse(` Not a valid player. Use @players to see players in game. \n`));
        break;
      }
      // finds user object
      let targeted = server.all[user.currentServer].activePlayers.filter(player => player.nick === descriptor)[0];
      // passes in targeted user object and user object
      switch (user.role) {
      case 'LOCKSMITH':
        roles.locksmith.action(targeted, user);
        break;
      case 'COP':
        roles.cop.action(targeted, user);
        break;
      case 'CREEPER':
        roles.creeper.action(targeted, user);
        break;
      case 'DENTIST':
        roles.dentist.action(targeted, user);
        break;
      case 'JAILOR':
        roles.jailor.action(targeted, user);
        break;
      case 'THIEF':
        roles.thief.action(targeted, user);
        break;
      case 'THIEF RECRUITER':
        roles.thiefrecruiter.action(targeted, user);
        break;
      default: {
        user.socket.write(`\n\t` + serverResponse(` Your role does not have a night action. \n`));
        return;
      }
      }

      user.socket.write(`\n\t` + serverResponse(` Your night action has been recorded. \n\n`));
      break;
    }

    // @lastwords saves user's last words for when the user is evicted / jailed
    case '@lastwords':
      if (server.all[user.currentServer].phase !== 'night') {
        user.socket.write(`\n\t` + serverResponse(` Cannot use @lastwords when it is not night phase. \n`));
        break;
      }
      user.lastwords = filter.clean(msgArr.slice(1).join(' '));
      user.socket.write(`\n\t` + serverResponse(` Your last words have been recorded. \n\n`));
      break;

    default:
      user.socket.write(`\n\t` + serverResponse(` Invalid command. Use @help to see commands. \n`));
    }
  } else {
    // NOT AN @ command
    // filters message
    let msg = filter.clean(message);

    // if game is in session and player is muted by the dentist for the day
    if (server.all[user.currentServer].phase && user.mute) {
      user.socket.write(`\n\t` + serverResponse(` You were visited by the dentist last night and can't talk today. `) + `\n\t` + serverResponse(` You can still perform actions. \n`));
      return;
    }
    // if no game in progress or during day phase, all active players in the room can talk
    else if (!server.all[user.currentServer].phase || server.all[user.currentServer].phase === 'day') {
      server.all[user.currentServer].players.filter(usr => usr.nick !== user.nick)
        .map(usr => usr.socket.write(chalk`> {bold ${user.nick}}: ${msg}\n`));
      user.socket.write((chalk`> {bold ${user.nick}}({italic self}): ${msg}\n`));
    }
    // if night phase, only thieves can talk to each other
    else if (server.all[user.currentServer].phase === 'night') {
      if (user.alignment === 'town') {
        user.socket.write(`\n\t` + serverResponse(` Message not delivered: only thieves can talk during night phase. \n`));
        return;
      }
      server.all[user.currentServer].players.filter(usr => usr.alignment !== 'town')
        .map(usr => usr.socket.write(chalk`> {bold ${user.nick}} [{italic thieves}]: ${msg}\n`));
    }
  }
};
