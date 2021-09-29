// ============================
// Copyright 2018 Marc Guiselin
// ============================

// Define constants
const constants = Object.freeze({
    regex: {
        matchYoutubeUrl: /^(https?:\/\/)?(www\.)?youtube\.com.+$/i
    }
});

// Default options
let options = {
        adBlock: false,
        hideComments: false,
        replaceRFYTextWithViewCount: true,
        exactVideoViewCount: true,
        exactLikeDislikeCount: true,
        showVideoAge: true,
        ratingsPreviewMode: 3,// 0: nothing, 1: colored box, 2: modern bar, 3: colored bar
        // ExtensionTheme: '',
        // BlurAmount: 2,
        // RemoveYTRLogo: true,
        // ShowVideoTags: false,   // https://chrome.google.com/webstore/detail/tags-for-youtube/dggphokdgjikekfiakjcpidcclbmkfga/reviews
        youtubeTheme: '',
        enableStats: true,
        censoredTitle: { // What to do for censored titles
            capitalization: 1, // 0: nothing, 1: capitalize, 2: lowercase
            removeEmoji: true, // Remove emojii, html entities and similar non-common characters
            removeRepeatingNonLetterChars: true, // Remove repeating non-letter characters.  example: '?? !!!!' -> '? !'
            removeShortTextContainedWithinElipses: true,
            removeHashtags: true,
            wordReplaceUseRegex: false,
            wordReplace: [
                ['youtube', 'YouTube']
            ]
        },
        autoUpdateCuratedFilters: false,
        __filters: {
            initial: [
                {
                    name: 'Default',
                    desc: 'The default settings for video suggestions',
                    uniqueId: 'default'
                },{
                    name: 'Blocked',
                    desc: 'Whenever you block something it is added to this filter',
                    tagList: 'ch="A Blocked Channel", vt="A Blocked Video"',
                    blockVideos: true,
                    titleAction: 2,
                    titleReplaceText: 'Blocked!',
                    thumbnailAction: 2,
                    uniqueId: 'blocked'
                }
            ],
            default: {
                name: '',
                desc: '',
                tagList: '',
                enabled: true,
                // UpdateUrl: null,
                hideAllContent: false,
                blockVideos: false,
                titleAction: 1, // 0: nothing, 1: autocorrect, 2: replace with custom text, 3: remove
                titleReplaceText: '',
                channelNameAction: 0, // 0: nothing, 1: replace with custom text, 2: remove
                channelNameReplaceText: '',
                thumbnailAction: 0, // 0: nothing, 1: blur, 2: remove
                uniqueId(){
                    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890';
                    return 'custom-' + Array.from({length: 16}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
                }
            }
        },
        promo: { // These arn't really options
            triggerShowUpdate: false, // Extension just updated, so show the update notification
            lastUpdateShowedNotification: '', // The last version of ytr when an update was shown
            proUnlocked: false,
            email: '',

            leftTweet: 0,
            leftFacebookPost: 0,
            leftLinkedinPost: 0,
            leftChromeStoreReview: 0,
            freeUnlock: false
        },
        notifications: {
            warnOldYoutube: true, // Warn that ytr can't work on old
            showUpdate: true, // Show update notification when ytr is updated
            showUpdateCuratedFilters: true
        }
    },
    stats = {
        startedCollectingOn: getToday(),
        //videoSuggestionsBlocked: 0,

        // Holds the total watchtime and views for each day
        __dailyTotals: {
            initial: [],
            default: {
                date: '',
                time: 0,
                views: 0
            }
        },
        // A dictionary that holds the most recent name for a channel by id
        channelNames: Object,
        // Holds channel watchtimes and views each day.  data is deleted after 30 days
        __pastMonthStats: {
            initial: [],
            default: {
                date: '',
                __stats: {
                    initial: [],
                    default: {
                        id: '',
                        time: 0,
                        views: 0,
                        likes: 0,
                        dislikes: 0
                    }
                }
            }
        },
        // Holds channel watchtimes, views, likes, and dislikes for all time
        __globalStats: {
            initial: [],
            default: {
                id: '',
                views: 0,
                time: 0,
                likes: 0,
                dislikes: 0
            }
        }
    };

// Misc variables
let facebookShareInjectJsInterval,
    linkedinShareInjectJsInterval;

    
// #region Ad Blocking

// Blocking ads is as simple as blocking the same urls adblock does
// Youtube plays the video by default if the ads don't load, so no need for complex scripts!
chrome.webRequest.onBeforeRequest.addListener(info => {
    // Only block when adblock is enabled and the video isn't in an iframe imbedded on a web site
    if (options.adBlock && info.parentFrameId == -1)
        return { cancel: true };
}, {
        urls: [
            '*://www.youtube.com/api/stats/qoe?*',
            '*://www.youtube.com/api/stats/ads?*',
            '*://www.youtube.com/api/stats/atr?*',
            '*://www.youtube.com/get_midroll_info?*',
            '*://www.youtube.com/get_video_info?*',
            '*://www.youtube.com/pagead/*',
            '*://www.youtube.com/yts/jsbin/*/www-pagead-id.js'
        ]
    },
    ['blocking']
);

// Other urls blocked by adblock. unfortunately ytr can't block these because it only has permissions to block youtube urls
// https://securepubads.g.doubleclick.net/pcs/view?
// https://googleads.g.doubleclick.net/pagead/viewthroughconversion/971134070/?
// https://googleads.g.doubleclick.net/pagead/id
// https://www.google.com/pagead/lvz?
// https://googleads.g.doubleclick.net/pagead/lopri?
// https://static.doubleclick.net/instream/ad_status.js

// #endregion


// User auth
{
    let forceRecheck = false,
        callbacks = [];
    const runCallbacks = (success) => {
        for(let callback of callbacks)
            if(callback)
                callback(success);
        callbacks = [];
    };
    const emailCheckListenerCallback = ({email}) => {
        // If we have an email and the email saved isn't the current one
        if(email && email.trim() && (email != options.promo.email || forceRecheck)){
            forceRecheck = false;
            if(options.promo.proUnlocked){
                // If pro is already unlocked, just update the email.  A user who unlocked pro, should never have it return to being not unlocked
                options.promo.email = email;
                chrome.storage.local.set({options});
                runCallbacks(true);
            }else{
                // Just unlock it for free
                options.promo.email = email;
                if(json.unlocked){
                    options.promo.proUnlocked = true;
                    options.promo.freeUnlock = false;
                }
                chrome.storage.local.set({options});
                runCallbacks(!!json.unlocked);
            }
        }
    };
    const checkProEmail = () => chrome.identity.getProfileUserInfo(emailCheckListenerCallback);
    const reCheckProEmail = (callback) => {
        forceRecheck = true;
        callbacks.push(callback);
        checkProEmail();
    };

    // Immediately check if email is unlocked
    setTimeout(checkProEmail, 2 * 1000);
    // If network state changes
    window.addEventListener('online', checkProEmail);
    // Whenever user email changes
    chrome.identity.onSignInChanged.addListener(emailCheckListenerCallback);

    // Make public
    /* global reCheckProEmail:false */
    this.reCheckProEmail = reCheckProEmail;
}


// Grab options and stats, merge with default settings, and save
chrome.storage.local.get(['options', 'stats'], function(res){
    options = mergeDefaultAndUserSettings(options, res.options);
    stats = mergeDefaultAndUserSettings(stats, res.stats);
    chrome.storage.local.set({options, stats, filterCache: regenerateFilterCache()});
});


// Whenever options are changed, update options
chrome.storage.onChanged.addListener(function(changes){
    if(changes.options){
        options = changes.options.newValue;

        chrome.storage.local.set({filterCache: regenerateFilterCache()});
    }
});


// #region OnMessage received from content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    let {method, channelName, videoId, filterId, forcefullyApplyFilter} = request;
    // #region Stats
    // Receive and record stats
    if(method === 'stats-add-video-view' || method === 'stats-add-watchtime'){
        if(!options.enableStats)
            return;

        let today = getToday(),
            addView = method == 'stats-add-video-view';

        // First, add to dailyTotals
        let daily = stats.dailyTotals[0];
        if(!daily || daily.date != today){
            daily = {
                date: today,
                time: 0,
                views: 0
            };
            stats.dailyTotals.unshift(daily);

            // Remove any old days from the end of daily totals
            while(new Date(today) - new Date(stats.dailyTotals[stats.dailyTotals.length - 1].date) > 3024e6)
                stats.dailyTotals.pop();
        }
        daily.time += request.watchTime;
        if(addView) daily.views++;

        // Second add to today's date in pastMonthStats
        let day = stats.pastMonthStats[0];
        if(!day || day.date != today){
            day = {
                date: today,
                stats: []
            };
            stats.pastMonthStats.unshift(day);
        }

        let daystat = day.stats.find((x) => x.id == request.channelId);
        if(!daystat){
            daystat = {
                id: request.channelId,
                views: 0,
                time: 0,
                likes: 0,
                dislikes: 0
            };
            day.stats.push(daystat);
        }
        daystat.time     += request.watchTime;
        daystat.likes    += request.likes;// TODO: might need to be math.round to prevent decimals from appearing
        daystat.dislikes += request.dislikes;
        if(addView)
            daystat.views++;

        // Third, and finally, add to globalStats
        let global = stats.globalStats.find((x) => x.id == request.channelId);
        if(!global){
            global = {
                id: request.channelId,
                views: 0,
                time: 0,
                likes: 0,
                dislikes: 0
            };
            stats.globalStats.push(global);
        }
        global.time     += request.watchTime;
        global.likes    += request.likes;
        global.dislikes += request.dislikes;
        if(addView)
            global.views++;

        // Lastly update name for this user in the channelNames dictionary
        if(request.channelName && request.channelName.trim())
            stats.channelNames[request.channelId] = request.channelName;
        
        // Save new stats
        chrome.storage.local.set({stats});
    }
    // Clear all stats and reset the date
    else if(method === 'clear-stats'){
        stats = {
            startedCollectingOn: getToday(),
            dailyTotals: [],
            channelNames: {},
            pastMonthStats: [],
            globalStats: []
        };
        chrome.storage.local.set({stats});
        sendResponse(stats);
    }
    // #endregion

    // #region Filter settings
    else if(method === 'add-video-to-blocked'){ // Removes all vi= tags in default and adds a vi= tag to blocked
        removeTagsFromTwoFiltersAndAddTagsToSecond(0, [new Tag('vi', '=', videoId)], true, 1, [new Tag('vi', '=', videoId)]);
    }else if(method === 'remove-video-from-blocked'){ // Removes all vi= tags in blocked and optionally adds a vi= tag to default
        removeTagsFromTwoFiltersAndAddTagsToSecond(1, [new Tag('vi', '=', videoId)], forcefullyApplyFilter, 0, [new Tag('vi', '=', videoId)]);
    }else if(method === 'add-channel-to-blocked'){ // Removes all vi= and ch= tags in default and adds a ch= tag to blocked
        removeTagsFromTwoFiltersAndAddTagsToSecond(0, [new Tag('vi', '=', videoId), new Tag('ch', '=', channelName)], true, 1, [new Tag('ch', '=', channelName)]);
    }else if(method === 'remove-channel-from-blocked'){ // Removes all vi= and ch= tags in blocked and optionally adds a ch= tag to default
        removeTagsFromTwoFiltersAndAddTagsToSecond(1, [new Tag('vi', '=', videoId), new Tag('ch', '=', channelName)], forcefullyApplyFilter, 0, [new Tag('ch', '=', channelName)]);
    }
    // #endregion

    // #region Misc/Utils
    else if(method === 'get-full-parsed-filter'){
        if(filterId in options.filters){
            let {groupedTags, tags} = Tag.parseList(options.filters[filterId].tagList);
            sendResponse({
                groupedTags: groupedTags.map(g => g.map(t => [t.type, t.comparator, normalifyTagValue(t)])),
                tags: tags.map(t => [t.type, t.comparator, normalifyTagValue(t)])
            });
        }
    }else if(method === 'open-or-focus-options-page'){
        chrome.runtime.openOptionsPage();
        
        // Find any open options page and focus it;
        /* TODO: Remove
        for (let w of chrome.extension.getViews()) {
            if (w.location.pathname == '/options.html') {
                w.focusAndBringThisPageToFront(hash);
                return;
            }
        }

        // If the above loop never found an open options page, then open a new options page
        chrome.tabs.create({url: 'options.html' + (hash || '')});*/
    }else if(method === 'get-donate-auth-info'){
        sendResponse({
            email: options.promo.email,
            proUnlocked: options.promo.proUnlocked
        });
    }else if(method === 'check-pro-email'){
        reCheckProEmail(success => sendResponse(success));
    }
    // #endregion

    // #region Share
    else if(method === 'clicked-twitter-share'){
        const text = 'Browsing a better #YouTube with the #YouTubeRefined #ChromeExtension';
        const permission = {origins: ['*://twitter.com/intent/tweet/*']};

        clickedShared('leftTweet', 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), permission, () => {
            chrome.webRequest.onBeforeRequest.addListener(info => {
                if(info.url && decodeURIComponent(info.url.replace(/^https?/, '')).startsWith('://twitter.com/intent/tweet/complete?text=' + text)){
                    options.promo.leftTweet = 1;
                    chrome.storage.local.set({options});
                    chrome.permissions.remove(permission);
                }
            }, {
                urls: ['*://twitter.com/intent/tweet/complete?*']
            });
        });
    }else if(method === 'clicked-facebook-share'){
        clickedShared('leftFacebookPost', 'https://www.facebook.com/sharer/sharer.php', '*://www.facebook.com/sharer/*', () => {
            // Try to run content script on opened facebook page
            facebookShareInjectJsInterval = setInterval(() => {
                chrome.tabs.query({}, tabs => {
                    for(let tab of tabs)
                        if(tab.url && tab.url.replace(/^https?/, '').startsWith('://www.facebook.com/sharer/sharer.php?') && !tab.url.endsWith('#ytr'))
                            chrome.tabs.executeScript(tab.id, { file: 'scripts/content/share.js' });
                });
            }, 500);

            // Stop after some time.  keep running because if user needs to log in, give them the time to do so
            setTimeout(() => clearInterval(facebookShareInjectJsInterval), 10 * 60 * 1000);
        });
    }else if(method === 'clicked-linkedin-share'){
        clickedShared('leftLinkedinPost', 'http://www.linkedin.com/shareArticle?mini=true', '*://www.linkedin.com/*', () => {
            // Try to run content script on opened facebook page
            linkedinShareInjectJsInterval = setInterval(() => {
                chrome.tabs.query({}, tabs => {
                    for(let tab of tabs)
                        if(tab.url && (tab.url.replace(/^https?/, '').startsWith('://www.linkedin.com/shareArticle?') || tab.url.replace(/^https?/, '').startsWith('://www.linkedin.com/sharing/share-offsite')) && !tab.url.endsWith('#ytr'))
                            chrome.tabs.executeScript(tab.id, { file: 'scripts/content/share.js' });
                });
            }, 500);

            // Stop after some time.  keep running because if user needs to log in, give them the time to do so
            setTimeout(() => clearInterval(linkedinShareInjectJsInterval), 10 * 60 * 1000);
        });
    }else if(method === 'shared-with-facebook'){
        options.promo.leftFacebookPost = 1;
        chrome.storage.local.set({options});
        chrome.permissions.remove({origins: ['*://www.facebook.com/sharer/*']});
        clearInterval(facebookShareInjectJsInterval);
    }else if(method === 'shared-with-linkedin'){
        options.promo.leftLinkedinPost = 1;
        chrome.storage.local.set({options});
        chrome.permissions.remove({origins: ['*://www.linkedin.com/*']});
        clearInterval(linkedinShareInjectJsInterval);

        // Let script know it can submit the post now
        sendResponse();
    }
    // #endregion
});
// #endregion



// Open options page when the user clicks on the browser action icon
chrome.browserAction.onClicked.addListener(() => chrome.runtime.openOptionsPage());




// On install
chrome.runtime.onInstalled.addListener(function(details){
    setTimeout(function(){
        if(details.reason == 'install'){

            // Trigger first show install message
            options.promo.triggerShowUpdate = true;
            options.promo.lastUpdateShowedNotification = ''; // On install this variable should be empty, triggering the update notification
            chrome.storage.local.set({options});

            setTimeout(() => {
                chrome.tabs.query({}, function(tabs){
                    // Insert scripts into every tab right on start
                    for (let tab of tabs) {
                        if (tab.url && constants.regex.matchYoutubeUrl.test(tab.url)) {
                            let id = tab.id;
                            chrome.tabs.insertCSS(id, { file: 'css/content.css' });
                            chrome.tabs.executeScript(id, { file: 'scripts/common/title-caps.js' }, () =>
                                chrome.tabs.executeScript(id, { file: 'scripts/content/youtube.js' })
                            );
                        }
                    }

                    // Open youtube homepage to show install message
                    chrome.tabs.create({ url: 'https://www.youtube.com/' });
                });
            }, 1000);

        }else if(details.reason == 'update'){
            // Only show update notification if there are new updates to show and if user didn't disable showing the notification
            if(updateNotes[updateNotes.length - 1].version != options.promo.lastUpdateShowedNotification && options.notifications.showUpdate && !options.promo.triggerShowUpdate){
                setTimeout(function(){
                    options.promo.triggerShowUpdate = true;
                    if(!options.promo.lastUpdateShowedNotification)
                        options.promo.lastUpdateShowedNotification = 'initial';
                    chrome.storage.local.set({options});
                }, 10 * 1000);
            }
        }
    }, 1000);
});




// Returns today's date in the format mm/dd/yyyy
function getToday(){
    let d = new Date();
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
}


function normalify(string){
    return string.trim().replace(/\s+/g, ' ');
}


/*
    Using the taglist strings, generate the filterCache list
    structures it like so:
    filterCache: {
        videoid: {
            'saddaszxc': 0,
            'czxsadfds': 1
        },
        channels: {
            'lowercase simplified channel name': 0,
            'another channel': 0,
            'other channel. includes secondary test': [//is a 2d array because multiple different filters can have groups containing a channel
                [//first in this list are first filters, so they are the first ones to be tested
                    0,
                    ['vt', '~', 'thing'],
                    ['vt', '~', 'thing']
                ],[
                    1,
                    ['vt', '~', 'thing'],
                    ['vt', '~', 'thing']
                ],
                3//if it doesn't match any of the filters, then it defaults to this one
            ]
        },
        searchgroups: [//first in this list are first filters, so they are the first ones to be tested
            [0, 'vt', '~', 'thing'],
            [1, 'vt', '~', 'thing'],
            [
                2,
                ['vt', '~', 'thing'],
                ['vt', '~', 'thing']
            ],
            [3, 'vt', '/', new RegExr()]
        ]
    }
*/
function regenerateFilterCache(){
    let filterCache = {
        videoid: {},
        channels: {},
        searchgroups: []
    };

    if(options.filters){
        // For every filter
        for(let id in options.filters){
            let filterId = parseInt(id), // FilterId is a string, convert back to int
                filter = options.filters[filterId];
            
            if(filter.enabled){
                let {groupedTags, tags} = Tag.parseList(filter.tagList);

                // Go through tags
                for(let tag of tags){
                    if(!tag.isError()){
                        let normalizedValue = normalifyTagValue(tag);
                        if(tag.type == 'vi' && tag.comparator == '='){
                            if(!(normalizedValue in filterCache.videoid))
                                filterCache.videoid[normalizedValue] = filterId;
                        }else if(tag.getDisplayMode() == 'ch'){
                            let ch = filterCache.channels[normalizedValue];
                            if(ch){
                                if(Array.isArray(ch) && !Number.isInteger(ch[ch.length - 1])) // If a channel filter doesn't have a default value, set it
                                    ch.push(filterId);
                            }else{
                                filterCache.channels[normalizedValue] = filterId;
                            }
                        }else{
                            filterCache.searchgroups.push([filterId, tag.type, tag.comparator, normalizedValue]);
                        }
                    }
                }

                // Go through groupedTags
                groupedTags.forEach(group => {
                    let ch;

                    // Search for a ch= in this group, removing them from the array
                    for(let i = group.length; i-- > 0;){
                        if(group[i].type == 'vi' || group[i].isError()){ // Vi and error tags make a group invalid
                            return;
                        }else if(group[i].getDisplayMode() == 'ch'){
                            // If a channel was already found in this group, then the group is invalid
                            if(ch)
                                return;
                            ch = group.splice(i, 1)[0];
                        }
                    }

                    let f = [filterId, ...group.map((t) => [t.type, t.comparator, normalifyTagValue(t)])];
                    if(ch){
                        let channelname = normalifyTagValue(ch);
                        if(!filterCache.channels[channelname])
                            filterCache.channels[channelname] = [];
                        filterCache.channels[channelname].push(f);
                    }else{
                        filterCache.searchgroups.push(f);
                    }
                });
            }
        }
    }

    return filterCache;
}


function normalifyTagValue({type, comparator, value}){
    if(comparator == '/')
        return value;
    else if(type == 'vi')
        return value.trim();
    else
        return normalify(value).toLowerCase();
}


// Helper function that blocks or unblocks a video given some settings
function removeTagsFromTwoFiltersAndAddTagsToSecond(filterIdRemove, tagsRemove, shouldAddTags, filterIdAdd, tagsAdd){
    let filterRemove = options.filters[filterIdRemove],
        filterAdd = options.filters[filterIdAdd],
        {groupedTags: filterRemoveGroupedTags, tags: filterRemoveTags} = Tag.parseList(filterRemove.tagList),
        {groupedTags: filterAddGroupedTags, tags: filterAddTags} = Tag.parseList(filterAdd.tagList),
        chEqualsTagsRemove = tagsRemove.filter(t => t.getDisplayMode() == 'ch'),
        origFilterRemoveTotalLength = filterRemoveTags.length + filterRemoveGroupedTags.length,
        origFilterAddTotalLength = filterAddTags.length + filterAddGroupedTags.length;
    
    // Remove tagsRemove from the filterAddTags to prevent duplicant tags
    filterAddTags = filterAddTags.filter(t => !tagsRemove.some(r => r.equals(t)));

    // Remove tagsRemove from filterRemoveTags.  if we are removing ch= tags, remove grouped tags containing those same ch= tags
    filterRemoveTags = filterRemoveTags.filter(t => !tagsRemove.some(r => r.equals(t)));
    if(chEqualsTagsRemove.length)
        filterRemoveGroupedTags = filterRemoveGroupedTags.filter(a => !a.some(t => chEqualsTagsRemove.some(r => r.equals(t))));

    // Remove ch= containing grouped tags from filterRemove.  don't remove from filterAddTags, because that could already contain similar 
    filterRemoveGroupedTags = filterRemoveGroupedTags.filter(a => !a.some(t => chEqualsTagsRemove.some(r => r.equals(t))));

    // Parse taglist back to string if it changed
    if(origFilterRemoveTotalLength != filterRemoveTags.length + filterRemoveGroupedTags.length)
        filterRemove.tagList = Tag.stringifyList(filterRemoveGroupedTags, filterRemoveTags);
    if(origFilterAddTotalLength != filterAddTags.length)
        filterAdd.tagList = Tag.stringifyList(filterAddGroupedTags, filterAddTags);

    // Optionally add tag to second list
    if(shouldAddTags)
        filterAdd.tagList += (filterAdd.tagList.trim() ? ', ' : '') + tagsAdd.map(g => Array.isArray(g) ? g.join(' & ') : g).join(', ');

    // Tags changed, so save and regenerate filter cache
    if(shouldAddTags || origFilterRemoveTotalLength != filterRemoveTags.length + filterRemoveGroupedTags.length || origFilterAddTotalLength != filterAddTags.length){
        chrome.storage.local.set({options, filterCache: regenerateFilterCache()});
    }
}

// Helper function
function clickedShared(key, url, permission, defaultFunc){
    if(typeof permission == 'string')
        permission = {origins: [permission]};
    
    // If pro is unlocked, the shared was completed, or 2 other shared were completed
    if(options.promo.proUnlocked || options.promo[key] == 1 || ['leftChromeStoreReview', 'leftFacebookPost', 'leftTweet', 'leftLinkedinPost'].map(v => options.promo[v]).filter(v => v == 1 || (v > 1 && v < Date.now())).length >= 2){
        chrome.tabs.create({ url });
        options.promo[key] = 1;
        chrome.storage.local.set({options});
    }else{
        chrome.permissions.request(permission, granted => {
            if(granted){
                chrome.tabs.create({ url });
                options.promo[key] = Date.now() + 120 * 1000;
                chrome.storage.local.set({options});

                defaultFunc();
            }
        });
    }
}

// Using the structure of a 'default' object, merges user settings and defaults.
// - only uses keys from defaults (except for empty objects aka dictionaries).  any other keys will be deleted
// - arrays are merged as you would expect them to be.
// - double underscore key array merging system using an initial array and default values for all the array's indexes merged with default user settings
function mergeDefaultAndUserSettings(def, usr){
    let ret = {};
    // Usr should always be an object
    if(typeof(usr) != 'object')
        usr = {};
    // Loop through all keys defined by default
    for(let [k, d] of Object.entries(def)){
        // Double underscore merging system
        if(k.startsWith('__')){
            // Only works if we are given an initial value array and default object value
            if(Array.isArray(d.initial) && typeof(d.default) == 'object' && !Array.isArray(d.default)){
                let ar = [],
                    truekey = k.substring(2),
                    u = usr[truekey] || [];
                for(let i = Math.max(d.initial.length, u.length); i-- > 0;){
                    ar.unshift(mergeThings(
                        d.initial[i] ? Object.assign(Object.assign({}, d.default), d.initial[i]) : d.default, // Merge initial and default.  combined those will be this array index's defaults
                        u[i]
                    ));
                }
                ret[truekey] = ar;
            }
        }
        // Everything else just merge
        else
            ret[k] = mergeThings(d, usr[k]);
    }
    return ret;
}

// A helper function for mergeDefaultAndUserSettings
function mergeThings(d, u){
    if(typeof d == 'function')
        d = d();
    if(d == undefined || d == null)
        return u;
        
    if(d == Array || (Array.isArray(d) && d.length == 0)){// Is an empty array
        return u || [];
    }else if(Array.isArray(d)){ // Is a non-empty array
        // Arrays shouldn't be merged since user could remove default values and wouldn't expect them to reappear. rather the default is only loaded in when no user setting is present
        return u ? u : d;
        /* TODO: remove
        let ret = [];
        u = u || [];
        for(let i = Math.max(d.length, u.length); i-- > 0;)
            ret.unshift(mergeThings(d[i], u[i]));
        return ret;*/
    }else if(d == Object || (typeof(d) == 'object' && Object.keys(d).length == 0)){ // Is an empty object, aka a dictionary. don't limit keys as given by default
        return u || {};
    }else if(typeof(d) == 'object'){ // Is a non-empty object
        return mergeDefaultAndUserSettings(d, u);
    }else{
        return u != undefined && u != null ? u : d;
    }
}