import RotatingBackground from "./components/rotating-background.js";

function ControlsPaneRenderer(callback,parent) {

    let fadeInStart = null;
    let fadeOutStart = null;
    const fadeInTime = 300;
    this.transitioning = true;

    this.fadeOutEnd = null;

    const forcedKeyTranslations = {
        "ESCAPE": "ESC",
        "DELETE": "DEL"
    };
    const getFriendlyKeyName = keyCode => {
        let friendlyName = keyCode.toLowerCase();
        if(friendlyName.startsWith("key")) {
            friendlyName = friendlyName.substring(3);
        }
        friendlyName = friendlyName.toUpperCase();
        const potentialTranslation = forcedKeyTranslations[friendlyName];
        if(potentialTranslation) {
            return potentialTranslation;
        }
        return friendlyName.toUpperCase();
    }

    const hoverTypes = {
        none: 0,
        acceptButton: 1,
        backButton: 2,
        upButton: 3,
        downButton: 4,
        leftButton: 5,
        rightButton: 6,
        pictureButton: 7,
        exitLabel: 8
    };

    let hoverType = hoverTypes.none;

    const acceptButton = getPlaceholderLocation();
    const backButton = getPlaceholderLocation();
    const upButton = getPlaceholderLocation();
    const downButton = getPlaceholderLocation();
    const leftButton = getPlaceholderLocation();
    const rightButton = getPlaceholderLocation();
    const pictureButton = getPlaceholderLocation();
    const exitLabel = getPlaceholderLocation();

    const keyButtons = {
        acceptButton: acceptButton,
        backButton: backButton,
        upButton: upButton,
        downButton: downButton,
        leftButton: leftButton,
        rightButton: rightButton,
        pictureButton: pictureButton
    };
    const keyAssociations = {};
    keyAssociations[kc.accept] = "acceptButton";
    keyAssociations[kc.cancel] = "backButton";
    keyAssociations[kc.left] = "leftButton";
    keyAssociations[kc.right] = "rightButton";
    keyAssociations[kc.down] = "downButton";
    keyAssociations[kc.up] = "upButton";
    keyAssociations[kc.picture_mode] = "pictureButton";

    acceptButton.title = "Accept";
    backButton.title = "Back/Esc";
    upButton.title = "UP";
    downButton.title = "DOWN";
    leftButton.title = "LEFT";
    rightButton.title = "RIGHT";
    pictureButton.title = "Picture";

    acceptButton.association = kc.accept;
    backButton.association = kc.cancel;
    upButton.association = kc.up;
    downButton.association = kc.down;
    leftButton.association = kc.left;
    rightButton.association = kc.right;
    pictureButton.association = kc.picture_mode;

    const keyNameColor = "#FF006E";
    const backgroundColor = "rgba(89,89,89,0.25)";

    Object.entries(keyBindings).forEach(keyBind => {
        const keyImpulse = keyBind[1];
        const association = keyAssociations[keyImpulse];
        if(association) {
            const button = keyButtons[association];
            if(button) {
                const keyCode = keyBind[0];
                button.keyCode = keyCode;
                button.keyName = getFriendlyKeyName(keyCode);
            }
        }
    });

    const renderButton = button => {
        let topColor;
        let backgroundColor;
        let bottomText;
        if(button.awaiting) {
            bottomText = "press...";
            backgroundColor = "white";
            topColor = "black";
        } else if(button.pressed) {
            if(button.keyName) {
                bottomText = button.keyName;
            } else {
                bottomText = "NONE";
            }
            topColor = "white";
            backgroundColor = keyNameColor;
        } else if(button.keyName) {
            bottomText = button.keyName;
            topColor = "white";
            backgroundColor = "black";
        } else {
            bottomText = "NONE";
            topColor = "white";
            backgroundColor = "black";
        }

        context.fillStyle = backgroundColor;
        context.fillRect(button.x,button.y,button.width,button.height);

        const buttonCenterX = button.x + button.width / 2;
        const buttonCenterY = button.y + button.height / 2;

        context.textAlign = "center";

        context.textBaseline = "bottom";
        context.fillStyle = topColor;
        context.fillText(button.title,buttonCenterX,buttonCenterY-2);

        context.textBaseline = "top";
        context.fillStyle = keyNameColor;
        context.fillText(bottomText,buttonCenterX,buttonCenterY+2);
    }

    const exit = () => {
        if(callback) {
            this.transitioning = true;
            fadeOutStart = performance.now();
            this.fadeOutEnd = () => {
                callback(lastRelativeX,lastRelativeY);
            }
        }
    }
    const updateButtonPressed = (key,pressed) => {
        switch(key) {
            case kc.accept:
                acceptButton.pressed = pressed;
                break;
            case kc.cancel:
                backButton.pressed = pressed;
                break;
            case kc.up:
                upButton.pressed = pressed;
                break;
            case kc.down:
                downButton.pressed = pressed;
                break;
            case kc.left:
                leftButton.pressed = pressed;
                break;
            case kc.right:
                rightButton.pressed = pressed;
                break;
            case kc.picture_mode:
                pictureButton.pressed = pressed;
                break;
        }
    }

    this.processKey = function(key) {
        if(this.transitioning) {
            return;
        }
        if(listeningToKeyEvents) {
            return;
        }
        updateButtonPressed(key,true);
    }
    this.processKeyUp = function(key) {
        if(this.transitioning) {
            return;
        }
        if(listeningToKeyEvents) {
            return;
        }
        updateButtonPressed(key,false);
        if(key === kc.cancel) {
            exit();
        }
    }
    this.trueKeyUp = () => {
        return;
    }
    const keyUpPreprocess = event => {
        this.trueKeyUp(event);
    }
    let listeningToKeyEvents = false;
    const subscribeToTrueKeyEvents = () => {
        listeningToKeyEvents = true;
        window.addEventListener("keyup",keyUpPreprocess);
    }
    const unsubscribeTrueKeyEvents = () => {
        window.removeEventListener("keyup",keyUpPreprocess);
        listeningToKeyEvents = false;
    }

    const getNewKey = () => {
        return new Promise(resolve => {
            this.trueKeyUp = key => {
                unsubscribeTrueKeyEvents();
                this.trueKeyUp = () => {
                    return;
                };
                resolve(key);
            }
            subscribeToTrueKeyEvents();
        });
    }
    const setNewKey = buttonName => {
        const button = keyButtons[buttonName];
        button.awaiting = true;
        delete keyBindings[button.keyCode];
        const internalAsync = async () => {
            const newKey = await getNewKey();
            const keyCode = newKey.code;
            const existingBind = keyBindings[keyCode];
            if(existingBind) {
                delete keyBindings[keyCode];
                const association = keyAssociations[existingBind];
                if(association) {
                    const clearedButton = keyButtons[association];
                    if(clearedButton) {
                        clearedButton.keyName = null;
                    }
                }
            }
            keyBindings[keyCode] = button.association;
            button.awaiting = false;
            button.keyName = getFriendlyKeyName(keyCode);
            button.keyCode = keyCode;
            saveKeyBinds();
        }
        internalAsync();
    }

    this.processClick = function(x,y) {
        if(this.transitioning) {
            return;
        }
        this.processMove(x,y);
    }
    this.processClickEnd = function(x,y) {
        if(this.transitioning) {
            return;
        }
        if(listeningToKeyEvents) {
            return;
        }
        switch(hoverType) {
            case hoverTypes.acceptButton:
                setNewKey("acceptButton");
                break;
            case hoverTypes.backButton:
                setNewKey("backButton");
                break;
            case hoverTypes.downButton:
                setNewKey("downButton");
                break;
            case hoverTypes.upButton:
                setNewKey("upButton");
                break;
            case hoverTypes.leftButton:
                setNewKey("leftButton");
                break;
            case hoverTypes.rightButton:
                setNewKey("rightButton");
                break;
            case hoverTypes.pictureButton:
                setNewKey("pictureButton");
                break;
            case hoverTypes.exitLabel:
                exit();
                break;
            default:
                exit();
                break;
        }
        this.processMove(x,y);
    }
    this.processMove = function(x,y) {
        if(this.transitioning) {
            return;
        }
        if(contains(x,y,acceptButton)) {
            hoverType = hoverTypes.acceptButton;
        } else if(contains(x,y,backButton)) {
            hoverType = hoverTypes.backButton;
        } else if(contains(x,y,upButton)) {
            hoverType = hoverTypes.upButton;
        } else if(contains(x,y,downButton)) {
            hoverType = hoverTypes.downButton;
        } else if(contains(x,y,leftButton)) {
            hoverType = hoverTypes.leftButton;
        } else if(contains(x,y,rightButton)) {
            hoverType = hoverTypes.rightButton;
        } else if(contains(x,y,pictureButton)) {
            hoverType = hoverTypes.pictureButton;
        } else if(contains(x,y,exitLabel)) {
            hoverType = hoverTypes.exitLabel;
        } else {
            hoverType = hoverTypes.none;
        }
    }
    
    const background = new RotatingBackground("spiral-large");
    background.rotationTime = 20000;

    this.render = (timestamp,x,y,width,height) => {
        const halfWidth = Math.floor(width / 2);
        let restorationRequired = false;
        if(fadeOutStart) {
            const fadeOutDelta = (timestamp - fadeOutStart) / fadeInTime;
            if(fadeOutDelta >= 1) {
                this.fadeOutEnd();
                return;
            }
            restorationRequired = true;
            context.save();
            context.globalAlpha = 1 - fadeOutDelta;
        } else {
            if(!fadeInStart) {
                fadeInStart = timestamp;
            }
            const fadeInDelta = (timestamp - fadeInStart) / fadeInTime;
            if(fadeInDelta < 1) {
                context.save();
                context.globalAlpha = fadeInDelta;
                restorationRequired = true;
            } else {
                this.transitioning = false;
            }
        }

        context.save();
        context.globalCompositeOperation = "destination-out";
        context.fillStyle = "white";
        context.fillRect(x,y,width,height);
        context.globalCompositeOperation = "destination-over";
        background.render(timestamp);
        context.restore();

        const controlsLabelX = x + halfWidth;
        let buttonAreaWidth = 500;
        if(buttonAreaWidth > fullWidth-40) {
            buttonAreaWidth = fullWidth - 40;
        }
        let buttonAreaHeight = buttonAreaWidth - 100;

        let halfButtonAreaWidth = buttonAreaWidth / 2;
        let quarterButtonAreaWidth = buttonAreaWidth / 4;

        const buttonAreaX = Math.round(controlsLabelX - buttonAreaWidth / 2);
        const buttonAreaY = Math.round(halfHeight - buttonAreaHeight / 2) + 40;
        buttonAreaHeight = Math.round(buttonAreaHeight);
        buttonAreaWidth = Math.round(buttonAreaWidth);

        context.fillStyle = backgroundColor;
        context.fillRect(
            buttonAreaX-10,
            buttonAreaY-10,
            buttonAreaWidth+20,
            buttonAreaHeight+20
        );
        const buttonHeight = Math.floor((buttonAreaHeight / 3) - 10);

        const row1Y = buttonAreaY;
        const row2Y = Math.floor(buttonAreaY + buttonAreaHeight / 2 - buttonHeight / 2);
        const row3Y = buttonAreaY + buttonAreaHeight - buttonHeight;

        pictureButton.x = buttonAreaX;
        pictureButton.y = row3Y;
        pictureButton.width = buttonAreaWidth;

        upButton.y = row2Y;
        downButton.y = row2Y;
        leftButton.y = row2Y;
        rightButton.y = row2Y;
        acceptButton.y = row1Y;
        backButton.y = row1Y;

        pictureButton.height = buttonHeight;
        upButton.height = buttonHeight;
        downButton.height = buttonHeight;
        leftButton.height = buttonHeight;
        rightButton.height = buttonHeight;
        acceptButton.height = buttonHeight;
        backButton.height = buttonHeight;

        const halfButtonWidth = halfButtonAreaWidth - 5;
        acceptButton.x = buttonAreaX;
        acceptButton.width = halfButtonWidth;
        
        backButton.x = acceptButton.x + acceptButton.width + 10;
        backButton.width = halfButtonWidth;

        const quarterButtonWidth = halfButtonAreaWidth / 2 - 10;

        upButton.x = buttonAreaX;
        rightButton.x = buttonAreaX + buttonAreaWidth - quarterButtonWidth;
        downButton.x = acceptButton.x + acceptButton.width - quarterButtonWidth;
        leftButton.x = backButton.x;

        upButton.width = quarterButtonWidth;
        rightButton.width = quarterButtonWidth;
        downButton.width = quarterButtonWidth;
        leftButton.width = quarterButtonWidth;

        context.font = "26px Roboto";
        renderButton(acceptButton);
        renderButton(backButton);
        renderButton(upButton);
        renderButton(downButton);
        renderButton(leftButton);
        renderButton(rightButton);
        renderButton(pictureButton);

        context.font = "36PX Roboto";
        context.save();
        context.globalCompositeOperation = "difference";
        context.fillStyle = "white";
        context.textBaseline = "bottom";
        context.textAlign = "center";
        context.fillText("C O N T R O L S",controlsLabelX,buttonAreaY-40);
        context.restore();
        if(restorationRequired) {
            context.restore();
        }
    }
}
export default ControlsPaneRenderer;