'use strict';

const server = require('./server');
const game = module.exports;

game.roles = ['COP', 'LOCKSMITH', 'JAILOR', 'CREEPER', 'DENTIST', 'THIEF', 'THIEF RECRUITER'];

game.start = (user) => {
  let currentPlayers = server.all[user.currentServer].players;
  // Sets active players currently in the game
  server.all[user.currentServer].activePlayers = currentPlayers.slice();

  // Randomly assigns each player a role and sets alignment based on role
  currentPlayers.forEach(user => {
    user.role = game.roles.splice(Math.floor(Math.random() * game.roles.length), 1)[0];
    if (user.role === 'THIEF' || user.role === 'THIEF RECRUITER') user.alignment = 'thief';
    else user.alignment = 'town';
  });

  // Sends game start message with role to each player
  currentPlayers.map(user => user.socket.write(`\tGAME HAS STARTED. 
    Your role is ${user.role}, alignment: ${user.alignment}.
    Day 0, NIGHT Phase:
    Type @action <username> to perform night action.
    Type @players to see users in game.\n\n`));

  // Sets intervals for day and night phases to change
  game.phase = () => {
    clearInterval(game.interval);
    // Checks to see if the game is won by any team
    let align = server.all[user.currentServer].activePlayers.map(player => player.alignment);
    if (align.indexOf('thief') === -1) return; // town wins
    if (align.indexOf('town') === -1) return; // thieves win

    if (!server.all[user.currentServer].phase) server.all[user.currentServer].phase = 'day';

    // Changes phases and days
    if (server.all[user.currentServer].phase === 'day') {
      // tallies votes
      let obj = {};
      server.all[user.currentServer].activePlayers.map(usr => {
        if (usr) return usr.votedFor;
      }).forEach(vote => {
        if (!obj[vote]) obj[vote] = 1;
        else obj[vote]++;
      });
      let greatest = 0, name = '';
      Object.keys(obj).forEach(key => {
        if (obj[key] > greatest) {
          greatest = obj[key];
          name = key;
        }
      });
      if (server.all[user.currentServer].day) {
        server.all[user.currentServer].players.map(usr => usr.socket.write(`${name} was arrested.\n\n`));
        server.all[user.currentServer].activePlayers = server.all[user.currentServer].activePlayers.filter(el => el.nick !== name);
      }

      // phases
      server.all[user.currentServer].phase = 'night';
      game.interval = setInterval(game.phase, 60000); // one minute for night phase
    }
    else if (server.all[user.currentServer].phase === 'night') {
      // deletes votes for the day
      server.all[user.currentServer].players.map(usr => usr.votedFor = null);

      // changes phase
      server.all[user.currentServer].phase = 'day';
      if (server.all[user.currentServer].day === null) server.all[user.currentServer].day = 0;
      else server.all[user.currentServer].day++;
      game.interval = setInterval(game.phase, 120000); // two minutes for day phase
    }

    // Notifies players of day and phase
    currentPlayers.map(user => user.socket.write(`\tNew Phase Started: Day ${server.all[user.currentServer].day}, ${server.all[user.currentServer].phase} Phase\n\n`));
  };
  game.phase();
};