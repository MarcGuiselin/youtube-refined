// ============================
// Copyright 2018 Marc Guiselin
// ============================

// Vue js pretty checkboxes by Marc Guiselin 2017 (jsfiddle.net/MarcGuiselin/66vgL2ne/)
// Modified from Dylan Raga's beautiful css animated checkboxes http://codepen.io/dylanraga/pen/Qwqbab
// Usage: <pretty-checkbox v-model="variable" v-bind:disabled="optionalVariableThatDictastesIfThisCheckboxIsDisabled">label text or html</pretty-checkbox>
// Just an awesome-looking <input type="checkbox"/> replacement
var vueCheckboxCount = 0;
Vue.component('pretty-checkbox', {
    template: `
		<div class="pretty-checkbox" v-bind:class="{disabled: disabled}" v-on:mouseover="enableAnimation">
            <input id="NA" type="checkbox" v-model="checked" v-on:change="updateVModel"/>
            <label for="NA"><span></span><slot></slot></label>
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
    data(){
        return {checked: this.value};
    },
    watch: {
        value(val){
            this.enableAnimation();
            this.checked = val;
        }
    },
    mounted(){
        // Set id and for on label so clicking toggle triggers toggle
        var id = 'pretty-check-box-' + vueCheckboxCount++;
        this.$el.querySelector('input').setAttribute('id', id);
        this.$el.querySelector('label').setAttribute('for', id);

        // Font sizes below 16 make the checkbox too small  (font size of checkbox is 1.4x of that)
        var $span = this.$el.querySelector('label span:first-child');
        if(parseFloat(getComputedStyle($span).fontSize) < 22.4)
            $span.style.fontSize = '22.4px';
    },
    methods: {
        enableAnimation(){
            this.$el.classList.add('enable-animation');
        },
        updateVModel(){
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
// Usage: <pretty-dropdown v-model="variable" data="{option1: value1, option2: value2, etc}"/>
// Just an awesome-looking <select> replacement dropdown menu
Vue.component('pretty-dropdown', {
    template: `
		<div class="dropdown" v-on:mouseover="enableAnimation">
			<input class="dropdown-input" type="text"/>
			<div class="dropdown-text">&nbsp;</div>
			<ul>
				<li v-for="(val, key) in JSON.parse(data)" v-bind:class="{selected: value == val}" v-on:mousedown="updateVModel(val)">{{key}}</li>
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
    mounted(){
        // Set textContent manually because setting it with vue causes the css animation on it to stutter
        this.dropdownText = this.$el.getElementsByClassName('dropdown-text')[0];
        this.dropdownText.textContent = this.getKeyForValue(this.value) + '      ';
    },
    watch: {
        value(val){
            this.dropdownText.textContent = this.getKeyForValue(val) + '      ';
        }
    },
    methods: {
        enableAnimation(){
            this.$el.classList.add('enable-animation');
        },
        getKeyForValue(value){
            var dataParsed = JSON.parse(this.data);
            for (let key in dataParsed)
                if (dataParsed[key] == value)
                    return key;
            return value;
        },
        updateVModel(val){
            this.$emit('input', val);
        }
    }
});



// Vue js pretty button by Marc Guiselin 2017 (jsfiddle.net/MarcGuiselin/7j9wym38/)
// Usage: <pretty-button grey="Bool" focused="Bool" v-on:click="doThing">text or html</pretty-button>
// Just an awesome-looking <button> replacement
Vue.component('pretty-button', {
    template: `
		<button class="pretty-button" v-bind:class="{grey, focused, 'enable-animation': enableAnim}" v-on:mouseover="enableAnim = true" v-on:click="click">
    		<slot></slot>
        </button>
	`,
    props: {
        grey: {
            type: Boolean,
            required: false
        },
        focused: {
            type: Boolean,
            required: false
        }
    },
    data(){
        return {enableAnim: false};
    },
    watch: {
        focused(){
            this.enableAnim = true;
        }
    },
    methods: {
        click(){
            this.$emit('click');
        }
    }
});



// Vue js pretty input by Marc Guiselin 2017
// Usage: <pretty-input v-model="variable" placeholder="optional text" maxlength="optional number" autoresize="optional boolean" type="optional 'text' || 'passowrd' || 'number'"></pretty-input>
// Just an awesome-looking <input> replacement
Vue.component('pretty-input', {
    template: `
    <div class="pretty-input" v-on:mouseover="enableAnimation">
        <input v-bind:placeholder="placeholder || ''" v-bind:maxlength="Math.floor(maxlength)" v-bind:type="type || 'text'" v-model="val" v-on:input="updateVModel" v-on:focus="focus" v-on:blur="blur" v-on:keydown="keydown" spellcheck="false"/>
        <span class="underline"></span>
    </div>
	`,
    props: {
        value: {
            type: String,
            required: true
        },
        placeholder: {
            type: String,
            required: false
        },
        maxlength: {
            type: Number,
            required: false
        },
        autoresize: {
            type: Boolean,
            required: false
        },
        type: {
            type: String,
            required: false
        }
    },
    data(){
        return {val: this.value || ''};
    },
    mounted(){
        this.updateSize();
    },
    watch: {
        value(val) {
            if(this.val != val || '')
                this.prettyText();
            this.val = val || '';
            this.updateSize();
        }
    },
    methods: {
        enableAnimation(){
            this.$el.classList.add('enable-animation');
        },
        prettyText(){
            if(this.type == 'number')
                this.$el.querySelector('input').value = this.val = isNaN(parseFloat(this.val)) ? '' : parseFloat(this.val).toFixed(2);
        },
        focus(evt){
            evt.currentTarget.select();
            this.enableAnimation();
            this.$emit('focus');
        },
        blur(){
            this.prettyText();
            this.$emit('blur');
        },
        keydown(evt){
            if(this.type == 'number')
                if(evt.key == '-' || evt.key == '.' && (this.val == '' || this.val.includes('.')))
                    evt.preventDefault();
        },
        updateVModel(){
            let val = this.val;
            if(this.type == 'number'){
                val = parseFloat(val.replace(/\.$/, ''));
                if(isNaN(val))
                    val = 0;
            }
            this.$emit('input', val);
            this.updateSize();
        },
        updateSize(){
            let $input = this.$el.querySelector('input');
            if(this.autoresize && $input){
                let $span = document.createElement('span'),
                    style = window.getComputedStyle($input, null);
                $span.textContent = ($input.value && (this.type == 'password' ? '\u2022'.repeat($input.value.length) : $input.value)) || $input.getAttribute('placeholder') || '';
                $span.style.font = style.getPropertyValue('font');
                $span.style.letterSpacing = style.getPropertyValue('letter-spacing');
                $span.style.whiteSpace = 'pre';

                this.$el.appendChild($span);
                $input.style.width = ($span.getBoundingClientRect().width + parseFloat(style.getPropertyValue('padding-left')) + parseFloat(style.getPropertyValue('padding-right'))) + 'px';
                this.$el.removeChild($span);
            }else if($input){
                $input.style.width = 'auto';
            }
        }
    }
});