var https = require("https");

console.log("this is working");

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
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

    data.sort(compareArrivalTime);
    data.map(printArrivalData);
    console.log('');
  });
}



function getAPI () {
  console.log("getAPI");
  https.request(options, callback).end();
}

//https.request(options, callback).end();
setInterval(getAPI,10000)
