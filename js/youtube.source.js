javascript:(function() {
    function add(t, u, title) {
		var a = document.createElement("a");
	 	var t = document.createTextNode(t);
		a.appendChild(t);
	 	a.setAttribute('href', u + "&title="+ title);
	 	a.setAttribute('style', 'font-weight:bold; font-size:larger; margin-right:5px');
	 	var b = document.getElementById("watch7-video");
		if (b == null) {
	 		document.body.parentNode.insertBefore(a,document.body);
	 	} else {
			b.parentNode.insertBefore(a,b);
		}
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
	var mplayer = document.getElementById("movie_player");
	var swfHTML = mplayer.getAttribute("flashvars");
	swfHTML || (swfHTML = mplayer.getElementsByTagName("param")[1].value);
	var destroyPlayer = true;
	var w = swfHTML.split("&");
	for (i = 0; i <= w.length - 1; i++) {
	 	if (w[i].split("=")[0] == "url_encoded_fmt_stream_map") {
	 		links = unescape(w[i].split("=")[1]);
	 		break;
	 	}
	}
	var fmt_list = unescape(getAttr(w,"fmt_list"));
	var fmt_list = fmt_list.split(",");
	var list = [];
	for(var i=0; i<fmt_list.length; i++){
		var tmparr = fmt_list[i].split("/");
		list[tmparr[0]] = tmparr[1];
	}
	var abc = links.split(",");
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
	var cells = document.getElementsByTagName("embed");
	for (var i = 0; i < cells.length; i++) var temp = cells[i].parentNode.removeChild(cells[i]);
}
)();
