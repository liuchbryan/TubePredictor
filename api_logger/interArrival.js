var https = require("https");
var fs = require('fs');
var interTrainDeparture = [];
var arrivingVehicleId = [];
var trainDwellTime = [20, 20, 20, 20, 20, 20, 20, 20];
var nextTrainIn;
var incomingTrain;


// Load from "persistent" storage upon startup
fs.readFile('./Tubepredictor/api_logger/log.txt', function (err, data) {
  if (err) throw err;
  var parsedData = JSON.parse(data);
  interTrainDeparture = parsedData.interTrainDeparture;
  arrivingVehicleId = parsedData.arrivingVehicleId;
});

//var interTrainDeparture = [180, 180, 180, 180, 180, 180, 180, 180];
//var arrivingVehicleId = [0, 0, 0, 0, 0, 0, 0, 0];
var lastDeparture = Date.now()-170000;
var lastArrival = Date.now()-170000;

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
var options = {
  host: 'api.tfl.gov.uk',
  path: '/StopPoint/940GZZLUMGT/Arrivals?app_id=f42bd7dc&app_key=87030b99a4ddd2b8dad24249d6119456'
};

var app_id = "f42bd7dc";
var app_key = "87030b99a4ddd2b8dad24249d6119456";
var moorgate = "940GZZLUMGT";
var old_street = "940GZZLUODS";

callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  function isNorthernNorthbound(elem, index, array) {
    return (elem.lineId == 'northern' && elem.direction == 'outbound');
  }

  function compareArrivalTime(preda, predb) {
    return preda.timeToStation - predb.timeToStation;
  }

  function printArrivalData(curr, index, array) {
    console.log(curr.vehicleId + " to " +
                curr.destinationName + ", arriving in " +
                curr.timeToStation + " seconds, currently " +
                curr.currentLocation);
  }

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    var data = (JSON.parse(str)).filter(isNorthernNorthbound);

    var firstTrain = data.sort(compareArrivalTime)[0];
    //console.log('First train: ' + firstTrain.vehicleId)
    if (arrivingVehicleId[7] != firstTrain.vehicleId) {
      
      // Drop the inter-train departure time 8 trains in the past
      // Add the latest one
      lastInterTrainDeparture = Math.floor((Date.now() - lastDeparture)/1000);
      lastDeparture = Date.now();
      interTrainDeparture.shift();
      interTrainDeparture.push(lastInterTrainDeparture);

      lastTrainDwellTime = Math.floor((Date.now() - lastArrival)/1000);
      trainDwellTime.shift();
      trainDwellTime.push(lastTrainDwellTime);

      arrivingVehicleId.shift()
      arrivingVehicleId.push(firstTrain.vehicleId);
      
      incomingTrain = true;
    }

    // Dwelling time
    if ((firstTrain.currentLocation == 'At Platform' ||  
         firstTrain.timeToStation == 0) && incomingTrain) {
      lastArrival = Date.now();
      incomingTrain = false;
    }
    nextTrainIn = firstTrain.timeToStation;

    // "Persistent" data storage, just the past 8 train data
      var dataToWrite = JSON.stringify({"arrivingVehicleId": arrivingVehicleId,
                         "interTrainDeparture": interTrainDeparture,
                         "trainDwellTime": trainDwellTime});
      console.log(dataToWrite);
      fs.writeFile('./Tubepredictor/api_logger/log.txt', dataToWrite, function (err) {
        if (err) return console.log(err);
        //console.log('dataToWrite > log.txt');
      });

    //console.log(arrivingVehicleId);
    //console.log(interTrainDeparture);
    data.map(printArrivalData);
    //console.log('');
  });
}



function populateInterDepartureTime () {
  //console.log('----------------')
  var options_moorgate = {
    host: 'api.tfl.gov.uk',
    path: '/StopPoint/' + moorgate + '/Arrivals?app_id=' + app_id + '&app_key=' + app_key

  }
  https.request(options_moorgate, callback).end();

  //var options_old_street = {
  //  host: 'api.tfl.gov.uk',
  //  path: '/StopPoint/' + old_street + '/Arrivals?app_id=' + app_id + '&app_key=' + app_key
  //}
  //https.request(options_old_street, callback).end();  
}


//https.request(options, callback).end();
setInterval(populateInterDepartureTime,5000)
