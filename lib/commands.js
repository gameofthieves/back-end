'use strict';

const server = require('./server');
const game = require('./game');

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
      Game will start when there are 7 players in the room.

      COMMANDS:
        @create <room> - creates a room
        @join <room> - joins a room
        @rooms - lists all active rooms
        @roles - lists all possible roles
        @me - lists own name, current room, role, and current game actions
        @players - lists current players in room
        @phase - lists current day and phase in game
        @quit - quits the game
      DAY PHASE ONLY COMMANDS:
        @vote <playername> - votes to jail a player
        @votes - list of current votes for the day
      NIGHT PHASE ONLY COMMANDS:
        @action <playername> - performs respective night action for role
        @lastwords '<last words>' - saves user's last words to output to room in case the user is evicted or jailed
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
      server.all[descriptor].players.map(user => user.socket.write(`\t${user.nick} has joined the room ${descriptor}.\n\tThere are ${server.all[descriptor].players.length} players connected; ${7 - server.all[descriptor].players.length} more players needed.\n\n`));
      user.currentServer = descriptor;

      if (server.all[descriptor].players.length === 2) game.start(user);
      break;

    // Lists all active rooms
    case '@rooms':
      user.socket.write(`\tCurrent rooms: ${Object.keys(server.all).join(', ')}\n\n`);
      break;
    
    // Lists all possible roles in play and a description of each role
    case '@roles':
      user.socket.write(`
      ==================== POSSIBLE ROLES IN PLAY ====================

      COP [town]: Can investigate one player each night. Receives "guilty" or "innocent" result. Use @action <playername> during night phase to investigate.

      LOCKSMITH [town]: Can protect one player each night from being robbed. Use @action <playername> during night phase to protect.

      JAILOR [town]: Can jail and prevent one player from performing their night action each night. Use @action <playername> during night phase to block a player.

      CREEPER [town]: Can creep on one player each night and see whose house they visited (who they targeted) and receives the target player's name back. Use @action <playername> to creep.

      DENTIST [town]: Can target one player during the night phase and them during the entire next day phase. The muted player can vote but cannot speak. Use @action <playername> to mute.

      THIEF [thief]: Can rob one player each night and force the player to leave town. Collaborate with fellow thieves to decide who to rob, and use @action <playername> to rob.

      THIEF RECRUITER [thief]: Can recruit one town-aligned player per game, during the night phase, to join the thieves. Can save this ability to use on a different night. Use @action <playername> to recruit.
      \n`);
      break;

    // Lists user's name, role, and list of actions performed so far this game
    case '@me':
      user.socket.write(`
      ===== USER =====
      Name: ${user.nick}
      Room: ${user.currentServer}
      Role: ${user.role}
      \n`);
      break;

    // Lists all players in current room
    case '@players':
      user.socket.write(`\t${server.all[user.currentServer].activePlayers.length} users still the game at ${user.currentServer} room: \n\t${server.all[user.currentServer].activePlayers.map(el => el.nick).join(', ')}\n\n`);
      break;

    // Lists what phase it is
    case '@phase':
      user.socket.write(`
      Currently on Day ${server.all[user.currentServer].day}, ${server.all[user.currentServer].phase} phase.
      \n`);
      break;

    // Quits the game
    case '@quit':
    // What happens when a user quits when a game in in progress?
      user.socket.write(`\tSee you later, ${user.nickname}\n`);
      user.socket.end();
      break;

    // DAY PHASE ONLY
    // Allows user to vote for another user
    case '@vote':{
      if (server.all[user.currentServer].phase !== 'day') {
        user.socket.write(`\tCannot use @vote when it is not day phase.\n\n`);
        break;
      }
      let isValidName = false;
      server.all[user.currentServer].activePlayers.forEach(player => {
        if(player.nick === descriptor)
          isValidName = true;
      });
      if (!isValidName) {
        console.log(descriptor);
        user.socket.write(`\tNot a valid player. Use @players to see players in game.\n\n`);
        break;
      }
      server.all[user.currentServer].players.map(usr => usr.socket.write(`\t##VOTE: ${user.nick}: ${descriptor}.\n\tUse @votes to see current votes for the day.\n\n`));
      user.votedFor = descriptor;
      break;
    }
    // Lists current votes
    case '@votes': {
      if (server.all[user.currentServer].phase !== 'day') {
        user.socket.write(`\tCannot use @votes when it is not day phase.\n\n`);
        break;
      }
      let obj = {};
      server.all[user.currentServer].activePlayers.map(usr => {
        console.log(usr.votedFor);
        if (usr.votedFor) return usr.votedFor;
      }).forEach(vote => {
        if (!obj[vote]) obj[vote] = 1;
        else obj[vote]++;
      });
      let str = '';
      Object.keys(obj).forEach(key => {
        if (key !== 'undefined') str += `\t${key}: ${obj[key]}\n`;
      });
      server.all[user.currentServer].players.map(usr => usr.socket.write(`${str}\n\n`));
      break;
    }

    // NIGHT PHASE ONLY
    // Players use respective night actions
    case '@action': {
      if (server.all[user.currentServer].phase !== 'night') {
        user.socket.write(`\tCannot use @action when it is not night phase.\n\n`);
        break;
      }

      //   let isValidName = false;
      //   server.all[user.currentServer].players.forEach(player => {
      //     if (player.nick === descriptor)
      //       isValidName = true;
      //   });
      //   if (!isValidName) {
      //     console.log(descriptor);
      //     user.socket.write(`\tNot a valid player. Use @players to see players in game.\n\n`);
      //     break;
      //   }

      // program actions here

      break;
    }
    
    // @lastwords saves user's last words for when the user is evicted / jailed
    case '@lastwords':
      if (server.all[user.currentServer].phase !== 'night') {
        user.socket.write(`\tCannot use @lastwords when it is not night phase.\n\n`);
        break;
      }
      user.lastwords = msgArr.slice(1).join(' ');
      user.socket.write(`\tYour last words have been noted.\n\n`);
      break;

    default:
      user.socket.write('\tYou have entered an invalid command.\n\n');
    }
  } else {
    // if day phase or server is home, everyone can talk to each other
    if (server.all[user.currentServer].phase === 'day' || user.currentServer === 'home') {
      server.all[user.currentServer].players.filter(usr => usr !== user)
        .map(usr => usr.socket.write(`${user.nick}: ${message}\n\n`));
    }
    // if night phase, only thieves can talk to each other
    else if (server.all[user.currentServer].phase === 'night') {
      server.all[user.currentServer].players.filter(usr => usr.alignment !== 'town')
        .map(usr => usr.socket.write(`${user.nick}: ${message}\n\n`));

      if (user.alignment === 'town') user.socket.write(`\tMessage not delivered: only thieves can talk during night phase.\n\n`);
    }
  }
};