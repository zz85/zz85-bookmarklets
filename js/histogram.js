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
	var scaleFunc = percentileMax;

	function setupHistogram() {

		if (hist) return;
		hist = document.createElement('canvas');
		hist.style.cssText = 'position:fixed; z-index: 8888; left: 5px; top: 5px; cursor: pointer;';
		ctx_hist = hist.getContext('2d');

		hist.width = 256;
		hist.height = 100;

		ctx_hist.globalCompositeOperation = 'lighter';

		hist.onclick = function() {
			paint_color = !paint_color;
			if (lastData) drawHistogram(lastData);
		}

		hist.ondblclick = () => {
			scaleFunc = scaleFunc == getMax ? percentileMax : getMax;
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

		var stats_r = new Array(256).fill(0);
		var stats_g = new Array(256).fill(0);
		var stats_b = new Array(256).fill(0);
		var stats_l = new Array(256).fill(0);

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

		var maxpixels = scaleFunc(stats_l)

		if (paint_color) {
			// var maxpixels = Math.max(percentileMax(stats_r), percentileMax(stats_g), percentileMax(stats_b))
			var maxpixels = scaleFunc(stats_r.concat(stats_g).concat(stats_b))
			paint('red', stats_r, maxpixels);
			paint('green', stats_g, maxpixels);
			paint('blue', stats_b, maxpixels);
			// individual scaling
			// paint('red', stats_r, percentileMax(stats_r));
			// paint('green', stats_g, percentileMax(stats_g));
			// paint('blue', stats_b, percentileMax(stats_b));
		} else {
			paint('grey', stats_l, maxpixels);
		}

	}

	// max pixels
	function getMax(array) {
		return Math.max(...array);
	}

	// average
	function percentileMax(array) {
		var sorted = array.slice();
		sorted.sort((a, b) => a - b);
		// TM99
		const percentile = 1; // 0.99
		const cutoff = array.length * percentile | 0;
		var avg = sorted.slice(0, cutoff).reduce((sum, current) => {
			return sum + current;
		}, 0);
		// magic number seems to be between 2 and 4 for avg scaling
		var maxpixels = avg * 3.75 / cutoff / percentile;
		return maxpixels
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

	var canvas = document.createElement('canvas');

	var encodeImg = function(e) {
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

	var videos = [...document.querySelectorAll('video')];
	var v = videos[0];
	if (v) {
		canvas.setAttribute('width', v.videoWidth);
		canvas.setAttribute('height', v.videoHeight);
		var ctx = canvas.getContext('2d');

		v.ontimeupdate = () => {
			try {
				ctx.drawImage(v,0,0);
				var image = ctx.getImageData(0,0,canvas.width,canvas.height)
				var data = image.data;
				drawHistogram(data);
			} catch (e) {
				console.error(e);
			}
		}
	}
})();