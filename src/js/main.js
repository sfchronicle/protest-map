require("./lib/social"); //Do not delete
var d3 = require('d3');

// setting parameters for the center of the map and initial zoom level
if (screen.width <= 480) {
  var sf_lat = 37.85;
  var sf_long = -122.43;
  var zoom_deg = 8;
} else {
  var sf_lat = 37.55;
  var sf_long = -122.0;
  var zoom_deg = 9;
}

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
var OpenStreetMap = L.tileLayer("http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png",{
  subdomains: "abcd".split(""),
  scheme: "xyz",//'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
	maxZoom: 16,
  minZoom: 7,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
OpenStreetMap.addTo(map);

// dragging and zooming controls
map.scrollWheelZoom.disable();
// map.dragging.disable();
// map.touchZoom.disable();
// map.doubleClickZoom.disable();
// map.keyboard.disable();

// initializing the svg layer
// L.svg().addTo(map)
map._initPathRoot();
