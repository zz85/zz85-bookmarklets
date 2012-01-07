/*
 * We have Web Inspectors (Firebug, Developer Tools, Dragonfly etc)
 * We have WebGL Inspector
 * Shouldn't we have a Three.js Secene Inspector?
 *
 * Want to know how to use this? Visit http://zz85.github.com/zz85-bookmarklets/
 *
 * @author zz85 github.com/zz85 | www.lab4games.net/zz85/blog | twitter.com/blurspline
 */

// javascript:(function(){var script=document.createElement('script');script.type='text/javascript';script.src='js/ThreeInspector.js';document.body.appendChild(script);})()

/*
 * Features + CHANGE LIST HISTORY: 
 *	widget - draggable, snappable, resizable
 *	introspecting scene
 *	auto/guess names
 *	closure
 *	prevent select
 * 	close / minimize widget
 *	improvements to interface and layout
 *	Updating of values into scene graph, YEAH!
 *	Scrubber interface for changing values!!
 *	X-axis scrubber for big value changes!
 *	Disabled x-axis for usabiltiy - maybe use a keyboard shortcut?
 *
 *	TODO
 *	- refresh values
 *	- watch / poll / bind values
 *	- materials
 * 	- geometry / faces / verticles count
 *	- better layout
 * 
 */
(function() {

function scanWindow() {

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
			children = aScene.children;
			
			// console.log('Scene found: ', w, scene );
			
			var ul = document.createElement('ul');
			ul.innerHTML = ' &lt;THREE.Scene&gt; <span class="threeInspectorChildrenBubble">' + children.length + '</span> children';
			
			
			var expander = document.createElement('a');
			expander.innerHTML = '+ <b>' + w + '</b>';
			expander.onclick = expandScene(ul, aScene, w);
			// ul.appendChild(expander);
			ul.insertBefore(expander, ul.firstChild);
						
			var debug = document.createElement('a');
			debug.innerHTML = ' &#191; ';
			debug.onclick = debugObject(aScene);
			ul.appendChild(debug);
			
			// Expand automatically 
			if (children.length<300) {
				expander.onclick();
			}
						
			ThreeInspectorWidget.contents.appendChild(ul);
			
		}
	
	}
	
	// ThreeInspectorWidget.setStatus(sceneNames.length + ' three.js scenes found.');

}

// Function callbacks

function debugObject(obj) {
	return function() {
		console.log(obj);
	};
}

function refreshValues() {
	
}

	
function expandScene(ul, scene, w) {
	
	return function() {
		if (!ul.inspected) {
			// load children
			ul.inspected = true;
			inspectChildren(scene, ul, w);
			return;
		}

		var tags = ul.getElementsByTagName('li');
		
		if (!ul._collapsed) {
			
			for (var i=0,il=tags.length; i<il; i++) {
				tags[i].style.display = 'none';
			}
			
			ul._collapsed = true;
			
		} else {
			
			for (var i=0,il=tags.length; i<il; i++) {
				tags[i].style.display = 'block';
			}
			
			ul._collapsed = false;
		}
		
		
	};
}

function updateNameCallback(nameField, target) {
	return function() {
		target.name = nameField.value;
	};
}



function valueChangeCallback(target, property, view) {
	return function(e) {
		// console.log('value changed!',e, target);
		target[property] = parseFloat(view.value);
	};
}


function createField(object, property) {
	var valueField = document.createElement('input');
	valueField.className = 'threeInspectorValueField';
	valueField.type = 'text';
	valueField.value = object[property];
	
	valueField.onchange = valueChangeCallback(object, property, valueField);
	
	var y, x;
	var downY, downX, downValue, number;
	
	var multiplierY = 0.1;
	var multiplierX = 4;
	
	function onMouseDown(event) {
		// EEKS!
		// event.preventDefault();
		
		y = event.clientY;
		x = event.clientX;
		downY = y;
		downX = x;
		downValue = parseFloat(valueField.value);

		document.addEventListener( 'mousemove',  onMouseMove, false );
		document.addEventListener( 'mouseup',  onMouseUp, false );
		
		return false;
	}

	function onMouseMove(event) {
		// event.preventDefault();
		
		y = event.clientY;
		x = event.clientX;
		
		number = downValue - (y - downY) * multiplierY;
		// + (x - downX) * multiplierX;
		valueField.value = number;
		valueField.onchange();
		//return false;
	}	
	
	function onMouseUp(event) {
		// console.log('mouseup', event);
		document.removeEventListener( 'mousemove',  onMouseMove, false );
		document.removeEventListener( 'mouseup',  onMouseUp, false );
		
		onMouseMove(event);
		// valueField.focus();
		valueField.select();
		
		
	}
	
	valueField.addEventListener('mousedown',  onMouseDown, false);
	
	return valueField;
	
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
				
		var name = child.name; 
		if (!name || name == '') { 
			// to scan global scope for names if not found?
			for (var w in window) {
				if (window[w]==child) {
					child.name = w;
					name = w;
					break;
				}
			}
			
		}
		
		var noOfChildren = '';
		var haveChildren = (child.children && child.children.length>0);
		if (haveChildren) {
			noOfChildren = ' <span class="threeInspectorChildrenBubble">' + child.children.length +'</span> children';
		}
		
		var nameField = document.createElement('input');
		nameField.className = 'threeInspectorNameField';
		nameField.type = 'text';
		nameField.value = name;
		
		nameField.onchange = updateNameCallback(nameField, child);
		
		var li = document.createElement('li');
		li.innerHTML = ' &lt;' + zlass + '&gt; <i>id#' + child.id + '</i>'; // + noOfChildren;
		li.className = 'threeInspectorSceneObject';
		
		var indexText = document.createTextNode( i + ': ');
		li.insertBefore(nameField, li.firstChild);
		li.insertBefore(indexText, li.firstChild);
		// li.appendChild(nameField);
		
		var debug = document.createElement('a');
		debug.innerHTML = ' &#191; ';
		debug.onclick = debugObject(child);
		li.appendChild(debug);
		
		var objectProps = document.createElement('ul');
		
		
		// ThreeInspectorWidget.add('Known THREE Type found: THREE.'+zlass + '<br/>');
		// ThreeInspectorWidget.add('Known THREE super classes: '+subclass.join(',') + '<br/>');
		// THREE.Line ParticleSystems
		var isMesh = (child instanceof THREE.Mesh),
			isLight = (child instanceof THREE.Light),
			isCamera = (child instanceof THREE.Camera),
			isObject = (child instanceof THREE.Object3D),
			isSprite = (child instanceof THREE.Sprite)
			;

		if (isSprite) {
			d = document.createElement('li');
			d.innerHTML = 'rotation: ';
			d.appendChild(createField(child.rotation3d, 'x'));
			d.appendChild(createField(child.rotation3d, 'y'));
			d.appendChild(createField(child.rotation3d, 'z'));
			objectProps.appendChild(d);
		}

		
		if (isObject) {
			
			var d;
			
			// Position
			
			d = document.createElement('li');
			
			d.innerHTML = 'position: ';
			
			var posX = createField(child.position, 'x');
			var posY = createField(child.position, 'y'); //.toFixed(3)
			var posZ = createField(child.position, 'z');
			
			d.appendChild(posX);
			d.appendChild(posY);
			d.appendChild(posZ);

			objectProps.appendChild(d);
			
			// Rotation
			
			if (!isSprite) {
				d = document.createElement('li');
				d.innerHTML = 'rotation: ';
				d.appendChild(createField(child.rotation, 'x'));
				d.appendChild(createField(child.rotation, 'y'));
				d.appendChild(createField(child.rotation, 'z'));
				
				objectProps.appendChild(d);
			}
			
			d = document.createElement('li');
			d.innerHTML = 'scale: &nbsp;&nbsp;&nbsp;';
			d.appendChild(createField(child.scale, 'x'));
			d.appendChild(createField(child.scale, 'y'));
			d.appendChild(createField(child.scale, 'z'));
			
			objectProps.appendChild(d);
						
			// console.log('position', child.position.x, child.position.y, child.position.z);
			// console.log('rotation', child.rotation.x, child.rotation.y, child.rotation.z);
			// console.log('scale', child.scale.x, child.scale.y, child.scale.z);
			// console.log('material', child.material);
			
			// inspectChildren(child);
		}
		
		if (haveChildren) {
			var ul = document.createElement('ul');
			// ul.innerHTML = ;
			
			var expander = document.createElement('a');
			expander.innerHTML = '+' + noOfChildren;
			expander.onclick = expandScene(ul, child, name);
			ul.appendChild(expander);
			// ul.insertBefore(expander, ul.firstChild);
			
			objectProps.appendChild(ul);
		}
		
		
		li.appendChild(objectProps);
		dom.appendChild(li);
		
	}
}

// Windowing Widget experiment

function Widget(title, id) {
	
	var me = this;
	
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
	
	
	var divWidget = document.createElement('div');
	var divWidgetTitle = document.createElement('div');
	var divWidgetContent = document.createElement('div');
	var divWidgetStatus = document.createElement('div');
	
	divWidget.id = id;
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
		
		e.preventDefault();
		
		x = e.clientX;
		y = e.clientY;

		offsetX = e.offsetX || e.layerX;
		offsetY = e.offsetY || e.layerY;

		startTop = divWidget.offsetTop;
		startLeft = divWidget.offsetLeft;

		offsetFromBottom = divWidget.clientHeight - offsetY;
		offsetFromRight = divWidget.clientWidth - offsetX;

		document.addEventListener('mousemove', onMouseMove, false);
		
		return false;
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

		return false;
	}

	function onMouseUp(e) {
		document.removeEventListener('mousemove', onMouseMove, false);
		return false;
	}
	
	// APIs
	
	this.setTitle = function(title) {
		
		divWidgetTitle.innerHTML = title;
		
		var close = document.createElement('a');
		close.innerHTML = ' X ';
		close.onclick = this.close;
		
		var min = document.createElement('a');
		min.innerHTML = ' &ndash; '; //&darr; _ - &oline; &not;  &macr; &mdash; &ndash; ↕↯⇅
		// see http://www.yellowpipe.com/yis/tools/ASCII-HTML-Characters/index.php
		// http://www.yellowpipe.com/yis/tools/ASCII-HTML-Characters/index.php
		min.onclick = this.toggle;
		
		var span = document.createElement('span');
		span.style.cssText = 'padding: 0 10px 0 10px; float: right;';
		
		span.appendChild(min);
		span.appendChild(close);
		
		divWidgetTitle.appendChild(span);
		
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
		divWidgetContent.style.display = 'none';
		divWidgetStatus.style.display = 'none';
		this.isHidden = true;
	};
	
	this.show = function() {
		divWidgetContent.style.display = 'block';
		divWidgetStatus.style.display = 'block';
		this.isHidden = false;
	};
	
	this.toggle = function() {
		if (!me.isHidden) {
			me.hide();
		} else {
			me.show();
		}
	}
	
	this.add = function(content) {
		divWidgetContent.innerHTML += content;
	};
	
	this.close = function() {
		if (me.isClosed) return;
		
		document.body.removeChild(divWidget);
		delete this;
		
		me.isClosed = true;
	}
	
	document.body.appendChild(divWidget);
	
	this.contents = divWidgetContent;
	this.div = divWidget;
	
	title = (title == undefined) ? 'Untitled' : title;
	this.setTitle(title);
	
	return this;
	
}

// Main entry

var styles = '\
	#threeInspectorWidget {\
		cursor:default;\
	}\
	#threeInspectorWidget a {\
		text-decoration: none;\
		cursor:pointer;\
	}\
	#threeInspectorWidget ul {\
		list-style: none; padding-left: 10px;\
		padding-top:0; }\
	#threeInspectorWidget li {\
		padding-left: 10px;\
		padding-top:0;\
		padding-bottom: 0\
	}\
	\
	.threeInspectorChildrenBubble {\
		border-radius: 4px;\
		background-color: rgba(100, 100, 100, 0.8);\
		color: rgb(220, 220,220);\
		padding: 0 3px 0 3px;\
	}\
	.threeInspectorNameField {\
		\
		font-weight: bold;\
		padding: 0 4px 0 4px;\
		background:transparent;\
		resize:none;\
		border: 0;\
		width: 50px;\
		border-bottom: 1px dotted #bbb;\
	}\
	.threeInspectorNameField:hover {\
		\
		border-bottom: 1px dotted grey;\
	}\
	.threeInspectorValueField {\
		border-radius: 4px;\
		background-color: rgba(244, 100, 200, 0.8);\
		color: rgb(220, 220,220);\
		padding: 0 3px 0 3px;\
		margin: 0 3px 0 3px;\
		resize:none;\
		border: 0;\
		width: 50px;\
		cursor:row-resize;\
	}\
	#threeInspectorWidget input:focus {\
		outline: none;\
	}\
	\
	#threeInspectorWidget li.threeInspectorSceneObject {\
		padding-top: 6px;\
	}\
	\
';



var style = document.createElement('style');
style.innerHTML = styles;
document.body.appendChild(style);

if (window.ThreeInspectorWidget) {
	window.ThreeInspectorWidget.close();
}
window.ThreeInspectorWidget = new Widget('Three.js Scene Insepector', 'threeInspectorWidget');
// TODO destory ThreeInspector correctly.

scanWindow();

})();