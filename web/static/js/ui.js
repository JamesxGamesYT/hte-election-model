var Ham = document.getElementById("hamburger");
var Overlay = document.getElementById("menu-overlay");

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


var Menu = document.getElementById("menu");

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
    for (var event_index=0; event_index < 3; event_index++){
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
}

function setStatsBarSize(statsBar, width, dVal, rVal) {
    statsBar.getElementsByClassName("biden")[0].style.width = "calc(" + width + "% - 2px)"
    statsBar.getElementsByClassName("trump")[0].style.width = "calc(" + (100 - width) + "% - 2px";
}


function animateMethodology() {
    var elements;
    var windowHeight;

    function checkResize() {
        windowHeight = window.innerHeight
        elements = document.querySelectorAll('.hidden')
    }

    function checkPosition() {
        for (var i = 0; i < elements.length; i++) {
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
    var mapTimeline = document.getElementById("map-timeline");

    mapTimeline.addEventListener("input", function() {
        var mapStyle = document.getElementById("mapStyle");
        mapStyle.innerHTML = getMapCss(GetNthEntry(GLOBAL_DATA["state_chances"], mapTimeline.value));
    })
}