var margin = {top : 0, left : 0, right : 0, bottom : 0};
height = 600 - margin.top - margin.bottom;
width = 1200 - margin.left - margin.right;

// define map parametrs
var svg = d3.select("#vis")
    .append('svg')
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")")

let colorVar = "TAVG", season = 'Winter' // defines what type of data you are screening for and the season
let mapData, weatherData, states
let colorScale
const options = ["TAVG", "SNOW", "PRCP", "WND"]
const labelNames = ["Average Temperature (F)", "Snowfall (in)", "Percipitation (in)", "Wind Speed (mph)"]

// use US projection
var projection = d3.geoAlbersUsa()
    .translate([(width / 2.5) - 75, (height / 2.5) +85])
    .scale(1000)

var path = d3.geoPath()
    .projection(projection)

// read in us json data
async function init() {
    // define map and weather data
    mapData = await d3.json('data/us.json')
    weatherData = await d3.csv('data/weather.csv', d => ({
                state: d.state,
                latitude: +d.latitude,
                longitude: +d.longitude,
                elevation: +d.elevation,
                // seperates the date string into a numerica array with [YYYY, MM, DD]
                date: [+d.date.substring(0, 4), +d.date.substring(4, 6), +d.date.substring(6)],
                TAVG: (+d.TMAX + +d.TMIN) / 2,
                SNOW: +d.SNOW,
                PRCP: +d.PRCP,
                WND: +d.AWND
            }))
    
    states = topojson.feature(mapData, mapData.objects.default).features
    colorScale = updateColorScale(colorVar)

    setupSelector()
    updateVis()
    updateAxes()
}


function setupSelector() { // set up season buttons and weather data dropdown
   
    d3.select("#Winter") // update button click functionality
        .on('click', function(){season = "Winter"; updateVis()});
    d3.select("#Spring")
        .on('click', function(){season = "Spring", updateVis()});
    d3.select("#Summer")
        .on('click', function(){season = "Summer", updateVis()});
    d3.select("#Fall")
        .on('click', function(){season = "Fall", updateVis()});

    // dropdown setup
    d3.selectAll('.variable')
    .each(function() {
        d3.select(this).selectAll('MyOptions')
        .data(labelNames)
        .enter()
        .append('option')
        .text(d => d)
        .attr('value', d => d)
    })

    d3.select('#colorVariable').property('value', labelNames[options.indexOf[colorVar]]) // make sure it matches default

    d3.selectAll('.variable')
    .each(function() {
        // loops each dropdown button
    })  
    .on("change", function(event) {
        
        // update color variable and color scale
        colorVar = options[labelNames.indexOf(d3.select(this).property('value'))]
        colorScale = updateColorScale(colorVar)

        // update chart
        updateVis();
    })

}

// function to update the map plot
function updateVis() {

    // add state data to the plot
    svg.selectAll(".states")
       .data(states)
       .enter().append("path")
       .attr("class", "state")
       .style("stroke", (colorVar == "SNOW" && season == "Summer") ? "Black" : "White")
       .style("fill", d => colorScale(d3.mean(weatherData.filter(item => (item.state == d.properties['postal-code']) && 
                                            (within_season(item.date[1], season))).map(item => item[colorVar]))))
       .attr("d", path)

    // text labels for each state
    svg.selectAll("g.countryLabels text")
    .data(states)
    .join("text")
      .attr("fill", "black")
      .attr("transform", d => `translate(${path.centroid(d)})`)
      .attr("dx", "0em")
      .attr("dy", "0em")
      .attr("text-anchor", "middle")
      .style("font", "400 12px/1.5 'Source Sans Pro', 'Noto Sans', sans-serif")
      .text(d => d.properties["postal-code"]);
}

// check if the given month is within the correct season
function within_season(month, season) {
   if ((((month >= 1) && (month <= 2)) || (month == 12)) && (season == "Winter")) { // check if winter
      return true
   } else if ((month >= 3) && (month <= 5) && (season == "Spring")) { // check if spring
      return true
   } else if ((month >= 6) && (month <= 8) && (season == "Summer")) { // check if summer
    return true
   } else if ((month >= 9) && (month <= 11) && (season == "Fall")) { // check if fall
    return true

   } 
}

function updateAxes() {

}

// returns a new colorScale based on the given data variable
function updateColorScale(data) {

    if (data == "TAVG") { // select color scheme based on what data is being passed  
        return d3.scaleDiverging(d3.interpolateRdYlBu)
                    .domain([80, 55, 20]) // based on highest summer temps, lowest winter temps, and average between sping and fall temps
                    .clamp(true)

    } else if (data == "PRCP") {
        return d3.scaleSequential(d3.interpolateBlues)
                     .domain([0, 0.2]) // accounts for about 94% of state mean percipitation values
                     .clamp(true)

    } else if (data == "WND") {
        return d3.scaleSequential(d3.interpolateGreens)
                     .domain([0, 10]) // accounts for about 98% of state mean wind speed values
                     .clamp(true)
    
    } else if (data == "SNOW") {
        return d3.scaleSequential(d3.interpolateBlues)
                     .domain([0, 0.1])
                     .clamp(true)
    }

}

init()