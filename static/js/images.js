class imagefield{
    constructor(tag,l){
        this.tag = tag;
        this.l = l;
        this.c = 0;
        this.last = 0;
        this.leftbtn = document.getElementById('leftbutton'+this.tag);
        this.rightbtn = document.getElementById('rightbutton'+this.tag);
        this.leftbtn.addEventListener('click',this.left.bind(this),false);
        this.rightbtn.addEventListener('click',this.right.bind(this),false);
        this.list = [];
        if(l >= 0){this.list.push(document.getElementById('image'+this.tag+'a'));}
        if(l >= 1){this.list.push(document.getElementById('image'+this.tag+'b'));}
        if(l >= 2){this.list.push(document.getElementById('image'+this.tag+'c'));}
        if(l >= 3){this.list.push(document.getElementById('image'+this.tag+'d'));}
        if(l >= 4){this.list.push(document.getElementById('image'+this.tag+'e'));}
        if(l >= 5){this.list.push(document.getElementById('image'+this.tag+'f'));}
        if(l >= 6){this.list.push(document.getElementById('image'+this.tag+'g'));}
        if(l >= 7){this.list.push(document.getElementById('image'+this.tag+'h'));}
        if(l >= 8){this.list.push(document.getElementById('image'+this.tag+'i'));}
        this.list[0].style.display = "inline-block";
    }
    left(){
        this.list[this.last].style.display = "none";
        this.c -= 1;
        if(this.c < 0){this.c = this.l;}
        this.last = this.c;
        this.list[this.last].style.display = "inline-block";
    }
    right(){
        this.list[this.last].style.display = "none";
        this.c += 1;
        if(this.c > this.l){this.c = 0;}
        this.last = this.c;
        this.list[this.last].style.display = "inline-block";
    }
}
let imagefield1 = new imagefield('1',8);
let imagefield2 = new imagefield('2',6);
let imagefield3 = new imagefield('3',3);
let imagefield4 = new imagefield('4',3);
let imagefield5 = new imagefield('5',2);
let imagefield6 = new imagefield('6',6);