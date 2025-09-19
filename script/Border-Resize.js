var URLParams;
var bgMode;
var borderArr = [];
var borderItems ;
const pxoffset = "2.1vh";

function checkBgMode() {
    URLParams = new URLSearchParams(window.location.search);
    if(URLParams.get("bg")){
        bgMode = true;
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
        this.borderTop;
        this.borderBot;
        this.borderLeft;
        this.borderRight;
        this.hidden = hidden;
        this.createBorder();
    }

    createBorder() {
        this.borderDiv = document.createElement("div");
        this.borderWrap = document.createElement("div");
        this.borderTop = document.createElement("div");
        this.borderBot = document.createElement("div");
        this.borderLeft = document.createElement("div");
        this.borderRight = document.createElement("div");
        if(bgMode){
            this.borderDiv.classList.add("darken");
            this.borderWrap.classList.add("noborder")
        }
        else{
            this.borderWrap.classList.add("borderwrap");
            this.borderDiv.classList.add("border");
            this.borderTop.classList.add("borderTop");
            this.borderBot.classList.add("borderBot");
            this.borderLeft.classList.add("borderLeft");
            this.borderRight.classList.add("borderRight");
        }
        this.updateProperties();
        //add to the page
        document.body.appendChild(this.borderWrap);
        this.borderWrap.appendChild(this.borderDiv);
        this.borderWrap.appendChild(this.borderTop);
        this.borderWrap.appendChild(this.borderBot);
        this.borderWrap.appendChild(this.borderLeft);
        this.borderWrap.appendChild(this.borderRight);
    }

    setProperties(posX, posY, sizeX, sizeY, hidden, rotation){
        this.posX = posX;
        this.posY = posY;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.hidden = hidden;
        this.rotation = rotation
        this.updateProperties();
    }

    updateProperties(){
        //size and position
        this.borderWrap.style.width = `${this.sizeX - 1}px`;
        this.borderWrap.style.height = `${this.sizeY - 1}px`;
        this.borderWrap.style.left = `calc(${this.posX}px - ${pxoffset})`
        this.borderWrap.style.top = `calc(${this.posY }px - ${pxoffset})`
        this.borderWrap.style.transform = `rotate(${this.rotation}deg)`;
        this.borderWrap.style.transformOrigin = `${pxoffset} ${pxoffset}`;
        this.borderWrap.style.setProperty('--rotation', `${this.rotation * -1}deg`)
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
    let x = 0;
    let list = borderItems.List;
    Object.entries(list).forEach(async item => {
        item = item[0];// we only care about the array index here.
        let obj = borderItems.List[item].sceneItemTransform;
        let visible = borderItems.List[item].sceneItemEnabled;
        if(obj.width == 0 || visible == false)
            {
                borderArr[x++].setProperties(0,0,0,0,true);
                return;
            }
        let posX = obj.positionX;
        let posY = obj.positionY;
        let scaleX = obj.scaleX;
        let scaleY = obj.scaleY
        let cropTop = obj.cropTop;
        let cropBot = obj.cropBottom;
        let cropLeft = obj.cropLeft;
        let cropRight = obj.cropRight;
        let rotation = obj.rotation;
        let sizeX = Math.abs(obj.width) - ((cropLeft * Math.abs(scaleX)) + (cropRight * Math.abs(scaleX)));
        let sizeY = Math.abs(obj.height) - ((cropTop * Math.abs(scaleY)) + (cropBot * Math.abs(scaleY)));
        if(obj.width < 0) {//adjust if flipped
            posX -= sizeX;
        }
        if(obj.height < 0){
            posY -= sizeY;
        }
        borderArr[x++].setProperties(posX, posY, sizeX, sizeY, false, rotation);
    })

}

async function initBorder() {
    if(borderArr.length !== 0)
    for(let i = 0; i < borderArr.length; i++) {
        borderArr[i].destroy();
    }
    borderArr = []; //re-initialize
    for(let i = 0; i < Object.entries(borderItems.List).length; i++){
        borderArr[i] = new borderObj();
    }
    if(borderArr.length == 0){
        return;
    }
    updateBorder();
}

async function registerBorderUpdate(){
    checkBgMode();
    const password = "wBhhqDg8-9zg6u*&znN#nCc?";
    await connect('ws://127.0.0.1:4455', password)
    borderItems = await new SceneItem("+Border");
    initBorder();
    borderItems.on("initialize", initBorder);
    borderItems.on("update", updateBorder);
}


window.addEventListener("load", async() => {
    registerBorderUpdate();
});
