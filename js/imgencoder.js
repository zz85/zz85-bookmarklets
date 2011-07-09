(function(){

	var encodeImg = function(e) {
		var canvas = document.createElement('canvas');
		canvas.setAttribute('width', this.width);
		canvas.setAttribute('height', this.height);

		var ctx = canvas.getContext('2d');
		ctx.drawImage(this,0,0);
		try {
		    var png = canvas.toDataURL(); // try "image/jpeg"
	    	prompt('Here\'s the encoded image string :)\n\nloves,\nzz85' ,png); // print png.length if you want size of string
		} catch (e) {
			alert('Exception probably caused by image hosted on another domain. Open image in a new tab and try running script on it. :P');
		}
		return false;

	};

	var imgs = document.getElementsByTagName('img');

	for (var i = imgs.length;i--; ) {
		imgs[i].onclick = encodeImg;
	}
	
})();