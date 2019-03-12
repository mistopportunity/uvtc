const cardPageTypes = {
    slots: Symbol("slots"),
    hand: Symbol("hand"),
    field: Symbol("field")
};
const getCardPageName = function(cardPageType,isPlayer) {
    switch(cardPageType) {
        default:
            return "unknown page";
        case cardPageTypes.slots:
            return `${isPlayer?"your":"their"} slots`;
        case cardPageTypes.hand:
            return `${isPlayer?"your":"their"} hand`;
        case cardPageTypes.field:
            return `${isPlayer?"your":"their"} conditions`;
    }
}
const getPageTypeFromIndex = function(index) {
    switch(index) {
        default:
            console.error("Invalid index for card page types!");
            return cardPageTypes.hand;
        case 0:
            return cardPageTypes.hand;
        case 1:
            return cardPageTypes.slots;
        case 2:
            return cardPageTypes.field;
    }
}

const drawButtonText = "draw";
const drawEnergyButtonText = "draw energy";
const attackButtonText = "attack";
const useButtonText = "use";
const discardButtonText = "discard";
const setAttackText = "attack";
const setDefenseText = "defense";
const setSpecialText = "special";

const defaultCardPageType = cardPageTypes.hand;
const defaultOpponentCardPageType = cardPageTypes.slots;
function CardSequencer(playerDeck,opponentDeck,opponentSequencer) {

    this.renderer = null;
    this.textFeed = processTextForWrapping("to check to rules hit escape and click 'the rules'");

    this.playerState = {
        isPlayer: true,
        isOpponent: false,
        health: 6,
        energy: 6,
        fullDeck: playerDeck,
        discardDeck: [],
        usableDeck: [...playerDeck],
        hand: [],
        slots: {
            defense: null,
            attack: null,
            special: null
        },
        conditions: [allStatuses[0]]
    };

    this.opponentState = {
        isPlayer: false,
        isOpponent: true,
        health: 6,
        energy: 6,
        fullDeck: opponentDeck,
        discardDeck: [],
        usableDeck: [...opponentDeck],
        hand: [],
        slots: {
            defense: null,
            attack: null,
            special: null
        },
        conditions: [allStatuses[0]]
    };
    this.opponentSequencer = opponentSequencer;

    this.nextButtonShown = false;
    this.nextButtonEnabled = false;

    this.fieldLeftIconText = undefined;
    this.fieldRightIconText = undefined;

    this.playerActionIndex = 0;
    this.maxPlayerActions = 3;

    this.opponentActionIndex = 0;
    this.maxOpponentActions = 0;

    this.isOpponentTurn = false;

    this.updateActionText = function(isPlayerTurn) {
        let text;
        if(!this.isOpponentTurn) {
            text = `action ${this.playerActionIndex+1} of ${this.maxPlayerActions}`;
        } else {
            text = "opponent's turn";
        }
        this.buttonLookup[0].text = text;
    }

    this.setToPlayerTurn = function() {
        this.playerActionIndex = 0;
        this.maxPlayerActions = 3;//TODO: put through the future pre-processor
        this.isOpponentTurn = false;
        this.renderer.unlockPageCycle();
        this.updateButtonStates(false);
        this.updateActionText(true);
        this.nextButtonEnabled = false;
        this.nextButtonShown = false;

        this.cardPageType = cardPageTypes.hand;
        this.pageIndex = 0;
        this.viewingSelfCards = true;
        this.updateRendererData();
        this.updateCardPageText();

        if(this.fullScreenStatus) {
            this.hideFullScreenStatus();
        }
        if(this.fullScreenCard) {
            this.hideFullScreenCard();
        }
    }

    this.setToOpponentTurn = function() {
        this.updateActionText(false);
        this.updateButtonStates(true);
        this.renderer.lockPageCycle();
        this.maxOpponentActions = 3;//todo
        this.opponentActionIndex = 0;
        this.isOpponentTurn = true;
        this.nextButtonEnabled = true;
        this.nextButtonShown = true;
        this.textFeed = [...this.textFeed,...processTextForWrapping("\nplayer turn is over\n\npress [continue] to advance opponent moves")];
        this.renderer.showTextFeed();
        this.cardPageType = cardPageTypes.slots;
        this.pageIndex = 1;
        this.viewingSelfCards = false;
        this.updateRendererData();
        this.updateCardPageText();
        if(this.fullScreenStatus) {
            this.hideFullScreenStatus();
        }
        if(this.fullScreenCard) {
            this.hideFullScreenCard();
        }
    }

    this.buttonRows = [
        [
            {
                text: "action 1 of 3",
                isNotAButton: true,
            }
        ],
        [
            {
                text: drawButtonText,
                enabled: false,
                image: 4
            },
        ],
        [
            {
                text: drawEnergyButtonText,
                enabled: false,
                image: 1
            }
        ],
        [
            {
                text: attackButtonText,
                enabled: false,
                //image: 6
            }
        ],
        [],
        [
            {
                text: "card actions",
                isNotAButton: true,  
            }
        ],
        [
            {
                text: useButtonText,
                enabled: false
            },
            {
                text: discardButtonText,
                enabled: false
            },
        ],
        [],
        [
            {
                text: "set slot cards",
                isNotAButton: true,
            }
        ],
        [
            {
                text: setAttackText,
                enabled: false
            }
        ],
        [
            {
                text: setDefenseText,
                enabled: false
            }
        ],
        [
            {
                text: setSpecialText,
                enabled: false
            }
        ]
    ];
    this.buttonLookup = [];
    this.buttonNameLookup = {};
    let buttonRowIndex = 0;
    for(let i = 0;i<this.buttonRows.length;i++) {
        const row = this.buttonRows[i];
        for(let i2 = 0;i2<row.length;i2++) {
            row[i2].index = buttonRowIndex++;
            this.buttonLookup.push(row[i2]);
            this.buttonNameLookup[row[i2].text] = row[i2];
        }
    }

    this.fullScreenStatus = null;
    this.fullScreenCard = null;

    this.cardPageType = defaultCardPageType;
    this.cardPageText;
    this.cardPageTextScale = 2;
    this.cardPageTextXOffset = 0;
    this.cardPageTextYOffset = 0;

    this.pageIndex = 0;

    this.updateCardPageText = function(customText=null) {
        const text = customText !== null ? customText : `page ${this.pageIndex+1} of 3 - ${
            getCardPageName(this.cardPageType,this.viewingSelfCards)
        }`;
        this.cardPageText = text;
        const textTestResult = drawTextTest(text,this.cardPageTextScale);
        this.cardPageTextXOffset = -Math.floor(textTestResult.width / 2);
        this.cardPageTextYOffset = -Math.floor(textTestResult.height / 2);
    }

    this.opponentCardsVisible = false;
    this.viewingSelfCards = true;

    //this.renderer.showTextFeed();
    //this.renderer.hideTextFeed();

    this.lockInterface = function() {
        this.renderer.lockViewTab();
        this.renderer.lockTextFeedToggle();
        this.renderer.lockPageCycle();
        this.renderer.lockFullScreenCardEscape();
    }

    this.unlockInterface = function() {
        this.renderer.unlockViewTab();
        this.renderer.unlockTextFeedToggle();
        this.renderer.unlockPageCycle();
        this.renderer.unlockFullScreenCardEscape();
    }


    this.updateRendererData = function() {
        const state = this.viewingSelfCards ? this.playerState : this.opponentState;
        switch(this.cardPageType) {
            case cardPageTypes.hand:
                this.cardPageRenderData = state.hand;
                break;
            case cardPageTypes.slots:
                this.cardPageRenderData = [
                    state.slots.defense,
                    state.slots.attack,
                    state.slots.special
                ];
                break;
            case cardPageTypes.field:
                this.fieldLeftIconText = `deck - ${state.usableDeck.length}`;
                this.fieldRightIconText = `discarded - ${state.discardDeck.length}`;
                this.cardPageRenderData = state.conditions;
                break;
        }
    }

    this.activateNextPage = function() {
        switch(this.pageIndex) {
            case 0:
                this.pageIndex = 1;
                break;
            case 1:
                this.pageIndex = 2;
                break;
            case 2:
                this.pageIndex = 0;
                break;
        }
        this.cardPageType = getPageTypeFromIndex(this.pageIndex);
        this.updateRendererData();
        this.updateCardPageText();
    }
    this.activatePreviousPage = function() {
        switch(this.pageIndex) {
            case 0:
                this.pageIndex = 2;
                break;
            case 1:
                this.pageIndex = 0;
                break;
            case 2:
                this.pageIndex = 1;
                break;
        }
        this.cardPageType = getPageTypeFromIndex(this.pageIndex);
        this.updateRendererData();
        this.updateCardPageText();
    }



    this.switchedPanes = function() {
        this.viewingSelfCards = !this.viewingSelfCards;
        this.updateRendererData();
        this.updateCardPageText();
        this.updateButtonStates(false);
    }

    this.updatePlayerSlot = function(name) {
        let actionResultText = "";
        if(this.playerState.slots[name]) {
            actionResultText = `replaced '${this.playerState.slots[name].name}' with '${this.fullScreenCard.name}'`;
            this.playerState.discardDeck.push(this.playerState.slots[name]);
        } else {
            actionResultText = `set ${name} slot to '${this.fullScreenCard.name}'`;
        }
        this.playerState.slots[name] = this.playerState.hand[this.fullScreenCardIndex];
        this.playerState.hand.splice(this.fullScreenCardIndex,1);
        this.playerState.energy -= this.playerState.slots[name].energyCost;//TODO: put through energy modifier
        this.renderer.playerEnergyPulse();
        this.fullScreenCard = null;
        this.renderer.unlockPageCycle();
        this.renderer.unlockViewTab();
        return actionResultText;
    }

    this.activateActionButton = function(index) {
        let didAction = false;
        let actionResultText = "";
        switch(this.buttonLookup[index].text) {
            case useButtonText:
                const usedCard = this.playerState.hand[this.fullScreenCardIndex];
                this.playerState.energy -= usedCard.energyCost;//TODO: put through energy modifier
                this.renderer.playerEnergyPulse();
                this.playerState.hand.splice(this.fullScreenCardIndex,1);
                actionResultText = `used '${usedCard.name}'`;
                const actionResult = usedCard.action(this,this.playerState);
                if(actionResult) {
                    actionResultText += "\n" + actionResult;
                }
                this.fullScreenCard = null;
                this.renderer.unlockPageCycle();
                this.renderer.unlockViewTab();
                didAction = true;
                break;
            case discardButtonText:
                const discardedCard = this.playerState.hand[this.fullScreenCardIndex];
                this.playerState.hand.splice(this.fullScreenCardIndex,1);
                actionResultText = `discarded '${discardedCard.name}'`;
                this.fullScreenCard = null;
                this.renderer.unlockPageCycle();
                this.renderer.unlockViewTab();
                didAction = true;
                break;
            case setAttackText:
                actionResultText = this.updatePlayerSlot("attack");
                didAction = true;
                break;
            case setDefenseText:
                actionResultText = this.updatePlayerSlot("defense");
                didAction = true;
                break;
            case setSpecialText:
                actionResultText = this.updatePlayerSlot("special");
                didAction = true;
                break;
            case drawButtonText:
                if(this.playerState.usableDeck.length <= 0) {
                    actionResultText = "deck empty. discard pile shuffled.\n";
                    this.playerState.usableDeck = this.playerState.discardDeck;
                    this.playerState.discardDeck = [];
                }
                const index = Math.floor(this.playerState.usableDeck.length*Math.random());
                const newCard = this.playerState.usableDeck[index];
                this.playerState.hand.push(this.playerState.usableDeck[index]);
                this.playerState.usableDeck.splice(index,1);
                actionResultText += `you drew '${newCard.name}' from the deck.`;
                didAction = true;
                break;
            case drawEnergyButtonText:
                this.playerState.energy++;
                this.renderer.playerEnergyPulse();
                actionResultText = "you drew 1 energy.";
                didAction = true;
                break;
            case attackButtonText:
                //TODO - Implement attacking logic
                break;
        }
        if(didAction) {
            this.textFeed = processTextForWrapping(
                `action ${
                    this.playerActionIndex+1
                } of ${
                    this.maxPlayerActions
                }\n${
                    actionResultText
                }`
            );
            this.playerActionIndex++;
            if(this.playerActionIndex >= this.maxPlayerActions) {
                this.setToOpponentTurn();
            }
            this.updateActionText();
        }
        this.updateButtonStates(false);
    }

    this.fullScreenCardIndex = -1;

    this.handCardClicked = function(index) {
        if(this.viewingSelfCards || this.viewingOpponentHand) {
            this.fullScreenCard = this.cardPageRenderData[index];
            if(this.viewingSelfCards) {
                this.fullScreenCardIndex = index;
                this.renderer.lockPageCycle();
                this.renderer.lockViewTab();
                this.updateButtonStates(false);
                return;
            }
        }
        this.fullScreenCardIndex = -1;
    }

    this.viewingOpponentHand = false;
    this.viewOpponentHand = function() {
        this.renderer.lockViewTab();
        this.renderer.lockPageCycle();
        this.updateButtonStates(true);
        this.viewingSelfCards = false;

        this.viewingOpponentHand = true;
        this.opponentCardsVisible = true;
        this.pageIndex = 0;
        this.cardPageType = cardPageTypes.hand;
        this.updateRendererData();
        this.updateCardPageText();

        this.nextButtonEnabled = true;
        this.nextButtonShown = true;
    }

    this.nextNextButtonCard = null;

    this.nextButtonClicked = function() {
        if(this.viewingOpponentHand) {
            if(this.fullScreenCard) {
                this.fullScreenCard = null;
            }
            this.opponentCardsVisible = false;
            this.viewingOpponentHand = false;
            this.renderer.unlockViewTab();
            this.renderer.unlockPageCycle();
            this.updateButtonStates(false);

            this.nextButtonEnabled = false;
            this.nextButtonShown = false;
        } else if(this.isOpponentTurn) {
            if(this.nextNextButtonCard) {
                this.fullScreenCard = this.nextNextButtonCard;
                this.nextNextButtonCard = null;
                this.renderer.hideTextFeed();
                return;
            } else if(this.fullScreenCard) {
                this.fullScreenCard = null;
                if(this.opponentActionIndex >= this.maxOpponentActions) {
                    this.setToPlayerTurn();
                    this.textFeed = processTextForWrapping("opponent turn over");
                    this.renderer.showTextFeed();
                    return;
                }
            }

            //TODO - Implement all the same player interfaces with the opponent intelligence

            this.textFeed = processTextForWrapping(
                `action ${
                    this.opponentActionIndex+1
                } of ${
                    this.maxOpponentActions
                }\n${
                    "[insert action result text here]"
                }`
            );

            this.nextNextButtonCard = allCardsList[0]; //Make this based on the type of action the opponent did

            this.opponentActionIndex++;

            if(!this.nextNextButtonCard) {
                if(this.opponentActionIndex >= this.maxOpponentActions) {
                    this.setToPlayerTurn();
                    this.textFeed = [
                        ...this.textFeed,...processTextForWrapping("\n\nopponent turn over")
                    ];
                }
            }

            this.renderer.showTextFeed();
        }
    }

    this.setButtonStatesLogical = function() {
        this.buttonNameLookup[drawButtonText].enabled = this.playerState.hand.length < 6;
        this.buttonNameLookup[attackButtonText].enabled = this.playerState.slots.attack ? true : false;
        this.buttonNameLookup[drawEnergyButtonText].enabled = this.playerState.energy < 100;

        this.buttonNameLookup[useButtonText].enabled = false;
        this.buttonNameLookup[discardButtonText].enabled = false;

        this.buttonNameLookup[setAttackText].enabled = false;
        this.buttonNameLookup[setDefenseText].enabled = false;
        this.buttonNameLookup[setSpecialText].enabled = false;
    }

    this.updateButtonStates = function(disableAll) {
        if(disableAll || this.isOpponentTurn) {
            for(let i = 0;i<this.buttonLookup.length;i++) {
                this.buttonLookup[i].enabled = false
            }
        } else {
            if(this.viewingSelfCards) {
                if(this.fullScreenCard && this.cardPageType === cardPageTypes.hand) {
                    this.buttonNameLookup[setAttackText].enabled = false;
                    this.buttonNameLookup[setDefenseText].enabled = false;
                    this.buttonNameLookup[setSpecialText].enabled = false;

                    this.buttonNameLookup[drawButtonText].enabled = false;
                    this.buttonNameLookup[attackButtonText].enabled = false;
                    this.buttonNameLookup[drawEnergyButtonText].enabled = false;

                    this.buttonNameLookup[useButtonText].enabled = false;

                    const playerHasEnoughEnergy = this.playerState.energy >= this.fullScreenCard.energyCost;

                    switch(this.fullScreenCard.type) {
                        case "attack":
                            this.buttonNameLookup[setAttackText].enabled = playerHasEnoughEnergy;
                            break;
                        case "defense":
                            this.buttonNameLookup[setDefenseText].enabled = playerHasEnoughEnergy;
                            break;
                        case "special":
                            this.buttonNameLookup[setSpecialText].enabled = playerHasEnoughEnergy;
                            break;
                        default:
                            this.buttonNameLookup[useButtonText].enabled = playerHasEnoughEnergy;
                            break;
                    }
                    this.buttonNameLookup[discardButtonText].enabled = true;
                } else {
                    this.setButtonStatesLogical();
                }
            } else {
                this.setButtonStatesLogical();
            }
        }
    }

    
    this.hideFullScreenCard = function() {
        this.fullScreenCard = null;
        if(!this.viewingOpponentHand) {
            this.renderer.unlockPageCycle();
            this.renderer.unlockViewTab();
            this.updateButtonStates(false);
        }
    }

    this.slotCardClicked = function(index) {
        this.fullScreenCard = this.cardPageRenderData[index];
        this.renderer.lockPageCycle();
        this.renderer.lockViewTab();
        this.updateButtonStates(false);
    }
    
    this.statusClicked = function(index) {
        const condition = this.viewingSelfCards ? this.playerState.conditions[index] : this.opponentState.conditions[index];
        if(condition) {
            this.fullScreenStatus = condition;
            this.renderer.lockPageCycle();
            this.renderer.lockViewTab();
            this.updateButtonStates(false);
        }
    }
    this.hideFullScreenStatus = function() {
        this.fullScreenStatus = null;
        this.renderer.unlockViewTab();
        this.renderer.unlockPageCycle();
    }

    for(let i = 0;i<6;i++) {
        if(this.playerState.usableDeck.length>0) {
            const cardIndex = Math.floor(this.playerState.usableDeck.length*Math.random());
            this.playerState.hand.push(this.playerState.usableDeck[cardIndex]);
            this.playerState.usableDeck.splice(cardIndex,1);
        }
        if(this.opponentState.usableDeck.length>0) {
            const cardIndex = Math.floor(this.opponentState.usableDeck.length*Math.random());
            this.opponentState.hand.push(this.opponentState.usableDeck[cardIndex]);
            this.opponentState.usableDeck.splice(cardIndex,1);
        }
    }


    this.updateCardPageText();
    this.updateRendererData();
    this.updateButtonStates(false);

}
