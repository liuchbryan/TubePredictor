var https = require("https");

var interTrainDeparture = [3, 3, 3, 3, 3, 3, 3, 3];
var arrivingVehicleId = [0, 0, 0, 0, 0, 0, 0, 0];
var lastDeparture = Date.now();

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
    console.log('First train: ' + firstTrain.vehicleId)
    if (arrivingVehicleId[7] != firstTrain.vehicleId) {
      
      lastInterTrainDeparture = (Date.now() - lastDeparture)/1000;
      lastDeparture = Date.now();
      interTrainDeparture.shift();
      interTrainDeparture.push(lastInterTrainDeparture);

      arrivingVehicleId.shift()
      arrivingVehicleId.push(firstTrain.vehicleId);
    }
    console.log(arrivingVehicleId);
    console.log(interTrainDeparture);
    //data.map(printArrivalData);
    console.log('');
  });
}

exports.getInterArrivals = function() {
  return interTrainDeparture;
}


function populateInterDepatureTime() {
  console.log('----------------')
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
setInterval(populateInterDepatureTime,10000)
