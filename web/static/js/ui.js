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



Headers = document.getElementsByClassName("heading")

function headerSelection(heading){
    for (var eventIndex = 0; eventIndex < 3; eventIndex++){
        if (Headers[eventIndex].classList.contains("non-active")){
            if (heading == Headers[eventIndex]){
                Headers[eventIndex].classList.remove("non-active")
            }
        }
        else {
            if (heading != Headers[eventIndex]){
                Headers[eventIndex].classList.add("non-active")
            }
        }
    }
}
