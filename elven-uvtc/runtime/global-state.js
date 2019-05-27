const SAVE_KEY = "uvtc_save_data";
const GlobalState = new (function(){
    let lastSaveData = localStorage.getItem(SAVE_KEY);
    this.save = () => {
        const saveData = JSON.stringify(this.data);
        localStorage.setItem(SAVE_KEY,saveData)
        lastSaveData = saveData;
    }
    this.restore = () => {
        this.data = JSON.parse(lastSaveData);
    }
    if(ENV_FLAGS.CUSTOM_GLOBAL_STATE) {
        this.data = ENV_FLAGS.CUSTOM_GLOBAL_STATE;
        this.save();
        this.restore();
    } else if(lastSaveData) {
        this.restore();
    } else {
        this.data = {};
        lastSaveData = JSON.stringify(this.data);
    }
})();
export default GlobalState;
