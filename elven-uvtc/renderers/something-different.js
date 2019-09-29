import SpriteForeground from "./components/battle/sprite-foreground.js";
import CrazyFlyingShitEffect from "./components/crazy-flying-shit.js";
import MultiLayer from "./components/multi-layer.js";
import TheseHands from "./components/battle/these-hands.js";
import LoveAndCrystals from "./components/battle/love-and-crystals.js";

const textureSize = 16;
const halftextureSize = textureSize / 2;

const xLimit = 0.35;
const minimumX = -xLimit;
const maximumX = xLimit;
const minimumY = 0.18;
const maximumY = 0.7;

const foregroundYRetargetStart = 1.4;
const foregroundYRetargetEnd = 2.5;
const depthFactor = 0.5;
const foregroundYContrast = 100;
const foregroundYOffset = -100;
const topLayerYOffset = -150;
const frontLayerDepthAdjustment = 2.5;
const frontLayerSpecialModifier = 10;

const skewAmount = 0.5;
const skewCenterPush = 200;
const groundHeightFactor = 4;
const groundDepthFactor = 4;
const groundXDampening = 3;
const groundYModifier = 2;

const baseXAccel =       0.0015;
const baseXDecel =       0.003;
const baseYAccel =       0.0015;
const baseYDecel =       0.003;
const baseMaxXVelocity = 0.01;
const baseMaxYVelocity = 0.02;

const opponentSpriteOffset = 0.2;
const spriteScale = 120;

const defaultFogColor = "rgba(255,255,255,0.6)";

const maxFrameDifference = 60;
const deltaBase = 1000 / 60;

const xStart = 0;
const yStart = 0;

function SomethingDifferentRenderer() {

    let x = xStart;
    let y = yStart;

    let xDelta = 0;
    let yDelta = 0;

    let xVelocity = 0;
    let yVelocity = 0;

    let lastFrame = 0;
    let movementLocked = false;

    this.lockMovement = () => {
        movementLocked = true;
    }
    this.unlockMovement = () => {
        movementLocked = false;
    }

    let fogColor = defaultFogColor;

    let opponentSprite = null;
    this.opponent = {
        y: 0,
        x: 0,
        render: timestamp => {
            let adjustedScale = spriteScale;
            let extraScale = 0;
            if(this.hands.punching) {
                extraScale = 5;
            }
            opponentSprite.render(timestamp,adjustedScale,extraScale);
            //todo render this.opponentHeart
        }
    }
    this.backgroundEffects = new MultiLayer();
    this.foregroundEffects = new MultiLayer();
    this.globalEffects = new MultiLayer();

    this.hands = new TheseHands(this,null);//todo supply slots
    this.playerHeart = new LoveAndCrystals(this,null);//todo slots
    this.opponentHeart = new LoveAndCrystals(this,null);//todo slots

    this.forcedSizeMode = "fit";
    let tileset = null;
    const worldTileset = imageDictionary["world-tileset"];
    const headcons = imageDictionary["battle/headcon"];
    const getWorldTextureX = ID => ID % WorldTextureColumns * WorldTextureSize;
    const getWorldTextureY = ID => Math.floor(ID / WorldTextureColumns) * WorldTextureSize;

    const foregroundLayer1 = [];
    const foregroundLayer2 = [];
    const foregroundLayer3 = [];

    let headconMap = null;
    this.setHeadconIcon = (index,iconID=0) => {
        const item = headconMap[index];
        if(item) {
            item.icon = iconID;
        } else {
            console.warn("No headcon at index " + index);
        }
    };
    this.setHeadconLost = (index,value=false) => {
        const item = headconMap[index];
        if(item) {
            item.lost = value;
        } else {
            console.warn("No headcon at index " + index);
        }
    }

    const renderHeadcons = () => {
        const halfBarWidth = 180;
        const headconDistance = halfBarWidth/3;
        const height = 60;
        context.translate(halfWidth-halfBarWidth,0);
        context.fillStyle = "black";
        context.fillRect(0,0,halfBarWidth,height);
        context.fillStyle = "white";
        context.fillRect(halfBarWidth,0,halfBarWidth,height);

        context.translate(5,5);
        for(let i = 0;i<6;i++) {
            const map = headconMap[i];
            let iconX = map.icon * 90;
            let iconY = map.lost ? 90 : 0;
            context.drawImage(headcons,iconX,iconY,90,90,i*headconDistance,0,50,50);
        }

        context.resetTransform();
    }

    const renderForegroundObject = foregroundObject => {
        context.drawImage(
            worldTileset,
            foregroundObject.textureX,
            foregroundObject.textureY,
            foregroundObject.textureWidth,
            foregroundObject.textureHeight,

            foregroundObject.renderXPercent * fullWidth + foregroundObject.renderXOffset,
            halfHeight + foregroundObject.renderYOffset,
            foregroundObject.renderWidth,
            foregroundObject.renderHeight
        );
    }

    const getForegroundObject = (startTextureID,width,height,posX,scale) => {
        const renderWidth = WorldTextureSize * width * scale;
        const renderHeight = WorldTextureSize * height * scale;
        return {
            textureX: getWorldTextureX(startTextureID),
            textureY: getWorldTextureY(startTextureID),
            textureWidth: width * WorldTextureSize,
            textureHeight: height * WorldTextureSize,
            renderWidth: renderWidth,
            renderHeight: renderHeight,
            renderXPercent: posX,
            renderXOffset: -renderWidth / 2,
            renderYOffset: -renderHeight / 2
        }
    }

    const loadBattleSpecifics = () => {
        //DEBUG
        //todo isolation
        const getTree = posX => {
            return getForegroundObject(116,2,4,posX,8);
        }
        foregroundLayer1.push(
            getTree(0.4),
            getTree(0.9),
            getTree(-0.5),
            getTree(1.5),
        );
        foregroundLayer2.push(
            getTree(0.25),
            getTree(0.75),
            getTree(-0.5),
            getTree(1.5),         
        );
        foregroundLayer3.push(
            getTree(0.20),
            getTree(0.75)
        );
        this.backgroundEffects.addLayer(new CrazyFlyingShitEffect(1,2.5,0.001,80,200,"white"));
        opponentSprite = new SpriteForeground("wimpy-red-elf",true,null,null,opponentSpriteOffset);
        tileset = imageDictionary["battle/test-tileset"];
        fogColor = defaultFogColor;
        headconMap = [
            {icon:0,lost:true},
            {icon:0,lost:false},
            {icon:0,lost:false},
    
            {icon:1,lost:false},
            {icon:1,lost:false},
            {icon:1,lost:true}
        ];
    }
    loadBattleSpecifics();

    const renderSky = () => {
        context.drawImage(tileset,48,16,16,16,0,0,fullWidth,fullHeight);
    }

    const renderGround = (xNormal,depthNormal) => {
        depthNormal = Math.max(-(depthNormal - 1) / groundDepthFactor,0.01);

        const renderHeight = fullHeight / groundHeightFactor;

        const groundTop = fullHeight - renderHeight;

        const adjustedTextureY = Math.max(depthNormal * groundYModifier * textureSize,0.0001);

        const adjustedTextureX = -xNormal / groundXDampening * textureSize + textureSize;

        context.drawImage(tileset,48,0,16,16,0,groundTop,fullWidth,renderHeight);

        context.save();
        context.setTransform(1,0,-skewAmount,1,skewCenterPush,0);
        context.drawImage(
            tileset,
            adjustedTextureX,adjustedTextureY,
            halftextureSize,textureSize,

            0,groundTop,
            halfWidth,renderHeight
        );
        context.setTransform(1,0,skewAmount,1,-skewCenterPush,0);
        context.drawImage(
            tileset,
            adjustedTextureX+halftextureSize,adjustedTextureY,
            halftextureSize,textureSize,

            halfWidth,groundTop,
            halfWidth,renderHeight
        );
        context.restore();
    }
    const renderFog = (xPixelOffset,yPixelOffset) => {
        context.fillStyle = fogColor;
        context.fillRect(-xPixelOffset,-yPixelOffset,fullWidth+xPixelOffset*2,fullHeight+yPixelOffset*2);
    }
    const renderForeground = (timestamp,xNormal,depthNormal,xPixelOffset,yPixelOffset) => {
        depthNormal = foregroundYRetargetStart + (foregroundYRetargetEnd - foregroundYRetargetStart) * depthNormal;

        const firstDepthScale = Math.pow(depthNormal / 8,depthFactor);
        const secondDepthScale = Math.pow(depthNormal / 4,depthFactor);
        const thirdDepthScale = Math.pow(depthNormal / 2,depthFactor);
        const fourthDepthScale = depthNormal + this.opponent.y;

        const xOffset = halfWidth * xNormal;

        const firstDepthHeight = firstDepthScale * fullHeight;
        const secondDepthHeight = secondDepthScale * fullHeight;
        const thirdDepthHeight = thirdDepthScale * fullHeight;
        const fourthDepthHeight = fourthDepthScale * fullHeight;

        const opponentXOffset = this.opponent.x * halfWidth;
        
        const thirdDepthX = (fullWidth   - thirdDepthScale  * fullWidth)  /  2 + xOffset * thirdDepthScale + xPixelOffset;
        const thirdDepthY = (fullHeight - thirdDepthHeight) / 2 + foregroundYContrast / thirdDepthScale + foregroundYOffset + yPixelOffset;

        const secondDepthX = (fullWidth  - secondDepthScale * fullWidth)  /  2 + xOffset * secondDepthScale + xPixelOffset;
        const secondDepthY =(fullHeight - secondDepthHeight) / 2 + foregroundYContrast / secondDepthScale + foregroundYOffset + yPixelOffset;

        const firstDepthX = (fullWidth   - firstDepthScale  * fullWidth)  /  2 + xOffset * firstDepthScale + xPixelOffset;
        const firstDepthY = (fullHeight - firstDepthHeight) / 2 + foregroundYContrast / firstDepthScale + topLayerYOffset + yPixelOffset;

        const fourthDepthX = (fullWidth   - fourthDepthScale  * fullWidth)  /  2 + xOffset * fourthDepthScale - opponentXOffset + xPixelOffset;
        const fourthDepthY = (fullHeight - fourthDepthHeight) / 2 - Math.min(depthNormal - frontLayerDepthAdjustment,0) * frontLayerSpecialModifier + yPixelOffset;

        let i;
        context.save();
        context.setTransform(firstDepthScale,0,0,firstDepthScale,firstDepthX,firstDepthY);
        for(i = 0;i<foregroundLayer1.length;i++) {
            renderForegroundObject(foregroundLayer1[i]);
        }
        context.resetTransform();
        renderFog(xPixelOffset,yPixelOffset);
        context.setTransform(secondDepthScale,0,0,secondDepthScale,secondDepthX,secondDepthY);
        for(i = 0;i<foregroundLayer2.length;i++) {
            renderForegroundObject(foregroundLayer2[i]);
        }
        context.resetTransform();
        renderFog(xPixelOffset,yPixelOffset);
        context.setTransform(thirdDepthScale,0,0,thirdDepthScale,thirdDepthX,thirdDepthY);
        for(i = 0;i<foregroundLayer3.length;i++) {
            renderForegroundObject(foregroundLayer3[i]);
        }

        context.setTransform(fourthDepthScale,0,0,fourthDepthScale,fourthDepthX,fourthDepthY);
        if(this.backgroundEffects) {
            this.backgroundEffects.render(timestamp)
        }
        this.opponent.render(timestamp);
        if(this.foregroundEffects) {
            this.foregroundEffects.render(timestamp);
        }
        context.restore();
    }
    let wDown, sDown, aDown, dDown;
    this.processKey = key => {
        switch(key) {
            case kc.up:
                if(wDown) {
                    return;
                }
                yDelta--;
                wDown = true;
                break;
            case kc.down:
                if(sDown) {
                    return;
                }
                yDelta++;
                sDown = true;
                break;
            case kc.left:
                if(aDown) {
                    return;
                }
                xDelta--;
                aDown = true;
                break;
            case kc.right:
                if(dDown) {
                    return;
                }
                xDelta++;
                dDown = true;
                break;
        }
    }
    this.processKeyUp = key => {
        switch(key) {
            case kc.up:
                if(wDown) {
                    yDelta++;
                }
                wDown = false;
                break;
            case kc.down:
                if(sDown) {
                    yDelta--;
                }
                sDown = false;
                break;
            case kc.left:
                if(aDown) {
                    xDelta++;
                }
                aDown = false;
                break;
            case kc.right:
                if(dDown) {
                    xDelta--;
                }
                dDown = false;
                break;
        }
    }

    this.processClick = () => {
        this.hands.punch(playSound.bind(this,"damage",0.15));
    }

    const processMovement = (delta,timestamp) => {

        const movementLockedOrPunching = movementLocked || this.hands.punching;

        const xDeltaMask = movementLockedOrPunching ? 0 : xDelta;
        const yDeltaMask = movementLockedOrPunching ? 0 : yDelta;

        const xAccel = baseXAccel * delta;
        const xDecel = baseXDecel * delta;

        const yAccel = baseYAccel * delta;
        const yDecel = baseYDecel * delta;

        const maxXVelocity = baseMaxXVelocity * delta;
        const maxYVelocity = baseMaxYVelocity * delta;

        if(xDeltaMask > 0) {
            if(xVelocity < 0) {
                xVelocity = 0;
            }
            xVelocity += xAccel;
        } else if(xDeltaMask < 0) {
            if(xVelocity > 0) {
                xVelocity = 0;
            }
            xVelocity -= xAccel;
        } else {
            if(xVelocity > 0) {
                xVelocity -= xDecel;
                if(xVelocity < 0) {
                    xVelocity = 0;
                }
            } else if(xVelocity < 0) {
                xVelocity += xDecel;
                if(xVelocity > 0) {
                    xVelocity = 0;
                }
            }
        }
        if(xVelocity > maxXVelocity) {
            xVelocity = maxXVelocity;
        } else if(xVelocity < -maxXVelocity) {
            xVelocity = -maxXVelocity;
        }

        if(yDeltaMask > 0) {
            if(yVelocity < 0) {
                yVelocity = 0;
            }
            yVelocity += yAccel;
        } else if(yDeltaMask < 0) {
            if(yVelocity > 0) {
                yVelocity = 0;
            }
            yVelocity -= yAccel;
        } else {
            if(yVelocity > 0) {
                yVelocity -= yDecel;
                if(yVelocity < 0) {
                    yVelocity = 0;
                }
            } else if(yVelocity < 0) {
                yVelocity += yDecel;
                if(yVelocity > 0) {
                    yVelocity = 0;
                }
            }
        }
        if(yVelocity > maxYVelocity) {
            yVelocity = maxYVelocity;
        } else if(yVelocity < -maxYVelocity) {
            yVelocity = -maxYVelocity;
        }

        if(!movementLockedOrPunching) {
            if(xVelocity !== 0) {
                x -= xVelocity;
            }
            if(yVelocity !== 0) {
                y -= yVelocity;
            }
        }

        if(x < minimumX) {
            x = minimumX;
            xVelocity += xDecel;
            if(xVelocity > 0) {
                xVelocity = 0;
            }
        } else if(x > maximumX) {
            x = maximumX;
            xVelocity -= xDecel;
            if(xVelocity < 0) {
                xVelocity = 0;
            }
        }

        if(y < minimumY) {
            y = minimumY;
            yVelocity += yDecel;
            if(yVelocity > 0) {
                yVelocity = 0;
            }
        } else if(y > maximumY) {
            y = maximumY;
            yVelocity -= yDecel;
            if(yVelocity < 0) {
                yVelocity = 0;
            }
        }

        this.hands.setSway(
            Math.abs(xVelocity)/maxXVelocity,
            Math.abs(yVelocity)/maxYVelocity,
            timestamp
        );
    }
    this.render = timestamp => {
        let delta = timestamp - lastFrame;
        if(delta > maxFrameDifference) {
            delta = maxFrameDifference;
        }
        delta /= deltaBase;
        lastFrame = timestamp;
        processMovement(delta,timestamp);

        renderSky();
        renderGround(x,y);

        let foregroundXOffset = 0;
        let foregroundYOffset = 0;

        if(this.hands.punching) {//todo
            foregroundXOffset = Math.round(Math.random());
            foregroundYOffset = Math.round(Math.random());
        } //else todo

        renderForeground(timestamp,x,y,foregroundXOffset,foregroundYOffset);

        renderHeadcons();
        this.hands.render(timestamp);
        //this.playerHeart.render(timestamp); TODO
        if(this.globalEffects) {
            this.globalEffects.render(timestamp);
        }
    }
}
export default SomethingDifferentRenderer;