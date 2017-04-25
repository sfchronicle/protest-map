require("./lib/social"); //Do not delete
var d3 = require('d3');

// setting parameters for the center of the map and initial zoom level
if (screen.width <= 480) {
  var sf_lat = 37.5;
  var sf_long = -122.23;
  var zoom_deg = 9;

  var offset_top = 900;

} else {
  var sf_lat = 37.6;
  var sf_long = -122.5;
  var zoom_deg = 10;

  var offset_top = 600;
}

// making a list of all the days of the presidency (for which we have protests)
var days = [], dates = [], prevDay = -1;
protestData.forEach(function(d){
  if (d.Day != prevDay) {
    days.push(d.Day);
    dates.push(d.Date);
    prevDay = d.Day;
  }
});

// initialize map with center position and zoom levels
var map = L.map("map", {
  minZoom: 7,
  maxZoom: 16,
  zoomControl: false,
  dragging: true,
  touchZoom: true
  // zoomControl: isMobile ? false : true,
  // scrollWheelZoom: false
}).setView([sf_lat,sf_long], zoom_deg);;
// window.map = map;

map.dragging.enable();

// add tiles to the map
var mapLayer = L.tileLayer("https://api.mapbox.com/styles/v1/emro/ciyvv7c2n003h2sqvmfffselg/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZW1ybyIsImEiOiJjaXl2dXUzMGQwMDdsMzJuM2s1Nmx1M29yIn0._KtME1k8LIhloMyhMvvCDA",{attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'})
mapLayer.addTo(map);


// dragging and zooming controls
map.scrollWheelZoom.disable();
map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.keyboard.disable();

// initializing the svg layer
// L.svg().addTo(map)
map._initPathRoot();

// creating Lat/Lon objects that d3 is expecting
protestData.forEach(function(d,idx) {
	d.LatLng = new L.LatLng(d.Lat,
							d.Lon);
});

var svg = d3.select("#map").select("svg"),
g = svg.append("g");

// draw bubbles
var drawMap = function(dayData,current_event) {

	d3.select("svg").selectAll("circle").remove();
	var svg = d3.select("#map").select("svg"),
	g = svg.append("g");

  // transition time
  var duration = 700;

  // adding circles to the map
  var feature = g.selectAll("circle")
    .data(dayData)
    .enter().append("circle")
    .attr("id",function(d) {
      return d.Location;
    })
    .attr("class",function(d) {
      return "dot "+d.Location;
    })
    .style("opacity", function(d) {
      if ((d.Count == current_event) || (current_event == 100)) {
        return 0.9;
      } else {
        return 0.4;
      }
    })
    .style("fill", function(d) {
      return "#c11a1a";//"#E32B2B";//"#3C87CF";
    })
    .style("stroke","#696969")
    .attr("r", function(d) {
      if (screen.width <= 480) {
        return d.Size*5;
      } else {
        return d.Size*10;
      }
    });

    map.on("viewreset", update);
    update();

    function update() {
    feature.attr("transform",
    function(d) {
      return "translate("+
        map.latLngToLayerPoint(d.LatLng).x +","+
        map.latLngToLayerPoint(d.LatLng).y +")";
      }
    )
  }

  if (current_event != 101){
    if (screen.width >= 480) {
      map.setView(new L.LatLng(dayData[dayData.length-1]["Lat"], dayData[dayData.length-1]["Lon"]-0.3), map.getZoom(), {"animation": true});
    } else {
      map.setView(new L.LatLng(dayData[dayData.length-1]["Lat"]-0.3, dayData[dayData.length-1]["Lon"]), map.getZoom(), {"animation": true});
    }
  } else {
    map.setView(new L.LatLng(sf_lat, sf_long), map.getZoom(), {"animation": true});
  }

}

var dayData = protestData.filter(function(d) {
    return d.Day <= 101
});
drawMap(dayData,101);

var qsa = s => Array.prototype.slice.call(document.querySelectorAll(s));

var scrollTimer = null;
$(window).scroll(function () {
    if (scrollTimer) {
        clearTimeout(scrollTimer);   // clear any previous pending timer
    }
    scrollTimer = setTimeout(handleScroll, 60);   // set new timer
});

var i; var prevIDX = -1; var prevmapIDX = -1;

function handleScroll() {
    scrollTimer = null;

    var pos = $(this).scrollTop();
    var pos_map_top = $('#bottom-of-top').offset().top;
    var pos_map_bottom = $('#top-of-bottom').offset().top-500;
    if (pos < pos_map_top){
      var dayData = protestData.filter(function(d) {
          return d.Day <= 101
      });
      drawMap(dayData,101);
      var prevmapIDX = -1;
      document.getElementById("day-box").classList.remove("show");
    }
    qsa(".map-panel").forEach(function(map,mapIDX) {
      var pos_map = $('#mapevent'+mapIDX).offset().top-offset_top;
      if ((pos > pos_map) && (mapIDX != prevmapIDX)) {
        prevmapIDX = mapIDX;
        var dayData = protestData.filter(function(d) {
            return d.Count <= mapIDX
        });
        drawMap(dayData,+mapIDX);
        document.getElementById("day-box").classList.add("show");
        document.getElementById("display-day").innerText = dayData[dayData.length-1]["Day"];
      }
    });
    // don't actually need this because the footer is so huge now
    // if (pos > pos_map_bottom) {
    //   document.getElementById("day-box").classList.remove("show");
    // }
}
