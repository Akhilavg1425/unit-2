/* 
   GLOBAL MAP VARIABLE
 */
var map;


/* 
   CREATE MAP
 */
function createMap(){

    map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    /* Dark basemap */
    L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }
    ).addTo(map);

    getData();
}


/* 
   STYLE MARKERS BASED ON MAGNITUDE
 */
function pointToLayer(feature, latlng){

    var magnitude = feature.properties.mag;

    return L.circleMarker(latlng, {
        radius: magnitude * 3,   // size changes with magnitude
        fillColor: "#ff6600",
        color: "#ffffff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    });
}


/* 
   POPUPS
 */
function onEachFeature(feature, layer){

    if (feature.properties){

        var popupContent =
            "<strong>Magnitude:</strong> " + feature.properties.mag + "<br>" +
            "<strong>Location:</strong> " + feature.properties.place + "<br>" +
            "<strong>Time:</strong> " + new Date(feature.properties.time);

        layer.bindPopup(popupContent);
    }
}


/* 
   LOAD GEOJSON DATA
 */
function getData(){

    fetch("data/earthquakes.geojson")   // IMPORTANT: relative path

        .then(function(response){
            return response.json();
        })

        .then(function(json){

            L.geoJson(json, {
                pointToLayer: pointToLayer,
                onEachFeature: onEachFeature
            }).addTo(map);

        })

        .catch(function(error){
            console.log("Error loading GeoJSON:", error);
        });
}


/* 
   RUN MAP AFTER PAGE LOAD
 */
document.addEventListener('DOMContentLoaded', createMap);
