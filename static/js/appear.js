function appear(tag,time,d){
    var a = document.getElementById('appear'+tag);
    var c = document.getElementById('appear-content'+tag);
    setTimeout(function(){
        a.style.display = "inline-block";
        a.style.width = "1px";
        a.style.height = "1px";
    },time);
    setTimeout(function(){
        a.style.width = "5px";
        a.style.height = "5px";
    },time+d);
    setTimeout(function(){
        a.style.width = "10px";
        a.style.height = "10px";
    },time+d*2);
    setTimeout(function(){
        a.style.width = "18px";
        a.style.height = "18px";
    },time+d*2.5);
    setTimeout(function(){
        a.style.width = "30px";
        a.style.height = "30px";
    },time+d*3);
    setTimeout(function(){
        a.style.width = "44px";
        a.style.height = "44px";
    },time+d*3.5);
    setTimeout(function(){
        a.style.width = "60px";
        a.style.height = "60px";
    },time+d*4);
    setTimeout(function(){
        a.style.width = "78px";
        a.style.height = "78px";
    },time+d*4.5);
    setTimeout(function(){
        a.style.width = "100px";
        a.style.height = "100px";
    },time+d*5);
    setTimeout(function(){
        a.style.width = "130px";
        a.style.height = "130px";
    },time+d*5.5);
    setTimeout(function(){
        a.style.width = "160px";
        a.style.height = "160px";
        c.style.display = "inline";
    },time+d*6);
    setTimeout(function(){
        a.style.width = "155px";
        a.style.height = "155px";
    },time+d*6.5);
    setTimeout(function(){
        a.style.width = "148px";
        a.style.height = "148px";
    },time+d*7);
    setTimeout(function(){
        a.style.width = "140px";
        a.style.height = "140px";
    },time+d*7.5);
}
appear('1',1000,80)
appear('2',1600,80)
appear('3',2200,80)
appear('4',2800,80)
appear('5',3400,80)