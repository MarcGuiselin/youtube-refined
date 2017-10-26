/*============================
copyright 2017 Marc Guiselin
============================*/

//define constants
const constants = Object.freeze({
    regex: {
        matchYoutubeUrl: new RegExp('^(https?\\:\\/\\/)?(www\\.)?youtube\\.\\w{2,4}\\/.+$', 'i'),
    }
});

//default options
var options = {
    adBlock: false,
    hideComments: false,
    replaceRFYTextWithViewCount: true,
    exactVideoViewCount: true,
    exactLikeDislikeCount: true,
    showVideoAge: true,
    ratingsPreviewMode: 3,//0: nothing, 1: colored box, 2: modern bar, 3: colored bar
    censoredTitle: { //what to do for censored titles
        capitalization: 1, //0: nothing, 1: capitalize, 2: lowercase
        removeEmoji: false, //remove emojii, html entities and similar non-common characters
        removeRepeatingNonLetterChars: false, //remove repeating non-letter characters.  example: '?? !!!!' -> '? !'
        removeShortTextContainedWithinElipses: false,
        removeHashtags: false
    }
};




//blocking ads is as simple as blocking the same urls adblock does
//youtube plays the video by default if the ads don't load, so no need for complex scripts!
chrome.webRequest.onBeforeRequest.addListener(function (info) {
    if (options.adBlock)
        return { cancel: true };
}, {
        urls: [
            "*://www.youtube.com/api/stats/qoe?*",
            "*://www.youtube.com/api/stats/ads?*",
            "*://www.youtube.com/api/stats/atr?*",
            "*://www.youtube.com/get_midroll_info?*",
            "*://www.youtube.com/get_video_info?*",
            "*://www.youtube.com/pagead/*",
            "*://www.youtube.com/yts/jsbin/*/www-pagead-id.js"
        ]
    },
    ['blocking']
);

//Other urls blocked by adblock. unfortunately ytr can't block these because it only has permissions to block youtube urls
//https://securepubads.g.doubleclick.net/pcs/view?
//https://googleads.g.doubleclick.net/pagead/viewthroughconversion/971134070/?
//https://googleads.g.doubleclick.net/pagead/id
//https://www.google.com/pagead/lvz?
//https://googleads.g.doubleclick.net/pagead/lopri?
//https://static.doubleclick.net/instream/ad_status.js



//grab options, merge with default settings, and save
chrome.storage.local.get("options", function (res) {
    chrome.storage.local.set({ options: simpleDeepMerge(options, res.options || {}) });
});


//whenever options are changed, update options
chrome.storage.onChanged.addListener(function (changes) {
    if (changes && changes.options && changes.options.newValue)
        options = changes.options.newValue;
});



//on install
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {

        //insert script into every tab right on start
        setTimeout(function () {
            chrome.tabs.query({}, function (tabs) {
                for (let tab of tabs) {
                    if (constants.regex.matchYoutubeUrl.test(tab.url)) {
                        chrome.tabs.insertCSS(tab.id, { file: "css/content.css" });
                        chrome.tabs.executeScript(tab.id, { file: "scripts/titleCaps.js" }, function () {
                            chrome.tabs.executeScript(tab.id, { file: "scripts/content.js" });
                        });
                    }
                }
            });
        }, 500);
    }
});



//takes original and overrides its values with override
function simpleDeepMerge(original, override) {

    for (var key of Object.keys(original)) {
        if (key in override) {
            if (typeof original[key] == 'object' && !Array.isArray(original[key]))//is object
                original[key] = simpleDeepMerge(original[key], override[key])
            else//anything else
                original[key] = override[key];
        }
    }

    return original;
}