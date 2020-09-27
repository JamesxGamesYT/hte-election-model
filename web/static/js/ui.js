document.getElementById("hamburger").addEventListener("click", function() {
    var ham = document.getElementById("hamburger");
    if (ham.classList.contains("is-active")) {
        ham.classList.remove("is-active");
        closeMenu();
    }
    else {
        ham.classList.add("is-active");
        openMenu();
    }
})


var Menu = document.getElementById("menu");

function openMenu() {
    Menu.classList.remove("closed");
    Menu.classList.add("opened");
}

function closeMenu() {
    Menu.classList.remove("opened");
    Menu.classList.add("closed");
}