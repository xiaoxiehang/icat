(function(iCat){
	
	// 创建Event命名空间
	iCat.namespace('Event');

	function _matches(el, selector){
		var docElem = document.documentElement,
			match = docElem.matchesSelector || docElem.mozMatchesSelector || docElem.webkitMatchesSelector ||
				docElem.oMatchesSelector || docElem.msMatchesSelector;
		return match.call(el,selector);
	}

	function _parentIfText(node){
		return 'tagName' in node ? node : node.parentNode;
	}

	// 创建Observer类
	iCat.Class('Observer', {
		Create: function(pageid){
			this.selectors = [];
			this.events = {};
			this.pageid = pageid;
		},

		/*
		 * argus可以是<b>单个对象</b>或<b>对象数组</b>
		 * o = {el:'.cla', eType:'click', callback: function(){}, stopDefault: true, stopBubble:false}
		 */
		subscribe: function(o){
			var self = this;
			if(!o) return self;

			o = iCat.isArray(o)? o : [o];
			iCat.foreach(o, function(i,v){
				if(!self.selectors.hasItem(v.el))
					self.selectors.push(v.el);

				var key = v.el.trim()+'|'+(v.stopDefault? 1:0)+'|'+(v.stopBubble? 1:0),
					eType = v.eType.trim();

				switch(eType) {
					case 'click':
						eType = 'tap';
						break;
					case 'longClick':
						eType = 'longTap';
						break;
					case 'doubleClick':
						eType = 'doubleTap';
						break;
					case 'singleClick':
						eType = 'singleTap';
						break;
					case 'moving':
						eType = 'swiping';
						break;
				}

				if(!self.events[eType])
					self.events[eType] = {}; //{'click':{}, 'longTap':{}}

				if(!self.events[eType][key])
					self.events[eType][key] = v.callback; // {'click':{'li|0|1':function, '.test a|1|1':function}, 'longTap':{}}
			});

			return self;
		},

		unsubscribe: function(key){
			var self = this;
			if(!key){
				self.events = {};
			} else {
				key = iCat.isArray(key)? key : [key];
				key.forEach(function(v){
					if(v.indexOf('|')>0){
						v = v.split('|');
						delete self.events[v[1].trim()][v[0].trim()];
					} else {
						delete self.events[v.trim()];
					}
				});
			}

			return self;
		},

		execute: function(eType, el, argus){
			var self = this, key,
				cbs = self.events[eType];
			if(!cbs) return;

			for(key in cbs){
				var k = key.split('|'),
					iamhere = false;
				(function(node, cb){
					if(_matches(node, k[0])){
						cb.apply(node, argus);
						if(k[1]==0)//值为0，不阻止默认事件
							iCat.Event.triggerEvent(node, 'click', false, true);
						iamhere = true;
					} else {
						if(node.parentNode!==doc.body){
							arguments.callee(node.parentNode, cb);
						}
					}
				})(el, cbs[key]);
				
				if(iamhere && k[2]==1)//值为1，阻止冒泡
					return;
			}
		},

		setCurrent: function(){
			iCat.__OBSERVER_PAGEID = this.pageid;
			return this;
		},

		on: function(selector, eType, callback, stopDefault, stopBubble){
			return this.subscribe({
				el: selector,
				eType: eType,
				callback: callback,
				stopDefault: stopDefault,
				stopBubble: stopBubble
			});
		},

		off: function(selector, eType){
			return this.unsubscribe(selector+'|'+eType);
		}
	});

	// iCat创建观察者
	iCat.obsCreate = function(pid){
		if(!iCat.obsCreate[pid])
			iCat.obsCreate[pid] = new Observer(pid);
		return iCat.obsCreate[pid];
	};

	// iCat删除观察者
	iCat.obsDestroy = function(pid){
		iCat.obsCreate[pid] = null;
		iCat.__OBSERVER_PAGEID = '__PAGE_EVENT';
	};

	// 默认观察者
	var Event = iCat.Event = iCat.obsCreate('__PAGE_EVENT'),
		doc = document;
	iCat.mix(Event, {
		preventDefault: function(evt){
			if(evt && evt.preventDefault)
				evt.preventDefault();
			else
				window.event.returnValue = false;
		},

		stopPropagation: function(evt){
			if(window.event){
				window.event.cancelBubble = true;
			} else {
				evt.stopPropagation();
			}
		},

		bindEvent: function(el, eType, handler){
			if(el.addEventListener){
				el.addEventListener(eType, handler, false);
			} else if(el.attachEvent){
				el.attachEvent('on'+eType, handler);
			} else {
				el['on'+type] = handler;
			}
		},

		removeEvent: function(el, eType, handler){
			if(el.removeEventListener){
				el.removeEventListener(eType, handler, false);
			} else if(el.detachEvent){
				el.detachEvent('on'+eType, handler);
			} else {
				el['on'+type] = null;
			}
		},

		triggerEvent: function(element, type, bubbles, cancelable){
			if(doc.createEventObject){
				var evt = doc.createEventObject();
				element.fireEvent('on'+type, evt);
			} else {
				var ev = doc.createEvent('Event');
				ev.initEvent(type, bubbles, cancelable);
				element.dispatchEvent(ev);
			}
		},

		ready: function(){
			var _fn = [];
			var _do = function(){
				if(!arguments.callee.done){
					arguments.callee.done = true;
					for(var i=0; i<_fn.length; i++){
						_fn[i]();
					}
				}
			};

			if(doc.addEventListener){
				doc.addEventListener('DOMContentLoaded', _do, false);
			}

			if(iCat.browser.msie){
				(function(){
					try{
						doc.documentElement.doScroll('left');
					} catch(e) {
						setTimeout(arguments.callee, 50);
						return;
					}
					doc.onreadystatechange = function(){
						if(doc.readyState==='complete'){
							doc.onreadystatechange = null;
							_do();
						}
					};
				})();
			}

			if(iCat.browser.webkit && doc.readyState){
				(function(){
					if(doc.readyState!=='loading'){
						_do();
					} else {
						setTimeout(arguments.callee, 10);
					}
				})();
			}

			window.onload = _do;

			return function(fn){
				if(iCat.isFunction(fn)){
					_fn[_fn.length] = fn;
				}
				return fn;
			};
		}()
	});

	// 所有事件的实现都绑定在body上
	(function(){
		var touch = {}, touchTimeout,
			supportTouch = 'ontouchstart' in window;

		var start_evt = supportTouch ? 'touchstart' : 'mousedown',
			move_evt = supportTouch ? 'touchmove' : 'mousemove',
			end_evt = supportTouch ? 'touchend' : 'mouseup',
			cancel_evt = 'touchcancel';

		// common functions
		function swipeDirection(x1, x2, y1, y2){
			var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2);
			return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
		}

		var longTapDelay = 750, longTapTimeout;
		function cancelLongTap(){
			if(longTapTimeout)
				clearTimeout(longTapTimeout);
			longTapTimeout = null;
		}

		Event.ready(function(){

			if(!iCat.__OBSERVER_PAGEID || iCat.obsCreate[iCat.__OBSERVER_PAGEID]==null) iCat.__OBSERVER_PAGEID = '__PAGE_EVENT';
			
			var bodyNode = doc.querySelector('*[data-pagerole=body]'),
				now, delta;
			if(!bodyNode) return;

			// start
			Event.bindEvent(bodyNode, start_evt, function(evt){
				Event.preventDefault(evt);
				Event.stopPropagation(evt);
				var objObs = iCat.obsCreate[iCat.__OBSERVER_PAGEID];
				evt = supportTouch? evt.touches[0] : evt;
				now = Date.now();
				delta = now - (touch.last || now);
				touch.el = _parentIfText(evt.target);
				touchTimeout && clearTimeout(touchTimeout);

				touch.x1 = evt.pageX;
				touch.y1 = evt.pageY;

				if(delta>0 && delta<=250) touch.isDoubleTap = true;
				touch.last = now;
				longTapTimeout = setTimeout(function(){
						longTapTimeout = null;
						if(touch.last){
							objObs.execute('longTap', touch.el);
							touch = {};
						}
					}, longTapDelay);
			});

			// doing
			Event.bindEvent(bodyNode, move_evt, function(evt){
				Event.preventDefault(evt);
				Event.stopPropagation(evt);
				cancelLongTap();
				var objObs = iCat.obsCreate[iCat.__OBSERVER_PAGEID];

				evt = supportTouch? evt.touches[0] : evt;
				touch.x2 = evt.pageX;
				touch.y2 = evt.pageY;
				objObs.execute('moving', touch.el, [touch.x1, touch.x2, touch.y1, touch.y2]);
			});

			// end
			Event.bindEvent(bodyNode, end_evt, function(evt){
				Event.preventDefault(evt);
				Event.stopPropagation(evt);
				cancelLongTap();
				var objObs = iCat.obsCreate[iCat.__OBSERVER_PAGEID];

				// double tap (tapped twice within 250ms)
				if(touch.isDoubleTap){
					objObs.execute('doubleTap', touch.el);
					touch = {};
				} else if('last' in touch) {
					objObs.execute('tap', touch.el);

					touchTimeout = setTimeout(function(){
						touchTimeout = null;
						objObs.execute('singleTap', touch.el);
						touch = {};
					}, 250);
				} else if((touch.x2&&Math.abs(touch.x1-touch.x2)>30) || (touch.y2&&Math.abs(touch.y1-touch.y2)>30)){
					var swipe = 'swipe' + swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2);
					objObs.execute(swipe, touch.el);
					objObs.execute(swipe, touch.el);
					touch = {};
				}
			});

			// cancel
			Event.bindEvent(bodyNode, cancel_evt, function(evt){
				Event.preventDefault(evt);
				Event.stopPropagation(evt);

				if(touchTimeout) clearTimeout(touchTimeout);
				if(longTapTimeout) clearTimeout(longTapTimeout);
				longTapTimeout = touchTimeout = null;
				touch = {};
			});

			// Stops the default click event
			Event.bindEvent(bodyNode, 'click', function(evt){
				var objObs = iCat.obsCreate[iCat.__OBSERVER_PAGEID],
					el = _parentIfText(evt.target),
					selectors = objObs.selectors;
				if(!el || el==doc.body) return;

				for(var i=0; i<selectors.length; i++){
					(function(){
						if(_matches(el, selectors[i])){
							Event.preventDefault(evt);
							Event.stopPropagation(evt);
						} else {
							if(el.parentNode!==doc.body){
								el = el.parentNode;
								arguments.callee();
							}
						}
					})();
				}
			});
		});
	})();
})(ICAT);