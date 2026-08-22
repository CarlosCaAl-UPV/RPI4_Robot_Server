var cgJ = document.getElementById('cgJ');
var cgA = document.getElementById('cgA');
var cgS = document.getElementById('cgS');
var cgO = document.getElementById('cgO');
var cgN = document.getElementById('cgN');
var cgD = document.getElementById('cgD');
var cgE = document.getElementById('cgE');
var cgF = document.getElementById('cgF');
var cgM = document.getElementById('cgM');

var cbJ = document.getElementById('cbJ');
var cbA = document.getElementById('cbA');
var cbS = document.getElementById('cbS');
var cbO = document.getElementById('cbO');
var cbN = document.getElementById('cbN');
var cbD = document.getElementById('cbD');
var cbE = document.getElementById('cbE');
var cbF = document.getElementById('cbF');
var cbM = document.getElementById('cbM');

cbJ.addEventListener('click',cbfJ,false);
cbA.addEventListener('click',cbfA,false);
cbS.addEventListener('click',cbfS,false);
cbO.addEventListener('click',cbfO,false);
cbN.addEventListener('click',cbfN,false);
cbD.addEventListener('click',cbfD,false);
cbE.addEventListener('click',cbfE,false);
cbF.addEventListener('click',cbfF,false);
cbM.addEventListener('click',cbfM,false);

function cbfJ(){ calendar(cbJ,cgJ); }
function cbfA(){ calendar(cbA,cgA); }
function cbfS(){ calendar(cbS,cgS); }
function cbfO(){ calendar(cbO,cgO); }
function cbfN(){ calendar(cbN,cgN); }
function cbfD(){ calendar(cbD,cgD); }
function cbfE(){ calendar(cbE,cgE); }
function cbfF(){ calendar(cbF,cgF); }
function cbfM(){ calendar(cbM,cgM); }

function calendar(month,calendario){
    cbJ.style.background = "var(--color3)";
    cbA.style.background = "var(--color3)";
    cbS.style.background = "var(--color3)";
    cbO.style.background = "var(--color3)";
    cbN.style.background = "var(--color3)";
    cbD.style.background = "var(--color3)";
    cbE.style.background = "var(--color3)";
    cbF.style.background = "var(--color3)";
    cbM.style.background = "var(--color3)";
    month.style.background = "var(--color1)";
    cgJ.style.display = "none";
    cgA.style.display = "none";
    cgS.style.display = "none";
    cgO.style.display = "none";
    cgN.style.display = "none";
    cgD.style.display = "none";
    cgE.style.display = "none";
    cgF.style.display = "none";
    cgM.style.display = "none";
    calendario.style.display = "block";
}

cgJ.style.display = "block";
cbJ.style.background = "var(--color1)";