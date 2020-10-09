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
    mapTimeline.addEventListener("input", function() {
        let mapStyle = document.getElementById("mapStyle");
        mapStyle.innerHTML = getMapCss(GetNthEntry(GLOBAL_DATA["state_chances"], mapTimeline.value));
        
        let timelineToday = document.getElementById("line-timeline-today");
        let lineTodayPos = ((1-(mapTimeline.value/(TOTAL_ENTRIES-1))) * 0.7) + 0.07
        timelineToday.style.right = String(lineTodayPos*100) + "%"
        
        let simDate = Object.keys(GLOBAL_DATA["dem_win_chance"])[mapTimeline.value]
        simDate = simDate.slice(5, 7) + '/' + simDate.slice(8, 10) + " " + simDate.slice(11, 13) + "H"
        timelineToday.innerText = simDate
        console.log(timelineToday.innerText)
    })
}

function addBarEventListener() {
    let barTimeline = document.getElementById("bar-timeline");
    barTimeline.addEventListener("input", function() {
        loadHistogram(barTimeline.value)
        
        let barTimelineToday = document.getElementById("bar-timeline-today");
        let barTodayPos = ((1-(barTimeline.value/(TOTAL_ENTRIES-1))) * 0.75) + 0.05
        barTimelineToday.style.right = String(barTodayPos*100) + "%"
        
        let simDate = Object.keys(GLOBAL_DATA["dem_win_chance"])[barTimeline.value]
        simDate = simDate.slice(5, 7) + '/' + simDate.slice(8, 10) + " " + simDate.slice(11, 13) + "H"
        barTimelineToday.innerText = simDate
    })
}