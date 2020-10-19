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
    "federated states of micronesia": "FM",
    "florida": "FL",
    "georgia": "GA",
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
    "marshall islands": "MH",
    "maryland": "MD",
    "massachusetts": "MA",
    "michigan": "MI",
    "minnesota": "MN",
    "mississippi": "MS",
    "missouri": "MO",
    "montana": "MT",
    "nebraska": "NE",
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
    "west virginia": "WV",
    "wisconsin": "WI",
    "wyoming": "WY"
}



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
    SIMULATIONS_BY_EV = GLOBAL_DATA["simulations_by_ev"]
    SIMULATION_DATE = Object.keys(GLOBAL_DATA["dem_win_chance"])[TOTAL_ENTRIES - 1]
    SIMULATION_DATE = SIMULATION_DATE.slice(0, 10) + " " + String(Number(SIMULATION_DATE.slice(-2))) + ":00 UTC"
    TIPPING_POINT_DATA = GetNthEntry(GLOBAL_DATA["tipping_point_data"], TOTAL_ENTRIES - 1)
    TIPPING_POINT_STATE_DATA = GetNthEntry(GLOBAL_DATA["tipping_point_state_data"], TOTAL_ENTRIES-1)
    
    if (document.title == "Predictions | sss_election_model") {
        openPage();
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
    gridLineColor[5] = getCssletiable("--card-bg"),

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
    }

    configuredLineChart = new Chart(chart, lineConfig);
}


let configuredBarChart;
let barConfig;
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

    console.log(EV_HISTOGRAM)
    let gridBarColor = Array(tippingPointIndex).fill(getCssletiable("--rep-bg"))
    gridBarColor.push("rgb(255,255,255)")
    gridBarColor.push.apply(gridBarColor, Array(Object.keys(EV_HISTOGRAM).length - tippingPointIndex - 1).fill(getCssletiable("--dem-bg")))
    gridBarColor[0] = getCssletiable("--card-bg")
    gridBarColor[gridBarColor.length - 1] = getCssletiable("--card-bg")

    let fontColor = "rgb(255,255,255)"
    let ticks = linspace(dataMin, dataMax, 15)
    ticks.push("269")
    console.log(ticks)
    barConfig = {
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
    }

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
    mapStyle.innerHTML = getMapCss(GetNthEntry(GLOBAL_DATA["state_chances"], TOTAL_ENTRIES - 1));
    // let mapWrapper = document.getElementById("map-wrapper")
    // console.log(mapWrapper)
    // let timelineDivs = mapWrapper.childNodes
    // console.log(timelineDivs)
    // mapWrapper.innerHTML = US_SVG
    // mapWrapper.appendChild(timelineDivs[0])
    // mapWrapper.appendChild(timelineDivs[1])
    // console.log(mapWrapper.innerHTML)
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


DocReady(loadData);