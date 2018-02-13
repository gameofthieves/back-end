'use strict';

const server = require('./server');
const game = module.exports;

game.roles = ['COP', 'LOCKSMITH', 'JAILOR', 'CREEPER', 'DENTIST', 'THIEF', 'THIEF RECRUITER'];

game.start = user => {
  // Sets active players currently in the game
  server.all[user.currentServer].activePlayers = server.all[user.currentServer].players.slice();

  // Randomly assigns each player a role and sets alignment based on role
  server.all[user.currentServer].players.forEach(user => {
    user.role = game.roles.splice(Math.floor(Math.random() * game.roles.length), 1)[0];
    if (user.role === 'THIEF' || user.role === 'THIEF RECRUITER') user.alignment = 'thief';
    else user.alignment = 'town';
  });

  // Sends game start message with role to each player
  server.all[user.currentServer].players.map(user => user.socket.write(`\tGAME HAS STARTED. 
    Your role is ${user.role}, alignment: ${user.alignment}.
    Day 0, NIGHT Phase:
    Type @action <username> to perform night action.
    Type @players to see users in game.\n\n`));

  // Sets intervals for day and night phases to change
  game.phase = () => {
    clearInterval(game.interval);

    // Changes phases and days
    if (!server.all[user.currentServer].phase) server.all[user.currentServer].phase = 'day';

    if (server.all[user.currentServer].phase === 'day') {
      // tallies votes and amends active player list
      tallyDayVotes(user);

      // Checks to see if the game is won by any team
      if (checkWinner(user)) return;

      // phases
      server.all[user.currentServer].phase = 'night';
      game.interval = setInterval(game.phase, 10000); // 30,000 - 30sec night phase
    }
    else if (server.all[user.currentServer].phase === 'night') {
      // changes phase
      server.all[user.currentServer].phase = 'day';
      if (server.all[user.currentServer].day === null) server.all[user.currentServer].day = 0;
      else server.all[user.currentServer].day++;
      game.interval = setInterval(game.phase, 20000); // one minute for day phase
    }

    // Notifies players of day and phase
    server.all[user.currentServer].players.map(usr => usr.socket.write(`\tNew Phase Started: Day ${server.all[user.currentServer].day}, ${server.all[user.currentServer].phase} Phase\n\n`));
  };
  game.phase();
};

function checkWinner(user) {
  let align = server.all[user.currentServer].activePlayers.map(player => player.alignment);
  if (align.indexOf('thief') === -1 || align.indexOf('town') === -1) {
    if (align.indexOf('thief') === -1) {
      server.all[user.currentServer].players.map(usr => usr.socket.write(`\tTOWN WINS!\n\n`));
    } // town wins
    else if (align.indexOf('town') === -1) {
      server.all[user.currentServer].players.map(usr => usr.socket.write(`\tTHIEVES WIN!\n\n`));
    }// thieves win

    // redirects user to home server
    let tempServer = user.currentServer;
    server.all[user.currentServer].players.map(usr => {
      usr.socket.write(`\tThank you for playing! You will be redirected to the home room.\n`);
      server.all['home'].players.push(usr);
      server.all[usr.currentServer].players = server.all[usr.currentServer].players.filter(el => el.user !== usr.user);

      // resets player variables
      usr.affiliation = null;
      usr.votedFor = null;
      usr.role = 'Not assigned';
      usr.lastwords = 'None';
      usr.currentServer = 'home';
    });

    server.all['home'].players.map(usr => usr.socket.write(`\t${user.nick} has joined the room home.\n\tThere are ${server.all['home'].players.length} players in this room.\n\n`));

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
      server.all[user.currentServer].players.map(usr => usr.socket.write(`\t${name[0]} was arrested.\n`));
      server.all[user.currentServer].activePlayers = server.all[user.currentServer].activePlayers.filter(el => el.nick !== name[0]);

      // Last words
      let jailedUser = server.all[user.currentServer].players.filter(usr => usr.nick === name[0])[0];
      server.all[user.currentServer].players.map(usr => usr.socket.write(`\t${jailedUser.nick}'s role was ${jailedUser.role}.\n`));
      server.all[user.currentServer].players.map(usr => usr.socket.write(`\t${jailedUser.nick}'s last words: ${jailedUser.lastwords}.\n\n`));
    }
    else if (name.length > 1) 
      server.all[user.currentServer].players.map(usr => usr.socket.write(`\tThe vote was tied, so no one was arrested today.\n`));
    else if (!name.length)
      server.all[user.currentServer].players.map(usr => usr.socket.write(`\tNo one voted, so no one was arrested today.\n`));
  }

  // Resets votes for the day
  server.all[user.currentServer].players.map(usr => usr.votedFor = null);
}