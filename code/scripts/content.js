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
        videoIdRegexMatch: new RegExp("(v=)([\\w\\-]{8,14})")
    }
});
const groups = Object.freeze([
    { //video suggestions listed next to the video on /watch pages, including videos in a playlist
        matches: null,

        //         regular video                 video in playlist
        query: "ytd-compact-video-renderer, ytd-playlist-panel-video-renderer",
        titleQuery: "#video-title",
        viewCountQuery: "#metadata-line",
        getVideoId: function () {
            var match = constants.regex.videoIdRegexMatch.exec(this.querySelector("a").getAttribute("href"));
            return match ? match[2] : null;
        }
    },


    { //video suggestions listed in a grid on channel home pages and videos page. check out https://www.youtube.com/channel/UC_ViSsVg_3JUDyLS3E2Un5g and
        matches: new RegExp("\\/(channel|user)\\/.+", "i"),

        query: "ytd-grid-video-renderer",
        titleQuery: "#video-title",
        viewCountQuery: "#metadata-line span",
        getVideoId: function () {
            var match = constants.regex.videoIdRegexMatch.exec(this.querySelector("a").getAttribute("href"));
            return match ? match[2] : null;
        }
    },


    { //large vertically listed video suggestions on channel/user home pages and also on the youtube trending page. check out https://i.imgur.com/XHTfpjY.png and https://www.youtube.com/channel/UC7A_dLnSAjl7uROCdoNyjzg
        matches: new RegExp("\\/(channel|user)\\/.+|\\/feed\\/trending.*", "i"),

        query: "ytd-video-renderer",
        titleQuery: "#video-title",
        viewCountQuery: "#metadata-line span",
        getVideoId: function () {
            var match = constants.regex.videoIdRegexMatch.exec(this.querySelector("a").getAttribute("href"));
            return match ? match[2] : null;
        }
    },


    /*{ //currently watching video on /watch pages
        matches: new RegExp("^.*\/watch.*$", "i"),

        query: "#top",
        titleQuery: "h1.title",
        getVideoId: function () {
            return constants.regex.videoIdRegexMatch.exec(location.search)[2];
        }
    },

    { //currently watching video on channel/user home pages
        matches: new RegExp("\\/(channel|user)\\/.+", "i"),

        query: "ytd-channel-video-player-renderer",
        titleQuery: "#title a",
        getVideoId: function () {
            return constants.regex.videoIdRegexMatch.exec(document.querySelector("#title a").getAttribute("href"))[2];
        }
    },*/
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
    else if (n < 900)
        return n + " views";
    else if (n < 900000)
        return Math.max(1, Math.round(n / 100) / 10) + "K views";
    else if (n < 900000000)
        return Math.max(1, Math.round(n / 100000) / 10) + "M views";
    else
        return Math.max(1, Math.round(n / 100000000) / 10) + "B views";
}


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

                //don't re-apply settings to already modified videos when settings havn't changed
                if (!settingsChanged && ytrData.videoId == videoId)
                    continue;


                var $title = group.titleQuery ? $parent.querySelector(group.titleQuery) : null,
                    $viewCount = group.viewCountQuery ? $parent.querySelector(group.viewCountQuery) : null;

                //if title is empty when it shouldn't be, don't modify video yet
                if ($title && !$title.textContent.trim())
                    continue;

                //the id of the video changed so erase all of its cached data so it can be re-grabbed
                if (ytrData.videoId != videoId) {
                    ytrData = { videoId: videoId };
                    $parent.ytrData = ytrData;
                }



                //Manage video view count
                if ($viewCount) {
                    //if view count data hasn't been grabbed before
                    if (!ytrData.prettyCount) {
                        //grab exact video view count from a string stored in an attribute.
                        let info = constants.regex.viewInfoParse.exec(
                            $parent.querySelector("#video-title").getAttribute("aria-label")
                        );

                        try {
                            ytrData.timeAgo = info[1];
                            ytrData.exactCount = info[2];
                            ytrData.prettyCount = prettyViews(ytrData.exactCount);
                            ytrData.isRecommended = $viewCount.textContent.indexOf("view") == -1;
                        } catch (e) {
                            alert("info parse error");
                            console.log(e)
                            console.log($viewCount)
                            console.log($parent.querySelector("#video-title").getAttribute("aria-label"))
                        }
                    }


                    if (!options.replaceRFYTextWithViewCount && ytrData.isRecommended) {
                        $viewCount.textContent = "Recommended for you";
                    } else {
                        $viewCount.textContent =
                            (options.exactVideoViewCount ? ytrData.exactCount : ytrData.prettyCount) +
                            (options.showVideoAge ? " \u2022 " + ytrData.timeAgo : "");
                    }
                }



                //correct video titles
                if ($title) {
                    if (!ytrData.originalTitle)
                        ytrData.originalTitle = $title.getAttribute("title") || $title.textContent.trim();

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
                    //$title.textContent = title;
                    //$title.innerHTML = title;
                }
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


    //the window.ytplayer.config.args variable contains properties describing the behaviour of ads.
    //this function inserts code that resets the properties
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
                    //console.log("adblocked1!!!!!")
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
                    //console.log("adblocked2!!!!!")
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
                            var o = window.yt.config_.openPopupConfig;
                            for(var key in o)
                                o[key] = false;
                        }
                    }

                    justBlocked = false;
                }

                target[name] = value;

                return true;
            }
        });
    `;
    document.documentElement.appendChild(ab);
}







/*
Different codes



setInterval(function(){
    if(!document.documentElement.classList.contains("ytrAdblock") && window.ytplayer && window.ytplayer.config && window.ytplayer.config.args){
        var value = window.ytplayer.config.args;
        value.ad_tag=0;
        value.ad_preroll=0;
        value.ad_device=0;
        value.ad_module=0;
        value.ad3_module=0;
        value.ad_logging_flag=0;
        value.dclk=0;
        value.ad_slots='';
        value.adSlots='';
        value.afv_ad_tag_restricted_to_instream='';
        value.afv_ad_tag='';
        value.freewheel_ad_tag='';
        value.vmap='';
        value.fexp='';

        value.allow_html5_ads="0";
        value.ppv_remarketing_url = "";
    }
}, 25);








console.log("i, the script, was run")
window.ytplayer = new Proxy({}, {
    set: function(target, name, value) {
        console.log("this magical function was called!");
        if (name === "config" && value && value) {
            var vv = ((value.vmap || "")
                    .match(/breakType=/g) || [])
                .length;
            setTimeout(function() {
                window.postMessage({
                    t: "cntv",
                    v: vv
                }, "*")
            }, 2500);
            value.ad_tag=0;
            value.ad_preroll=0;
            value.ad_device=0;
            value.ad_module=0;
            value.ad3_module=0;
            value.ad_logging_flag=0;
            value.dclk=0;
            value.ad_slots='';
            value.adSlots='';
            value.afv_ad_tag_restricted_to_instream='';
            value.afv_ad_tag='';
            value.freewheel_ad_tag='';
            value.vmap='';
            value.fexp='';
        }
        target[name] = value;
        return true;
    }
});
*/