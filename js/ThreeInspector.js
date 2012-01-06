/*
 * We have Web Inspectors (Firebug, Developer Tools, Dragonfly etc)
 * We have WebGL Inspector
 * Shouldn't we have a Three.js Secene Inspector?
 *
 * @author zz85 github.com/zz85 | www.lab4games.net/zz85/blog | twitter.com/blurspline
 */

// javascript:(function(){var script=document.createElement('script');script.type='text/javascript';script.src='js/ThreeInspector.js';document.body.appendChild(script);})()

function pollWindow() {

	if (typeof(THREE) == 'undefined') {
		ThreeInspectorWidget.setStatus('Three.js not found.');
		ThreeInspectorWidget.add('Three.js not found.');
		return;
	}

	var sceneGraph;
	
	var sceneNames = [];
	var sceneReferences = [];
	var aScene, children;


	for (var w in window) {
		// Search for scenes
		
		if (window[w] instanceof THREE.Scene) {
			
			sceneNames.push(w);
			aScene = window[w];
			sceneReferences.push(aScene);
			children = scene.children;
			
			// console.log('Scene found: ', w, scene );
			
			var ul = document.createElement('ul');
			ul.innerHTML = '<a href="#" onclick="return false;">+ <b>' + w + '</b></a> &lt;THREE.Scene&gt; [' + children.length + ' children]';
			ul.style.cssText = 'padding: 5px; margin-left: 0;';
			ul.onclick = expandScene(ul, aScene, w);
						
			ThreeInspectorWidget.contents.appendChild(ul);
			
		}
	
	}
	
	
	ThreeInspectorWidget.setStatus(sceneNames.length + ' three.js scenes found.');
	//inspectChildren(scene);

}

	
function expandScene(ul, scene, w) {
	
	return function() {
		if (!ul.inspected) {
			ul.inspected = true;
			inspectChildren(scene, ul, w);
		}
	};
}

function inspectChildren(scene, dom, variable) {
	
	var i,il;
	
	var children = scene.children, child;
	
	for (i=0, il=children.length;i<il;i++) {
		
		child = children[i];
		
		
		var zlass, subclass = [];
		
		for (var t in THREE) {
			if (child.constructor === THREE[t]) {
				zlass = 'THREE.' + t;
			}
			
			if (typeof(THREE[t]) == 'function' && child instanceof THREE[t]) {
				subclass.push('THREE.' + t);
			}
		}
		
		if (!zlass) {
			if (subclass.length>0) 
				zlass = subclass[subclass.length-1];
			else
				zlass = 'unknown type';
		} 
				
		var name = child.name; // to scan global scope for name if not found?
		var noOfChildren = '';
		var haveChildren = (child.children && child.children.length>0);
		if (haveChildren) {
			noOfChildren = ' [' + child.children.length +' children]';
		}
		
		var li = document.createElement('li');
		li.innerHTML = '<br/>' + i + ': ' + '<b>' + name +'</b>' +
			' &lt;' + zlass + '&gt; <i>id#' + child.id + '</i>' + noOfChildren;

		
		// ThreeInspectorWidget.add('Known THREE Type found: THREE.'+zlass + '<br/>');
		// ThreeInspectorWidget.add('Known THREE super classes: '+subclass.join(',') + '<br/>');
		// THREE.Line ParticleSystems
		var isMesh = (child instanceof THREE.Mesh),
			isLight = (child instanceof THREE.Light),
			isCamera = (child instanceof THREE.Camera),
			isObject = (child instanceof THREE.Object3D)
			;
		
		// ThreeInspectorWidget.add('mesh: ' + isMesh + ' light:' + isLight + 'camera: ' + isCamera);
		// console.log('child has children?' + child.children.length + " ??" + isObject , typeof(child.children));
		
		if (isObject) {
			
			var d;
			d = document.createElement('div');
			d.innerHTML = 'position: ('+ child.position.x.toFixed(3)+', '+
				child.position.y.toFixed(3)+', '+ child.position.z.toFixed(3) +')';
			li.appendChild(d);
			
			d = document.createElement('div');
			d.innerHTML = 'rotation: ('+ child.rotation.x.toFixed(3)+', '+
				child.rotation.y.toFixed(3)+', '+ child.rotation.z.toFixed(3) +')';
			li.appendChild(d);
			
			d = document.createElement('div');
			d.innerHTML = 'scale: ('+ child.scale.x.toFixed(3)+', '+
				child.scale.y.toFixed(3)+', '+ child.scale.z.toFixed(3) +')';
			li.appendChild(d);
			
			if (haveChildren) {
				var ul = document.createElement('ul');
				ul.innerHTML = '<a href="#" onclick="return false;">+</a>';
				ul.style.cssText = 'padding-left: 10px;margin: 0; ';
				ul.onclick = expandScene(ul, child, name);

				li.appendChild(ul);
			}
			
			// console.log('position', child.position.x, child.position.y, child.position.z);
			// console.log('rotation', child.rotation.x, child.rotation.y, child.rotation.z);
			// console.log('scale', child.scale.x, child.scale.y, child.scale.z);
			// console.log('material', child.material);
			
			// inspectChildren(child);
		}
		
		dom.appendChild(li);
		
	}
}

//http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript

function Widget(title) {
	
	var cssWidget = 
		'border: 1px solid rgba(100,100,100,0.5);\
		position: fixed;\
		top: 100px;\
		left: 190px;\
		font-family:monospace;\
		font-size: 12px;\
		background-color: rgba(255,255,255,0.65);\
		text-align: center;\
		z-index: 1985;';
	
	var cssWidgetTitle = 
		'background-color: grey;\
		font-weight: bold;\
		background: -moz-linear-gradient(top, #fff 0%, #ddd 100%);\
		background-image: -webkit-gradient(linear, 0% 0%, 0% 100%, from(#fff), to(#ddd));\
		cursor: move;\
		padding: 2px 12px 2px 12px;';
		
	var cssWidgetContent =
		'padding: 2px 10px 2px 10px;\
		text-align: left;\
		overflow: auto;\
		resize: both; \
		left: 0;\
		right: 0;\
		min-width: 200px;\
		min-height: 100px;\
		width: 480px;\
		height: 260px;';
	
	var cssWidgetStatus = 
		'position: absolute;\
		float: right;\
		background-color: #eee;\
		opacity: 0.8;\
		bottom: 0;\
		right: 30;\
		padding: 2px 15px 2px 15px;';
	
	
	var styles = 'ul { list-style: none; padding-left: 10px }';
	
	var style = document.createElement('style');
	style.innerHTML = styles;
	document.body.appendChild(style);
	
	
	var divWidget = document.createElement('div');
	var divWidgetTitle = document.createElement('div');
	var divWidgetContent = document.createElement('div');
	var divWidgetStatus = document.createElement('div');
	
	divWidget.style.cssText = cssWidget;
	divWidgetTitle.style.cssText = cssWidgetTitle;
	divWidgetContent.style.cssText = cssWidgetContent;
	divWidgetStatus.style.cssText = cssWidgetStatus;

	divWidget.appendChild(divWidgetTitle);
	divWidget.appendChild(divWidgetContent);
	divWidget.appendChild(divWidgetStatus);
	
	// Event listeners
	divWidgetTitle.addEventListener('mousedown', onMouseDown, false);
	divWidgetTitle.addEventListener('mouseup', onMouseUp, false);

	var snapDistance = 15;
	
	var currentLeft = 0, currentTop = 0;
	var x, y, offsetX, offsetY;

	var startTop, startLeft;
	var offsetFromBottom, offsetFromRight;

	function onMouseDown(e) {
		
		x = e.clientX;
		y = e.clientY;

		offsetX = e.offsetX || e.layerX;
		offsetY = e.offsetY || e.layerY;

		startTop = divWidget.offsetTop;
		startLeft = divWidget.offsetLeft;

		offsetFromBottom = divWidget.clientHeight - offsetY;
		offsetFromRight = divWidget.clientWidth - offsetX;

		document.addEventListener('mousemove', onMouseMove, false);
	}

	function onMouseMove(e) {
		
		// Snap to edge
		if (Math.abs(e.clientY - offsetY) < snapDistance) {
			currentTop = 0;
		} else if (Math.abs(e.clientY + offsetFromBottom - window.innerHeight)  < snapDistance) {
			currentTop = window.innerHeight - divWidget.clientHeight;
		} else {
		 	currentTop = startTop + (e.clientY  - y)
		}

		if (Math.abs(e.clientX - offsetX) < snapDistance) {
			currentLeft = 0;
		} else if (Math.abs(e.clientX + offsetFromRight - window.innerWidth)  < snapDistance) {
			currentLeft = window.innerWidth - divWidget.clientWidth;
		} else {
			currentLeft = startLeft + (e.clientX  - x)
		}


		divWidget.style.left = currentLeft + 'px';
		divWidget.style.top = currentTop + 'px';


	}

	function onMouseUp(e) {
		document.removeEventListener('mousemove', onMouseMove, false);
	}
	
	// APIs
	
	this.setTitle = function(title) {
		divWidgetTitle.innerHTML = title;
	};
	
	this.setStatus = function(status) {
		divWidgetStatus.innerHTML = status;
	};
	
	this.setContent = function(content) {
		divWidgetContent.innerHTML = content;
	};
	
	this.setSize = function(width, height) {
		divWidgetContent.style.width = width + 'px';
		divWidgetContent.style.height = height + 'px';	
	};
	
	this.setPosition = function (x, y) {
		divWidget.style.left = x + 'px';
		divWidget.style.top = y + 'px';
	};
	
	this.hide = function() {
		divWidgetContents.style.display = 'none';
	};
	
	this.show = function() {
		divWidgetContents.style.display = 'block';
	};
	
	this.add = function(content) {
		divWidgetContent.innerHTML += content;
	};
	
	document.body.appendChild(divWidget);
	
	this.contents = divWidgetContent;
	
	title = (title == undefined) ? 'Untitled' : title;
	this.setTitle(title);
	
	return this;
	
}

var ThreeInspectorWidget = new Widget('Three.js Scene Insepector');

pollWindow();