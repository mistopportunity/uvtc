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
    jims_postop: "let's stay in touch.\n\n*wink*",
    sleepingbag_1: "hmm...\nsleeping bags seem to be in style in this town.",
    bookcase_8_1: "there's not many books on this shelf, but there are a few interesting ones.",
    bookcase_8_2: "Rowning two pieces of furniture for dummiesR",
    bookcase_8_3: "it seems to be a book about minimalism.",
    sleepingbag_2: "whoever lives here also has a sleeping bag.\ndo they only come in one color?",
    rudetable: "someone didn't bring the chair back to the table.\n\nhow rude!",
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
    jims_help_2: "if you want to talk with me,\ncome over to me and use your mouth.",
    jims_help_3: ". . .",
    jims_help_4: "oh. you don't know how to use your mouth?",
    jims_help_5: ". . .",
    jims_help_6: "well, this is awkward.",
    jims_help_7: "give me a second.",
    jims_help_8: ". . .",
    jims_help_9: "what? you already figured it out?",
    jims_help_10: "well, it's nice to meet you.\n\nmy name is jim.",
    you_can_never_leave: "you can't leave tumble woods yet!\nyou have important things to do!",
    stranger_danger: "ahh! stranger danger!\nget away from me!"
}
const getString = function(ID) {
    return stringLookup[ID];
}
const getSyllableMap = function(word) {
    return wordSyllableMaps[word];
}
