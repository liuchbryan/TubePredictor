var port = 8080;
var express = require('express');
var app = express();
var http = require('http');
var https = require("https");
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var tfl_data = {};
var station_lookup = {};

var moorgate = {
  station : "Moorgate",
  line : "Northern",
  direction : "Outbound",
};
station_lookup[JSON.stringify(moorgate)] = "/StopPoint/940GZZLUMGT/Arrivals?app_id=f42bd7dc&app_key=a1bb31ec35c0148a84f5de064202c479";

// module for accessing the data about the interval between train arrivals
var interArrival = require('./api_logger/interArrival.js');


server.listen(port);

app.get('', function(req,res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

io.sockets.on('connection', function(socket) {

  console.log('Tube predictor started...');

  socket.on('getTubeServiceData', function(args) {
    var tubeServiceData = interArrival.getTubeServiceData();
    socket.emit('newTubeServiceData', tubeServiceData);
  });

  socket.on('getTubeTime', function(station) {
    /*callback = function(response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we return it
      response.on('end', function () {
        try {
          var timeData = JSON.parse(str);
        } catch (e) {
          console.log("TfL Rate limit exceeded");
          return;
        }
        var northernTrains = timeData.filter(function (a){
          var rc = (a.lineId ==="northern" && a.direction==="outbound");
          return rc;
          })
        northernTrains.sort(function (a,b){return a.timeToStation - b.timeToStation});
        //console.log(timeData);
        socket.emit('newTubeTime', [northernTrains[0].timeToStation, northernTrains[1].timeToStation]);
        console.log('Sending tube time...'+northernTrains[0].timeToStation);
      });

    }

    https.request(options, callback).end();
    // Get tube time logic here (time in seconds)
    //var time = 180;


    //socket.emit('newTubeTime', time);*/
    console.log(station);
    // Using default station 'moorgate',
    // user selected station is passed in as 'station'

    if (tfl_data[JSON.stringify(moorgate)] != null) {
      var times = tfl_data[JSON.stringify(moorgate)];
      if (times[0] != null &&
          times[1] != null) {
        socket.emit('newTubeTime', [times[0].timeToStation, times[1].timeToStation]);
      }
    }

  });

  socket.on('getArrivalPrediction', function(args) {
    /*callback = function(response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we return it
      response.on('end', function () {
        try {
          var timeData = JSON.parse(str);
        } catch (e) {
          console.log("TfL Rate limit exceeded");
          return;
        }
        var northernTrains = timeData.filter(function (a){
          var rc = (a.lineId ==="northern" && a.direction==="outbound");
          return rc;
        })
        northernTrains.sort(function (a,b){return a.timeToStation - b.timeToStation});
        socket.emit('newArrivalPrediction', northernTrains);
      });
    }

    https.request(options, callback).end();*/
  });

  socket.on('getNearestStation', function (args) {
    var options = {
      host: 'api.tfl.gov.uk',
      path: '/Place?lat='+args.lat+'&lon='+args.long+'&radius=1000&app_key=a1bb31ec35c0148a84f5de064202c479'
    };
    callback = function(response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we return it
      response.on('end', function () {
        try {
          var stations = JSON.parse(str).filter(function (a) {return a.modeName = "tube"});
        } catch (e) {
          console.log("TfL rate limit exceeded");
          return;
        }
        console.log(stations);
        //northernTrains.sort(function (a,b){return a.timeToStation - b.timeToStation});
        //socket.emit('newArrivalPrediction', northernTrains);
      });
    }

    https.request(options, callback).end();
  });


  socket.on('typeaheadDebug', function (selection) {
    console.log('User selected tube station/line: ' + selection);
  });

});

// var options = {
//   host: 'api.tfl.gov.uk',
//   path: '/StopPoint/940GZZLUMGT/Arrivals?app_id=f42bd7dc&app_key=a1bb31ec35c0148a84f5de064202c479'
// };

var process_response = function(key, response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    try {
      var data = JSON.parse(str).filter(function (a) {return a.modeName = "tube"});
    } catch (e) {
      console.log("TfL rate limit exceeded");
    }
    data.sort(function (a,b){return a.timeToStation - b.timeToStation});
    tfl_data[key] = data;
    //console.log(data);
    //console.log(data[0].currentLocation+" "+data[0].timeToStation);
    //console.log(tfl_data);
  });
}



function getAPI () {
  console.log("getAPI");

  Object.keys(station_lookup).forEach(function(station){
    console.log("Test");
    console.log(station);
    var options = {
      host: 'api.tfl.gov.uk',
      path: station_lookup[station]
    };
    var callback = process_response.bind(this, station)
    https.request(options, callback).end();
  });

}

setInterval(getAPI,10000);
getAPI();
