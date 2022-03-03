const obs = new OBSWebSocket();


class SceneItem {
    constructor(SceneItemMatch) {
        this._events = {
            initialize: [],
            update: []
        };
        this.Match = SceneItemMatch
        this.initialize();
        this.registerOBS();
    }
    async initialize() {
        //run me again if the scene changes
        this.Items = {};
        this.List = await this.MatchSceneItems(this.Match);
        
        await this.update();
    }
    async update() {
        //run me if a change is detected.
        this.List.forEach(async item => {
            this.Items[item] = await this.GetProperties(item);
        })
    }

    //Functions for pulling info
    async MatchSceneItems(match) {
        let outArray = [];
        let data = await obs.send("GetSceneItemList")
        let x = 0;
        for(let i = 0; i < data.sceneItems.length; i++) {
            if(data.sceneItems[i].sourceName.toLowerCase().includes(match.toLowerCase())) 
            outArray[x++] = data.sceneItems[i].sourceName;
        }
        return outArray;
    }
    
    async GetProperties(item) {
        let itemProperties = await obs.send("GetSceneItemProperties",{
            item: item
        })
        return itemProperties;
    }

    //register listeners so our object can be autonomous
    async registerOBS() {
        let initList = ["SwitchScenes", "SourceCreated", "SourceDestroyed", "SourceRenamed"]
        let updateList = ["SceneItemVisibilityChanged", "SceneItemTransformChanged"];
        initList.forEach(item => {
            obs.on(item, async () => {
                console.log(item);
                await this.initialize();
                this.emit("initialize", this.Items)
            })
        });
        updateList.forEach(item => {
            obs.on(item, async () => {
                
                await this.update();
                this.emit("update", this.Items);
            })
        });
    }

    on(name, listener) {
        console.log(this._events);
        if(!this._events[name]) this._events[name] = [];
        console.log(this._events);
        this._events[name].push(listener);
    }

    off(name, listenerToRemove) {
        if (!this._events[name]) 
        throw new Error(`Can't remove a listener. Event "${name}" doesn't exits.`);
      
        const filterListeners = (listener) => listener !== listenerToRemove;
      
        this._events[name] = this._events[name].filter(filterListeners);
    }

    emit(name, data) {
        if (!this._events[name])
        throw new Error(`Can't emit an event. Event "${name}" doesn't exits.`);

        const fireCallbacks = (callback) => {
          callback(data);
        };
        this._events[name].forEach(fireCallbacks);
    }
    
}


async function connect(address, password){
    await obs.connect({
    address: address,
    password: password
  });
}

