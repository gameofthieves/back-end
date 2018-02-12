'use strict';
//TODO: once we are ready to deploy replace this info below with the following
// require('dotenv').config();
// require('./lib/server').start();
console.log('HERE in index.js');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 4444));

app.get('/', function(req, res) {
    res.render('pages/index');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

//TODO:for any changes, push changes to master then, git push heroku master;
