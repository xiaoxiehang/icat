/** event.js */
(function(iCat){
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
			if(!o) return;

			o = iCat.isArray(o)? o : [o];
			iCat.foreach(o, function(i,v){
				/*var key = v.el.replace(/\s|\W/g,'')+v.eType;
				self.selectors[key] = v.el;*/
				var key = v.el;

				if(!self.events[v.eType])
					self.events[v.eType] = {}; //{'click':{}, 'longTap':{}}

				if(!self.events[v.eType][key])
					self.events[v.eType][key] = v.callback; // {'click':{'el1':function, 'el2':function}, 'longTap':{}}
			});
		},

		unsubscribe: function(key){
			var self = this;
			if(!key){
				self.events = {};
			} else {
				/*key = iCat.isArray(key)? key : [key];
				key.forEach(function(v){
					delete self.events[v];
				});*/
			}
		},

		execute: function(eType, el){
			var self = this, cbs = self.events[eType];
			if(!cbs) return;

			iCat.foreach(cbs, function(k, v){
				if(iCat.matches(el, k))
					v.call(el, event);
			})
		}
	});

	// iCat观察者
	iCat.Obs = {};
	iCat.ObsPage = [];
	iCat.observer = function(pid){
		if(!iCat.hasItem(pid,iCat.ObsPage))
			iCat.ObsPage.push(pid);
		return iCat.Obs[pid] = new Observer(pid);
	};

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

			var bodyNode = doc.body, now, delta,
				objObs = iCat.Obs[iCat.ObsPage[0]];

			// start
			_bind(bodyNode, start_evt, function(evt){
				//evt.stopPropagation();

				evt = supportTouch? evt.touches[0] : evt;
				now = Date.now();
				delta = now - (touch.last || now);
				touch.el = iCat.parentIfText(evt.target);
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

			// being
			_bind(bodyNode, move_evt, function(evt){
				cancelLongTap();
				evt = supportTouch? evt.touches[0] : evt;
				touch.x2 = evt.pageX;
				touch.y2 = evt.pageY;
			});

			// end
			_bind(bodyNode, end_evt, function(evt){
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
				if(touchTimeout) clearTimeout(touchTimeout);
				if(longTapTimeout) clearTimeout(longTapTimeout);
				longTapTimeout = touchTimeout = null;
				touch = {};
			});
		});
	})();
	
})(ICAT);