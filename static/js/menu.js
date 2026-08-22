var btn = document.getElementById('display-menu');
btn.addEventListener('click',show,false);
var state = 0;

function show(){
    var menu = document.getElementById('move');
    var menubar = document.getElementById('menubar');
    if(state == 0){
        menu.style.display = "inline-block";
        state = 1;
        estilo = document.querySelector(':root');
        estilo.style.setProperty('--color1','red')
        menubar.style.width = "94%";
    }
    else{
        menu.style.display = "none";
        menubar.style.width = "0%";
        state = 0;
    }
}
