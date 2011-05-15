//javascript:(function(){var script=document.createElement('script');script.type='text/javascript';script.src='https://github.com/zz85/zz85-bookmarklets/raw/master/js/scramble.js';document.body.appendChild(script);})()

/*
 * Some fun for people trying to experience dyslexia
 * This bookmarklet scrambles the letters of each word except the first and last letters of the words.
 * You might have seen this is the "Cambridge Study".
 * Thanks to my friend Munir Hussin for this idea.
 * 
 * Run this bookmarklet on
 * http://www.inc.com/articles/201105/are-dyslexics-better-visionaries.html
 * and see if you can understand the article.
 *
 */

(function() {
	// This shuffle method was discussed in http://sroucheray.org/blog/2009/11/array-sort-should-not-be-used-to-shuffle-an-array/
	Array.prototype.shuffle = function (){
		var i = this.length, j, temp;
		if ( i == 0 ) return;
		while ( --i ) {
			j = Math.floor( Math.random() * ( i + 1 ) );
			temp = this[i];
			this[i] = this[j];
			this[j] = temp;
		}
	};

	function textScramble(w) {

		return w.replace(/\w+/g, function (word) {
			if (word.length<3) return word;
			var chars = word.split('');
			var last = chars.pop();
			var first = chars.shift();
			chars.shuffle();
			chars.unshift(first);
			chars.push(last);
			return chars.join('');
		});
	}

	function htmlreplace(element) {
		var nodes = element.childNodes;
		for (var n = 0; n < nodes.length; n++) {
			if (nodes[n].nodeType == Node.TEXT_NODE) {
				// Do something to the textnode
				nodes[n].textContent = textScramble(nodes[n].textContent);			
			} else {
				htmlreplace(nodes[n]);
			}
		}
	}

     htmlreplace(document.body);
     
})();