require("./lib/social"); //Do not delete
var d3 = require('d3');

// setting parameters for the center of the map and initial zoom level
if (screen.width <= 480) {
  var sf_lat = 37.85;
  var sf_long = -122.43;
  var zoom_deg = 8;
} else {
  var sf_lat = 37.6;
  var sf_long = -122.2;
  var zoom_deg = 9;
}

// fills in HTML for year as years toggle
var updateDay = function(day) {
  document.querySelector(".display-day").innerHTML = `<strong>${day}</strong>`;
};

// fills in HTML for year as years toggle
var updateText = function(dayData) {
  var html_str = "";
  if (dayData){
    html_str = "<div class='protest-day'>"
    dayData.forEach(function(d,idx){
      html_str = html_str+"<div class='protest-name'>"+d.Location+", "+d.Date+"</div><div class='protest-desc'>"+d.Descriptor+"</div><div class='protest-arrests'><span class='bold-class'>Arrests: </span>"+d.Arrests+"</div><div class='protest-damages'><span class='bold-class'>Damages: </span>"+d.Damages+"</div>"
    });
    document.querySelector(".protest-box").innerHTML = html_str+"</div>";
  } else {
    document.querySelector(".protest-box").innerHTML = "";
  }
};


var days = [];
for (var idx=1; idx< 11; idx++) {
  days.push(idx);
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
var mapLayer = L.tileLayer("https://api.mapbox.com/styles/v1/emro/ciyvv7c2n003h2sqvmfffselg/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZW1ybyIsImEiOiJjaXl2dXUzMGQwMDdsMzJuM2s1Nmx1M29yIn0._KtME1k8LIhloMyhMvvCDA",{attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'})
mapLayer.addTo(map);

L.control.zoom({
     position:'topright'
}).addTo(map);

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

// draw bubbles
var drawMap = function(dayData) {

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
    // .style("opacity", function(d) {
    //   return 0.8;
    // })
    .style("fill", function(d) {
      return "#E32B2B";//"#3C87CF";
    })
    .style("stroke","#696969")
    .attr("r", function(d) {
      if (screen.width <= 480) {
        return 7;
      } else {
        return d.Size*3+7;
      }
    })
    // .on('mouseover', function(d) {
    //   var html_str = tooltip_function(d);
    //   tooltip.html(html_str);
    //   tooltip.style("visibility", "visible");
    // })
    // .on("mousemove", function() {
    //   if (screen.width <= 480) {
    //     return tooltip
    //       .style("top", 70+"px")
    //       .style("left",40+"px");
    //       // .style("top",(d3.event.pageY+40)+"px")//(d3.event.pageY+40)+"px")
    //       // .style("left",10+"px");
    //   } else {
    //     return tooltip
    //       .style("top", (d3.event.pageY-220)+"px")
    //       .style("left",(d3.event.pageX-50)+"px");
    //   }
    // })
    // .on("mouseout", function(){
    //     return tooltip.style("visibility", "hidden");
    // });

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

  }

  var i = 0;

  var loop = null;
  var tick = function() {
    var dayData = protestData.filter(function(d) {
      return d.Day == days[i]
    });
    drawMap(dayData);
  	updateDay(days[i]);
    updateText(dayData);
    // updateInfo(protest[i]);
    i = (i + 1) % days.length;
    loop = setTimeout(tick, i == 0 ? 1700 : 1000);
  };

  tick();
