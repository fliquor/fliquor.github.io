var margin = {top : 0, left : 0, right : 0, bottom : 0};
height = 400 - margin.top - margin.bottom;
width = 800 - margin.left - margin.right;

// define map parametrs
var svg = d3.select("#vis")
    .append('svg')
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")")

// read in us json data

async function chart() {
    const [data] = await Promise.all([
      d3.json('data/us.json')
    ])
    ready(data)
}

// use US projection
var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale(850)

var path = d3.geoPath()
    .projection(projection)


// function to run
function ready(data) {

    console.log(data)

    var states = topojson.feature(data, data.objects.default).features
    console.log(states[0].properties["postal-code"])

    // add state data to the plot
    svg.selectAll(".states")
       .data(states)
       .enter().append("path")
       .attr("class", "state")
       .style("fill", "blue")
       .attr("d", path)

    // text labels for each state
    svg.selectAll("g.countryLabels text")
    .data(states)
    .join("text")
      .attr("fill", d => d.properties['region'] == 'Northeast' ? "black" : "white")
      .attr("transform", d => `translate(${path.centroid(d)})`)
      .attr("dx", d => d.properties['region'] == 'Northeast' ? 75 : 0)
      .attr("dy", "0em")
      .attr("text-anchor", "middle")
      .style("font", "400 12px/1.5 'Source Sans Pro', 'Noto Sans', sans-serif")
      .text(d => d.properties["postal-code"]);
}

chart()