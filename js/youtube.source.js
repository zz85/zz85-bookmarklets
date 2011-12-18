(function() {


    function add(t, u) {
        var a = document.createElement("a");
        var t = document.createTextNode(t);
        a.appendChild(t);
        a.setAttribute('href', u);
        var b = document.getElementById("watch-headline-user-info");
        if (b == null) {
            document.body.parentNode.insertBefore(a,document.body);
        } else
        b.appendChild(a);
    }
    
    
    function getCode(url) {
        var str = url.split("&");
        for (var i = 0; i < str.length; i++) {
            var temp = str[i].split("=");
            if (temp[0] == "itag")
                return parseInt(temp[1]);
        }
        return 0;
    }


    var mplayer = document.getElementById("movie_player"),
        
    swfHTML = mplayer.getAttribute("flashvars");

    swfHTML || (swfHTML = mplayer.getElementsByTagName("param")[1].value);

    var destoryPlayer = true;

    var w = swfHTML.split("&");

    for (i = 0; i <= w.length - 1; i++) {
        if (w[i].split("=")[0] == "url_encoded_fmt_stream_map") {
            links = unescape(w[i].split("=")[1]);
            break;
        }
    }

    var abc = links.split(",url=");

    for (i = 0; i <= abc.length - 1; i++) {
        fmt = abc[i].split("|")[0];
        url = fmt.substring(0, fmt.indexOf("fallback_host") - 1);
        url = unescape(unescape(url));

        var code = getCode(url);
        
        switch (code) {
          case 37:
            add("[HD 1080p MP4]", url);
            break;
          case 22:
            add("[HD 720p MP4]", url);
            break;
          case 46:
            add("[HD 1080p FLV]", url);
            break;
          case 45:
            add("[HD 720p FLV]", url);
            break;
          case 35:
            add("[Medium 480p FLV]", url);
            break;
          case 44:
            add("[Medium 480p WebM]", url);
            break;
          case 43:
            add("[Medium 360p WebM]", url);
            break;
          case 34:
            add("[Medium 360p FLV]", url);
            break;
          case 18:
            add("[Low 270p MP4]", url);
            break;
          case 5:
            add("[Low 226p FLV]", url);
            break;
          default:
            add("[" + code + "]", url);
        }
    }

    if (!destoryPlayer) return;
    var cells = document.getElementsByTagName("embed");

    for (var i = 0; i < cells.length; i++) var temp = cells[i].parentNode.removeChild(cells[i]);

})();