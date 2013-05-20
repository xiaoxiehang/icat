/* event.js # */
(function(iCat, root, doc){

	/* 本模块公用方法 */
	iCat.util({
		parentIfText: function(node){
			return 'tagName' in node ? node : node.parentNode;
		},

		bubble: function(node, cb){
			if(!node) return;
			while(node!==doc.body){
				if(cb && iCat.isFunction(cb)){
					if(cb(node)==false) break;
				}
				node = node.parentNode;
			}
		}
	});

	// 创建Event命名空间
	var Event = iCat.namespace('Event');

	iCat.mix(Event, {
		_bindEvent: function(el, type, handler){
			el.events = el.events || {};
			el.types = el.types || [];
			el.events[type] = function(evt){
				evt = evt || window.event;
				evt.target = evt.target || evt.srcElement;
				evt.preventDefault = evt.preventDefault || function(){evt.returnValue = false;};
				evt.stopPropagation = evt.stopPropagation || function(){evt.cancelBubble = true;};
				handler(evt);
			};

			//绑定同el的同type事件，请用type.xxx方式
			!el.types.contains(type) && el.types.push(type);

			if(el.addEventListener)
				el.addEventListener(type.replace(/\..*/g, ''), el.events[type], false);
		},

		_unbindEvent: function(el, type){
			if(!el.events || !el.types.contains(type)) return;
			
			var handler = el.events[type];
				type = type.replace(/\..*/g, '');
			if(el.removeEventListener)
				el.removeEventListener(type, handler, false);

			if(iCat.isEmptyObject(el.events) || !el.types.length){
				el.events = null;
				el.types = null;
			}
		},

		_execute: function(eType, el, argus){
			iCat.util.bubble(el, function(node, index){
				index = iCat.util.matches(node, Event.__event_selectors);
				var _stopBubble = false;
				if(iCat.isNumber(index)){
					var el = Event.items[Event.__event_selectors[index]];
					eType = eType.replace(/click|tap/gi, 'tap').replace(/moving|swiping/gi, 'swiping');
					if(el.types.contains(eType)){
						iCat.foreach(el.events, function(k, v){
							k = k.replace(/\.\w+/g, '').split('|');
							if(k[0]==eType){
								if(eType=='hover'){
									v[argus].apply(node);
								} else { v.apply(node, argus); }
							}
							if(k[1]==0){//preventDefault - false
								Event.trigger(node, 'click', false, true);
							}
							if(k[2]==1){//stopPropagation - true
								_stopBubble = true;
								return false;
							}
						});
					}
				}
				if(_stopBubble) return false;
			});
		},

		bind: function(el, type, handler){
			if(!el) return;
			el = iCat.util.queryAll(el);
			if(iCat.isjQueryObject(el)){//兼容jquery
				el.bind? el.bind(type, handler) :
							arguments.callee(iCat.util.queryAll(el.selector), type, handler);
			} else {
				el.length===undefined ?
					Event._bindEvent(el, type, handler)
					:
					iCat.foreach(el, function(i,v){
						Event._bindEvent(v, type, handler);
					});
			}
		},

		unbind: function(el, type){
			if(!el) return;
			el = iCat.util.queryAll(el);
			if(iCat.isjQueryObject(el)){//兼容jquery
				el.unbind? el.unbind(type) :
							arguments.callee(iCat.util.queryAll(el.selector), type);
			} else {
				el.length===undefined ?
					Event._unbindEvent(el, type)
					:
					iCat.foreach(el, function(i,v){
						Event._unbindEvent(v, type);
					});
			}
		},

		trigger: function(el, type, bubbles, cancelable){

			if(iCat.isObject(el) && !iCat.isjQueryObject(el)){// 普通对象
				el[type] && el[type].apply(el, bubbles);
				return;
			}

			if(iCat.isjQueryObject(el)) {// jquery对象
				if(el.trigger){
					el.trigger(type);
					return;
				} else
					el = el.get(0);
			}

			if(/\:dg$/i.test(type)){// 事件代理
				type = type.replace(/\:dg$/i, '');
				el = iCat.util.queryOne(el);
				Event._execute(type, el);
			}  else { // 普通元素
				if(!doc.createEvent) return;
				var ev = doc.createEvent('Event');
				ev.initEvent(type, bubbles, cancelable);
				el.dispatchEvent(ev);
			}
		},

		ready: function(){
			var _fn = [],
				_do = function(){
					if(!arguments.callee.done){
						arguments.callee.done = true;
						for(var i=0; i<_fn.length; i++){
							_fn[i]();
						}
					}
				};

			if(doc.readyState){
				(function(){
					if(doc.readyState!=='loading'){
						_do();
					} else {
						setTimeout(arguments.callee, 10);
					}
				})();
			}

			return function(fn){
				if(iCat.isFunction(fn)){
					_fn[_fn.length] = fn;
				}
				return fn;
			};
		}(),

		//存放代理元素的选择器
		__event_selectors: [],

		/*
		 * o可以是<b>单个对象</b>或<b>对象数组</b>
		 * o = {selector:'.cla', type:'click', callback:function(){}, preventDefault:true, stopPropagation:false}
		 * disabled是否不起作用
		 */
		delegate: function(o, disabled){
			if(!o || iCat.isEmptyObject(o) || o==[]) return;
			var arrSele = Event.__event_selectors;
			var objItem = Event.items = Event.items || {};

			if(iCat.isObject(o)){
				if(!arrSele.contains(o.selector) && !disabled) arrSele.push(o.selector);
				o.type = o.type.replace(/click|tap/gi, 'tap').replace(/moving|swiping/gi, 'swiping');

				var el = objItem[o.selector] = objItem[o.selector] || {},
					key = o.type + '|' + (o.preventDefault? 1:0) + '|' + (o.stopPropagation? 1:0);
				el.events = el.events || {};
				el.types = el.types || [];

				el.events[key] = o.callback;
				o.type = o.type.replace(/\..*/g, '');
				!el.types.contains(o.type) && el.types.push(o.type);
				
			} else if(iCat.isArray(o)){
				while(o.length){
					arguments.callee(o[0]);
					o.shift();
				}
			}
		},

		//o = {selector:'#page', type:'click'}
		undelegate: function(o){
			if(!o || iCat.isEmptyObject(o) || o==[]) return;
			var arrSele = Event.__event_selectors;
			var objItem = Event.items = Event.items || {};

			if(iCat.isObject(o)){
				if(!arrSele.contains(o.selector) || !objItem[o.selector]) return;

				arrSele.remove(o.selector);
				var el = objItem[o.selector];
				o.type = o.type.replace(/click|tap/gi, 'tap').replace(/moving|swiping/gi, 'swiping');

				if(el.types.contains(o.type)){
					el.types.remove(o.type);
					iCat.foreach(el.events, function(k, v){
						if(k.indexOf(o.type)!=-1)
							delete el.events[k];
					});
				}

				//事件为空时去掉
				if(!el.types.length && iCat.isEmptyObject(el.events)){
					delete objItem[o.selector];
				}
			} else if(iCat.isArray(o)){
				while(o.length){
					arguments.callee(o[0]);
					o.shift();
				}
			}
		},

		on: function(el, type, handler, pd, sp){
			if(iCat.isString(el) && /\:dg$/i.test(type)){
				type = type.replace(/\:dg$/i, '');
				Event.delegate({selector:el, type:type, callback:handler, preventDefault:pd, stopPropagation:sp});
			} else {
				Event.bind(el, type, handler);
			}
		},

		off: function(el, type){
			if(iCat.isString(el) && /\:dg$/i.test(type)){
				type = type.replace(/\:dg$/i, '');
				Event.undelegate({selector:el, type:type});
			} else {
				Event.unbind(el, type);
			}
		}
	});
	
	Event.ready(function(){
		var touch = {}, touchTimeout,
			supportTouch = 'ontouchstart' in root;

		var start_evt = supportTouch ? 'touchstart' : 'mousedown',
			move_evt = supportTouch ? 'touchmove' : 'mousemove',
			end_evt = supportTouch ? 'touchend' : 'mouseup',
			cancel_evt = supportTouch ? 'touchcancel' : 'mouseout';

		var bodyNode = iCat.pageBody = iCat.util.queryOne('*[data-pagerole=body]'),
			Event = iCat.Event, now, delta,
			longTapDelay = 750, longTapTimeout,

			cancelLongTap = function(){
				if(longTapTimeout)
					clearTimeout(longTapTimeout);
				longTapTimeout = null;
			},

			swipeDirection = function(x1, x2, y1, y2){
				var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2);
				return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
			};

		if(!bodyNode) return;

		// start
		Event.on(bodyNode, start_evt, function(evt){
			//evt.preventDefault(); //fixed bug: 以下事件加上阻止默认，会引起无法滑动滚动条
			evt.stopPropagation();
			if(evt.button && evt.button===2) return;

			var page = supportTouch? evt.touches[0] : evt;
			now = Date.now();
			delta = now - (touch.last || now);
			touch.el = iCat.util.parentIfText(evt.target);
			touchTimeout && clearTimeout(touchTimeout);

			touch.x1 = page.pageX;
			touch.y1 = page.pageY;
			touch.isScrolling = undefined;

			if(delta>0 && delta<=250) touch.isDoubleTap = true;
			touch.last = now;
			Event._execute('hover', touch.el, 0);

			longTapTimeout = setTimeout(function(){
					longTapTimeout = null;
					if(touch.last){
						Event._execute('longTap', touch.el);
						touch = {};
					}
				}, longTapDelay);
		});

		// doing
		Event.on(bodyNode, move_evt, function(evt){
			evt.stopPropagation();
			if(evt.button && evt.button===2) return;

			cancelLongTap();
			var page = supportTouch? evt.touches[0] : evt;
			touch.x2 = page.pageX;
			touch.y2 = page.pageY;
			var distanceX = touch.x2 - touch.x1,
				distanceY = touch.y2 - touch.y1;
			if(typeof touch.isScrolling=='undefined'){
				touch.isScrolling = !!(touch.isScrolling || Math.abs(distanceX)<Math.abs(distanceY));
			}
			if(!touch.isScrolling){
				Event._execute('swiping', touch.el, [touch.x1, touch.x2, touch.y1, touch.y2]);
			}
		});

		// end
		Event.on(bodyNode, end_evt, function(evt){
			evt.stopPropagation();
			if(evt.button && evt.button===2) return;
			Event._execute('hover', touch.el, 1);
			cancelLongTap();
			
			if(!touch.isScrolling){
				if(touch.isDoubleTap){// double tap (tapped twice within 250ms)
					Event._execute('doubleTap', touch.el);
					touch = {};
				} else if('last' in touch){
					if((touch.x2&&Math.abs(touch.x1-touch.x2)<20) || (touch.y2&&Math.abs(touch.y1-touch.y2)<20)){
						Event._execute('tap', touch.el);
					}

					touchTimeout = setTimeout(function(){
						touchTimeout = null;
						Event._execute('singleTap', touch.el);
						touch = {};
					}, 250);
				} else if((touch.x2&&Math.abs(touch.x1-touch.x2)>30) || (touch.y2&&Math.abs(touch.y1-touch.y2)>30)){
					var swipe = 'swipe' + swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2);
					Event._execute(swipe, touch.el);
					touch = {};
				}
			} else {
				touch = {};
			}
		});

		// cancel
		Event.on(bodyNode, cancel_evt, function(evt){
			evt.stopPropagation();
			if(touchTimeout) clearTimeout(touchTimeout);
			if(longTapTimeout) clearTimeout(longTapTimeout);
			longTapTimeout = touchTimeout = null;
			touch = {};
		});

		// Stops the default click event
		Event.on(bodyNode, 'click', function(evt){
			var el = iCat.util.parentIfText(evt.target);
			if(!el || el==doc.body) return;

			iCat.util.bubble(el, function(node, ret){
				ret = iCat.util.matches(node, Event.__event_selectors);
				if(iCat.isNumber(ret)){
					evt.preventDefault();
					//evt.stopPropagation();
				}
			});
		});
	});
})(ICAT, this, document);