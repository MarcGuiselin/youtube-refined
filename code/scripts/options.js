// ============================
// Copyright 2018 Marc Guiselin
// ============================

// Define constants
const $body = document.body,
      $scroll = document.scrollingElement;


const isValidRegex = (r) => {
    if(r.trim() == '')
        return false;
    try {
        RegExp(r);
        return true;
    }catch(e){
        return false;
    }
};
const plural = (amount, name) => {
    return (amount == 1 ? '1 ' + name : amount + ' ' + name + 's');
};
const pluralandplural = (amount1, name1, amount2, name2) => {
    return plural(amount1, name1) + (amount2 == 0 ? '' : ' and ' + plural(amount2, name2));
};
const prettyTime = (timeInSeconds) => {
    // A day or more (Days and hours)
    if(timeInSeconds >= 86400){
        let days    = Math.floor(timeInSeconds / 86400),
            hours   = Math.round(timeInSeconds / 3600 - days * 24);
        return pluralandplural(days, 'day', hours, 'hour');
    }
    // An hour or more (hours and minutes)
    else if(timeInSeconds >= 3600){
        let hours   = Math.floor(timeInSeconds / 3600),
            minutes = Math.round(timeInSeconds / 60 - hours * 60);
        return pluralandplural(hours, 'hour', minutes, 'min');
    }
    // A minute or more (minutes and seconds)
    else if(timeInSeconds >= 60){
        let minutes = Math.floor(timeInSeconds / 60),
            seconds = Math.round(timeInSeconds - minutes * 60);
        return pluralandplural(minutes, 'min', seconds, 'sec');
    }
    // Less than a minute (seconds)
    else{
        let seconds = Math.max(0, Math.floor(timeInSeconds));
        return plural(seconds, 'second');
    }




    /* 0
    let days =      Math.floor(timeInSeconds / 24 / 60 / 60),
        hours =     Math.floor(timeInSeconds / 60 / 60 - days * 24),
        minutes =   Math.floor(timeInSeconds / 60 - days * 24 * 60 - hours * 60),
        seconds =   Math.floor(timeInSeconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60);

    let s = [];
    if (days == 1)
        s.push('1 day');
    else if (days > 1)
        s.push(days + ' days');

    if (hours == 1)
        s.push('1 hour');
    else if (hours > 1)
        s.push(hours + ' hours');

    if(days == 0){
        if (minutes == 1)
            s.push('1 minute');
        else if (minutes > 1)
            s.push(minutes + ' minutes');
    }

    if(hours == 0 && days == 0){
        if (seconds == 1)
            s.push('1 second');
        else
            s.push(seconds + ' seconds');
    }
    
    return s.reverse().join(', ').replace(/,\s(?=[^,]+$)/, ' and ');*/
};
const simpleStatsChart = (data) => {
    if(data.length == 1)
        data.push(data[0]);
    
    let min = Math.max(0, Math.min(...data)),
        max = Math.max(1, ...data),
        range = max - min,
        len = data.length - 1,
        dplot = 'M' + data.map((d, i) => ((len - i) / len * 292 + 2).toFixed(4) + ',' + ((max - d) / range  * 65.8 + 6).toFixed(4)).join('L')

    return {
        dplot,
        dfill: dplot + 'L2,100L294,100Z',

        cx: 294,
        cy: ((max - data[0]) / range * 65.8 + 6)
    };
    /* Original Code:
    
    const
        scaleX = 300,
        scaleY = 100,
        padTop = 6,
        padLeft = 2,
        padRight = 6,
        fillHeight = .7;
    
    if(data.length == 1)
        data.push(data[0]);
    
    let min = Math.max(0, Math.min(...data)),
        max = Math.max(1, ...data),
        range = max - min,
        len = data.length - 1,
        dplot = 'M' + data.map((d, i) => ((len - i) / len * (scaleX - padLeft - padRight) + padLeft).toFixed(4) + ',' + ((max - d) / range * (scaleY - padTop) * fillHeight + padTop).toFixed(4)).join('L')

    return {
        dplot,
        dfill: `${dplot}L${padLeft},${scaleY}L${scaleX - padRight},${scaleY}Z`,

        cx: scaleX - padRight,
        cy: ((max - data[0]) / range * (scaleY - padTop) * fillHeight + padTop)
    };*/
};
const percentagesText = (from, to, name) => {
    if(to == 0)
        return [];
    let ratio = Math.round(from / to * 100 - 100);
    if(ratio == 0)
        return ['0% ' + name];
    else if(ratio > 0)
        return ['+' + ratio + '% over ' + name];
    else
        return [ratio + '% under ' + name];
};
const downloadTextFile = (text, filename) => {
    let a = document.createElement('a');
    
    // Set file content and file name
    a.href = window.URL.createObjectURL(new Blob([text], {type: 'text/plain'}));
    a.download = filename;

    // Download
    $body.appendChild(a);
    a.click();
    $body.removeChild(a);
};
      

// #region run things right on page load
// Close any other opened option pages
for (let w of chrome.extension.getViews())
    if(w.location.pathname === '/options.html' && w != window)
        w.close();

// Open the most recently opened options page
if (!location.hash)
    location.hash = localStorage.getItem('openedOptionsPage') || '';

// Show version name
document.getElementById('version-name').textContent = (chrome.runtime.getManifest && chrome.runtime.getManifest().version_name) || '';

// Load up year number into copyright
document.getElementById('copyright-year').textContent = Math.max(2018, new Date().getFullYear()).toString();

// #endregion


// Google analytics
{
    let currentPage = '';

    function gpageview(name){
        if(currentPage != name){
            currentPage = name;
            ga('send', 'pageview', '/options_' + currentPage.replace(/\s/g, '_').toLowerCase());
        }
    }
    function gevent(action, value, label){
        //console.log('Page: ' + (currentPage || 'Home'), action, label || '', value)
        ga('send', 'event', 'Page: ' + (currentPage || 'Home'), action, label || '', value);
    }

    const ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
    ga('create', chrome.runtime.id == 'bhbammekghlcjhbiekoldhpfgelblcni' ? 'UA-107933261-3' : 'UA-107933261-4', 'auto');
    ga('set', 'checkProtocolTask', null); // Removes failing protocol check.  http://stackoverflow.com/a/22152353/1958200

    /* global gpageview:false gevent:false*/
    this.gpageview = gpageview;
    this.gevent = gevent;
}


// Tag list editor vue component
{
    var tagListEditors = [];

    const groupIndexValid = (index) => Number.isInteger(index) && index >= 0;
    const taglistEditorApiKey = 'AIzaSyAq3wXwmr0GbscQu4bkADrfTg3YmBU0QX4';

    const maxGroupedTagsToPreview = 2;
    const maxTagsToPreview = 7;
    
    Vue.component('tag-list-editor', {
        template: `
            <div class="tag-editor-container">
                <div v-if="usingEditor">Editing tags. Click on a tag to edit it. Click the + signs to add a new tag. Click on the Xs next to tags to remove them. Click outside the editor to save it.</div>
                <div v-else>Click to edit tags</div>
                <div class="tag-editor" v-bind:class="{'advanced-edit-mode': advancedEditMode, 'editing': usingEditor}" v-on:mousedown="clickedTagEditor">
                    <template v-if="parsedTagList.groupedTags.length == 0 && parsedTagList.tags.length == 0">
                        <div class="tag group add-group-button" v-on:click="clickedAddNewGroup" v-on:mousedown="absorbClicks" title="Add new tag in group">
                            <span class="add-new-tag"></span>
                        </div><div class="add-new-tag empty" v-on:click="clickedAddNewTag" v-on:mousedown="absorbClicks" title="Add new tag">Taglist empty.  Click to add a new tag</div>
                    </template>
                    <template v-else>
                        <div class="tag group" v-for="(groupedTag, groupIndex) in getGroupedTags()">
                            <template v-for="(tag, tagIndex) in groupedTag">
                                <div v-if="usingEditor && editingGroupedTag == groupIndex && editingTag == tagIndex"
                                    class="tag editing" v-bind:class="tag.getDisplayMode()" v-bind:style="{'min-width': editingTagWidth || '16em'}" v-on:mousedown="absorbClicks">
                                        <span class="auto-width type">{{editingTagTypeText}}&nbsp;&nbsp;&nbsp;<input          v-model="editingTagTypeText"       v-on:focus="focusEditingTagInput($event, 'type')"       v-on:input="inputEditingTagInput('type')"       v-on:keydown="keydownEditingTagInput($event, 'type')"/></span
                                    ><span class="auto-width comparator">{{editingTagComparatorText}}&nbsp;&nbsp;&nbsp;<input v-model="editingTagComparatorText" v-on:focus="focusEditingTagInput($event, 'comparator')" v-on:input="inputEditingTagInput('comparator')" v-on:keydown="keydownEditingTagInput($event, 'comparator')"/></span
                                    ><span class="auto-width value">{{tag.value}}&nbsp;&nbsp;&nbsp;<input                     v-model="editingTagValueText"      v-on:focus="focusEditingTagInput($event, 'value')"      v-on:input="inputEditingTagInput('value')"      v-on:keydown="keydownEditingTagInput($event, 'value')"/></span>
                                    <div class="hintbox" v-if="editingTagLoadingSuggestions || editingTagSuggestions.length" v-bind:style="{left: hintboxOffset}" v-on:click="absorbClicks">
                                        <div class="loading" v-if="editingTagLoadingSuggestions"></div>
                                        <div class="suggest-text" v-for="(suggestion, suggestionIndex) in editingTagSuggestions" v-bind:class="{'selected': suggestionIndex == editingTagSuggestionsSelected}" v-on:click="clickedSuggestion(suggestion)" v-on:mouseover="mouseOverSuggestion">
                                            <div class="image thumbnail" v-if="suggestion.thumbnail" v-bind:style="{'background-image': 'url(' + suggestion.thumbnail + ')'}"></div>
                                            <div class="image avatar" v-if="suggestion.avatar" v-bind:style="{'background-image': 'url(' + suggestion.avatar + ')'}"></div>
                                            <span v-html="suggestion.html"></span>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="tag" v-bind:class="tag.getDisplayMode()" v-on:click="clickedTagSoEditIt($event, groupIndex, tagIndex, 'value')" v-on:mousedown="absorbClicks">
                                    <template v-if="tag.isError()">
                                        Error: {{tag.getErrorMsg()}}
                                    </template><template v-else-if="tag.isSearchGroup()">
                                        <i v-on:click="clickedTagSoEditIt($event, groupIndex, tagIndex, 'type')">{{tag.getPrettyType()}}</i><span class="comparator" v-on:click="clickedTagSoEditIt($event, groupIndex, tagIndex, 'comparator')">{{tag.getPrettyComparator()}}</span>{{tag.value}}
                                    </template><template v-else>
                                        {{tag.value}}
                                    </template><span class="x" v-on:click="clickedRemoveTag($event, groupIndex, tagIndex)" v-on:mousedown="absorbClicks" title="Remove Tag"></span>
                                </div><span class="and"> AND </span>
                            </template><span class="add-new-tag" v-on:click="clickedAddNewTagInGroup(groupIndex)" v-on:mousedown="absorbClicks" title="Add new tag in group"></span>
                        </div><div class="tag group add-group-button" v-on:click="clickedAddNewGroup" v-on:mousedown="absorbClicks">
                            <span class="add-new-tag" title="Add new tag"></span>
                        </div><template v-for="(tag, tagIndex) in getTags()">
                            <div v-if="usingEditor && editingGroupedTag == -1 && editingTag == tagIndex"
                                class="tag editing" v-bind:class="tag.getDisplayMode()" v-bind:style="{'min-width': editingTagWidth || '16em'}" v-on:mousedown="absorbClicks">
                                    <span class="auto-width type">{{editingTagTypeText}}&nbsp;&nbsp;&nbsp;<input             v-model="editingTagTypeText"       v-on:focus="focusEditingTagInput($event, 'type')"       v-on:input="inputEditingTagInput('type')"       v-on:keydown="keydownEditingTagInput($event, 'type')"/></span
                                ><span class="auto-width comparator">{{editingTagComparatorText}}&nbsp;&nbsp;&nbsp;<input v-model="editingTagComparatorText" v-on:focus="focusEditingTagInput($event, 'comparator')" v-on:input="inputEditingTagInput('comparator')" v-on:keydown="keydownEditingTagInput($event, 'comparator')"/></span
                                ><span class="auto-width value">{{tag.value}}&nbsp;&nbsp;&nbsp;<input                     v-model="editingTagValueText"      v-on:focus="focusEditingTagInput($event, 'value')"      v-on:input="inputEditingTagInput('value')"      v-on:keydown="keydownEditingTagInput($event, 'value')"/></span>
                                <div class="hintbox" v-if="editingTagLoadingSuggestions || editingTagSuggestions.length" v-bind:style="{left: hintboxOffset}" v-on:click="absorbClicks">
                                    <div class="loading" v-if="editingTagLoadingSuggestions"></div>
                                    <div class="suggest-text" v-for="(suggestion, suggestionIndex) in editingTagSuggestions" v-bind:class="{'selected': suggestionIndex == editingTagSuggestionsSelected}" v-on:click="clickedSuggestion(suggestion)" v-on:mouseover="mouseOverSuggestion">
                                        <div class="image thumbnail" v-if="suggestion.thumbnail" v-bind:style="{'background-image': 'url(' + suggestion.thumbnail + ')'}"></div>
                                        <div class="image avatar" v-if="suggestion.avatar" v-bind:style="{'background-image': 'url(' + suggestion.avatar + ')'}"></div>
                                        <span v-html="suggestion.html"></span>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="tag" v-bind:class="tag.getDisplayMode()" v-on:click="clickedTagSoEditIt($event, null, tagIndex, 'value')" v-on:mousedown="absorbClicks">
                                <template v-if="tag.isError()">
                                    Error: {{tag.getErrorMsg()}}
                                </template><template v-else-if="tag.isSearchGroup()">
                                    <i v-on:click="clickedTagSoEditIt($event, null, tagIndex, 'type')">{{tag.getPrettyType()}}</i><span class="comparator" v-on:click="clickedTagSoEditIt($event, null, tagIndex, 'comparator')">{{tag.getPrettyComparator()}}</span>{{tag.value}}
                                </template><template v-else>
                                    {{tag.value}}
                                </template><span class="x" v-on:click="clickedRemoveTag($event, null, tagIndex)" title="Remove Tag"></span>
                            </div>
                        </template><div class="preview-other-tags-text" v-if="!usingEditor && previewOtherTagsText()">{{previewOtherTagsText()}}</div><div class="add-new-tag" v-on:click="clickedAddNewTag" v-on:mousedown="absorbClicks" title="Add new tag">+ Add new tag</div>
                    </template>
                </div>
            </div>
        `,
        props: {
            value: {
                type: String,
                required: true
            },
            name: {
                type: Object,
                required: true
            },
            advancedEditMode: {
                type: Boolean,
                required: true
            }
        },
        data(){
            return {
                parsedTagList: {
                    error: this.value.error,
                    groupedTags: this.value.groupedTags.map(a => a.map((t) => t.clone())),
                    tags: this.value.tags.map((t) => t.clone())
                },
    
                usingEditor: false,
    
                editingGroupedTag: -1,// What group is currently being edited
                editingTag: -1,// What is the index of the tag being edited
                editingTagWidth: null,
    
                fetchSuggestionsTimeout: null,
    
                editingTagLoadingSuggestions: false,
                editingTagSuggestions: [],
                editingTagSuggestionsSelected: -1,
                editingTagOriginalTag: null,
    
                editingTagTypeText: '',
                editingTagComparatorText: '',
                editingTagValueText: '',
    
                hintboxOffset: 0
            };
        },
        watch: {
            value(val){
                this.parsedTagList.error = val.error;
                this.parsedTagList.groupedTags = val.groupedTags.map(a => a.map((t) => t.clone()));
                this.parsedTagList.tags = val.tags.map((t) => t.clone());
                this.alertIfParseError();
            }
        },
        mounted(){
            this.alertIfParseError();// ParsedTagList.error

            $body.addEventListener('mousedown', () => this.doneEditingTagEditor());

            tagListEditors = tagListEditors.filter((e) => e);// Remove null from array
            tagListEditors.push(this);
        },
        methods: {
            getGroupedTags(){
                return this.usingEditor ? this.parsedTagList.groupedTags : this.parsedTagList.groupedTags.slice(0, maxGroupedTagsToPreview);
            },
            getTags(){
                return this.usingEditor ? this.parsedTagList.tags : this.parsedTagList.tags.slice(0, maxTagsToPreview);
            },
            previewOtherTagsText(){
                let others = Math.max(this.parsedTagList.groupedTags.length - maxGroupedTagsToPreview, 0) + Math.max(this.parsedTagList.tags.length - maxTagsToPreview, 0);
                return others == 0 ? '' : (others == 1 ? '+ 1 other tag' : `+ ${others} other tags`);
            },

            alertIfParseError(){
                if(this.parsedTagList.error){
                    mainVue.promptUser(
                        'Taglist Parsing Error',
                        `The taglist of filter '${this.name}' could not be parsed. Its taglist is now empty. <br/>${this.parsedTagList.error}`,
                        ['Ok']
                    );

                    // Fix filter
                    this.$emit('input', {error: '', groupedTags: [], tags: []});
                }
            },


            // Helper functions
            loadUpSuggestionIntoEditingTag(suggestion){
                // Update the tag we are editing's components
                let tag = groupIndexValid(this.editingGroupedTag) ? this.parsedTagList.groupedTags[this.editingGroupedTag][this.editingTag] : this.parsedTagList.tags[this.editingTag];
                
                if(suggestion.type)
                    this.editingTagTypeText = tag.type = suggestion.type;
                else if(this.editingTagOriginalTag)
                    this.editingTagTypeText = tag.type = this.editingTagOriginalTag.type;
    
                if(suggestion.comparator)
                    this.editingTagComparatorText = tag.comparator = suggestion.comparator;
                else if(this.editingTagOriginalTag)
                    this.editingTagComparatorText = tag.comparator = this.editingTagOriginalTag.comparator;
    
                if(suggestion.value)
                    this.editingTagValueText = tag.value = suggestion.value;
                else if(this.editingTagOriginalTag)
                    this.editingTagValueText = tag.value = this.editingTagOriginalTag.value;
            },
            editingNextTagComponentFrom(component){
                // Clear suggestions
                this.editingTagSuggestions = [];
                this.editingTagSuggestionsSelected = -1;

                // Move to the next one or exit if we are done editing the 'value' component
                if(component == 'type')
                    this.editingTagComponent('comparator');
                else if(component == 'comparator')
                    this.editingTagComponent('value');
                else
                    this.doneEditingTag();
            },
            editingPreviousTagComponentFrom(component){
                // Move to the next one or exit if we are done editing the 'value' component
                if(component == 'comparator'){
                    this.editingTagSuggestions = [];// Clear suggestions
                    this.editingTagSuggestionsSelected = -1;
                    this.editingTagComponent('type');
                }else if(component == 'value'){
                    this.editingTagSuggestions = [];// Clear suggestions
                    this.editingTagSuggestionsSelected = -1;
                    this.editingTagComponent('comparator');
                }
            },
            recalculateHintboxOffest(){
                if(document.activeElement){
                    let editingTagX = this.$el.querySelector('.tag.editing').getBoundingClientRect().left,
                        inputX = document.activeElement.getBoundingClientRect().left,
                        inputPaddingLeft = parseInt(window.getComputedStyle(document.activeElement).getPropertyValue('padding-left'));
                    this.hintboxOffset = inputX - editingTagX - 4 + inputPaddingLeft;
                }
            },
            
            // Parsing
            sortParseList(){
                // Sort groupedTags (aka tags within groups)
                this.parsedTagList.groupedTags = this.parsedTagList.groupedTags.filter(g => g.length > 0);// Remove empty groups
                for(let i in this.parsedTagList.groupedTags){
                    this.parsedTagList.groupedTags[i] = this.parsedTagList.groupedTags[i].filter(t => !t.isEmpty());// Remove empty tags
                    this.parsedTagList.groupedTags[i].sort((a, b) => {
                        let pa = a.isError() ? -1 : Tag.groupedSortOrder.indexOf(a.type + a.comparator),
                            pb = b.isError() ? -1 : Tag.groupedSortOrder.indexOf(b.type + b.comparator);
                        
                        if(pa == pb)
                            return Tag.sortCollater.compare(a.value, b.value);
                        return pa - pb;
                    });
                }
    
                // Sort groups
                this.parsedTagList.groupedTags.sort((a, b) => {
                    // Go through every pair of tags in each group with the same index until a tag is found with greater precedence than the other
                    for(let i = 0;i < Math.min(a.length, b.length);i++){
                        // Equal tags will have equal precedence, so skip
                        if(!a[i].equals(b[i])){
                            let pa = a[i].isError() ? -1 : Tag.groupedSortOrder.indexOf(a[i].type + a[i].comparator),
                                pb = b[i].isError() ? -1 : Tag.groupedSortOrder.indexOf(b[i].type + b[i].comparator);

                            if(pa == pb)
                                return Tag.sortCollater.compare(a[i].value, b[i].value);
                            return pa - pb;
                        }
                    }
                    // If possible pairs of same index in both arrays are the same, then the groupedTag with the shortes length boes before
                    return a.length - b.length;
                });

    
                // Sort tags
                this.parsedTagList.tags = this.parsedTagList.tags.filter(t => !t.isEmpty());// Remove empty tags
                this.parsedTagList.tags.sort(function(a, b){
                    let pa = a.isError() ? -1 : Tag.sortOrder.indexOf(a.type + a.comparator),
                        pb = b.isError() ? -1 : Tag.sortOrder.indexOf(b.type + b.comparator);
                    
                    if(pa == pb)
                        return Tag.sortCollater.compare(a.value, b.value);
                    return pa - pb;
                });
            },
    
            // Events
            absorbClicks($event){
                $event.stopPropagation();
            },
            clickedTagEditor($event){
                // Stop event propagation because otherwise the click would cause the editor to be defocused
                $event.stopPropagation();
                $event.preventDefault();

                if(!this.usingEditor){
                    // Stop editing all other tag editors
                    for(let e of tagListEditors)
                        e.doneEditingTagEditor();
        
                    // Just in case a tag was being edited
                    this.doneEditingTag();
        
                    // Editing this editor now
                    this.usingEditor = true;
                }
            },
            clickedRemoveTag($event, groupIndex, tagIndex){
                // Prevent event propagation because otherwise the tag would be edited
                $event.stopPropagation();
    
                // Just in case a tag was being edited
                this.doneEditingTag();
    
                // Remove tag
                if(groupIndexValid(groupIndex)){
                    this.parsedTagList.groupedTags[groupIndex].splice(tagIndex, 1);
                    if(this.parsedTagList.groupedTags[groupIndex].length == 0)// Remove group if its now empty
                        this.parsedTagList.groupedTags.splice(groupIndex, 1);
                    else
                        this.parsedTagList.groupedTags.splice(this.parsedTagList.groupedTags.length);// Vue won't update display unless it detects a change to the array
                    // Removing a tag in a group can change the whole groupedtag's sort position
                    this.sortParseList();
                }else{
                    this.parsedTagList.tags.splice(tagIndex, 1);
                }
            },
            clickedAddNewTag(){
                // Just in case user was editing a tag before
                this.doneEditingTag();
    
                // Add new empty tag
                this.parsedTagList.tags.push(new Tag());
    
                // Edit that tag
                this.editingTagComponent(
                    'type',
                    null,
                    this.parsedTagList.tags.length - 1
                );
            },
            clickedAddNewGroup(){
                // Just in case user was editing a tag before
                this.doneEditingTag();
    
                // Add new empty tag
                this.parsedTagList.groupedTags.push([new Tag()]);
    
                // Edit that tag
                this.editingTagComponent(
                    'type',
                    this.parsedTagList.groupedTags.length - 1,
                    0
                );
            },
            clickedAddNewTagInGroup(groupIndex){
                // Just in case user was editing a tag before
                this.doneEditingTag();
    
                // Add new empty tag
                this.parsedTagList.groupedTags[groupIndex].push(new Tag());
    
                // Edit that tag
                this.editingTagComponent(
                    'type',
                    groupIndex,
                    this.parsedTagList.groupedTags[groupIndex].length - 1
                );
            },
            clickedTagSoEditIt($event, groupIndex, tagIndex, component = 'value'){
                $event.stopPropagation();
    
                this.editingTagComponent(
                    component,
                    groupIndex,
                    tagIndex,
                    window.getComputedStyle($event.currentTarget).width
                );
            },
    
            focusEditingTagInput($event, component){
                // Highlight entire text
                $event.currentTarget.select();
    
                // Recalculate hintboxOffset
                this.recalculateHintboxOffest()
                this.$nextTick(() => this.recalculateHintboxOffest());
    
                // Update suggestions
                this.inputEditingTagInput(component);
            },
            inputEditingTagInput(component){
                // Immediately update the tag we are editing's components
                let isGroup = groupIndexValid(this.editingGroupedTag),
                    tag = isGroup ? this.parsedTagList.groupedTags[this.editingGroupedTag][this.editingTag] : this.parsedTagList.tags[this.editingTag];
                tag.type = this.editingTagTypeText;
                tag.comparator = this.editingTagComparatorText;
                tag.value = this.editingTagValueText;
    
                // Save tag before arrow keys were used to select a suggestion
                this.editingTagOriginalTag = {type: this.editingTagTypeText, comparator: this.editingTagComparatorText, value: this.editingTagValueText};
    
                // Load up suggestions
                this.stopSearchingSuggestions();
                if(component == 'type'){
                    this.editingTagSuggestions =
                        (isGroup ? Tag.validGroupedTagTypes : Tag.validTagTypes)
                        .map(v => ({
                            component: 'type',
                            html: Tag.prettyTypes[v].replace(this.editingTagTypeText, (m) => '<b>' + m + '</b>'),
                            type: Tag.prettyTypes[v],
                            comparator: v == 'vi' ? 'Equals' : undefined
                        }));
                }else if(component == 'comparator'){
                    this.editingTagSuggestions = 
                        Object.keys(Tag.prettyComparators)
                        .filter(v => !Tag.invalidTypeComparatorCombinations.includes(tag.type + v))
                        .map(v => ({
                            component: 'comparator',
                            html: Tag.prettyComparators[v].replace(this.editingTagComparatorText, (m) => '<b>' + m + '</b>'),
                            comparator: Tag.prettyComparators[v]
                        }));
                }else if(component == 'value'){
                    if(tag.type == 'ch' && (tag.comparator == '=' || tag.comparator == '!')){
                        this.searchSuggestions(this.editingTagValueText, 'channel', (item, originalQuery) => ({
                            component: 'value',
                            thumbnail: item.snippet.thumbnails.default.url,
                            html: item.snippet.title
                                                .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                                                .replace(/\s+/, ' ')
                                                .replace(new RegExp(originalQuery.replace(/\s+/, ' '), 'ig'), (m) => '<b>' + m + '</b>'),
                            value: item.snippet.title
                        }));
                    }else if(tag.type == 'vi'){
                        this.searchSuggestions(this.editingTagValueText, 'video', (item, originalQuery) => ({
                            component: 'value',
                            avatar: item.snippet.thumbnails.default.url,
                            html: item.snippet.title
                                                .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                                                .replace(/\s+/, ' ')
                                                .replace(new RegExp(originalQuery.replace(/\s+/, ' '), 'ig'), (m) => '<b>' + m + '</b>'),
                            value: item.id.videoId
                        }));
                    }else{
                        this.editingTagSuggestions = [];
                    }
                }
            },
            keydownEditingTagInput($event, component){
                switch($event.key){
                    case 'Tab':
                    case 'Enter': // Confirm selected tag
                        $event.preventDefault();
    
                        // For both the type and the comparator forcefully pick the first suggestion if none is selected
                        if(this.editingTagSuggestionsSelected == -1 && this.editingTagSuggestions.length && (component == 'type' || component == 'comparator'))
                            this.loadUpSuggestionIntoEditingTag(this.editingTagSuggestions[0]);
    
                        // If a suggestion is selected, load that up
                        if(this.editingTagSuggestionsSelected != -1 && this.editingTagSuggestions.length)
                            this.loadUpSuggestionIntoEditingTag(this.editingTagSuggestions[this.editingTagSuggestionsSelected]);
                        
                        // Move to next component input
                        this.editingNextTagComponentFrom(component);
                        break;
                    case 'ArrowLeft':// Move to next thing if cursor is at endf of input
                        if($event.currentTarget.selectionStart == 0 && $event.currentTarget.selectionEnd == 0){
                            $event.preventDefault();
                            this.editingPreviousTagComponentFrom(component);
                        }
                        break;
                    case 'ArrowRight':// Move to previous thing if cursor is at start of input
                        if(component != 'value' && $event.currentTarget.selectionStart == $event.currentTarget.value.length && $event.currentTarget.selectionEnd == $event.currentTarget.value.length){
                            $event.preventDefault();    
                            this.editingNextTagComponentFrom(component);
                        }
                        break;
                    case 'ArrowUp':// Select next suggestion
                        $event.preventDefault();
                        if(this.editingTagSuggestions.length){
                            if(this.editingTagSuggestionsSelected == -1){
                                this.editingTagSuggestionsSelected = this.editingTagSuggestions.length - 1;
                            }else{
                                this.editingTagSuggestionsSelected--;
                            }
    
                            if(this.editingTagSuggestionsSelected == -1)
                                this.loadUpSuggestionIntoEditingTag(this.editingTagOriginalTag);// Load up original tag since no suggestion is selected
                            else
                                this.loadUpSuggestionIntoEditingTag(this.editingTagSuggestions[this.editingTagSuggestionsSelected]);
                        }
                        break;    
                    case 'ArrowDown':// Select next suggestion
                        $event.preventDefault();
                        if(this.editingTagSuggestions.length){
                            if(this.editingTagSuggestionsSelected == this.editingTagSuggestions.length - 1){
                                this.editingTagSuggestionsSelected = -1;
                                this.loadUpSuggestionIntoEditingTag(this.editingTagOriginalTag);// Load up original tag since no suggestion is selected
                            }else{
                                this.editingTagSuggestionsSelected++;
                                this.loadUpSuggestionIntoEditingTag(this.editingTagSuggestions[this.editingTagSuggestionsSelected]);
                            }
                        }
                        break;
                }
            },
            clickedSuggestion(suggestion){
                // Update the tag we are editing's components
                this.loadUpSuggestionIntoEditingTag(suggestion);
                
                // Move to next input
                this.editingNextTagComponentFrom(suggestion.component);
            },
            mouseOverSuggestion(){
                this.editingTagSuggestionsSelected = -1;
                if(this.editingTagOriginalTag)
                    this.loadUpSuggestionIntoEditingTag(this.editingTagOriginalTag);
            },
    
            // Tag editing related functions
            editingTagComponent(component, groupIndex, tagIndex, editingTagWidth){
                let inputIndex = ['type', 'comparator', 'value'].indexOf(component);
    
                if(inputIndex == -1)
                    inputIndex = 2;
    
                if(arguments.length == 1 || (this.editingGroupedTag == (groupIndexValid(groupIndex) ? groupIndex : -1) && this.editingTag == tagIndex)){
                    // Focus the editing tag input
                    this.$el.querySelectorAll('.tag.editing input')[inputIndex].focus();
                }else{
                    // Just in case user was editing a tag before
                    this.doneEditingTag();
    
                    // Set editing index to that tag
                    this.editingGroupedTag = groupIndexValid(groupIndex) ? groupIndex : -1;
                    this.editingTag = tagIndex;
                    this.editingTagWidth = editingTagWidth || undefined;
    
                    // Load the text from the tags into the variables used as v-models for the inputs
                    let tag = groupIndexValid(groupIndex) ? this.parsedTagList.groupedTags[groupIndex][tagIndex] : this.parsedTagList.tags[tagIndex];
                    this.editingTagTypeText = tag.getPrettyType();
                    this.editingTagComparatorText = tag.getPrettyComparator();
                    this.editingTagValueText = tag.value;
    
                    // Focus the editing tag input
                    this.$nextTick(function(){
                        this.$el.querySelectorAll('.tag.editing input')[inputIndex].focus();
                    });
                }
            },
            doneEditingTag(){
                if(this.editingTag != -1){
                    let arrayTagIsFrom = groupIndexValid(this.editingGroupedTag) ? this.parsedTagList.groupedTags[this.editingGroupedTag] : this.parsedTagList.tags,
                        wasEditingTag = arrayTagIsFrom[this.editingTag];

                    // Remove potential duplicate tags
                    for(let i = arrayTagIsFrom.length; i-- > 0;)
                        if(arrayTagIsFrom[i] != wasEditingTag && arrayTagIsFrom[i].equals(wasEditingTag))
                            arrayTagIsFrom.splice(i, 1);

                    // Sort parse list
                    this.sortParseList();
    
                    // Blink newly created tag
                    this.$nextTick(function(){
                        let tagIndex = 0,
                            $el;
    
                        for(let group of this.parsedTagList.groupedTags){
                            if(group.includes(wasEditingTag)){
                                $el = this.$el.querySelectorAll('.tag:not(.group)')[tagIndex + group.indexOf(wasEditingTag)];
                                $el.classList.add('notice-me');
                                setTimeout(() => $el && $el.classList.remove('notice-me'), 350 * 5);
                                return;
                            }else{
                                tagIndex += group.length;
                            }
                        }
    
                        if(this.parsedTagList.tags.includes(wasEditingTag)){
                            $el = this.$el.querySelectorAll('.tag:not(.group)')[tagIndex + this.parsedTagList.tags.indexOf(wasEditingTag)];
                            $el.classList.add('notice-me');
                            setTimeout(() => $el && $el.classList.remove('notice-me'), 350 * 5);
                        }
                    });
    
                    // Not editing tag anymore
                    this.editingGroupedTag = -1;
                    this.editingTag = -1;
                    this.editingTagWidth = null;
                    this.editingTagOriginalTag = null;
                    this.editingTagSuggestions = [];
                    this.editingTagSuggestionsSelected = -1;
                }
            },
            doneEditingTagEditor(){
                if(this.usingEditor){
                    this.usingEditor = false;
    
                    // Not editing anything anymore
                    this.doneEditingTag();

                    // If a group contains only one tag, move it into the tags list
                    for(let i = this.parsedTagList.groupedTags.length; i-- > 0;){
                        if(this.parsedTagList.groupedTags[i].length == 1){
                            let movingTag = this.parsedTagList.groupedTags.splice(i, 1)[0][0];

                            // Since we moved the tag to a place where it might have a duplicate, remove any potential duplicate tags
                            for(let i = this.parsedTagList.tags.length; i-- > 0;)
                                if(this.parsedTagList.tags[i].equals(movingTag))
                                    this.parsedTagList.tags.splice(i, 1);

                            this.parsedTagList.tags.push(movingTag);
                        }
                    }
                    
                    // Only output new taglist if there are no errors
                    if(!this.parsedTagList.error){
                        // Sort one more time just in case
                        this.sortParseList();
        
                        // Emit changes to parsedTagList
                        // This.$emit('input', this.parsedTagList);
                        this.$emit('input', {
                            error: this.parsedTagList.error,
                            groupedTags: this.parsedTagList.groupedTags.map(a => a.map(t => t.clone())),
                            tags: this.parsedTagList.tags.map(t => t.clone())
                        });
                    }
                }
            },
    
            stopSearchingSuggestions(){
                if(this.fetchSuggestionsTimeout){
                    clearTimeout(this.fetchSuggestionsTimeout);
                    this.fetchSuggestionsTimeout = null;
                }
            },
            searchSuggestions(query, type, suggestionGeneratorFunction){
                // Clear out old suggestions and clear the timeout until the search
                this.editingTagSuggestions = [];
                this.editingTagLoadingSuggestions = false;
                this.stopSearchingSuggestions();
    
                // If there is actually something to search then continue
                if(query){
                    // Show the loading indicator
                    this.editingTagLoadingSuggestions = true;
                    this.fetchSuggestionsTimeout = setTimeout(() => {
                        // Fetch data
                        fetch(`https://www.googleapis.com/youtube/v3/search?key=${taglistEditorApiKey}&type=${type}&q=${encodeURIComponent(this.editingTagValueText)}&part=snippet&fields=items(id,snippet(title,thumbnails(default)))&maxResults=6`)
                            .then((response) => response.json())
                            .catch(() => undefined)
                            .then((json) => {
                                this.editingTagSuggestions = [];
                                this.editingTagLoadingSuggestions = false;
                                // If timeout was never cleared
                                if(json && json.items && this.fetchSuggestionsTimeout){
                                    for(let item of json.items){
                                        let add = suggestionGeneratorFunction(item, query);
                                        if(add)
                                            this.editingTagSuggestions.push(add);
                                    }
                                }
                            });
                    }, 600);
                }
            }
        }
    });
}


// Gif Player
Vue.component('gif-player', {
    template: `
        <div class="gif-player" :class="{'loading-gif': !loadedGif}" @mouseover="mouseover" @mouseleave="mouseleave">
            <div class="text">
                <span>&rtrif;<span>
            </div>
            <img :src="hover && loadedGif ? gif : preview">
        </div>`,
    props: {
        preview: {
            type: String,
            required: true
        },
        gif: {
            type: String,
            required: true
        }
    },
    data(){
        return {
            hover: false,
            triedToLoadGif: false,
            loadedGif: false
        };
    },
    mounted(){
        // Player should stay consistent height determined by preview image
        let img = new Image();
        img.onload = () => this.$el.style.height = img.height + 'px';
        img.onerror = () => this.$el.style.display = 'none';
        img.src = this.preview;
    },
    methods: {
        mouseover(){
            this.hover = true;

            // Only show gif when it is fully loaded
            if(!this.triedToLoadGif){
                this.triedToLoadGif = true;
                let img = new Image();
                img.onload = () => this.loadedGif = true;
                img.src = this.gif;
            }
        },
        mouseleave(){
            this.hover = false;
        }
    }
});



// Load up vue
chrome.storage.local.get(['options', 'stats', 'filterCache'], res => {
    window.mainVue = new Vue({
        el: '#menu',
        data: {
            options: res.options,
            openMenu: 0,
            
            // Autocorrection settings page
            wordReplace: [],

            // Stats page
            processedStats: {},
            enableStatsTemp: true,
            faveChannelsTableShowMore: false,
            indexHoverGlobalStats: -1,
            faveChannelsViewMode: 0,
            faveChannelsSortMode: 0,
            favoriteChannelsPieRotations: 0,
            dailyStatsMonthOffset: 0,

            // Filter edit page
            overallFilterDescriptor: '',
            draggingFileOverCount: 0,
            filterDragging: {
                dragging: false,
                clientY: 0,
                offestY: 0,
                $placeholder: undefined,
                $dragging: undefined
            },
            justParsedFilters: false,
            parsedFilters: [],
            filterWarnings: [],

            // Updates page
            updates: [],

            // Donate page
            checkingProUnlock: false,

            // Misc
            promptShowing: false,
            promptTitle: '',
            promptText: '',
            promptButtons: [],
            promptOnComplete: undefined,
            promptAwaiting: []
        },
        mounted(){
            // Whenever options are changed, update options
            chrome.storage.onChanged.addListener(changes => {
                if(changes.options)
                    this.options = changes.options.newValue;
                if(changes.stats)
                    this.updateStats(changes.stats.newValue);
                if(changes.filterCache){
                    this.updateOverallFilterDescriptor(changes.filterCache.newValue);
                    this.parseFilters(this.options.filters);// Only-reparse filters when the filterCache changes
                }
            });

            // When hash chages open correct window
            this.updateOpenMenu(true);
            window.addEventListener('hashchange', () => this.updateOpenMenu(false));

            // Filter dragging
            $body.addEventListener('mousemove', (e) => {
                this.filterDragging.clientY = e.clientY;
                this.updateDraggingFilterPosition();
            });
            window.addEventListener('scroll', () => this.updateDraggingFilterPosition());
            $body.addEventListener('mouseup', () => this.doneDragging());
            window.addEventListener('focus', () => this.doneDragging());
            window.addEventListener('blur', () => this.doneDragging());
            window.addEventListener('visibilitychange', () => this.doneDragging());
            setInterval(() => {
                let d = this.filterDragging;
                if(d.dragging)
                    $scroll.scrollTop += (Math.max(0, d.clientY - window.innerHeight * 0.85) - Math.max(0, window.innerHeight * 0.15 - d.clientY)) / 6;
            }, 16.6);

            // Stats page
            this.enableStatsTemp = this.options.enableStats;

            // Load word replacement dictionary
            this.wordReplace = this.options.censoredTitle.wordReplace.map(o => ({w: o[0], r: o[1]}));
            this.wordReplace.push({w: '', r: ''});

            // Generate update notes
            for(let updateNote of updateNotes){
                let version = updateNote.version.trim();
                if(version && (updateNote.bugsFixed || (updateNote.updates && updateNote.updates.length))){
                    this.updates.unshift({
                        version,
                        bugsFixed: updateNote.bugsFixed || 0,
                        thanks: (updateNote.thanks || '').split(/\s*\|\s*/g).sort().join(', ').replace(/,\s(?=[^,]+$)/, ' and ').trim(),
                        changes: updateNote.updates.map(u => u.split(/\s*\|\s*/g))
                    });
                }
            }

            // Share page
            setInterval(() => {
                // All values expire to either be unlocked or locked again after some time
                for(let [key, expiresTo] of [['leftFacebookPost', 0], ['leftTweet', 0], ['leftLinkedinPost', 0], ['leftChromeStoreReview', 1]]){
                    if(this.options.promo[key] > 1 && this.options.promo[key] < Date.now()){
                        this.options.promo[key] = expiresTo;
                        this.saveData();
                    }
                }
            }, 500)

            // Misc
            this.updateStats(res.stats);
            this.updateOverallFilterDescriptor(res.filterCache);
            this.parseFilters(res.options.filters);

            // Close on install notification if it is open
            if(!this.options.promo.lastUpdateShowedNotification){
                this.options.promo.lastUpdateShowedNotification = updateNotes[updateNotes.length - 1].version;
                this.options.promo.triggerShowUpdate = false;
                this.saveData();
            }
        },
        watch: {
            // Whenever a tag editor changes the parsedFilters list, make sure to stringify them back to tagLists and saveData()
            parsedFilters: {
                deep: true,
                handler(parsedFilters){
                    if(!this.justParsedFilters){
                        let changed = false;
                        for(let i = parsedFilters.length;i-- > 0;){
                            let newTagList = Tag.stringifyList(parsedFilters[i].groupedTags, parsedFilters[i].tags);
                            if(this.options.filters[i].tagList != newTagList){
                                changed = true;
                                this.options.filters[i].tagList = newTagList;
                            }
                        }
                        if(changed)
                            this.saveData();
                        this.updateFilterWarnings();
                    }
                    this.justParsedFilters = false;
                }
            }
        },
        directives: {
            drawDailyStatsCanvas($canvas){
                let maxDate = new Date(new Date().toDateString() + ' 12:00'),
                    minDate;

                maxDate.setMonth(maxDate.getMonth() + mainVue.dailyStatsMonthOffset);
                minDate = new Date(maxDate - 31 * 24 * 36e5);

                if($canvas.chartjs){
                    $canvas.chartjs.options.scales.xAxes[0].time.min = minDate;
                    $canvas.chartjs.options.scales.xAxes[0].time.max = maxDate;
                    $canvas.chartjs.options.scales.yAxes[1].ticks.max = mainVue.processedStats.dailyStatsMaxViews;
                    $canvas.chartjs.data.datasets[0].data = mainVue.processedStats.dailyStatsTimeData;
                    $canvas.chartjs.data.datasets[1].data = mainVue.processedStats.dailyStatsViewData;
                    $canvas.chartjs.update();
                }else{
                    const fontFamily = '"Nunito Sans", sans-serif';
                    $canvas.chartjs = new Chart($canvas.getContext('2d'), {
                        type: 'bar',
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            legend: {
                                labels: {
                                    fontFamily,
                                    fontSize: 16
                                }
                            },
                            scales: {
                                xAxes: [{
                                    type: 'time',
                                    time: {
                                        parser: 'MM/DD/YYYY',
                                        unit: 'week',
                                        tooltipFormat: 'll',
                                        // So chart.js doesn't clip out the leftmost and rightmost bars, add 12 hours of padding to each side
                                        min: minDate,
                                        max: maxDate
                                    },
                                    gridLines: {
                                        drawBorder: false,
                                        drawTicks: false,
                                        drawOnChartArea: false
                                    },
                                    ticks: {
                                        padding: 4,
                                        fontFamily
                                    },
                                    barPercentage: 1.0
                                }],
                                yAxes: [{
                                    id: 't',
                                    type: 'linear',
                                    position: 'left',
                                    gridLines: {
                                        drawBorder: false,
                                        drawTicks: false
                                    },
                                    ticks: {
                                        min: 0,
                                        padding: 10,
                                        fontFamily,
                                        userCallback(minutes){
                                            let hour = Math.floor(minutes / 60);
                                            minutes = minutes % 60;
                                            return `${hour < 10 ? '0' + hour : hour}:${minutes < 10 ? '0' + minutes : minutes}`;
                                        }
                                    }
                                },{
                                    id: 'w',
                                    type: 'linear',
                                    position: 'right',
                                    gridLines: {
                                        drawBorder: false,
                                        drawTicks: false,
                                        drawOnChartArea: false
                                    },
                                    ticks: {
                                        min: 0,
                                        max: mainVue.processedStats.dailyStatsMaxViews,
                                        stepSize: 1,
                                        padding: 10,
                                        fontFamily
                                    }
                                }]
                            },
                            tooltips: {
                                callbacks: {
                                    label({datasetIndex, yLabel}){
                                        if(datasetIndex == 0)
                                            return `${prettyTime(yLabel)} of videos watched`;
                                        else
                                            return `${yLabel} video${yLabel == 1 ? '': 's'} watched`;
                                    }
                                }
                            }
                        },
                        data: {
                            datasets: [
                                {
                                    label: 'Time Watched',
                                    yAxisID: 't',
                                    backgroundColor: 'rgba(219, 67, 67, 0.8)',
                                    hoverBackgroundColor: 'rgba(231, 126, 126, 0.8)',
                                    borderWidth: 0,
                                    data: mainVue.processedStats.dailyStatsTimeData
                                },
                                {
                                    label: 'Videos Watched',
                                    yAxisID: 'w',
                                    backgroundColor: 'rgba(67, 94, 219, 0.8)',
                                    hoverBackgroundColor: 'rgba(126, 145, 231, 0.8)',
                                    borderWidth: 0,
                                    data: mainVue.processedStats.dailyStatsViewData
                                }
                            ]
                        }
                    });
                }
            },
            drawFaveChannelsPieChart($canvas){
                let rotation = ((2 * mainVue.favoriteChannelsPieRotations) - .5) * Math.PI;
                if($canvas.chartjs){
                    $canvas.chartjs.data.labels = mainVue.processedStats.faveChannelsPieLabels;
                    $canvas.chartjs.data.datasets[0].data = mainVue.processedStats.faveChannelsPieAmounts;
                    $canvas.chartjs.options.rotation = rotation;
                    $canvas.chartjs.update();
                }else{
                    $canvas.chartjs = new Chart($canvas.getContext('2d'), {
                        type: 'doughnut',
                        options: {
                            cutoutPercentage: 40,
                            rotation: rotation,
                            animation: {
                                animateRotate: true,
                                duration: 1400
                            },
                            responsive: false,
                            hover: {
                                onHover(event, [over]){
                                    if(over == undefined)
                                        mainVue.indexHoverGlobalStats = -1;
                                    else if(over._index == 10)
                                        mainVue.indexHoverGlobalStats = 'other';
                                    else
                                        mainVue.indexHoverGlobalStats =  over._index;
                                }
                            },
                            legend: {
                                display: false
                            },
                            pieceLabel: {
                                showActualPercentages: true,
                                fontColor: 'white',
                                fontSize: 16,
                                fontFamily: '"Nunito Sans", sans-serif'
                            },
                            tooltips: {
                                callbacks: {
                                    label({index}, data){
                                        let label = data.labels[index],
                                            value = data.datasets[0].data[index];
                                        if(label){
                                            if(mainVue.faveChannelsSortMode == 0)
                                                return `${label}: ${prettyTime(value)}`;
                                            else if(mainVue.faveChannelsSortMode == 1)
                                                return `${label}: ${plural(value, 'view')}`;
                                            else if(mainVue.faveChannelsSortMode == 2)
                                                return `${label}: ${plural(value, 'like')}`; 
                                            else if(mainVue.faveChannelsSortMode == 3)
                                                return `${label}: ${plural(value, 'dislike')}`;
                                        }else{
                                            return 'Nothing';
                                        }
                                    }
                                }
                            }
                        },
                        data: {
                            labels: mainVue.processedStats.faveChannelsPieLabels,
                            datasets: [{
                                // ['hsl(0, 68%, 56%)', 'hsl(32.72, 68%, 56%)', 'hsl(65.45, 68%, 56%)', 'hsl(98.18, 68%, 56%)', 'hsl(130.90, 68%, 56%)', 'hsl(163.63, 68%, 56%)', 'hsl(196.36, 68%, 56%)', 'hsl(229.09, 68%, 56%)', 'hsl(261.81, 68%, 56%)', 'hsl(294.54, 68%, 56%)', 'hsl(0, 0%, 56%)'],
                                // ['hsl(0, 68%, 70%)', 'hsl(32.72, 68%, 70%)', 'hsl(65.45, 68%, 70%)', 'hsl(98.18, 68%, 70%)', 'hsl(130.90, 68%, 70%)', 'hsl(163.63, 68%, 70%)', 'hsl(196.36, 68%, 70%)', 'hsl(229.09, 68%, 70%)', 'hsl(261.81, 68%, 70%)', 'hsl(294.54, 68%, 70%)', 'hsl(0, 0%, 70%)'],
                                backgroundColor: ['rgb(219,67,67)', 'rgb(219,150,67)', 'rgb(205,219,67)', 'rgb(122,219,67)', 'rgb(67,219,94)', 'rgb(67,219,177)', 'rgb(67,177,219)', 'rgb(67,94,219)', 'rgb(122,67,219)', 'rgb(205,67,219)', 'rgb(143,143,143)'],
                                hoverBackgroundColor: ['rgb(231,126,126)', 'rgb(231,183,126)', 'rgb(221,231,126)', 'rgb(164,231,126)', 'rgb(126,231,145)', 'rgb(126,231,202)', 'rgb(126,202,231)', 'rgb(126,145,231)', 'rgb(164,126,231)', 'rgb(221,126,231)', 'rgb(179,179,179)'],
                                data: mainVue.processedStats.faveChannelsPieAmounts
                            }]
                        }
                    });
                }
            }
        },
        methods: {
            // #region General functions
            saveData(){
                this.options.censoredTitle.wordReplace = this.wordReplace.filter(o => o.w.trim() && (!this.options.censoredTitle.wordReplaceUseRegex || isValidRegex(o.w))).map(o => [o.w, o.r]);
                chrome.storage.local.set({options: this.options});
            },
            updateOpenMenu(firstRun){
                let hash = location.hash.replace(/\s/g, '').toLowerCase();
                
                localStorage.setItem('openedOptionsPage', hash);
                $scroll.scrollTop = 0;

                this.doneDragging();

                this.$nextTick(function(){
                    this.$nextTick(function(){
                        let $marker = document.getElementById('marker'),
                            selectedRect = document.querySelector('#navigation a.selected').getBoundingClientRect(),
                            navigationRect = document.getElementById('navigation').getBoundingClientRect();
                        $marker.classList.add('moving');
                        $marker.style.top = ((selectedRect.top + selectedRect.bottom) / 2 - navigationRect.top) + 'px';
                        setTimeout(() => $marker.classList.remove('moving'), 300);
                    });
                });

                if(hash.startsWith('#filter-')){
                    this.openMenu = 5;
                    for(let $el of document.querySelectorAll('#filter-container .filter.highlight'))
                        $el.classList.remove('highlight');

                    this.$nextTick(function(){
                        setTimeout(function(){
                            let $highlight = document.getElementById(hash.substr(1));
                            if($highlight){
                                $highlight.classList.add('highlight');
                                $highlight.scrollIntoView();
                                $scroll.scrollTop -= 15;
                            }
                        }, firstRun ? 850 : 0);
                    });
                }else{
                    switch(hash) {
                        case '#help':
                            this.openMenu = 1;
                            gpageview('Getting Started');
                            return;
                        case '#quicksetup':
                            this.openMenu = 2;
                            gpageview('Quick Setup');
                            return;
                        case '#general':
                            this.openMenu = 3;
                            gpageview('General Settings');
                            return;
                        case '#stats':
                            this.openMenu = 4;
                            gpageview('Stats');
                            return;
                        case '#filters':
                            this.openMenu = 5;
                            gpageview('Filters');
                            return;
                        case '#curated':
                            this.openMenu = 6;
                            gpageview('Curated Filters');
                            return;
                        case '#autocorrect':
                            this.openMenu = 7;
                            gpageview('Autocorrect');
                            return;
                        case '#updates':
                            this.openMenu = 8;
                            gpageview('Updates');
                            return;
                        case '#unlock':
                            this.openMenu = 9;
                            gpageview('Unlock');
                            return;
                        case '#share':
                            this.openMenu = 10;
                            gpageview('Share');
                            return;
                        case '#donate':
                            this.openMenu = 11;
                            gpageview('Donate');
                            return;
                        default:
                            this.openMenu = 0;
                            gpageview('Home');
                            return;
                    }
                }
            },
            promptUser(prompt, text, buttons, onComplete){
                if(this.promptShowing){
                    // If a prompt is already running, query it to be run after the next filter is done
                    this.promptAwaiting.push([prompt, text, buttons, onComplete]);
                }else{
                    this.$nextTick(() => $body.classList.add('no-scroll'));
                    this.promptShowing = true;
                    this.promptTitle = prompt;
                    this.promptText = text;
                    this.promptOnComplete = !onComplete && typeof buttons == 'function' ? buttons : onComplete;
                    this.promptButtons = Array.isArray(buttons) ? buttons : ['Ok'];
                }
            },
            promptClickButton(buttonId){
                this.$nextTick(() => $body.classList.remove('no-scroll'));
                this.promptShowing = false;
                if(this.promptOnComplete && typeof this.promptOnComplete == 'function')
                    this.promptOnComplete(buttonId);
                if(this.promptAwaiting.length)
                    this.promptUser(...this.promptAwaiting.shift());
            },

            saveOptionChange(name, value){
                gevent(name, value);
                this.saveData();
            },
            gevent(action, value, label){
                gevent(action, value, label);
            },
            // #endregion

            // #region General settings
            viewPreviewText(fullView, prettyView, age){
                return (this.options.exactVideoViewCount ? fullView : prettyView) + (this.options.showVideoAge ? ' \u2022 ' + age : '');
            },
            // #endregion
            
            // #region Autocorrection settings menu
            wordReplaceUpdate(){
                let last = this.wordReplace[this.wordReplace.length - 1]
                if(last.w.trim() != '')
                    this.wordReplace.push({w: '', r: ''});
                this.saveData();
            },
            wordReplaceRemove(index){
                this.wordReplace.splice(index, 1);
                this.saveData();
            },
            exampleCorrectedTitle(){
                let opt = this.options.censoredTitle;
                return `Vlog #26: I'm ${
                    ['just having THE WORST possible day', 'Just Having the Worst Possible Day', 'just having the worst possible day'][opt.capitalization]}${
                    opt.removeRepeatingNonLetterChars ? '!' : '!!!!'}${
                    opt.removeEmoji ? '' : ' \uD83D\uDE16\uD83D\uDE31'}${
                    opt.removeHashtags ? '' : ' #hashtag'}${
                    opt.removeShortTextContainedWithinElipses ? '' : [' *MUST WATCH!*', ' *Must Watch!*', ' *Must watch!*'][opt.capitalization]}`;
            },
            // #endregion

            // #region Stats page
            updateStats(stats){
                if(this.options.enableStats){
                    const dateNow = Date.now();

                    // #region Count up total views, total watchtime, views for past several days
                    let totalViews = 0,
                        totalWatchTime = 0,
                        latestDaysViews = [0, 0, 0, 0, 0, 0, 0, 0],
                        latestDaysTime = [0, 0, 0, 0, 0, 0, 0, 0],
                        latestWeeksViews = [0, 0, 0, 0, 0, 0, 0, 0],
                        latestWeeksTime = [0, 0, 0, 0, 0, 0, 0, 0],
                        latestMonthsViews = [0, 0, 0, 0, 0, 0, 0, 0],
                        latestMonthsTime = [0, 0, 0, 0, 0, 0, 0, 0];
                    for(let stat of stats.dailyTotals){
                        // Add to latest days/weeks/months
                        let daysAgo = Math.floor((dateNow - new Date(stat.date)) / 864e5),
                            weeksAgo = Math.floor(daysAgo / 7),
                            monthsAgo = Math.floor(daysAgo / 30);
                        if(monthsAgo <= 7){
                            latestMonthsViews[monthsAgo] += stat.views;
                            latestMonthsTime[monthsAgo] += stat.time;
                            if(weeksAgo <= 7){
                                latestWeeksViews[weeksAgo] += stat.views;
                                latestWeeksTime[weeksAgo] += stat.time;
                                if(daysAgo <= 7){
                                    latestDaysViews[daysAgo] = stat.views;
                                    latestDaysTime[daysAgo] = stat.time;
                                }
                            }
                        }
                        // Count up totals
                        totalViews += stat.views;
                        totalWatchTime += stat.time;
                    }
                    // #endregion

                    // #region Pre-compute data for 'Daily Stats' bar chart
                    let dailyStatsMaxViews = Math.max(Math.ceil(Math.max.apply(Math, stats.dailyTotals.map(s => s.views)) * 1.5), 2),
                        dailyStatsTimeData = stats.dailyTotals.map(s => ({x: s.date, y: s.time})).reverse(),
                        dailyStatsViewData = stats.dailyTotals.map(s => ({x: s.date, y: s.views})).reverse();
                    // #endregion

                    // #region short summary stats on top
                    // Pre-calculate values
                    let daysSinceStartedStats = Math.ceil((dateNow - new Date(stats.startedCollectingOn)) / 864e5),
                        avgT = totalWatchTime / daysSinceStartedStats,
                        avgV = totalViews / daysSinceStartedStats;     

                    // Average
                    let dailyAvgTText = prettyTime(avgT),
                        dailyAvgVText = avgV.toFixed(2) + ' views',
                        weeklyAvgTText = prettyTime(avgT * 7),
                        weeklyAvgVText = (avgV * 7).toFixed(2) + ' views',
                        monthlyAvgTText = prettyTime(avgT * 30),
                        monthlyAvgVText = (avgV * 30).toFixed(2) + ' views',
                    // Standard deviation
                        dailyTStDevText = prettyTime(Math.sqrt(stats.dailyTotals.reduce((s, d) => s + (d.time - avgT) * (d.time - avgT), 0) / daysSinceStartedStats)),
                        dailyVStDevText = Math.sqrt(stats.dailyTotals.reduce((s, d) => s + (d.views - avgV) * (d.views - avgV), 0) / daysSinceStartedStats).toFixed(2) + ' views',
                    // Today/last week stats
                        todayTText = prettyTime(latestDaysTime[0]),
                        todayVText = plural(latestDaysViews[0], 'view'),
                        yesterdayTText = prettyTime(latestDaysTime[1]),
                        yesterdayVText = plural(latestDaysViews[1], 'view'),
                        thisWeekTText = prettyTime(latestWeeksTime[0]),
                        thisWeekVText = plural(latestWeeksViews[0], 'view'),
                        lastWeekTText = prettyTime(latestWeeksTime[1]),
                        lastWeekVText = plural(latestWeeksViews[1], 'view'),
                        thisMonthTText = prettyTime(latestMonthsTime[0]),
                        thisMonthVText = plural(latestMonthsViews[0], 'view'),
                        lastMonthTText = prettyTime(latestMonthsTime[1]),
                        lastMonthVText = plural(latestMonthsViews[1], 'view'),
                    // Today sub-texts
                        todayTPercentagesText = [
                            ...percentagesText(latestDaysTime[0], avgT, 'daily average'),
                            ...percentagesText(latestDaysTime[0], latestWeeksTime[0] / 7, 'this week\'s average'),
                            ...percentagesText(latestDaysTime[0], latestDaysTime[1], 'yesterday')
                        ],
                        todayVPercentagesText = [
                            ...percentagesText(latestDaysViews[0], avgV, 'daily average'),
                            ...percentagesText(latestDaysViews[0], latestWeeksViews[0] / 7, 'this week\'s average'),
                            ...percentagesText(latestDaysViews[0], latestDaysViews[1], 'yesterday')
                        ],
                        thisWeekTPercentagesText = [
                            ...percentagesText(latestWeeksTime[0], avgT * 7, 'weekly average'),
                            ...percentagesText(latestWeeksTime[0], latestWeeksTime[1], 'last week')
                        ],
                        thisWeekVPercentagesText = [
                            ...percentagesText(latestWeeksViews[0], avgV * 7, 'weekly average'),
                            ...percentagesText(latestWeeksViews[0], latestWeeksViews[1], 'last week')
                        ],
                        thisMonthTPercentagesText = {
                            ...percentagesText(latestMonthsTime[0], avgT * 30, 'monthly average'),
                            ...percentagesText(latestMonthsTime[0], latestMonthsTime[1], 'last month')
                        },
                        thisMonthVPercentagesText = {
                            ...percentagesText(latestMonthsViews[0], avgV * 30, 'monthly average'),
                            ...percentagesText(latestMonthsViews[0], latestMonthsViews[1], 'last month')
                        },
                    // Calculate plots
                        dailyTPlot = simpleStatsChart(latestDaysTime),
                        dailyVPlot = simpleStatsChart(latestDaysViews),
                        weeklyTPlot = simpleStatsChart(latestWeeksTime),
                        weeklyVPlot = simpleStatsChart(latestWeeksViews),
                        monthlyTPlot = simpleStatsChart(latestMonthsTime),
                        monthlyVPlot = simpleStatsChart(latestMonthsViews);



                    // #endregion

                    this.processedStats = {
                        globalStats: stats.globalStats,
                        pastMonthStats: stats.pastMonthStats,
                        channelNames: stats.channelNames,
                        startedCollectingOn: stats.startedCollectingOn,

                        totalViews,
                        totalWatchTime,

                        dailyStatsMaxViews,
                        dailyStatsTimeData,
                        dailyStatsViewData,

                        dailyAvgTText,
                        dailyTStDevText,
                        todayTText,
                        todayTPercentagesText,
                        yesterdayTText,
                        dailyTPlot,

                        dailyAvgVText,
                        dailyVStDevText,
                        todayVText,
                        todayVPercentagesText,
                        yesterdayVText,
                        dailyVPlot,

                        weeklyAvgTText,
                        thisWeekTText,
                        thisWeekTPercentagesText,
                        lastWeekTText,
                        weeklyTPlot,

                        weeklyAvgVText,
                        thisWeekVText,
                        thisWeekVPercentagesText,
                        lastWeekVText,
                        weeklyVPlot,

                        monthlyAvgTText,
                        thisMonthTText,
                        thisMonthTPercentagesText,
                        lastMonthTText,
                        monthlyTPlot,

                        monthlyAvgVText,
                        thisMonthVText,
                        thisMonthVPercentagesText,
                        lastMonthVText,
                        monthlyVPlot
                    };

                    this.updateFaveChannels();
                }
            },
            updateFaveChannels(changedViewOrSortMode){
                let channels = [],
                    sortBy = ['time', 'views', 'likes', 'dislikes'][this.faveChannelsSortMode];

                // Load list of channels
                if(this.faveChannelsViewMode == 0){
                    channels = this.processedStats.globalStats;
                }else{
                    let timeAgo = new Date(Date.now() - [2592e6, 6048e5, 864e5][this.faveChannelsViewMode - 1]);
                    for(let day of this.processedStats.pastMonthStats){
                        if(new Date(day.date) > timeAgo){
                            for(let stat of day.stats){
                                let add = channels.find((x) => x.id == stat.id);
                                if(!add){
                                    add = {
                                        id: stat.id,
                                        views: 0,
                                        time: 0,
                                        likes: 0,
                                        dislikes: 0
                                    };
                                    channels.push(add);
                                }
                                add.views += stat.views;
                                add.time += stat.time;
                                add.likes += stat.likes;
                                add.dislikes += stat.dislikes;
                            }
                        }
                    }
                }

                // Sort by respective value type, then by time
                channels.sort((a, b) => b[sortBy] != a[sortBy] ? b[sortBy] - a[sortBy] : b.time - a.time);

                // Set up labels and amounts for pie chart
                let labels = channels.slice(0, 10).map(s => this.processedStats.channelNames[s.id]),
                    amount = Array.from({length: 10}, (_, i) => channels[i] ? channels[i][sortBy] : 0);

                // If there are others, add their time up in a channel called other
                if(channels.length > 10){
                    let otherAmount = 0;
                    for(let stat of channels.slice(10))
                        otherAmount += stat[sortBy];
                    amount.push(otherAmount);
                    labels.push('Other');
                }
                // Fill up the pie chart with a grey color if there are no stats
                else if(amount[0] == 0)
                    amount.push(.4);
                else
                    amount.push(0);
                
                if(changedViewOrSortMode)
                    this.favoriteChannelsPieRotations++;
                this.processedStats.faveChannelsTable = channels;
                this.processedStats.faveChannelsTableLength = channels.length;
                this.processedStats.faveChannelsPieLabels = labels;
                this.processedStats.faveChannelsPieAmounts = amount;
            },

            updateEnableStats(){
                if(!this.enableStatsTemp){
                    this.promptUser(
                        'Disable and Delete Stats',
                        'Are you sure you\'d like to disable <b>and delete</b> your statistics? <b>You can\'t get these back!</b>',
                        ['Yes', 'Cancel'],
                        (clicked) => {
                            if(clicked == 0){
                                this.options.enableStats = false;
                                this.saveOptionChange('Stats Collection', false);
                                chrome.runtime.sendMessage({method: 'clear-stats'});
                            }else{
                                this.enableStatsTemp = true;
                            }
                        }
                    );
                }else{
                    chrome.runtime.sendMessage({method: 'clear-stats'}, newStats => {
                        this.options.enableStats = true;
                        this.updateStats(newStats);
                        this.saveOptionChange('Stats Collection', true);
                    });
                }
            },

            saveStatsAsCSV(){
                chrome.storage.local.get('stats', ({stats}) => {
                    // DailyTotals: Date, Watch Time, Videos Viewed
                    downloadTextFile(
                        'Date, Watch Time, Videos Viewed\n' + 
                            stats.dailyTotals.map(d => d.date + ', ' + d.time.toFixed(2) + ', ' + d.views).join('\n'),
                        'daily watched.csv'
                    );
                    // GlobalStats: Channel Name, Channel Id, Watch Time, Videos Viewed, Videos Liked, Videos Disliked
                    downloadTextFile(
                        'Channel Name, Channel Id, Watch Time, Videos Viewed, Videos Liked, Videos Disliked\n' + 
                            stats.globalStats.map(g => '"' + (stats.channelNames[g.id] || 'NA').trim().replace(/"/g, '""') + '", ' + g.id + ', ' + g.time.toFixed(2) + ', ' + g.views  + ', ' + g.likes + ', ' + g.dislikes).join('\n'),
                        'channels watched.csv'
                    );
                });
            },
            faveChannelSortClick(mode){
                if(this.faveChannelsSortMode != mode){
                    this.faveChannelsSortMode = mode;
                    this.updateFaveChannels(true);
                }
            },

            prettyTime,
            // #endregion

            // #region Donate page
            checkProEmail($event){
                $event.preventDefault()
                if(!this.checkingProUnlock){
                    this.checkingProUnlock = true;

                    this.gevent('Check Pro Email');
                    setTimeout(() => {
                        chrome.runtime.sendMessage({method: 'check-pro-email'}, success => {
                            if(success){
                                this.checkingProUnlock = false;
                                this.options.promo.proUnlocked = true;
                                this.promptUser(
                                    'Additional Features Unlocked \uD83D\uDE01',
                                    'The additional features were successfully unlocked. Thanks for the support!',
                                    ['Alright']
                                );
                            }else{
                                setTimeout(() => this.checkingProUnlock = false, 500);
                            }
                        });
                    }, 500);
                }
            },
            alreadyUnlockedButNoEmail($event){
                $event.preventDefault();
                this.gevent('Check Pro Email But no Email');
                this.promptUser(
                    'Log in to Chrome',
                    'If your email was already unlocked make sure you log in to chrome to unlock Youtube Refined\'s additional features.',// <a href="https://accounts.google.com/signin/chrome/sync" target="blank_">this link</a>
                    ['Login','Not Now'],
                    (clicked) => {
                        if(clicked == 0)
                            window.open('https://accounts.google.com/signin/chrome/sync', '_blank');
                    }
                );
            },
            // #endregion

            // #region Share page
            freeUnlockClass(name){
                return this.options.promo[name] == 0 ? '' : (this.options.promo[name] == 1 ? 'unlocked' : 'unlocking');
            },
            freeUnlockClickSendMessage(method){
                chrome.runtime.sendMessage({method});
            },
            storeReviewClickUnlock(){
                this.options.promo.leftChromeStoreReview = this.canFreeUnlock() ? 1 : Date.now() + 40 * 1000;
                this.saveData();
            },
            canFreeUnlock(){
                return ['leftChromeStoreReview', 'leftFacebookPost', 'leftTweet', 'leftLinkedinPost'].map(v => this.options.promo[v]).filter(v => v == 1 || (v > 1 && v < Date.now())).length >= 2;
            },
            freeUnlock(){
                this.options.promo.proUnlocked = true;
                this.options.promo.freeUnlock = true;
                this.saveData();
            },
            // #endregion

            // #region Filter edit
            filterDescriptorText(filterId){
                let isDefault = filterId == 0,
                    filter = this.options.filters[filterId],
                    parsedTagList = this.parsedFilters[filterId];
                
                if(!filter.enabled || !parsedTagList){
                    return 'This filter is disabled and so won\'t affect any video suggestions.';
                }else{
                    if(parsedTagList.error){
                        return 'This filter has an error and won\'t work';
                    }else{
                        let chGroupedTags = parsedTagList.groupedTags.filter((g) => g.some((t) => t.getDisplayMode() == 'ch')).length,
                            ch = parsedTagList.tags.filter((t) => t.getDisplayMode() == 'ch').length + chGroupedTags,
                            vi = parsedTagList.tags.filter((t) => t.getDisplayMode() == 'vi').length,
                            sg = parsedTagList.tags.filter((t) => t.isSearchGroup()).length + parsedTagList.groupedTags.length - chGroupedTags,
                            s = [];

                        if(ch > 0)
                            s.push(ch == 1 ? '1 channel' : ch + ' channels');
                        if(vi > 0)
                            s.push(vi == 1 ? '1 video' : vi + ' videos');
                        if(sg > 0)
                            s.push(sg == 1 ? '1 other' : sg + ' others');

                        if(s.length == 0)
                            return isDefault ? 'This filter affects anything that didn\'t match another filter.' : 'This filter affects nothing. Add some tags.';
                        else
                            return 'This filter affects ' + s.join(', ').replace(/,\s(?=[^,]+$)/, ' and ') + (isDefault ? ' and anything that didn\'t match another filter.' : '.');
                    }
                }
            },
            updateOverallFilterDescriptor(filterCache){
                // 8 filters affecting 245 channels, 6 videos, and 4 others.
                let filterCount = this.options.filters.filter((f) => f.enabled).length,
                    channelCount = Object.keys(filterCache.channels).length,
                    videoCount = Object.keys(filterCache.videoid).length,
                    otherCount = filterCache.searchgroups.length,
                    s = [];
                
                if(channelCount == 1)
                    s.push('1 channel');
                else if(channelCount > 1)
                    s.push(channelCount + ' channels');
                
                if(videoCount == 1)
                    s.push('1 video');
                else if(videoCount > 1)
                    s.push(videoCount + ' videos');
                
                if(otherCount == 1)
                    s.push('1 other');
                else if(otherCount > 1)
                    s.push(otherCount + ' others');
                
                this.overallFilterDescriptor = filterCount + ' filters affecting ' + (s.length == 0 ? 'nothing.' : s.join(', ').replace(/,\s(?=[^,]+$)/, ' and ') + '.');
            },
            parseFilters(filters){
                this.justParsedFilters = true;
                this.parsedFilters = filters.map((filter) => Tag.parseList(filter.tagList));
                this.updateFilterWarnings();
            },
            updateFilterWarnings(){
                let warn = [];
                for(let id = 0;id < this.parsedFilters.length;id++){
                    let {tags, groupedTags} = this.parsedFilters[id],
                        allTags = [].concat.apply([], groupedTags).concat(tags),
                        name = this.options.filters[id].name;

                    // Warning when a tag is error
                    warn.push(...
                        allTags.filter(t => t.isError())
                        // Convert all those tags to warnings
                        .map(t => ({
                            problematicTag: t.clone(), name, id,
                            text: 'is invalid'
                        }))
                    );

                    // Warning when group contains 2 or more ch= tags
                    if(groupedTags.some(g => g.filter(t => t.getDisplayMode() == 'ch').length > 1))
                        warn.push({
                            name, id,
                            text: 'contains a group with two or more tags that contradict each other'
                        });
                    
                    // Warning when using ! selector
                    warn.push(...
                        allTags.filter(t => !t.isError() && t.comparator == '!')
                        // Convert all those tags to warnings
                        .map(t => ({
                            problematicTag: t.clone(), name, id,
                            text: 'might inadvertedly select more videos than you intended'
                        }))
                    );
                    
                    // Warning when a filter contains duplicate grouped tag
                    if(groupedTags.some((g, ig) => 
                        groupedTags[ig + 1] && g.length == groupedTags[ig + 1].length &&
                        g.every((t, it) => t.equals(groupedTags[ig + 1][it])) // Group has every one of its tags equal to the next group's tags
                    ))
                        warn.push({
                            name, id,
                            text: 'contains 2 or more duplicate groups'
                        });
                    
                    // Not 
                    // Warning with empty regex - should not be added to filter cache
                    // Warning with empty contains - should not be added to filter cache
                    // Warning when using vi= in group
                }
                this.filterWarnings = warn;
            },

            filteredVideoPreviewTitle(filter){
                if(filter.titleAction == 0)
                    return 'Video Title';
                else if(filter.titleAction == 1)
                    return 'Autocorrected Video Title';
                else if(filter.titleAction == 2)
                    return filter.titleReplaceText.trim() && filter.titleReplaceText || 'Replace With';
                else
                    return '\u2013Title Removed\u2013';
            },
            filteredVideoPreviewChannelName(filter){
                if(filter.channelNameAction == 0)
                    return 'Channel Name';
                else if(filter.channelNameAction == 1)
                    return filter.channelNameReplaceText.trim() && filter.channelNameReplaceText || 'Replace With';
                else
                    return '\u2013Channel Name Removed\u2013';
            },

            addNewFilter(){
                const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890';
                this.options.filters.push({
                    name: 'Filter ' + (this.options.filters.length - 1),
                    desc: '',
                    tagList: '',
                    enabled: true,
                    hideAllContent: false,
                    blockVideos: false,
                    titleAction: 1,
                    titleReplaceText: '',
                    channelNameAction: 0,
                    channelNameReplaceText: '',
                    thumbnailAction: 0,
                    uniqueId: 'custom-' + Array.from({length: 16}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
                });
                this.saveData();
                this.parseFilters(this.options.filters);
                this.$nextTick(function(){
                    let $highlight = document.getElementById('filter-' + (this.options.filters.length - 1));
                    if($highlight){
                        $highlight.classList.add('highlight');
                        $highlight.scrollIntoView();
                        $scroll.scrollTop -= 15;
                        let $titleInput = $highlight.querySelector('.title-line .pretty-input input');
                        $titleInput.focus();
                    }
                });
            },
            askRemoveFilter(id){
                this.promptUser(
                    'Are You Sure You Want to Delete This Filter?',
                    'Deleting a filter can\'t be undone. Alternatively, you can make a backup of it and then delete it. To do this, click the &ldquo;Save Filter to File&rdquo; button next to the filter you would like to backup. Then click &ldquo;Delete Filter&rdquo; again.',
                    ['Delete', 'Cancel'],
                    (clicked) => {
                        if(clicked == 0){
                            this.options.filters.splice(id, 1);
                            this.saveData();
                            this.parseFilters(this.options.filters);
                        }
                    }
                );
            },

            saveFilterToFile(id){
                let filter = this.options.filters[id];
                
                downloadTextFile(
                    JSON.stringify(filter),
                    (filter.name.toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9_\-\s]/g, '').trim() || 'filter ' + (id - 1)) + '.ytrf'
                );
            },
            loadFilterFromFile(evt){
                evt.preventDefault();

                // Sequentially load and process every uploaded file one by one
                let files = Array.from((evt.dataTransfer || evt.currentTarget).files),
                    showedFileInvalid = false,
                    addFilter = (filter, replaceFilterIndex) => {
                        let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890',
                            newFilter = {},
                            defaultFilter = {
                                name: '',
                                desc: '',
                                tagList: '',
                                enabled: true,
                                hideAllContent: false,
                                blockVideos: false,
                                titleAction: 1,
                                titleReplaceText: '',
                                channelNameAction: 0,
                                channelNameReplaceText: '',
                                thumbnailAction: 0,
                                uniqueId: 'custom-' + Array.from({length: 16}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
                            };
                        
                        // Override filter with defaults
                        for(let [key, def] of Object.entries(defaultFilter))
                            newFilter[key] = filter[key] != undefined && filter[key] != null ? filter[key] : def;
                        
                        // Add to filter list and save
                        if(replaceFilterIndex == undefined)
                            this.options.filters.push(newFilter);
                        else
                            this.options.filters[replaceFilterIndex] = newFilter;
                        this.saveData();
                        this.parseFilters(this.options.filters);

                        // Highlight newly created filter
                        let highlightId = 'filter-' + (replaceFilterIndex == undefined ? this.options.filters.length - 1 : replaceFilterIndex);
                        this.$nextTick(function(){
                            let $highlight = document.getElementById(highlightId);
                            if($highlight){
                                $highlight.classList.add('highlight');
                                $highlight.scrollIntoView();
                                $scroll.scrollTop -= 15;
                            }
                        });
                    },
                    processNextFile = () => {
                        let file = files.pop();
                        if(file){
                            let reader = new FileReader();
                            reader.onload = () => {
                                let parsed;
                                try{
                                    parsed = JSON.parse(reader.result);
                                }catch(_){}
                                if(file.name.endsWith('.ytrf') && parsed && parsed.uniqueId){
                                    // Match filters with the same uniqueId
                                    let replaceFilterAtIndex = this.options.filters.findIndex((f) => f.uniqueId == parsed.uniqueId);
                                    
                                    // Match filters with the same name
                                    if(replaceFilterAtIndex == -1 && parsed.name.trim())
                                        replaceFilterAtIndex = this.options.filters.findIndex((f) => f.name.trim() == parsed.name.trim());

                                    if(replaceFilterAtIndex == -1){
                                        addFilter(parsed);
                                        processNextFile();
                                    }else{
                                        let replaceFilter = this.options.filters[replaceFilterAtIndex];
                                        // Ask if other filter should be replaced or not
                                        this.promptUser(
                                            'Matching Filter ' + (parsed.name.trim() == replaceFilter.name.trim() ? 'Names' : 'Ids'),
                                            `Would you like to replace ${replaceFilter.name.trim() ? 'filter &ldquo;' + replaceFilter.name.trim() : 'Filter ' + (replaceFilterAtIndex - 1)}&rdquo; with the filter you loaded from the file or create a completely new filter?`,
                                            ['Replace', 'New Filter'],
                                            (clicked) => {
                                                if(clicked == 0){
                                                    addFilter(parsed, replaceFilterAtIndex);
                                                }else if(clicked == 1){
                                                    if(parsed.uniqueId == replaceFilter.uniqueId) // Since we don't want two filters to have the same id
                                                        delete parsed.uniqueId;
                                                    addFilter(parsed);
                                                }
                                                processNextFile();
                                            }
                                        );
                                    }
                                }else{
                                    // File isn't valid. prompt user no more than once
                                    if(!showedFileInvalid){
                                        showedFileInvalid = true;
                                        this.promptUser(
                                            'File isn\'t a Valid Filter',
                                            'One or more of the files you uploaded isn\'t a valid filter. Please only load filters previously saved as <code>.ytrf</code> files.  To save a filter as a <code>.ytrf</code> file, click the &ldquo;Save Filter to File&rdquo; button next to the filter.',
                                            () => processNextFile()
                                        );
                                    }else{
                                        processNextFile();
                                    }
                                }
                            };
                            reader.readAsText(file);
                        }else{
                            // When done with all files make sure to parse filters, so tageditors can be up-to-date
                            this.parseFilters(this.options.filters);
                        }
                    };
                
                if(!evt.dataTransfer){
                    // Reset file input so if we select the same file again, it triggers the onchange
                    evt.currentTarget.value = null;
                }else{
                    // We arn't dragging a file over the filter container anymore
                    this.draggingFileOverCount = 0;
                }
                // Start processing files
                processNextFile();
            },

            startDraggingHandle(evt){
                let d = this.filterDragging;
                if(!d.dragging){
                    // We're now dragging.  save some vital information
                    d.dragging = true;
                    d.$dragging = evt.currentTarget.parentElement;
                    let draggingRect = d.$dragging.getBoundingClientRect();
                    d.offestY = evt.clientY - draggingRect.top;

                    // Create a placeholder.  this will act as the element while it is being dragged arround
                    d.$placeholder = document.createElement('div');
                    d.$placeholder.classList.add('dragging-filter-placeholder');
                    d.$placeholder.style.height = draggingRect.height + 'px';
                    d.$dragging.insertAdjacentElement('beforebegin', d.$placeholder);

                    // Final things
                    d.$dragging.classList.add('dragging');
                    evt.preventDefault();
                    this.updateDraggingFilterPosition();
                }
            },
            doneDragging(){
                let d = this.filterDragging;
                if(d.dragging){
                    d.dragging = false;

                    if(d.$dragging && d.$placeholder){
                        d.$dragging.classList.remove('dragging');
                        d.$dragging.style.top = '';

                        // Place dragging filter in position of the placeholder, and then remove the placeholder
                        d.$placeholder.insertAdjacentElement('beforebegin', d.$dragging);
                        d.$placeholder.parentElement.removeChild(d.$placeholder);

                        // Remove top property so on another drag it won't animate into its first position
                        let $animate = document.getElementById('dragging-filter-animate');
                        $animate.style.top = '';

                        // Remove the classname enable-animation from any components because they will trigger an animation when the $dragging is moved
                        for(let el of document.querySelectorAll('#filter-container .enable-animation'))
                            el.classList.remove('enable-animation');

                        // If the index, thus the filterId of this filter changed, move it to the new index
                        let filters = this.options.filters,
                            filterCopy = filters.slice(),
                            newFilterPositions = Array.from(document.querySelectorAll('.filter')).map(e => parseInt(e.id.substr(7))),
                            length = newFilterPositions.length;
                        if(length == filters.length && !newFilterPositions.every((v, i) => v == i)){
                            // Reorder filters
                            for(let i = 0; i < length; i++)
                                Vue.set(filters, i, filterCopy[newFilterPositions[i]]);
                            this.saveData();
                        }
                    }
                }
            },
            updateDraggingFilterPosition(){
                let d = this.filterDragging;
                if(d.dragging){
                    let containerRect = document.getElementById('filter-container').getBoundingClientRect(),
                        placeholderRect = d.$placeholder.getBoundingClientRect(),
                        $animate = document.getElementById('dragging-filter-animate'),
                        draggingHalfHeight = d.$dragging.getBoundingClientRect().height / 2,
                        draggables = Array.from(document.querySelectorAll('.filter.draggable:not(.dragging)'));

                    // Place dragging filter in right position relative to mouse, preventing it from going outside the filter container
                    let offset = Math.min(Math.max(d.clientY - containerRect.top - d.offestY, -draggingHalfHeight), containerRect.height - draggingHalfHeight);
                    d.$dragging.style.top = offset + 'px';
                    
                    // Animate movement of placeholder
                    $animate.style.top = (placeholderRect.top - containerRect.top) + 'px';
                    $animate.style.height = placeholderRect.height + 'px';

                    // Find first draggable element that the mouse is higher than and place placeholder before it, or if mouse is higher than none, place after last draggable
                    if(draggables.length){
                        let index = draggables.findIndex(e => {
                            let rect = e.getBoundingClientRect();
                            return d.clientY < (rect.top + rect.bottom) / 2; // Is mouse above average center position of element
                        });
                        if(index == -1)
                            draggables[draggables.length - 1].insertAdjacentElement('afterend', d.$placeholder);
                        else
                            draggables[index].insertAdjacentElement('beforebegin', d.$placeholder);
                    }
                }
            }
            // #endregion
        }
    });
});