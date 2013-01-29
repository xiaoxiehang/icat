/** dom.js */
(function(iCat, doc){

	// 创建Dom命名空间
	iCat.namespace('Dom');

	var Dom = iCat.Dom,
		doc = document,
		testStyle = doc.createElement('div').style,

		vendor = function(){//检测css3支持前缀
			var style = testStyle,
				vendors = ['t','WebkitT','MozT','msT','OT'],
				t;
			for(var i = 0, l = vendors.length; i<l; i++){
				t = vendors[i]+'ransform';
				if(t in style){
					return vendors[i].slice(0,-1);
				}
			}
			return false;
		}(),
		
		cssVendor = vendor? '-'+vendor.toLowerCase()+'-' : '',
		hasTransform = !!vendor,//是否支持css3 transform
		hasTransition = vendor+'Transition' in testStyle,//是否支持css3 transition
		hasBorderImage = vendor+'BorderImage' in testStyle;//是否支持css3 transition

	function _matches(el, selector){
		var docElem = doc.documentElement,
			match = docElem.matchesSelector || docElem.mozMatchesSelector || docElem.webkitMatchesSelector ||
				docElem.oMatchesSelector || docElem.msMatchesSelector;
		return match.call(el,selector);
	}

	// base
	iCat.mix(Dom, {

		one: function(s, cx){
			if(!s)
				return doc;
			else {
				s = s.replace(/^\s|\s$/g, '');
				return (cx || doc).querySelector(s);
			}
		},

		all: function(s, cx){
			var arr = [];
			if(!s)
				arr.push(doc);
			else {
				s = s.replace(/^\s|\s$/g, '');
				var els = (cx || doc).querySelectorAll(s),
					l = els.length;
				for(var i=0; i<l; i++){
					arr.push(els[i]);
				}
			}
			return arr;
		},

		filter: function(els, s){
			if(!els.length || !s)
				return els;
			else {
				var slr = s.replace(/^\s|\s$/g, ''),
					newEls = [];
				iCat.foreach(els, function(i, el){
					if(_matches(el, slr))
						newEls.push(el);
				});
				return newEls;
			}
		},

		index: function(el, els){}
	});

	// related nodes
	iCat.mix(Dom, {

		parent: function(el){
			if(el) return el.parentNode;
		},

		parents: function(el, s){
			if(!s || typeof s=='number'){
				s = s || 1;
				for(var i=0; i<s; i++){
					if(!iCat.isNull(el))
						el = el.parentNode;
					else
						return null;
				}
			} else {
				(function(){
					el = el.parentNode;
					if(iCat.isNull(el)) return;
					if(_matches(el,s)){
						return;
					} else {
						arguments.callee();
					}
				})();
			}

			return el;
		},

		children: function(el, s){
			el.childNodes;
			var c_els = el.childNodes,
				l = c_els.length,
				arr = [];
			for(var i=0; i<l; i++){
				var e = c_els[i];
				if(!s){
					if(e.nodeType==1)
						arr.push(e);
				} else {
					if(e.nodeType==1 && _matches(e,s))
						arr.push(e);
				}
			}
			return arr;
		},

		siblings: function(){},

		prev: function(el, s){
			if(!el) return;
			if(!s){
				do {
					el = el.previousSibling;
				} while (el && el.nodeType!=1);
			} else {
				(function(){
					el = el.previousSibling;

					if(iCat.isNull(el)) return;
					if(el.nodeType==1 && _matches(el,s)){
						return;
					} else {
						arguments.callee();
					}
				})();
			}
			return el;
		},

		next: function(el, s){
			if(!el) return;
			if(!s){
				do {
					el = el.nextSibling;
				} while (el && el.nodeType!=1);
			} else {
				(function(){
					el = el.nextSibling;

					if(iCat.isNull(el)) return;
					if(el.nodeType==1 && _matches(el,s)){
						return;
					}
					else {
						arguments.callee();
					}
				})();
			}
			return el;
		},

		first: function(el){
			el = el.firstChild;
			return el && el.nodeType!=1? Dom.next(el) : el;
		},

		last: function(el){
			el = el.lastChild;
			return el && el.nodeType!=1? Dom.prev(el) : el;
		},

		closest: function(el, s){

		}
	});

	// css & attribute & position & size
	iCat.mix(Dom, {

		hasClass: function(el, cla){
			return new RegExp('(?:^|\\s+)'+cla+'(?:\\s+|$)').test(el.className);
		},

		addClass: function(el, cla){
			var arr = iCat.isArray(el)? el : [el];
			iCat.foreach(arr, function(i, e){
				if(!Dom.hasClass(e,cla)){
					var cn = e.className;
					e.className = !cn? cla : [cn, cla].join(' ');
				}
			});
		},

		removeClass: function(el, cla){
			var arr = iCat.isArray(el)? el : [el];
			iCat.foreach(arr, function(i, e){
				if(Dom.hasClass(e,cla)){
					var cn = e.className;
					e.className = cn.replace(new RegExp('(?:^|\\s+)'+cla+'(?:\\s+|$)', 'g'), ' ');
				}
			});
		},

		replaceClass: function(el, oldcla, newcla){
			var arr = iCat.isArray(el)? el : [el];
			iCat.foreach(arr, function(i, e){
				if(Dom.hasClass(e,oldcla)){
					var cn = e.className;
					e.className = cn.replace(new RegExp('(?:^|\\s+)'+oldcla+'(?:\\s+|$)','g'), ' '+newcla+' ').replace(/^\s+|\s+$/g,'');
				}
			});
		},

		toggleClass: function(el, cla){
			var arr = iCat.isArray(el)? el : [el];
			iCat.foreach(arr, function(i, e){
				Dom[Dom.hasClass(e,cla)? 'removeClass' : 'addClass'](e, cla);
			});
		},

		attr: function(){},

		removeAttr: function(){},

		// 样式 设置时必须有单位
		css: function(){
			function styleFilter(p){
				switch(p){
					case 'float':
						return ('cssFloat' in doc.body.style)? 'cssFloat' : 'styleFloat';
						break;
					
					case 'opacity':
						return ('opacity' in doc.body.style)? 'opacity' :
							{
								get: function(el,style){
									var ft = style.filter;
									return ft && ft.indexOf('opacity')>=0 && parseFloat(ft.match(/opacity=([^)]*)/i)[1])/100+'' || '1';
								},
								set: function(el,va){
									el.style.filter = 'alpha(opacity='+va*100+')';
									el.style.zoom = 1;
								}
							}
						break;
					
					default:
						if(p.indexOf('-')>-1){
							var arr = p.split('-');
							for(var i=0, l=arr.length; i<l; i++){
								if(arr[i]=='webkit' || arr[i]=='ms' || arr[i]=='moz' || arr[i]=='o') continue;
								arr[i] = arr[i].substring(0,1).toUpperCase()+arr[i].substring(1);
							}
							p = arr.join('');
						}
						return p;
						break;
				}
			}

			function getStyle(el, p){
				el = iCat.isArray(el)? el[0] : el;
				p = styleFilter(p);
				var val = el.style[p];
				if(!val){
					var style = doc.defaultView && doc.defaultView.getComputedStyle && getComputedStyle(el, null) || el.currentStyle || el.style;
					val = iCat.isString(p)? style[p] : p.get(el, style);
				}
				return val=='auto'? '' : val;
			}

			function setStyle(el, o){
				if(!iCat.isObject(o)) return;
				var attr;
				iCat.foreach(o, function(k, v){
					attr = styleFilter(k);
					iCat.isString(attr)? el.style[attr] = v : attr.set(el, v);
				});
			}

			return function(el, styleCss){
				if(iCat.isString(styleCss))
					return getStyle(el,styleCss);
				
				el = iCat.isArray(el)? el : [el];
				for(var i=0, ilen=el.length; i<ilen; i++){
					setStyle(el[i], styleCss);
				}
			}
		}(),

		// 位置 设置时必须有单位
		position: function(){
			function getPos(o){
				var x = 0, y = 0;
				do {
					x += o.offsetLeft || 0;
					y += o.offsetTop || 0;
					o = o.offsetParent;
				} while(o);
				return {'left':x, 'top':y};
			}

			function setPos(o, pos){
				if(typeof pos=='number')
					return setPos(o, {left:pos});
				var st = {},
					isX = typeof pos.left!='undefined',
					isY = typeof pos.top!='undefined';
				if(hasTransition){
					if(isX && isY){
						st[cssVendor+'transform'] = 'translate('+pos.left+', '+pos.top+')';
					}else{
						if(isX)
							st[cssVendor+'transform'] = 'translateX('+pos.left+')';
						if(isY)
							st[cssVendor+'transform'] = 'translateY('+pos.top+')';
					}
				} else {
					if(isX)
						st['left'] = pos.left;
					if(isY)
						st['top'] = pos.top;
				}

				Dom.css(o, st);
				return st;
			}

			return function(el, pos){
				if(typeof pos=='undefined')
					return getPos(el);
				
				el = iCat.isArray(el)? el : [el];
				for(var i=0, ilen=el.length; i<ilen; i++){
					setPos(el[i], pos);
				}
			}
		}(),

		// 偏移量 设置时必须有单位
		offset: function(){
			function getOffset(o){
				var x = o.offsetLeft || 0,
					y = o.offsetTop || 0;
				return {'left':x, 'top':y};
			}

			return function(el, pos){
				return typeof pos=='undefined'? getOffset(el) : Dom.position(el, pos);
			}
		}(),

		width: function(el, w){
			return Dom.css(el, w? {width:w} : 'width');
		},

		height: function(el, w){
			return Dom.css(el, w? {height:w} : 'height');
		}
	});

	// join dom
	iCat.mix(Dom, {

	});

	// iCat.$ as jQuery
	var $ = iCat.$ = function(s, cx){return new $.fn.init(s, cx);};
	$.fn = $.prototype = {
		constructor: $,
		init: function(s, cx){
			this.selector = [];
			if(iCat.isString(s))
				this.selector = Dom.all(s, cx);
			else {
				this.selector = s;
			}
			return this;
		}
	};
	$.fn.init.prototype = $.fn;

	for(var k in Dom){
		if(k=='one' || k=='all') continue;
		$.fn[k] = function(){
			var arr = Array.prototype.slice.call(arguments); 
			if(this.selector) arr.unshift(this.selector);
			return Dom[k].apply(this.selector||this, arr) || this;
		};
	}

	$.extend = $.fn.extend = function(o){
		if(!iCat.isObject(o)) return this;

		var _self = this;
		iCat.foreach(o, function(k, v){
			if(iCat.isFunction(v)){
				_self[k] = function(){
					return v.apply(this.selector||_self, arguments) || this;
				};
			} else {
				_self[k] = v;
			}
		});
		return _self;
	};

	// extend jquery's funs
	$.fn.extend({
		get: function(num){
			return num==null? Array.prototype.slice.call(this) :
				(num<0? this[this.length+num] : this[num]);
		}
	});

})(ICAT, document);