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