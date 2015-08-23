var socket = io.connect('localhost:8080');
var clock;
var current_time = 1000;
var showing_first_train = true;
var delay_count = 0;
var previousDirection = 'Outbound';
var selectedStation = 'Moorgate';
var selectedLine = 'Northern';
var selectedDirection = 'Outbound';

$(function() {
  clock = $('.tubeClock').FlipClock(3600, {
    countdown: true,
    clockFace: 'MinuteCounter'
  });

});

socket.on('connect', function(){

});

socket.on('newTubeTime', function(time) {

  //document.getElementById('timeValue').innerHTML = '<h2>Train leaving in ' + time + ' seconds </h2>';
  var first_train = time[0];
  var second_train = time[1];

  // clear any delay predictions when change directions
  if (selectedDirection !== previousDirection) {
    current_time = 1000;
    showing_first_train = true;
    delay_count = 0;
    previousDirection = selectedDirection;
  }

  if (first_train === 0) {
    if (showing_first_train) {
      delay_count = 0;
      showing_first_train = false;
    }
    document.getElementById("notification").innerHTML = "<div class='alert alert-success'><strong>A train is currently on the platform!</strong></div>";
    if (Math.abs(second_train - current_time) > 10) {
      current_time = second_train;
      clock.stop();
      clock.setTime(second_train);
      if (current_time !== 0) {
        clock.start();
      }
    } else {
      if (clock.getTime() - first_train > 120 || delay_count > 18) {
        document.getElementById("notification").innerHTML = "<div class='alert alert-danger'><strong>Delay detected!</strong></div>";
      }
    }
  } else {
    showing_first_train = true;
    document.getElementById("notification").innerHTML = "";
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
        document.getElementById("notification").innerHTML = "<div class='alert alert-danger'><strong>Delay detected!</strong></div>";
        delay.clock()
      }
    }
  }

});

$(document).ready(function() {
  console.log('Server is now ready.');

  var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
      var matches, substringRegex;

      // an array that will be populated with substring matches
      matches = [];

      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');

      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          matches.push(str);
        }
      });

      cb(matches);
    };
  };

  // TYPEAHEAD TUBE STATION SELECTION
  $('#station-select .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'tubes',
    source: substringMatcher(tubeStations)
  });

  $('#station-select .typeahead').bind('typeahead:select', function (e, suggestion) {
    socket.emit('selectionDebug', suggestion);
    selectedStation = suggestion;
  });
  /*$('#station-select .typeahead').bind('typeahead:cursorchange', function (e, suggestion) {
    socket.emit('selectionDebug', suggestion);
  });*/

  // TYPEAHEAD LINE SELECTION
  $('#line-select .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'lines',
    source: substringMatcher(tubeLines)
  });

  $('#line-select .typeahead').bind('typeahead:select', function (e, suggestion) {
    socket.emit('selectionDebug', suggestion);
    selectedLine = suggestion;
  });

});

socket.on('newArrivalPrediction', function(data) {
  console.log(data[0]);
  //document.getElementById('log').innerHTML = data[0];
});

function drawChart() {
    socket.on('newTubeServiceData', function(data) {
      var dataLength = data.interTrainDeparture.length;
      console.log(dataLength);
      var xData = [];
      for (var i = 1; i <= dataLength; i++) {
        xData.push(i);
      }

      $('#chart').highcharts({
        chart: {
          backgroundColor: '#222222'
        },
        title: {
            text: 'Recent Tube Arrivals',
            x: 0, //center
            style: {
              color: '#0099CC'
            }
        },
        xAxis: {
            categories: xData
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Interval between tube arrivals (sec)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                style: {
                  color: '#0099CC'
                }
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

// Gets new tube time every 5 seconds for the currently selected station
setInterval(function() {
  // Only update selected direction if radio button has been selected
  var buttonValue = $('#direction label.active input').val();
  if (buttonValue != null) {
    selectedDirection = buttonValue;
    socket.emit('selectionDebug', selectedDirection);
  }

  socket.emit('getTubeTime', {
    station : selectedStation,
    line : selectedLine,
    direction : selectedDirection,
  });
}, 1000);


setInterval(function() {
  drawChart();
}, 15000);
drawChart();

socket.emit('getTubeTime', {
  station : "Moorgate",
  line : "Northern",
  direction : "Outbound",
});
socket.emit('getArrivalPrediction', {
  station : "Moorgate",
  line : "Northern",
  direction : "Outbound",
});

navigator.geolocation.getCurrentPosition(getNearestStation);

function getNearestStation (position) {
  var lat = position.coords.latitude;
  var long = position.coords.longitude;

  socket.emit('getNearestStation', {lat:lat, long:long});

  console.log("Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude);
}

socket.emit('getTubeServiceData');

/////////////////
// TUBES LINES //
/////////////////
var tubeLines = [
  "Bakerloo",
  "Central",
  "District",
  "Hammersmith & City",
  "Jubilee",
  "Metropolitan",
  "Northern",
  "Piccadilly",
  "Victoria",
  "Waterloo & City",
  "DLR"
];

///////////////////
// TUBE STATIONS //
///////////////////
var tubeStations = [
  "Acton Town",
  "Aldgate",
  "Aldgate East",
  "All Saints",
  "Alperton",
  "Amersham",
  "Angel",
  "Archway",
  "Arnos Grove",
  "Arsenal",
  "Baker Street",
  "Balham",
  "Bank",
  "Barbican",
  "Barking",
  "Barkingside",
  "Barons Court",
  "Bayswater",
  "Beckton",
  "Beckton Park",
  "Becontree",
  "Belsize Park",
  "Bermondsey",
  "Bethnal Green",
  "Blackfriars",
  "Blackhorse Road",
  "Blackwall",
  "Bond Street",
  "Borough",
  "Boston Manor",
  "Bounds Green",
  "Bow Church",
  "Bow Road",
  "Brent Cross",
  "Brixton",
  "Bromley-by-Bow",
  "Brondesbury",
  "Brondesbury Park",
  "Buckhurst Hill",
  "Burnt Oak",
  "Caledonian Road",
  "Caledonian Road & Barnsbury",
  "Camden Road",
  "Camden Town",
  "Canada Water",
  "Canary Wharf",
  "Canning Town",
  "Cannon Street",
  "Canonbury",
  "Canons Park",
  "Chalfont & Latimer",
  "Chalk Farm",
  "Chancery Lane",
  "Charing Cross",
  "Chesham",
  "Chigwell",
  "Chiswick Park",
  "Chorleywood",
  "Clapham Common",
  "Clapham North",
  "Clapham South",
  "Cockfosters",
  "Colindale",
  "Colliers Wood",
  "Covent Garden",
  "Crossharbour And London Arena",
  "Croxley",
  "Custom House for ExCel",
  "Cutty Sark",
  "Cyprus",
  "Dagenham East",
  "Dagenham Heathway",
  "Dalston Kingsland",
  "Debden",
  "Debtford Bridge",
  "Devons Road",
  "Dollis Hill",
  "Ealing Broadway",
  "Ealing Common",
  "Earls Court",
  "East Acton",
  "East Finchley",
  "East Ham",
  "East India",
  "East Putney",
  "Eastcote",
  "Edgware",
  "Edgware Road",
  "Elephant And Castle",
  "Elm Park",
  "Elverson Road",
  "Embankment",
  "Epping",
  "Euston",
  "Euston Square",
  "Fairlop",
  "Farringdon",
  "Finchley",
  "Finchley Road",
  "Finchley Road And Frognal",
  "Finsbury Park",
  "Fulham Broadway",
  "Gallions Reach",
  "Gants Hill",
  "Gloucester Road",
  "Golders Green",
  "Goldhawk Road",
  "Goodge Street",
  "Gospel Oak",
  "Grange Hill",
  "Great Portland Street",
  "Green Park",
  "Greenford",
  "Greenwich",
  "Gunnersbury",
  "Hackney Central",
  "Hackney Wick",
  "Hainault",
  "Hammersmith",
  "Hampstead Heath",
  "Hampstead",
  "Hanger Lane",
  "Harlesden",
  "Harrow And Wealdstone",
  "Harrow on-the-Hill",
  "Hatton Cross",
  "Heathrow Terminal 4",
  "Heathrow Terminals 1,2,3",
  "Hendon Central",
  "Heron Quays",
  "High Barnet",
  "High Street Kensington",
  "Highbury & Islington",
  "Highgate",
  "Hillingdon",
  "Holborn",
  "Holland Park",
  "Holloway Road",
  "Homerton",
  "Hornchurch",
  "Hounslow Central",
  "Hounslow East",
  "Hounslow West",
  "Hyde Park Corner",
  "Ickenham",
  "Island Gardens",
  "Kennington",
  "Kensal Green",
  "Kensal Rise",
  "Kensington (Olympia)",
  "Kentish Town",
  "Kentish Town West",
  "Kenton",
  "Kew Gardens",
  "Kilburn",
  "Kilburn Park",
  "King's Cross St Pancras",
  "Kingsbury",
  "Knightsbridge",
  "Ladbroke Grove",
  "Lambeth North",
  "Lancaster Gate",
  "Latimer Road",
  "Leicester Square",
  "Lewisham",
  "Leyton",
  "Leytonstone",
  "Limehouse",
  "Liverpool Street",
  "London Bridge",
  "Loughton",
  "Manor House",
  "Mansion House",
  "Marble Arch",
  "Marylebone",
  "Maida Vale",
  "Mile End",
  "Mill Hill East",
  "Monument",
  "Moor Park",
  "Moorgate",
  "Morden",
  "Mornington Crescent",
  "Mudchute",
  "Neasden",
  "New Cross Gate",
  "New Cross",
  "Newbury Park",
  "North Acton",
  "North Ealing",
  "North Greenwich",
  "North Harrow",
  "North Wembley",
  "North Woolwich",
  "Northfields",
  "Northolt",
  "Northwick Park",
  "Northwood",
  "Northwood Hills",
  "Notting Hill Gate",
  "Oakwood",
  "Old Street",
  "Osterley",
  "Oval",
  "Oxford Circus",
  "Paddington",
  "Park Royal",
  "Parsons Green",
  "Perivale",
  "Picadilly Circus",
  "Pimlico",
  "Pinner",
  "Plaistow",
  "Poplar",
  "Preston Road",
  "Prince Regent",
  "Pudding Mill Lane",
  "Putney Bridge",
  "Queens Park",
  "Queensbury",
  "Queensway",
  "Ravenscourt Park",
  "Rayners Lane",
  "Redbridge",
  "Regent's Park",
  "Richmond",
  "Rickmansworth",
  "Roding Valley",
  "Rotherhithe",
  "Royal Albert",
  "Royal Oak",
  "Royal Victoria",
  "Ruislip",
  "Ruislip Gardens",
  "Ruislip Manor",
  "Russel Square",
  "Seven Sisters",
  "Shadwell",
  "Shepherd's Bush",
  "Shoreditch",
  "Silvertown",
  "Sloane Square",
  "Snaresbrook",
  "South Acton",
  "South Ealing",
  "South Harrow",
  "South Kensington",
  "South Kenton",
  "South Quay",
  "South Ruislip",
  "South Wimbledon",
  "South Woodford",
  "Southfields",
  "Southgate",
  "Southwark",
  "St. James's Park",
  "St John's Wood",
  "St Paul's",
  "Stamford Brook",
  "Stanmore",
  "Stepney Green",
  "Stockwell",
  "Stonebridge Park",
  "Stratford",
  "Sudbury Hill",
  "Sudbury Town",
  "Surrey Quays",
  "Swiss Cottage",
  "Temple",
  "Theydon Bois",
  "Tooting Bec",
  "Tooting Broadway",
  "Tottenham Court Road",
  "Tottenham Hale",
  "Totteridge And Whetstone",
  "Tower Gateway",
  "Tower Hill",
  "Tufnell Park",
  "Turnham Green",
  "Turnpike Lane",
  "Upminster",
  "Upminster Bridge",
  "Upney",
  "Upton Park",
  "Uxbridge",
  "Vauxhall",
  "Victoria",
  "Walthamstow Central",
  "Wanstead",
  "Wapping",
  "Warren Street",
  "Warwick Avenue",
  "Waterloo",
  "Watford",
  "Wembley Central",
  "Wembley Park",
  "West Acton",
  "West Brompton",
  "West Finchley",
  "West Ham",
  "West Hampstead",
  "West Harrow",
  "West India Quay",
  "West Kensington",
  "West Ruislip",
  "Westbourne Park",
  "Westferry",
  "Westminster",
  "White City",
  "Whitechapel",
  "Willesden Green",
  "Willesden Junction",
  "Wimbledon",
  "Wimbledon Park",
  "Wood Green",
  "Woodford",
  "Woodside Park"
];
