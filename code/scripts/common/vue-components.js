// Vue js pretty checkboxes by Marc Guiselin 2017 (jsfiddle.net/MarcGuiselin/66vgL2ne/)
// Modified from Dylan Raga's beautiful css animated checkboxes http://codepen.io/dylanraga/pen/Qwqbab
// Usage: <pretty-checkbox v-model='variable' v-bind:disabled='optionalVariableThatDictastesIfThisCheckboxIsDisabled'>label text or html</pretty-checkbox>
// Just an awesome-looking <input type='checkbox'/> replacement
var vueCheckboxCount = 0;
Vue.component('pretty-checkbox', {
    template: `
		<div class='pretty-checkbox' v-bind:class='{disabled: disabled}' v-on:mouseover='enableAnimation'>
            <input id='NA' type='checkbox' v-model='checked' v-on:change='updateVModel'/>
            <label for='NA'><span></span><slot></slot></label>
		</div>
	`,
    props: {
        value: {
            type: Boolean,
            required: true
        },
        disabled: {
            type: Boolean,
            required: false
        }
    },
    data: function(){
        return {checked: this.value};
    },
    watch: {
        value: function(val) {
            this.enableAnimation();
            this.checked = val;
        }
    },
    mounted: function() {
        //set id and for on label so clicking toggle triggers toggle
        var id = "prettyCheckBox" + vueCheckboxCount++;
        this.$el.querySelector("input").setAttribute("id", id);
        this.$el.querySelector("label").setAttribute("for", id);

        //font sizes below 16 make the checkbox too small  (font size of checkbox is 1.4x of that)
        var $span = this.$el.querySelector("label span:first-child");
        if(parseFloat(getComputedStyle($span).fontSize) < 22.4)
            $span.style.fontSize = "22.4px";
    },
    methods: {
        enableAnimation: function() {
            this.$el.classList.add('enable-animation');
        },
        updateVModel: function() {
            if(this.disabled){
                this.$el.classList.remove('shake');
                setTimeout(() => this.$el.classList.add('shake'), 100);
                setTimeout(() => this.checked = this.value, 600);
            }else{
                this.$emit('input', this.checked);
            }
        }
    }
});



// Vue js pretty dropdown by Marc Guiselin 2017 (jsfiddle.net/MarcGuiselin/nws9juge/)
// Usage: <pretty-dropdown v-model='variable' data='{option1: value1, option2: value2, etc}'/>
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



// Vue js pretty button by Marc Guiselin 2017 (jsfiddle.net/MarcGuiselin/7j9wym38/)
// Usage: <pretty-button v-bind:grey='optionalGreyStyleTrueOrFalse' v-on:click='doThing'>text or html</pretty-button>
// Just an awesome-looking <button> replacement
Vue.component('pretty-button', {
    template: `
		<button class='pretty-button' v-bind:class='{grey: grey}' v-on:mouseover='enableAnimation' v-on:click='click'>
    		<slot></slot>
        </button>
	`,
    props: {
        grey: {
            type: Boolean,
            required: false
        }
    },
    methods: {
        enableAnimation: function() {
            this.$el.classList.add('enable-animation');
        },
        click: function() {
            this.$emit('click');
        }
    }
});