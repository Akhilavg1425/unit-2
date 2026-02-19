/* Adapted tutorial using external GeoJSON */

/* Declare map globally */
var map;

/* createMap initializes the Leaflet map */
function createMap(){

    map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    getData();
}


/* onEachFeature creates popup with all properties */
function onEachFeature(feature, layer){

    var popupContent = "";

    if (feature.properties){

        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " +
            feature.properties[property] + "</p>";
        }

        layer.bindPopup(popupContent);
    }
}


/* getData loads external GeoJSON using fetch */
function getData(){

    fetch("data/earthquakes.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){

            L.geoJson(json, {
                onEachFeature: onEachFeature
            }).addTo(map);
        });
}

/* Run createMap after page loads */
document.addEventListener('DOMContentLoaded', createMap);
