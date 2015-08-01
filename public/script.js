var socket = io.connect('http://localhost:8080');
var clock;
var current_time = 100000;

$(function() {
  clock = $('.tubeClock').FlipClock(3600, {
    countdown: true,
    clockFace: 'MinuteCounter'
  });

});

socket.on('connect', function(){

});

$(function(){
  $('#getTime').click( function() {
    socket.emit('getTubeTime', "Moorgate");
  });
});

$(function(){
  $('#getPrediction').click( function() {
    socket.emit('getArrivalPrediction', "Moorgate");
  });
});

socket.on('newTubeTime', function(time) {
  //document.getElementById('timeValue').innerHTML = '<h2>Train leaving in ' + time + ' seconds </h2>';
  if (time !== current_time) {
    current_time = time;
    clock.stop();
    clock.setTime(time);
    clock.start();
  }

  //clock.start();
});

socket.on('newArrivalPrediction', function(data) {
  console.log(data[0]);
  //document.getElementById('log').innerHTML = data[0];
});

setInterval(function() {
  socket.emit('getTubeTime', "Moorgate");
  socket.emit('getArrivalPrediction', "Moorgate");
}, 10000);

socket.emit('getTubeTime', "Moorgate");
socket.emit('getArrivalPrediction', "Moorgate");
