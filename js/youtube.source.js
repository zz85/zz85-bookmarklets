javascript:(function() {
	var destroyPlayer = true;
	var fmt_string = "url_encoded_fmt_stream_map";
	var placeHolder = document.getElementById("placeHolder");
	if(!placeHolder){
		placeHolder = document.createElement("div");
		placeHolder.setAttribute("id","placeHolder");
		var b = document.getElementById("watch7-headline");
		if (b == null) {
			document.body.parentNode.insertBefore(placeHolder,document.body);
		} else {
			b.insertBefore(placeHolder,b.firstElementChild);
		}
	} else {
		while(placeHolder.lastChild){
			placeHolder.removeChild(placeHolder.lastChild);
		}
	}

	function add(t, u, title) {
		var a = document.createElement("a");
		var t = document.createTextNode(t);
		a.appendChild(t);
		a.setAttribute('href', u + "&title="+ title);
		placeHolder = document.getElementById("placeHolder");
		placeHolder.insertBefore(a,placeHolder.firstElementChild)
	}
	function getAttr(arr,att) {
		for(var i=0; i<arr.length; i++){
			var entry = arr[i].split("=");
			if(entry[0]==att){
				return entry[1];
			}
		}
		return "";
	}
	function getType(type){
		type = unescape(type).split(";")[0];
		if(type == "video/x-flv"){
			return "FLV";
		} else if(type == "video/3gpp"){
			return "3GP";
		} else if(type == "video/webm"){
			return "WebM";
		} else if(type == "video/mp4"){
			return "MP4";
		} else {
			return "Other";
		}
	}
	
	/* Get parameter list */
	var html5ConfigString = "ytplayer.config = ";
	var mplayer = document.getElementById("movie_player");
	var swfHTML = mplayer.getAttribute("flashvars");
	swfHTML || (swfHTML = mplayer.getElementsByTagName("param")[1].value);
	var paramList = null;
	if (!swfHTML){
		/* The case for HTML5 player */
		var scripts = document.getElementsByTagName("script");
		for(i = 0; i < scripts.length; i++){
			var script = scripts[i];
			if (script.text.indexOf(html5ConfigString)>=0){
				var paramStringStart = script.text.indexOf(html5ConfigString)+html5ConfigString.length;
				paramString = script.text.substring(paramStringStart, script.text.length-1);
				paramList = JSON.parse(paramString);
				for(var prop in paramList["args"]){
					paramList[prop] = paramList["args"][prop];
				}
				delete(paramList["args"]);
				paramList[fmt_string] = paramList[fmt_string].replace(/\\u0026/g,"&");
				break;
			}
		}
	} else {
		/* The case for Flash player */
		var w = swfHTML.split("&");
		paramList = Object();
		for (i = 0; i <= w.length - 1; i++) {
			var keyValue = w[i].split("=");
			paramList[keyValue[0]] = keyValue[1];
			if (keyValue[0] == fmt_string) {
				paramList[fmt_string] = unescape(keyValue[1]);
				break;
			}
		}
	}
	
	var fmt_list = unescape(paramList["fmt_list"]);
	var fmt_list = fmt_list.split(",");
	var list = [];
	for(var i=0; i<fmt_list.length; i++){
		var tmparr = fmt_list[i].split("/");
		list[tmparr[0]] = tmparr[1];
	}
	var abc = paramList[fmt_string].split(",");
	for (i = 1; i <= abc.length - 1; i++) {
	 	var fmt = abc[i].split("&");
		var url = unescape(getAttr(fmt,"url"));
		var code = parseInt(getAttr(fmt,"itag"));
		var signature = getAttr(fmt,"sig");
		var url = url+"&signature="+signature;
		var type = getType(getAttr(fmt,"type"));
	 	var title = ((((document.title.replace('#',' ')).replace('@',' ')).replace('*',' ')).replace('|',' ')).replace(':',' ');
	 	add("[" + list[code] + " " + type + "]", url, title);
	}
	if (!destroyPlayer) return;
	var moviePlayer = document.getElementById("movie_player");
	moviePlayer.parentNode.removeChild(moviePlayer);
}
)();
