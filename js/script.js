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
const exclude = ["VT", "NH", "MA", "RI", "CT", "NJ", "MD", "DE", "DC"]
const f = d3.format(".2f")
const t = 1000 // 1000 ms

// use US projection
var projection = d3.geoAlbersUsa()
    .translate([(width / 2.5) - 75, (height / 2.5) + 60])
    .scale(1000)

var path = d3.geoPath()
    .projection(projection)

// read in us json data
async function init() {
    // define map and weather data
    mapData = await d3.json('data/us.json')
    weatherData = await d3.json('data/weatherModified.json')
    
    states = topojson.feature(mapData, mapData.objects.default).features
    colorScale = updateColorScale(colorVar)

    setupSelector()
    updateVis()
    updateAxes()
}


function setupSelector() { // set up season buttons and weather data dropdown
   
    d3.select("#Winter") // on button click change the season and update the chart
        .on('click', function(){
            season = "Winter"; d3.select("strong").text("Selected: Winter"); updateVis()});
    d3.select("#Spring")
        .on('click', function(){
            season = "Spring"; d3.select("strong").text("Selected: Spring"); updateVis()});
    d3.select("#Summer")
        .on('click', function(){season = "Summer"; d3.select("strong").text("Selected: Summer"); updateVis()});
    d3.select("#Fall")
        .on('click', function(){season = "Fall"; d3.select("strong").text("Selected: Fall"); updateVis()});

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
        updateAxes();
    })

}

// function to update the map plot
function updateVis() {
    let xPos, yPos // positions for the tooltips
    // add state data to the plot
    svg.selectAll(".states")
       .data(states)
       .join(
            function(enter){
                return enter.append("path")
                .attr("class", "state")
                .style("stroke", (colorVar == "SNOW" && (season == "Summer" || season == "Fall")) ? "#eeecec" : "White")
                .style("fill", "white") // starting color
                .attr("d", path)
                // bring up tool tips
                .on('mouseover', function (event, d) {
                    xPos = event.pageX + 20, yPos = event.pageY - 28
                    d3.select('#tooltip')
                    // styling the tooltip (shape, color)
                    .style("display", 'block') 
                    .html( // Change the html content of the <div> directly
                    `<strong>${d.properties.name}</strong><br/>
                    Stations: ${weatherData[states.indexOf(d)].stations}<br/>
                    ${labelNames[options.indexOf(colorVar)]}: ${f(weatherData[states.indexOf(d)][colorVar][season])}`)
                    .style("left", (xPos) + "px")
                    .style("top", (yPos) + "px")
                    .style("position", "absolute");
            
                    d3.select(this) // Refers to the hovered state update border color/width
                    .style('stroke', 'black')
                    .style('stroke-width', '4px')
                    .style("position", "relative");
                })
                .on("mouseout", function (event, d) { // hide tooltip after mouse over
                    d3.select('#tooltip')
                    .style('display', 'none')

                    d3.select(this) // reset border color/width
                    .style("stroke", (colorVar == "SNOW" && (season == "Summer" || season == "Fall")) ? "#eeecec" : "White")
                    .style('stroke-width', '1px')
                })
                .transition(t) // transition to new color
                .style("fill", (d, i) => colorScale(weatherData[i][colorVar][season])) // filter for correct data types and seasons
            },
            
            function(update) { // todo
                return update
                .transition(t)
                .style("stroke", (colorVar == "SNOW" && (season == "Summer" || season == "Fall")) ? "#eeecec" : "White")
                .style("fill", (d, i) => colorScale(weatherData[i][colorVar][season]))
            },

            function(exit) { // todo
                return exit
                .transition(t)
                .style('opacity', 0)
                .remove()
            }
       )

    // text labels for each state
    svg.selectAll("g.countryLabels text")
    .data(states.filter(d => !exclude.includes(d.properties['postal-code']))) // exclude states whose name is obstructive
    .join("text")
      .attr("fill", "black")
      .attr("transform", d => `translate(${path.centroid(d)})`)
      .attr("dx", "0em")
      .attr("dy", "0em")
      .attr("text-anchor", "middle")
      .style("font", "400 12px/1.5 'Source Sans Pro', 'Noto Sans', sans-serif")
      .text(d => d.properties["postal-code"])
    // bring up tool tips
    .on('mouseover', function (event, d) {
        d3.select('#tooltip')
        .style("display", 'block')
        .html( // Change the html content of the <div> directly
        `<strong>${d.properties.name}</strong><br/>
        Stations: ${weatherData[states.indexOf(d)].stations}<br/>
        ${labelNames[options.indexOf(colorVar)]}: ${f(weatherData[states.indexOf(d)][colorVar][season])}`)
        // update location of the tooltip
        .style("left", (xPos || event.pageX + 20) + "px")
        .style("top", (yPos || event.pageY - 28) + "px")
        .style("position", "absolute");;

        d3.selectAll(".state") // maintain stroke color for the state
        .filter(s => s == d)
        .style('stroke', 'black')
        .style('stroke-width', '4px')
        .style("position", "absolute")
    })
    .on("mouseout", function (event, d) { // hide tooltip after mouse over
        d3.select('#tooltip')
        .style('display', 'none')

        d3.selectAll(".state") // reset border color/width for the state
        .filter(s => s == d)
        .style("stroke", (colorVar == "SNOW" && (season == "Summer" || season == "Fall")) ? "#eeecec" : "White")
        .style('stroke-width', '1px')
    });       
}


function updateAxes() { // adds and updates colorbar
    // remove previous color bar
    svg.selectAll(".colorbar").remove()
    svg.selectAll(".axis").remove()

    const min = colorVar == "TAVG" ? colorScale.domain()[2] : colorScale.domain()[0]
    const mid = d3.mean(colorScale.domain())
    const max = colorVar == "TAVG" ? colorScale.domain()[0] : colorScale.domain()[1]

    const defs = svg.append("defs");

    const gradient = defs.append("linearGradient") // create linear gradient
        .attr("id", "linear-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("class", "colorbar");

    // add color values for min, middle, and max of the color bar
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorScale(min));

    gradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", colorScale(mid))

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScale(max));

    svg.append("rect") // create the bar
        .attr("x", width*0.15)
        .attr("y", height*0.92)
        .attr("width", 400)
        .attr("height", 20)
        .style("fill", "url(#linear-gradient)");

    // create and format axis
    const axisScale = d3.scaleLinear()
        .domain([min, max])
        .range([0, 400]);

    const axisBottom = d3.axisBottom(axisScale);
    
    svg.append("g")
    .attr("transform", `translate(${width*0.15},${height*0.92 + 25})`)
    .attr("class", "axis")
    .call(axisBottom);
}

// returns a new colorScale based on the given data variable
function updateColorScale(data) {

    if (data == "TAVG") { // select color scheme based on what data is being passed  
        return d3.scaleDiverging(d3.interpolateRdYlBu)
                    .domain([80, 50, 20]) // based on highest summer temps, lowest winter temps, and average between sping and fall temps
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

init()