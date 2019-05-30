"use strict";
let faderInSound = null;
let faderOutSound = null;
let faderEffectsRenderer = null;
let faderTime = 0;
let faderDelay = 0;
let musicFadeOutDuration = 0;
function setFaderInSound(soundName) {
    faderInSound = soundName;
}
function setFaderOutSound(soundName) {
    faderOutSound = soundName;
}
function setFaderEffectsRenderer(renderer) {
    faderEffectsRenderer = renderer;
}
function setFaderDuration(time) {
    faderTime = time;
}
function setFaderDelay(time) {
    faderDelay = time;
}
function setMusicFadeDuration(time) {
    musicFadeOutDuration = time;
}
function getFader() {
    const fader = {
        delta: 0,
        time: faderTime,
        start: null,
        fadeInDelay: faderDelay,
        transitionParameters: null,
        transitionRenderer: null,
        inMethod: null,
        fadeIn: exitMethod => {
            startRenderer();
            rendererState.fader.delta = -1;
            rendererState.fader.start = performance.now();
            if(faderEffectsRenderer.callbackOnce) {
                faderEffectsRenderer.callbackOnce();
                faderEffectsRenderer.callbackOnce = null;
            }
            if(sizeApplicationDeferred) {
                applySizeMode(true);
            }
            if(exitMethod) {
                rendererState.fader.inMethod = exitMethod;
            }
            const staticTime = rendererState.fader.time / 1000;
            if(faderInSound) {
                playSound(faderInSound,staticTime);
            }
            if(rendererState.song) {
                if(!musicMuted) {
                    if(rendererState.songIntro) {
                        playMusicWithIntro(rendererState.song,rendererState.songIntro);
                    } else {
                        playMusic(rendererState.song);
                    }
                }
            } else if(rendererState.songStartAction) {
                rendererState.songStartAction();
            }
        },
        fadeOut: (rendererGenerator,...parameters) => {
            rendererState.transitioning = true;
            rendererState.fader.delta = 1;
            rendererState.fader.start = performance.now();
            rendererState.fader.transitionRenderer = rendererGenerator;
            rendererState.fader.transitionParameters = parameters;
            const staticTime = rendererState.fader.time / 1000;
            if(faderOutSound) {
                playSound(faderOutSound,staticTime);
            }
            if(musicFadeOutDuration) {
                fadeOutSongs(musicFadeOutDuration);
            } else {
                stopMusic();
            }
        },
        oninEnd: () => {
            if(rendererState.fader) {
                if(rendererState.fader.inMethod) {
                    rendererState.fader.inMethod();
                }
                rendererState.transitioning = false;
            }
            console.log("Transition complete");
        },
        onoutEnd: () => {
            pauseRenderer();
            let fadeInDelay = rendererState.fader.fadeInDelay;
            const startTime = performance.now();
            const fadeInCompleter = () => {
                fadeInDelay -= performance.now() - startTime;
                if(fadeInDelay > 0) {
                    setTimeout(fadeInCompleter,fadeInDelay,0);
                } else {
                    setRendererState(rendererState);
                    rendererState.fader.fadeIn();
                }
            }
            if(faderEffectsRenderer.pauseCallbackOnce) {
                faderEffectsRenderer.pauseCallbackOnce();
                faderEffectsRenderer.pauseCallbackOnce = null;
            }
            if(rendererState.fader.transitionRenderer) {
                drawLoadingText();
                rendererState = new rendererState.fader.transitionRenderer(
                    ...rendererState.fader.transitionParameters
                );
                if(!rendererState.fader) {
                    rendererState.fader = getFader();
                }
                if(rendererState.fader) {
                    rendererState.transitioning = true;
                    if(rendererState.customLoader) {
                        rendererState.customLoader(
                            fadeInCompleter
                        );
                        return;
                    }
                    if(musicMuted) {
                        fadeInCompleter();
                        return;
                    }
                    if(rendererState.song && rendererState.songIntro) {
                        const songLoaded = audioBuffers[rendererState.song] || failedBuffers[rendererState.song];
                        const introLoaded = audioBuffers[rendererState.song] || failedBuffers[rendererState.song];
                        if(songLoaded && introLoaded) {
                            fadeInCompleter();
                        } else if(introLoaded) {
                            audioBufferAddedCallback = name => {
                                if(name === rendererState.song) {
                                    fadeInCompleter();
                                    audioBufferAddedCallback = null;
                                }
                            }
                            loadSongOnDemand(rendererState.song);                          
                        } else if(songLoaded) {
                            audioBufferAddedCallback = name => {
                                if(name === rendererState.songIntro) {
                                    fadeInCompleter();
                                    audioBufferAddedCallback = null;
                                }
                            }
                            loadSongOnDemand(rendererState.songIntro);
                        } else {
                            let hasSong = false;
                            let hasIntro = false;
                            audioBufferAddedCallback = name => {
                                switch(name) {
                                    case rendererState.song:
                                        hasSong = true;
                                        break;
                                    case rendererState.songIntro:
                                        hasIntro = true;
                                        break;
                                }
                                if(hasSong && hasIntro) {
                                    fadeInCompleter();
                                    audioBufferAddedCallback = null;
                                }
                            }
                            loadSongOnDemand(rendererState.song);
                            loadSongOnDemand(rendererState.songIntro);
                        }
                    } else if(rendererState.song) {
                        const songLoaded = audioBuffers[rendererState.song] || failedBuffers[rendererState.song];
                        if(songLoaded) {
                            fadeInCompleter();
                        } else {
                            audioBufferAddedCallback = name => {
                                if(name === rendererState.song) {
                                    fadeInCompleter();
                                    audioBufferAddedCallback = null;
                                }
                            }
                            loadSongOnDemand(rendererState.song);
                        }
                    } else {
                        fadeInCompleter();
                    }
                } else {
                    console.error("Transition error: Renderer state is missing a fader");
                }
            } else {
                console.error("Error: Missing fader transition state");
            }
        },
        render: timestamp => {
            if(rendererState.fader.delta !== 0) {
                let fadeIntensity;
                if(rendererState.fader.delta > 0) {
                    fadeIntensity = (timestamp - rendererState.fader.start) / rendererState.fader.time;
                    if(fadeIntensity > 1) {
                        fadeIntensity = 1;
                    }
                    if(faderEffectsRenderer) {
                        faderEffectsRenderer.render(fadeIntensity,true);
                    }
                } else {
                    fadeIntensity = 1 - (timestamp - rendererState.fader.start) / rendererState.fader.time;
                    if(fadeIntensity < 0) {
                        rendererState.fader.delta = 0;
                        rendererState.fader.oninEnd();
                        return;
                    }
                    if(faderEffectsRenderer) {
                        faderEffectsRenderer.render(fadeIntensity,false);
                    }
                }

                if(fadeIntensity === 1 && rendererState.fader.delta === 1) {
                    rendererState.fader.delta = 0;
                    rendererState.fader.onoutEnd();
                }
            }
        }
    }
    return fader;
}
