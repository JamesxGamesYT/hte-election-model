var GLOBAL_DATA = {}
var TOTAL_ENTRIES = -1;
var MAX_VOTES = 538;
var WinChanceDict;

Chart.defaults.global.defaultFontSize = 20;
Chart.defaults.global.elements.point.radius = 4;


var STATEABBR = {
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
    TOTAL_ENTRIES = Object.keys(GLOBAL_DATA["dem_win_chance"]).length;


    // Load specific data entries into useful vars
    DEM_WIN_CHANCE = GetNthEntry(GLOBAL_DATA["dem_win_chance"], TOTAL_ENTRIES - 1)["dem"]
    DEM_ELECTORAL_VOTES = GetNthEntry(GLOBAL_DATA["percentile_ev"], TOTAL_ENTRIES - 1)["median"]
    DEM_POPULAR_VOTE = GetNthEntry(GLOBAL_DATA["percentile_state_margins"], TOTAL_ENTRIES - 1)["national"][1]
    SIMULATION_DATE = Object.keys(GLOBAL_DATA["dem_win_chance"])[TOTAL_ENTRIES - 1]
    SIMULATION_DATE = "Updated " + SIMULATION_DATE.slice(0, 10) + " " + String(Number(SIMULATION_DATE.slice(-2))) + ":00 UTC"
    
    WinChanceDict = {};
    Object.keys(GLOBAL_DATA["dem_win_chance"]).forEach(key => {
        var value = GLOBAL_DATA["dem_win_chance"][key]["dem"]
        WinChanceDict[key] = value;
    })


    openPage();
}


function loadChart(WinChanceDict){
    var chart = document.getElementById('win_chance_chart').getContext('2d');

    var labels = []
    var demWinChance = []
    var repWinChance = []

    Object.keys(WinChanceDict).forEach(key => {
        newKey = key.slice(5, 7) + '/' + key.slice(8, 10) + ' ' + key.slice(-2) + 'H'
        labels.push(newKey)
        val = WinChanceDict[key]
        demWinChance.push((val*100).toFixed(3))
        repWinChance.push((100-val*100).toFixed(3))
    })


    var configuredChart = new Chart(chart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "Biden",
                data: demWinChance,
                fill: false,
                borderColor: "rgb(110, 144, 255)",
                borderWidth: 5,
                backgroundColor: "rgb(110, 144, 255)"
            },
            {
                label: "Trump",
                data: repWinChance,
                fill: false,
                borderColor: "rgb(255, 104, 104)",
                borderWidth: 5,
                backgroundColor: "rgb(255, 104, 104)"
            }]
        },
        options: {
            padding: "50",
            responsive: false,
            tooltips: {
                intersect: false
            },
            legend: {
                fontColor: "white"
            },
            layout: {
                padding: {
                    left: 75,
                    right: 75,
                    top: 30,
                    bottom: 30
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        min: -0.0,
                        max: 100,
                        fontColor: "white",
                        stepSize: 10
                    },
                    gridLines: {
                        color: "white"
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: "white"
                    },
                    gridLines: {
                        color: "white"
                    }
                }]
            }
        }
    });
}


function lerp(x, y, t) {
    return x + (y - x) * t;
}


function getMapCss(data) {
    var cssStr = "";

    Object.keys(data).forEach(key => {
        if (STATEABBR[key]) {
            cssStr += "#" + STATEABBR[key] + " { fill:"
            
            if (data[key] < 0.5) {
                var datapoint = data[key] * 2;
                var lightness = lerp(0, 255, data[key]);
                cssStr += "rgb(255," + lightness + "," + lightness + ")";
            }
            else {
                var datapoint = (data[key] - 0.5) * 2;
                var lightness = lerp(255, 0, datapoint);
                cssStr += "rgb(" + lightness + "," + lightness + ",255)";
            }

            cssStr += "}\n";
        }
    })

    return cssStr;
}


function loadData() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() { 
        if (xhr.readyState == 4 && xhr.status == 200) {
            parseData(xhr.responseText);
        }
    }

    xhr.open("GET", "/load_data", true);
    xhr.send(null);
}



function openPage() {
    var bars = document.getElementsByClassName("stats-bar");
    document.querySelectorAll(".win-prob.biden")[0].innerHTML = Math.round(DEM_WIN_CHANCE * 1000) / 10 + "%"
    document.querySelectorAll(".win-prob.trump")[0].innerHTML = Math.round((100.0 - (DEM_WIN_CHANCE * 100.0)) * 10) / 10 + "%"
    setStatsBarSize(bars[0], DEM_WIN_CHANCE * 100);

    document.querySelectorAll("#electoral span.biden")[0].innerHTML = DEM_ELECTORAL_VOTES
    document.querySelectorAll("#electoral span.trump")[0].innerHTML = MAX_VOTES - DEM_ELECTORAL_VOTES
    setStatsBarSize(bars[1], (DEM_ELECTORAL_VOTES / MAX_VOTES) * 100);


    document.querySelectorAll("#popular span.biden")[0].innerHTML = Math.round(10 * (50 + (DEM_POPULAR_VOTE / 2))) / 10 + "%"
    document.querySelectorAll("#popular span.trump")[0].innerHTML = 100 - (Math.round(10 * (50 + (DEM_POPULAR_VOTE / 2))) / 10) + "%"
    setStatsBarSize(bars[2], 50 + (DEM_POPULAR_VOTE / 2));
    document.getElementById("updated").children[0].innerHTML = SIMULATION_DATE

    loadChart(WinChanceDict);
    var mapStyle = document.getElementById("mapStyle");
    mapStyle.innerHTML = getMapCss(GetNthEntry(GLOBAL_DATA["state_chances"], TOTAL_ENTRIES - 1));
    

    MapTimeline.max = TOTAL_ENTRIES - 1;
    MapTimeline.value = TOTAL_ENTRIES - 1;
}


DocReady(loadData);