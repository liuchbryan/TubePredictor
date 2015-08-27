var port = 8080;
var express = require('express');
var app = express();
var http = require('http');
var https = require("https");
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var sleep = require('sleep');
var tfl_data = {};
var station_lookup = {};

var api_key = "?app_id=f42bd7dc&app_key=a1bb31ec35c0148a84f5de064202c479"

var moorgate_northern_outbound = {
  station : "Moorgate",
  line : "Northern",
  direction : "Outbound",
};
var moorgate_northern_inbound = {
  station : "Moorgate",
  line : "Northern",
  direction : "Inbound",
};
var euston_victoria_outbound = {
  station : "Euston",
  line : "Victoria",
  direction : "Outbound"
}
var euston_victoria_inbound = {
  station : "Euston",
  line : "Victoria",
  direction : "Inbound"
}
var waterloo_jubilee_outbound = {
  station : "Waterloo",
  line : "Jubilee",
  direction : "Outbound"
}
var waterloo_jubilee_inbound = {
  station : "Waterloo",
  line : "Jubilee",
  direction : "Inbound"
}

station_lookup[JSON.stringify(moorgate_northern_outbound)] = "/StopPoint/940GZZLUMGT/Arrivals"+api_key;
station_lookup[JSON.stringify(moorgate_northern_inbound)] = "/StopPoint/940GZZLUMGT/Arrivals"+api_key;
station_lookup[JSON.stringify(euston_victoria_outbound)] = "/StopPoint/940GZZLUEUS/Arrivals"+api_key;
station_lookup[JSON.stringify(euston_victoria_inbound)] = "/StopPoint/940GZZLUEUS/Arrivals"+api_key;
station_lookup[JSON.stringify(waterloo_jubilee_outbound)] = "/StopPoint/940GZZLUWLO/Arrivals"+api_key;
station_lookup[JSON.stringify(waterloo_jubilee_inbound)] = "/StopPoint/940GZZLUWLO/Arrivals"+api_key;
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
    //console.log(tfl_data);
    if (tfl_data[JSON.stringify(station)] != null) {
      var times = tfl_data[JSON.stringify(station)];
      //console.log(times);
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
        //console.log(stations);
        //northernTrains.sort(function (a,b){return a.timeToStation - b.timeToStation});
        //socket.emit('newArrivalPrediction', northernTrains);
      });
    }

    https.request(options, callback).end();
  });


  socket.on('selectionDebug', function (selection) {
    console.log('User selected tube station/line/direction: ' + selection);
  });

});

// var options = {
//   host: 'api.tfl.gov.uk',
//   path: '/StopPoint/940GZZLUMGT/Arrivals?app_id=f42bd7dc&app_key=a1bb31ec35c0148a84f5de064202c479'
// };

var process_response = function(key, response) {
  var str = '';
  var station = JSON.parse(key);
  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    try {
      var data = JSON.parse(str).filter(function (a) {return a.modeName == "tube" && a.direction == station.direction.toLowerCase() && a.lineName == station.line});
    } catch (e) {
      console.log("TfL rate limit exceeded");
    }
    if (!data) {
      return;
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
  var timeout = 0;
  Object.keys(station_lookup).forEach(function(station){

    var options = {
      host: 'api.tfl.gov.uk',
      path: station_lookup[station]
    };
    var callback = process_response.bind(this, station)
    console.log(station);
    https.request(options, callback).end();
    sleep.usleep(500000)
    timeout += 10000;
  });

}

setInterval(getAPI,10000);
getAPI();
