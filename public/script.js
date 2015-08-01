var socket = io.connect('http://localhost:8080');
var clock;
var current_time = 1000;

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
  var first_train = time[0];
  var second_train = time[1];
  if (current_time === undefined && first_train < 45) {
    console.log("train too soon so giving user the next one");
    current_time = second_train;
    clock.setTime(current_time);
    clock.start();
  } else if (Math.abs(first_train - current_time) > 10) {
    current_time = first_train;
    clock.stop();
    clock.setTime(first_train);
    if (current_time !== 0) {
      clock.start();
    }
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
}, 5000);

socket.emit('getTubeTime', "Moorgate");
socket.emit('getArrivalPrediction', "Moorgate");
