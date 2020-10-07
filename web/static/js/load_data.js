var GLOBAL_DATA = {}
var TOTAL_ENTRIES = -1;
var MAX_VOTES = 538;


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

var win_chance_dict;

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
    
    var win_chance_dict = {};
    for (var key in GLOBAL_DATA["dem_win_chance"]) {
        var value = GLOBAL_DATA["dem_win_chance"][key]["dem"]
        win_chance_dict[key] = value;
    }
    console.log(win_chance_dict)
    window.addEventListener("onload", loadChart(win_chance_dict))
    // Add animations, load data onto page
    openPage();
}

Chart.defaults.global.defaultFontSize = 20;
Chart.defaults.global.elements.point.radius = 4;
function loadChart(win_chance_dict){
    var chart = document.getElementById('win_chance_chart').getContext('2d');
    
    var labels = []
    var dem_win_chance = []
    var rep_win_chance = []
    for (var key of Object.keys(win_chance_dict)){
        new_key = key.slice(5, 7) + '/' + key.slice(8, 10) + ' ' + key.slice(-2) + 'H'
        labels.push(new_key)
        val = win_chance_dict[key]
        dem_win_chance.push((val*100).toFixed(3))
        rep_win_chance.push((100-val*100).toFixed(3))
    }

    console.log(rep_win_chance)

    var configured_chart = new Chart(chart, {
        type: 'line',
        data : {
            labels: labels,
            datasets: [{
                label: "Biden",
                data: dem_win_chance,
                fill: false,
                borderColor: "rgb(110, 144, 255)",
                borderWidth: 5,
                backgroundColor: "rgb(110, 144, 255)",
            }, {
                label: "Trump",
                data: rep_win_chance,
                fill: false,
                borderColor: "rgb(255, 104, 104)",
                borderWidth: 5,
                backgroundColor: "rgb(255, 104, 104)",
            }]
        },
        options: {
            padding: "50",
            responsive: false,
            tooltips: {
                intersect: false
            },
            legend: {
                fontColor: "white",
            },
            layout: {
                padding: {
                    left: 75,
                    right: 75,
                    top: 30,
                    bottom: 30,
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        min: -0.0,
                        max: 100,
                        fontColor: "white",
                        stepSize: 10,
                    },
                    gridLines: {
                        color: "white",
                    },
                }],
                xAxes: [{
                    ticks: {
                        fontColor: "white",
                    },
                    gridLines: {
                        color: "white",
                    }
                }],
            }
            }
        });
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


var Landing = document.getElementById("landing");



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
}


loadData();