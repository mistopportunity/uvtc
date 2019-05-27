const delay = time => new Promise(resolve => setTimeout(resolve,time));

const scripts = {
    jim_gets_the_hell_out_of_the_way: async (world,jim) => {
        world.lockPlayerMovement();
        await world.showPrompt("what do you want to whisper?",["i love you","please move","uh.. nice panel?"]);
        await delay(800);
        await jim.sayID("jims_intrigue");
        await jim.move({y:2},{x:1});
        await delay(300);
        jim.updateDirection("up");
        await delay(700);
        jim.updateDirection("left");
        await delay(800);
        await jim.sayID("jims_journey");
        world.globalState.jimMoved = true;
        world.unlockPlayerMovement();
        await delay(250);
        jim.updateDirection("up");
        world.globalState.jimsDirection = "up";
    },
    how_to_press_enter: async (world,jim) => {
        world.lockPlayerMovement();
        await delay(400);
        jim.updateDirection("left");
        await delay(200);
        await jim.alert();
        await delay(200);
        jim.updateDirection("down");
        await delay(400);
        jim.updateDirection("left");
        await delay(400);
        await jim.speechID([
            "jims_help_1",
            "jims_help_2",
            "jims_help_3",
            "jims_help_4",
            "jims_help_5",
            "jims_help_6",
            "jims_help_7",
            "jims_help_8",
            "jims_help_9",
        ],"???");
        await jim.sayID("jims_help_10");
        world.unlockPlayerMovement();
        world.globalState.playedEnterTrigger = true;
        await delay(200);
        jim.updateDirection("down");
    },
    meeting_frogert: async (world,frogert) => {
        world.lockPlayerMovement();
        await delay(500);
        frogert.updateDirection("left");
        await delay(200);
        world.playerObject.updateDirection("right");
        await frogert.alert();
        world.popupProgressEnabled = false;
        frogert.sayID("stranger_danger");
        frogert.speed *= 1.25;
        world.followObject = frogert;
        frogert.move({x:4});
        await delay(600);
        world.followObject = frogert;
        await delay(1500);
        frogert.updateDirection("up");
        await delay(400);
        frogert.hidden = true;
        await delay(800);
        world.followObject = null;
        world.removeObject(frogert.ID);
        world.unlockPlayerMovement();
        world.popupProgressEnabled = true;
        world.globalState.metFrogert = true;
    }
};
