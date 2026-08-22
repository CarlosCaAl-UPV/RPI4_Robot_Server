var sbA = document.getElementById('sbA');
var sbB = document.getElementById('sbB');
var sbC = document.getElementById('sbC');
var sbD = document.getElementById('sbD');

var stA = document.getElementById('stA');
var stB = document.getElementById('stB');
var stC = document.getElementById('stC');
var stD = document.getElementById('stD');

sbA.addEventListener('click',sbfA,false);
sbB.addEventListener('click',sbfB,false);
sbC.addEventListener('click',sbfC,false);
sbD.addEventListener('click',sbfD,false);

function sbfA(){ func(sbA,stA); }
function sbfB(){ func(sbB,stB); }
function sbfC(){ func(sbC,stC); }
function sbfD(){ func(sbD,stD); }

function func(a,b){

    sbA.style.background = "var(--color3)";
    sbB.style.background = "var(--color3)";
    sbC.style.background = "var(--color3)";
    sbD.style.background = "var(--color3)";
    a.style.background = "var(--color1)";

    stA.style.display = "none";
    stB.style.display = "none";
    stC.style.display = "none";
    stD.style.display = "none";
    b.style.display = "block";
}

stA.style.display = "block";
sbA.style.background = "var(--color1)";