/*============================
copyright 2017 Marc Guiselin
============================*/

//define constants
const constants = Object.freeze({
    regex: {
        matchEmoji: new RegExp("\\s*(?:[\\u2700-\\u27bf]|(?:\\ud83c[\\udde6-\\uddff]){2}|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\u0023-\\u0039]\\ufe0f?\\u20e3|\\u3299|\\u3297|\\u303d|\\u3030|\\u24c2|\\ud83c[\\udd70-\\udd71]|\\ud83c[\\udd7e-\\udd7f]|\\ud83c\\udd8e|\\ud83c[\\udd91-\\udd9a]|\\ud83c[\\udde6-\\uddff]|\\ud83c[\\ude01-\\ude02]|\\ud83c\\ude1a|\\ud83c\\ude2f|\\ud83c[\\ude32-\\ude3a]|\\ud83c[\\ude50-\\ude51]|\\u203c|\\u2049|[\\u25aa-\\u25ab]|\\u25b6|\\u25c0|[\\u25fb-\\u25fe]|\\u00a9|\\u00ae|\\u2122|\\u2139|\\ud83c\\udc04|[\\u2600-\\u26FF]|\\u2b05|\\u2b06|\\u2b07|\\u2b1b|\\u2b1c|\\u2b50|\\u2b55|\\u231a|\\u231b|\\u2328|\\u23cf|[\\u23e9-\\u23f3]|[\\u23f8-\\u23fa]|\\ud83c\\udccf|\\u2934|\\u2935|[\\u2190-\\u21ff])+\\s*", "g"),
        matchRepeatingNonLetterChars: new RegExp("(([^\\w\\s]|_)\\2+)|([?!]+)", "g"),
        matchElipses: new RegExp("\\s*\\*+[^*]{3,24}\\*+\\s*", "g"),
        matchHashtags: new RegExp("\\s*#[^\\s#\\d][^\\s#)(]{2,20}?(?=\\s|$|\\)|\\]|\\.)", "g"),
        dotdotdot: new RegExp("\\.\\.\\.", "g"),
        viewInfoParse: new RegExp("(\\d+\\s+\\w+\\s+ago).+?([\\d,]+\\s+views?)\\s*$", "i"),
        videoIdRegexMatch: new RegExp("(v=)([\\w\\-]{8,14})"),
        replaceOldRatingsPreviewMode: new RegExp("\\s*(ytr-ratings-preview-mode-\\d+)|$", "i")
    }
});
const groups = Object.freeze([
    { //video suggestions listed next to the video on /watch pages, including videos in a playlist
        matches: null,

        //         regular video                 video in playlist
        query: "ytd-compact-video-renderer, ytd-playlist-panel-video-renderer",
        titleQuery: "#video-title",
        thumbnailQuery: "ytd-thumbnail",
        viewCountQuery: "#metadata-line",
        getVideoId: function () {
            var match = constants.regex.videoIdRegexMatch.exec(this.querySelector("a").getAttribute("href"));
            return match ? match[2] : null;
        }
    },

    { //video suggestions listed in a grid on channel home pages and videos page. check out https://www.youtube.com/channel/UC_ViSsVg_3JUDyLS3E2Un5g and https://www.youtube.com/
        matches: null,

        query: "ytd-grid-video-renderer",
        titleQuery: "#video-title",
        thumbnailQuery: "ytd-thumbnail",
        viewCountQuery: "#metadata-line span",
        getVideoId: function () {
            var match = constants.regex.videoIdRegexMatch.exec(this.querySelector("a").getAttribute("href"));
            return match ? match[2] : null;
        }
    },

    { //large vertically listed video suggestions on channel/user home pages, the trending page, and home page. check out https://i.imgur.com/XHTfpjY.png and https://www.youtube.com/channel/UC7A_dLnSAjl7uROCdoNyjzg
        matches: null,

        query: "ytd-video-renderer",
        titleQuery: "#video-title",
        thumbnailQuery: "ytd-thumbnail",
        viewCountQuery: "#metadata-line span",
        getVideoId: function () {
            var match = constants.regex.videoIdRegexMatch.exec(this.querySelector("#video-title").getAttribute("href"));
            return match ? match[2] : null;
        }
    },

    { //currently watching video on /watch pages
        matches: new RegExp("\\/watch.*", "i"),

        query: "#top",
        titleQuery: "h1.title",
        getVideoId: function () {
            var match = constants.regex.videoIdRegexMatch.exec(location.search);
            return match && match.length ? match[2] : null;
        },
        getVideoTitle: function () {
            return this.querySelector(".ytp-title .ytp-title-link").textContent;
        },

        rescanAnyways: true,//title loads a bit after the page, so this is required
        additionalTasks: function ($title) {
            //also autocorrect title of page
            if ($title && $title.textContent)
                document.title = $title.textContent + " - YouTube";

            //add actual like/dislike count below video if enabled
            var likeButtons = this.querySelectorAll("#top-level-buttons #text");
            for (var likeButton of likeButtons) {
                if (likeButton.hasAttribute("aria-label")) {
                    var count = /[\d,]*/.exec(likeButton.getAttribute("aria-label"))[0];
                    if (count)
                        likeButton.textContent = options.exactLikeDislikeCount ? count : prettyLikes(count);
                }
            }
        }
    },

    { //currently watching video on channel/user home pages
        matches: new RegExp("\\/(channel|user)\\/.+", "i"),

        query: "ytd-channel-video-player-renderer",
        titleQuery: "#title a",
        getVideoId: function () {
            var match = constants.regex.videoIdRegexMatch.exec(this.querySelector("#title a").getAttribute("href"));
            return match && match.length ? match[2] : null;
        },

        rescanAnyways: true,//title and video might load at different times, so this is required
        additionalTasks: function ($title) {
            //fix the second title on top of the video
            var el = this.querySelector(".ytp-title a.ytp-title-link");
            if ($title && $title.textContent && el && el.textContent)
                el.textContent = $title.textContent;
        }
    },

    { //video suggestions shown at end of video if autoplay is disabled
        matches: null,

        query: ".ytp-videowall-still",
        titleQuery: ".ytp-videowall-still-info-title",
        thumbnailQuery: ".ytp-videowall-still-image",
        //viewCountQuery: ".ytp-videowall-still-info-author", //unfortunately view count can't be fixed
        getVideoId: function () {
            var match = constants.regex.videoIdRegexMatch.exec(this.getAttribute("href"));
            return match && match.length ? match[2] : null;
        },
        getVideoTitle: function () {
            return this.getAttribute("aria-label");
        }

        /*additionalTasks: function () {
            var $viewCount = this.querySelector(".ytp-videowall-still-info-author"),
                ytrData = this.ytrData;

            //if view count data hasn't been grabbed before
            if (!ytrData.prettyCount) {
                //grab exact video view count from a string stored in an attribute.
                let info = constants.regex.viewInfoParse.exec(
                    this.getAttribute("aria-label")//aria label is actual in parent
                );

                if (info) {
                    ytrData.timeAgo = info[1];
                    ytrData.exactCount = info[2];
                    ytrData.prettyCount = prettyViews(info[2]);

                    //channel name is shown in front of view count (ex: name • 10K views), so this must be saved to be re-added later
                    let channelName = $viewCount.textContent.match(/^(.*)\s\u2022/);
                    ytrData.authorName = channelName.length == 2 ? channelName[1] : "";
                }
            }

            if (ytrData.prettyCount) {
                $viewCount.textContent =
                    (ytrData.authorName ? ytrData.authorName + " \u2022 " : "") +
                    (options.exactVideoViewCount ? ytrData.exactCount : ytrData.prettyCount) +
                    (options.showVideoAge ? " \u2022 " + ytrData.timeAgo : "");
            }
        }*/
    },

    { //matches in-video suggested video boxes
        matches: null,

        query: ".html5-video-player .ytp-ce-video",
        titleQuery: ".ytp-ce-video-title",
        thumbnailQuery: ".ytp-ce-covering-image",
        getVideoId: function () {
            var $a = this.querySelector("a.ytp-ce-covering-overlay");
            if (!$a)
                return null;
            var match = constants.regex.videoIdRegexMatch.exec($a.getAttribute("href"));
            return match && match.length ? match[2] : null;
        }
    }
]);


//define variables
var options;


//define helper functions
function prettyViews(n) {
    n = parseInt(n.replace(/\D/g, ""));

    if (n < 0)
        return "no views";
    else if (n == 1)
        return "1 view";
    else if (n < 999)
        return n + " views";
    else if (n < 990000)
        return Math.max(1, Math.round(n / 1000)) + "K views";//k on youtube are never decimals
    else if (n < 990000000)
        return Math.max(1, Math.round(n / 100000) / 10) + "M views";
    else
        return Math.max(1, Math.round(n / 100000000) / 10) + "B views";
}

function prettyLikes(n) {
    n = parseInt(n.replace(/\D/g, ""));

    if (n < 0)
        return "none";
    else if (n == 1)
        return "1";
    else if (n < 999)
        return n;
    else if (n < 990000)
        return Math.max(1, Math.round(n / 1000)) + "K";//k on youtube are never decimals
    else if (n < 990000000)
        return Math.max(1, Math.round(n / 100000) / 10) + "M";
    else
        return Math.max(1, Math.round(n / 100000000) / 10) + "B";
}


//the ratings preview module
//fetches video like/disike count and fills rating previews above thumbnails with data
(function () {
    var API_ID = "AIzaSyBAJG2nNJdeIRURRWs3FoOnWpHa_2LnMok",
        URL = "https://www.googleapis.com/youtube/v3/videos?part=statistics&fields=items(id,statistics(likeCount,dislikeCount))&key=" + API_ID + "&id=",
        WAITTIME = 800,

        requestedVideoIds = [],
        grabDataSoonTimer,

        grabData = function () {
            if (requestedVideoIds.length > 0) {
                var ids = requestedVideoIds.splice(0, 50);


                var xmlHttp = new XMLHttpRequest();
                xmlHttp.open("GET", URL + ids.join(","));
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4 && xmlHttp.status == 200 && xmlHttp.responseText) {
                        chrome.storage.local.get("videoLikeDislikeCache", function (res) {
                            var cache = res.videoLikeDislikeCache || {},
                                now = Math.round(Date.now() / 1000 / 60);//in minutes

                            //remove old cached videos
                            for (var key of Object.keys(cache))
                                if (now - cache[key].time > (cache[key].likes + cache[key].dislikes < 40 ? 2 : 60))//cache lasts 60 minutes unless video has very few likes/dislikes; then it is 2
                                    delete cache[key];

                            //add new data to cache
                            for (var item of JSON.parse(xmlHttp.responseText).items) {
                                var ite = {
                                    time: now,
                                    id: item.id,
                                    likes: item.statistics ? parseInt(item.statistics.likeCount) : 0,
                                    dislikes: item.statistics ? parseInt(item.statistics.dislikeCount) : 0
                                };

                                cache[item.id] = ite;
                                populateRatingsPreview(ite);
                            }

                            chrome.storage.local.set({ videoLikeDislikeCache: cache });
                        });
                    }
                };
                xmlHttp.send();

                if (requestedVideoIds.length > 0)
                    grabDataSoon();
            }
        },
        grabDataSoon = function () {
            if (grabDataSoonTimer)
                clearTimeout(grabDataSoonTimer);
            grabDataSoonTimer = setTimeout(grabData, WAITTIME);
        },
        populateRatingsPreview = function (item) {
            for (let $previewRatings of document.querySelectorAll(".ytr-ratings-previewer[video-id='" + item.id + "']")) {
                var $innerDiv = $previewRatings.firstElementChild;

                if ($previewRatings && $innerDiv) {
                    if (item.likes + item.dislikes > 0) {
                        var rating = item.likes / (item.likes + item.dislikes);
                        if (rating > 0.86)
                            $previewRatings.setAttribute("ranking", "2");
                        else if (rating > 0.65)
                            $previewRatings.setAttribute("ranking", "1");
                        else
                            $previewRatings.setAttribute("ranking", "0");

                        $innerDiv.textContent = Math.round(rating * 100) + "%";
                        $innerDiv.style.width = Math.max(12, (1 - Math.sin(Math.min(2, rating + 1.012) * 1.57079632679)) * 100) + "%";
                    } else {
                        $previewRatings.setAttribute("ranking", "0");
                        $innerDiv.textContent = "?";
                        $innerDiv.style.width = "0%";
                    }
                }
            }
        };

    this.ratingsPreviewPopulate = function (videoId) {
        chrome.storage.local.get("videoLikeDislikeCache", function (res) {
            var item = (res.videoLikeDislikeCache || {})[videoId];
            if (item) {
                setInterval(() => populateRatingsPreview(item), WAITTIME);
            } else {
                if (requestedVideoIds.indexOf(videoId) == -1)
                    requestedVideoIds.push(videoId);

                if (requestedVideoIds.length >= 50)
                    grabData();
                else
                    grabDataSoon();
            }
        });
    };
})();


//run everything
(function () {
    //recheck all elements 3 times a second
    setInterval(function () {
        scanVideoElementGroups(false);
    }, 300);


    //grab options
    chrome.storage.local.get("options", function (res) {
        if (res)
            options = res.options;
        scanVideoElementGroups(true);

        if (options.adBlock)
            runAdBlock();
    });

    //whenever options are changed, update options
    chrome.storage.onChanged.addListener(function (changes) {
        if (changes && changes.options && changes.options.newValue) {
            options = changes.options.newValue;
            scanVideoElementGroups(true);

            if (changes.options.newValue.adBlock != changes.options.oldValue.adBlock)
                location.reload();
        }
    });
})();


/// ---------------------------------------------------------------------------------------------------
/// ----------- scanVideoElementGroups() finds and modifies groups of content appropriately -----------
/// ---------------------------------------------------------------------------------------------------
function scanVideoElementGroups(settingsChanged) {
    if (!options)
        return;

    //hide or don't hide comments
    if (options.hideComments)
        document.documentElement.classList.add("ytrHideComments");
    else
        document.documentElement.classList.remove("ytrHideComments");

    //set ratingsPreviewMode for css
    document.documentElement.className =
        document.documentElement.className.replace(constants.regex.replaceOldRatingsPreviewMode, " ytr-ratings-preview-mode-" + options.ratingsPreviewMode);

    //for each match group
    for (let group of groups) {
        //check if the group should run on this url
        if (!group.matches || group.matches.test(location.pathname)) {
            //and then run scan on all query match group elements
            for (let $parent of document.querySelectorAll(group.query)) {

                //don't check the element if it is invisible by checking if its offsetParent is null
                if ($parent.offsetParent === null)
                    continue;

                var videoId = group.getVideoId ? group.getVideoId.call($parent) : null,
                    ytrData = $parent.ytrData || {};

                //don't re-apply settings to already modified videos when settings havn't changed.  rescanAnyways bypasses this optimization
                if (!settingsChanged && !group.rescanAnyways && ytrData.videoId == videoId)
                    continue;


                var $title = group.titleQuery ? $parent.querySelector(group.titleQuery) : null,
                    $viewCount = group.viewCountQuery ? $parent.querySelector(group.viewCountQuery) : null,
                    $thumbnail = group.thumbnailQuery ? $parent.querySelector(group.thumbnailQuery) : null;

                //if title is empty when it shouldn't be, don't modify video yet
                if ($title && !$title.textContent.trim())
                    continue;

                //the id of the video changed so erase all of its cached data so it can be re-grabbed
                if (ytrData.videoId != videoId) {
                    ytrData = { videoId: videoId };
                    $parent.ytrData = ytrData;
                    //console.log(group.query, $parent, $title, $viewCount);
                }



                //Manage video view count
                if ($viewCount) {
                    //if view count data hasn't been grabbed before
                    if (!ytrData.prettyCount) {
                        //grab exact video view count from a string stored in an attribute.
                        let info = constants.regex.viewInfoParse.exec(
                            $parent.querySelector("#video-title").getAttribute("aria-label")
                        );

                        if (info) {
                            ytrData.timeAgo = info[1];
                            ytrData.exactCount = info[2];
                            ytrData.prettyCount = prettyViews(info[2]);
                            ytrData.isRecommended = $viewCount.textContent.indexOf("view") == -1;
                        }
                    }

                    if (ytrData.prettyCount) {
                        if (!options.replaceRFYTextWithViewCount && ytrData.isRecommended) {
                            $viewCount.textContent = "Recommended for you";
                        } else {
                            $viewCount.textContent =
                                (options.exactVideoViewCount ? ytrData.exactCount : ytrData.prettyCount) +
                                (options.showVideoAge ? " \u2022 " + ytrData.timeAgo : "");
                        }
                    }
                }



                //correct video titles
                if ($title) {
                    if (!ytrData.originalTitle || group.rescanAnyways)
                        ytrData.originalTitle = group.getVideoTitle ? group.getVideoTitle.call($parent) : $title.getAttribute("title") || $title.textContent.trim();

                    if (ytrData.originalTitle) {
                        let title = ytrData.originalTitle;

                        //remove emoji
                        if (options.censoredTitle.removeEmoji)
                            title = title.replace(constants.regex.matchEmoji, " ");

                        //remove text contained within elipses
                        if (options.censoredTitle.removeShortTextContainedWithinElipses) {
                            let newTitle = title.replace(constants.regex.matchElipses, " ");
                            if (newTitle.length > title.length / 3) //if the new title wasn't shortened too considerably, then apply changes to it.
                                title = newTitle;
                        }

                        //remove hashtags
                        if (options.censoredTitle.removeHashtags)
                            title = title.replace(constants.regex.matchHashtags, " ");

                        //remove repeating non-letter characters
                        if (options.censoredTitle.removeRepeatingNonLetterChars)
                            title = title.replace(constants.regex.dotdotdot, '\u2026').replace(constants.regex.matchRepeatingNonLetterChars, function (s) {
                                return s.charAt(0);
                            });

                        //capitalize titles correctly according to censoredTitle settings
                        if (options.censoredTitle.capitalization == 1) {
                            title = title.titleCap();
                        } else if (options.censoredTitle.capitalization == 2) {
                            title = title.titleCapSentences();
                        }

                        $title.textContent = title;
                    }
                }



                //add ratings preview bar and asks the ratings preview module to fill it with data
                if (options.ratingsPreviewMode != 0 && $thumbnail && !ytrData.previewRatings) {
                    ytrData.previewRatings = true;

                    var $previewRatings = $thumbnail.querySelector(".ytr-ratings-previewer");
                    if (!$previewRatings) {
                        $previewRatings = document.createElement("div");
                        $previewRatings.classList.add("ytr-ratings-previewer");
                        $previewRatings.appendChild(document.createElement("div"));
                        $thumbnail.appendChild($previewRatings);
                    }

                    $previewRatings.setAttribute("video-id", videoId);

                    ratingsPreviewPopulate(videoId);
                }


                //run any additional tasks that group may have
                if (group.additionalTasks)
                    group.additionalTasks.call($parent, $title);
            }
        }
    }
}






function runAdBlock() {
    //enable adblocking css
    document.documentElement.classList.add("ytrAdblock");

    //force remove all google ad iframes
    for (var ads of ["#google_ads_frame1"])
        for (var ad of document.querySelectorAll(ads))
            ad.parentElement.removeChild(ad);


    //this function inserts code that block ads
    var ab = document.createElement('script');
    ab.id = 'ytrAdblockerScript';
    ab.text = `
        //Youtube Refined AdBlocker Script
        //Copyright 2017 Marc Guiselin

        var justBlocked = false;

        //for the older version of youtube
        window.ytplayer = new Proxy(window.ytplayer || {}, {
            set: function (target, name, value) {

                //prevent infinite loop
                if(!justBlocked){
                    justBlocked = true;

                    if(!window.ytplayer)
                        window.ytplayer = {};
                    if(!window.ytplayer.config)
                        window.ytplayer.config = {};
                    if(!window.ytplayer.config.args)
                        window.ytplayer.config.args = {};

                    var args = window.ytplayer.config.args;
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
                    args.remarketing_url = "";
                    args.adsense_video_doc_id = "";

                    justBlocked = false;
                }

                target[name] = value;

                return true;
            }
        });

        //used by newer version of youtube
        window.yt = new Proxy(window.yt || {}, {
            set: function (target, name, value) {

                //prevent infinite loop
                if(!justBlocked){
                    justBlocked = true;

                    //remove data from some mighty suspicious variables
                    window.yt.ads = {};
                    if(window.yt.www)
                        window.yt.www.ads = {};

                    if(window.yt.config_){
                        //array that holds link to advertising pages
                        window.yt.config_.ZWIEBACK_PING_URLS = [];

                        //this should block all youtube surveys
                        if(window.yt.config_.openPopupConfig){
                            var o = window.yt.config_.openPopupConfig.supportedPopups;
                            if(o)
                                for(var key in o)
                                    if(key.toLowerCase().includes("survey"))
                                        o[key] = false;
                        }
                    }

                    justBlocked = false;
                }

                target[name] = value;

                return true;
            }
        });

        //overwites the default XMLHttpRequest function so that a custom open function can block requests to advertising sites like doubleclick.net
        var httpr = XMLHttpRequest;
        XMLHttpRequest = window.XMLHttpRequest = function(){
            var req = new httpr();
            req.originalOpen = req.open;
            req.open = function(method, url){
                if(url && (url.includes("doubleclick.net") || url.includes("researchnow.com"))){
                    //console.log("blocked: ", url);
                    arguments[1] = "";
                }
                req.originalOpen(...arguments);
            }
            return req;
        };

        //some special ads still make it through sometimes. this interval checks for a non youtube video in the main video element and force skips it
        setInterval(function(){
            var v = document.querySelector("video");
            if(v && v.src && v.src.indexOf("blob:") != 0){
                v.style.visibility = "hidden";
                v.currentTime = 10000;
            }else if(v){
                v.style.visibility = "visible";
            }
        }, 200);
    `;
    document.documentElement.appendChild(ab);
}