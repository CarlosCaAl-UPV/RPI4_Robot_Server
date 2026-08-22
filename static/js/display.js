function display(tag){
    var btn = document.getElementById('display-btn'+tag);
    var element = document.getElementById('displayed'+tag);
    element.style.display = "none";
    var state = 0;
    btn.addEventListener('click',function(){
    if(state == 0){
        element.style.display = "inline-block";
        state = 1;
    }
    else{
        element.style.display = "none";
        state = 0;
    }
    },false);
}
display(1);
display(2);
display(3);