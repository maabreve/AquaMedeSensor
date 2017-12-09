var express = require('express');
var app = express();
var mongoose = require('mongoose');

var config = require('./config.js');

var port = process.env.PORT || 8080;

mongoose.connect(config.url); 

// routes ======================================================================
require('./routes.js')(app); 

// launch ======================================================================
const server = app.listen(port, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
});