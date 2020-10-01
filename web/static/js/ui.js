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


// function header_selection(headers, heading){
//     console.log(heading)
//     for (var event_index=0; event_index < 3; event_index++){
//         // console.log(event_index)
//         if (headers[event_index].classList.contains("non-active")){
//             // console.log(heading)
//             // console.log(headers[event_index])
//             if (heading == headers[event_index]){
//                 headers[event_index].classList.remove("non-active")
//             }
//         }
//         else {
//             if (heading != headers[event_index]){
//                 headers[event_index].classList.add("non-active")
//             }
//         }
//     }
// }

// console.log(document.getElementById("hamburger"))
// console.log(document.getElementsByClassName("heading"))
// for (var index=0; index < 3; index++){
//     headers = document.getElementsByClassName("heading");
//     var heading = headers[index];
//     heading.onclick = header_selection(headers, heading);
// }


var Menu = document.getElementById("menu");

function openMenu() {
    Menu.classList.remove("closed");
    Menu.classList.add("opened");
}

function closeMenu() {
    Menu.classList.remove("opened");
    Menu.classList.add("closed");
}