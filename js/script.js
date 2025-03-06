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

let colorVar = "WND", season = 'Summer' // defines what type of data you are screening for and the season

// read in us json data
async function chart() {
    var [mapData, weatherData] = await Promise.all([
      d3.json('data/us.json'),
      d3.csv('data/weather.csv', d => ({
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
    ])
    
    weatherData = weatherData.filter(d => (d.state != "GU") && 
                                          (d.state != "PR"))

    updateVis(mapData, weatherData)
}

// use US projection
var projection = d3.geoAlbersUsa()
    .translate([(width / 2.5) - 75, (height / 2.5) +85])
    .scale(1000)

var path = d3.geoPath()
    .projection(projection)


// function to run
function updateVis(mapData, weatherData) {

    var states = topojson.feature(mapData, mapData.objects.default).features
    const colorScale = d3.scaleDiverging(d3.interpolateRdYlBu)
                         .domain([d3.max(weatherData, d => d[colorVar]), d3.median(weatherData, d => d[colorVar]), d3.min(weatherData, d => d[colorVar])])

    console.log(states)
    console.log(weatherData)
    console.log(weatherData.filter(item => item.state == states[0].properties['postal-code']).map(item => item["TAVG"]))

    // add state data to the plot
    svg.selectAll(".states")
       .data(states)
       .enter().append("path")
       .attr("class", "state")
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

chart()