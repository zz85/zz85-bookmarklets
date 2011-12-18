(function() {

    function add(a, b) {
        var c = document.createElement("a"), a = document.createTextNode(a);
        c.appendChild(a), c.setAttribute("href", b);
        var d = document.getElementById("watch-headline-user-info");
        d == null && (d = document.getElementsByTagName("body").item(0)), d.appendChild(c);
    }

    function getCode(a) {
        var b = a.split("&");
        for (var c = 0; c < b.length; c++) {
            var d = b[c].split("=");
            if (d[0] == "itag") return parseInt(d[1]);
        }
        return 0;
    }

    var swfHTML = document.getElementById("movie_player").getAttribute("flashvars");

    swfHTML || (swfHTML = document.getElementById("movie_player").getElementsByTagName("param")[1].value);

    var destoryPlayer = true;

    var w = swfHTML.split("&");

    for (i = 0; i <= w.length - 1; i++) if (w[i].split("=")[0] == "url_encoded_fmt_stream_map") {
        links = unescape(w[i].split("=")[1]);
        break;
    }

    var abc = links.split(",url=");

    for (i = 0; i <= abc.length - 1; i++) {
        fmt = abc[i].split("|")[0], fmt.indexOf("rl=") > 0 ? (url = fmt.substring(4, fmt.indexOf("fallback_host") - 1), url = unescape(unescape(url))) : (url = fmt.substring(0, fmt.indexOf("fallback_host") - 1), url = unescape(unescape(url)));
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
            /*
          case 44:
            add("[Large FLV]", url);
            break;
          case 43:
            add("[Medium FLV]", url);
            break;*/
          case 34:
            add("[Medium 360p FLV]", url);
            break;
          case 18:
            add("[Low 270p MP4]", url);
            break;
          default:
            add("[" + code + "]", url);
          case 5:
            add("[Low FLV]", url);
        }
    }

    if (!destoryPlayer) return;
    var cells = document.getElementsByTagName("embed");

    for (var i = 0; i < cells.length; i++) var temp = cells[i].parentNode.removeChild(cells[i]);

})();