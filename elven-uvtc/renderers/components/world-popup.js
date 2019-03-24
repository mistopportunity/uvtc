function applySonographToPopupFeed(popupFeed) {
    const wordSets = [];
    let wordStart = 0, word = "";
    let lastCharacter = null;
    for(let i = 0;i<popupFeed.length;i++) {
        const character = popupFeed[i].newCharacter;

        let nextCharacter = popupFeed[i+1];
        nextCharacter = nextCharacter ? nextCharacter.newCharacter : null;

        switch(character) {
            default:
                if(character === "'") {
                    if(!popupControlCharacters[lastCharacter] && lastCharacter
                    && !popupControlCharacters[nextCharacter] && nextCharacter
                    ) {
                        word += character;
                    }
                } else if(!textControlCodes[character]) {
                    word += character;
                }
                break;
            case ellipsis:
            case "-":
            case " ":
            case ",":
            case ".":
            case "?":
            case "!":
            case " ":
                if(word) {
                    wordSets.push({
                        start:wordStart,
                        word:word
                    });
                    word = "";
                    wordStart = i+1;
                }
                break;
        }
        lastCharacter = character;

    }
    if(word) {
        wordSets.push({
            start:wordStart,
            word:word
        });
    }

    for(let i = 0;i<wordSets.length;i++) {
        const wordSet = wordSets[i];
        let soundMap = getSyllableMap(wordSet.word);
        if(!soundMap) {
            console.warn(`Warning: '${wordSet.word}' is missing a sonograph`);
            soundMap = [true];
        }
        for(let x = 0;x<soundMap.length;x++) {
            popupFeed[x+wordSet.start].noSound = !soundMap[x];
        }
    }
    return popupFeed;
}
function WorldPopup(pages,callback,prefix) {
    const popupFeedMaxWidthPadding = -60;

    const characterSpeed = 25;
    const spaceSpeed = 20;

    const hyphenDelay = 300;
    const commaDelay = 300;
    const periodDelay = 500;
    const ellipsisDelay = 400;

    let pageIndex = 0;
    let characterIndex = 0;

    const pageCount = pages.length;
    let pageComplete = false;

    let terminated = false;

    for(let i = 0;i<pages.length;i++) {
        let page = pages[i];
        const newPage = [];
        page = page.replace(/\.\.\./gi,ellipsis);
        let textFeed = prefix ? prefix : "";
        for(let x = 0;x<page.length;x++) {
            let speed = characterSpeed;
            let instant = false;
            const character = page[x];
            let delay = 0;
            textFeed += character;
            switch(character) {
                default:
                    if(character === character.toUpperCase()) {
                        continue;
                    }
                    break;
                case ellipsis:
                    delay = ellipsisDelay;
                    break;
                case " ":
                    speed = spaceSpeed;
                    break;
                case "-":
                    speed = hyphenDelay;
                    break;
                case "'":
                    instant = true;
                    break;
                case ",":
                    delay = commaDelay;
                    break;
                case "!":
                case "?":
                case ".":
                    delay = periodDelay;
                    instant = true;
                    break;
            }
            newPage.push({
                textFeed:processTextForWrapping(textFeed),
                newCharacter:character,
                noSound:true,
                instant:instant,
                delay:delay,
                speed:speed
            });
        }

        pages[i] = applySonographToPopupFeed(newPage);
    }

    let textFeed = [];
    let timeout = -1;

    let timeoutMethod = function() {
        const pageValue = pages[pageIndex][characterIndex];
        textFeed = pageValue.textFeed;
        if(++characterIndex < pages[pageIndex].length) {
            const lookAhead = pages[pageIndex][characterIndex]
            if(lookAhead) {
                if(lookAhead.instant) {
                    timeoutMethod();
                    return;
                }
            }
            if(pageValue.delay) {
                timeout = setTimeout(timeoutMethod,pageValue.delay);
            } else {
                if(!pageValue.noSound) {
                    playSound("text-sound");
                }
                timeout = setTimeout(timeoutMethod,pageValue.noSound ? pageValue.speed / 2 : pageValue.speed);
            }
        } else {
            if(pageIndex + 1 >= pageCount) {
                readyToTerminate = true;
            }
            pageComplete = true;
        }
    }

    timeoutMethod();

    let readyToTerminate = false;

    this.progress = function() {
        clearTimeout(timeout);
        if(readyToTerminate) {
            if(terminated) {
                return;
            }
            terminated = true;
            if(callback) {
                callback();
            }
            return;
        }
        if(pageComplete) {
            pageIndex++;
            characterIndex = 0;
            if(pageIndex >= pageCount) {
                readyToTerminate = true;
            } else {
                pageComplete = false;
                timeoutMethod();
            }
        } else {
            const page = pages[pageIndex];
            textFeed = page[page.length-1].textFeed;
            pageComplete = true;
            if(pageIndex + 1 >= pageCount) {
                readyToTerminate = true;
            }
        }
    }
    this.render = function(timestamp) {
        if(terminated) {
            return;
        }
        const popupWidth = halfWidth > 700 ? halfWidth : fullWidth < 700 ? fullWidth - 20 : 700 - 20;
        const popupHeight = Math.floor(fullHeight * 0.33);
        const popupY = fullHeight - 10 - popupHeight;
        const popupX = Math.round(halfWidth - popupWidth / 2);
        context.fillStyle = "black";
        context.fillRect(
            popupX-3,
            popupY-3,
            popupWidth+6,
            popupHeight+6
        );
        context.fillStyle = "white";
        context.fillRect(
            popupX,
            popupY,
            popupWidth,popupHeight
        );
        drawTextWrappingBlack(textFeed,popupX + 10,popupY + 10,popupWidth+popupFeedMaxWidthPadding,2,13,4);
    }
}
