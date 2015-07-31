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

  socket.on('getTubeTime', function(station) {

    // Get tube time logic here (time in seconds)
    var time = '180';

    console.log('Sending tube time...');

    var message = '<h1>Tube leaving in: ' + time + ' seconds</h1>';
    socket.emit('newTubeTime', message);

  });

});
