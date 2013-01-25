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

	function _parentIfText(node){
		return 'tagName' in node ? node : node.parentNode;
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
			if(!s)
				return [doc];
			else {
				s = s.replace(/^\s|\s$/g, '');
				return (cx || doc).querySelectorAll(s);
			}
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

		closest: function(el, s){},

		index: function(el, els){}
	});

	// related nodes
	iCat.mix(Dom, {

		parent: function(){},

		parents: function(){},

		children: function(){},

		siblings: function(){},

		first: function(){},

		last: function(){},

		prev: function(){},

		next: function(){}
	});

	// css & attribute & position & size
	iCat.mix(Dom, {

		hasClass: function(el, cla){
			return new RegExp('(?:^|\\s+)'+cla+'(?:\\s+|$)').test(el.className);
		},

		addClass: function(el, cla){
			if(!Dom.hasClass(el,cla))
				el.className = [el.className, cla].join(' ');
		},

		removeClass: function(el, cla){
			if(Dom.hasClass(el,cla)){
				var a = el.className;
				el.className = a.replace(new RegExp('(?:^|\\s+)'+cla+'(?:\\s+|$)', 'g'), ' ');
			}
		},

		replaceClass: function(el, oldcla, newcla){
			if(Dom.hasClass(el,oldcla)){
				var a = el.className;
				el.className = a.replace(new RegExp('(?:^|\\s+)'+oldcla+'(?:\\s+|$)','g'), ' '+newcla+' ').replace(/^\s+|\s+$/g,'');
			}
		},

		toggleClass: function(el, cla){
			Dom[Dom.hasClass(el,cla)? 'removeClass' : 'addClass'](el, cla);
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
							for(var i=0; i<arr.length; i++){
								if(arr[i]=='ms' || i==0) continue;
								arr[i] = arr[i].substring(0,1).toUpperCase()+arr[i].substring(1);
							}
							p = arr.join('');
						}
						return p;
						break;
				}
			}

			function getStyle(el, p){
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
				return iCat.isString(styleCss)? getStyle(el,styleCss) : setStyle(el,styleCss);
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
				return typeof pos=='undefined'? getPos(el) : setPos(el,pos);
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

})(ICAT, document);