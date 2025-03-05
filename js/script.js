var width = 1200, height = 600;
var instructions = "";

// Display: geographic projection
var proj = d3.geo.albersUsa().scale(1200)
    .translate([width / 2, height / 2]);
var path = d3.geo.path().projection(proj);

// Interaction: stored state
var selectedZip = "";

// Display: AJAX load the data files, then call render()
queue()
    .defer(d3.json, "us-states.geojson")
    .defer(d3.tsv, "zips.tsv")
    .await(render);

// Display: create the SVG, draw the map
function render(error, states, zips) {
    // Display: the main SVG container
    var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Interaction: text box displaying the selection
    svg.append("text").attr("id", "selected")
        .text(instructions)
        .attr("x", 20).attr("y", 50);

    // Display: state outlines
    svg.append("g").attr("id", "states");
    d3.select("#states").selectAll("path")
        .data(states.features)
      .enter().append("path")
        .attr("d", path);

    var start = Date.now();

    console.log("Draw dots: " + (Date.now() - start) + "ms");

};
