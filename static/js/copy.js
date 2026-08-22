class copyfield{
    constructor(tag){
        this.tag = tag;
        var btn = document.getElementById('copybutton'+this.tag);
        btn.addEventListener('click',this.copiar.bind(this),false);
    }
    copiar(){
        var copytext = document.getElementById('copytext'+this.tag);
        var inputF = document.createElement('input');
        inputF.setAttribute("value",copytext.innerHTML);
        document.body.append(inputF);
        inputF.select();
        document.execCommand('copy');
        document.body.removeChild(inputF);
    }
}
let copyfield1 = new copyfield('1');
let copyfield2 = new copyfield('2');
let copyfield3 = new copyfield('3');
let copyfield4 = new copyfield('4');
let copyfield5 = new copyfield('5');
let copyfield6 = new copyfield('6');
let copyfield7 = new copyfield('7');
let copyfield8 = new copyfield('8');