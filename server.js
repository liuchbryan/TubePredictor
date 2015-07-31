var port = 8080;
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(port);

app.get('', function(req,res) {
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {

  console.log('Tube predictor started...');

});
