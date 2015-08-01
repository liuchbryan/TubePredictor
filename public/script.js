var socket = io.connect('http://localhost:8080');
var clock;
var current_time = 1000;
var showing_first_train = true;
var delay_count = 0;

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

  if (first_train === 0) {
    if (showing_first_train) {
      delay_count = 0;
      showing_first_train = false;
    }
    document.getElementById("notification").innerHTML = "<div class='alert alert-warning'><strong>A train is currently on the platform!</strong></div>";
    if (Math.abs(second_train - current_time) > 10) {
      current_time = second_train;
      clock.stop();
      clock.setTime(second_train);
      if (current_time !== 0) {
        clock.start();
      }
    } else {
      ++delay_count;
      if (clock.getTime() - first_train > 50 || delay_count > 8) {
        document.getElementById("notification").innerHTML = "<div class='alert alert-warning'><strong>Delay detected!</strong></div>";
      }
    }
  } else {
    showing_first_train = true;
    if (Math.abs(first_train - current_time) > 10) {
      current_time = first_train;
      clock.stop();
      clock.setTime(first_train);
      if (current_time !== 0) {
        clock.start();
      }
    } else {
      ++delay_count;
      if (clock.getTime() - first_train > 50 || delay_count > 8) {
        document.getElementById("notification").innerHTML = "<div class='alert alert-warning'><strong>Delay detected!</strong></div>";
        delay.clock()
      }
    }
  }

  //if (clock.getTime() -)


  //clock.start();
});

socket.on('newArrivalPrediction', function(data) {
  console.log(data[0]);
  //document.getElementById('log').innerHTML = data[0];
});

socket.emit('getTubeTime', "Moorgate");
socket.emit('getArrivalPrediction', "Moorgate");

function drawChart() {
    socket.emit('getTubeServiceData');
    socket.on('newTubeServiceData', function(data) {
      var dataLength = data.interTrainDeparture.lenght;
      console.log(dataLength);
      var xData;
      for (var i = 1; i <= dataLength; i++) {
        xData.push(i);
      }

      $('#chart').highcharts({
        title: {
            text: 'Recent Tube Arrivals',
            x: -20 //center
        },
        xAxis: {
            categories: xData
        },
        yAxis: {
            title: {
                text: 'Interval between tube arrivals (sec)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        legend: {
          enabled : false
        },
        tooltip: {
            valueSuffix: 'sec'
        },
        series: [{
            //name: 'Tokyo',
            data: data.interTrainDeparture
        }]
      });
    });
}

setInterval(function() {
  socket.emit('getTubeTime', "Moorgate");
  socket.emit('getArrivalPrediction', "Moorgate");
}, 5000);

setInterval(function() {
  drawChart();
}, 15000);
drawChart();
