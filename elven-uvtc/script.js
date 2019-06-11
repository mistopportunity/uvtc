"use strict";
import MainMenuRenderer from "./renderers/main-menu.js";
import BoxFaderEffect from "./renderers/components/box-fader-effect.js";
import BattleScreenRenderer from "./renderers/battle-screen.js";

drawLoadingText();
establishMapLinks();

function loadCallback() {
    BitmapText.verifyBitmap();
    if(ENV_FLAGS.BATTLE_RENDERER) {
        setRendererState(new BattleScreenRenderer());
    } else {
        setRendererState(new MainMenuRenderer());
    }
    startRenderer();
    if(rendererState.song) {
        playMusic(rendererState.song);
    }
}

setPageTitle("UVTC: Pre-alpha");
setImageIndexMode(IndexModes.LoseRoot);
ImageManager.loadImages(loadCallback);
SoundManager.loadSounds(loadCallback);
SoundManager.loadNonEssentialSounds();

(function(){
    const wasMuted = musicMuted || soundMuted;
    if(musicMuted) {
        setMusicVolume(0);
    }
    if(soundMuted) {
        setSoundVolume(0);
    }
    if(wasMuted) {
        saveVolumeChanges();
    }
})();
restoreVolumeChanges();

//setFaderOutSound("swish-1");
//setFaderInSound("swish-2");
setFaderEffectsRenderer(new BoxFaderEffect());
if(ENV_FLAGS.FAST_AS_FUCK_TRANSITIONS) {
    setFaderDelay(60);
    setFaderDuration(60);
    setMusicFadeDuration(60);
} else {
    setFaderDelay(600);
    setFaderDuration(1700);
    setMusicFadeDuration(1000);
}
