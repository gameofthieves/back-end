'use strict';

const server = require('./server');

exports.parse = (data, user) => {
  let message = data.toString();

  if (message.slice(0, 1) === '@') {
    let msgArr = message.trim().split(' ');
    let cmd = msgArr[0];
    let descriptor = msgArr[1];

    switch (cmd) {
    // Shows user the help menu
    case '@help':
      user.socket.write(`
      ========== GAME OF THIEVES HELP MENU ==========
      
      \n`);
      break;

      // Creates a room
    case '@create':
      if (server.all[descriptor]) {
        user.socket.write(`\tRoom already exists.\n\n`);
        return;
      }
      server.all[descriptor] = {
        phase: null,
        day: 0,
        players: [],
      };
      server.all[user.currentServer].players = server.all[user.currentServer].players.filter(el => el !== user);
      server.all[user.currentServer].players.map(user => user.socket.write(`\t${user.nick} has left the room ${user.currentServer}.\n\n`));
      server.all[descriptor].players.push(user);
      server.all[descriptor].players.map(user => user.socket.write(`\t${user.nick} has created the room ${descriptor}.\n\n`));
      user.currentServer = descriptor;
      break;

      // Joins a room
    case '@join':
      if (!server.all[descriptor]) {
        user.socket.write(`\tRoom does not exist.\n\n`);
        return;
      }
      if (user.currentServer === descriptor) {
        user.socket.write(`\tAlready in room.\n\n`);
        return;
      }
      if (server.all[descriptor].players.length >= 7) {
        user.socket.write(`\tRoom already full.\n\n`);
        return;
      }
      server.all[user.currentServer].players = server.all[user.currentServer].players.filter(el => el !== user);
      server.all[user.currentServer].players.map(user => user.socket.write(`\t${user.nick} has left the room ${user.currentServer}.\n\n`));
      server.all[descriptor].players.push(user);
      server.all[descriptor].players.map(user => user.socket.write(`\t${user.nick} has joined the room ${descriptor}.\n\n`));
      user.currentServer = descriptor;
      break;

    // Lists all active rooms
    case '@rooms':
      user.socket.write(`\tCurrent rooms: ${Object.keys(server.all).join(', ')}\n\n`);
      break;
    
    // Lists all possible roles in play and a description of each role
    case '@roles':
      user.socket.write(`
      ========== POSSIBLE ROLES IN PLAY ==========
      
      \n`);
      break;

    // Lists user's name, role, and list of actions performed so far this game
    case '@me':
      user.socket.write(`
      About User
      
      \n`);
      break;

    // Lists what phase it is
    case '@phase':
      user.socket.write(`
      Phase:
      
      \n`);
      break;

    // Lists all players in current room
    case '@players':
      user.socket.write(`\t${server.all[user.currentServer].players.length} users connected in ${user.currentServer} room: \n\t${server.all[user.currentServer].players.map(el => el.nick).join(', ')}\n\n`);
      break;

    // Quits the game
    case '@quit':
      user.socket.write(`\tSee you later, ${user.nickname}\n`);
      user.socket.end();
      break;

    // DAY PHASE SETUP
    // @lastwords saves user's last words for when the user is evicted / jailed
    case '@lastwords':
      break;

    // DAY PHASE ONLY
    // Allows user to vote for another user
    case '@vote':
      break;

    // Lists current votes
    case '@votes':
      break;

    // NIGHT PHASE ONLY
    // Thieves choose who to rob during night phase
    case '@rob':
      break;

    // Players use respective night actions
    case '@action':
      break;
    
    default:
      user.socket.write('\tYou have entered an invalid command.\n\n');
    }
  } else {
    // if day phase
    server.all[user.currentServer].players.filter(c => c !== user)
      .map(user => user.socket.write(`${user.nick}: ${message}`));

    // if night phase
  }
};