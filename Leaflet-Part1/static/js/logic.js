// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-01-01&endtime=2021-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  console.log(data.features);
  createFeatures(data.features);
});



function markerSize(circle) {
  return circle * 30000;
}

function chooseColor(mag) {
  if (mag > 5) { return "darkred" }
  else if (mag > 4) { return "red" }
  else if (mag > 3) { return "orange" }
  else if (mag > 2) { return "yellow" }
  else if (mag > 1) { return "limegreen" }
  else { return "green" }
}

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function cats(feature, layer) {
    layer.bindPopup(`${feature.properties.mag}<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
  }
  function dogs(feature, latlng) {
    let options = {
      radius: markerSize(feature.properties.mag),
      fillColor: chooseColor(feature.properties.mag),
      weight: 1,
      opacity: 1,
      fillOpacity: 0.6
    };
    return L.circle(latlng, options);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: cats,
    pointToLayer: dogs

  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let mag = [ 1, 2, 3, 4, 5];
    let colors = ["green", "limegreen", "yellow", "red", "darkred"];

    for (let i = 0; i < mag.length; i++) {
      div.innerHTML += "<i style='background: "
        + colors[i]
        + "'></i> "
        + mag[i]
        + (mag[i + 1] ? "&ndash;" + mag[i + 1] + "<br>" : "+");
    }
    return div;
  };

  legend.addTo(myMap);

}

