function MultiLayer() {
    let layers = [];
    let layerSize;
    let layersLookup = {};
    let nextID = 0;
    const cacheLayers = () => {
        layers = Object.values(layersLookup);
        layerSize = layers.length;
    }
    this.addLayer = layer => {
        let ID = nextID++;
        layer.terminate = this.removeLayer.bind(this,ID);
        layersLookup[ID] = layer;
        cacheLayers();
        return ID;
    }
    this.removeLayer = ID => {
        delete layersLookup[ID];
        cacheLayers();
    }
    this.render = timestamp => {
        for(let i = 0;i<layerSize;i++) {
            layers[i].render(timestamp);
        }
    }
}
export default MultiLayer;