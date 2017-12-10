chrome.storage.local.get("options", function(res) {
    window.mainVue = new Vue({
        el: '#mainBody',
        data: {
            options: res.options,

            exampleTitleToAutocorrect: 'Vlog #26: I\'m just having THE WORST possible day!!!! \uD83D\uDE16\uD83D\uDE31 #hashtag *MUST WATCH!*'
        },
        mounted: function(){
            this.$el.style.visibility = "visible";

            //whenever options are changed, update options
            chrome.storage.onChanged.addListener(function (changes) {
                if (changes && changes.options && changes.options.newValue)
                    this.options = changes.options.newValue;
            }.bind(this));
        },
        methods: {
            saveData: function () {
                console.log('saveData()');
                chrome.storage.local.set({options: this.options});
            },


            exampleCorrectedTitle: function () {
                var title = this.exampleTitleToAutocorrect;

                if (this.options.censoredTitle.removeEmoji)
                    title = title.replace(' \uD83D\uDE16\uD83D\uDE31 ', ' ');

                if (this.options.censoredTitle.removeRepeatingNonLetterChars)
                    title = title.replace(/\!+/, '!');

                if (this.options.censoredTitle.removeShortTextContainedWithinElipses)
                    title = title.replace(/\*[\S\s]+\*/, ' ');

                if (this.options.censoredTitle.removeHashtags)
                    title = title.replace(/\s*#[^\s#\d][^\s#)(]+/g, ' ');

                if (this.options.censoredTitle.capitalization == 1) {
                    title = title.titleCap();
                } else if (this.options.censoredTitle.capitalization == 2) {
                    title = title.titleCapSentences();
                }

                return title;
            }
        }
    });
});