


// Vue js pretty dropdown by Marc Guiselin 2017 (jsfiddle.net/MarcGuiselin/nws9juge/)
// Usage: <pretty-dropdown v-model='filterUnit.hideAction' data='{option1: value1, option2: value2, etc}'/>
// Just an awesome-looking <select> replacement dropdown menu
Vue.component('pretty-dropdown', {
    template: `
		<div class='dropdown' v-on:mouseover='enableAnimation'>
			<input class='dropdown-input' type='text'/>
			<div class='dropdown-text'>&nbsp;</div>
			<ul>
				<li v-for='(val, key) in JSON.parse(data)' v-bind:class='{selected: value == val}' v-on:mousedown='updateVModel(val)'>{{key}}</li>
			</ul>
		</div>
	`,
    props: {
        value: {
            type: [String, Number, Boolean, Symbol],
            required: true
        },
        data: {
            type: String,
            required: true
        }
    },
    mounted: function () {
        //set textContent manually because setting it with vue causes the css animation on it to stutter
        this.dropdownText = this.$el.getElementsByClassName('dropdown-text')[0];
        this.dropdownText.textContent = this.getKeyForValue(this.value) + '      ';
    },
    watch: {
        value: function (val) {
            this.dropdownText.textContent = this.getKeyForValue(val) + '      ';
        }
    },
    methods: {
        enableAnimation: function () {
            this.$el.classList.add('enable-animation');
        },
        getKeyForValue: function (value) {
            var dataParsed = JSON.parse(this.data);
            for (let key in dataParsed)
                if (dataParsed[key] == value)
                    return key;
            return value;
        },
        updateVModel: function (val) {
            this.$emit('input', val);
        }
    }
});




chrome.storage.local.get("options", function(res) {
    window.mainVue = new Vue({
        el: '#mainBody',
        data: {
            options: res.options,

            exampleTitleToAutocorrect: 'Vlog #26: I\'m just having THE WORST possible day!!!! \uD83D\uDE16\uD83D\uDE31 #hashtag *MUST WATCH!*'
        },
        mounted: function(){
            this.$el.style.visibility = "visible";
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