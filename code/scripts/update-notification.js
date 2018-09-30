// ============================
// Copyright 2018 Marc Guiselin
// ============================


// Google analytics
{
    let currentPage = 'Home';


    function gevent(action, value, label){
        ga('send', 'event', 'Page: ' + currentPage, action, label || '', value);
    }
    function gpage(name, path){
        currentPage = name;
        ga('send', 'pageview', path);
    }

    const ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
    ga('create', chrome.runtime.id == 'bhbammekghlcjhbiekoldhpfgelblcni' ? 'UA-107933261-3' : 'UA-107933261-4', 'auto');
    ga('set', 'checkProtocolTask', null); // Removes failing protocol check.  http://stackoverflow.com/a/22152353/1958200

    /* global gevent:false gpage:false*/
    this.gevent = gevent;
    this.gpage = gpage;
}


chrome.storage.local.get('options', function(res) {
    window.mainVue = new Vue({
        el: '#all',
        data: {
            options: res.options,
            updates: [],
            bugsFixed: 0,
            thanks: [],
            firstShow: false,
            noShowScrollDown: true,
            currentVersion: updateNotes[updateNotes.length - 1].version
        },
        mounted(){
            // Whenever options are changed, update options
            chrome.storage.onChanged.addListener((changes) => {
                if (changes.options)
                    this.options = changes.options.newValue;
            });
            
            if(this.options.promo.lastUpdateShowedNotification){// Show regular update message
                gpage('Update Notification', '/update-notification.html');
                let lastVersion = this.options.promo.lastUpdateShowedNotification,
                    showVersionUpdates = false,
                    thanksPeople = [];

                for(let updateNote of updateNotes){
                    let v = updateNote.version.trim();

                    if(showVersionUpdates){
                        if(updateNote.updates)
                            this.updates.push(...updateNote.updates.map(u => u.split(/\s*\|\s*/g)));
                        this.bugsFixed += updateNote.bugsFixed || 0;
                        thanksPeople.push(...(updateNote.thanks || '').split(/\s*\|\s*/g).map(p => p && p.trim()).filter(p => p));
                    }

                    if(v == lastVersion)
                        showVersionUpdates = true;
                    if(v == this.currentVersion)
                        showVersionUpdates = false;
                }

                // Convert list of names to comma separated list
                if(thanksPeople.length <= 2)
                    this.thanks = thanksPeople.sort().join(' and ');
                else
                    this.thanks = thanksPeople.sort().join(', ').replace(/,(?!.*,)/, ', and');

                // Show scroll down button when updates are big enough to hide the end of the page
                this.$nextTick(() => {
                    if(document.querySelector('#updates').clientHeight > 230){
                        this.noShowScrollDown = false;
                        this.$el.addEventListener('scroll', () => this.noShowScrollDown = this.$el.scrollTop > 50);
                    }
                });

            }else{// First time loading extension and seeing this message
                gpage('Install Notification', '/install-notification.html');
                this.firstShow = true;

                // For options page to close this when it is opened
                window.firstShow = true;
                window.exit = () => this.exit();
            }
        },
        methods: {
            saveData(){
                chrome.storage.local.set({options: this.options});
            },
            exit(){
                this.options.promo.lastUpdateShowedNotification = this.currentVersion;
                this.options.promo.triggerShowUpdate = false;
                chrome.storage.local.set({options: this.options});
            },
            scrollDownClick(){
                this.$el.scroll({
                    top: this.$el.clientHeight, 
                    left: 0, 
                    behavior: 'smooth' 
                });
            },
            gevent(action, value, label){
                gevent(action, value, label);
            }
        }
    });
});