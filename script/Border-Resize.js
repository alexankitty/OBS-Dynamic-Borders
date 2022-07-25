var URLParams;
var bgMode;
var borderArr = [];
var borderItems ;
const pxoffset = 25;

function checkBgMode() {
    URLParams = new URLSearchParams(window.location.search);
    if(URLParams.get("bg")){
        bgMode = true;
    }
}

class Utilities {
	static sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

class borderObj {
    constructor(posX, posY, sizeX, sizeY, hidden){
        this.posX = posX;
        this.posY = posY;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.borderDiv;
        this.borderWrap;
        this.hidden = hidden;
        this.createBorder();
    }

    createBorder() {
        this.borderDiv = document.createElement("div");
        this.borderWrap = document.createElement("div");
        if(bgMode){
            this.borderDiv.classList.add("darken");
            this.borderWrap.classList.add("noborder")
        }
        else{
            this.borderWrap.classList.add("borderwrap");
            this.borderDiv.classList.add("border");
        }
        this.updateProperties();
        //add to the page
        document.body.appendChild(this.borderWrap);
        this.borderWrap.appendChild(this.borderDiv);
    }

    setProperties(posX, posY, sizeX, sizeY, hidden){
        this.posX = posX;
        this.posY = posY;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.hidden = hidden;
        this.updateProperties();
    }

    updateProperties(){
        //size and position
        this.borderWrap.style.width = `${this.sizeX - 1}px`;
        this.borderWrap.style.height = `${this.sizeY - 1}px`;
        this.borderWrap.style.left = `${this.posX - pxoffset}px`
        this.borderWrap.style.top = `${this.posY - pxoffset}px`
        if(!this.hidden)
        this.borderWrap.style.display = "unset";
        if(this.hidden)
        this.borderWrap.style.display = "none";
    }

    destroy() {
        this.borderWrap.remove();
    }
}

async function updateBorder(){
    await Utilities.sleep(20);//hack: takes a little too long to get data from OBS
    let x = 0;
    let list = borderItems.List;
    list.forEach(async item => {
        let obj = borderItems.Items[item];
        if(obj.width == 0 || await obj.visible == false)
            {
                borderArr[x++].setProperties(0,0,0,0,true);
                return;
            }
        let posX = obj.position.x;
        let posY = obj.position.y;
        let sizeX = Math.abs(obj.width) - ((obj.crop.left * Math.abs(obj.scale.x)) + (obj.crop.right * Math.abs(obj.scale.x)));
        let sizeY = Math.abs(obj.height) - ((obj.crop.top * Math.abs(obj.scale.y)) + (obj.crop.bottom * Math.abs(obj.scale.y)));
        if(obj.width < 0) {//adjust if flipped
            posX -= sizeX;
        }
        if(obj.height < 0){
            posY -= sizeY;
        }
        console.log(obj);
        console.log(posX);
        console.log(posY);
        console.log(sizeX);
        console.log(sizeY);
        borderArr[x++].setProperties(posX, posY, sizeX, sizeY, false);
    })

}

async function initBorder() {
    await Utilities.sleep(20);//hack: takes a little too long to get data from OBS
    if(borderArr.length !== 0)
    for(let i = 0; i < borderArr.length; i++) {
        borderArr[i].destroy();
    }
    borderArr = []; //re-initialize
    for(let i = 0; i < borderItems.List.length; i++){
        borderArr[i] = new borderObj();
    }
    if(borderArr.length == 0)
    return;
    updateBorder();
    console.log("border reset");
}

async function registerBorderUpdate(){
    checkBgMode();
    const password = "wBhhqDg8-9zg6u*&znN#nCc?";
    await connect("127.0.0.1:4444", password)
    borderItems = new SceneItem("+Border");
    initBorder();
    borderItems.on("initialize", initBorder);
    borderItems.on("update", updateBorder);
}

registerBorderUpdate();