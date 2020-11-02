let GLOBAL_DATA = {}
let TOTAL_ENTRIES = -1;
let MAX_VOTES = 538;
let WinChanceDict;

Chart.defaults.global.defaultFontSize = 20;
Chart.defaults.global.defaultFontFamily = "Fira Code";
Chart.defaults.global.elements.point.radius = 4;
Chart.defaults.global.animation.duration = 1

let STATEABBR = {
    "alabama": "AL",
    "alaska": "AK",
    "american samoa": "AS",
    "arizona": "AZ",
    "arkansas": "AR",
    "california": "CA",
    "colorado": "CO",
    "connecticut": "CT",
    "delaware": "DE",
    "district of columbia": "DC",
    "southeast": "SE",
    "federated states of micronesia": "FM",
    "florida": "FL",
    "georgia": "GA",
    "great plains": "GP",
    "guam": "GU",
    "hawaii": "HI",
    "idaho": "ID",
    "illinois": "IL",
    "indiana": "IN",
    "iowa": "IA",
    "kansas": "KS",
    "kentucky": "KY",
    "louisiana": "LA",
    "maine": "ME",
    "maine-2": "ME-2",
    "marshall islands": "MH",
    "maryland": "MD",
    "massachusetts": "MA",
    "michigan": "MI",
    "north+Northeast": "NO",
    "minnesota": "MN",
    "mississippi": "MS",
    "missouri": "MO",
    "montana": "MT",
    "nebraska": "NE",
    "nebraska-1": "NE-1",
    "nebraska-2": "NE-2",
    "nevada": "NV",
    "new hampshire": "NH",
    "new jersey": "NJ",
    "new mexico": "NM",
    "new york": "NY",
    "north carolina": "NC",
    "north dakota": "ND",
    "northern mariana islands": "MP",
    "ohio": "OH",
    "oklahoma": "OK",
    "oregon": "OR",
    "palau": "PW",
    "pennsylvania": "PA",
    "puerto rico": "PR",
    "rhode island": "RI",
    "south carolina": "SC",
    "south dakota": "SD",
    "tennessee": "TN",
    "texas": "TX",
    "utah": "UT",
    "vermont": "VT",
    "virgin islands": "VI",
    "virginia": "VA",
    "washington": "WA",
    "southwest": "SW",
    "west virginia": "WV",
    "wisconsin": "WI",
    "wyoming": "WY"
}

let STATEUNABBR = {}
Object.keys(STATEABBR).forEach(key => {
    STATEUNABBR[STATEABBR[key]] = key
})

function DocReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}


function GetNthEntry(obj, n) {
    return obj[Object.keys(obj)[n]];
}


function parseData(rt) {
    // read data into global parser
    GLOBAL_DATA = JSON.parse(rt);
    US_SVG = GLOBAL_DATA[2];
    // console.log(US_SVG)
    STATE_SVGS = GLOBAL_DATA[1];
    GLOBAL_DATA = GLOBAL_DATA[0];
    TOTAL_ENTRIES = Object.keys(GLOBAL_DATA["dem_win_chance"]).length;


    // Load specific data entries into useful lets
    DEM_WIN_CHANCE = GetNthEntry(GLOBAL_DATA["dem_win_chance"], TOTAL_ENTRIES - 1)["dem"]
    DEM_ELECTORAL_VOTES = GetNthEntry(GLOBAL_DATA["percentile_ev"], TOTAL_ENTRIES - 1)["median"]
    DEM_POPULAR_VOTE = GetNthEntry(GLOBAL_DATA["percentile_state_margins"], TOTAL_ENTRIES - 1)["national"][1]
    STATE_MARGINS = GLOBAL_DATA["percentile_state_margins"]
    SIMULATIONS_BY_EV = GLOBAL_DATA["simulations_by_ev"]
    STATE_CHANCES = GLOBAL_DATA["state_chances"]
    SIMULATION_DATE = Object.keys(GLOBAL_DATA["dem_win_chance"])[TOTAL_ENTRIES - 1]
    SIMULATION_DATE = SIMULATION_DATE.slice(0, 10) + " " + String(Number(SIMULATION_DATE.slice(-2))) + ":00 UTC"
    TIPPING_POINT_DATA = GetNthEntry(GLOBAL_DATA["tipping_point_data"], TOTAL_ENTRIES - 1)
    TIPPING_POINT_STATE_DATA = GetNthEntry(GLOBAL_DATA["tipping_point_state_data"], TOTAL_ENTRIES-1)
    
    if (document.title == "Predictions | hte_election_model") {
        openPage();
    }
    else if (document.title == "States | hte_election_model") {
        openStatesPage();
    }
}

function loadWinChance() {
    newDemDataset = {
        label: "Biden",
        data: [],
        fill: false,
        borderColor: getCssletiable("--dem-bg"),
        borderWidth: 5,
        backgroundColor: getCssletiable("--dem-bg"),
    }

    newRepDataset ={
        label: "Trump",
        data: [],
        fill: false,
        borderColor: getCssletiable("--rep-bg"),
        borderWidth: 5,
        backgroundColor: getCssletiable("--rep-bg"),
    }

    Object.values(GLOBAL_DATA["dem_win_chance"]).forEach(key => {
        val = key["dem"]
        newDemDataset.data.push((val*100).toFixed(3))
        newRepDataset.data.push((100-val*100).toFixed(3))
    })

    let gridLineColor = Array(11).fill(getCssletiable("--section-bg"))
    gridLineColor[5] = "rgb(0,0,0)"

    lineConfig.data.datasets.splice(0,2);
    lineConfig.data.datasets.push(newDemDataset, newRepDataset)
    lineConfig.options.scales.yAxes[0].ticks.max = 100;
    lineConfig.options.scales.yAxes[0].ticks.stepSize = 10;
    lineConfig.options.scales.yAxes[0].gridLines.color = gridLineColor;
    lineConfig.options.scales.yAxes[0].ticks.callback = function(value, index, values) {
        return value + '%';
    };
    configuredLineChart.update()
}

function loadEV() {
    newDemDataset = {
        label: "Biden",
        data: [],
        fill: false,
        borderColor: getCssletiable("--dem-bg"),
        borderWidth: 5,
        backgroundColor: getCssletiable("--dem-bg"),
    }

    newRepDataset = {
        label: "Trump",
        data: [],
        fill: false,
        borderColor: getCssletiable("--rep-bg"),
        borderWidth: 5,
        backgroundColor: getCssletiable("--rep-bg"),
    }

    Object.values(GLOBAL_DATA["percentile_ev"]).forEach(key => {
        val = key["median"]
        newDemDataset.data.push((val))
        newRepDataset.data.push((538-val))
    })

    lineConfig.data.datasets.splice(0,2)
    lineConfig.data.datasets.push(newDemDataset, newRepDataset)

    let gridLineColor = Array(11).fill(getCssletiable("--section-bg"))
    gridLineColor[9] = "rgb(0,0,0)"

    lineConfig.options.scales.yAxes[0].ticks.max = 538;
    lineConfig.options.scales.yAxes[0].ticks.stepSize = 30;
    lineConfig.options.scales.yAxes[0].gridLines.color = gridLineColor;
    lineConfig.options.scales.yAxes[0].ticks.callback = function(value, index, values) {
        return value;
    };
    configuredLineChart.update()
}

function loadPV() {
    newDemDataset = {
        label: "Biden",
        data: [],
        fill: false,
        borderColor: getCssletiable("--dem-bg"),
        borderWidth: 5,
        backgroundColor: getCssletiable("--dem-bg"),
    }

    newRepDataset = {
        label: "Trump",
        data: [],
        fill: false,
        borderColor: getCssletiable("--rep-bg"),
        borderWidth: 5,
        backgroundColor: getCssletiable("--rep-bg"),
    }

    Object.values(GLOBAL_DATA["percentile_state_margins"]).forEach(key => {
        val = key["national"][1]
        newDemDataset.data.push((50+(val/2)).toFixed(3))
        newRepDataset.data.push((50-(val/2)).toFixed(3))
    })


    let gridLineColor = Array(11).fill(getCssletiable("--section-bg"))
    gridLineColor[5] = "rgb(0,0,0)"

    lineConfig.data.datasets.splice(0,2)
    lineConfig.data.datasets.push(newDemDataset, newRepDataset)
    lineConfig.options.scales.yAxes[0].ticks.max = 100;
    lineConfig.options.scales.yAxes[0].ticks.stepSize = 10;
    lineConfig.options.scales.yAxes[0].gridLines.color = gridLineColor;
    lineConfig.options.scales.yAxes[0].ticks.callback = function(value, index, values) {
        return value + '%';
    };
    
    configuredLineChart.update()
}

let configuredLineChart;
let lineConfig;
function loadLineChart(){
    let chart = document.getElementById('win_chance_chart');

    WinChanceDict = {};
    Object.keys(GLOBAL_DATA["dem_win_chance"]).forEach(key => {
        let value = GLOBAL_DATA["dem_win_chance"][key]["dem"]
        WinChanceDict[key] = value;
    })

    let labels = []
    let demWinChance = []
    let repWinChance = []
    
    Object.keys(WinChanceDict).forEach(key => {
        newKey = key.slice(5, 7) + '/' + key.slice(8, 10) + ' ' + key.slice(-2) + 'H'
        labels.push(newKey)
        val = WinChanceDict[key]
        demWinChance.push((val*100).toFixed(3))
        repWinChance.push((100-val*100).toFixed(3))
    })

    let gridLineColor = Array(11).fill(getCssletiable("--section-bg"))
    gridLineColor[5] = getCssletiable("--card-bg");

    lineConfig = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "Biden",
                data: demWinChance,
                fill: false,
                borderColor: getCssletiable("--dem-bg"),
                borderWidth: 5,
                backgroundColor: getCssletiable("--dem-bg")
            },
            {
                label: "Trump",
                data: repWinChance,
                fill: false,
                borderColor: getCssletiable("--rep-bg"),
                borderWidth: 5,
                backgroundColor: getCssletiable("--rep-bg")
            }]
        },
        options: {
            // padding: "50",
            responsive: true,
            tooltips: {
                intersect: false,
            },
            legend: {
                fontColor: getCssletiable("--card-bg"),
                // display: false,
            },
            layout: {
                padding: {
                    left: 75,
                    right: 75,
                    // top: 30,
                    bottom: 10,
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        min: -0.0,
                        max: 100,
                        fontColor: getCssletiable("--card-bg"),
                        stepSize: 10,
                        callback: function(value, index, values) {
                            return value + '%';
                        }
                    },
                    gridLines: {
                        color: gridLineColor,
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: getCssletiable("--card-bg"),
                        minRotation: 45,
                    },
                    gridLines: {
                        color: getCssletiable("--section-bg"),
                    }
                }]
            }
        }
    };
    configuredLineChart = new Chart(chart, lineConfig);
}


let configuredBarChart;

function loadHistogram(index=TOTAL_ENTRIES-1) {
    // Chart.defaults.global.animation.duration = 1000
    let histogram = document.getElementById("ev_histogram_chart")
    if(configuredBarChart) {
        configuredBarChart.destroy();
    }

    let dataMin = 538;
    let dataMax = 0;

    for (let i = 0; i <= TOTAL_ENTRIES-1; i++) {
        evHistogramData = GetNthEntry(GLOBAL_DATA["ev_histogram"], i)
        let min = Object.keys(evHistogramData)[0]
        let max = Object.keys(evHistogramData)[Object.keys(evHistogramData).length - 1]
        if (min < dataMin) {
            dataMin = min;
        }
        if (max > dataMax) {
            dataMax = max;
        }
    }
    dataMin = 0;
    dataMax = 538;
    EV_HISTOGRAM = GetNthEntry(GLOBAL_DATA["ev_histogram"], index)
    
    let indexBeginning = Object.keys(EV_HISTOGRAM)[0]
    for (let i = dataMin; i < indexBeginning; i++){
        EV_HISTOGRAM[i] = 0;
    }
    
    let indexEnd = Number(Object.keys(EV_HISTOGRAM)[Object.keys(EV_HISTOGRAM).length - 1])+1
    for (let i = indexEnd; i <= dataMax; i++){
        EV_HISTOGRAM[i] = 0;
    }
    
    let tippingPointIndex;
    for (let i = 0; i < Object.keys(EV_HISTOGRAM).length; i++){
        if (Object.keys(EV_HISTOGRAM)[i] == 269) {
            tippingPointIndex = i;
        }
    }

    let gridBarColor = Array(tippingPointIndex).fill(getCssletiable("--rep-bg"))
    gridBarColor.push("rgb(255,255,255)")
    gridBarColor.push.apply(gridBarColor, Array(Object.keys(EV_HISTOGRAM).length - tippingPointIndex - 1).fill(getCssletiable("--dem-bg")))
    gridBarColor[0] = getCssletiable("--card-bg")
    gridBarColor[gridBarColor.length - 1] = getCssletiable("--card-bg")

    let fontColor = "rgb(255,255,255)"
    let ticks = linspace(dataMin, dataMax, 15)
    ticks.push("269")

    let barConfig = {
        type: 'bar',
        data: {
            labels: Object.keys(EV_HISTOGRAM),
            datasets: [{
                label: "Number of Simulations",
                data: Object.values(EV_HISTOGRAM),
                fill: false,
                borderColor: gridBarColor,
                borderWidth: 5,
                backgroundColor: gridBarColor,
                barPercentage: 1,
                categoryPercentage: 1,
                barThickness: 'flex',
            }, ]
        },
        options: {
            // padding: "50",
            responsive: true,
            tooltips: {
                intersect: false,
                mode: "index",
                enabled: false,
                custom: EVTooltip,
            },
            title: {
                text: "Democratic EVs",
                display: true,
                fontColor: fontColor
            },
            legend: {
                fontColor: fontColor,
                display: false,
            },
            layout: {
                padding: {
                    left: 75,
                    right: 75,
                    top: 30,
                    bottom: 10,
                }
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "% of Simulations",
                        fontColor: fontColor,
                        padding: 20,
                    },
                    ticks: {
                        min: -0.0,
                        max: 2000,
                        fontColor: fontColor,
                        callback: function(value, index, values) {
                            return String((value/500).toFixed(2)) + "%";
                        }
                    },
                    gridLines: {
                        // color: fontColor,
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: fontColor,
                        minRotation: 0,
                        maxRotation: 45,
                        // stepSize: dataMax-dataMin,
                        // maxTicksLimit: 20,
                        min: 0,
                        max: 538,
                        autoSkip: false,
                        beginAtZero: true,
                        // afterBuildTicks: function(setTicks) {
                        //     setTicks = ticks;
                        //     return;
                        // },
                        // beforeUpdate: function(oScale) {
                        //     return;
                        // },
                        callback: function(value, index, values) {
                            if (ticks.includes(value)) {
                                return value;
                            }
                            else {
                                return;
                            }
                        }
    
                    },
                    gridLines: {
                        color: getCssletiable("--card-bg"),
                    }
                }]
            }
        }
    };
    configuredBarChart = new Chart(histogram, barConfig);
}

function linspace(start, end, length) {
    let arr = []
    let diff = end - start
    for (i = 0; i < length; i++){
        let add = (Number(start) + (diff * i/(length-1)));
        arr.push(add.toFixed(0))
    }
    return arr;
}


function lerp(x, y, t) {
    if (t > 0.5) {
        return x + (y - x) * Math.pow(t, 3);
    }
    else {
        return x + (y - x) * Math.pow(t, 1/3);
    }
}

function unlerp(arr) {
    let repC = getCssletiable("--rep-bg").replace("rgb(", "").replace(")", "").split(",");
    let demC = getCssletiable("--dem-bg").replace("rgb(", "").replace(")", "").split(",");
    
    let r = parseFloat(arr[0]);
    let g = parseFloat(arr[1]);
    let chance;
    if (r == 255) {
        chance = Math.pow((g - parseInt(repC[1]))/(255-parseInt(repC[1])), 3);
    }
    else {
        chance = Math.pow(1-(g - parseInt(demC[1]))/(255-parseInt(demC[1])), 1/3);
    }
    return chance;
}


function getMapCss(data, id_prefix="") {
    let cssStr = "";

    let demC = getCssletiable("--dem-bg").replace("rgb(", "").replace(")", "").split(",");
    let repC = getCssletiable("--rep-bg").replace("rgb(", "").replace(")", "").split(",");
    
    Object.keys(data).forEach(key => {
        if (STATEABBR[key]) {
            cssStr += id_prefix + "#" + STATEABBR[key] + " { fill:"
            let rgb = [];
            
            if (data[key] < 0.5) {
                let datapoint = data[key] * 2;
                rgb = [
                    lerp(parseInt(repC[0]), 255, data[key]),
                    lerp(parseInt(repC[1]), 255, data[key]),
                    lerp(parseInt(repC[2]), 255, data[key])
                ]
            }
            else {
                let datapoint = (data[key] - 0.5) * 2;
                rgb = [
                    lerp(255, parseInt(demC[0]), data[key]),
                    lerp(255, parseInt(demC[1]), data[key]),
                    lerp(255, parseInt(demC[2]), data[key])
                ]
            }
            
            cssStr += "rgb(" + rgb.join(", ") + ")}\n";
        }
    })
    return cssStr;
}


function loadData() {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() { 
        if (xhr.readyState == 4 && xhr.status == 200) {
            parseData(xhr.responseText);
        }
    }

    xhr.open("GET", "/load_data", true);
    xhr.send(null);
}


function getCssletiable(letiable) {
    return getComputedStyle(document.body).getPropertyValue(letiable);
}


function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}


function openPage() {

    let bars = document.getElementsByClassName("stats-bar");
    document.querySelectorAll(".win-prob.biden")[0].innerHTML = Math.round(DEM_WIN_CHANCE * 1000) / 10 + "%"
    document.querySelectorAll(".win-prob.trump")[0].innerHTML = Math.round((100.0 - (DEM_WIN_CHANCE * 100.0)) * 10) / 10 + "%"
    setStatsBarSize(bars[0], DEM_WIN_CHANCE * 100);

    document.querySelectorAll("#electoral span.biden")[0].innerHTML = DEM_ELECTORAL_VOTES
    document.querySelectorAll("#electoral span.trump")[0].innerHTML = MAX_VOTES - DEM_ELECTORAL_VOTES
    setStatsBarSize(bars[1], (DEM_ELECTORAL_VOTES / MAX_VOTES) * 100);


    document.querySelectorAll("#popular span.biden")[0].innerHTML = Math.round(10 * (50 + (DEM_POPULAR_VOTE / 2))) / 10 + "%"
    document.querySelectorAll("#popular span.trump")[0].innerHTML = 100 - (Math.round(10 * (50 + (DEM_POPULAR_VOTE / 2))) / 10) + "%"
    setStatsBarSize(bars[2], 50 + (DEM_POPULAR_VOTE / 2));
    document.getElementById("updated").children[0].innerHTML = "Updated " + SIMULATION_DATE

    loadLineChart();
    let mapStyle = document.getElementById("mapStyle");
    mapStyle.innerHTML = getMapCss(GetNthEntry(STATE_CHANCES, TOTAL_ENTRIES - 1));

    let mapTimeline = document.getElementById("map-timeline");
    addMapEventListener();
    mapTimeline.max = TOTAL_ENTRIES - 1;
    mapTimeline.value = TOTAL_ENTRIES - 1;

    let barTimeline = document.getElementById("bar-timeline");
    barTimeline.max = TOTAL_ENTRIES - 1;
    barTimeline.value = TOTAL_ENTRIES - 1;
    addBarEventListener();

    let lineTimelineToday = document.getElementById("line-timeline-today")
    let barTimelineToday = document.getElementById("bar-timeline-today")
    SIMULATION_DATE = SIMULATION_DATE.slice(5, 7) + '/' + SIMULATION_DATE.slice(8, 12) + "H"
    lineTimelineToday.innerHTML = SIMULATION_DATE
    barTimelineToday.innerHTML = SIMULATION_DATE
    loadHistogram();

    let tippingPointAmount = document.getElementById("tipping-point-amount")
    let popevAmount = document.getElementById("pop-ev-amount")
    let favored = document.getElementById("favored")
    tippingPointAmount.innerHTML = TIPPING_POINT_DATA["average tipping point"].toFixed(1) + "%"
    popevAmount.innerHTML = Math.abs(TIPPING_POINT_DATA["pop-ev split"]).toFixed(1) + "%"
    if (TIPPING_POINT_DATA["pop-ev split"] > 0) {
        favored.innerHTML = "Biden"
    }
    else {
        favored.innerHTML = "Trump"
    }

    tippingPointStates()

}

function retrieveResults(prefix="") {
    prefix = prefix.trim()
    let results = []
    Object.keys(STATE_SVGS).forEach(key => {
        let full = STATEUNABBR[key]
        if (full.startsWith(prefix)) {
            results.push(STATEABBR[full])
        }
    })
    let resultsDiv = document.getElementById("results")
    while (resultsDiv.firstChild.nextSibling.nextSibling) {
        resultsDiv.removeChild(resultsDiv.lastChild);
    }
    console.log(results)
    return results;
}

function svgSizeChange(state, size) {
    let svg = STATE_SVGS[state]
    svg = svg.slice(0, svg.indexOf("id")) + 'id="' + state + '" width="' + size +'" ' + svg.slice(svg.indexOf("height"))
    return svg
}

function retrieveStates(prefix="") {
    let resultsDiv = document.getElementById("results")
    results = retrieveResults(prefix)
    if (results.length  > 0) {
        resultsDiv.style.border = "5px solid white"
    }
    else {
        resultsDiv.style.border = "none"
    }
    for (let i = 0; i < results.length; i++) {
        state = results[i]
        let stateDiv = document.createElement("div")
        stateDiv.classList.add("state-results")
        stateDiv.tabIndex = "0"

        let stateSvg = document.createElement("div")
        stateSvg.classList.add("state-svgs")
        stateSvg.innerHTML = svgSizeChange(state, 85);
        stateDiv.appendChild(stateSvg)

        if (i % 2 == 0) {
            let stateRow = document.createElement("div")
            stateRow.style.display = "table-row"
            stateRow.style.padding = "0px"
            stateRow.appendChild(stateDiv)
            resultsDiv.appendChild(stateRow)

            // let rect = stateDiv.getBoundingClientRect()
            // console.log(rect["left"])
            // stateSvg.style["left"] = String(rect["left"]+0) + "px"
            // // stateSvg.style.left = String(rect["left"] + 30) + "px"
        }
        else {
            stateDiv.style["border-left"] = "6px solid white"
            let stateRow = resultsDiv.lastChild
            stateRow.appendChild(stateDiv)
            // let rect = stateDiv.getBoundingClientRect()
            // stateSvg.style["margin-left"] = String(rect["left"]-880) + "px"
        }
        // if (i != 0 || i != 1) {
        //     stateDiv.style["border-top"] = "3px solid white"
        // }
        let stateText = document.createElement("p")
        stateText.classList.add("state-texts")
        stateText.innerHTML = state;

        
        let style = document.getElementById("states-style")
        let beginning = style.innerText.indexOf(state)
        let textColor;
        let fontSize;
        if (state.length == 4) {
            textColor = style.innerText.slice(beginning+12, style.innerText.indexOf("}", beginning))
            fontSize = "50px"
            stateText.style["margin-right"] = "142px"
            stateText.style["margin-top"] = "15px"
        }
        else if (["GP", "NO", "SW", "SE"].includes(state)) {
            textColor = "rgb(255,255,255)"
            fontSize = "60px"
        }
        else {
            textColor = style.innerText.slice(beginning+10, style.innerText.indexOf("}", beginning))
            fontSize = "60px"
        }
        stateText.style.color = textColor
        stateText.style["font-size"] = fontSize
        stateDiv.appendChild(stateText)
        
        stateDiv.addEventListener("mouseenter", function() {
            stateDiv.style["background-color"] = "black"
            stateSvg.innerHTML = svgSizeChange(stateDiv.lastChild.innerHTML, 90);
        })
        stateDiv.addEventListener("mouseleave", function() {
            stateDiv.style["background-color"] = "var(--card-bg)"
            stateSvg.innerHTML = svgSizeChange(stateDiv.lastChild.innerHTML, 85);
        })
    }
    // For some reason this is necessary for the state svgs to be in the right place
    if (results.length == 1) {
        resultsDiv.style["width"] = "290px"
        resultsDiv.style["height"] = "100px"
        let stateSvgs = document.getElementsByClassName("state-svgs")
        for (let i = 0; i < stateSvgs.length; i++) {
            let stateSvg = stateSvgs[i]
            console.log(stateSvg)
            let right = stateSvg.getBoundingClientRect()["right"]
            stateSvg.style.right = String(right + 0) + "px"
        }
    }
    // else if (results.length == 2) {
    //     resultsDiv.style["height"] = "100px"
    // }
    else {
        resultsDiv.style["width"] = "600px"
        resultsDiv.style["height"] = "100px"
    }
}

function capitalize(text) {
    let wordsArray = text.split(' ')
    let capsArray = []

    wordsArray.forEach(word => {
        capsArray.push(word[0].toUpperCase() + word.slice(1))
    });

    return capsArray.join(' ')
}

let stateResults = []
let stateColors = []
let graphMode = "chance"

function searchRequest(state, mode=undefined) {
    if (mode == "search") {
        results = retrieveResults(state)
        state = results[0]
    }
    console.log(state)
    let resultsDiv = document.getElementById("results")
    resultsDiv.style.border = "none"
    if (state != undefined) {
        stateResults.push(state)
        // if (state == "ES") {
        //     stateColors.push("ME-2")
        //     stateColors.push("FL")
        //     stateColors.push("NC")
        //     stateColors.push("VA")
        //     stateColors.push("SC")
        //     stateColors.push("NH")
        //     stateColors.push("GA")
        // }
        // else if (state == "GP") {
        //     stateColors.push("MO")
        //     stateColors.push("KS")
        //     stateColors.push("NE-1")
        //     stateColors.push("NE-2")
        //     stateColors.push("TX")
        //     stateColors.push("IA")
        // }
        // else if (state == "WS") {
        //     stateColors.push("AK")
        //     stateColors.push("MT")
        //     stateColors.push("NV")
        //     stateColors.push("AZ")
        //     stateColors.push("CO")
        //     stateColors.push("NM")
        // }
        // else if (state == "MW") {
        //     stateColors.push("MN")
        //     stateColors.push("WI")
        //     stateColors.push("MI")
        //     stateColors.push("PA")
        //     stateColors.push("OH")
        //     stateColors.push("IN")
        // }
        // else {
        //     stateColors.push(state)
        // }
        let input = document.getElementById("states-enter")
        input.style["border-top-left-radius"] = "0"
        input.style["border-top-right-radius"] = "0"
        let stateResult = document.createElement("div")
        stateResult.id = state
        stateResult.style.display = "inline-block"
        stateResult.style.width = "630px"
        stateResult.style["margin-left"] = "auto"
        stateResult.style["margin-right"] = "auto"
        stateResult.style.height = "100px"
        stateResult.style["background-color"] = "white"
        stateResult.style.display = "block"
        stateResult.style["border-bottom"] = "3px solid grey"

        if (stateResults.length == 1) {
            // stateResult.style["margin-top"] = "150px"
            stateResult.style["border-top-left-radius"] = "20px"
            stateResult.style["border-top-right-radius"] = "20px"
        }

        let stateSvg = document.createElement("div")
        stateSvg.style.height = "75px"
        stateSvg.style.width = "100px"
        if (["SE", "GP", "NO"].includes(state)) {
            stateSvg.style["margin-top"] = "7px"
        }
        else {
            stateSvg.style["margin-top"] = "15px"
        }
        stateSvg.style["margin-left"] = "15px"
        stateSvg.style.display = "inline-block"
        stateSvg.style.float = "left"
        stateSvg.innerHTML = svgSizeChange(state, 85);
        stateResult.append(stateSvg)

        let stateText = document.createElement("p")
        stateText.innerHTML = capitalize(STATEUNABBR[state]);
        stateText.style.display = "inline"
        stateText.style.float = "left"
        stateText.style["margin-left"] = "20px"
        stateText.style["text-align"] = "left"
        stateText.style.width = "400px"
        stateText.style["margin-top"] = "20px"
        stateText.style["font-size"] = "42px"
        stateText.style["font-weight"] = "70"
        stateText.style["font-family"] = "Fira Code"
        stateText.style.textEmphasis = "none"
        let style = document.getElementById("states-style")
        let beginning = style.innerText.indexOf(state)
        let textColor = style.innerText.slice(beginning+10, style.innerText.indexOf("}", beginning))
        stateText.style.color = "black"
        stateResult.append(stateText)

        let stateRemove = document.createElement("img")
        stateRemove.classList.add(state)
        stateRemove.src = "/static/media/remove.png"
        stateRemove.style.width = "60px" 
        stateRemove.style.height = "60px" 
        stateRemove.style.float = "right"
        stateRemove.style["margin-right"] = "20px"
        stateRemove.style["margin-top"] = "20px"
        stateRemove.style.opacity = "0.5"
        stateRemove.addEventListener("click", function() {
            removeState(stateRemove)
        })
        stateRemove.addEventListener("mouseenter", function() {
            stateRemove.style.opacity = "0.7"
        })
        stateRemove.addEventListener("mouseleave", function() {
            stateRemove.style.opacity = "0.5"
        })
        stateResult.appendChild(stateRemove)
        let statesDiv = document.getElementById("add-state-div")
        statesDiv.insertBefore(stateResult, input)
        
    }
    if (stateResults.length == 1) {
        let graphContainer = document.createElement("div")
        graphContainer.id = "graph-container"
        let headingsContainer = document.createElement("div")
        headingsContainer.id = "headings-container"

        let chanceContainer = document.createElement("div")
        chanceContainer.id = "chance-container"
        let chance = document.createElement("button")
        chance.id = "chance"
        chance.innerHTML = "Chance of Winning"
        chance.addEventListener("click", function() {stateHeaderSelection("chance")})
        chanceContainer.appendChild(chance)

        let pvContainer = document.createElement("div")
        pvContainer.id = "pv-container"
        pvContainer.style["border-bottom"] = "5px solid white"
        let pv = document.createElement("button")
        pv.id = "pv"
        pv.innerHTML = "Popular Vote Margin"
        pv.addEventListener("click", function() {stateHeaderSelection("pv")})
        pvContainer.appendChild(pv)

        headingsContainer.appendChild(chanceContainer)
        headingsContainer.appendChild(pvContainer)
        
        let headingFloatContainer = document.createElement("div")
        headingFloatContainer.style.width = "100%"
        headingFloatContainer.appendChild(headingsContainer)
        headingFloatContainer.classList.add("movein")
        headingFloatContainer.id = "heading-width-container-container"
        document.body.appendChild(headingFloatContainer)
        
        graphWidthContainer = document.createElement("div")
        graphWidthContainer.id = "state-chart-container"
        graph = document.createElement("canvas")
        graph.id = "state-chart"
        graphWidthContainer.appendChild(graph)
        graphContainer.classList.add("movein")
        graphContainer.appendChild(graphWidthContainer)
        document.body.appendChild(graphContainer)
        
        if (graphMode == "chance") {
            console.log(state)
            loadStateLineChart("chance")
        }
        else {
            loadStateLineChart("pv")
        }
    }
    else {
        if (graphMode == "chance") {
            addStateLineChart(state, "chance")
        }
        else {
            addStateLineChart(state, "pv")
        }
    }
}

function openStatesPage() {
    let style = document.getElementById("states-style")
    style.innerHTML = getMapCss(GetNthEntry(STATE_CHANCES, TOTAL_ENTRIES - 1))
    let input = document.getElementById("states-enter")
    input.classList.add('movein')
    input.addEventListener("click", function() {
        input.classList.add('bounce')
    })
    input.addEventListener("input", function() {
        retrieveStates(input.value)
    })
    input.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            searchRequest(input.value, "search")
        }
    })
    input.addEventListener("focus", function() {
        retrieveStates(input.value)
    })
    input.addEventListener("blur", function(event) {
        let resultsDiv = document.getElementById("results")
        resultsDiv.style.border = "none"
        let newFocus = event.relatedTarget
        if (newFocus != null) {
            searchRequest(newFocus.lastChild.innerHTML, "results")
        }
        retrieveResults()
    })

    // window.addEventListener("resize", resize(-30))
}

function removeState(stateRemove) {
    let stateDiv = stateRemove.parentNode
    console.log(stateDiv)
    console.log(stateResults)
    // console.log(stateColors)
    let statesDiv = document.getElementById("add-state-div")
    statesDiv.removeChild(stateDiv)
    let firstChild = document.getElementById(stateResults[1])
    if (firstChild != undefined) {
        firstChild.style["border-top-left-radius"] = "20px"
        firstChild.style["border-top-right-radius"] = "20px"
    }
    
    if (stateResults.length == 1) {
        let input = document.getElementById("states-enter")
        input.style["border-top-left-radius"] = "20px"
        input.style["border-top-right-radius"] = "20px"
        
        let graphContainer = document.getElementById('graph-container')
        let headingContainer = document.getElementById("heading-width-container-container")
        document.body.removeChild(graphContainer)
        document.body.removeChild(headingContainer)
    }
    else {
    }
    let state = stateResults.indexOf(stateDiv.id)
    console.log(state)
    // if (stateDiv.id == "ES") {
    //     for(let removeState of ["SC", "GA", "FL", "NC", "VA", "NH", "ME-2"]) {
    //         stateColors.splice(stateColors.indexOf(removeState), 1)
    //         removeGraphState(removeState)
    //     }
    // }
    // else if (state == "GP") {
    //     for(let removeState of ["MO", "KS", "NE-1", "NE-2", "TX", "IA"]) {
    //         stateColors.splice(stateColors.indexOf(removeState), 1)
    //         removeGraphState(removeState)
    //     }
    // }
    // else if (state == "WS") {
    //     for(let removeState of ["AK", "MT", "NV", "AZ", "CO", "NM"]) {
    //         console.log("yes")
    //         stateColors.splice(stateColors.indexOf(removeState), 1)
    //         removeGraphState(removeState)
    //     }
    // }
    // else if (state == "MW") {
    //     for(let removeState of ["MN", "WI", "MI", "PA", "OH", "IN"]) {
    //         stateColors.splice(stateColors.indexOf(removeState), 1)
    //         removeGraphState(removeState)
    //     }
    // }
    // else {
    //     console.log(state)
    removeGraphState(state)
    // }
    stateResults.splice(stateResults.indexOf(stateDiv.id), 1)
}


DocReady(loadData);

