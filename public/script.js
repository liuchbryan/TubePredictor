var socket = io.connect('http://localhost:8080');
var clock;

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
  document.getElementById('timeValue').innerHTML = '<h2>Train leaving in ' + time + ' seconds </h2>';
  clock.setTime(time);
  //clock.start();
});

socket.on('newArrivalPrediction', function(data) {
  console.log(data);
  document.getElementById('log').innerHTML = '<p>Time should be displayed.</p>';
});
