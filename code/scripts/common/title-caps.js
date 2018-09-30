/* Title Caps - Copyright (c) 2018 Marc Guiselin
 * 
 * License: http://www.opensource.org/licenses/mit-license.php
 * 
 * string.titleCap(): capitalizes words in a title based of the rules from below
 * 		Always capitalize first letter of title or sentence:
 * 			a dog vs. a cat -> A Dog vs. a Cat.
 *			a plumber likes piping. a vet likes petting. -> A Plumber Likes Piping. A Vet Likes Petting.
 *		Capitalize first letter of every word except special words including prepositions, articles, and conjunctions
 *		Keep roman numerals correctly capitalized
 *		state-of-the-art -> State-of-the-Art
 * 		state_of_the_art -> State_of_the_Art
 *		don't -> Don't
 *		#HASHTAG -> #hashtag
 *		example.com -> example.com
 *		J.F.K J.F.K. U.N.C.L.E. j.k
 *      Bon AppÉTit
 *		Works best with english, but also supports french and spanish
 * 
 * string.titleCapSentences(): capitalizes first letter of title or sentence, lowercasing all the rest
 */

(function() {
    var anyWord = /[^\s-_]+/g, // Match any group that could be a word. words never contain any whitespace characters, dashes, or underscores.
        firstLetterOfSentence = /(vs)?(^\s*\w|[^\w\s,&%#-'.]\s*\w|\.\s+\w|-\s+\w)/gi, // Match the first letter of sentences
        beginningPunct = /^[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]*/, // Match punctuation at the beginning of a word
        endingPunct = /[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]*$/, // Match punctuation at the end of a word
        removeCharacters = /\uFE0F/g, // Removes an invisble emoji character that breaks text capitalization
        allwaysLower = new RegExp('^(' +
            // English:
            'as|at|atop|but|buy|by|down|for|from|if|in|into|like|mid|near|next|nor|of|off|on|once|onto|or|out|over|pace|past|per|plus|pro|qua|sans|save|so|than|that|the|till|to|unto|up|upon|via|vice|vs.?|when|with|yet|' +
            // French:
            'à|le|un|du|la|une|de|l\'\\w{3,}|une|les|des|après|apres|avant|avec|chez|contre|dans|de|en|par|pour|sans|sauf|selon|sous|sur|vers|avoir|être|etre|aller|faire|voir|venir|dire|finir|lire|sortir|parler|aimer|boire|' +
            // Spanish:
            'por|de|da|del|dos|do|das|sin|para|lo|en|ya|que|lado|al|más|allá|pero|dado|con|vale|el|la|así|como|caso|esto|eso|ess|estos' +
            ')$', 'i'), // Some words like but, at, a, and or should always be lowercase
        allwaysUpper = /^((M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3}))|TV)$/i, // Things like roman numerals, and the word TV and I, should be uppercase
        finalUpper = /([a-z]\.)([a-z]\.)([a-z]\.)?([a-z]\.)?([a-z]\.)?[a-z]?/ig,
        titlecase = function(word) {
            return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
        },
        anywordReplacer = function(s) {
            var bs = s.match(beginningPunct)[0],
                es = s.match(endingPunct)[0];

            // Matched isolated group of punctuation. no need to modify it
            if (bs == s)
                return s;

            // Hashtags are better lowercased
            if (bs === '#')
                return s.toLowerCase();

            // Remove punctuation from beginning and end of string
            s = s.substring(bs.length, s.length - es.length)

            if (allwaysLower.test(s)) // If the word is one that should always be lowercase
                return bs + s.toLowerCase() + es;

            if (allwaysUpper.test(s)) // If the word is one that should always be uppercase
                return bs + s.toUpperCase() + es;

            return bs + titlecase(s) + es;
        },
        firstLetterOfSentenceReplacer = function(s) {
            if (s.substr(0, 3).toLowerCase() === 'vs.') // If 'vs.' was mached, don't capitalize because the regex didn't actually mach the start of a new sentence 
                return s;
            return s.toUpperCase();
        },
        uppercase = function(s) {
            return s.toUpperCase();
        };

    // Check and replace all words, then uppercase first letter of all sentences
    String.prototype.titleCap = function() {
        return this
            .replace(removeCharacters, '')
            .replace(anyWord, anywordReplacer)
            .replace(firstLetterOfSentence, firstLetterOfSentenceReplacer)
            .replace(finalUpper, uppercase);
    };

    // Lowercase everything, then uppercase first character of all sentences
    String.prototype.titleCapSentences = function() {
        return this
            .replace(removeCharacters, '')
            .toLowerCase()
            .replace(firstLetterOfSentence, firstLetterOfSentenceReplacer)
            .replace(finalUpper, uppercase);
    };
})();