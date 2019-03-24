function WorldRenderer(startMapName) {

    this.camera = {
        x: 10,
        y: 10,
        xOffset: 0,
        yOffset: 0
    }

    const collisionTriggers = {
        3: true,
        4: true,
        5: true,
        6: true,
        7: true
    }
    const collisionTriggerOffset = -3;

    this.playerObject = null;
    this.popup = null;

    this.playerController = new PlayerController(this);

    let enterReleased = true;

    const playerInteractionLocked = () => {
        return this.popup ? true : false;
    }

    this.processKey = function(key) {
        if(this.popup) {
            switch(key) {
                case "Enter":
                    if(!enterReleased) {
                        break;
                    }
                    enterReleased = false;
                    this.popup.progress();
                    break;
            }
        } else if(this.playerObject) {
            if(key === "Enter") { 
                if(!enterReleased) {
                    return;
                } else {
                    enterReleased = false;
                }
            }
            this.playerController.processKey(key);
        } else if(key === "Enter") {
            enterReleased = false;
        }
    }
    this.processKeyUp = function(key) {
        switch(key) {
            case "Enter":
                enterReleased = true;
                break;
        }
        this.playerController.processKeyUp(key);
    }
    this.processMove = function(mouseX,mouseY) {
    }
    
    this.processClick = function(mouseX,mouseY) {
    }
    this.processClickEnd = function(mouseX,mouseY) {
        this.processMove(mouseX,mouseY);
    }

    this.clearTextPopup = () => {
        this.popup = null;
    }
    this.showTextPopupID = (ID,callback,...callbackParameters) => {
        this.popup = new WorldPopup(
            [getString(ID)],
            callback ? () => {
                this.clearTextPopup();
                callback(...callbackParameters);
            } : this.clearTextPopup
        );
    }
    this.showTextPopupsID = (IDs,callback,...callbackParameters) => {
        this.popup = new WorldPopup(
            IDs.map(id => getString(id)),
            callback ? () => {
                this.clearTextPopup();
                callback(...callbackParameters);
            } : this.clearTextPopup
        );
    }
    this.showTextPopup = (page,callback,...callbackParameters) => {
        this.popup = new WorldPopup(
            [page],
            callback ? () => {
                this.clearTextPopup();
                callback(...callbackParameters);
            } : this.clearTextPopup
        );
    }
    this.showTextPopups = (pages,callback,...callbackParameters) => {
        this.popup = new WorldPopup(
            pages,
            callback ? () => {
                this.clearTextPopup();
                callback(...callbackParameters);
            } : this.clearTextPopup
        );
    }
    this.showNamedTextPopupID = (ID,name,callback,...callbackParameters) => {
        this.popup = new WorldPopup(
            [getString(ID)],
            callback ? () => {
                this.clearTextPopup();
                callback(...callbackParameters);
            } : this.clearTextPopup,
            name
        );
    }
    this.showNamedTextPopupsID = (IDs,name,callback,...callbackParameters) => {
        this.popup = new WorldPopup(
            IDs.map(id => getString(id)),
            callback ? () => {
                this.clearTextPopup();
                callback(...callbackParameters);
            } : this.clearTextPopup,
            name
        );
    }

    this.showNamedTextPopup = (page,name,callback,...callbackParameters) => {
        this.popup = new WorldPopup(
            [page],
            callback ? () => {
                this.clearTextPopup();
                callback(...callbackParameters);
            } : this.clearTextPopup,
            name
        );
    }
    this.showNamedTextPopups = (pages,name,callback,...callbackParameters) => {
        this.popup = new WorldPopup(
            pages,
            callback ? () => {
                this.clearTextPopup();
                callback(...callbackParameters);
            } : this.clearTextPopup,
            name
        );
    }

    this.getTriggerState = function(x,y) {
        const collisionType = this.renderMap.collision[
            x + y * this.renderMap.columns
        ];
        if(collisionTriggers[collisionType]) {
            return collisionType + collisionTriggerOffset;
        }
        return null;
    }

    this.getCollisionState = function(x,y,ignoreNoCollide) {
        let mapCollision = this.renderMap.collision[
            x + y * this.renderMap.columns
        ];
        let objectCollision = this.objectsLookup[x][y];
        if(!ignoreNoCollide) {
            if((this.map.noCollide && this.map.noCollide[
                mapCollision
            ]) || collisionTriggers[
                mapCollision
            ])  {
                mapCollision = 0;
            }
            if(objectCollision && objectCollision.noCollide) {
                objectCollision = null;
            }
        } else if(collisionTriggers[mapCollision]) {
            mapCollision = 0;
        }
        return {
            map: mapCollision,
            object: objectCollision
        }
    }
    this.collides = function(x,y,exemptionID) {
        const collisionState = this.getCollisionState(x,y,false);
        if(exemptionID && collisionState.object) {
            if(exemptionID === collisionState.object.ID) {
                collisionState.object = null;
            }
        }
        return collisionState.map >= 1 || collisionState.object ? true : false;
    }

    const tileset = imageDictionary["world-tileset"];

    this.map = null;
    this.objects = {};
    this.objectsLookup = [];

    let lastID = 0;
    const getNextObjectID = function() {
        return `world_object_${lastID++}`;
    }

    this.getObject = function(objectID) {
        return this.objects[objectID];
    }
    this.getObjectID = function(object) {
        return object.ID;
    }

    this.addPlayer = function(x,y,...parameters) {
        const newPlayer = new PlayerRenderer(...parameters);
        this.playerObject = newPlayer;
        return this.addObject(newPlayer,x,y);
    }

    this.addObject = function(object,x,y) {
        const objectID = getNextObjectID();
        object.ID = objectID;
        if(!isNaN(x) && !isNaN(y)) {
            object.x = x;
            object.y = y;
        } else if(isNaN(object.x) || !isNaN(object.y)) {
            console.error("Error: An object was supplied to the world renderer without initial coordinates");
        }
        object.world = this;
        this.objects[objectID] = object;
        if(this.objectsLookup[object.x][object.y]) {
            console.error("Error: An object collision has occured through the add object method");
            console.log("Existing item",this.objectsLookup[object.x][object.y],"New item",object);
        }
        this.objectsLookup[object.x][object.y] = object;
        return objectID;
    }
    this.removeObject = function(objectID) {
        const object = this.objects[objectID];
        delete this.objects[objectID];
        this.objectsLookup[object.x][object.y] = null;
    }
    this.moveObject = function(objectID,newX,newY) {

        const object = this.objects[objectID];
        this.objectsLookup[object.x][object.y] = null;
        const oldX = object.x;
        const oldY = object.y;
        object.x = newX;
        object.y = newY;
        if(object.worldPositionUpdated) {
            object.worldPositionUpdated(oldX,oldY,newX,newY,this);
        }
        if(this.objectsLookup[object.x][object.y]) {
            console.error("Error: An object collision has occured through the move object method");
            console.log("Existing item",this.objectsLookup[object.x][object.y],"New item",object);
        }
        this.objectsLookup[object.x][object.y] = object;
    }

    this.decals = [];
    this.addDecal = decal => {
        this.decals[decal.x][decal.y] = decal;
    }
    this.removeDecal = decal => {
        this.decals[decal.x][decal.y] = null;
    }

    this.updateMap = function(newMapName,data={}) {
        if(this.renderMap) {
            data.sourceRoom = this.renderMap.name;
        }
        const newMap = worldMaps[newMapName];
        if(this.map && this.map.unload) {
            this.map.unload(this);
        }
        this.decals = [];
        this.objects = {};
        this.playerObject = null;
        this.map = newMap.WorldState ? new newMap.WorldState(
            this,null,data //TODO provide a global state to the world state generator
        ) : {};
        if(newMap.cameraStart) {
            this.camera.x = newMap.cameraStart.x;
            this.camera.y = newMap.cameraStart.y;
        }
        this.renderMap = newMap;
        this.objectsLookup = [];

        for(let y = 0;y < newMap.columns;y++) {
            const newRow = [];
            const newDecalRow = [];
            for(let x = 0;x < newMap.rows;x++) {
                newRow[x] = null;
                newDecalRow[x] = null;
            }
            this.objectsLookup[y] = newRow;
            this.decals[y] = newDecalRow;
        }
        if(this.map.load) {
            this.map.load(this);
        }
        if(this.map.getCameraStart) {
            this.camera = this.map.getCameraStart(this);
        }

        this.playerController.player = this.playerObject;
    }


    let horizontalTiles, verticalTiles, horizontalOffset, verticalOffset, verticalTileSize, horizontalTileSize, halfHorizontalTiles, halfVerticalTiles;

    this.disableAdapativeFill = true;

    this.updateSize = function() {

        let adjustedTileSize = WorldTileSize;

        if(fullWidth < smallScaleSnapPoint) {
            adjustedTileSize *= 1.5;
        } else if(fullWidth < mediumScaleSnapPoint && fullWidth < maxHorizontalResolution) {
            adjustedTileSize *= 2;
        } else if(fullWidth >= maxHorizontalResolution) {
            adjustedTileSize *= 2;
        }

        adjustedTileSize = Math.floor(adjustedTileSize);
        if(adjustedTileSize % 2 !== 0) {
            adjustedTileSize++;
        }

        horizontalTileSize = adjustedTileSize;
        verticalTileSize = adjustedTileSize;

        horizontalTiles =  Math.ceil(fullWidth / horizontalTileSize);
        verticalTiles = Math.ceil(fullHeight / verticalTileSize);

        if(horizontalTiles % 2 === 0) {
            horizontalTiles++;
        }
        if(verticalTiles % 2 === 0) {
            verticalTiles++;
        }

        horizontalOffset = Math.round(halfWidth - horizontalTiles * horizontalTileSize / 2);
        verticalOffset = Math.round(halfHeight - verticalTiles * verticalTileSize / 2);
        
        halfHorizontalTiles = Math.floor(horizontalTiles / 2);
        halfVerticalTiles = Math.floor(verticalTiles / 2);
    }

    this.updateMap(startMapName);

    this.render = function(timestamp) {

        const movementLocked = playerInteractionLocked();

        if(!movementLocked && this.playerController.renderMethod) {
            this.playerController.renderMethod(timestamp);
        }

        if(this.playerObject) {
            this.camera.x = this.playerObject.x;
            this.camera.y = this.playerObject.y;
            this.camera.xOffset = this.playerObject.xOffset;
            this.camera.yOffset = this.playerObject.yOffset;
            this.playerObject.walkingOverride = movementLocked;

            if(this.renderMap.useCameraPadding) {
                const abolsuteCameraX = this.camera.x + this.camera.xOffset;
                const absoluteCameraY = this.camera.y+ this.camera.yOffset;

                if(abolsuteCameraX - halfHorizontalTiles < 0) {
                    this.camera.x = halfHorizontalTiles;
                    this.camera.xOffset = 0;   
                } else if(abolsuteCameraX + halfHorizontalTiles > this.renderMap.horizontalUpperBound) {
                    this.camera.x = this.renderMap.horizontalUpperBound - halfHorizontalTiles;
                    this.camera.xOffset = 0;
                }

                if(absoluteCameraY - halfVerticalTiles < 0) {
                    this.camera.y = halfVerticalTiles;
                    this.camera.yOffset = 0;
                } else if(absoluteCameraY + halfVerticalTiles > this.renderMap.verticalUpperBound) {
                    this.camera.y = this.renderMap.verticalUpperBound - halfVerticalTiles;
                    this.camera.yOffset = 0;
                }
            }
        }

        context.fillStyle = "black";
        context.fillRect(0,0,fullWidth,fullHeight);

        let verticalTileCount = verticalTiles;
        let horizontalTileCount = horizontalTiles;

        let adjustedYPos = this.camera.y - halfVerticalTiles;
        let adjustedXPos = this.camera.x - halfHorizontalTiles;

        let xStart = 0;
        let yStart = 0;

        if(this.camera.xOffset < 0) {
            xStart--;
        } else if(this.camera.xOffset > 0) {
            xStart--;
            horizontalTileCount++;
        }

        if(this.camera.yOffset < 0) {
            yStart--;
        } else if(this.camera.yOffset > 0) {
            yStart--;
            verticalTileCount++;
        }

        const xOffset = horizontalOffset - Math.round(this.camera.xOffset * horizontalTileSize);
        const yOffset = verticalOffset - Math.round(this.camera.yOffset * verticalTileSize);

        const objectBuffer = [];

        let y = yStart, x;

        while(y < verticalTileCount) {
            x = xStart;

            while(x < horizontalTileCount) {

                const xPos = adjustedXPos + x;
                const yPos = adjustedYPos + y;

                if(xPos < this.renderMap.columns && xPos >= 0) {
                    const mapIndex = xPos + yPos * this.renderMap.columns;
                    
                    const backgroundValue = this.renderMap.background[mapIndex];
                    const foregroundValue = this.renderMap.foreground[mapIndex];
    
                    const xDestination = xOffset + x * horizontalTileSize;
                    const yDestination = yOffset + y * verticalTileSize;
    
                    if(backgroundValue > 0) {
                        const textureX = backgroundValue % WorldTextureColumns * WorldTextureSize;
                        const textureY = Math.floor(backgroundValue / WorldTextureColumns) * WorldTextureSize;
                        context.drawImage(
                            tileset,
                            textureX,textureY,WorldTextureSize,WorldTextureSize,
                            xDestination,yDestination,horizontalTileSize,verticalTileSize
                        );
                    }
                    if(foregroundValue > 0) {
                        const textureX = foregroundValue % WorldTextureColumns * WorldTextureSize;
                        const textureY = Math.floor(foregroundValue / WorldTextureColumns) * WorldTextureSize;
                        context.drawImage(
                            tileset,
                            textureX,textureY,WorldTextureSize,WorldTextureSize,
                            xDestination,yDestination,horizontalTileSize,verticalTileSize
                        );
                    }

                    const decalRegister = this.decals[xPos][yPos];
                    if(decalRegister) {
                        objectBuffer.push(decalRegister,xDestination,yDestination);
                    }
                    const objectRegister = this.objectsLookup[xPos][yPos];
                    if(objectRegister) {
                        objectBuffer.push(objectRegister,xDestination,yDestination);
                    }

                }
                x++;
            }
            y++;
        }
        let objectBufferIndex = 0;
        while(objectBufferIndex < objectBuffer.length) {
            objectBuffer[objectBufferIndex].render(
                timestamp,
                objectBuffer[objectBufferIndex+1],
                objectBuffer[objectBufferIndex+2],
                horizontalTileSize,
                verticalTileSize
            );
            objectBufferIndex += 3;
        }
        if(this.popup) {
            this.popup.render(timestamp);
        }
    }
}
