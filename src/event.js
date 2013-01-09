/** event.js */
(function(iCat){
	
	String.prototype.trim = function(){
		return this.replace(/(^\s*)|(\s*$)/g, '');
	};

	/*iCat.Class('_$', {
		Create: function(el){
			this.el = el;
		},

		stopDefault: function(){
			this.el.setAttribute('onclick', 'return false;');
		}
	});*/

	iCat.Class('Observer', {
		Create: function(pageid){
			this.events = {};
			//this.selectors = {};
			this.pageid = pageid;
		},

		/*
		 * argus可以是<b>单个对象</b>或<b>对象数组</b>
		 * o = {el:'.cla', eType:'click', callback: function(){}}
		 */
		subscribe: function(o){
			var self = this;
			if(!o) return self;

			o = iCat.isArray(o)? o : [o];
			iCat.foreach(o, function(i,v){
				/*var key = v.el.replace(/\s|\W/g,'')+v.eType;
				self.selectors[key] = v.el;*/
				var key = v.el.trim(),
					eType = v.eType.trim();

				if(!self.events[eType])
					self.events[eType] = {}; //{'click':{}, 'longTap':{}}

				if(!self.events[eType][key])
					self.events[eType][key] = v.callback; // {'click':{'el1':function, 'el2':function}, 'longTap':{}}
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
					if(v.indexOf('~')>0){
						v = v.split('~');
						delete self.events[v[1].trim()][v[0].trim()];
					} else {
						delete self.events[v.trim()];
					}
				});
			}

			return self;
		},

		execute: function(eType, el){
			var self = this, cbs = self.events[eType];
			if(!cbs) return;

			iCat.foreach(cbs, function(k, v){
				if(iCat.matches(el, k)){
					/*el.removeAttribute('onclick');

					var ev = document.createEvent('HTMLEvents');
					ev.initEvent('click', false, true);
					el.dispatchEvent(ev);*/

					v.call(el);//, new _$(el)
				}
			});
		},

		setCurrent: function(){
			iCat.__OBSERVER_PAGEID = this.pageid;
			return this;
		},

		on: function(selector, eType, callback){
			return this.subscribe({el:selector, eType:eType, callback:callback});
		},

		off: function(selector, eType){
			return this.unsubscribe(selector+'~'+eType);
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
	iCat.Event = iCat.obsCreate('__PAGE_EVENT');

	// 所有事件的实现都绑定在body上
	(function(){
		var doc = document,
			touch = {}, touchTimeout,
			supportTouch = 'ontouchstart' in window;

		var start_evt = supportTouch ? 'touchstart' : 'mousedown',
			move_evt = supportTouch ? 'touchmove' : 'mousemove',
			end_evt = supportTouch ? 'touchend' : 'mouseup',
			cancel_evt = 'touchcancel';

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

		function _bind(el, eType, callback){
			el.addEventListener(eType, callback, false);
		}

		_bind(document, 'DOMContentLoaded', function(){

			if(!iCat.__OBSERVER_PAGEID || iCat.obsCreate[iCat.__OBSERVER_PAGEID]==null) iCat.__OBSERVER_PAGEID = '__PAGE_EVENT';
			
			var bodyNode = doc.body, now, delta,
				objObs = iCat.obsCreate[iCat.__OBSERVER_PAGEID];

			// start
			_bind(bodyNode, start_evt, function(evt){
				iCat.preventDefault(evt);
				iCat.stopPropagation(evt);

				evt = supportTouch? evt.touches[0] : evt;
				now = Date.now();
				delta = now - (touch.last || now);
				touch.el = iCat.parentIfText(evt.target);
				touchTimeout && clearTimeout(touchTimeout);

				touch.x1 = evt.pageX;
				touch.y1 = evt.pageY;

				// 阻止click触发默认事件
				touch.el.setAttribute('onclick', 'return false;');

				if(delta>0 && delta<=250) touch.isDoubleTap = true;
				touch.last = now;
				longTapTimeout = setTimeout(function(){
						longTapTimeout = null;
						if(touch.last){
							objObs.execute('longTap', touch.el);
							touch = {};
						}
					}, longTapDelay);

				return false;
			});

			// being
			_bind(bodyNode, move_evt, function(evt){
				iCat.preventDefault(evt);
				iCat.stopPropagation(evt);

				cancelLongTap();
				evt = supportTouch? evt.touches[0] : evt;
				touch.x2 = evt.pageX;
				touch.y2 = evt.pageY;
			});

			// end
			_bind(bodyNode, end_evt, function(evt){
				iCat.preventDefault(evt);
				iCat.stopPropagation(evt);
				cancelLongTap();

				// double tap (tapped twice within 250ms)
				if(touch.isDoubleTap){
					objObs.execute('doubleTap', touch.el);
					objObs.execute('doubleClick', touch.el);
					touch = {};
				} else if('last' in touch) {
					objObs.execute('tap', touch.el);
					objObs.execute('click', touch.el);

					touchTimeout = setTimeout(function(){
						touchTimeout = null;
						objObs.execute('singleTap', touch.el);
						objObs.execute('singleClick', touch.el);
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
			_bind(bodyNode, cancel_evt, function(evt){
				iCat.preventDefault(evt);
				iCat.stopPropagation(evt);

				if(touchTimeout) clearTimeout(touchTimeout);
				if(longTapTimeout) clearTimeout(longTapTimeout);
				longTapTimeout = touchTimeout = null;
				touch = {};
			});
		});
	})();
})(ICAT);