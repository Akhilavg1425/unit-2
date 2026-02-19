/* Example from Leaflet Quick Start Guide */

/* L.map() creates a new Leaflet map inside the div with id="map" */
var map = L.map('map')

    /* setView() sets the initial center coordinates and zoom level */
    .setView([51.505, -0.09], 13);


/* L.tileLayer() adds a basemap tileset to the map */
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {

    /* maxZoom sets the maximum zoom level allowed */
    maxZoom: 19,

    /* attribution adds required copyright text */
    attribution: '&copy; OpenStreetMap'

/* addTo() adds this layer to the map */
}).addTo(map);


/* L.marker() creates a marker at given coordinates */
var marker = L.marker([51.5, -0.09]).addTo(map);

/* L.circle() creates a circle with style options */
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

/* L.polygon() creates a polygon from coordinate array */
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);


/* bindPopup() attaches popup text to a layer */
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");


/* L.popup() creates standalone popup */
var popup = L.popup();

/* onMapClick() runs when map is clicked */
function onMapClick(e) {

    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

/* map.on() attaches click event to map */
map.on('click', onMapClick);
