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


function parseData(rt) {
    // read data into global parser
    GLOBAL_DATA = JSON.parse(rt);
    TOTAL_ENTRIES = Object.keys(GLOBAL_DATA["dem_win_chance"]).length;


    // Load specific data entries into useful vars
    DEM_WIN_CHANCE = GetNthEntry(GLOBAL_DATA["dem_win_chance"], TOTAL_ENTRIES - 1)["dem"]
    DEM_ELECTORAL_VOTES = GetNthEntry(GLOBAL_DATA["percentile_ev"], TOTAL_ENTRIES - 1)["median"]
    DEM_POPULAR_VOTE = GetNthEntry(GLOBAL_DATA["percentile_state_margins"], TOTAL_ENTRIES - 1)["national"][1]

    // Add animations, load data onto page
    openPage();
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
}



DocReady(loadData);