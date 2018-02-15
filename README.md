# Game of Thieves
**Authors**
* [Ed Abrahamsen](https://github.com/esa2) | github.com/esa2
* [Joel Clair](https://github.com/ClairJ) | github.com/ClairJ
* [Joy Hou](https://github.com/strawbee) | github.com/strawbee
* [Mitchell Massie](https://github.com/futurebound) | github.com/futurebound

**Version**: 1.0.0

***
## Overview
This application is an variant and CLI (command line interface) implementation of a popular social game known as Mafia. There are multiple roles that will be randomly assigned to each user in a particular session. Those roles have two possible affiliations: the `town` and the `thieves`. As one may be able to guess, there are different win conditions for these two affiliations. As members of the `town`, the goal is to identify and oust the `thieves` from the game through daily voting sessions.

The game has two phases, day and night. During the day phase all users may communicate through a TCP server, providing any information they find helpful (or harmful) to the identification of the `thieves`. Before the night phase begins, every user can cast a vote on who they believe are affiliated with the `thieves`. The user with the largest amount of votes will be cast out of town. During the night phase, the `thieves` are able to speak with one another and vote on who they want to rob, driving them out of town. Each role has their own unique action they are able to take during the night phase. 

Upon daybreak, the user that was robbed will be removed from the game, and the result of some additional interactions that _may_ have occurred will be broadcast to the entire group. If there are no town members remaining at the start of either phase, the `thieves` will have won the game, and visa versa.

***
## Getting Started
To get this application up and running on your local machine, fork and/or clone this repository using the `git clone <git repository link>` command in your terminal. Next, run the `npm install` command, which will install all the necessary dependencies in the accompanying package.json file. If wanting to view tests, enter `npm install -D` into the command line. 

After those packages have installed, you can run `npm test` to explore the included tests to ensure everything is functioning as expected. `npm run test:debug` will allow for the use of the `debug` package if dev-dependencies have been installed. You can open up the cloned repository in your favorite editor to explore/modify the code, see how the tests are structured, and create tests of your own if desired. 

<!-- Downloading and installing `MongoDB` (see links below) and entering the command `npm run start-db` will initiate the database required for complete functionality in storing records of game sessions, and gathering statistics for specific user profiles. -->

**NOTE**: If you`d rather just visit the deployed site instead of downloading and hosting off your local machine, visit [Game of Thieves](gameofthieves.com) at gameofthieves.com. 

Using your command line, you can connect to the server using the following commands:
```
/* NetCat if locally hosting */
nc <IP ADDRESS OF SERVER PC> <PORT>

/* NetCat if vising hosted URL */
nc gameofthieves.com <PORT>

/* Telnet if locally hosting */
telnet <IP ADDRESS OF SERVER PC> <PORT>

/* Telnet if visiting hosted URL */
telnet gameofthieves.com <PORT>
```
Upon succuessful connection to the server as a user, the terminal window welcoming screen will look just like this:
```
    ____                               __   _____ _     _                       
   / ___| __ _ _ __ ___   ___    ___  / _| |_   _| |__ (_) _____   _____  ___   
  | |  _ / _` | '_ ` _ \ / _ \  / _ \| |_    | | | '_ \| |/ _ \ \ / / _ \/ __|  
  | |_| | (_| | | | | | |  __/ | (_) |  _|   | | | | | | |  __/\ V /  __/\__ \  
   \____|\__,_|_| |_| |_|\___|  \___/|_|     |_| |_| |_|_|\___| \_/ \___||___/  
                                                                                
 __________________________________________
/         Welcome,  <Your Username>!       \
| Use @about to read about game mechanics. |
\ Type @help to see a list of commands.    /
 ------------------------------------------
```
<!-- You can make a HTTP `POST` request using `HTTPie`, `Postman`, or a comparable tool to create a profile. This request will need to include `username`, `password`, and `email` properties all in the form of strings. With `HTTPie`, your request should look like:
```
/* local machine */
http POST :3000/signup username=myUsername password=myPassword email=emailHandle@email.com

/* deployed */
http POST <Heroku URL>/signup username=myUsername password=myPassword email=emailHandle@email.com
```
If you are using `Postman`, it's a little more complicated. After installing `Postman` you can click on the box in the top left out of 6 options upon opening the application that says `Make a Request`. From there, you can choose from a dropdown that defaults to `GET` and change the request type to `POST`, enter the desired path of `localhost:<PORT>/signup`, change ideally the `Body` tab below the `URL` entry area, click on `raw`, and then enter the above properties as bonafied JSON. Your request body should look like:
```
{
  "username": "<myUsername>",
  "password": "<myPassword>", 
  "email": "<myEmail>"
}
```-->
***
## Components/Modules

***
## Description
### Game Flow
![high-level](./img/high-level.png)

Upon successful creation and filling of a game room with 7 users, all users will be broadcast a 'game start' message that tells the user their role, their alignment based off that role, the current day and phase, as well as
```
    ____                        ____  _             _    
   / ___| __ _ _ __ ___   ___  / ___|| |_ __ _ _ __| |_  
  | |  _ / _  | '_   _ \ / _ \ \___ \| __/ _  | '__| __| 
  | |_| | (_| | | | | | |  __/  ___) | || (_| | |  | |_  
   \____|\__,_|_| |_| |_|\___| |____/ \__\__,_|_|   \__| 

 ______________________________________________________________________
/ <Username>, your role is <role>, alignment: <town || thieves>        \
| [ DAY 0, Night PHASE ] Use your night actions now.                   |
|                                                                      |
|                 Players (7):                                         |
\ <User 1>, <User 2>, <User 3>, <User 4>, <User 5>, <User 6>, <User 7> /
 ----------------------------------------------------------------------
```
Upon entering the day phase, all users in the game will be broadcast a message summarizing any public events that occurred overnight. If nobody was robbed, the message will look like this:

```
 ______________________________________________________________________
/ NEW PHASE: day <number>, day phase                                   \
|                                                                      |
| No one was robbed!                                                   |
|                                                                      |
|                                                                      |
|                                                                      |
|         Players Left (7):                                            |
\ <User 1>, <User 2>, <User 3>, <User 4>, <User 5>, <User 6>, <User 7> /
 ----------------------------------------------------------------------
 ```
Alternatively:

```
 ____________________________________________________________
/ NEW PHASE: day <number>, day phase                         \
|                                                            |
| <User 7> was robbed and had to leave town.                 |
| <User 7>'s role was <ROLE>.                                |
| <User 7>'s last words: <None || All last words>            |
|                                                            |
|                                                            |
|                                                            |
|         Players Left (6):                                  |
\ <User 1>, <User 2>, <User 3>, <User 4>, <User 5>, <User 6> /
 ------------------------------------------------------------
```
Upon entering the night phase after the first day phase, if votes were tied or no votes were cast, all users will be broadcast the following message.
```
 ____________________________________________________________
/ NEW PHASE: day <number>, night phase                       \
|                                                            |
| <No votes || Vote was tied>, no arrests!                   |
|                                                            |
|         Players Left (6):                                  |
\ <User 1>, <User 2>, <User 3>, <User 4>, <User 5>, <User 6> /
 ------------------------------------------------------------
```
Alternatively:
```
 __________________________________________________
/ NEW PHASE: day <number>, night phase             \
|                                                  |
| <User 4> [role: <ROLE>] was arrested.            |
| <User 4>'s last words: None                      |
|                                                  |
|         Players Left (5):                        |
\ <User 1>, <User 2>, <User 3>, <User 5>, <User 6> /
 --------------------------------------------------
```

Once all players with the `thieves` affiliation have been removed from the game, the channel will be broadcast a 'game-over' message:
```
   _____                    __        ___           _  
  |_   _|____      ___ __   \ \      / (_)_ __  ___| | 
    | |/ _ \ \ /\ / / '_ \   \ \ /\ / /| | '_ \/ __| | 
    | | (_) \ V  V /| | | |   \ V  V / | | | | \__ \_| 
    |_|\___/ \_/\_/ |_| |_|    \_/\_/  |_|_| |_|___(_) 
                                                       
 _________________________________________________________________
< Thank you for playing! You will be redirected to the home room. >
 -----------------------------------------------------------------
```
Alternatively if no `town` affiliated players remain:
```
  _____ _     _                      __        ___       _  
 |_   _| |__ (_) _____   _____  ___  \ \      / (_)_ __ | | 
   | | | '_ \| |/ _ \ \ / / _ \/ __|  \ \ /\ / /| | '_ \| | 
   | | | | | | |  __/\ V /  __/\__ \   \ V  V / | | | | |_| 
   |_| |_| |_|_|\___| \_/ \___||___/    \_/\_/  |_|_| |_(_) 

 _________________________________________________________________
< Thank you for playing! You will be redirected to the home room. >
 -----------------------------------------------------------------
```



### Roles
`roles.js` in the `model/` directory is home to the possible random role assignments to every user in a game session. Each nested object has `name`, `alignment`, and `action` properties.
* `name` refers to the role name, such as cop, jailor, or thief.
* `alignment` determines the alignemtn that each role belongs to, and the win condition of each player.
* `action` is a function available to each role, which determines the target of their nightly action and returns a success message to the user when they properly enter the `@action <target>` command.

There are currently 7 roles in the game, and more can be added as desired (over 30 roles in some Mafia variants). These roles are:
* Cop
* Creeper
* Dentist
* Jailor
* Locksmith
* Thief
* Thief Recruiter

### Commands
#### Game Commands
`@about` Describes the basic game mechanics to users to help those unfamiliar udnerstand the flow of the game.

`@create <room>` Creates a game room with a custom name 

`@join <room>` Joins a custom game room.

`@help` Lists all available commands.

`@me` Lists your username, name of current room, and your current role.

`@phase` Lists current day and phase in game (e.g. Day 3, Night Phase).

`@players` Lists all active players in the room.

`@roles` Lists all possible roles.

`@rooms` Lists all active game rooms, in case the creator forgot to mention it to their party.

`@quit` Removes the user from current game and closes connection to the server.

#### Day Phase Only
`@vote <playername>` Submits a vote for the specified player to be jailed (removed from the game). This command will return this message:
```
@vote <target username>

	 ##VOTE: <your username>: <target username>.
	 Use @votes to see current votes for the day.
```

`@votes` Shows current vote tallies and players they belong to.

#### Night Phase Only
`@action <playername>` Submits an action to be performed on the specified player. Returns a message to the user upon successful registratio of the action.

`@lastwords <journal entry here>` Saves a journal of whatever follows the `@lastwords` command to be broadcast to other users if they are removed from the game either by the theif or by being voted out. Gives users the ability to record what they did at night, what their role was, and anything important they feel should be shared.

***
## Data Flow



***
## Credits
* [BCrypt](https://www.npmjs.com/package/bcrypt) ~ https://www.npmjs.com/package/bcrypt
* [Body Parser](https://www.npmjs.com/package/body-parser) ~ https://www.npmjs.com/package/body-parser
* [Crypto](https://nodejs.org/api/crypto.html) ~ https://nodejs.org/api/crypto.html
* [Dotenv](https://www.npmjs.com/package/dotenv) ~ https://www.npmjs.com/package/dotenv
* [ESLint](https://www.npmjs.com/package/eslint) ~ https://www.npmjs.com/package/eslint
* [Jest](https://facebook.github.io/jest/) ~ https://facebook.github.io/jest/
* [JSON Web Token](https://www.npmjs.com/package/jsonwebtoken) ~ https://www.npmjs.com/package/jsonwebtoken
* [MongoDB](https://docs.mongodb.com/) ~ https://docs.mongodb.com/
* [Mongoose](http://mongoosejs.com/docs/guide.html) ~ http://mongoosejs.com/docs/guide.html
* [Net](https://nodejs.org/api/net.html) ~ https://nodejs.org/api/net.html
