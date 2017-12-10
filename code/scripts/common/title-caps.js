/* Title Caps - Copyright (c) 2017 Marc Guiselin
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
 *		Works best with english, but also supports french and spanish
 * 
 * string.titleCapSentences(): capitalizes first letter of title or sentence, lowercasing all the rest
 */

(function() {
    var anyWord = new RegExp("[^\\s-_]+", "g"), //match any group that could be a word. words never contain any whitespace characters, dashes, or underscores.
        firstLetterOfSentence = new RegExp("(vs)?(^\\s*\\w|[^\\w\\s,&%#-'\\.]\\s*\\w|\\.\\s+\\w|-\\s+\\w)", "gi"), //match the first letter of sentences
        beginningPunct = new RegExp("^[!\"#$%&''()*+,./:;<=>?@[\\\\\\]^`{|}~]*"), //match punctuation at the beginning of a word
        endingPunct = new RegExp("[!\"#$%&'()*+,./:;<=>?@[\\\\\\]^`{|}~]*$"), //match punctuation at the end of a word
        removeCharacters = new RegExp("\uFE0F", "g"),//removes an invisble emoji character that breaks text capitalization
        allwaysLower = new RegExp("^(" +
            //english:
            "a|out|up|buy|yet|when|till|that|than|so|once|nor|with|upon|past|over|onto|off|near|like|into|from|down|you|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v\.?|via|vs\.?|" +
            //french:
            "à|le|un|du|la|une|de|l'\w{3,}|une|les|des|après|apres|avant|avec|chez|contre|dans|de|en|par|pour|sans|sauf|selon|sous|sur|vers|avoir|être|etre|aller|faire|voir|venir|dire|finir|lire|sortir|parler|aimer|boire|" +
            //spanish:
            "por|de|da|del|dos|do|das|sin|para|lo|en|ya|que|lado|al|más|allá|pero|dado|con|vale|el|la|así|como|caso|esto|eso|ess|estos" +
            ")$", "i"), //some words like but, at, a, and or should always be lowercase
        allwaysUpper = new RegExp("^((M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3}))|TV)$", "i"), //things like roman numerals, and the word TV and I, should be uppercase
        finalUpper = new RegExp("([a-z]\\.)([a-z]\\.)([a-z]\\.)?([a-z]\\.)?([a-z]\\.)?[a-z]?", "ig"),
        titlecase = function(word) {
            return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
        },
        anywordReplacer = function(s) {
            var bs = s.match(beginningPunct)[0],
                es = s.match(endingPunct)[0];

            //matched isolated group of punctuation. no need to modify it
            if (bs == s)
                return s;

            //hashtags are better lowercased
            if (bs === "#")
                return s.toLowerCase();

            //remove punctuation from beginning and end of string
            s = s.substring(bs.length, s.length - es.length)

            if (allwaysLower.test(s)) //if the word is one that should always be lowercase
                return bs + s.toLowerCase() + es;

            if (allwaysUpper.test(s)) //if the word is one that should always be uppercase
                return bs + s.toUpperCase() + es;

            return bs + titlecase(s) + es;
        },
        firstLetterOfSentenceReplacer = function(s) {
            if (s.substr(0, 3).toLowerCase() === "vs.") //if "vs." was mached, don't capitalize because the regex didn't actually mach the start of a new sentence 
                return s;
            return s.toUpperCase();
        },
        uppercase = function(s) {
            return s.toUpperCase();
        };

    //check and replace all words, then uppercase first letter of all sentences
    String.prototype.titleCap = function() {
        return this
            .replace(removeCharacters, "")
            .replace(anyWord, anywordReplacer)
            .replace(firstLetterOfSentence, firstLetterOfSentenceReplacer)
            .replace(finalUpper, uppercase);
    };

    //lowercase everything, then uppercase first character of all sentences
    String.prototype.titleCapSentences = function() {
        return this
            .replace(removeCharacters, "")
            .toLowerCase()
            .replace(firstLetterOfSentence, firstLetterOfSentenceReplacer)
            .replace(finalUpper, uppercase);
    };
})();