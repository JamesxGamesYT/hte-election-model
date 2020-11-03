function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}


let Ham = document.getElementById("hamburger");
let Overlay = document.getElementById("menu-overlay");

Ham.addEventListener("click", function() {
    if (Ham.classList.contains("is-active")) {
        Ham.classList.remove("is-active");
        closeMenu();
    }
    else {
        Ham.classList.add("is-active");
        openMenu();
    }
})

Overlay.addEventListener("mousedown", function() {
    if (Ham.classList.contains("is-active")) {
        Ham.classList.remove("is-active");
        closeMenu();
    }
})


let Menu = document.getElementById("menu");

function openMenu() {
    Overlay.classList.add("fadeIn");
    Menu.classList.remove("closed");
    Menu.classList.add("opened");
}

function closeMenu() {
    Overlay.classList.remove("fadeIn");
    Menu.classList.remove("opened");
    Menu.classList.add("closed");
}


let whatifMode = false
function mapHeaderSelection(heading) {
    let evMapHeading = document.getElementsByClassName("headings-container")[0].firstElementChild
    let whatifHeading = document.getElementsByClassName("headings-container")[0].lastElementChild
    if (heading.classList.contains("non-active")) {
        heading.classList.remove("non-active")
        if(heading == evMapHeading) {
            whatifMode = false
            whatifHeading.classList.add("non-active")
            unloadWhatIf()
        }
        else {
            whatifMode = true
            evMapHeading.classList.add("non-active")
            loadWhatif()
        }
    }
    console.log(heading)
}

function headerSelection(heading){
    headers = document.getElementsByClassName("heading")
    console.log(headers)
    for (let event_index=2; event_index < 5; event_index++){
        if (headers[event_index].classList.contains("non-active")){
            if (heading == headers[event_index]){
                headers[event_index].classList.remove("non-active")
            }
        }
        else {
            if (heading != headers[event_index]){
                headers[event_index].classList.add("non-active")
            }
        }
    }
    if (heading.innerHTML == "Chance of Winning"){
        loadWinChance();
    }
    if (heading.innerHTML == "Electoral Votes"){
        loadEV();
    }
    if (heading.innerHTML == "Popular Vote"){
        loadPV();
    }
    let chart = document.getElementById('win_chance_chart');
}

function setStatsBarSize(statsBar, width) {
    statsBar.getElementsByClassName("biden")[0].style.width = "calc(" + width + "% - 2px)"
    statsBar.getElementsByClassName("trump")[0].style.width = "calc(" + (100 - width) + "% - 2px";
}


function animateMethodology() {
    let elements;
    let windowHeight;

    function checkResize() {
        windowHeight = window.innerHeight
        elements = document.querySelectorAll('.hidden')
    }

    function checkPosition() {
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].getBoundingClientRect().bottom < 0){
                elements[i].classList.remove('fade-in-element')
                elements[i].classList.add('hidden')
            }
            else if (elements[i].getBoundingClientRect().top - windowHeight > 0) {
                elements[i].classList.remove('fade-in-element')
                elements[i].classList.add('hidden')
            }
            else if (elements[i].getBoundingClientRect().top - windowHeight <= 0) {
                elements[i].classList.remove('hidden')
                elements[i].classList.add('fade-in-element')
            }
        }
    }
    
    window.addEventListener('scroll', checkPosition)
    window.addEventListener('resize', checkResize)

    checkResize();
    checkPosition();
}


function addMapEventListener() {
    let mapTimeline = document.getElementById("map-timeline");
    let currentLength = 0;

    let simDate = Object.keys(GLOBAL_DATA["dem_win_chance"])[mapTimeline.value]
    simDate = simDate.slice(5, 7) + '/' + simDate.slice(8, 10) + " " + simDate.slice(11, 13) + "H"
    let lastTimelineValues = [simDate, simDate]
    mapTimeline.addEventListener("input", function() {
        let timelineToday = document.getElementById("line-timeline-today");
        let lineTodayPos = ((1-(mapTimeline.value/(TOTAL_ENTRIES-1))) * 0.39) + 0.28
        timelineToday.style.right = String(lineTodayPos*100) + "%"
        
        let simDate = Object.keys(GLOBAL_DATA["dem_win_chance"])[mapTimeline.value]
        simDate = simDate.slice(5, 7) + '/' + simDate.slice(8, 10) + " " + simDate.slice(11, 13) + "H"
        timelineToday.innerText = simDate

        let mapStyle = document.getElementById("mapStyle");
        let beforeStyle = mapStyle.innerHTML
        let afterStyle = getMapCss(GetNthEntry(GLOBAL_DATA["state_chances"], mapTimeline.value));

        lastTimelineValues.shift()
        lastTimelineValues.push(simDate)
        mapStyle.innerHTML = afterStyle;
        let beforeTime = lastTimelineValues[0];
        let afterTime = lastTimelineValues[1];
        
        let changes = {}
        for (let i = 0; i < beforeStyle.split("#").slice(0).length; i++) {
            let beforeStr = beforeStyle.split("#").slice(0)[i]
            let key = beforeStr.substr(0, 2)
            let beforeValue = beforeStr.slice(14, beforeStr.length-3)
            let beforeArr = beforeValue.split(", ");
            let beforeChance = unlerp(beforeArr);
            
            let afterStr = afterStyle.split("#").slice(0)[i]
            let afterValue = afterStr.slice(14, afterStr.length-3)
            let afterArr = afterValue.split(", ");
            let afterChance = unlerp(afterArr);

            let diff = afterChance - beforeChance;
            if (Math.abs(diff) > 0.04) {
                changes[key] = diff;
            }
        }

        let reversed = {};
        Object.keys(changes).forEach(key => {
            reversed[Math.abs(changes[key])] = key
        })
        let orderedStates = []
        Object.keys(reversed).sort().reverse().forEach(key => {
            orderedStates.push(reversed[key])
        })

        let stateChangeContainer = document.getElementById("state-changes")
        let stateHeading = document.getElementById("state-heading")
        let explainer = document.getElementById("explainer")
        if (!stateHeading) {
            let heading = document.createElement("h3")
            heading.id = "state-heading"
            heading.class = "timeline"
            heading.innerText = "State Changes"
            document.getElementById("map-wrapper").insertBefore(heading, stateChangeContainer)
            
            explainer = document.createElement("p")
            explainer.id = "explainer"
            explainer.innerText = "From " + beforeTime + " to " + afterTime + ", how did Democrats' state chances change?"
            document.getElementById("map-wrapper").insertBefore(explainer, stateChangeContainer)
        }

        if (explainer) {
            explainer.remove()
            explainer = document.createElement("p")
            explainer.id = "explainer"
            explainer.innerText = "From " + beforeTime + " to " + afterTime + ", how did Democrats' state chances change?"
            document.getElementById("map-wrapper").insertBefore(explainer, stateChangeContainer)
        }
        

        let noChanges = document.getElementById("no-changes")
        if (!noChanges && !stateHeading) {
            let noChanges = document.createElement("h4")
            noChanges.id = "no-changes"
            noChanges.innerText = "No signficant changes"
            stateChangeContainer.appendChild(noChanges)
        }
        else if (Object.keys(changes).length == 0){
            while (stateChangeContainer.firstChild.nextSibling) {
                stateChangeContainer.removeChild(stateChangeContainer.lastChild);
            }

            noChanges = document.createElement("h4")
            noChanges.id = "no-changes"
            noChanges.innerText = "No signficant changes"
            stateChangeContainer.appendChild(noChanges)
        }
        else {
            while (stateChangeContainer.firstChild.nextSibling) {
                stateChangeContainer.removeChild(stateChangeContainer.lastChild);
            }

            for (let i = 0; i < Math.min(Object.keys(changes).length, 9); i++) {
                let state = orderedStates[i]

                let stateDiv = document.createElement("div")
                stateDiv.style.height = "75px";
                let width = String(Math.abs((Number(changes[state]) * 1000).toFixed(2)))
                stateDiv.style.width = width;
                // stateDiv.style.position = "absolute"
                stateDiv.style.display = "block"
                stateDiv.style["margin-bottom"] = "20px"
                
                let stateName = document.createElement("p")
                stateName.className = "state-name"
                stateName.id = String(i)
                stateName.innerText = state
                
                let stateImage = document.createElement("div")
                stateImage.style.display = "inline";
                stateImage.className = "state-image"
                // stateImage.width = "500px"
                stateImage.innerHTML = STATE_SVGS[state]

                let stateAmount = document.createElement("div")
                stateAmount.innerText = String((Number(changes[state] * 100)).toFixed(2)) + "%"
                stateAmount.style.width = String(Math.abs((Number(changes[state]) * 1000).toFixed(2))) + "px"
                stateAmount.className = "state-amount"

                let demC = getCssletiable("--dem-bg").replace("rgb(", "").replace(")", "").split(",");
                let repC = getCssletiable("--rep-bg").replace("rgb(", "").replace(")", "").split(",");
                if (changes[state] > 0) {
                    rgb = [
                        lerp(parseInt(demC[0]), 255, 1-(changes[state])),
                        lerp(parseInt(demC[1]), 255, 1-(changes[state])),
                        lerp(parseInt(demC[2]), 255, 1-(changes[state]))
                    ]

                    let rgbString = "rgb(" + rgb.join(",") + ")"
                    stateImage.style.fill = rgbString;
                    
                    stateName.style.color = "var(--dem-bg)"
                    stateName.classList.add("dem")
                    stateAmount.classList.add("dem")
                    stateAmount.style["background-color"] = "var(--dem-bg)"
                    stateAmount.style.textAlign = "right"
                    stateDiv.appendChild(stateImage)
                    stateDiv.appendChild(stateName)
                    stateDiv.appendChild(stateAmount)
                }
                else {
                    rgb = [
                        lerp(255, parseInt(repC[0]), Math.abs(changes[state])),
                        lerp(255, parseInt(repC[1]), Math.abs(changes[state])),
                        lerp(255, parseInt(repC[2]), Math.abs(changes[state])),
                    ]

                    let rgbString = "rgb(" + rgb.join(",") + ")"
                    stateImage.style.fill = rgbString;

                    stateName.style.color = "var(--rep-bg)"
                    stateName.classList.add("rep")
                    stateAmount.classList.add("rep")
                    stateAmount.style["background-color"] = "var(--rep-bg)"
                    stateAmount.style.textAlign = "left"
                    stateDiv.appendChild(stateAmount)
                    stateDiv.appendChild(stateName)
                    stateDiv.appendChild(stateImage)
                }
                stateChangeContainer.appendChild(stateDiv)
            }

            currentLength = Object.keys(changes).length;
        }
    
    })
}


var toolTipEl = document.getElementById("el-map-tool-tip");
var ttHeader = toolTipEl.getElementsByClassName("header")[0];

function titleCase(str) {
    return str.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

function showToolTip(e) {
    toolTipEl.style.opacity = "1";
    var parentRect = document.getElementById("tooltip-container").getBoundingClientRect();
    var pathRect = e.target.getBoundingClientRect();

    var state = getKeyByValue(STATEABBR, e.target.id);
    ttHeader.getElementsByTagName("h4")[0].innerHTML = titleCase(state);
    ttHeader.getElementsByTagName("p")[0].innerHTML = EVNUMBERS[state] + " Electoral Votes"

    var bidenChance = CONDITIONAL_STATE_CHANCES[state];

    document.getElementById("tt-biden-chance").innerHTML = (Math.round(1000 * bidenChance) / 10) + "%";
    document.getElementById("tt-trump-chance").innerHTML = (Math.round(1000 * (1-bidenChance)) / 10) + "%";
    
    var statsBar = toolTipEl.getElementsByClassName("stats-bar")[0];
    setStatsBarSize(statsBar, bidenChance * 100)

    // Calculate the top and left positions
    var top = pathRect.top - parentRect.top;
    var left = pathRect.left - parentRect.left;

    left -= 0.5 * toolTipEl.scrollWidth;
    top -= toolTipEl.scrollHeight;

    left += pathRect["width"] / 2;
    top += 15;

    toolTipEl.style.left = left + "px";
    toolTipEl.style.top = top + "px";
}


document.addEventListener("mouseover", function(e) {
    if (e.target.tagName != "path") {
        toolTipEl.style.opacity = "0";
    }
})

function moveUp(el) {
    var parent = el.parentNode;
    parent.appendChild(el);
}

var paths = document.querySelectorAll("#map path");
for (var i = 0; i < paths.length; i++) {
    paths[i].addEventListener("mouseover", function(e) {
        moveUp(e.target);
        showToolTip(e);
    })
}

function EVTooltip(tooltipModel) {
    let tooltipEl = document.getElementById("ev-tooltip")

    if (!tooltipEl) {
        tooltipEl = document.createElement("div")
        tooltipEl.id = "ev-tooltip"
        document.body.appendChild(tooltipEl)
    }

    if (tooltipModel.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
    }

    tooltipEl.classList.remove('above', 'below', 'no-transform');
    if (tooltipModel.yAlign) {
        tooltipEl.classList.add(tooltipModel.yAlign);
    } else {
        tooltipEl.classList.add('no-transform');
    }
    if (tooltipModel.body) {
        map = document.createElement("div")
        map.style.width = "250px"
        map.style.display = "inline-block"
        let evs = document.createElement("h3")
        evs.class = "heading"
        evs.style.color = "white"
        let percentage = String((tooltipModel.body[0]["lines"][0].slice(23)/500).toFixed(2)) + "%"
        evs.innerHTML = tooltipModel.title[0] + " - " + percentage + " of simulations"
        map.appendChild(evs)
        if (SIMULATIONS_BY_EV[tooltipModel.title[0]]) {
            let svg = document.createElement("div")
            changed_US_SVG = US_SVG.slice(0,US_SVG.indexOf("width")) + 'width: "250px"' + (US_SVG.slice(US_SVG.indexOf("width")+11))
            svg.innerHTML = changed_US_SVG
            // svg.style.width = "250px"
            // svg.firstChild.width = "250px"
            
            let style = document.createElement("style")
            style.innerHTML = getMapCss(SIMULATIONS_BY_EV[tooltipModel.title[0]], id_prefix="#ev-tooltip ")
            map.appendChild(svg)
            map.appendChild(style)
        }
    }

    var position = this._chart.canvas.getBoundingClientRect();
    tooltipEl.style.opacity = 1;
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 20 + 'px';
    tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY - 200 + 'px';
    tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
    tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
    tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
    tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.backgroundColor = "rgba(0,0,0,0.7)"
    // tooltipEl.style.border = "2px solid white"
    tooltipEl.innerHTML = ""
    tooltipEl.appendChild(map)
}

function addBarEventListener() {
    let barTimeline = document.getElementById("bar-timeline");
    barTimeline.addEventListener("input", function() {
        loadHistogram(barTimeline.value)
        
        let barTimelineToday = document.getElementById("bar-timeline-today");
        let barTodayPos = ((1-(barTimeline.value/(TOTAL_ENTRIES-1))) * 0.43) + 0.25
        barTimelineToday.style.right = String(barTodayPos*100) + "%"
        
        let simDate = Object.keys(GLOBAL_DATA["dem_win_chance"])[barTimeline.value]
        simDate = simDate.slice(5, 7) + '/' + simDate.slice(8, 10) + " " + simDate.slice(11, 13) + "H"
        barTimelineToday.innerText = simDate
    })
}

function tippingPointStates() {

    let colorsList = document.getElementById("mapStyle").innerHTML.split("\n").slice(0,-1)
    let colorsDict = {}
    colorsList.forEach(string => {
        let key = string.substr(1,2)
        let color = string.slice(11, -1)
        colorsDict[key] = color
    })

    let stateTippingLikelyList = document.getElementsByClassName("state-likely-div")
    let stateTippingNonLikelyList = document.getElementsByClassName("state-non-likely-div")
    for (var i = 0; i < 11; i++){
        let data_arr = TIPPING_POINT_STATE_DATA[String(i)]
        if (STATEABBR[data_arr[0]]) {
            if (i < 6){
                stateTipping = stateTippingLikelyList[i]
            }
            else {
                stateTipping = stateTippingNonLikelyList[i-6]
            }

            stateTipping.style.display = "inline-block";
            stateTipping.style["margin-right"] = "150px"
            stateTipping.style["margin-left"] = "50px"
            stateTipping.style["margin-bottom"] = "10px"
            stateTipping.style["margin-top"] = "10px"

            let stateTippingDiv = document.createElement("div")
            let svg = STATE_SVGS[STATEABBR[data_arr[0]]]
            let percentage = document.createElement("p")
            percentageText = (data_arr[1]*100).toFixed(1)
            percentage.innerHTML = String(percentageText) + "%"
            percentage.className = "percentage"
            percentage.style.color = colorsDict[STATEABBR[data_arr[0]]]

            stateTippingDiv.style.display = "inline-block"
            stateTippingDiv.width = "500px"
            stateTippingDiv.innerHTML = svg
            stateTippingDiv.style.fill = colorsDict[STATEABBR[data_arr[0]]]
            stateTippingDiv.style["padding-top"] = "15px"

            stateTipping.appendChild(stateTippingDiv)
            stateTipping.appendChild(percentage)
        }
    }
}

function stateHeaderSelection(header) {
    let PVContainer = document.getElementById("pv-container")
    let chanceContainer = document.getElementById("chance-container")

    if (header == "pv") {
        graphMode = "pv"
        PVContainer.style["border-left"] = "none"
        PVContainer.style["border-bottom-left-radius"] = "0px"        
        PVContainer.style["border-bottom"] = "5px solid transparent"
        PVContainer.style["background-color"] = "var(--card-bg)"

        chanceContainer.style["border-right"] = "5px solid white"
        chanceContainer.style["border-bottom"] = "5px solid white"
        chanceContainer.style["border-bottom-left-radius"] = "0px"
        chanceContainer.style["border-bottom-right-radius"] = "15px"
        chanceContainer.style["background-color"] = "rgb(13,16,38)"

        loadStateLineChart("pv")
    }
    else {
        graphMode = "chance"
        chanceContainer.style["border-right"] = "none"
        chanceContainer.style["border-bottom-right-radius"] = "0px"        
        chanceContainer.style["border-bottom"] = "5px solid transparent"
        chanceContainer.style["background-color"] = "var(--card-bg)"
        
        PVContainer.style["border-left"] = "5px solid white"
        PVContainer.style["border-bottom"] = "5px solid white"
        PVContainer.style["border-bottom-left-radius"] = "15px"
        PVContainer.style["border-bottom-right-radius"] = "0px"
        PVContainer.style["background-color"] = "rgb(13,16,38)"

        loadStateLineChart("chance")
    }
}