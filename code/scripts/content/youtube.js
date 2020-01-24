// ============================
// Copyright 2018 Marc Guiselin
// ============================

// #region functions, constants and globals
// Define helper functions
function stringToEl(html){
    let element = document.createElement('div');
    element.innerHTML = html.trim();
    element = element.firstChild;
    element.parentElement.removeChild(element);
    return element;
}
function getVideoIdFromUrl(url){
    if(url){
        let match = constants.regex.videoIdRegexMatch.exec(url);
        return match && match.length ? match[2] : null;
    }else{
        return null;
    }
}
function prettyViews(n){
    if (n < 0)
        return 'no views';
    else if (n == 1)
        return '1 view';
    else if (n < 1000)
        return n + ' views';
    else if (n < 990000)
        return Math.max(1, Math.round(n / 1000)) + 'K views'; // K on youtube are never decimals
    else if (n < 990000000)
        return Math.max(1, Math.round(n / 100000) / 10) + 'M views';
    else
        return Math.max(1, Math.round(n / 100000000) / 10) + 'B views';
}
function prettyLikes(n){
    n = parseInt(n.replace(/\D/g, ''));

    if (n < 0)
        return 'none';
    else if (n == 1)
        return '1';
    else if (n < 1000)
        return n;
    else if (n < 990000)
        return Math.max(1, Math.round(n / 1000)) + 'K'; // K on youtube are never decimals
    else if (n < 990000000)
        return Math.max(1, Math.round(n / 100000) / 10) + 'M';
    else
        return Math.max(1, Math.round(n / 100000000) / 10) + 'B';
}
function defaultGetVideoId(){
    return getVideoIdFromUrl(this.querySelector('#thumbnail').getAttribute('href'));
}
function defaultGetVideoTitle($title){
    return $title ? ($title.getAttribute('title') || $title.textContent).trim() : null;
}
function defaultGrabViewAndAgeData($viewCount, ytrData){
    // Grab exact video view count from a string stored in an attribute.
    let info = constants.regex.viewInfoParse.exec(
        this.querySelector('#video-title, #title').getAttribute('aria-label')
    );

    if(info){
        ytrData.videoTimeAgoText = info[1];
        ytrData.exactViewCountText = info[2];
        ytrData.viewsCount = parseInt(info[2].replace(/\D/g, ''));
        ytrData.prettyViewCountText = prettyViews(ytrData.viewsCount);
    }

    if($viewCount)
        ytrData.isRecommended = $viewCount.textContent.includes('Recommended for you');
}
function defaultGetChannelName(){
    let $el = this.querySelector('#byline-container:not([hidden]) #byline') || document.querySelector('#channel-header #channel-title');
    if($el)
        return $el.textContent;
}
function normalify(string){
    return string.trim().replace(/\s+/g, ' ');
}


// Define constants
const constants = Object.freeze({
    regex: {
        emoji: /\s*(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])+\s*/g,
        repeatingNonLetterChars: /([^\w\s]|_)(\s*\1+)+/g,
        elipses: /\s*\*+[^*]{3,24}\*+\s*/g,
        hashtags: /\s*#[^\s#\d][^\s#)(]{2,20}?(?=\s|$|\)|\]|\.)/g,
        dotdotdot: /\.{3,}/g,
        viewInfoParse: /(\d+\s+\w+\s+ago).+?([\d,]+\s+views?)\s*$/i,
        videoIdRegexMatch: /(v=)([\w-]{8,14})/,
        replaceOldRatingsPreviewMode: /\s*(ytr-ratings-preview-mode-\d+)\s*|$/i,
        questionMarkExclamationPoint: /\??!\?[?!]*/g,
        emojiReplaceDictionary: [
            ['!',    /\u203C|\u2755|\u2757/g],
            ['!?',   /\u2049/g],
            ['?',    /\u2753|\u2754/g],
            ['',     /\uFE0F\u20E3/g], // All keycap emojis can be replaced with their normal number equivalent by removing these characters
            ['10',   /\uD83D\uDD1F/g],
            ['A',    /\uD83C\uDD70/g],
            ['AB',   /\uD83C\uDD8E/g],
            ['B',    /\uD83C\uDD71/g],
            ['CL',   /\uD83C\uDD91/g],
            ['Cool', /\uD83C\uDD92/g],
            ['Free', /\uD83C\uDD93/g],
            ['i',    /\u2139/g],
            ['ID',   /\uD83C\uDD94/g],
            ['M',    /\u24C2/g],
            ['New',  /\uD83C\uDD95/g],
            ['NG',   /\uD83C\uDD96/g],
            ['O',    /\uD83C\uDD7E/g],
            ['OK',   /\uD83C\uDD97/g],
            ['P',    /\uD83C\uDD7F/g],
            ['SOS',  /\uD83C\uDD98/g],
            ['Up!',  /\uD83C\uDD99/g],
            ['VS',   /\uD83C\uDD9A/g]
        ]
    },
    themeBackgrounds: {
        default: 'white',
        dark: '#262626',
        fade: 'linear-gradient(to right, rgba(254, 203, 111, 1) 0%, rgba(252, 155, 112, 1) 15%, rgba(237, 106, 111, 1) 30%, rgba(203, 78, 108, 1) 48%, rgba(140, 65, 104, 1) 65%, rgba(81, 60, 99, 1) 82%, rgba(57, 59, 98, 1) 100%)'
    },
    html: {
        oldYoutubeWarning: `
            <div id="ytr-basic-notification">
                <span class="ytr-close-button">&Cross;</span>
                <h3>Youtube Refined disabled</h3>
                Youtube Refined can't work on the old version of youtube.  Please switch to the <a href="/new">new</a> version.
                <br><a class="ytr-dont-remind" href="#">Don't remind me</a>
            </div>
        `,
        videoBlockedMenu: `
            <div class="ytr-video-blocked-menu">
                <div class="ytr-centered">
                    <h2>This video was blocked</h2>
                    <h4><button id="ytr-temp-unblock">Temporarily unblock this video</button></h4>
                    <h5>&nbsp;</h5>
                    <h4><button id="ytr-unblock-video">Unblock this video</button></h4>
                    <h4><button id="ytr-unblock-channel">Unblock videos from this channel</button></h4>
                    <h4><button id="ytr-change-filter-settings">Change filter settings</button></h4>
                </div>
            </div>
        `,
        interactionButton: `
            <div class='ytr-interaction-button'>
                <svg width="100%" height="100%" viewBox="0 0 24 24" xml:space="preserve">
                    <path d="M5.21,4.861l13.58,0l-5.445,7.577l-0.809,7.387l-1.039,0.742l-0.845,-8.133l-5.442,-7.573Z"/>
                </svg>
            </div>
        `
    }
});
const groups = Object.freeze([
    /* {
        matches '' required

        query '' required
        thumbnailQuery ''
        getChannelName()
        getVideoId()

        titleQuery ''
        getVideoTitle($title)

        viewCountQuery: ''
        grabViewAndAgeData($viewCount, ytrData)

        rescanAnyways Bool
        hasVideoElement Bool
        hasLikeDislikeButton Bool  can only use if hasVideoElement is true
        getChannelId()  required if hasVideoElement is true
        additionalTasks($title)

        interactionButton: {
            placeIn: '' optional
        }
    }*/

    // Video suggestions listed next to the video on /watch pages, including videos in a playlist
    {
        matches: null,

        // Regular video                 video in playlist
        query: 'ytd-compact-video-renderer, ytd-playlist-panel-video-renderer',
        thumbnailQuery: 'ytd-thumbnail',
        getChannelName: defaultGetChannelName,
        getVideoId: defaultGetVideoId,

        titleQuery: '#video-title',
        getVideoTitle: defaultGetVideoTitle,

        viewCountQuery: '#metadata-line',
        grabViewAndAgeData: defaultGrabViewAndAgeData,

        interactionButton: {}
    },

    // Video suggestions listed in a grid on channel home pages and videos page. check out https://www.youtube.com/channel/UCEgdi0XIXXZ-qJOFPf4JSKw and https://www.youtube.com/
    // Special video suggestions that sometimes appear at the top of a channel home page.  reffered to as newspaper-renderers for some reason https://i.imgur.com/w4opVFo.png
    // Larger video suggestion that appears next to newspaper suggestions https://i.imgur.com/w4opVFo.png
    // Large vertically listed video suggestions on channel/user home pages, the trending page, and home page. check out https://i.imgur.com/XHTfpjY.png and https://www.youtube.com/channel/UC7A_dLnSAjl7uROCdoNyjzg
    { 
        matches: null,

        query: 'ytd-grid-video-renderer, ytd-newspaper-mini-video-renderer, ytd-newspaper-hero-video-renderer, ytd-video-renderer, ytd-rich-item-renderer',
        thumbnailQuery: 'ytd-thumbnail',
        getChannelName: defaultGetChannelName,
        getVideoId: defaultGetVideoId,

        titleQuery: '#video-title',
        getVideoTitle: defaultGetVideoTitle,

        viewCountQuery: '#metadata-line>span:first-child',
        grabViewAndAgeData: defaultGrabViewAndAgeData,

        interactionButton: {
            placeIn: '#dismissable .text-wrapper, #details' // For everything else, for ytd-video-renderer//#details, 
        }
    },

    // Currently watching video on /watch pages
    {
        matches: /^\/watch/i,

        query: 'ytd-watch, ytd-watch-flexy',
        getChannelName(){
            return (this.querySelector('ytd-video-owner-renderer > a') || this).getAttribute('aria-label');
        },
        getVideoId(){
            return this.getAttribute('video-id');
        },

        titleQuery: '#info h1.title',
        getVideoTitle(){
            let $el = this.querySelector('.html5-video-player:not(.ad-showing) .ytp-title .ytp-title-link');
            if($el)
                return $el.textContent;
        },

        grabViewAndAgeData($viewCount, ytrData){
            let $viewsContainer = this.querySelector('#count .view-count');
            if($viewsContainer && $viewsContainer.textContent)
                ytrData.viewsCount = parseInt($viewsContainer.textContent.replace(/\D/g, ''));
        },

        rescanAnyways: true, // Title loads a bit after the page, so this is required
        hasVideoElement: true,
        hasLikeDislikeButton: true,
        getChannelId(){
            // Grab id straight from channel name link, Sometimes channel name links to a playlist.  If so, try to grab the id from the expanding overlay.
            let href = this.querySelector('#upload-info #owner-name a[href^="/channel/"], #player-container a[href^="/channel/"]');
            if(href)
                return href.getAttribute('href').substr(9);
            // Sometimes there just really isn't a channel id to be had on the page (like: https://www.youtube.com/watch?v=N3aAXlYgW10)
            return getChannelIdFromVideoId(getVideoIdFromUrl(location.search));
        },
        additionalTasks($title){
            // Also autocorrect title of page
            if($title && $title.textContent)
                document.title = $title.textContent + ' - YouTube';

            // Add actual like/dislike count below video if enabled
            for(let likeButton of this.querySelectorAll('#top-level-buttons #text')){
                if(likeButton.hasAttribute('aria-label')){
                    let count = /[\d,]*/.exec(likeButton.getAttribute('aria-label'))[0];
                    if(count)
                        likeButton.textContent = options.exactLikeDislikeCount ? count : prettyLikes(count);
                }
            }
        },

        interactionButton: {
            placeIn: 'ytd-video-primary-info-renderer > #container'
        }
    },

    // Currently watching video on channel home page
    {
        matches: /^\/(channel|user)\//i,

        query: 'ytd-channel-video-player-renderer',
        getChannelName(){
            let $el = document.querySelector('#channel-container #channel-title') || this.querySelector('.html5-endscreen .ytp-author-name');
            return $el && $el.textContent;
        },
        getVideoId(){
            return (this.querySelector('#title a') || this).getAttribute('href');
        },

        titleQuery: '#title a',
        getVideoTitle($title){
            return (this.querySelector('#player .ytp-title .ytp-title-link') || $title).textContent;
        },

        grabViewAndAgeData: defaultGrabViewAndAgeData,

        hasVideoElement: true,
        hasLikeDislikeButton: false,
        getChannelId(){
            let href = (this.querySelector('a[href*="/channel/"]') || document.querySelector('head meta[href*="/channel/"]') || this).getAttribute('href');
            if(href && href.substr(-33, 9) == '/channel/')
                return href.substr(-24);
        },
        /* TODO: remove
        additionalTasks($title){
            // Fix the second title on top of the video
            let el = this.querySelector('.ytp-title a.ytp-title-link');
            if($title && $title.textContent && el && el.textContent)
                el.textContent = $title.textContent;
        }*/
        interactionButton: {
            placeIn: '#content'
        }
    },

    // Video suggestions shown at end of video if autoplay is disabled
    {
        matches: null,

        query: '.ytp-videowall-still',
        thumbnailQuery: '.ytp-videowall-still-info',
        getChannelName(){
            return this.querySelector('.ytp-videowall-still-info-author').textContent.replace(/\s\u2022\s[^\u2022]*$/, '');
        },
        getVideoId(){
            return getVideoIdFromUrl(this.getAttribute('href'));
        },

        titleQuery: '.ytp-videowall-still-info-title',
        getVideoTitle(){
            return this.getAttribute('aria-label').substring(6);
        },

        viewCountQuery: '.ytp-videowall-still-info-title',

        rescanAnyways: false // Because when resizing the page the titles are reset
        /* TODO: remove
        additionalTasks: function () {
            let $viewCount = this.querySelector('.ytp-videowall-still-info-author'),
                ytrData = this.ytrData;

            // If view count data hasn't been grabbed before
            if (!ytrData.prettyCount) {
                // Grab exact video view count from a string stored in an attribute.
                let info = constants.regex.viewInfoParse.exec(
                    this.getAttribute('aria-label')//aria label is actual in parent
                );

                if (info) {
                    ytrData.timeAgo = info[1];
                    ytrData.exactCount = info[2];
                    ytrData.prettyCount = prettyViews(info[2]);

                    // Channel name is shown in front of view count (ex: name • 10K views), so this must be saved to be re-added later
                    let channelName = $viewCount.textContent.match(/^(.*)\s\u2022/);
                    ytrData.authorName = channelName.length == 2 ? channelName[1] : '';
                }
            }

            if (ytrData.prettyCount) {
                $viewCount.textContent =
                    (ytrData.authorName ? ytrData.authorName + ' \u2022 ' : '') +
                    (options.exactVideoViewCount ? ytrData.exactCount : ytrData.prettyCount) +
                    (options.showVideoAge ? ' \u2022 ' + ytrData.timeAgo : '');
            }
        }*/
    },

    // Matches in-video suggested video boxes
    {
        matches: null,

        query: '.html5-video-player .ytp-ce-video',
        titleQuery: '.ytp-ce-video-title',
        thumbnailQuery: '.ytp-ce-covering-image',
        getVideoId: function(){
            let $a = this.querySelector('a.ytp-ce-covering-overlay');
            if (!$a)
                return null;
            return getVideoIdFromUrl($a.getAttribute('href'));
        }
    },


    // Currently watching video in embeded player
    {
        matches: /^\/(embed|v)\//i,

        query: 'body',
        getChannelName(){
            // Author name can only be found in script element containing json
            for(let $s of document.querySelectorAll('body>script')){
                let match = $s.innerHTML && /"author":"(.+)/.exec($s.innerHTML),
                    author = '',
                    wasescape = false;
                if(match){
                    for(let i of match[1]){
                        if(!wasescape && i == '"'){
                            break;
                        }else if(!wasescape && i == '\\'){
                            wasescape = true;
                        }else{
                            wasescape = false;
                            author += i;
                        }
                    }
                    return author;
                }
            }
        },
        getVideoId(){
            let id = /(?:^\/embed\/)(\w{11,})/.exec(location.pathname);
            return id && id[1] || undefined;
        },

        titleQuery: '.ytp-chrome-top .ytp-title-link',
        getVideoTitle(){
            return document.title.slice(0, -10);
        },

        grabViewAndAgeData($viewCount, ytrData){
            // View count can only be found in script element containing json
            for(let $s of document.querySelectorAll('body>script')){
                let match = $s.innerHTML && /"view_count":(\d+)/.exec($s.innerHTML);
                if(match){
                    ytrData.viewsCount = parseInt(match[1]);
                    break;
                }
            }
        },

        rescanAnyways: true, // Title loads a bit after the page, so this is required
        hasVideoElement: true,
        hasLikeDislikeButton: false,
        getChannelId(){
            // View count can only be found in script element containing json
            for(let $s of document.querySelectorAll('body>script')){
                let match = $s.innerHTML && /"ucid":"([^"]+)/.exec($s.innerHTML);
                if(match)
                    return match[1];
            }
        },
        /* TODO: finish additionalTasks($title){

        },*/

        interactionButton: {
            placeIn: 'ytd-video-primary-info-renderer > #container'
        }
    },

    // More videos suggested videos
    {
        matches: /^\/(embed|v)\//i,

        query: '.ytp-suggestion-link',
        thumbnailQuery: ':scope',
        getChannelName(){
            let $el = this.querySelector('.ytp-suggestion-author');
            return $el && $el.textContent.replace(/\u2022[^\u2022]+$/, '').trim();
        },
        getVideoId(){
            return this.href && this.href.slice(-11);
        },

        titleQuery: '.ytp-suggestion-title',
        getVideoTitle: defaultGetVideoTitle,

        interactionButton: {}
    }
]);

// Define variables
let options,
    filterCache,
    videos = [],
    tempUnblockedVideoId = '',
    hidden = false,
    html = document.documentElement,
    settingsChangedWhenNotVisible = false,
    isLiveChat = location.pathname == '/live_chat',
    inIframe = (() => {
        try {
            return window.self !== window.top;
        }catch (e){
            return true;
        }
    })(),

    $themeStyle = stringToEl('<link type="text/css" rel="stylesheet"></link>');

// #endregion


// The ratings preview module
// Fetches video like/disike count and fills rating previews above thumbnails with data
{
    let API_ID = 'AIzaSyBAJG2nNJdeIRURRWs3FoOnWpHa_2LnMok',
        URL = `https://www.googleapis.com/youtube/v3/videos?part=statistics&fields=items(id,statistics(likeCount,dislikeCount))&key=${API_ID}&id=`,
        WAITTIME = 800,

        requestedVideoIds = [],
        grabDataSoonTimer,

        requestedIdsToPopulate = [],
        grabLocalStorageTimer,

        grabData = () => {
            if (requestedVideoIds.length > 0) {
                fetch(URL + requestedVideoIds.splice(0, 50).join(','), {
                    /*mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache',
                    credentials: 'omit', // include, *same-origin, omit
                    headers: {
                        Origin: 'https://www.youtube.com',
                        'Content-Type': 'application/json'
                    }*/
                })
                    .then(response => response.json())
                    .then(json => {
                        chrome.storage.local.get('videoLikeDislikeCache', res => {
                            let cache = res.videoLikeDislikeCache || {},
                                now = Math.round(Date.now() / 1000 / 60); // In minutes

                            // Remove old cached videos
                            for(let key of Object.keys(cache))
                                if(now - cache[key].time > (cache[key].likes + cache[key].dislikes < 40 ? 15 : 60)) // Cache lasts 60 minutes unless video has very few likes/dislikes; then it is 15
                                    delete cache[key];

                            // Add new data to cache
                            for(let item of json.items || []){
                                if(item.id && item.statistics){
                                    let ite = {
                                        time: now,
                                        id: item.id,
                                        likes: item.statistics ? parseInt(item.statistics.likeCount) : -1,
                                        dislikes: item.statistics ? parseInt(item.statistics.dislikeCount) : -1
                                    };

                                    cache[item.id] = ite;
                                    populateRatingsPreview(ite);
                                }
                            }

                            chrome.storage.local.set({videoLikeDislikeCache: cache});
                        });
                    });

                grabDataSoon();
            }
        },
        grabDataSoon = () => {
            if(requestedVideoIds.length > 0){
                if(grabDataSoonTimer)
                    clearTimeout(grabDataSoonTimer);
                grabDataSoonTimer = setTimeout(grabData, WAITTIME);
            }
        },
        populateRatingsPreview = (item) => {
            for (let $previewRatings of document.querySelectorAll(`.ytr-ratings-previewer[video-id='${item.id}']`)) {
                let $innerDiv = $previewRatings.firstElementChild;

                if($previewRatings && $innerDiv){
                    let totalVotes = item.likes + item.dislikes,
                        rating = totalVotes <= 0 ? 0 : item.likes / totalVotes;

                    if(totalVotes >= 6){
                        if (rating > 0.86)
                            $previewRatings.setAttribute('ranking', '2');
                        else if (rating > 0.65)
                            $previewRatings.setAttribute('ranking', '1');
                        else
                            $previewRatings.setAttribute('ranking', '0');

                        $innerDiv.textContent = Math.round(rating * 100) + '%';
                        $innerDiv.style.width = Math.max(15, (1 - Math.sin(Math.min(2, rating + 1.02) * 1.57079632679)) * 100) + '%';
                    }else{
                        $previewRatings.setAttribute('ranking', '0');
                        $innerDiv.textContent = '?';
                        $innerDiv.style.width = '0%';
                    }

                    if(item.likes == -1)
                        $previewRatings.setAttribute('title', 'Video publisher hid video likes/dislikes.');
                    else
                        $previewRatings.setAttribute('title', `Likes:     \u200A${item.likes}\nDislikes: ${item.dislikes}\nRatio:     ${(rating * 100).toFixed(2)}%`);
                }
            }
        };

    /* global ratingsPreviewPopulate:false */
    this.ratingsPreviewPopulate = (videoId) => {
        requestedIdsToPopulate.push(videoId);
        if(!grabLocalStorageTimer){
            grabLocalStorageTimer = setTimeout(() => {
                chrome.storage.local.get('videoLikeDislikeCache', res => {
                    let videoLikeDislikeCache = res.videoLikeDislikeCache || {};
                    for(let id of requestedIdsToPopulate){
                        let grab = videoLikeDislikeCache[id];
                        if(grab){
                            setTimeout(() => populateRatingsPreview(grab), WAITTIME);
                        }else{
                            if(!requestedVideoIds.includes(id))
                                requestedVideoIds.push(id);
            
                            if(requestedVideoIds.length >= 50)
                                grabData();
                            else
                                grabDataSoon();
                        }
                    }
                    requestedIdsToPopulate = [];
                    grabLocalStorageTimer = undefined;
                });
            }, 200);
        }
    };
}



// Fetch channel id from video id
{
    let API_ID = 'AIzaSyBAJG2nNJdeIRURRWs3FoOnWpHa_2LnMok',
        URL = `https://www.googleapis.com/youtube/v3/videos?part=snippet&fields=items(snippet(channelId))&key=${API_ID}&id=`,

        fetchingIds = [],
        idToChannel = {};

    /* global getChannelIdFromVideoId:false */
    this.getChannelIdFromVideoId = function(id){
        if(!fetchingIds.includes(id)){
            if(id in idToChannel)
                return idToChannel[id];
            
            fetchingIds.push(id);
            fetch(URL + id)
                .then(response => response.json())
                .then(json => idToChannel[id] = json.items[0].snippet.channelId)
                .catch(undefined)
                .then(() => {
                    // Finally, remove id from fetchingIds list
                    let index = fetchingIds.indexOf(id);
                    if(index != -1)
                        fetchingIds.splice(index, 1);
                });
        }
    };
}



// #region Run everything
// Add ytr-is-not-iframed-live-chat class
if(isLiveChat && !inIframe)
    html.classList.add('ytr-is-not-iframed-live-chat');

// Recheck all elements 2 times a second
setInterval(function() {
    scanVideoElementGroups(false);
}, 500);

// Should be run right after options is changed
function optionsChanged(newOptions){
    if(newOptions){
        options = newOptions;

        if(options.censoredTitle.wordReplaceUseRegex)
            options.censoredTitle.wordReplace = options.censoredTitle.wordReplace.map(repl => [new RegExp(repl[0], 'ig'), repl[1]]);
        else // See: stackoverflow.com/questions/3446170
            options.censoredTitle.wordReplace = options.censoredTitle.wordReplace.map(repl => [new RegExp(repl[0].replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'ig'), repl[1]]);

        for(let f of options.filters)
            delete f.tagList; // Taglists can contain a lot of data that doesn't need to be stored in every tab
    }
}

// Grab options first time
chrome.storage.local.get(['options', 'filterCache'], function(res) {
    optionsChanged(res.options);
    filterCache = res.filterCache;

    // Apply theme background color to avoid white flash
    if(!isLiveChat || !inIframe)
        html.style.background = constants.themeBackgrounds[options.youtubeTheme] || constants.themeBackgrounds.default;

    // Scan all elements in page
    scanVideoElementGroups(true);

    if (options.adBlock)
        runAdBlock();
});

// Cache document.hidden cause it's 20x faster than calling document.hidden
hidden = document.hidden;
document.addEventListener('visibilitychange', function(){
    hidden = document.hidden;

    // Ytr doesn't apply changes to all video groups when hidden.  so when the page is visible again, and settings changed while it was hidden, then apply all settings changes
    if(!hidden && settingsChangedWhenNotVisible){
        settingsChangedWhenNotVisible = false;
        scanVideoElementGroups(true);
    }
});

// Whenever options are changed, update options
chrome.storage.onChanged.addListener(function(changes) {
    if (changes.filterCache || changes.options) {
        if(changes.options)
            optionsChanged(changes.options.newValue);
        if(changes.filterCache)
            filterCache = changes.filterCache.newValue;
        
        scanVideoElementGroups(true);

        if(hidden)
            settingsChangedWhenNotVisible = true;

        // Page needs to be reloaded whenever adblock setting changes
        if (changes.options && changes.options.newValue.adBlock != changes.options.oldValue.adBlock)
            location.reload();
    }
});

// Notify user that ytr doesn't work on the old version of youtube
setTimeout(function(){
    if(options && options.notifications.warnOldYoutube && document.querySelector('body#body')){
        let $notification = stringToEl(constants.html.oldYoutubeWarning),
            close = function(){
                if(!$notification.classList.contains('close')){
                    $notification.classList.add('close');
                    setTimeout(() => document.body.removeChild($notification), 400);
                }
            };
        
        // Close and don't remind buttons
        $notification.querySelector('.ytr-close-button').addEventListener('click', close);
        $notification.querySelector('.ytr-dont-remind').addEventListener('click', function(){
            close();
            options.notifications.warnOldYoutube = false;
            chrome.storage.local.set({options:  options});
        });

        // If don't remind was clicked in another tab then
        chrome.storage.onChanged.addListener(function(changes) {
            if (changes && changes.options && changes.options.newValue && !changes.options.newValue.notifications.warnOldYoutube)
                close();
        });

        document.body.appendChild($notification);
    }
}, 5000);
// #endregion


// ---------------------------------------------------------------------------------------------------
// ----------- scanVideoElementGroups() finds and modifies groups of content appropriately -----------
// ---------------------------------------------------------------------------------------------------
function scanVideoElementGroups(settingsChanged) {
    if (!options)
        return;

    // Apply youtube theme
    let styleUrl = options.youtubeTheme ? chrome.extension.getURL(`css/themes/${options.youtubeTheme}.css`) : '';
    if($themeStyle.href != styleUrl)
        $themeStyle.href = styleUrl;

    if(!$themeStyle.parentElement && document.head)
        document.head.appendChild($themeStyle);

    if(isLiveChat)
        return;

    // Show update notification
    if(!inIframe && !hidden && options.notifications.showUpdate && options.promo.triggerShowUpdate && !document.getElementById('ytr-update-notification') && document.body){
        let $notification = stringToEl(`<div id="ytr-update-notification"><iframe src="${chrome.extension.getURL('update-notification.html')}"></iframe></div>`),
            forcePauseVideo = setInterval(function(){
                let $video = document.querySelector('video.html5-main-video');
                if($video)
                    $video.pause();
            }, 100);
        
        document.body.appendChild($notification);
        html.classList.add('ytr-blur-no-scroll');

        // If don't remind was clicked in another tab then
        chrome.storage.onChanged.addListener(function(changes) {
            if(changes.options && changes.options.newValue && !changes.options.newValue.promo.triggerShowUpdate){
                if($notification.parentElement)
                    document.body.removeChild($notification);
                html.classList.remove('ytr-blur-no-scroll');
                clearInterval(forcePauseVideo);
            }
        });
    }

    // Hide or don't hide comments
    if(options.hideComments)
        html.classList.add('ytrHideComments');
    else
        html.classList.remove('ytrHideComments');

    // Set ratingsPreviewMode for css
    if (!html.classList.contains('ytr-ratings-preview-mode-' + options.ratingsPreviewMode))
        html.className = html.className.replace(constants.regex.replaceOldRatingsPreviewMode, ` ytr-ratings-preview-mode-${options.ratingsPreviewMode} `).trim();

    // For each match group
    for(let group of groups){
        // When page isn't visible only scan groups that have video elements
        if(hidden && !group.hasVideoElement)
            continue;

        // Check if the group should run on this url
        if(!group.matches || group.matches.test(location.pathname)){
            // And then run scan on all query match group elements
            for(let $parent of document.querySelectorAll(group.query)){
                let videoId = group.getVideoId ? group.getVideoId.call($parent) : null,
                    ytrData = $parent.ytrData || {};
                
                // Don't re-apply settings to already modified videos when settings havn't changed.  rescanAnyways bypasses this optimization.  if hasVideoElement, then it will continue to scan until it finds the video element
                // Also, don't scan element when ad is playing
                if((!settingsChanged && !group.rescanAnyways && ytrData.videoId == videoId && (!group.hasVideoElement || (ytrData.video && $parent.offsetParent !== null))) || (group.hasVideoElement && (!$parent.querySelector('.html5-video-player') || $parent.querySelector('.html5-video-player.ad-showing'))))
                    continue;

                // Remove old ytr classes
                $parent.classList.remove('ytr-hide');
                $parent.classList.remove('ytr-blur-thumbnail');
                $parent.classList.remove('ytr-remove-thumbnail');

                // Don't check the element if it is invisible by checking if its offsetParent is null
                if($parent.offsetParent === null && $parent != document.body)
                    continue;

                let $title = group.titleQuery && $parent.querySelector(group.titleQuery),
                    $viewCount = group.viewCountQuery && $parent.querySelector(group.viewCountQuery),
                    $thumbnail = (group.thumbnailQuery && group.thumbnailQuery.trim() == ':scope' && $parent) || (group.thumbnailQuery && $parent.querySelector(group.thumbnailQuery)) || null;

                // If title is empty when it shouldn't be, don't scan group yet
                if($title && !$title.textContent.trim())
                    continue;

                // The id of the video changed so erase all of its cached data so it can be re-grabbed
                if(ytrData.videoId != videoId){
                    // Clear video check interval and remove it from the videos list
                    if(ytrData.video){
                        if(ytrData.video.blocked && ytrData.video.$video.paused)
                            ytrData.video.$video.play();
                        clearInterval(ytrData.video.videoCheckInterval);
                        videos.splice(videos.indexOf(ytrData.video), 1);
                    }
                    $parent.ytrData = ytrData = {videoId: videoId};
                }

                // Grab all data if it hasn't been grabbed yet and can be grabbed
                if(group.getVideoTitle && !ytrData.videoTitle) // Grab title
                    ytrData.videoTitle = group.getVideoTitle.call($parent, $title);
                if(group.getChannelName && !ytrData.channelName) // Grab channel name
                    ytrData.channelName = group.getChannelName.call($parent);
                if(group.grabViewAndAgeData && !ytrData.viewsCount) // Grab view count and age data
                    group.grabViewAndAgeData.call($parent, $viewCount, ytrData);

                // Pre-normalize title and channel name for the filter checking
                if(ytrData.videoTitle)
                    ytrData.normalizedVideoTitle = normalify(ytrData.videoTitle).toLowerCase();
                if(ytrData.channelName)
                    ytrData.normalizedChannelName = normalify(ytrData.channelName).toLowerCase();


                // Get the filter
                let filterId = ytrData.filterId = matchesFilter(ytrData),
                    filter = options.filters[filterId];


                // If all content should be hidden
                if(filter.hideAllContent && !group.hasVideoElement){
                    $parent.classList.add('ytr-hide');
                    continue;
                }


                // Video element
                if(group.hasVideoElement){

                    
                    // If video element hasn't been found yet then find it and add it to the videos list
                    if(!ytrData.video){
                        let $video = $parent.querySelector('video.html5-main-video'),
                            $container = $parent.querySelector('#player, #player-container');
                    
                        if($video && $container){
                            // Register video element
                            ytrData.video = {
                                $video,
                                $container,

                                channelId: undefined,
                                channelName: ytrData.channelName,
                                videoId,

                                totalTimeWatched: 0,
                                totalTimeWatchedRecorded: 0,
                                lastCurrentTime: 0,

                                wasPausedBeforeBlock: false,
                                blocked: false,
                                videoCheckInterval: undefined,
                                countedAsViewed: false,

                                hasLikeDislikeButton: group.hasLikeDislikeButton == true,
                                $like: undefined,
                                $dislike: undefined,
                                wasLiked: false,
                                wasDisliked: false
                            };
                            videos.push(ytrData.video);

                            // Video isn't initially blocked
                            $parent.classList.remove('ytr-blocked-video');
                        }
                    }

                    // Try to get the channel id
                    if(ytrData.video && !ytrData.video.channelId)
                        ytrData.video.channelId = group.getChannelId.call($parent);

                    // Block or don't block the video
                    if(ytrData.video){
                        let {$video, $container} = ytrData.video,
                            shouldUnblock = ytrData.video.blocked && (!filter.blockVideos || tempUnblockedVideoId == videoId), // Video was blocked, but now (isn't blocked or video is temporarily unblocked)
                            shouldBlock = !ytrData.video.blocked && filter.blockVideos && tempUnblockedVideoId != videoId;

                        if(ytrData.video.blocked != $parent.classList.contains('ytr-blocked-video'))
                            ytrData.video.blocked = !ytrData.video.blocked;

                        // Remove the blocked menu
                        if(shouldUnblock){
                            // Store the fact that the video was not blocked from playing
                            ytrData.video.blocked = false;
                            // Remove the interval that force-pauses the video
                            clearInterval(ytrData.video.videoCheckInterval);
                            // If the video hasn't ended and the video wasn't paused before being blocked, then start playing it again.  only play video again if page is visible
                            if(!hidden && !$video.ended && ytrData.video.wasPausedBeforeBlock == false)
                                $video.play();

                            $parent.classList.remove('ytr-blocked-video');
                        }
                        // Video wasn't blocked, but now is blocked and isn't temporarily unblocked
                        // Create the blocked menu
                        else if(shouldBlock){
                            // Store the fact that the video was blocked from playing
                            ytrData.video.blocked = true;
                            // Was the video paused already before we blocked it?
                            ytrData.video.wasPausedBeforeBlock = $video.currentTime < 0.2 || $video.ended ? false : $video.paused;
                            // Create an interval that force-pauses the video
                            clearInterval(ytrData.video.videoCheckInterval);
                            ytrData.video.videoCheckInterval = setInterval(() => {
                                if($video.currentTime > 0)
                                    $video.pause();
                            }, 50);
                            
                            $parent.classList.add('ytr-blocked-video');

                            // Remove old menu
                            let $oldMenu = $parent.querySelector('.ytr-video-blocked-menu');
                            if($oldMenu)
                                $container.removeChild($oldMenu);

                            // Create video blocked menu
                            let $menu = ytrData.video.$menu = stringToEl(constants.html.videoBlockedMenu),
                                $unblockVideo = $menu.querySelector('#ytr-unblock-video'),
                                $unblockChannel = $menu.querySelector('#ytr-unblock-channel');
                            
                            // Temporarily unblock video
                            $menu.querySelector('#ytr-temp-unblock').addEventListener('click', () => {
                                tempUnblockedVideoId = videoId;
                                scanVideoElementGroups(true);
                            });

                            // Add video to Blocked - Removes all vi= tag in default and optionally adds vi= tag to blocked list
                            $unblockVideo.addEventListener('click', function(){
                                chrome.runtime.sendMessage({
                                    method: 'remove-video-from-blocked',
                                    forcefullyApplyFilter: this.getAttribute('forceful') == 'true',
                                    videoId
                                });
                                // Immediately unblock video
                                tempUnblockedVideoId = videoId;
                                scanVideoElementGroups(true);
                            });

                            // Remove channel from Blocked - Removes all vi= and ch= tags in blocked and optionally adds ch= tag to default
                            $unblockChannel.addEventListener('click', function(){
                                chrome.runtime.sendMessage({
                                    method: 'remove-channel-from-blocked',
                                    forcefullyApplyFilter: this.getAttribute('forceful') == 'true',
                                    videoId,
                                    channelName: ytrData.channelName
                                });
                                // Immediately unblock video
                                tempUnblockedVideoId = videoId;
                                scanVideoElementGroups(true);
                            });

                            // Edit filter - open options page, focusing filter
                            $menu.querySelector('#ytr-change-filter-settings').addEventListener('click', () => {
                                chrome.runtime.sendMessage({
                                    method: 'open-or-focus-options-page',
                                    hash: '#filter-' + filterId
                                });
                            });

                            // Append menu to video container
                            $container.appendChild($menu);
                        }


                        // If blocked menu was just created, or the settings changed while the video is blocked
                        if(shouldBlock || (settingsChanged && ytrData.video.blocked)){
                            let showUnblockButtons = filterId == 1,
                                $unblockVideo = ytrData.video.$menu.querySelector('#ytr-unblock-video'),
                                $unblockChannel = ytrData.video.$menu.querySelector('#ytr-unblock-channel');

                            $unblockChannel.parentElement.style.display = $unblockVideo.parentElement.style.display = showUnblockButtons ? '' : 'none';

                            if(showUnblockButtons){
                                getMatchingTags(ytrData, (tagMatches, groupMatches) => {
                                    let matchCount = tagMatches.length + groupMatches.length,
                                        matchedByViTag = tagMatches.filter(t => t[0] == 'vi' && t[1] == '=').length,
                                        matchedByChTag = tagMatches.filter(t => t[0] == 'ch' && t[1] == '=').length + groupMatches.filter(g => g.some(t => t[0] == 'ch' && t[1] == '=')).length,
                                        forcefullyApplyVideoIdFilter = matchCount != matchedByViTag, // Forcefully apply filter if not only vi= tags match this video (since the vi= tags will be removed, unblocking the video)
                                        forcefullyApplyChannelNameFilter = matchCount != matchedByViTag + matchedByChTag; // Forcefully apply filter if not only vi= and ch= tags match this video (since the vi= and ch= tags will be removed, unblocking the video)
                                    
                                    $unblockVideo.setAttribute('forceful', forcefullyApplyVideoIdFilter);
                                    $unblockChannel.setAttribute('forceful', forcefullyApplyChannelNameFilter);
                                });
                            }
                        }
                    }
                }


                // If thumbnail should be blured or hidden
                if($thumbnail){
                    if(filter.thumbnailAction == 1)
                        $parent.classList.add('ytr-blur-thumbnail');
                    else if(filter.thumbnailAction == 2)
                        $parent.classList.add('ytr-remove-thumbnail');
                }
                

                // Manage video view count
                if($viewCount && ytrData.prettyViewCountText){
                    if(!options.replaceRFYTextWithViewCount && ytrData.isRecommended){
                        $viewCount.textContent = 'Recommended for you';
                    }else{
                        $viewCount.textContent =
                            (options.exactVideoViewCount ? ytrData.exactViewCountText : ytrData.prettyViewCountText) +
                            (options.showVideoAge ? ' \u2022 ' + ytrData.videoTimeAgoText : '');
                    }
                }


                // Correct video titles
                if($title && ytrData.videoTitle){
                    let title = ytrData.videoTitle;

                    if(filter.titleAction == 1){ // Autocorrect
                        // Remove emoji
                        if (options.censoredTitle.removeEmoji){
                            // Some emojis are replaced with their regular character equivalents
                            for(let [replace, match] of constants.regex.emojiReplaceDictionary)
                                title = title.replace(match, replace);

                            // Remove all other emojis
                            title = title.replace(constants.regex.emoji, ' ');
                        }

                        // Remove text contained within elipses
                        if (options.censoredTitle.removeShortTextContainedWithinElipses) {
                            let newTitle = title.replace(constants.regex.elipses, ' ');
                            if (newTitle.length > title.length / 2) // If the new title wasn't shortened too considerably, then apply changes to it.
                                title = newTitle;
                        }

                        // Remove hashtags
                        if (options.censoredTitle.removeHashtags)
                            title = title.replace(constants.regex.hashtags, ' ');

                        // Remove repeating non-letter characters
                        if (options.censoredTitle.removeRepeatingNonLetterChars)
                            title = title
                                .replace(constants.regex.dotdotdot, '\u2026') // Replace repeating dots with tripple dot html entity
                                .replace(constants.regex.repeatingNonLetterChars, (s) => s.charAt(0)) // Replace repeating non-letter characters
                                .replace(constants.regex.questionMarkExclamationPoint, '?!'); // Replace ?!?!?! with ?!

                        // Capitalize titles correctly according to censoredTitle settings
                        if (options.censoredTitle.capitalization == 1)
                            title = title.titleCap();
                        else if (options.censoredTitle.capitalization == 2)
                            title = title.titleCapSentences();

                        // Finally replace words using word replace dictionary
                        for(let item of options.censoredTitle.wordReplace)
                            title = title.replace(item[0], item[1]);
                    }else if(filter.titleAction == 2){ // Replace with custom text
                        title = filter.titleReplaceText;
                    }else if(filter.titleAction == 3){ // Remove
                        title = '\u2013Title Removed\u2013';
                    }

                    if(!title || title.trim() == '')
                        title = '\u2013Title Empty\u2013';
                    $title.textContent = /* For Debug: '[' + filterId + '] ' + */title;
                }


                // Add ratings preview bar and asks the ratings preview module to fill it with data
                if($thumbnail && videoId && options.ratingsPreviewMode != 0 && !ytrData.previewRatings) {
                    ytrData.previewRatings = true;

                    let $previewRatings = $thumbnail.querySelector('.ytr-ratings-previewer');
                    if (!$previewRatings) {
                        $previewRatings = document.createElement('div');
                        $previewRatings.classList.add('ytr-ratings-previewer');
                        $thumbnail.appendChild($previewRatings);
                    } else {
                        $previewRatings.removeAttribute('title');
                        $previewRatings.removeAttribute('ranking');
                    }

                    $previewRatings.innerHTML = '<div>Loading...</div>';
                    $previewRatings.setAttribute('video-id', videoId);

                    ratingsPreviewPopulate(videoId);
                }
                

                // Run any additional tasks that group may have
                if(group.additionalTasks)
                    group.additionalTasks.call($parent, $title);

                
                // Add interaction button
                if(group.interactionButton && (!ytrData.addedInteractionMenu || settingsChanged)){
                    let $placeIn = group.interactionButton.placeIn ? $parent.querySelector(group.interactionButton.placeIn) : $parent;
                    if($placeIn){
                        // Use old button if it already exists
                        let $button = $placeIn.querySelector(':scope > .ytr-interaction-button');
                        
                        // Otherwise create a new one
                        if(!$button){
                            $button = stringToEl(constants.html.interactionButton);
                            $button.addEventListener('click', openInteractionMenu);
                            $placeIn.appendChild($button);
                        }

                        // Set button data
                        $button.ytrData = ytrData;
                        $button.hasVideoElement = group.hasVideoElement == true;
                        if(group.hasVideoElement && ytrData.video)
                            $button.isVideoBlocked = ytrData.video.blocked == true;

                        ytrData.addedInteractionMenu = true;
                    }
                }
            }
        }
    }
}





// Collect stats and send back to background page 2 times every second
if(!isLiveChat){
    setInterval(function(){
        if(hidden) // Don't count stats for videos currently hidden
            return;

        for(let video of videos){
            let $video = video.$video;

            // If video element exists and we have a channel id for this video
            // Only collect analytics if user isn't watching ad
            if($video && video.channelId && $video.parentElement && !$video.parentElement.parentElement.classList.contains('ad-showing')){
                let likeAdd = 0,
                    dislikeAdd = 0;
                
                // Add time to totalTimeWatched if current time increased and the user didn't skip forward
                let timeAdd = ($video.currentTime - video.lastCurrentTime) / $video.playbackRate;
                if(timeAdd > 0.1 && timeAdd < 1.1)
                    video.totalTimeWatched += timeAdd;
                video.lastCurrentTime = $video.currentTime;

                // Detect likes/dislikes
                if(video.hasLikeDislikeButton){
                    // Get like and dislike button if we don't have them yet
                    if(!video.$like || !video.$dislike){
                        for(let $el of document.querySelectorAll('#info #top-level-buttons > ytd-toggle-button-renderer')){
                            if($el.querySelector('#button[aria-label^="like"]'))
                                video.$like = $el;
                            else if($el.querySelector('#button[aria-label^="dislike"]'))
                                video.$dislike = $el;
                        }

                        if(video.$like && video.$dislike){
                            video.wasLiked = video.$like.classList.contains('style-default-active');
                            video.wasDisliked = video.$dislike.classList.contains('style-default-active');
                        }
                    }

                    if(video.$like && video.$dislike){
                        let newLiked = video.$like.classList.contains('style-default-active'),
                            newDisliked = video.$dislike.classList.contains('style-default-active');
                        // Add to the like or dislike count for this channel
                        likeAdd = (video.wasLiked && !newLiked) && -1 || (!video.wasLiked && newLiked) && 1 || 0;
                        dislikeAdd = (video.wasDisliked && !newDisliked) && -1 || (!video.wasDisliked && newDisliked) && 1 || 0;

                        video.wasLiked = newLiked;
                        video.wasDisliked = newDisliked;
                    }
                }


                // Count a video view when the video was watched more than 60% and video is longer than 10 seconds
                let countVideoAsWatched = !video.countedAsViewed && $video.duration >= 10 && video.totalTimeWatched / $video.duration > 0.6,
                // Count amount of time watching video only if it increased more than 1.8 seconds and we watched the video more than just a brief 6 seconds
                    countVideoWatchTime = countVideoAsWatched || (video.totalTimeWatched > 6 && video.totalTimeWatched - video.totalTimeWatchedRecorded > 1.8);

                // If the video should be considered watched, watch time should be recorded, or video like/dislike changed
                if(countVideoAsWatched || countVideoWatchTime || likeAdd != 0 || dislikeAdd != 0){
                    chrome.runtime.sendMessage({
                        method: countVideoAsWatched ? 'stats-add-video-view' : 'stats-add-watchtime',
                        channelId: video.channelId,
                        watchTime: countVideoWatchTime ? video.totalTimeWatched - video.totalTimeWatchedRecorded : 0,
                        channelName: video.channelName,
                        likes: likeAdd,
                        dislikes: dislikeAdd
                    });

                    if(countVideoAsWatched)
                        video.countedAsViewed = true;
                    if(countVideoWatchTime)
                        video.totalTimeWatchedRecorded = video.totalTimeWatched;
                }
            }
        }
    }, 500);
}



// Interaction menu
{
    let $interactionMenu = stringToEl('<ul class="ytr-interaction-menu yt-uix-menu-content"></ul>'),
        hideInteractionMenu = function(){
            html.classList.remove('ytr-showing-interaction-menu');
            if($interactionMenu.parentElement)
                $interactionMenu.parentElement.removeChild($interactionMenu);
        },
        addInteractionMenuButton = function(text, classnameOrOnclick, onclick){
            let $el = document.createElement('li');
            $el.textContent = text;
            if(typeof(classnameOrOnclick) == 'string')
                $el.className = classnameOrOnclick;
            if(onclick || typeof(classnameOrOnclick) == 'function'){
                $el.addEventListener('click', onclick || classnameOrOnclick);
                $el.addEventListener('click', hideInteractionMenu);
            }
            $interactionMenu.appendChild($el);
        };


    /* global openInteractionMenu:false*/
    this.openInteractionMenu = function(e){
        let ytrData = this.ytrData,
            hasVideoElement = this.hasVideoElement,
            isVideoBlocked = this.isVideoBlocked,
            {videoId, filterId, channelName} = ytrData;

        // Prevent propagation
        e.stopPropagation();
        e.preventDefault();

        getMatchingTags(ytrData, function(tagMatches, groupMatches){
            
            // Show menu
            html.classList.add('ytr-showing-interaction-menu');

            // Add menu to html, empty it, position it relative to button
            (document.fullscreenElement || document.webkitFullscreenElement || document.body || html).appendChild($interactionMenu);
            $interactionMenu.innerHTML = '';
            $interactionMenu.style.left = e.pageX + 'px';
            $interactionMenu.style.top = e.pageY + 'px';
            
            let matchCount = tagMatches.length + groupMatches.length,
                matchedByViTag = tagMatches.filter(t => t[0] == 'vi' && t[1] == '=').length,
                matchedByChTag = tagMatches.filter(t => t[0] == 'ch' && t[1] == '=').length + groupMatches.filter(g => g.some(t => t[0] == 'ch' && t[1] == '=')).length;

            if(videoId){
                // Stuff to display when the group has a video element
                if(hasVideoElement){
                    if(tempUnblockedVideoId == videoId){
                        addInteractionMenuButton('This video was temporily played.', 'ytr-important');
                        addInteractionMenuButton('Revoke temporary settings', function(){
                            hideInteractionMenu();
                            tempUnblockedVideoId = null;
                            scanVideoElementGroups(true);
                        });
                    }else if(isVideoBlocked){
                        addInteractionMenuButton('Temporarily play video', function(){
                            hideInteractionMenu();
                            tempUnblockedVideoId = videoId;
                            scanVideoElementGroups(true);
                        });
                    }
                }

                // Add video to Blocked - Removes all vi= tag in default and adds a vi= tag to blocked list
                if(filterId == 0 && matchCount == matchedByViTag){ // FilterId == 0 && all its match tags are vi=
                    addInteractionMenuButton('Block video', function(){
                        if(hasVideoElement)
                            tempUnblockedVideoId = undefined;
                        chrome.runtime.sendMessage({
                            method: 'add-video-to-blocked',
                            videoId
                        });
                    });
                }
                // Remove video from Blocked - Removes all vi= tag in blocked
                else if(filterId == 1 && matchCount == matchedByViTag){ // FilterId == 1 && only vi= tags are holding it there
                    addInteractionMenuButton('Unblock video', function(){
                        if(hasVideoElement)
                            tempUnblockedVideoId = undefined;
                        chrome.runtime.sendMessage({
                            method: 'remove-video-from-blocked',
                            forcefullyApplyFilter: false,
                            videoId
                        });
                    });
                }
                // Unblock video - Removes all vi= tag in blocked and add vi= tag to default
                else if(filterId == 1){ // FilterId == 1
                    addInteractionMenuButton('Unblock video', function(){
                        if(hasVideoElement)
                            tempUnblockedVideoId = undefined;
                        chrome.runtime.sendMessage({
                            method: 'remove-video-from-blocked',
                            forcefullyApplyFilter: true,
                            videoId
                        });
                    });
                }
                
                // Edit filter - open options page, focusing filter
                addInteractionMenuButton('Edit this video\'s filter', function(){
                    chrome.runtime.sendMessage({
                        method: 'open-or-focus-options-page',
                        hash: '#filter-' + filterId
                    });                
                });
            }

            if(channelName){
                // Add channel to blocked - Removes all vi= and ch= tag in default and adds a ch= tag to blocked list
                if(filterId == 0 && matchCount == matchedByViTag + matchedByChTag){ // FilterId == 0 && (has no match tags || only ch= and/or vi= tags are holding it here)
                    addInteractionMenuButton('Block channel', function(){
                        if(hasVideoElement)
                            tempUnblockedVideoId = undefined;
                        chrome.runtime.sendMessage({
                            method: 'add-channel-to-blocked',
                            videoId,
                            channelName
                        });
                    });
                }
                // Remove channel from Blocked - Removes all vi= and ch= tags in blocked
                else if(filterId == 1 && matchedByChTag >= 1 && matchCount == matchedByViTag + matchedByChTag){ // FilterId == 1 && ( only a single ch= tag is holding it there || only ch= and vi= is holding it there)
                    addInteractionMenuButton('Unblock channel', function(){
                        if(hasVideoElement)
                            tempUnblockedVideoId = undefined;
                        chrome.runtime.sendMessage({
                            method: 'remove-channel-from-blocked',
                            forcefullyApplyFilter: false,
                            videoId,
                            channelName
                        });
                    });
                }
                // Unblock channel - Removes all vi= and ch= tags in blocked and add ch= tag to default
                else if(filterId == 1){ // FilterId == 1
                    addInteractionMenuButton('Unblock channel', function(){
                        if(hasVideoElement)
                            tempUnblockedVideoId = undefined;
                        chrome.runtime.sendMessage({
                            method: 'remove-channel-from-blocked',
                            forcefullyApplyFilter: true,
                            videoId,
                            channelName
                        });
                    });
                }
            }
        });
    };

    // Hide menu
    window.addEventListener('scroll', hideInteractionMenu);
    window.addEventListener('click', hideInteractionMenu);
    window.addEventListener('blur', hideInteractionMenu);
    window.addEventListener('focus', hideInteractionMenu);

    // Prevent click events from propagating out the element and hiding it
    $interactionMenu.addEventListener('click', e => e.stopPropagation());
}




// Tests if a video matches a parsed array tag
function matchesSG([type, comparator, value], ytrData){
    let test = {vi: ytrData.videoId, vt: ytrData.normalizedVideoTitle, ch: ytrData.normalizedChannelName, vc: ytrData.viewsCount}[type];

    if(!test && test != 0){
        return comparator == '!';
    }else{
        switch(comparator){
            case '=':
                return test == value;
            case '!':
                return test != value;
            case '~':
                return test.includes(value);
            case '^':
                return test.startsWith(value);
            case '$':
                return test.endsWith(value);
            case '<':
                return test < value;
            case '>':
                return test > value;
            case '/':
                return new RegExp(value, 'i').test(test);
        }
    }
}

// What filter does a video match
function matchesFilter(ytrData){
    let filter = Infinity;

    if(ytrData.videoId && ytrData.videoId in filterCache.videoid)
        filter = filterCache.videoid[ytrData.videoId];

    let ch = filterCache.channels[ytrData.normalizedChannelName];
    if(Number.isInteger(ch)){
        filter = Math.min(filter, ch);
    }else if(Array.isArray(ch)){
        let subFilters = ch.slice(),
            hasDefault = Number.isInteger(subFilters[subFilters.length - 1]),
            defaultFilterId = hasDefault ? subFilters.pop() : undefined;
        for(let [id, ...sg] of subFilters){
            if(id >= filter){
                break;
            }else if(sg.every(e => matchesSG(e, ytrData))){ // If every sg matches the video
                filter = id;
                break;
            }
        }
        if(hasDefault && defaultFilterId < filter)
            filter = defaultFilterId;
    }

    for(let [id, ...sg] of filterCache.searchgroups){
        if(id >= filter){
            break;
        }else if(Array.isArray(sg[0])){
            if(sg.every(e => matchesSG(e, ytrData))){ // If every sg matches the video
                filter = id;
                break;
            }
        }else{
            if(matchesSG(sg, ytrData)){
                filter = id;
                break;
            }
        }
    }

    return Number.isFinite(filter) ? filter : 0;
}

// Get all the tags that a video matches in its filter
function getMatchingTags(ytrData, callback){
    let filterId = ytrData.filterId ? ytrData.filterId : matchesFilter(ytrData);
    
    chrome.runtime.sendMessage({
            method: 'get-full-parsed-filter',
            filterId: filterId
        },
        function({groupedTags, tags}){ // {groupedTags, tags}
            let tagMatches = [],
                groupMatches = [];

            for(let tag of tags)
                if(matchesSG(tag, ytrData))
                    tagMatches.push(tag);
            
            for(let group of groupedTags)
                if(group.every(tag => matchesSG(tag, ytrData)))
                    groupMatches.push(group);

            callback(tagMatches, groupMatches);
        }
    );
}





function runAdBlock() {
    // Enable adblocking css
    html.classList.add('ytrAdblock');

    // Force remove all google ad iframes
    for (let ads of ['#google_ads_frame1', '#player-ads'])
        for (let ad of document.querySelectorAll(ads))
            ad.parentElement.removeChild(ad);


    // This function inserts code that block ads
    let ab = document.createElement('script');
    ab.id = 'ytrAdblockerScript';
    ab.text = `
        // Youtube Refined AdBlocker Script
        // Copyright 2017 Marc Guiselin

        var justBlocked = false;

        // For the older version of youtube
        window.ytplayer = new Proxy(window.ytplayer || {}, {
            set: function (target, name, value) {

                // Prevent infinite loop
                if(!justBlocked){
                    justBlocked = true;

                    if(!window.ytplayer)
                        window.ytplayer = {};
                    if(!window.ytplayer.config)
                        window.ytplayer.config = {};
                    if(!window.ytplayer.config.args)
                        window.ytplayer.config.args = {};

                    let args = window.ytplayer.config.args;
                    args.ad_tag=0;
                    args.ad_preroll=0;
                    args.ad_device=0;
                    args.ad_module=0;
                    args.ad3_module=0;
                    args.ad_logging_flag=0;
                    args.dclk=0;
                    args.ad_slots='';
                    args.adSlots='';
                    args.afv_ad_tag_restricted_to_instream='';
                    args.afv_ad_tag='';
                    args.freewheel_ad_tag='';
                    args.vmap='';
                    args.fexp='';

                    args.allow_below_the_player_companion = false;
                    args.invideo = false;
                    args.remarketing_url = '';
                    args.adsense_video_doc_id = '';

                    justBlocked = false;
                }

                target[name] = value;

                return true;
            }
        });

        // Used by newer version of youtube
        window.yt = new Proxy(window.yt || {}, {
            set: function (target, name, value) {

                // Prevent infinite loop
                if(!justBlocked){
                    justBlocked = true;

                    // Remove data from some mighty suspicious variables
                    window.yt.ads = {};
                    if(window.yt.www)
                        window.yt.www.ads = {};

                    if(window.yt.config_){
                        // Array that holds link to advertising pages
                        window.yt.config_.ZWIEBACK_PING_URLS = [];

                        // This should block all youtube surveys
                        if(window.yt.config_.openPopupConfig){
                            let o = window.yt.config_.openPopupConfig.supportedPopups;
                            if(o)
                                for(let key in o)
                                    if(key.toLowerCase().includes('survey'))
                                        o[key] = false;
                        }
                    }

                    justBlocked = false;
                }

                target[name] = value;

                return true;
            }
        });

        // Overwites the default XMLHttpRequest function so that a custom open function can block requests to advertising sites like doubleclick.net
        var httpr = XMLHttpRequest;
        XMLHttpRequest = window.XMLHttpRequest = function(){
            let req = new httpr();
            req.originalOpen = req.open;
            req.open = function(method, url){
                if(url && (url.includes('doubleclick.net') || url.includes('researchnow.com'))){
                    // Console.log('blocked: ', url);
                    arguments[1] = '';
                }
                req.originalOpen(...arguments);
            }
            return req;
        };

        // Some special ads still make it through sometimes. this interval checks for a non youtube video in the main video element and force skips it
        setInterval(function(){
            let v = document.querySelector('video');
            if(v && v.src && (!v.src.startsWith('blob:') || v.parentElement.parentElement.classList.contains('ad-showing')){
                v.style.visibility = 'hidden';
                v.currentTime = 10000;
            }else if(v){
                v.style.visibility = 'visible';
            }
        }, 200);
    `;
    html.appendChild(ab);
}