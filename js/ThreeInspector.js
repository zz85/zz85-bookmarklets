/*
 * We have Web Inspectors (Firebug, Developer Tools, Dragonfly etc)
 * We have WebGL Inspector
 * Shouldn't we have a Three.js Inspector
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
 *	("smart" expansion + debug to console ++)
 *	Updating of values into scene graph, YEAH!
 *	Scrubber interface for changing values!!
 *	X-axis scrubber for big value changes!
 *	Disabled x-axis for some usabiltiy - maybe use a keyboard shortcut?
 *	added toggle autorefresh values
 *	added maxwait of 10 seconds
 *	Title typo correction by @mrdoob
 *	Add rescan Scenes
 *
 *	TODO
 *	- poll/bind add/remove changes?
 *	- materials editor
 *	- geometry editor
 *	- shape editor
 * 	- Stats: geometry / faces / vertices count
 *	- create a properties side window? - and move inspecting properties into it?
 *	- integrate gui + director.js
 *	- color picker for lights, materials
 *	- create interactive examples for three.js
 */

(function() {


var autoUpdateDiv;

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

	autoUpdateDiv = document.createElement('span');
	autoUpdateDiv.innerHTML = 'Auto-Refresh Values: <a class="threeInspectorChildrenBubble">ON</a>. ';
	autoUpdateDiv.onclick = autoRefresh;
	
	ThreeInspectorWidget.contents.appendChild(autoUpdateDiv);
	
	var divRescan = document.createElement('span');
	divRescan.innerHTML = '| <a>Rescan All Scenes</a>'; // RELOAD ALL SCENES
	divRescan.onclick = ThreeInspector.start;
	
	ThreeInspectorWidget.contents.appendChild(divRescan);
	

	for (var w in window) {
		// Search for scenes
		
		if (window[w] instanceof THREE.Scene) {
			
			sceneNames.push(w);
			aScene = window[w];
			sceneReferences.push(aScene);
			children = aScene.children;
						
			var ul = document.createElement('ul');
			ul.innerHTML = ' &lt;THREE.Scene&gt; <span class="threeInspectorChildrenBubble">' + children.length + '</span> children';
			
			
			var expander = document.createElement('a');
			expander.innerHTML = '+ <b>' + w + '</b>';
			expander.onclick = expandScene(ul, aScene, w);
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

var watchBindings = [];
var autoRefreshing;

function registerBindings(target, property, view) {
	watchBindings.push({target:target, property:property, view:view});
}

function refreshValues() {
	var c = 0, start = Date.now();

	// console.log('refresh!');
	
	var target, property, view, subscription, value;
	for (var i=0, il=watchBindings.length;i<il;i++) {
		subscription = watchBindings[i];
		target = subscription.target;
		property = subscription.property;
		view = subscription.view;
		
		value = target[property];

		if (value!=view.value) {
			view.value = value;
			// c++;
		}
		
	}
	// console.log('refreshed!',c, Date.now() - start);
}

function autoRefresh() {
	if (autoRefreshing) {
		clearInterval(autoRefreshing);
		autoRefreshing = null;
		autoUpdateDiv.innerHTML = 'Auto-Refresh Values: <a class="threeInspectorChildrenBubble">OFF</a> ';
		
	} else {
		autoRefreshing = setInterval(refreshValues, 300);
		autoUpdateDiv.innerHTML = 'Auto-Refresh Values: <a class="threeInspectorChildrenBubble">ON</a> ';
	}	
}
	
function expandScene(ul, scene, w) {
	
	return function() {
		if (!ul._inspected) {
			// load children
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
	
	registerBindings(object, property, valueField);
	
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
	var maxWait = 10 * 1000; // 10 seconds wait
	
	var children = scene.children, child;
	
	var startTime = Date.now();
	
	if (!dom._lastInspected) {
		dom._lastInspected = 0;
	}
	
	for (i=dom._lastInspected, il=children.length;i<il;i++) {
		
		if ((Date.now()-startTime)>maxWait) {
			// We break out of loops if the wait is too long for ultra long lists.
			dom._lastInspected = i;
			// TODO, add a continue button or signal
			// Then again, probably we should only "inspect" items being clicked on for best performance
			return;
		}
		
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
			// Perhaps we could use the auto generated ID as name
			
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
			
		var d;
					
		if (isSprite) {
			d = document.createElement('li');
			d.innerHTML = 'rotation:';
			d.appendChild(createField(child, 'rotation'));
			objectProps.appendChild(d);
			
			d = document.createElement('li');
			d.innerHTML = 'rotation3d:';
			d.appendChild(createField(child.rotation3d, 'x'));
			d.appendChild(createField(child.rotation3d, 'y'));
			d.appendChild(createField(child.rotation3d, 'z'));
			
			objectProps.appendChild(d);
		}
		
		if (child.opacity !== undefined) {
			d = document.createElement('li');
			d.innerHTML = 'opacity: &nbsp;';
			d.appendChild(createField(child, 'opacity'));
			objectProps.appendChild(d);
		}

		
		if (isObject) {
			
			// Position
			
			d = document.createElement('li');
			
			d.innerHTML = 'position: ';
			
			var posX = createField(child.position, 'x');
			var posY = createField(child.position, 'y');
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
			// console.log('material', child.material);

		}
		
		if (haveChildren) {
			var ul = document.createElement('ul');
			
			var expander = document.createElement('a');
			expander.innerHTML = '+' + noOfChildren;
			expander.onclick = expandScene(ul, child, name);
			ul.appendChild(expander);
			
			objectProps.appendChild(ul);
		}
		
		
		li.appendChild(objectProps);
		dom.appendChild(li);
		
	}
	
	dom._inspected = true;
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
		min.innerHTML = ' &ndash; ';
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

var ThreeInspector = {}, ThreeInspectorWidget;

ThreeInspector.start = function() {
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

	// Destory previous copy of ThreeInspector.
	if (window.ThreeInspector) {
		window.ThreeInspector.destory();
	}
	
	ThreeInspectorWidget = new Widget('Three.js Scene Inspector', 'threeInspectorWidget');
	scanWindow();
	autoRefresh();
	
	// Inject this copy into window.ThreeInspector namespace
	window.ThreeInspector = ThreeInspector;
	
};

//  Destory ThreeInspector. Stop timers. Close widgets.
ThreeInspector.destory = function() {
	ThreeInspectorWidget.close();
	if (autoRefreshing) {
		clearInterval(autoRefreshing);
		autoRefreshing = null;
	}
}


ThreeInspector.start();

})();