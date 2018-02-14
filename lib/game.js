'use strict';

const server = require('./server');
const roles = require('../model/roles');
const game = module.exports;

// making things pretty
const chalk = require('chalk');
const cowsay = require('cowsay');

// colors
const roomMsg = chalk.bold.italic.white.bgBlack;
const serverResponse = chalk.italic.gray.bgWhiteBright;

// start game
game.start = user => {
  // Sets active players currently in the game
  server.all[user.currentServer].activePlayers = server.all[user.currentServer].players.slice();

  // grabbing possible roles
  let allroles = [];
  for (let i in roles) allroles.push(roles[i].name);

  // randomizing roles
  server.all[user.currentServer].players.forEach(usr => {
    usr.role = allroles.splice(Math.floor(Math.random() * allroles.length), 1)[0];
    if (usr.role === 'THIEF' || usr.role === 'THIEF RECRUITER') usr.alignment = 'thief';
    else usr.alignment = 'town';
  });

  // game start messages
  server.all[user.currentServer].players.map(usr => usr.socket.write((`
    ____                        ____  _             _    
   / ___| __ _ _ __ ___   ___  / ___|| |_ __ _ _ __| |_  
  | |  _ / _  | '_   _ \\ / _ \\ \\___ \\| __/ _  | '__| __| 
  | |_| | (_| | | | | | |  __/  ___) | || (_| | |  | |_  
   \\____|\\__,_|_| |_| |_|\\___| |____/ \\__\___,_|_|   \\__| 

`)));

  server.all[user.currentServer].players.map(usr => {
    usr.socket.write(cowsay.say({
      text: chalk`${usr.nick}, your role is {bold ${usr.role}}, alignment: {bold ${usr.alignment}}\n[ {bold DAY 0, NIGHT PHASE} ] Use your night actions now.\n\n\t\t{bold Players} (${server.all[user.currentServer].players.length}):\n${server.all[user.currentServer].players.map(el => el.nick).join(', ')}`,
    }));
  });
  server.all[user.currentServer].players.map(usr => usr.socket.write('\n'));

  // handling phasing
  function phase() {
    let interval;
    clearInterval(interval);

    // Changes phases and days
    if (!server.all[user.currentServer].phase) server.all[user.currentServer].phase = 'day';

    if (server.all[user.currentServer].phase === 'day') {
      // phases
      server.all[user.currentServer].phase = 'night';
      interval = setInterval(phase, 30000); // 30s night phase

      // tallies votes and amends active player list
      tallyDayVotes(user);

      // Checks to see if the game is won by any team
      if (checkWinner(user)) {
        clearInterval(interval);
        return;
      }
    }
    else if (server.all[user.currentServer].phase === 'night') {
      // changes phase
      server.all[user.currentServer].phase = 'day';
      if (server.all[user.currentServer].day === null) server.all[user.currentServer].day = 0;
      else server.all[user.currentServer].day++;
      interval = setInterval(phase, 60000); // 1 minute for day phase

      // tallies night actions and amends active player list
      nightActions(user);

      // checks to see if the game is won by any team
      if (checkWinner(user)) {
        clearInterval(interval);
        return;
      }
    }
  }
  phase();
};


function checkWinner(user) {
  let align = server.all[user.currentServer].activePlayers.map(player => player.alignment);
  if (align.indexOf('thief') === -1 || align.indexOf('town') === -1) {
    if (align.indexOf('thief') === -1) { // town wins
      server.all[user.currentServer].players.map(usr => usr.socket.write((`
   _____                    __        ___           _  
  |_   _|____      ___ __   \\ \\      / (_)_ __  ___| | 
    | |/ _ \\ \\ /\\ / / '_ \\   \\ \\ /\\ / /| | '_ \\/ __| | 
    | | (_) \\ V  V /| | | |   \\ V  V / | | | | \\__ \\_| 
    |_|\\___/ \\_/\\_/ |_| |_|    \\_/\\_/  |_|_| |_|___(_) 
                                                       
`)));
    }
    else if (align.indexOf('town') === -1) { // thieves win
      server.all[user.currentServer].players.map(usr => usr.socket.write((`
  _____ _     _                      __        ___       _  
 |_   _| |__ (_) _____   _____  ___  \\ \\      / (_)_ __ | | 
   | | | '_ \\| |/ _ \\ \\ / / _ \\/ __|  \\ \\ /\\ / /| | '_ \\| | 
   | | | | | | |  __/\\ V /  __/\\__ \\   \\ V  V / | | | | |_| 
   |_| |_| |_|_|\\___| \\_/ \\___||___/    \\_/\\_/  |_|_| |_(_) 

`)));
    }
    server.all[user.currentServer].players.map(usr => {
      usr.socket.write(cowsay.say({
        text: `Thank you for playing! You will be redirected to the home room.`,
        f: 'dragon',
      }));
    });
    server.all[user.currentServer].players.map(usr => usr.socket.write('\n\n'));

    // redirects user to home server
    let tempServer = user.currentServer;
    server.all[user.currentServer].players.map(usr => {
      server.all['home'].players.push(usr);
      server.all[usr.currentServer].players = server.all[usr.currentServer].players.filter(el => el.user !== usr.user);

      // resets player variables
      usr.alignment = null;
      usr.votedFor = null;
      usr.role = 'Not assigned';
      usr.lastwords = 'None';
      usr.currentServer = 'home';
      usr.targeting = null;
      usr.targeted = ['none'];
      usr.converted = false;
      usr.mute = false;
      usr.nightmsg = '';
      usr.actionUsed = false;
    });

    console.log('home');
    server.all[user.currentServer].players.map(usr => usr.socket.write(`\n\t` + roomMsg(` ${user.nick} has joined the room home. \n`) + `\t` + roomMsg(` There are ${server.all['home'].players.length} players in this room. \n`)));

    // Closes the server the game was played on
    delete server.all[tempServer];

    return true;
  }
  return false;
}


function tallyDayVotes(user) {
  let obj = {};
  server.all[user.currentServer].activePlayers.map(usr => {
    if (usr.votedFor) return usr.votedFor;
  }).forEach(vote => {
    if (!obj[vote]) obj[vote] = 1;
    else obj[vote]++;
  });
  let greatest = 0, name = [];
  Object.keys(obj).forEach(key => {
    if (obj[key] > greatest && key !== 'undefined') {
      greatest = obj[key];
      name = [key];
    }
    else if (obj[key] === greatest && key !== 'undefined') {
      name.push(key);
    }
  });
  if (server.all[user.currentServer].day > 0) {
    if (name.length === 1) {
      // server.all[user.currentServer].players.map(usr => usr.socket.write(`\t${name[0]} was arrested.\n`));
      server.all[user.currentServer].activePlayers = server.all[user.currentServer].activePlayers.filter(el => el.nick !== name[0]);

      // Last words
      let jailedUser = server.all[user.currentServer].players.filter(usr => usr.nick === name[0])[0];

      // Sends message to players
      server.all[user.currentServer].players.map(usr => usr.socket.write(cowsay.say({
        text: chalk`{bold NEW PHASE}: day ${server.all[user.currentServer].day}, ${server.all[user.currentServer].phase} phase\n\n${jailedUser.nick} [role: ${jailedUser.role}] was arrested.\n${jailedUser.nick}'s last words: ${jailedUser.lastwords}\n\n\t\t{bold Players Left} (${server.all[user.currentServer].activePlayers.length}):\n${server.all[user.currentServer].activePlayers.map(el => el.nick).join(', ')}`,
        f: 'dragon',
      })));
      server.all[user.currentServer].players.map(usr => usr.socket.write('\n'));
    }
    else if (name.length > 1) {
      server.all[user.currentServer].players.map(usr => usr.socket.write(cowsay.say({
        text: chalk`{bold NEW PHASE}: day ${server.all[user.currentServer].day}, ${server.all[user.currentServer].phase} phase\n\nVote was tied, no arrests!\n\n\t\t{bold Players Left} (${server.all[user.currentServer].activePlayers.length}):\n${server.all[user.currentServer].activePlayers.map(el => el.nick).join(', ')}`,
        f: 'dragon',
      })));
      server.all[user.currentServer].players.map(usr => usr.socket.write('\n'));
    }
    else if (!name.length) {
      server.all[user.currentServer].players.map(usr => usr.socket.write(cowsay.say({
        text: chalk`{bold NEW PHASE}: day ${server.all[user.currentServer].day}, ${server.all[user.currentServer].phase} phase\n\nNo votes, no arrests!\n\n\t\t{bold Players Left} (${server.all[user.currentServer].activePlayers.length}):\n${server.all[user.currentServer].activePlayers.map(el => el.nick).join(', ')}`,
        f: 'dragon',
      })));
      server.all[user.currentServer].players.map(usr => usr.socket.write('\n'));
    }
  }
  // Resets votes for the day
  server.all[user.currentServer].players.map(usr => usr.votedFor = null);
}

function nightActions(user) {
  let robbedUser = null;
  server.all[user.currentServer].players.forEach(usr => {
    usr.mute = false;

    if (usr.role === 'THIEF RECRUITER' && usr.targeting) {
      if (usr.actionUsed) usr.socket.write(`\n\t` + serverResponse(` You can only recruit once per game. \n`));
      else {
        usr.targeting.alignment = 'thief';
        usr.targeting.role = 'JUNIOR THIEF';
        usr.targeting.converted = true;
        usr.targeting.nightmsg = chalk`You have been recruited by the thief recruiter.\nYour new role is {bold junior thief}.\nYou have no night actions and your current night action is negated.`;
        usr.nightmsg = chalk`You have recruited {bold ${usr.targeting.nick}} to join the thieves.`;
      }
    }

    if (usr.role === 'JAILOR' && usr.targeting && !usr.converted) {
      usr.targeting.targeting = null;
    }

    if (usr.role === 'DENTIST' && usr.targeting && !usr.converted && usr.targeted.indexOf('jailed') === -1) {
      usr.targeting.mute = true;
      usr.targeting.nightmsg = chalk`You have been muted by the dentist for the day.\nYou can still use actions.`;

    }

    if (usr.role === 'COP' && usr.targeting && !usr.converted && usr.targeted.indexOf('jailed') === -1) {
      if (!usr.nightmsg) {
        usr.nightmsg = chalk`You investigated {bold ${usr.targeting.nick}} and their alignment is {bold ${usr.targeting.alignment}}.`;
      }
    }

    if (usr.role === 'CREEPER' && usr.targeting && !usr.converted && usr.targeted.indexOf('jailed') === -1) {
      if (usr.targeting.targeting) {
        if (!usr.nightmsg) {
          usr.nightmsg = chalk`You creeped on {bold ${usr.targeting.nick}} and they visited {bold ${usr.targeting.targeting.nick}}'s house.`;
        }
      }
    }

    if (usr.role === 'THIEF' && usr.targeting && usr.targeted.indexOf('jailed') === -1 && usr.targeting.targeted.indexOf('protected') === -1) {
      server.all[user.currentServer].activePlayers = server.all[user.currentServer].activePlayers.filter(el => el.nick !== usr.targeting.nick);
      robbedUser = usr.targeting;
    }
  });

  // Displays message to players
  if (robbedUser) {
    server.all[user.currentServer].players.map(usr => usr.socket.write(cowsay.say({
      text: chalk`{bold NEW PHASE}: day ${server.all[user.currentServer].day}, ${server.all[user.currentServer].phase} phase\n\n${robbedUser.nick} was robbed and had to leave town.\n${robbedUser.nick}'s role was ${robbedUser.role}.\n${robbedUser.nick}'s last words: ${robbedUser.lastwords}\n\n${usr.nightmsg}\n\n\t\t{bold Players Left} (${server.all[user.currentServer].activePlayers.length}):\n${server.all[user.currentServer].activePlayers.map(el => el.nick).join(', ')}`,
      f: 'dragon',
    })));
    server.all[user.currentServer].players.map(usr => usr.socket.write('\n'));
  } else {
    server.all[user.currentServer].players.map(usr => usr.socket.write(cowsay.say({
      text: chalk`{bold NEW PHASE}: day ${server.all[user.currentServer].day}, ${server.all[user.currentServer].phase} phase\n\nNo one was robbed!\n\n${usr.nightmsg}\n\n\t\t{bold Players Left} (${server.all[user.currentServer].activePlayers.length}):\n${server.all[user.currentServer].activePlayers.map(el => el.nick).join(', ')}`,
      f: 'dragon',
    })));
    server.all[user.currentServer].players.map(usr => usr.socket.write('\n'));
  }

  // resets targeting after night is over
  server.all[user.currentServer].players.forEach(usr => {
    usr.targeting = null;
    usr.targeted = ['none'];
    usr.converted = false;
    usr.nightmsg = '';
  });
}