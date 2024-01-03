(function(){

	// To use bookmark
	// javascript:(function(){var script=document.createElement('script');script.type='text/javascript';script.src='https://github.com/zz85/zz85-bookmarklets/raw/master/js/histogram.js';document.body.appendChild(script);})()

	// i was experimenting some image processing using html5 canvas
	// when i thought it would be a good idea to create a histogram
	// to help analysis colors.

	// this could be useful to help analysis a webgl scene, or
	// for analysing any images found on the net

	// run the bookmarklet, click on an image once to bring out the histogram
	// click on the histogram to toggle between colors / luminance

	var hist, ctx_hist;
	var paint_color = true;
	var lastData;
	var alerted = false;

	function setupHistogram() {

		if (hist) return;
		hist = document.createElement('canvas');
		hist.style.cssText = 'position:fixed; z-index: 8888; left:0; top: 0';
		ctx_hist = hist.getContext('2d');

		hist.width = 256;
		hist.height = 100;

		ctx_hist.globalCompositeOperation = 'lighter';

		hist.onclick = function() {
			paint_color = !paint_color;
			if (lastData) drawHistogram(lastData);
		}

		document.body.appendChild(hist);
	}

	function drawHistogram(data) {
		setupHistogram();
		lastData = data;
		ctx_hist.clearRect(0, 0, hist.width, hist.height);
		ctx_hist.fillStyle = '#888';
		ctx_hist.fillRect(0, 0, hist.width, hist.height);

		var stats_r = [], stats_g = [], stats_b = [], stats_l = [];

		var i;

		for ( i = 0; i < 256; i ++ ){
			stats_r[i] = stats_g[i] = stats_b[i] = stats_l[i] = 0;
		}

		for (var j=0, jl = data.length; j<jl; j+=4) {
			var r = data[j];
			var g = data[j+1];
			var b = data[j+2];
			var l = 0.3 * r + 0.59 * g + 0.11 * b;

			stats_r[r]++;
			stats_g[g]++;
			stats_b[b]++;
			stats_l[~~l]++;
		}

		var maxpixels = Number.NEGATIVE_INFINITY;
		for ( i = 0; i < 256; i ++ ) {
			maxpixels = Math.max(maxpixels, stats_l[i]);
		}

		if (paint_color) {
			paint('red', stats_r, maxpixels);
			paint('green', stats_g, maxpixels);
			paint('blue', stats_b, maxpixels);
		} else {
			paint('grey', stats_l, maxpixels);
		}

	}

	function paint(color, stats, max) {
		ctx_hist.strokeStyle = color;
		ctx_hist.fillStyle = color;
		ctx_hist.beginPath();
		ctx_hist.moveTo(0, hist.height);
		for ( var i = 0; i < 256; i ++ ) {
			ctx_hist.lineTo(i, hist.height * (1 - stats[i] / max) )
		}
		ctx_hist.lineTo(256, hist.height);
		ctx_hist.lineTo(0, hist.height);
		ctx_hist.closePath();
		ctx_hist.fill();
	}

	var encodeImg = function(e) {
		var canvas = document.createElement('canvas');
		canvas.setAttribute('width', this.width);
		canvas.setAttribute('height', this.height);

		var ctx = canvas.getContext('2d');
		ctx.drawImage(this,0,0);
		try {
		    var image = ctx.getImageData(0,0,this.width,this.height)
			var data = image.data;
			drawHistogram(data);
		} catch (e) {
			if (!alerted) {
				alert('Exception probably caused by image hosted on another domain. Open image in a new tab and try running script on it. :P');
				alerted = true;
			}
			console.log(e);
		}
		return false;

	};

	var imgs = document.getElementsByTagName('img');

	for (var i = imgs.length;i--; ) {
		imgs[i].onmouseover = encodeImg;
	}

})();