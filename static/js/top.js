window.onscroll = function(){
    if(window.scrollY > 100){
        document.querySelector('.top').classList.add('show');
    }else{
        document.querySelector('.top').classList.remove('show');
    }
}
document.querySelector('.top').addEventListener('click',() => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});