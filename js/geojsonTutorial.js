/* GeoJSON tutorial example */

var map = L.map('map').setView([39.74739, -105], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);


/* Example GeoJSON feature */
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};


/* L.geoJSON() converts GeoJSON into Leaflet layer */
L.geoJSON(geojsonFeature, {

    /* onEachFeature runs once for every feature */
    onEachFeature: function (feature, layer) {

        if (feature.properties && feature.properties.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
        }
    }

}).addTo(map);
