/*============================
copyright 2017 Marc Guiselin
============================*/

//define constants
const constants = Object.freeze({
    regex: {
        matchYoutubeUrl: new RegExp('^(https?\\:\\/\\/)?(www\\.)?youtube\\.com.+$', 'i'),
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
    youtubeTheme: "",
    censoredTitle: { //what to do for censored titles
        capitalization: 1, //0: nothing, 1: capitalize, 2: lowercase
        removeEmoji: false, //remove emojii, html entities and similar non-common characters
        removeRepeatingNonLetterChars: false, //remove repeating non-letter characters.  example: '?? !!!!' -> '? !'
        removeShortTextContainedWithinElipses: false,
        removeHashtags: false
    },
    proUnlocked: false,
    promo: {
        triggerShowUpdate: false,//extension just updated, so show the update notification
        lastUpdateShowedNotification: "initial"//the last version of ytr when an update was shown
        
        //proUnlockedMethod: 0, //0: nothing, 1: donated, 2: confirmed email, 3: unlocked by performing tasks
        //leftChromeStoreReview: false,
        //leftFacebookPost: false,
        //leftTweet: false,
        //leftLinkedin: false
    },
    notifications: {
        warnOldYoutube: true,
        showUpdate: true //show update notification when ytr is updated
    }
};




//blocking ads is as simple as blocking the same urls adblock does
//youtube plays the video by default if the ads don't load, so no need for complex scripts!
chrome.webRequest.onBeforeRequest.addListener(function (info) {
    //only block when adblock is enabled and the video isn't in an iframe imbedded on a web site
    if (options.adBlock && info.parentFrameId == -1)
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
    setTimeout(function () {
        if (details.reason == "install") {

            //trigger first show install message
            options.promo.triggerShowUpdate = true;
            options.promo.lastUpdateShowedNotification = "";
            chrome.storage.local.set({options: options});

            chrome.tabs.query({}, function (tabs) {
                //insert scripts into every tab right on start
                for (let tab of tabs) {
                    if (tab.url && constants.regex.matchYoutubeUrl.test(tab.url)) {
                        let id = tab.id;
                        chrome.tabs.insertCSS(id, { file: "css/content.css" });
                        chrome.tabs.executeScript(id, { file: "scripts/common/utils.js" }, () =>
                            chrome.tabs.executeScript(id, { file: "scripts/common/title-caps.js" }, () =>
                                chrome.tabs.executeScript(id, { file: "scripts/content.js" })
                            )
                        );
                    }
                }

                //open youtube homepage to show install message
                chrome.tabs.create({ url: "https://www.youtube.com/" });
            });

        }else if(details.reason == "update"){

            //only show update notification if there are new updates to show and if user didn't disable showing the notification
            if(updateNotes[updateNotes.length - 1].version != options.promo.lastUpdateShowedNotification && options.notifications.showUpdate){
                setTimeout(function () {
                    options.promo.triggerShowUpdate = true;
                    if(!options.promo.lastUpdateShowedNotification)
                        options.promo.lastUpdateShowedNotification = "initial";
                    chrome.storage.local.set({options: options});
                }, 4 * 60 * 1000);
            }
        }
    }, 1000);
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