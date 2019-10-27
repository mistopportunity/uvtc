import PlayerController from "../runtime/player-controller.js";
import { PlayerRenderer, SpriteRenderer, ElfRenderer } from "./components/world/sprite.js";
import TileSprite from "./components/world/tile-sprite.js";
import WorldPopup from "./components/world/popup.js";
import WorldPrompt from "./components/world/prompt.js";
import GlobalState from "../runtime/global-state.js";
import GetOverworldCharacter from "../runtime/character-creator.js";
import WorldUIRenderer from "./world-ui.js";
import UIAlert from "./components/ui-alert.js";
import MovesManager from "../runtime/moves-manager.js";
import MovePreview from "./components/world/move-preview.js";
import ChapterPreview from "./components/world/chapter-preview.js";
import Moves from "../runtime/battle/moves.js";
import Chapters from "../runtime/chapters.js";
import BattleFaderEffect from "./components/battle-fader-effect.js";
import ChapterManager from "../runtime/chapter-manager.js";
import MainMenuRenderer from "./main-menu.js";
import ElvesFillIn from "./components/elves-fill-in.js";
import {FadeIn,FadeOut} from "./components/world/fade.js";
import ObjectiveHUD from "./components/world/objective-hud.js";
import BoxFaderEffect from "./components/box-fader-effect.js";
import ApplyTimeoutManager from "./components/inline-timeout.js";
import FistBattleRenderer from "./fist-battle.js";
import MultiLayer from "./components/multi-layer.js";
import FastStaticWrapper from "./components/fast-static-wrapper.js";
import LightSprite from "./components/world/light-sprite.js";
import GetLightTableReferences from "./components/world/light-table.js";
import PsuedoSpriteWrapper from "./components/world/psuedo-sprite-wrapper.js";
import WorldSongController from "./components/world/song-controller.js";
import MoveSprite from "./components/world/sprite-mover.js";
import CustomWorldLoader from "./components/world/custom-loader.js";

const FILM_GRAIN_EFFECT = new FastStaticWrapper(1,()=>{
    const shade = Math.floor(256 * Math.random());
    return `rgba(${shade},${shade},${shade},0.1)`;
},maxHorizontalResolution*2,4,100);

const CHAPTER_NAME_LOOKUP = [
    "an impossible chapter that cannot exist",
    "one","two","three","four","five","six",
    "seven","eight","nine","ten","eleven",
    "twelve","thirteen","fourteen",
    "fifteen","sixteen","seventeen"
];

const ALERT_TIME = 1000;
const ANIMATION_TILE_COUNT = 5;
const ANIMATION_CYCLE_DURATION = 400;
const ANIMATION_FRAME_TIME = ANIMATION_CYCLE_DURATION / ANIMATION_TILE_COUNT;
const POPUP_TIMEOUT = 150;
const NEGATIVE_INFINITY_BUT_NOT_REALLY = -1000000;
const FINAL_CHAPTER_NUMBER = 12;
const CHAPTER_COMPLETE_SOUND_SOUND_BY_DEFAULT = false;
const TILESET_NAME = "world-tileset";
const SPECIAL_COLLISION_START = 28;
const COLLISION_TRIGGER_OFFSET = -2;
const IS_ZERO_FILTER = value => value === 0;

const COLLISTION_TRIGGERS = {
    3:true,4:true,5:true,6:true,7:true
};

const getDefaultChapterState = () => {
    return {
        load: null,
        mapChanged: null,
        unload: null
    };
};
const getDefaultCamera = () => {
    return {
        x: 10,
        y: 10,
        xOffset: 0,
        yOffset: 0
    };
};

function WorldRenderer() {
    this.allowKeysDuringPause = true;
    this.disableAdaptiveFill = true;
    this.noPixelScale = true;
    let tileset = imageDictionary[TILESET_NAME];
    let alert = null;
    let objectiveHUD = null;
    let internalPlayerObject = null;
    this.pendingPlayerObject = null;
    this.map = null;
    this.objects = {};
    this.objectsLookup = [];
    let offscreenObjects = [];
    let offscreenObjectCount = 0;
    let lastID = 0;
    let cameraXFollowEnabled = true;
    let cameraYFollowEnabled = true;
    let backgroundRenderer = null;
    let lightTable;
    let refreshLightTable;
    this.popup = null;
    this.prompt = null;
    let lightingLayerActive = false;
    let playerMovementLocked = false;
    const escapeMenu = new WorldUIRenderer(this);
    let escapeMenuShown = false;
    this.escapeMenuDisabled = false;
    let wDown = false;
    let sDown = false;
    let aDown = false;
    let dDown = false;
    let enterReleased = true;
    this.popupProgressEnabled = true;
    let horizontalTiles,     verticalTiles,
    horizontalOffset,    verticalOffset,
    tileSize,
    halfHorizontalTiles, halfVerticalTiles;

    this.cameraFrozen = false;
    this.fixedCameraOverride = false;
    this.followObject = null;
    this.postProcessor = new PostProcessor(0.25);
    this.compositeProcessor = null;

    CustomWorldLoader.apply(this);
    WorldSongController.apply(this);
    ApplyTimeoutManager(this);
    this.moveSprite = MoveSprite.bind(this);

    this.movesManager = MovesManager;
    this.chapterManager = ChapterManager;
    this.camera = getDefaultCamera();
    const customRendererStackIDLIFO = [];
    const customRendererStack = new MultiLayer();

    this.playerController = new PlayerController(this);
    let lastPopupCleared = NEGATIVE_INFINITY_BUT_NOT_REALLY;
    let tileRenderingEnabled = true;
    this.decals = [];

    (function(){
        const references = GetLightTableReferences();
        lightTable = references.table;
        refreshLightTable = references.updateSize;
    })();

    const activeChapter = GlobalState.data.activeChapter;
    const chapter = Chapters[activeChapter-1];
    const chapterName = `chapter ${CHAPTER_NAME_LOOKUP[activeChapter]}`;
    let chapterState = null;
    if(chapter.chapterState) {
        chapterState = new chapter.chapterState();
    } else {
        chapterState = getDefaultChapterState();
    }

    this.tileSprite = PsuedoSpriteWrapper(this,TileSprite);
    this.lightSprite = PsuedoSpriteWrapper(this,LightSprite,lightTable);
    this.sprite = SpriteRenderer;
    this.elfSprite = ElfRenderer;
    this.getTileSprite = tileID => new this.tileSprite(tileID);
    this.getLightSprite = lightID => new this.lightSprite(lightID);
    this.getCharacter = (name,direction) => GetOverworldCharacter(this,name,direction,false);
    this.getStaticCharacter = name => GetOverworldCharacter(this,name,null,true);

    Object.defineProperty(this,"filmGrainEffect",{
        get: function(){return FILM_GRAIN_EFFECT}
    });
    Object.defineProperty(this,"activeChapter",{
        get: function() {return activeChapter}
    });
    Object.defineProperty(this,"chapterName",{
        get: function() {return chapterName}
    });
    Object.defineProperty(this,"chapter",{
        get: function() {return chapter}
    });
    Object.defineProperty(this,"chapterState",{
        get: function() {return chapterState}
    });
    Object.defineProperty(this,"globalState",{
        get: function() {return GlobalState.data}
    });
    Object.defineProperty(this,"playerObject",{
        get: function() {
            if(this.pendingPlayerObject) {
                return this.pendingPlayerObject;
            } else {
                return internalPlayerObject;
            }
        },
        set: function(value) {
            internalPlayerObject = value;
            this.playerController.player = value;
        }
    });

    this.showAlert = (message,duration=ALERT_TIME,noSound=false) => {
        alert = new UIAlert(message.toLowerCase(),duration,noSound);
    }
    this.clearAlert = () => {
        alert = null;
    }
    const safeFade = (duration,fadeIn) => {
        return new Promise(resolve => {
            const fader = fadeIn ? FadeIn : FadeOut;
            let ID;
            ID = this.addCustomRenderer(new fader(duration,null,()=>{
                resolve(ID);
            }));
        });
    }
    this.setObjectiveHUD = (...parameters) => {
        objectiveHUD = new ObjectiveHUD(this,...parameters);
        return objectiveHUD;
    }
    this.clearObjectiveHUD = () => {
        objectiveHUD = null;
    }
    this.fadeFromBlack = async duration => {
        return safeFade(duration,true);
    }
    this.fadeToBlack = async duration => {
        return safeFade(duration,false);
    }
    this.managedFaderTransition = (...parameters) => {
        this.postProcessor.terminate();
        if(this.map.unload) {
            this.map.unload(this);
        }
        if(chapterState.unload) {
            chapterState.unload(this);
        }
        this.fader.fadeOut(...parameters);
    }
    this.chapterComplete = async (noSound=!CHAPTER_COMPLETE_SOUND_SOUND_BY_DEFAULT) => {
        const method = noSound ? this.showInstantPopup : this.showInstantPopupSound;
        this.addCustomRenderer(new FadeOut(2000));
        this.addCustomRenderer(new ChapterPreview(activeChapter,this.getItemPreviewBounds));
        ChapterManager.setActiveChapterCompleted();
        let message = null;
        if(activeChapter === FINAL_CHAPTER_NUMBER) {
            message = `Good job. This is it. Your journey has reached its end... Or is this merely the beginning?`;
        } else {
            message = `Good job. You completed ${chapterName}! Onwards and upwards...`;
        }
        setFaderEffectsRenderer(new BoxFaderEffect());
        faderEffectsRenderer.fillInLayer = new ElvesFillIn();

        await method(message);
        this.managedFaderTransition(MainMenuRenderer,true);
    }
    this.saveState = (withPositionData=true,skipGlobal=false) => {
        if(withPositionData && internalPlayerObject) {
            GlobalState.data["last_map"] = this.renderMap.name;
            GlobalState.data["last_player_pos"] = {
                d: internalPlayerObject.direction,
                x: Math.round(internalPlayerObject.x + internalPlayerObject.xOffset),
                y: Math.round(internalPlayerObject.y + internalPlayerObject.yOffset)
            }
        }
        if(!skipGlobal) {
            GlobalState.save();
        }
    };
    this.restoreState = (ignorePositionData=false) => {
        GlobalState.restore();
        if(ignorePositionData) {
            return;
        }
        this.loadLastMapOrDefault();
    }
    this.formatStringWithCharacter = (character,customString) => {
        const message = customString.replace("{NAME}",character.coloredName);
        return this.showInstantPopupSound(message);
    }
    this.someoneIsNowYourFriend = (character,customString) => {
        if(customString) {
            this.formatStringWithCharacter(character,customString);
        } else {
            return this.showInstantPopupSound(`Congratulations! ${character.coloredName} is now your friend!`);
        }
    }
    this.getItemPreviewBounds = () => {
        const x = 10;
        const width = fullWidth - 10;

        let y = 10;
        let height = fullHeight - 10;
        
        if(this.popup) {
            if(objectiveHUD) {
                const objectiveHUDBottom = objectiveHUD.getBottom();
                y += objectiveHUDBottom;
                height -= objectiveHUDBottom;
            }
            height -= fullHeight - this.popup.startY + 10;
        } else if(objectiveHUD) {
            const objectiveHUDBottom = objectiveHUD.getBottom();
            y += objectiveHUDBottom;
            height -= objectiveHUDBottom;
        } else {
            y = 10;
            height = fullHeight - 10;
        }

        return {
            x:x,y:y,width:width,height:height
        }
    }
    this.unlockMove = moveName => {
        return new Promise(async resolve => {
            const alreadyHasMove = this.movesManager.hasMove(moveName);
            const move = Moves[moveName];
            if(!alreadyHasMove) {
                this.movesManager.unlockSlot(moveName);
            }
            const movePreviewID = this.addCustomRenderer(
                new MovePreview(moveName,this.getItemPreviewBounds,false)
            );
            let messages = [
                `You received ${moveName}, a ${alreadyHasMove?"":"new "}${move.type} slot!`
            ];
            playSound("energy");
            await this.showInstantPopups(messages);
            this.removeCustomRenderer(movePreviewID);
            resolve();
        });
    }
    this.addCustomRenderer = customRenderer => {
        return customRendererStack.addLayer(customRenderer);
    }
    this.removeCustomRenderer = ID => {
        customRendererStack.removeLayer(ID);
    }
    this.pushCustomRenderer = customRenderer => {
        const ID = customRendererStack.addLayer(customRenderer);
        customRendererStackIDLIFO.push(ID);
        return ID;
    }
    this.popCustomRenderer = () => {
        const ID = customRendererStackIDLIFO.pop();
        if(ID !== undefined) {
            customRendererStack.removeLayer(ID);
        }
    }
    this.clearCustomRendererStack = () => {
        customRendererStack.clearLayers();
        customRendererStackIDLIFO.splice(0);
    }
    const playerInteractionLocked = () => {
        return playerMovementLocked || escapeMenuShown || popupActive || this.prompt;
    }
    this.playerInteractionLocked = playerInteractionLocked;
    this.lockPlayerMovement = function() {
        playerMovementLocked = true;
    }
    this.unlockPlayerMovement = function() {
        playerMovementLocked = false;
    }
    const escapeMenuDisabled = () => {
        return this.escapeMenuDisabled || playerInteractionLocked();
    }
    this.processKey = function(key) {
        if(key !== kc.accept) {
            this.playerController.processKey(key);
        }
        if(escapeMenuShown) {
            escapeMenu.processKey(key);
            return;
        }
        if(this.prompt) {
            switch(key) {
                case kc.accept:
                    if(enterReleased) {
                        this.prompt.confirmSelection();
                        enterReleased = false;
                        return;
                    } else {
                        return;
                    }
                case kc.up:
                    if(wDown) {
                        return;
                    }
                    this.prompt.moveSelection("up");
                    break;
                case kc.down:
                    if(sDown) {
                        return;
                    }
                    this.prompt.moveSelection("down");
                    break;
                case kc.left:
                    if(aDown) {
                        return;
                    }
                    this.prompt.moveSelection("left");
                    break;
                case kc.right:
                    if(dDown) {
                        return;
                    }
                    this.prompt.moveSelection("right");
                    break;
            }
        } else if(this.popup) {
            if(key === kc.accept) {
                if(enterReleased) {
                    if(this.popupProgressEnabled) {
                        this.popup.progress();
                    }
                    enterReleased = false;
                } else {
                    return;
                }
            }
        } else if(internalPlayerObject) {
            if(key === kc.accept && enterReleased) {
                if(enterReleased) {
                    enterReleased = false;
                    this.playerController.processKey(key);
                } else {
                    return;
                }
            }
        } else if(key === kc.accept) {
            enterReleased = false;
            return;
        }
        switch(key) {
            case kc.up:
                wDown = true;
                return;
            case kc.down:
                sDown = true;
                return;
            case kc.left:
                aDown = true;
                return;
            case kc.right:
                dDown = true;
                return;
        }
    }
    this.processKeyUp = function(key) {
        this.playerController.processKeyUp(key);
        if(escapeMenuShown) {
            escapeMenu.processKeyUp(key);
            return;
        }
        switch(key) {
            case kc.up:
                wDown = false;
                return;
            case kc.down:
                sDown = false;
                return;
            case kc.left:
                aDown = false;
                return;
            case kc.right:
                dDown = false;
                return;
            case kc.cancel:
                if(escapeMenuDisabled()) {
                    return;
                }
                escapeMenuShown = true;
                escapeMenu.show(()=>{
                    escapeMenuShown = false;
                });
                return;
            case kc.accept:
                enterReleased = true;
                return;
        }
    }
    this.processMove = function(x,y) {
        if(escapeMenuShown) {
            escapeMenu.processMove(x,y);
            return;
        }
    }
    this.processClick = function(x,y) {
        if(escapeMenuShown) {
            escapeMenu.processClick(x,y);
            return;
        }
    }
    this.processClickEnd = function(x,y) {
        if(escapeMenuShown) {
            escapeMenu.processClickEnd(x,y);
            return;
        }
    }
    let popupActive = false;
    this.clearTextPopup = () => {
        popupActive = false;
        this.popup = null;
        lastPopupCleared = performance.now();
    }
    this.popupActive = false;
    const showPopup = (pages,name=null,instant=false) => {
        popupActive = true;
        if(Array.isArray(pages)) {
            return new Promise(async resolve => {
                for(let i = 0;i<pages.length;i++) {
                    await showPopup(pages[i],name,instant);
                }
                resolve();
            });
        }
        const page = pages;
        return new Promise(async resolve => {
            if(performance.now() < lastPopupCleared + POPUP_TIMEOUT) {
                await delay(POPUP_TIMEOUT);
            }
            this.popup = new WorldPopup(
                [page],
                () => {
                    this.clearTextPopup();
                    resolve();
                },name,instant,this
            );
        });
    }
    this.showPopup =         page =>        showPopup([page]);
    this.showPopups =        pages =>       showPopup(pages);
    this.showInstantPopup =  page =>        showPopup([page],null,true);
    this.showInstantPopups = pages =>       showPopup(pages,null,true);
    this.showNamedPopup =   (page,name) =>  showPopup([page],name);
    this.showNamedPopups =  (pages,name) => showPopup(pages,name);
    this.showInstantPopupSound = page => {
        playSound("energy");
        return showPopup([page],null,true);
    }
    this.clearPrompt = () => {
        this.prompt = null;
    }
    this.showPrompt = (question,...options) => {
        return new Promise(resolve => {
            this.prompt = new WorldPrompt(question,options,selectionIndex => {
                this.clearPrompt();
                resolve(selectionIndex);
            });
        });
    }
    const outOfBounds = (x,y) => {
        return x < 0 || y < 0 || x > this.renderMap.finalColumn || y > this.renderMap.finalRow;
    }
    this.outOfBounds = outOfBounds;
    this.getTriggerState = function(x,y) {
        if(outOfBounds(x,y)) {
            return null;
        }
        const collisionType = this.renderMap.collision[getIdx(x,y)];
        if(COLLISTION_TRIGGERS[collisionType]) {
            return collisionType + COLLISION_TRIGGER_OFFSET;
        }
        return null;
    }
    this.getCollisionState = function(x,y,ignoreNoCollide) {
        if(outOfBounds(x,y)) {
            return {map: 1, object: null};
        }
        let mapCollision = this.renderMap.collision[getIdx(x,y)];
        let objectCollision = this.objectsLookup[x][y];
        if(!ignoreNoCollide) {
            if((this.map.noCollide && this.map.noCollide[
                mapCollision
            ]) || COLLISTION_TRIGGERS[
                mapCollision
            ])  {
                mapCollision = 0;
            }
            if(objectCollision && objectCollision.noCollide) {
                objectCollision = null;
            }
        } else if(COLLISTION_TRIGGERS[mapCollision]) {
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
        const collidesWithTile = collisionState.map >= 1 && collisionState.map < SPECIAL_COLLISION_START;
        const hasObject = collisionState.object ? true : false;
        return collidesWithTile || hasObject;
    }
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
        this.pendingPlayerObject = newPlayer;
        return this.addObject(newPlayer,x,y);
    }
    const removeOffScreenObject = objectID => {
        for(let i = 0;i<offscreenObjects.length;i++) {
            if(offscreenObjects[i].ID === objectID) {
                offscreenObjects.splice(i,1);
                offscreenObjectCount--;
                break;
            }
        }
    }
    const registerOffscreenToggler = object => {
        const startWithOffscreen = object.offscreenRendering ? true : false;
        let offscreenRendering = startWithOffscreen;
        let world = this;
        if(startWithOffscreen) {
            delete object.offscreenRendering;
        }
        Object.defineProperty(object,"offscreenRendering",{
            get: function() {
                return offscreenRendering;
            },
            set: function(value) {
                if(typeof value !== "boolean") {
                    throw TypeError("Value 'offscreenRendering' must be of type 'boolean'!");
                }
                if(offscreenRendering) {
                    if(!value) {
                        // Turn off off-screen rendering for this object
                        offscreenRendering = false;
                        removeOffScreenObject(object.ID);
                        let x = object.x, y = object.y;
                        if(x < 0) {
                            x = 0;
                        } else if(x > world.renderMap.finalColumn) {
                            x = world.renderMap.finalColumn;
                        }
                        if(y < 0) {
                            y = 0;
                        } else if(y > world.renderMap.finalRow) {
                            y = world.renderMap.finalRow;
                        }
                        object.x = null;
                        object.y = null;
                        world.moveObject(object.ID,x,y,false);
                    }
                } else if(value) {
                    // Turn on off-screen rendering for this object
                    offscreenRendering = true;
                    world.objectsLookup[object.x][object.y] = null;
                    offscreenObjects.push(object);
                    offscreenObjectCount++;

                }
            }
        });
        if(startWithOffscreen) {
            offscreenObjects.push(object);
            offscreenObjectCount++;
        }
    }
    const collisionResolution = (existingObject,newObject,x,y) => {
        if(!this.collides(x,y-1)) {
            this.objectsLookup[x][y-1] = newObject;
            newObject.y--;
        } else if(!this.collides(x+1,y)) {
            this.objectsLookup[x+1][y] = newObject;
            newObject.x++;
        } else if(!this.collides(x,y+1)) {
            this.objectsLookup[x][y+1] = newObject;
            newObject.y++;
        } else if(!this.collides(x-1,y)) {
            this.objectsLookup[x-1][y] = newObject;
            newObject.x--;
        } else {
            console.error("Error: Object collision could not find a resolution");
            this.objectsLookup[x][y] = newObject;
        }
    }
    this.addObject = function(object,x,y) {
        const objectID = getNextObjectID();
        object.ID = objectID;
        registerOffscreenToggler(object);
        if(!isNaN(x) && !isNaN(y)) {
            object.x = x;
            object.y = y;
            if(object.worldPositionUpdated) {
                object.worldPositionUpdated(x,y,x,y,this,true);
            }
        } else if(isNaN(object.x) || !isNaN(object.y)) {
            console.error("Error: An object was supplied to the world renderer without initial coordinates");
        }
        object.world = this;
        this.objects[objectID] = object;
        if(object.offscreenRendering) {
            return objectID;
        }
        const existingItem = this.objectsLookup[object.x][object.y];
        if(existingItem) {
            console.error("Warning: An object collision has occured through the add object method");
            console.log("Existing item",existingItem,"New item",object);
            collisionResolution(existingItem,object,object.x,object.y);
        } else {
            this.objectsLookup[object.x][object.y] = object;
        }
        return objectID;
    }
    this.objectIDFilter = objectID => {
        if(typeof objectID === "object" && typeof objectID.ID === "string") {
            if(objectID.world !== this) {
                console.warn(`Object '${objectID.ID}' belongs to a different world!`);
            }
            return objectID;
        } else {
            return this.objects[objectID];
        }
    }
    this.removeObject = function(objectID) {
        const object = this.objectIDFilter(objectID);
        if(object.offscreenRendering) {
            removeOffScreenObject(object.ID);
        }
        if(object.isPlayer) {
            this.playerObject = null;
        }
        delete this.objects[object.ID];
        this.objectsLookup[object.x][object.y] = null;
    }
    this.moveObject = function(objectID,newX,newY,isInitialPosition=false) {
        const object = this.objectIDFilter(objectID);
        let oldX = object.x;
        let oldY = object.y;
        const hadNoPosition = oldX === null || oldY === null;
        if(hadNoPosition) {
            oldX = newX;
            oldY = newY;
            const oldObject = this.objectsLookup[oldX][oldY];
            if(oldObject) {
                console.error("Error: Shifting into this position loses an object on the lookup plane");
                console.log(`Position: ${newX},${newY}`,"Existing item",oldObject,"New item",object);
            }
        }
        if(object.offscreenRendering) {
            object.x = newX;
            object.y = newY;
            if(object.worldPositionUpdated) {
                object.worldPositionUpdated(oldX,oldY,newX,newY,this,isInitialPosition);
            }
            return;
        }
        if(!hadNoPosition) {
            this.objectsLookup[object.x][object.y] = null;
        }
        object.x = newX;
        object.y = newY;

        const existingObject = this.objectsLookup[object.x][object.y];
        if(existingObject) {
            console.warn("Warning: An object collision has occured through the move object method");
            console.log("Existing item",existingObject,"New item",object);
            collisionResolution(existingObject,object,newX,newY);
        } else {
            this.objectsLookup[object.x][object.y] = object;
        }
        if(object.worldPositionUpdated) {
            object.worldPositionUpdated(oldX,oldY,newX,newY,this,isInitialPosition);
        }
    }
    this.enableTileRendering = function() {
        tileRenderingEnabled = true;
    }
    this.disableTileRendering = function() {
        tileRenderingEnabled = false;
    }
    this.addDecal = decal => {
        this.decals[decal.x][decal.y] = decal;
    }
    this.removeDecal = decal => {
        this.decals[decal.x][decal.y] = null;
    }
    const getIdx = (x,y) => {
        return x + y * this.renderMap.columns;
    }
    const getLayer = (layer,x,y) => {
        return layer[getIdx(x,y)];
    }
    const changeLayer = (layer,value,x,y) => {
        layer[getIdx(x,y)] = value;
    }
    const changeLayerFilter = (layer,value,x,y,filter=IS_ZERO_FILTER) => {
        const index = getIdx(x,y);
        if(filter(layer[index])) {
            layer[index] = value;
        }
    }
    const lightingLayerFilter = () => {
        if(lightingLayerFilter) {
            return this.renderMap.lighting;
        } else {
            throw Error("This map does not have a lighting layer!");
        }
    }
    this.getCollisionTile = (x,y) => {
        return getLayer(this.renderMap.collision,x,y);
    }
    this.getForegroundTile = (x,y) => {
        return getLayer(this.renderMap.foreground,x,y);
    }
    this.getBackgroundTile = (x,y) => {
        return getLayer(this.renderMap.background,x,y);
    }
    this.getLightingTile = (x,y) => {
        return getLayer(lightingLayerFilter(),x,y);
    }
    this.setCollisionTile =  (value,x,y) => changeLayer(this.renderMap.collision,value,x,y);
    this.setForegroundTile = (value,x,y) => changeLayer(this.renderMap.foreground,value,x,y);
    this.setBackgroundTile = (value,x,y) => changeLayer(this.renderMap.background,value,x,y);
    this.setLightingTile =   (value,x,y) => changeLayer(lightingLayerFilter(),value,x,y);
    this.setCollisionTileFilter =  (value,x,y,filter) => changeLayerFilter(this.renderMap.collision,value,x,y,filter);
    this.setForegroundTileFilter = (value,x,y,filter) => changeLayerFilter(this.renderMap.foreground,value,x,y,filter);
    this.setBackgroundTileFilter = (value,x,y,filter) => changeLayerFilter(this.renderMap.background,value,x,y,filter);
    this.setLightingTileFilter =   (value,x,y,filter) => changeLayerFilter(lightingLayerFilter(),value,x,y,filter);
    this.updateMap = function(newMapName,data={}) {
        console.log(`World: Loading '${newMapName}'`);
        enterReleased = true;
        const runLoadCode = this.ranCustomLoader;
        if(runLoadCode) {
            pauseRenderer();
            drawLoadingText();
        }
        if(this.renderMap) {
            data.sourceRoom = this.renderMap.name;
        }
        const newMap = worldMaps[newMapName];
        if(this.map) {
            if(this.map.unload) {
                this.map.unload(this);
            }
            if(this.map.scriptTerminator) {
                this.map.scriptTerminator(this);
            }
        }
        this.decals = [];
        this.objects = {};
        offscreenObjects = [];
        offscreenObjectCount = 0;
        this.playerObject = null;
        this.followObject = null;
        cameraXFollowEnabled = true;
        cameraYFollowEnabled = true;
        this.cameraFrozen = false;
        this.compositeProcessor = null;
        tileRenderingEnabled = true;
        this.clearCustomRendererStack();
        this.map = newMap.WorldState ? new newMap.WorldState(this,data):{};
        if(newMap.cameraStart) {
            this.camera.x = newMap.cameraStart.x;
            this.camera.y = newMap.cameraStart.y;
            this.camera.xOffset = 0;
            this.camera.yOffset = 0;
        }
        lightingLayerActive = false;
        this.renderMap = newMap;
        this.renderMap.background = newMap.baseData.background.slice();
        this.renderMap.foreground = newMap.baseData.foreground.slice();
        this.renderMap.collision = newMap.baseData.collision.slice();
        if(newMap.baseData.lighting) {
            this.renderMap.lighting = newMap.baseData.lighting.slice();
            lightingLayerActive = true;
        }
        if(newMap.fxBackground) {
            backgroundRenderer = new newMap.fxBackground(this,data);
        } else {
            backgroundRenderer = null;
        }
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

        this.updateSize();

        if(runLoadCode) {
            this.customLoader(resumeRenderer,true,data.sourceRoom);
        }
    }
    this.refreshWorldTileset = () => {
        let startedLocked = playerMovementLocked;
        this.lockPlayerMovement();
        let didFinishLoading = false;
        (async ()=>{
            while(!didFinishLoading) {
                playTone(600,0.6);
                await delay(100);
            }
        })();
        ImageManager.loadImages(()=>{
            didFinishLoading = true;
            tileset = imageDictionary[TILESET_NAME];
            playSound("energy");
            if(!startedLocked) {
                this.unlockPlayerMovement();
            }
        });
    }
    this.gameOver = async (noDelay=false) => {
        if(!noDelay) {
            await delay(500);
        }
        this.addCustomRenderer(new FadeOut(2000));
        await delay(5000);
        setFaderEffectsRenderer(new BoxFaderEffect());
        faderEffectsRenderer.fillInLayer = new ElvesFillIn();
        this.managedFaderTransition(WorldRenderer);
    }
    this.startBattle = (battleID,winCallback,loseCallback,...battleParameters) => {
        this.saveState(true,false);
        setFaderEffectsRenderer(new BattleFaderEffect());
        setFaderInSound("battle-fade-in",true);
        setFaderOutSound("battle-fade-out",true);
        function returnToWorld() {
            setFaderInSound("battle-fade-in",true);
            setFaderOutSound("battle-fade-out",true);
            rendererState.fader.fadeOut(WorldRenderer);
        }
        function win(battleOutput) {
            if(winCallback) {
                winCallback(battleOutput);
            }
            returnToWorld();
        }
        function lose(battleOutput) {
            if(loseCallback) {
                loseCallback(battleOutput);
            }
            returnToWorld();
        }
        const opponent = getOpponent(battleID,...battleParameters);
        this.managedFaderTransition(FistBattleRenderer,win,lose,opponent);
    }
    this.getTileSize = () => {
        return tileSize;
    }
    this.updateSize = function() {
        if(!didStartRenderer) {
            return;
        }
        if(backgroundRenderer && backgroundRenderer.updateSize) {
            backgroundRenderer.updateSize();
        }
        if(this.compositeProcessor) {
            this.compositeProcessor.updateSize();
        }
        let adjustedTileSize = WorldTileSize * this.renderMap.renderScale;
        if(fullWidth < smallScaleSnapPoint) {
            adjustedTileSize *= 1.5;
        } else if(fullWidth < mediumScaleSnapPoint) {
            adjustedTileSize *= 2;
        } else {
            adjustedTileSize *= 2.5;
        }

        tileSize = Math.ceil(adjustedTileSize/16)*16;

        horizontalTiles =  Math.ceil(fullWidth / tileSize);
        verticalTiles = Math.ceil(fullHeight / tileSize);

        if(horizontalTiles % 2 === 0) {
            horizontalTiles++;
        }
        if(verticalTiles % 2 === 0) {
            verticalTiles++;
        }

        horizontalOffset = Math.round(halfWidth - horizontalTiles * tileSize / 2);
        verticalOffset = Math.round(halfHeight - verticalTiles * tileSize / 2);
        
        halfHorizontalTiles = Math.floor(horizontalTiles / 2);
        halfVerticalTiles = Math.floor(verticalTiles / 2);

        if(this.renderMap.fixedCamera) {
            if(verticalTiles < this.renderMap.rows || horizontalTiles < this.renderMap.columns) {
                this.fixedCameraOverride = true;
            } else {
                if(this.fixedCameraOverride) {
                    this.camera.x = this.renderMap.cameraStart.x;
                    this.camera.y = this.renderMap.cameraStart.y;
                    this.camera.xOffset = 0;
                    this.camera.yOffset = 0;
                }
                this.fixedCameraOverride = false;
            }
        }

        if(lightingLayerActive) {
            refreshLightTable(tileSize);
        }
    }
    this.autoCameraOff = () => {
        this.cameraFrozen = true;
    }
    this.autoCameraOn = () => {
        this.cameraFrozen = false;
    }
    this.moveCamera = async (x,y,xOffset,yOffset,duration) => {
        return new Promise(resolve => {
            const startTime = performance.now();
            const startX = this.camera.x + this.camera.xOffset;
            const startY = this.camera.y + this.camera.yOffset;
            const rangeX =  x + xOffset - startX;
            const rangeY =  y + yOffset - startY;
            this.cameraController = timestamp => {
                let tNormal = (timestamp - startTime) / duration;
                if(tNormal < 0) {
                    tNormal = 0;
                } else if(tNormal >= 1) {
                    this.camera.x = x;
                    this.camera.y = y;
                    this.camera.xOffset = xOffset;
                    this.camera.yOffset = yOffset;
                    this.cameraController = null;
                    resolve();
                    return;
                }
                const xPosition = startX + (rangeX * tNormal);
                const yPosition = startY + (rangeY * tNormal);

                const pureX = Math.floor(xPosition);
                const pureY = Math.floor(yPosition);
                const unpureX = xPosition - pureX;
                const unpureY = yPosition - pureY;

                this.camera.x = pureX;
                this.camera.y = pureY;
                this.camera.xOffset = unpureX;
                this.camera.yOffset = unpureY;
            }
        });
    }
    this.pushCamera = async (x,y,xOffset,yOffset,duration) => {
        return this.moveCamera(
            this.camera.x+x,
            this.camera.y+y,
            this.camera.xOffset+xOffset,
            this.camera.yOffset+yOffset,
            duration
        );
    }
    this.enableCameraXFollow = () => {
        cameraXFollowEnabled = true;
    }
    this.enableCameraYFollow = () => {
        cameraYFollowEnabled = true;
    }
    this.disableCameraXFollow = () => {
        cameraXFollowEnabled = false;
    }
    this.disableCameraYFollow = () => {
        cameraYFollowEnabled = false;
    }
    this.updateCamera = function(timestamp,movementLocked) {
        if(this.cameraController) {
            this.cameraController(timestamp);
        } else if((!this.renderMap.fixedCamera || this.fixedCameraOverride) && !this.cameraFrozen) {
            let followObject;
            if(this.followObject) {
                followObject = this.followObject;
            } else {
                followObject = internalPlayerObject;
            }
            if(followObject) {
                if(followObject.renderLogic) {
                    followObject.skipRenderLogic = true;
                    followObject.renderLogic(timestamp);
                }
                if(cameraXFollowEnabled) {
                    this.camera.x = followObject.x;
                    this.camera.xOffset = followObject.xOffset;
                }
                if(cameraYFollowEnabled) {
                    this.camera.y = followObject.y;
                    this.camera.yOffset = followObject.yOffset;
                }
                if(followObject.isPlayer) {
                    followObject.walkingOverride = movementLocked;
                }
            }
        }
        if(this.renderMap.useCameraPadding) {
            const abolsuteCameraX = this.camera.x + this.camera.xOffset;
            const absoluteCameraY = this.camera.y + this.camera.yOffset;

            if(abolsuteCameraX - halfHorizontalTiles < this.renderMap.lowerHorizontalBound) {
                this.camera.x = halfHorizontalTiles + this.renderMap.lowerHorizontalBound;
                this.camera.xOffset = 0;   
            } else if(abolsuteCameraX + halfHorizontalTiles > this.renderMap.horizontalUpperBound) {
                this.camera.x = this.renderMap.horizontalUpperBound - halfHorizontalTiles;
                this.camera.xOffset = 0;
            }

            if(absoluteCameraY - halfVerticalTiles < this.renderMap.lowerVerticalBound) {
                this.camera.y = halfVerticalTiles + this.renderMap.lowerVerticalBound;
                this.camera.yOffset = 0;
            } else if(absoluteCameraY + halfVerticalTiles > this.renderMap.verticalUpperBound) {
                this.camera.y = this.renderMap.verticalUpperBound - halfVerticalTiles;
                this.camera.yOffset = 0;
            }
        }
    }
    this.render = function(timestamp) {
        this.processThreads(timestamp);

        if(tileRenderingEnabled) {
        
            const movementLocked = playerInteractionLocked();

            if(!movementLocked && this.playerController.renderMethod) {
                this.playerController.renderMethod(timestamp);
                if(paused) {
                    //This ensures that the world is not rendered before the loading segment plays, such as when the player changes map by a trigger.
                    return;
                }
            }

            if(backgroundRenderer) {
                backgroundRenderer.render(timestamp);
            } else {
                context.fillStyle = "black";
                context.fillRect(0,0,fullWidth,fullHeight);
            }

            const animationTileOffset = Math.floor(timestamp % ANIMATION_CYCLE_DURATION / ANIMATION_FRAME_TIME);
            this.updateCamera(timestamp,movementLocked);

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

            const xOffset = horizontalOffset - Math.round(this.camera.xOffset * tileSize);
            const yOffset = verticalOffset - Math.round(this.camera.yOffset * tileSize);

            const decalBuffer = [];
            const objectBuffer = [];
            const lightBuffer = [];

            let y = yStart, x;

            while(y < verticalTileCount) {
                x = xStart;

                while(x < horizontalTileCount) {

                    const xPos = adjustedXPos + x;
                    const yPos = adjustedYPos + y;

                    if(xPos < this.renderMap.columns && xPos >= 0 && yPos < this.renderMap.rows && yPos >= 0) {
                        const mapIndex = xPos + yPos * this.renderMap.columns;
                        
                        let backgroundValue = this.renderMap.background[mapIndex];
                        let foregroundValue = this.renderMap.foreground[mapIndex];
        
                        const xDestination = xOffset + x * tileSize;
                        const yDestination = yOffset + y * tileSize;

                        if(backgroundValue >= WorldTextureAnimationStart) {
                            backgroundValue += animationTileOffset;
                        }
                        if(foregroundValue >= WorldTextureAnimationStart) {
                            foregroundValue += animationTileOffset;
                        }

                        if(backgroundValue > 0) {
                            const textureX = backgroundValue % WorldTextureColumns * WorldTextureSize;
                            const textureY = Math.floor(backgroundValue / WorldTextureColumns) * WorldTextureSize;
                            context.drawImage(
                                tileset,
                                textureX,textureY,WorldTextureSize,WorldTextureSize,
                                xDestination,yDestination,tileSize,tileSize
                            );
                        }
                        if(foregroundValue > 0) {
                            const textureX = foregroundValue % WorldTextureColumns * WorldTextureSize;
                            const textureY = Math.floor(foregroundValue / WorldTextureColumns) * WorldTextureSize;
                            context.drawImage(
                                tileset,
                                textureX,textureY,WorldTextureSize,WorldTextureSize,
                                xDestination,yDestination,tileSize,tileSize
                            );
                        }

                        const decalRegister = this.decals[xPos][yPos];
                        if(decalRegister) {
                            decalBuffer.push(decalRegister,xDestination,yDestination);
                        }
                        const objectRegister = this.objectsLookup[xPos][yPos];
                        if(objectRegister) {
                            objectBuffer.push(objectRegister,xDestination,yDestination);
                        }

                        if(lightingLayerActive) {
                            const lightingValue = this.renderMap.lighting[mapIndex];
                            if(lightingValue) {
                                lightBuffer.push(
                                    lightingValue-1,
                                    xDestination,
                                    yDestination
                                );
                            }
                        }
                    }
                    x++;
                }
                y++;
            }

            let i = 0;
            while(i < offscreenObjectCount) {
                const object = offscreenObjects[i];
                const xDestination = (object.x - adjustedXPos) * tileSize + xOffset;
                const yDestination = (object.y - adjustedYPos) * tileSize + yOffset;
                objectBuffer.push(
                    object,xDestination,yDestination,
                );
                i++;
            }
            i = 0;
            while(i < decalBuffer.length) {
                decalBuffer[i].render(
                    timestamp,
                    decalBuffer[i+1],
                    decalBuffer[i+2],
                    tileSize,
                    tileSize
                );
                i += 3;
            }
            i = 0;
            while(i < objectBuffer.length) {
                objectBuffer[i].render(
                    timestamp,
                    objectBuffer[i+1],
                    objectBuffer[i+2],
                    tileSize,
                    tileSize
                );
                i += 3;
            }
            if(lightingLayerActive) {
                i = 0;
                while(i < lightBuffer.length) {
                    lightTable[lightBuffer[i]].render(
                        lightBuffer[i+1],
                        lightBuffer[i+2]
                    );
                    i += 3;
                }
            }
        } else {
            if(backgroundRenderer) {
                backgroundRenderer.render(timestamp);
            } else {
                context.fillStyle = "black";
                context.fillRect(0,0,fullWidth,fullHeight);
            }
        }
        this.postProcessor.render();
        if(this.compositeProcessor) {
            this.compositeProcessor.render();
        }
        if(objectiveHUD) {
            objectiveHUD.render(timestamp);
        }
        customRendererStack.render(timestamp);
        if(this.customRenderer) {
            this.customRenderer.render(timestamp);
        }
        if(escapeMenuShown) {
            escapeMenu.render(timestamp);
        }
        if(this.prompt) {
            this.prompt.render(timestamp);
        } else if(this.popup) {
            this.popup.render(timestamp);
        }
        if(alert) {
            if(!alert.render(timestamp)) {
                alert = null;
            }
        }
    }
}
export default WorldRenderer;
