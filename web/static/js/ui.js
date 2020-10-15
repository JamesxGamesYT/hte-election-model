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


function header_selection(heading){
    headers = document.getElementsByClassName("heading")
    for (let event_index=0; event_index < 4; event_index++){
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

function setStatsBarSize(statsBar, width, dVal, rVal) {
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
            heading["id"] = "state-heading"
            heading["class"] = "timeline"
            heading.innerText = "State Changes"
            heading.style.color = "white";
            heading.style["font-size"] = "35px";
            heading.style["margin-top"] = "40px"
            heading.style["margin-bottom"] = "30px"
            // heading.style.width = "1000px"
            document.getElementById("map-wrapper").insertBefore(heading, stateChangeContainer)
            
            explainer = document.createElement("p")
            explainer["id"] = "explainer"
            explainer.style.color = "white";
            explainer.style["margin-top"] = "30px"
            explainer.style["margin-bottom"] = "50px"
            explainer.style["font-size"] = "25px";
            explainer.innerText = "From " + beforeTime + " to " + afterTime + ", how did Democrats' state chances change?"
            document.getElementById("map-wrapper").insertBefore(explainer, stateChangeContainer)
        }

        if (explainer) {
            explainer.remove()
            explainer = document.createElement("p")
            explainer["id"] = "explainer"
            explainer.style.color = "white";
            explainer.style["margin-top"] = "30px"
            explainer.style["margin-bottom"] = "50px"
            explainer.style["font-size"] = "25px";
            explainer.innerText = "From " + beforeTime + " to " + afterTime + ", how did Democrats' state chances change?"
            document.getElementById("map-wrapper").insertBefore(explainer, stateChangeContainer)
        }
        

        let noChanges = document.getElementById("no-changes")
        if (!noChanges && !stateHeading) {
            let noChanges = document.createElement("h4")
            noChanges["id"] = "no-changes"
            noChanges.innerText = "No signficant changes"
            noChanges.style.color = "white";
            noChanges.style["font-size"] = "25px";
            noChanges.style["margin-top"] = "15px"
            stateChangeContainer.appendChild(noChanges)
        }
        else if (Object.keys(changes).length == 0){
            while (stateChangeContainer.firstChild.nextSibling) {
                stateChangeContainer.removeChild(stateChangeContainer.lastChild);
            }
            // noChanges.remove()
            noChanges = document.createElement("h4")
            noChanges["id"] = "no-changes"
            noChanges.innerText = "No signficant changes"
            noChanges.style.color = "white";
            noChanges.style["font-size"] = "25px";
            noChanges.style["margin-top"] = "20px"
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
                console.log(top)
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
                    console.log(rgb)
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
                    console.log(1+changes[state])
                    rgb = [
                        lerp(255, parseInt(repC[0]), Math.abs(changes[state])),
                        lerp(255, parseInt(repC[1]), Math.abs(changes[state])),
                        lerp(255, parseInt(repC[2]), Math.abs(changes[state])),
                    ]
                    console.log(rgb)
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
                    console.log(stateImage.style)
                }
                stateChangeContainer.appendChild(stateDiv)
            }

            currentLength = Object.keys(changes).length;
        }
    
    })
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
    console.log(colorsDict)
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
            console.log(i-6)
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
            percentage.style.display = "inline-block"
            percentage.style["font-size"] = "50px"
            percentage.style["margin-top"] = "20px"
            percentage.style["margin-left"] = "15px"
            percentage.style.position = "absolute"
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