/* GLOBAL VARIABLES */

var map;
var geojsonData;
var timestamps=[];
var currentIndex=0;
var geojsonLayer;


/* CREATE MAP */

function createMap(){

map = L.map('map',{
center:[20,0],
zoom:2
});


/* BASEMAPS */

var dark = L.tileLayer(
'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
{
attribution:'© OpenStreetMap © CARTO',
subdomains:'abcd',
maxZoom:19
});

var light = L.tileLayer(
'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
{
attribution:'© OpenStreetMap © CARTO',
subdomains:'abcd',
maxZoom:19
});

var satellite = L.tileLayer(
'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
{
attribution:'Tiles © Esri'
});

dark.addTo(map);

L.control.layers({
"Dark":dark,
"Light":light,
"Satellite":satellite
}).addTo(map);

createLegend();
getData();

}


/* COLOR BY MAGNITUDE */

function getColor(mag){

return mag > 5 ? "#ff0000":
mag > 4 ? "#ff6600":
mag > 3 ? "#ffcc00":
mag > 2 ? "#66ff66":
"#00ffff";

}


/* SYMBOL STYLE */

function pointToLayer(feature,latlng){

var mag = feature.properties.mag;

return L.circleMarker(latlng,{
radius:mag*3,
fillColor:getColor(mag),
color:"#ffffff",
weight:1,
opacity:1,
fillOpacity:0.8
});

}


/* POPUPS + HOVER */

function onEachFeature(feature,layer){

if(feature.properties){

var popupContent=
"<b>Magnitude:</b> "+feature.properties.mag+"<br>"+
"<b>Location:</b> "+feature.properties.place+"<br>"+
"<b>Time:</b> "+new Date(feature.properties.time);

layer.bindPopup(popupContent);

layer.on({

mouseover:function(e){
e.target.setStyle({
radius:feature.properties.mag*4,
fillColor:"#ffff00"
});
},

mouseout:function(e){
geojsonLayer.resetStyle(e.target);
}

});

}

}


/* LOAD DATA */

function getData(){

fetch("data/earthquakes.geojson")

.then(function(response){
return response.json();
})

.then(function(json){

geojsonData=json;

json.features.forEach(function(feature){

var day = new Date(feature.properties.time)
.toISOString()
.split("T")[0];

feature.properties.day=day;

if(!timestamps.includes(day)){
timestamps.push(day);
}

});

timestamps.sort();

createSequenceControls();
updateMap();

});

}


/* UPDATE MAP */

function updateMap(){

if(geojsonLayer){
map.removeLayer(geojsonLayer);
}

var currentDay = timestamps[currentIndex];

geojsonLayer=L.geoJson(geojsonData,{

filter:function(feature){
return feature.properties.day===currentDay;
},

pointToLayer:pointToLayer,
onEachFeature:onEachFeature

}).addTo(map);

}


/* SLIDER */

function createSequenceControls(){

var SequenceControl=L.Control.extend({

options:{position:'bottomleft'},

onAdd:function(){

var container=L.DomUtil.create('div','sequence-control-container');

container.innerHTML=
'<button id="reverse">◀</button>'+
'<input id="range-slider" type="range">'+
'<button id="forward">▶</button>'+
'<div id="date-label"></div>';

L.DomEvent.disableClickPropagation(container);

return container;

}

});

map.addControl(new SequenceControl());

document.getElementById('range-slider').max=timestamps.length-1;
document.getElementById('range-slider').min=0;
document.getElementById('range-slider').step=1;
document.getElementById('range-slider').value=0;

document.getElementById('date-label').innerHTML=timestamps[0];

document.getElementById('range-slider').addEventListener('input',function(){

currentIndex=this.value;
document.getElementById('date-label').innerHTML=timestamps[currentIndex];
updateMap();

});

document.getElementById('forward').addEventListener('click',function(){

currentIndex++;

if(currentIndex>=timestamps.length){
currentIndex=0;
}

document.getElementById('range-slider').value=currentIndex;
document.getElementById('date-label').innerHTML=timestamps[currentIndex];

updateMap();

});

document.getElementById('reverse').addEventListener('click',function(){

currentIndex--;

if(currentIndex<0){
currentIndex=timestamps.length-1;
}

document.getElementById('range-slider').value=currentIndex;
document.getElementById('date-label').innerHTML=timestamps[currentIndex];

updateMap();

});

}


/* PROPORTIONAL SYMBOL LEGEND */

function createLegend(){

var legend = L.control({position: "bottomright"});

legend.onAdd = function(){

var div = L.DomUtil.create("div", "legend");

div.innerHTML += "<h4>Magnitude</h4>";

var magnitudes = [2,3,4,5];

for (var i = 0; i < magnitudes.length; i++) {

var mag = magnitudes[i];
var size = mag * 3;
var color = getColor(mag);

div.innerHTML +=
'<div class="legend-item">' +
'<svg height="40" width="40">' +

/* outer white circle */
'<circle cx="20" cy="20" r="'+(size/2 + 2)+'" fill="white" opacity="1"/>' +

/* inner colored circle */
'<circle cx="20" cy="20" r="'+size/2+'" fill="'+color+'" stroke="white" stroke-width="1" opacity="0.8"/>' +

'</svg> M ' + mag +
'</div>';

}

return div;

};

legend.addTo(map);

}


/* RUN MAP */

document.addEventListener('DOMContentLoaded',createMap);