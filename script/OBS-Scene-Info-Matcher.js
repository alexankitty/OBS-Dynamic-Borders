async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

const obs = new OBSWebSocket();

class SceneItem {
    constructor(SceneItemMatch) {
        return ( async () => {
            this._events = {
                initialize: [],
                update: []
            };
            this.Match = SceneItemMatch
            this.initialize();
            this.registerOBS();
            await sleep(500);
            return this;
        })();
    }

    async initialize() {
        this.List = await this.MatchSceneItems(this.Match);
    }
    async update() {
        //run me if a change is detected.
        this.List = await this.MatchSceneItems(this.Match);
    }

    //Functions for pulling info
    async MatchSceneItems(match) {
        let outObj = new Object;
        let sceneName = await obs.call('GetCurrentProgramScene').then(data => {return data.currentProgramSceneName})
        let data = await obs.call("GetSceneItemList", {sceneName: sceneName});
        for(let i = 0; i < data.sceneItems.length; i++) {
            if(data.sceneItems[i].sourceName.toLowerCase().includes(match.toLowerCase())){
                outObj[data.sceneItems[i].sourceName] = data.sceneItems[i];
            }
        }
        return outObj;
    }
    
    async GetProperties(item) {
        let itemList = await this.MatchSceneItems(this.Match);
        return itemList[item];
    }

    //register listeners so our object can be autonomous
    async registerOBS() {
        let initList = ["SceneTransitionStarted", "SceneItemCreated", "SceneItemRemoved", "SceneItemListReindexed"]
        let updateList = ["SceneItemEnableStateChanged", "SceneItemTransformChanged"];
        initList.forEach(item => {
            obs.on(item, async () => {
                await this.initialize();
                this.emit("initialize")
            })
        });
        updateList.forEach(item => {
            obs.on(item, async () => {
                await this.update();
                this.emit("update");
            })
        });
    }

    on(name, listener) {
        if(!this._events[name]) this._events[name] = [];
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
    try {
        const {
        obsWebSocketVersion,
        negotiatedRpcVersion
        } = await obs.connect(address, password, {
        eventSubscriptions: 525311, //Bitwise OR of 1023 (all) and 524288 (1 << 19 scene item change intent)
        rpcVersion: 1
        });
        console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);
    } catch (error) {
        console.error('Failed to connect', error.code, error.message);
    }
}