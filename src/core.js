/** core.js */
(function(){
	// Create the root object, 'window' in the browser, or 'global' on the server.
	var root = this, iCat = {};
	
	// Export the ICAT object for **Node.js**
	if(typeof exports!=='undefined'){
		if(typeof module!=='undefined' && module.exports){
			exports = module.exports = iCat;
		}
		exports.ICAT = iCat;
	} else {
		root['ICAT'] = iCat;
	}
	
	var _ua = navigator.userAgent, ObjProto = Object.prototype,
		toString = ObjProto.toString,
		nativeIsArray = Array.isArray,
		docElem = document.documentElement,
		__APP_MEMBERS = ['namespace'];// iCat.app() with these members.
	
	// Copies all the properties of s to r.
	// w(hite)l(ist):白名单, ov(erwrite):覆盖
	iCat.mix = function(r, s, wl, ov){
		if (!s || !r) return r;
		if (!ov) ov = true;
		var i, p, len;

		if (wl && (len = wl.length)) {
			for (i = 0; i < len; i++) {
				p = wl[i];
				if (p in s) {
					if (ov || !(p in r)) {
						r[p] = s[p];
					}
				}
			}
		} else {
			for (p in s) {
				if (ov || !(p in r)) {
					r[p] = s[p];
				}
			}
		}
		return r;
	};
	
	iCat.mix(iCat, {
		// Current version.
		version: '1.1.3',
		
		// debug or not
		isDebug: /debug/i.test(root.location.href),
		
		// kinds of browsers
		browser: {
			safari: /webkit/i.test(_ua),
			opera: /opera/i.test(_ua),
			msie: /msie/i.test(_ua) && !/opera/i.test(_ua),
			mozilla: /mozilla/i.test(_ua) && !/(compatible|webkit)/i.test(_ua)
		},
		
		// common browser
		/*isIE: (function(){return iCat.browser.msie;})(),
		ieVersion: iCat.browser.msie? _ua.match(/MSIE(\s)?\d+/i)[0].replace(/MSIE(\s)?/i,'') : -1,*/
		
		// Commonly used judgment
		isFunction: function(obj){
			return toString.call(obj) == '[object Function]';
		},
		
		isString: function(obj){
			return toString.call(obj) == '[object String]';
		},
		
		isArray: nativeIsArray ||
			function(obj){
				return toString.call(obj) == '[object Array]';
			},
		
		isObject: function(obj){
			return toString.call(obj) == '[object Object]';//obj === Object(obj);
		},
		
		isNull: function(obj){
			return obj === null;
		},

		parentIfText: function(node){
			return 'tagName' in node ? node : node.parentNode;
		},

		matches: function(el, selector){
			var match = docElem.matchesSelector || docElem.mozMatchesSelector || docElem.webkitMatchesSelector ||
					docElem.oMatchesSelector || docElem.msMatchesSelector;
			return match.call(el,selector);
		},

		hasItem: function(item, items){
			for(var i=0, len=items.length; i<len; i++){
				if(items[i]==item){
					return true;
				}
			}
			return false;
		},

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

		// function throttle
		throttle: function(opt){
			var timer = null, t_start;

			var fn = opt.fn,
				context = opt.context,
				delay = opt.delay || 100,
				mustRunDelay = opt.mustRunDelay;
			
			return function(){
				var args = arguments, t_curr = +new Date();
				context = context || this;
				
				clearTimeout(timer);
				if(!t_start){
					t_start = t_curr;
				}
				if(mustRunDelay && t_curr - t_start >= mustRunDelay){
					fn.apply(context, args);
					t_start = t_curr;
				}
				else {
					timer = setTimeout(function(){
						fn.apply(context, args);
					}, delay);
				}
			};
		},
		
		// Handles objects with the built-in 'foreach', arrays, and raw objects.
		foreach: function(o, cb, args){
			var name, i = 0, length = o.length,
				isObj = length===undefined || iCat.isString(o);
			
			if(args){
				if(isObj){
					for(name in o){
						if(cb.apply(o[name],args)===false){
							break;
						}
					}
				} else {
					for(  ; i<length; ){
						if(cb.apply(o[i++],args)===false){
							break;
						}
					}
				}
			} else {
				if(isObj){
					for(name in o){
						if(cb.call(o[name], name, o[name])===false){
							break;
						}
					}
				} else {
					for( ; i<length; ){
						if(cb.call(o[i], i, o[i++])===false){
							break;
						}
					}
				}
			}
		},
		
		// Create Class for the kinds of UI
		Class: function(){
			var argus = arguments,
				len = argus.length;
			
			if(len==0) return null;
			
			else if(len==1){
				var cfg = argus[0];
				if(!iCat.isObject(cfg))
					return null;
				else {
					function Cla(){cfg.Create.apply(this, arguments);}
					iCat.foreach(cfg, function(k, v){
						if(k!='Create')
							Cla.prototype[k] = v;
					});
					
					return Cla;
				}
			}
			
			else if(len>=2){
				var claName = argus[0],
					cfg = argus[1],
					context = argus[2] || root;
				
				if(!iCat.isString(claName) || !iCat.isObject(cfg))
					return null;
				else {
					function Cla(){cfg.Create.apply(this, arguments);}
					iCat.foreach(cfg, function(k, v){
						if(k!='Create')
							Cla.prototype[k] = v;
					});
					
					context[claName] = Cla;
				}
			}
		},
		
		widget: function(name, cfg){
			this.Class(name, cfg, iCat.widget);
		},

		util: function(name, fn){
			iCat.util[name] = fn;
		},
		
		// iCat或app下的namespace，相当于扩展出的对象
		namespace: function(){
			var a = arguments, l = a.length, o = null, i, j, p;

			for (i=0; i<l; ++i){
				p = ('' + a[i]).split('.');
				o = this;
				for (j = (root[p[0]]===o)? 1:0; j<p.length; ++j){
					o = o[p[j]] = o[p[j]] || {};
				}
			}
			return o;
		 },
		
		// create a app for some project
		app: function(name, sx){
			var self = this,
				isStr = self.isString(name),
				O = isStr? root[name] || {} : name;

				self.mix(O, self, __APP_MEMBERS, true);
				self.mix(O, self.isFunction(sx) ? sx() : sx);
				isStr && (root[name] = O);

				return O;
		 },
		
		// print some msg for unit testing
		log: function(msg) {
			root.console!==undefined && console.log ? console.log(msg) : alert(msg);
		 }
	});
}).call(this);