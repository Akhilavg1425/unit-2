/* GLOBAL */
let map, geojsonData, timestamps = [];
let currentIndex = 0;
let geojsonLayer;
let minMag = 1;
let chart;
let interval;

/* MAP  */
map = L.map('map').setView([20, 0], 2);

/* BASEMAPS */
let dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
let light = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png');
let terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png');
let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
let voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png');

dark.addTo(map);

L.control.layers({
    "Dark": dark,
    "Light": light,
    "Terrain": terrain,
    "OSM": osm,
    "Voyager": voyager
}).addTo(map);

/*  DEPTH COLOR  */
function getDepthColor(d) {
    return d > 300 ? "#7f0000" :
        d > 200 ? "#b30000" :
        d > 100 ? "#d7301f" :
        d > 50 ? "#fc8d59" :
        "#fdcc8a";
}

/* LOAD DATA  */
fetch("https://raw.githubusercontent.com/Akhilavg1425/unit-2/main/earthquakes.geojson")
    .then(res => res.json())
    .then(data => {

        geojsonData = data;

        data.features.forEach(f => {
            let day = new Date(f.properties.time).toISOString().split("T")[0];
            f.properties.day = day;

            if (!timestamps.includes(day)) timestamps.push(day);
        });

        timestamps.sort();

        createSequenceControls();   // ✅ FIXED
        createChart();
        updateMap();
    });

/* UPDATE MAP  */
function updateMap() {

    if (geojsonLayer) map.removeLayer(geojsonLayer);

    let currentDay = timestamps[currentIndex];

    geojsonLayer = L.geoJson(geojsonData, {

        filter: f =>
            f.properties.day <= currentDay &&
            f.properties.mag >= minMag,

        pointToLayer: (f, latlng) => {

            let depth = f.geometry.coordinates[2];
            let mag = f.properties.mag;

            let marker = L.circleMarker(latlng, {
                radius: Math.min(10, Math.max(2, mag * 2)),
                fillColor: getDepthColor(depth),
                color: "#fff",
                weight: 0.5,
                fillOpacity: 0.7
            });

            return marker;
        },

        onEachFeature: (f, layer) => {
            layer.bindPopup(`
                <b>Magnitude:</b> ${f.properties.mag}<br>
                <b>Depth:</b> ${f.geometry.coordinates[2]} km<br>
                <b>Location:</b> ${f.properties.place}
            `);
        }

    }).addTo(map);

    updateStats();
    updateLiveStats();
}

/*  SEQUENCE CONTROL  */
function createSequenceControls() {

    let control = L.control({ position: 'bottomleft' });

    control.onAdd = function () {

        let div = L.DomUtil.create('div', 'sequence-control-container');

        div.innerHTML = `
            <button id="reverse">◀</button>
            <input id="range-slider" type="range">
            <button id="forward">▶</button>
            <div id="date-label"></div>
        `;

        L.DomEvent.disableClickPropagation(div);
        return div;
    };

    control.addTo(map);

    let slider = document.getElementById("range-slider");

    slider.max = timestamps.length - 1;
    slider.value = 0;

    document.getElementById("date-label").innerHTML = timestamps[0];

    slider.oninput = function () {
        currentIndex = +this.value;
        document.getElementById("date-label").innerHTML = timestamps[currentIndex];
        updateMap();
    };

    document.getElementById("forward").onclick = function () {
        currentIndex = (currentIndex + 1) % timestamps.length;
        slider.value = currentIndex;
        updateMap();
    };

    document.getElementById("reverse").onclick = function () {
        currentIndex = (currentIndex - 1 + timestamps.length) % timestamps.length;
        slider.value = currentIndex;
        updateMap();
    };
}

/* STATS  */
function updateStats() {

    let count = geojsonData.features.filter(f =>
        f.properties.day <= timestamps[currentIndex] &&
        f.properties.mag >= minMag
    ).length;

    document.getElementById("stats").innerHTML =
        "<b>Total Earthquakes:</b> " + count;
}

/* LIVE STATS  */
function updateLiveStats() {

    let visible = geojsonData.features.filter(f =>
        f.properties.day <= timestamps[currentIndex] &&
        f.properties.mag >= minMag
    );

    let maxMag = visible.length ? Math.max(...visible.map(f => f.properties.mag)) : 0;

    document.getElementById("liveStats").innerHTML = `
        <b>Visible:</b> ${visible.length}<br>
        <b>Max Magnitude:</b> ${maxMag.toFixed(2)}<br>
        <b>Date:</b> ${timestamps[currentIndex]}
    `;
}

/*  CHART  */
function createChart() {

    let counts = timestamps.map(day =>
        geojsonData.features.filter(f => f.properties.day === day).length
    );

    chart = new Chart(document.getElementById("chart"), {
        type: "line",
        data: {
            labels: timestamps,
            datasets: [{
                label: "Earthquakes per Day",
                data: counts,
                borderWidth: 2
            }]
        },
        options: {
            scales: { x: { display: false } }
        }
    });
}

/*  FILTER  */
document.getElementById("magFilter").oninput = function () {
    minMag = +this.value;
    document.getElementById("magValue").innerHTML = minMag;
    updateMap();
};

/*PLAY  */
document.getElementById("play").onclick = function () {

    if (interval) {
        clearInterval(interval);
        interval = null;
        this.innerHTML = "▶ Play";
        return;
    }

    this.innerHTML = "⏸ Pause";

    interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % timestamps.length;
        document.getElementById("range-slider").value = currentIndex;
        updateMap();
    }, 700);
};

/*  PLATES  */
fetch("plates.geojson")
    .then(res => res.json())
    .then(data => {
        L.geoJson(data, {
            style: { color: "#00ffff", weight: 1 }
        }).addTo(map);
    });

/* LEGEND  */
let legend = L.control({ position: "bottomright" });

legend.onAdd = function () {

    let div = L.DomUtil.create("div", "legend");

    div.innerHTML = "<b>Depth (km)</b><br>";

    [50, 100, 200, 300].forEach(d => {
        div.innerHTML += `<div><span style="background:${getDepthColor(d)}"></span>${d}+</div>`;
    });

    return div;
};

legend.addTo(map);
