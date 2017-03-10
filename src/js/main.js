require("./lib/social"); //Do not delete
var d3 = require('d3');

// setting parameters for the center of the map and initial zoom level
if (screen.width <= 480) {
  var sf_lat = 37.85;
  var sf_long = -122.43;
  var zoom_deg = 8;
} else {
  var sf_lat = 37.7;
  var sf_long = -122.5;
  var zoom_deg = 10;
}

// fills in HTML for year as years toggle
var updateDay = function(day,date) {
  document.querySelector(".display-day").innerHTML = `<strong>${day}</strong> (${date})`;
};

// tooltip information
function tooltip_function (d) {
  var html_str = "<div class='name'>"+d.Descriptor+"</div>"
  return html_str;
}

// fills in HTML for year as years toggle
var updateText = function(dayData) {
  var html_str = "";
  if (dayData){
    html_str = "<div class='protest-day'>"
    dayData.forEach(function(d,idx){
      html_str = html_str+"<div class='protest-name'>"+d.Location+", "+d.Date+"</div><div class='protest-desc'>"+d.Descriptor+"</div><div class='protest-numbers'><span class='bold-class'>Numbers: </span>"+d.Numbers+"</div><div class='protest-arrests'><span class='bold-class'>Arrests: </span>"+d.Arrests+"</div><div class='protest-damages'><span class='bold-class'>Damages: </span>"+d.Damages+"</div>"
    });
    document.querySelector(".protest-box").innerHTML = html_str+"</div>";
  } else {
    document.querySelector(".protest-box").innerHTML = "";
  }
};

// making a list of all the days of the presidency (for which we have protests)
var days = [], dates = [], prevDay = -1;
protestData.forEach(function(d){
  if (d.Day != prevDay) {
    days.push(d.Day);
    dates.push(d.Date);
    prevDay = d.Day;
  }
});

// show tooltip
var tooltip = d3.select("div.tooltip-map");

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

var svg = d3.select("#map").select("svg"),
g = svg.append("g");

// draw bubbles
var drawMap = function(dayData,current_day) {

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
      if ((d.Day == current_day) || (current_day == 100)) {
        return 0.8;
      } else {
        return 0.3;
      }
    })
    .style("fill", function(d) {
      return "#E32B2B";//"#3C87CF";
    })
    .style("stroke","#696969")
    .attr("r", function(d) {
      if (screen.width <= 480) {
        return 7;
      } else {
        return d.Size*10;
      }
    })
    .on('mouseover', function(d) {
      console.log("mouseover occuring");
      var html_str = tooltip_function(d);
      tooltip.html(html_str);
      tooltip.style("visibility", "visible");
    })
    .on("mousemove", function() {
      if (screen.width <= 480) {
        return tooltip
          .style("top", 70+"px")
          .style("left",40+"px");
          // .style("top",(d3.event.pageY+40)+"px")//(d3.event.pageY+40)+"px")
          // .style("left",10+"px");
      } else {
        return tooltip
          .style("top", (d3.event.pageY+10)+"px")
          .style("left",(d3.event.pageX-100)+"px");
      }
    })
    .on("mouseout", function(){
        return tooltip.style("visibility", "hidden");
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

  }

// initialize to day 1
var i = 0;

// set up looping
var loop = null;
var tick = function() {
  var dayData = protestData.filter(function(d) {
    return d.Day <= days[i]
  });
  drawMap(dayData,days[i]);
	updateDay(days[i],dates[i]);
  // updateText(dayData);
  i = (i + 1) % days.length;
  loop = setTimeout(tick, i == 0 ? 1700 : 1000);
};

// start loop
tick();
var looping = true;

var dropdown = document.querySelector("select");
// if user picks the year, we update the selected mode and stop looping
dropdown.addEventListener("change", function() {
  document.querySelector("#seeall").classList.remove("selected");
  document.querySelector(".start").classList.remove("selected");
  document.querySelector(".pause").classList.add("selected");
  looping = false;
  // document.querySelector(".chart").classList.add("clickable");
  clearTimeout(loop);
  var dayData = protestData.filter(function(d) {
    return d.Day == +dropdown.value;
  });
  drawMap(dayData,+dropdown.value);
  var dateIDX = days.indexOf(+dropdown.value);
  updateDay(dropdown.value,dates[dateIDX]);
  // updateText(dayData);
});

document.querySelector(".start").addEventListener("click", function(e) {
  document.querySelector("#seeall").classList.remove("selected");
  if (looping) { return }
  document.querySelector(".start").classList.add("selected");
  document.querySelector(".pause").classList.remove("selected");
  looping = true;
  // document.querySelector(".chart").classList.remove("clickable");
  dropdown.value = "--";
  tick();
  document.querySelector("#day-box").classList.add("show");
})
document.querySelector(".pause").addEventListener("click", function(e) {
  document.querySelector("#seeall").classList.remove("selected");
  if (!looping) { return }
  document.querySelector(".start").classList.remove("selected");
  document.querySelector(".pause").classList.add("selected");
  looping = false;
  // document.querySelector(".chart").classList.add("clickable");
  clearTimeout(loop);
})
document.querySelector("#seeall").addEventListener("click", function(e) {
  document.querySelector(".start").classList.remove("selected");
  document.querySelector(".pause").classList.add("selected");
  looping = false;
  // document.querySelector(".chart").classList.add("clickable");
  clearTimeout(loop);
  var dayData = protestData.filter(function(d) {
    return d.Day <= 100
  });
  drawMap(dayData,100);
  document.querySelector("#day-box").classList.remove("show");
  document.querySelector("#seeall").classList.add("selected");
})
