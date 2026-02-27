/* 
   GLOBAL VARIABLES
*/
var map;
var geojsonData;
var timestamps = [];   // stores unique DAYS
var currentIndex = 0;
var geojsonLayer;


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
   STYLE MARKERS
*/

function pointToLayer(feature, latlng){

    var magnitude = feature.properties.mag;

    return L.circleMarker(latlng, {
        radius: magnitude * 3,
        fillColor: "#ff6a00",
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
   LOAD DATA + GROUP BY DAY
 */

function getData(){

    fetch("data/earthquakes.geojson")

        .then(function(response){
            return response.json();
        })

        .then(function(json){

            geojsonData = json;

            // Extract unique DAYS
            json.features.forEach(function(feature){

                var day = new Date(feature.properties.time)
                          .toISOString()
                          .split("T")[0];  // YYYY-MM-DD

                feature.properties.day = day;

                if (!timestamps.includes(day)){
                    timestamps.push(day);
                }

            });

            timestamps.sort();

            createSequenceControls();
            updateMap();

        })

        .catch(function(error){
            console.log("Error loading GeoJSON:", error);
        });
}


/* 
   UPDATE MAP BASED ON SLIDER
*/

function updateMap(){

    if (geojsonLayer){
        map.removeLayer(geojsonLayer);
    }

    var currentDay = timestamps[currentIndex];

    geojsonLayer = L.geoJson(geojsonData, {

        filter: function(feature){
            return feature.properties.day === currentDay;
        },

        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature

    }).addTo(map);
}


/* 
   SEQUENCE CONTROLS
 */

function createSequenceControls(){

    var SequenceControl = L.Control.extend({

        options: { position: 'bottomleft' },

        onAdd: function(){

            var container = L.DomUtil.create('div', 'sequence-control-container');

            container.innerHTML =
                '<button id="reverse">◀</button>' +
                '<input id="range-slider" type="range">' +
                '<button id="forward">▶</button>' +
                '<div id="date-label" style="color:white; margin-top:5px;"></div>';

            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new SequenceControl());

    // Configure slider
    document.getElementById('range-slider').max = timestamps.length - 1;
    document.getElementById('range-slider').min = 0;
    document.getElementById('range-slider').step = 1;
    document.getElementById('range-slider').value = 0;

    document.getElementById('date-label').innerHTML = timestamps[0];

    // Slider event
    document.getElementById('range-slider').addEventListener('input', function(){
        currentIndex = this.value;
        document.getElementById('date-label').innerHTML = timestamps[currentIndex];
        updateMap();
    });

    // Forward button
    document.getElementById('forward').addEventListener('click', function(){
        currentIndex++;
        if (currentIndex >= timestamps.length){
            currentIndex = 0;
        }
        document.getElementById('range-slider').value = currentIndex;
        document.getElementById('date-label').innerHTML = timestamps[currentIndex];
        updateMap();
    });

    // Reverse button
    document.getElementById('reverse').addEventListener('click', function(){
        currentIndex--;
        if (currentIndex < 0){
            currentIndex = timestamps.length - 1;
        }
        document.getElementById('range-slider').value = currentIndex;
        document.getElementById('date-label').innerHTML = timestamps[currentIndex];
        updateMap();
    });
}


/* 
   RUN MAP
 */

document.addEventListener('DOMContentLoaded', createMap);