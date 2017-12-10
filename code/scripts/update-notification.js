chrome.storage.local.get("options", function(res) {
    window.mainVue = new Vue({
        el: "#all",
        data: {
            options: res.options,
            updates: [],
            bugsFixed: 0,
            thanks: [],
            firstShow: false,
            currentVersion: updateNotes[updateNotes.length - 1].version
        },
        mounted: function(){
            //whenever options are changed, update options
            chrome.storage.onChanged.addListener(function (changes) {
                if (changes && changes.options && changes.options.newValue)
                    this.options = changes.options.newValue;
            }.bind(this));

            if(this.options.promo.lastUpdateShowedNotification){//show regular update message
                this.options.promo.lastUpdateShowedNotification = "initial";

                var lastVersion = this.options.promo.lastUpdateShowedNotification;
                var showVersionUpdates = false;
                for(let updateNote of updateNotes){
                    let v = updateNote.version.trim();

                    if(showVersionUpdates){
                        if(updateNote.updates){
                            for(let u of updateNote.updates){
                                let s = u.split("|");
                                this.updates.push({
                                    text: s.shift(),
                                    subtexts: s
                                });
                            }
                        }
                        if(updateNote.bugsFixed)
                            this.bugsFixed += updateNote.bugsFixed;
                        this.thanks.push(...(updateNote.thanks || "").split("|"));
                    }

                    if(v == lastVersion)
                        showVersionUpdates = true;
                    if(v == this.currentVersion)
                        showVersionUpdates = false;
                }

                //convert list of names to comma separated list
                this.thanks = this.thanks.join(", ").replace(/,(?!.*,)/, ", and").trim();

            }else{//first time loading extension and seeing this message
                this.firstShow = true;

                //if popup is opened, close this
                setInterval(function(){
                    for (let w of chrome.extension.getViews()){
                        if (w.location.pathname === '/popup.html'){
                            this.exit();
                            break;
                        }
                    }
                }.bind(this), 200);
            }
        },
        methods: {
            saveData: function () {
                console.log("saveData()");
                chrome.storage.local.set({options: this.options});
            },
            exit: function(){
                this.options.promo.lastUpdateShowedNotification = this.currentVersion;
                this.options.promo.triggerShowUpdate = false;
                chrome.storage.local.set({options: this.options});
            }
        }
    });
});