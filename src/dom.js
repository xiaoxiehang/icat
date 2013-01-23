/** dom.js */
(function(iCat, doc){

	// 创建Dom命名空间
	iCat.namespace('Dom');

	var Dom = iCat.Dom,
		doc = document;

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

	// css & attribute
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
				el.className = a.replace(new RegExp('(?:^|\\s+)'+oldcla+'(?:\\s+|$)','g'), ' '+newcla);
			}
		},

		toggleClass: function(el, cla){
			Dom[Dom.hasClass(el,cla)? 'removeClass' : 'addClass'](el, cla);
		},

		attr: function(){},

		removeAttr: function(){},

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
									return ft && ft.indexOf('opacity')>=0 && parseFloat(ft.match(/opacity=(^)*)/i)[1])/100+'' || '1';
								},
								set: function(el,va){
									el.style.filter = 'alpha(opacity='+va*100+')';
									el.style.zoom = 1;
								}
							}
						break;
					
					default:
						var arr = p.split('-');
						for(var i=0; i<arr.length; i++){
							if(arr[i]=='ms') continue;
							arr[i] = arr[i].substring(0,1).toUpperCase()+arr[i].substring(1);
						}
						p = arr.join('');
						return p;
						break;
				}
			}

			function getStyle(el, p){
				// body...
			}

			function setStyle(el, css){
				// body...
			}

			return function(el, css){
				return iCat.isString(css)? getStyle(el,css) : setStyle(el,css);
			}
		}()
	});

	// position & size
	iCat.mix(Dom, {

	});

})(ICAT, document);