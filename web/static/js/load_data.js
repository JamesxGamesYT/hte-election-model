let GLOBAL_DATA = {}
let CONDITIONAL_STATE_CHANCES;
let CONDITIONAl_DEM_WIN_CHANCE;
let TOTAL_ENTRIES = -1;
let MAX_VOTES = 538;
let WinChanceDict;

Chart.defaults.global.defaultFontSize = 20;
Chart.defaults.global.defaultFontFamily = "Fira Code";
Chart.defaults.global.elements.point.radius = 1.5;
Chart.defaults.global.animation.duration = 1;

// Add some much needed padding between chart and legend
Chart.Legend.prototype.afterFit = function() {
    this.height = this.height + 10;
};

const STATEABBR = {
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

let EVNUMBERS = {
    "california": 55,
    "texas": 38,
    "new york": 29,
    "florida": 29,
    "pennsylvania": 20,
    "illinois": 20,
    "ohio": 18,
    "michigan": 16,
    "georgia": 16,
    "north carolina": 15,
    "new jersey": 14,
    "virginia": 13,
    "washington": 12,
    "tennessee": 11,
    "massachusetts": 11,
    "indiana": 11,
    "arizona": 11,
    "wisconsin": 10,
    "missouri": 10,
    "minnesota": 10,
    "maryland": 10,
    "south carolina": 9,
    "colorado": 9,
    "alabama": 9,
    "louisiana": 8,
    "kentucky": 8,
    "oregon": 7,
    "oklahoma": 7,
    "connecticut": 7,
    "utah": 6,
    "nevada": 6,
    "mississippi": 6,
    "kansas": 6,
    "iowa": 6,
    "arkansas": 6,
    "west virginia": 5,
    "new mexico": 5,
    "nebraska": 5,
    "rhode island": 4,
    "new hampshire": 4,
    "maine": 4,
    "idaho": 4,
    "hawaii": 4,
    "wyoming": 3,
    "vermont": 3,
    "south dakota": 3,
    "north dakota": 3,
    "montana": 3,
    "delaware": 3,
    "alaska": 3
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
    CONDITIONAL_DEM_WIN_CHANCE = GetNthEntry(GLOBAL_DATA["dem_win_chance"], TOTAL_ENTRIES - 1)["dem"]
    DEM_ELECTORAL_VOTES = GetNthEntry(GLOBAL_DATA["percentile_ev"], TOTAL_ENTRIES - 1)["median"]
    DEM_POPULAR_VOTE = GetNthEntry(GLOBAL_DATA["percentile_state_margins"], TOTAL_ENTRIES - 1)["national"][1]
    STATE_MARGINS = GLOBAL_DATA["percentile_state_margins"]
    SIMULATIONS_BY_EV = GLOBAL_DATA["simulations_by_ev"]
    STATE_CHANCES = GLOBAL_DATA["state_chances"]
    CONDITIONAL_STATE_CHANCES =  GetNthEntry(GLOBAL_DATA["state_chances"], TOTAL_ENTRIES - 1)
    console.log(CONDITIONAL_STATE_CHANCES)
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

function reparseData(rt) {
    let mapWrapper = document.getElementById("map-wrapper")
    let noResultsDiv = document.getElementById("what-if-no-results")
    let loadingDiv = document.getElementById("what-if-loading")
    if(JSON.parse(rt)[0] == null) {
        let map = document.getElementById("map")

        if (noResultsDiv  == undefined) {
            let noResultsDiv = document.createElement("div")
            noResultsDiv.id = "what-if-no-results"
            noResultsDiv.innerHTML = "There aren't enough simulations for this result. Try a different scenario!"
            mapWrapper.insertBefore(noResultsDiv, map)
            if (loadingDiv != undefined) {
                mapWrapper.removeChild(loadingDiv)
            }
        }
    }
    else {
        CONDITIONAL_STATE_CHANCES = JSON.parse(rt)[1]
        CONDITIONAL_DEM_WIN_CHANCE = JSON.parse(rt)[0]
        let mapStyle = document.getElementById("mapStyle");
        mapStyle.innerHTML = getMapCss(CONDITIONAL_STATE_CHANCES);

        if (noResultsDiv != undefined) {
            mapWrapper.removeChild(noResultsDiv)
        }
        if (loadingDiv != undefined) {
            mapWrapper.removeChild(loadingDiv)
        }

        let demWinChance = document.getElementById("what-if-win-chance-chance")
        let newWinChance = (CONDITIONAL_DEM_WIN_CHANCE * 100).toFixed(1)
        demWinChance.innerHTML = String((CONDITIONAL_DEM_WIN_CHANCE * 100).toFixed(1)) + "%"
        if (newWinChance > 50) {
            demWinChance.style.color = "var(--dem-bg)"
        }
        else {
            demWinChance.style.color = "var(--rep-bg)"
        }
    }
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


function loadData(yes, state_conditional=undefined) {
    let xhr = new XMLHttpRequest();
    // state_conditional = undefined
    console.log(state_conditional)
    if (state_conditional != undefined) {
        xhr.onreadystatechange = function() { 
            if (xhr.readyState == 4 && xhr.status == 200) {
                reparseData(xhr.responseText);
            }
        }
        stateConditionalStr = "/what_if/{"
        Object.keys(state_conditional).forEach(key => {
            stateConditionalStr += '"' + key + '":"' + state_conditional[key] + '", '
        })
        stateConditionalStr += "}"
        xhr.open("GET", stateConditionalStr, true)
        xhr.send(null);
    }
    else {
        console.log("yes!")
        xhr.onreadystatechange = function() { 
            if (xhr.readyState == 4 && xhr.status == 200) {
                parseData(xhr.responseText);
            }
        }
        xhr.open("GET", "/load_data", true);
        xhr.send(null);
    }
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

function addButtons() {
    let mapWrapper = document.getElementById("map-wrapper")
    let mapTimeline = document.getElementsByClassName("timeline")[0]
    let buttonsDiv = document.createElement("div")
    buttonsDiv.id = "what-if-buttons-div"
    mapWrapper.insertBefore(buttonsDiv, mapTimeline)

    let createButton = document.createElement("button")
    buttonsDiv.appendChild(createButton)
    createButton.classList.add("what-if-buttons")
    createButton.style["background-color"] = "var(--rep-bg)"
    createButton.innerHTML = "Run"
    createButton.addEventListener("click", function() {
        let loadingDiv = document.getElementById("what-if-loading")
        let noResultsDiv = document.getElementById("what-if-no-results")
        if (noResultsDiv == undefined) {
            if (loadingDiv == undefined) {
                loadingDiv = document.createElement("div")
                loadingDiv.id = "what-if-loading"
                loadingDiv.innerHTML = "Loading..."
                mapWrapper.insertBefore(loadingDiv, buttonsDiv)
            }
        }
        loadData("placeholder", state_conditionals)
        // console.log(mapStyle.innerHTML)
    })

    let resetButton = document.createElement("button")
    buttonsDiv.appendChild(resetButton)
    resetButton.classList.add("what-if-buttons")
    resetButton.style["background-color"] = "var(--dem-bg)"
    resetButton.innerHTML = "Reset"
    resetButton.addEventListener("click", function() {
        resetConditionals()
    })
}

function resetConditionals() {
    let mapWrapper = document.getElementById("map-wrapper")
    mapWrapper.removeChild(document.getElementById("what-if-buttons-div"))
    let loading = document.getElementById("what-if-loading")
    if (loading != undefined) {
        mapWrapper.removeChild(document.getElementById("what-if-loading"))
    }
    CONDITIONAL_STATE_CHANCES = GetNthEntry(STATE_CHANCES, TOTAL_ENTRIES - 1)
    CONDITIONAl_DEM_WIN_CHANCE = DEM_WIN_CHANCE
    let mapStyle = document.getElementById("mapStyle");
    mapStyle.innerHTML = getMapCss(CONDITIONAL_STATE_CHANCES);
    Object.keys(STATEUNABBR).forEach(state => {
        let path = document.getElementById(state)
        if (path != null) {
            path.style["stroke-width"] = "3"
            path.style.stroke = "black"
            path.style.fill = ""
        }
    })
    state_conditionals = {}
    
    let noResultsDiv = document.getElementById("what-if-no-results")
    if (noResultsDiv != undefined) {
        mapWrapper.removeChild(noResultsDiv)
    }

    let demWinChance = document.getElementById("what-if-win-chance-chance")
    demWinChance.innerHTML = String((DEM_WIN_CHANCE * 100).toFixed(1)) + "%"
    if ((DEM_WIN_CHANCE * 100).toFixed(1) > 50) {
        demWinChance.style.color = "var(--dem-bg)"
    }
    else {
        demWinChance.style.color = "var(--rep-bg)"
    }
}

let state_conditionals = {};
function loadWhatif() {
    let mapWrapper = document.getElementById("map-wrapper")
    let tooltips = document.getElementById("tooltip-container")
    let info = document.createElement("div")
    info.id = "what-if-info"
    info.innerHTML = "Explore various scenarios and see how our model interacts! \
    Click on states and then press the run button. "
    mapWrapper.insertBefore(info, tooltips)

    let winChance = document.createElement("div")
    winChance.id = "what-if-win-chance"
    let winChanceText = document.createElement("p")
    winChanceText.id = "what-if-win-chance-text"
    winChanceText.innerHTML = "Chance of Biden win:"
    let winChanceChance = document.createElement("p")
    winChanceChance.id = "what-if-win-chance-chance"
    winChanceChance.innerHTML = String((DEM_WIN_CHANCE * 100).toFixed(1)) + "%"
    if (String((DEM_WIN_CHANCE * 100).toFixed(3)) > 50) {
        winChanceChance.style.color = "var(--dem-bg)"
    }
    else {
        winChanceChance.style.color = "var(--rep-bg)"
    }
    winChance.appendChild(winChanceText)
    winChance.appendChild(winChanceChance)
    mapWrapper.insertBefore(winChance, tooltips)

    Object.keys(STATEUNABBR).forEach(state => {
        let path = document.getElementById(state)
        if (path != null) {
            path.addEventListener("click", function() {
                if (whatifMode != false) {
                    fullState = STATEUNABBR[path.id]
                    if (state_conditionals[fullState] === undefined) {
                        state_conditionals[fullState] = 0
                        path.style.fill = "var(--rep-bg)"
                        path.style["stroke-width"] = "6"
                        path.style["stroke"] = "rgb(255,255,255)"
                        if (Object.keys(state_conditionals).length == 1 && Object.values(state_conditionals)[0] == 0) {
                            addButtons()
                        }
                    }
                    else if (state_conditionals[fullState] === 0) {
                        state_conditionals[fullState] = 1
                        path.style.fill = "var(--dem-bg)"
                    }
                    else {
                         delete state_conditionals[fullState]
                         path.removeAttribute("style")
                         delete path.style.fill
                    }
                    if (Object.keys(state_conditionals).length == 0) {
                        resetConditionals()
                    }
                }
            })
        }
    })
}

function unloadWhatIf() {
    let mapWrapper = document.getElementById("map-wrapper")
    let whatifInfo = document.getElementById("what-if-info")
    let whatifWinChance = document.getElementById("what-if-win-chance")
    mapWrapper.removeChild(whatifInfo)
    mapWrapper.removeChild(whatifWinChance)
    resetConditionals()
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
    removeGraphState(state)
    stateResults.splice(stateResults.indexOf(stateDiv.id), 1)
}


DocReady(loadData);

