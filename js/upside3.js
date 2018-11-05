//javascript:(function(){var script=document.createElement('script');script.type='text/javascript';script.src='http://localhost/zz85-experiments/code/upside3.js';document.body.appendChild(script);})()	
//javascript:(function(){var script=document.createElement('script');script.type='text/javascript';script.src='http://jabtunes.com/labs/code/upside3.js';document.body.appendChild(script);})()	

// Can use this to solve. Reference stroke rotation pls javascript:(function(){document.body.style%5B%27-webkit-transform%27%5D%20%3D%20%27rotate%28180deg%29%27})();

	function htmlreplace(element) {
        var nodes = element.childNodes;
        for (var n = 0; n < nodes.length; n++) {
			var type = nodes[n].nodeType;
            if (nodes[n].nodeType == Node.TEXT_NODE) {
				// Do something to the textnode
                nodes[n].textContent = flipString(nodes[n].textContent);
			
            } else {
                htmlreplace(nodes[n]);
            }
        }
    }

	
	
	function flipString(aString) {
		aString=aString.toLowerCase();
		var last = aString.length - 1;
		//Thanks to Brook Monroe for the
		//suggestion to use Array.join
		var result = new Array(aString.length)
		for (var i = last; i >= 0; --i) {
		var c = aString.charAt(i)
		var r = flipTable[c]
		result[last - i] = r != undefined ? r : c
		}
		return result.join('')
	}

	
	var flipTable = {
		a : '\u0250',
		b : 'q',
		c : '\u0254',
		d : 'p',
		e : '\u01DD',
		f : '\u025F',
		g : '\u0183',
		h : '\u0265',
		i : '\u0131',
		j : '\u027E',
		k : '\u029E',
		l : '\u05DF',
		m : '\u026F',
		n : 'u',
		r : '\u0279',
		t : '\u0287',
		v : '\u028C',
		w : '\u028D',
		y : '\u028E',
		'.' : '\u02D9',
		'[' : ']',
		'(' : ')',
		'{' : '}',
		'?' : '\u00BF',
		'!' : '\u00A1',
		"\'" : ',',
		'<' : '>',
		'_' : '\u203E',
		'"' : '\u201E',
		'\\' : '\\',
		';' : '\u061B',
		'\u203F' : '\u2040',
		'\u2045' : '\u2046',
		'\u2234' : '\u2235'
	}

	for (i in flipTable) {
		flipTable[flipTable[i]] = i
	}

	htmlreplace(document.body);