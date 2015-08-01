var port = 8080;
var express = require('express');
var app = express();
var http = require('http');
var https = require("https");
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

  socket.on('getArrivalPrediction', function(args) {
    https.request(options, callback).end();
  });

});

var options = {
  host: 'api.tfl.gov.uk',
  path: '/StopPoint/940GZZLUMGT/Arrivals?app_id=f42bd7dc&app_key=87030b99a4ddd2b8dad24249d6119456'
};

callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we return it
  response.on('end', function () {
    socket.emit('newArrivalPrediction', JSON.parse(str));
  });
}
