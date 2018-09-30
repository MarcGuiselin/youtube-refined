// ============================
// Copyright 2018 Marc Guiselin
// ============================

{
    const regexMatchingQuotes = /^(["'`]).*\1$/;
    const regexNonMatchingQuotes = /^["'`]|["'`]$/;
    const regexBackSlash = /\\/g;
    const regexDoubleQuote = /\\/g;
    const regexSpaces = /\s+/g;

    function normalify(string){
        return string.trim().replace(regexSpaces, ' ');
    }

    // #region Tag object
    this.Tag = class{
        constructor(type, comparator, value) {
            if(arguments.length == 1){
                let parse = type.trim();
                try{
                    // Try to get the type.  match the first few characters of parse to the longest typeConversions key possible
                    for(let t of tagTypeConversionKeysSortedFromLongestToShortest){
                        if(parse.toLowerCase().startsWith(t)){
                            this._type = Tag.typeConversions[t];
                            parse = parse.substr(t.length).trim();
                            break;
                        }
                    }
                    if(!this._type)
                        throw '';
    
                    // Try to get the comparator.  match the first few characters of parse to the longest typeConversions key possible
                    for(let c of comparatorConversionKeysSortedFromLongestToShortest){
                        if(parse.toLowerCase().startsWith(c)){
                            this._comparator = Tag.comparatorConversion[c];
                            parse = parse.substr(c.length).trim();
                            break;
                        }
                    }
                    if(!this._comparator)
                        throw '';
    
                    // Finally try parsing the value
                    if(regexMatchingQuotes.test(parse)) // Has matching quotes
                        this._value = parse.substr(1, parse.length - 2).replace(/\\./g, (s) => s.charAt(1));
                    else if(regexNonMatchingQuotes.test(parse)) // Has non-matching quotes
                        throw '';
                    else // Has no quotes
                        this._value = parse;
    
                    this._changed();
                }catch(e){
                    this._type = type.trim();
                    this._displaymode= 'er';
                    this._errormsg = 'Could not parse tag: ' + type.trim();
                }
            }else{
                this._type = type || '';
                this._comparator = comparator || '';
                this._value = value || '';
    
                this._displaymode= 'er';
                this._errormsg = '';
                this._changed();
            }
        }
        get type(){
            return this._type;
        }
        set type(val){
            this._type = val;
            this._changed();
        }
        get comparator(){
            return this._comparator;
        }
        set comparator(val){
            this._comparator = val;
            this._changed();
        }
        get value(){
            return this._value;
        }
        set value(val){
            this._value = val;
            this._changed();
        }
        _changed(){
            this._errormsg = '';
            try{
                // Check if type is valid
                if(!this._type)
                    throw 'Tag needs a type';
                let t = Tag.typeConversions[normalify(this._type).toLowerCase()];
                if(!t)
                    throw `Unknown type '${normalify(this._type)}'`;
                this._type = t;
    
                // Check if comparator is valid
                if(!this._comparator)
                    throw 'Tag needs a comparator';
                let c = Tag.comparatorConversion[normalify(this._comparator).toLowerCase()];
                if(!c)
                    throw `Unknown comparator '${normalify(this._comparator)}'`;
                this._comparator = c;
    
                // Check if value is valid
                if(!this._value)
                    throw 'Value is empty';
    
                // Check if type comparator value combination is valid
                if(Tag.invalidTypeComparatorCombinations.includes(this._type + this._comparator))
                    throw `Invalid combination: The comparator '${this.getPrettyComparator()}' can't be used with '${this.getPrettyType()}'`;
    
                // Finally determine display mode
                if(this._type == 'ch' && this._comparator == '=')
                    this._displaymode = 'ch';
                else if(this._type == 'vi' && this._comparator == '=')
                    this._displaymode = 'vi';
                else
                    this._displaymode = 'sg';
            }catch(e){
                this._displaymode = 'er';
                this._errormsg = e;
            }
        }
        getPrettyType(){
            return Tag.prettyTypes[this._type] || this._type;
        }
        getPrettyComparator(){
            return Tag.prettyComparators[this._comparator] || this._comparator;
        }
        getDisplayMode(){
            return this._displaymode;
        }
        getErrorMsg(){
            return this._errormsg;
        }
        isError(){
            return this._displaymode == 'er';
        }
        isEmpty(){
            return !this._type || !this._comparator || !this._value.trim();
        }
        isSearchGroup(){
            return this._displaymode == 'sg';
        }
        equals(t){
            if(this.isError() || t.isError() || this._type != t._type || this._comparator != t._comparator)
                return false;
            else if(this._comparator == '/')
                return this._value == t._value;
            else if(this._type == 'vi')
                return this._value.trim() == t._value.trim();
            else// Same as: if(this._type == 'ch' || this._type == 'vt')
                return normalify(this._value).toLowerCase() == normalify(t._value).toLowerCase();                
        }
        toString(){
            return this._type + this._comparator + '"' + this._value.replace(regexBackSlash, '\\\\').replace(regexDoubleQuote, '\\"') + '"';
        }
        clone(){
            return new Tag(this._type, this._comparator, this._value);
        }
    };
    // #endregion

    // All settings
    this.Tag.typeConversions = {
            'ch':           'ch',
            'channel':      'ch',
            'channelname':  'ch',
            'channel name': 'ch',
    
            'vi':           'vi',
            'video':        'vi',
            'videoid':      'vi',
            'video id':     'vi',
    
            'vt':           'vt',
            'title':        'vt',
            'videotitle':   'vt',
            'video title':  'vt',

            'vc':           'vc',
            'views':        'vc',
            'view count':   'vc',
            'video views':  'vc'
        };
    this.Tag.comparatorConversion = {
            '=':                    '=',
            '==':                   '=',
            'is':                   '=',
            'equals':               '=',
            'is equal to':          '=',
    
            '!':                    '!',
            '!=':                   '!',
            'not':                  '!',
            'is not':               '!',
            'does not equal':       '!',
    
            '~':                    '~',
            '~=':                   '~',
            '*':                    '~',
            '*=':                   '~',
            'contains':             '~',
            'includes':             '~',
    
            '^':                    '^',
            '^=':                   '^',
            'starts with':          '^',
    
            '$':                    '$',
            '$=':                   '$',
            'ends with':            '$',
    
            '<':                    '<',
            '<=':                   '<',
            'less':                 '<',
            'is less than':         '<',
    
            '>':                    '>',
            '>=':                   '>',
            'greater':              '>',
            'is greater than':      '>',
    
            '/':                    '/',
            '/=':                   '/',
            'regex':                '/',
            'matches regex':        '/'
        };
    this.Tag.prettyTypes = {
            'ch': 'Channel Name',
            'vi': 'Video ID',
            'vt': 'Video Title'
        };
    this.Tag.prettyComparators = {
            '=': 'Equals',
            '!': 'is Not',
            '~': 'Contains',
            '^': 'Starts With',
            '$': 'Ends With',
            '<': 'is Less than',
            '>': 'is Greater than',
            '/': 'Matches Regex'
        };
    this.Tag.invalidTypeComparatorCombinations = [
            'ch<', 'ch>',
            'vt<', 'vt>',
            'vi!', 'vi~', 'vi^', 'vi$', 'vi<', 'vi>', 'vi/',
            'vc~', 'vi^', 'vi$', 'vi/'
        ];
    this.Tag.validTagTypes = ['ch', 'vi', 'vt'];
    this.Tag.validGroupedTagTypes = ['ch', 'vt'];
    // Order:                     ch=    vi=    sg(ch, vt, then vc ordered by !, ~, r, ^, $, <, >)
    this.Tag.sortOrder =        ['ch=', 'vi=', 'ch!', 'ch~', 'ch/', 'ch^', 'ch$', 'vt=', 'vt!', 'vt~', 'vt/', 'vt^', 'vt$', 'vc!', 'vc=', 'vc<', 'vc>'];
    // Order:                     ch=           sg(ch, vt, then vc ordered by !, ~, r, ^, $, <, >)
    this.Tag.groupedSortOrder = ['ch=',        'ch!', 'ch~', 'ch/', 'ch^', 'ch$', 'vt=', 'vt!', 'vt~', 'vt/', 'vt^', 'vt$', 'vc!', 'vc=', 'vc<', 'vc>'];
    this.Tag.sortCollater = new Intl.Collator(undefined, {sensitivity: 'case', numeric: true});

    const tagTypeConversionKeysSortedFromLongestToShortest = Object.keys(Tag.typeConversions).sort((a, b) => b.length - a.length);
    const comparatorConversionKeysSortedFromLongestToShortest = Object.keys(Tag.comparatorConversion).sort((a, b) => b.length - a.length);
    const charIsASeparator = (c) => c && (c.trim() == ',' || c.trim() == '&');

    // Parse comma-separated list of tags
    this.Tag.parseList = function(tagList){
        let result = {
            error: '',
            groupedTags: [],
            tags: []
        };

        tagList = (tagList || '').trim();

        try{
            if(tagList){
                let tags = [],
                    inString = '',
                    lastCharWasADash = false,
                    buildingTag = '';

                // Split tagList between separator characters not in strings by going from character to character
                for(let c of tagList){
                    if(inString){
                        if(lastCharWasADash)
                            lastCharWasADash = false;
                        else if(c == '\\')
                            lastCharWasADash = true;
                        else if(c == inString)
                            inString = null;
                        buildingTag += c;
                    }else if(c == "'" || c == '"' || c == '`'){
                        inString = c;
                        buildingTag += c;
                    }else if(charIsASeparator(c)){
                        if(buildingTag.trim()) // Add tag to taglist
                            tags.push(buildingTag.trim());
                        else if(tags.length && charIsASeparator(tags[tags.length - 1])) // If no tag was just added, we might be adding a separator after another.  if that's the case then that's an error
                            throw `2 or more comparators: ${tags[tags.length - 1]} ${tags[c]}`;
                        tags.push(c);
                        buildingTag = '';
                    }else{
                        buildingTag += c;
                    }
                }

                // Last tag may not have been added so add it to the list
                if(buildingTag.trim())
                    tags.push(buildingTag.trim());

                // If we are still in a string we have a pretty serious problem
                if(inString)
                    throw 'Bad quotation marks';

                // If first or last thing in list is a separator then just remove them.  not really a point to throwing an error
                if(tags.length && charIsASeparator(tags[0]))
                    tags.shift();
                if(tags[tags.length - 1] && charIsASeparator(tags[tags.length - 1]))
                    tags.pop();

                // Now create tags and place them into groups
                tags.unshift(',');
                tags.push(',');
                while(tags.length > 1){
                    let separator = tags.shift(),
                        tag = new Tag(tags.shift()),
                        nextSeparator = tags[0];
                    
                    if(separator == ','){
                        if(nextSeparator == ',')
                            result.tags.push(tag);
                        else
                            result.groupedTags.push([tag]);
                    }else{
                        result.groupedTags[result.groupedTags.length - 1].push(tag);
                    }
                }
            }
        }catch(e){
            result.error = 'Error: ' + e;
            result.groupedTags = [];
            result.tags = [];
        }

        return result;
    };

    // Stringify given a list of groupedTags and tags
    this.Tag.stringifyList = function(groupedTags, tags){
        return [
            // Add groups
            ...groupedTags.map((g) => g.filter(t => !t.isEmpty() && !t.isError()).join(' & ')),
            // Add tags
            ...tags.filter(t => !t.isEmpty() && !t.isError())
        ].join(', ');
    };
}