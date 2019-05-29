const stringLookup = {
    bookcase_1: "there's a lot of books on this shelf.",
    bed_1: "a sleeping bag on a hardwood floor, a fine luxury.",
    bookcase_2: "lots of books here... a lot of them seem to mention some kind of card game?",
    bookcase_3: "this bookcase demonstrates that it's okay to be small.\nway to go bookcase!",
    table_1: "these plastic, foldable tables have seen a lot of life.\nare they for parties?",
    table_2: "these tables are pretty much everywhere.",
    counter_1: "this must be a kitchen... seems to be missing a few things, though.",
    counter_2: "this is the cleanest kitchen you've seen in your entire life.",
    sink_1: "it's important to wash your hands!",
    toilet_1: "it's important to use toilets!",
    bathtub_1: "it's important to wash...\nyourself.",
    bookcase_4: "this bookcase doesn't have very many books on it.",
    bookcase_5_1: "this bookcase has a few intersting books on it.",
    bookcase_5_2: "one book is called 'the cat lady manifesto'",
    bookcase_5_3: "Rif i loved my children as much as i love my cats, i'd have children.R",
    bookcase_6_1: "this bookcase is trying to be an edgy reflection of society.",
    bookcase_6_2: "is it working?",
    bookcase_7_1: "this bookcase seems to be more inappropriate than the other bookcases.",
    bookcase_7_2: "hey... what're you wearing?",
    couch_1: "this couch looks too clean to sit on.\nwho gets a white couch anyways?",
    tv_1: "i'm the tv!\nit's so nice to meet you!\nwatch me anytime.",
    jims_journey: "that was quite the journey...\nyou may use the door, now.",
    jims_kink: "if you whisper something in my right ear,\ni'll get out of your way.",
    jims_intrigue: "oh. my. i'll be getting out of your way now.",
    jims_postop: "let's stay in touch. hehe.",
    sleepingbag_1: "hmm...\nsleeping bags seem to be in style in this town.",
    bookcase_8_1: "there's not many books on this shelf, but there are a few interesting ones.",
    bookcase_8_2: "Rowning two pieces of furniture for dummiesR",
    bookcase_8_3: "it seems to be a book about minimalism.",
    sleepingbag_2: "whoever lives here also has a sleeping bag.\ndo they only come in one color?",
    rudetable: "someone didn't bring the chair back to the table. how rude!",
    dryer_1: "what kind of a heathen has their dryer on the left?",
    washer_1: "the washer being on the right is making you very uncomfortable.",
    sb_1: "a lot of people must sleep here.",
    sb_2: "this sleeping bag doesn't want to be bothered.",
    sb_3: "this sleeping bag is upset with the other sleeping bags.",
    sb_4: "who would want to sleep this close to other people?",
    emptyshelf: "the books appear to have slipped into another dimension.",
    bookcase_9_1: "there's a notecard taped to this shelf.",
    bookcase_9_2: "'adults only'",
    bookcase_9_3: "hmm... this might be interesting.",
    bookcase_9_4_1: "ew. there's more important things you should be doing than reading someone else's smut.",
    bookcase_9_4_2: "ah, i see. saving yourself for marriage.",
    longtable: "this table is long, yet, you can't help but feel disappointed by it.",
    indoor_tree: "an indoor tree? finally, something unique in one of these houses.",
    nice_envo: "there's a nice atmosphere to do things at this table.",
    bright_idea: "what a bright idea putting a lamp next to two windows.",
    couch_2: "the couch has some light stains on it.",
    couch_3: "the couch is so bright it's hard to look at.",
    likes_books_1: "wow. this person sure likes books.",
    likes_books_2: "you can't grab any books or else the whole house might fall apart.",
    bathtub_getaway: "this is clearly a room of luxury.",
    french_rev_1: "there's a book sticking out from under the pillow.",
    french_rev_2: "it says something about the french revolution.",
    sat_lt_1: "this lighting is satisfying.",
    sat_lt_1: "perfectly symmetrical, as all things should be.",
    jims_help_1: "oh. hi there.",
    jims_help_2: "if you want to talk with me, come over to me and use your mouth.",
    jims_help_3: ". . .",
    jims_help_4: "oh. you don't know how to use your mouth?",
    jims_help_5: ". . .",
    jims_help_6: "well, this is awkward.",
    jims_help_7: "give me a second.",
    jims_help_8: ". . .",
    jims_help_9: "what? you already figured it out?",
    jims_help_10: "well, it's nice to meet you. my name is jim.",
    you_can_never_leave: "you can't leave tumble woods yet!\nyou have important things to do!",
    stranger_danger: "ahh! stranger danger!\nget away from me!",
    AUTO_1: "you should probably go check if that frog you scared is okay first.",
    AUTO_2: "who is it?",
    AUTO_3: "mom..?\nyou sound different.\ndid you start drinking again?",
    AUTO_4: "ohhh, jim? long time no see.\ncome on in!",
    AUTO_5: "sorry 'not really sure',\nbut i can't let strangers in.",
    AUTO_6: "uhh, who's there?",
    AUTO_7: "mom..?\nmom who?",
    AUTO_8: "my neighbor who?",
    AUTO_9: "frogert. huh. are you my clone?\nfrogert who?",
    AUTO_10: "only if you ask nicely.",
    AUTO_11: "please leave now. i don't have time for your rudeness.",
    AUTO_12: "see, that's better. you may come in, now.",
    AUTO_13: "oh. okay. bye then.",
    AUTO_14: "what makes you think you can just barge on in here?",
    AUTO_15: "what do you want to say?",
    AUTO_16: "yeah, right. 'boldness'",
    AUTO_17: "you know who else is bold? crazy people.",
    AUTO_18: "try again next time.\ni've got enough of my own crazy in here.",
    AUTO_19: "alright. that's fair.",
    AUTO_20: "you've got places to be, i get it.",
    AUTO_21: "really, i do.",
    AUTO_22: "you can come in, now.",
    AUTO_23: "really? a key to the city?",
    AUTO_24: "what's the mayors name, then?",
    AUTO_25: "you're not the mayor...",
    AUTO_26: "john smith? john smith at yahoo.com?",
    AUTO_27: "well you must have important things to do, john smith.",
    AUTO_28: "i'll let you be on your way, now.",
    AUTO_29: "i only let trusted people in my home.",
    AUTO_30: "hmm. you don't sound like the mayor.",
    AUTO_31: "in fact, we don't even have a mayor. we just have town meetings.",
    AUTO_32: "anyhow, i don't let liars into my home.",
    AUTO_33: "alright, look wise guy. i know you're not frogert.",
    AUTO_34: "and i know you think you're sooooooo funny, but i'm not going to let you in my home just because you can make a decent joke.",
    AUTO_35: "oh. you're that creep that lives next door.",
    AUTO_36: "i would prefer you not coming in, it took me a week to get the stench of your booze out of here last time.",
    AUTO_37: "come back when you've laid off the booze.",
    AUTO_38: "wow. that's a reallllly good joke...\n*cough*",
    AUTO_39: "if you want in my house you're gonna have to do better than that.",
    AUTO_40: "well, now is not a good time, mom.\ni'm hiding from that stranger outside.\nyou should look out.",
    AUTO_41: "oh! and, before you go, could you go and meet your neighbor? he doesn't have a lot of friends. thanks.",
    AUTO_42: "go get me some beer, dude. ah, i mean, uh, 'friend'.",
    AUTO_43: "f- friend? after everything we've been through together? what are you, crazy!",
    AUTO_44: "what? it's only been about a minute?",
    AUTO_45: ". . .",
    AUTO_46: "well, at any rate, i suppose. maybe... just maybe, we could be friends.",
    AUTO_47: "... just don't touch me, please.",
    AUTO_48: "okay. now that we're 'friends', why don't you be a pal and get me a beer from the Btavern?B",
    AUTO_49: "follow the path and keep north, it's right at the base of Bgreat lake tumble.B",
    AUTO_50: "and don't take too long, i want it to be cold when you bring it back.",
    AUTO_51: "hey! you're the same stranger from outside!",
    AUTO_52: "you tricked me!",
    AUTO_53: "uh. hi. i'm still not okay with you coming in here on false pretenses.",
    AUTO_54: "explain yourself.",
    AUTO_55: ". . .",
    AUTO_56: "well. i can't argue with that logic.",
    AUTO_57: "honestly? that is sooo relatable.",
    AUTO_58: "i feel like i understand everything we've been through together so much better now",
    AUTO_59: "i think we will be the best of pals",
    AUTO_60: "great pals.",
    AUTO_61: "pals forever.",
    AUTO_62: "pals who definitely won't betray each other.",
    AUTO_63: "ever.",
    AUTO_64: "you should be a good friend and get a beer from the BtavernB for frogert. you can come here later"
}
const strings = stringLookup;
const getString = function(ID) {
    return stringLookup[ID];
}
const getSyllableMap = function(word) {
    return wordSyllableMaps[word];
}
