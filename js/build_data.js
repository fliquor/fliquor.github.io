console.log('D3 Version:', d3?.version || 'D3 not loaded')
let newJson = []
async function chart(){
    const mapData2 = await d3.json('data/us.json')

    const weatherData2 = await d3.csv('data/weather.csv', d => ({
        station: d.station,
        state: d.state,
        // Gets the month the observations were made
        month: +d.date.substring(4, 6),
        TAVG: (+d.TMAX + +d.TMIN) / 2,
        SNOW: +d.SNOW,
        PRCP: +d.PRCP,
        WND: +d.AWND
    }))

    const states2 = topojson.feature(mapData2, mapData2.objects.default).features.map(item => item.properties["postal-code"])
    console.log(states2)
    // each row in the json should look like {State:, Stations:, TAVG:{Winter:, Spring:, Summer:, Fall:}, 
    //                                                           SNOW:{Winter:, Spring:, Summer:, Fall:},
    //                                                           PRCP:{Winter:, Spring:, Summer:, Fall:},   
    //                                                            WND:{Winter:, Spring:, Summer:, Fall:}}
    for (let i = 0; i < states2.length; i++) {
        var row = {state: states2[i], // state abreviation
                   stations: [... new Set(weatherData2.filter(item => // number of unique weather stations in that state
                             (item.state == states2[i])).map(item => item.station))].length,

                    TAVG: {Winter: d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                    (within_season(item.month, "Winter"))).map(item => item.TAVG)),
                           Spring: d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                    (within_season(item.month, "Spring"))).map(item => item.TAVG)),
                           Summer: d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                    (within_season(item.month, "Summer"))).map(item => item.TAVG)),
                           Fall:   d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                    (within_season(item.month, "Fall"))).map(item => item.TAVG))},

                    SNOW: {Winter: d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                        (within_season(item.month, "Winter"))).map(item => item.SNOW)),
                            Spring: d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                        (within_season(item.month, "Spring"))).map(item => item.SNOW)),
                            Summer: d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                        (within_season(item.month, "Summer"))).map(item => item.SNOW)),
                            Fall:   d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                        (within_season(item.month, "Fall"))).map(item => item.SNOW))},

                    PRCP: {Winter: d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                        (within_season(item.month, "Winter"))).map(item => item.PRCP)),
                            Spring: d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                        (within_season(item.month, "Spring"))).map(item => item.PRCP)),
                            Summer: d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                        (within_season(item.month, "Summer"))).map(item => item.PRCP)),
                            Fall:   d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                        (within_season(item.month, "Fall"))).map(item => item.PRCP))},

                     WND: {Winter: d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                        (within_season(item.month, "Winter"))).map(item => item.WND)),
                            Spring: d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                        (within_season(item.month, "Spring"))).map(item => item.WND)),
                            Summer: d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                        (within_season(item.month, "Summer"))).map(item => item.WND)),
                            Fall:   d3.mean(weatherData2.filter(item => (item.state == states2[i]) && 
                                        (within_season(item.month, "Fall"))).map(item => item.WND))}
                  }
        newJson.push(row) // add row to json array
    }

    var a = document.createElement("a");
    var blob = new Blob([JSON.stringify(newJson)], {type: "text/plain;charset=utf-8"});  
     a.href = URL.createObjectURL(blob);
     a.download = "weatherModified.json";
     a.click();
}

//chart()