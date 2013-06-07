/*!
 * Copyright 2011~2013, ICAT JavaScript Library v1.1.5
 * https://github.com/valleykid/icat
 *
 * Copyright (c) 2013 valleykid
 * Licensed under the MIT license.
 *
 * @Author valleykiddy@gmail.com
 * @Time 2013-06-02 09:00:00
 */

/* core.js # */
(function(){
	// Create the root object, 'root' in the browser, or 'global' on the server.
	var root = this, doc = document, iCat = { version: '1.1.5' };
	
	// Export the ICAT object for **Node.js**
	if(typeof exports!=='undefined'){
		if(typeof module!=='undefined' && module.exports){
			exports = module.exports = iCat;
		}
		exports.ICAT = iCat;
	} else {
		root['ICAT'] = iCat;
	}

	// Compatible plugin for PC
	iCat.Shim = root['SHIM'] || {};

	// jQuery/Zepto coming in
	iCat.$ = root['jQuery'] || root['Zepto'];

	// expand the built-in Objects' functions.
	var ArrPro = Array.prototype;
	ArrPro.contains = function(item){ return this.indexOf(item)<0? false : true; };
	ArrPro.remove = function(item){
		var self = this;
		self.forEach(function(v, i){
			if(v===item){ self.splice(i, 1); }
		});
		return self;
	};
	ArrPro.unique = function(){
		var self = this, hash = {}, r = [];
		self.forEach(function(v){
			if(!hash[v]){
				r.push(v); hash[v] = true;
			}
		});
		return r;
	};

	// Kinds of judgments
	['String', 'Boolean', 'Function', 'Array', 'Object'].forEach(function(v){
		iCat['is'+v] = function(obj){
			if(v==='Array' && Array.isArray) return Array.isArray(obj);
			return Object.prototype.toString.call(obj) === '[object '+v+']';
		};
	});
	iCat.isNull = function(obj){ return obj===null; };
	iCat.isNumber = function(obj){ return !isNaN(Number(obj)); };
	iCat.isUndefined = function(obj){ return obj===undefined; };
	iCat.isjQueryObject = function(obj){ return !!iCat.$ && obj instanceof iCat.$; };
	iCat.isEmptyObject = function(obj){ for(var name in obj){return false;} return true; };

	// Kinds of modes
	(function(){
		var href = location.href,
			keyRegs = {
				'DebugMode': /debug/i,
				'DemoMode': /localhost|demo\.|\/{2}\d+(\.\d+){3}|file\:/i,
				'IPMode': /\/{2}\d+(\.\d+){3}/
			};
		for(var k in keyRegs){ iCat[k] = keyRegs[k].test(href); }
	})();

	// Get icat-js and set pageRef & weinreRef
	(function(){
		var scripts = doc.getElementsByTagName('script'),
			curJs = scripts[scripts.length-1],
			pc = iCat.PathConfig = {};

		var baseURI = curJs.baseURI || doc.baseURI || doc.URL,
			refSlipt = curJs.getAttribute('refSlipt') || '';
		//fixed bug:分隔符在字符串里不存在时
		if(refSlipt && baseURI.indexOf(refSlipt)==-1) refSlipt = false;

		var strExp = iCat.DemoMode?
					(refSlipt? '('+refSlipt+'/).*' : '(/)([\\w\\.]+)?\\?.*') : '(//[\\w\\.]+/).*',
			regExp = new RegExp(strExp, 'g');

		baseURI = (iCat.DemoMode && !refSlipt)? baseURI+'?' : baseURI;//fixed bug:加?为了匹配类似/index.php的情况
		pc.pageRef = baseURI.replace(regExp, '$1');
		pc.weinreRef = iCat.IPMode? baseURI.replace(/(\d+(\.\d+){3}).*/g, '$1:8080/') : '';
	})();

	// Copies all the properties of s to r.
	// l(ist):黑/白名单, ov(erwrite):覆盖
	iCat.mix = function(r, s, l, ov){
		if(!s || !r) return r;
		if(iCat.isUndefined(ov)) ov = true;
		var i, p, len, white = true;

		if(l && !Array.isArray(l)){
			l = l.replace(/\s+/g, '').split(',');
			white = false;
		}

		if(l && (len=l.length)){
			if(white){
				for(i=0; i<len; i++){
					p = l[i];
					if(p in s){
						if(ov || !(p in r)){
							r[p] = s[p];
						}
					}
				}
			} else {
				for(p in s){
					if(l.indexOf(p)<0 && (ov || !(p in r))){
						r[p] = s[p];
					}
				}
			}
		} else {
			for(p in s) {
				if(ov || !(p in r)){
					r[p] = s[p];
				}
			}
		}
		return r;
	};

	/*-------------------------------------------*
	 * The core of ICAT's framework
	 *-------------------------------------------*/
	iCat.mix(iCat,
	{
		contains: function(o, p){
			if(iCat.isArray(o)){
				return o.contains(p);
			}
			else if(iCat.isObject(o)){
				return p in o;
			}
			return false;
		},
		
		// Handles objects with the built-in 'foreach', arrays, and raw objects.
		foreach: function(o, cb, args){
			var name, i = 0, length = o.length,
				isObj = iCat.isUndefined(length) || iCat.isString(o) || iCat.isFunction(o);
			
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
				len = argus.length, cfg, Cla,
				claName, context;
			if(!len) return;

			cfg = argus[1] || argus[0];
			if(!iCat.isObject(cfg)) return;
			Cla = function(){
				if(cfg.Create) cfg.Create.apply(this, arguments);
			};

			if(len>1){
				claName = argus[0];
				context = argus[2] || root;
				if(!iCat.isString(claName)) return;	
			}
			iCat.mix(Cla.prototype, cfg, 'Create');
			if(Cla.prototype.constructor==Object.prototype.constructor){
				Cla.prototype.constructor = Cla;
			}
			return len===1? Cla : (context[claName] = Cla);
		},
		
		widget: function(name, cfg){
			this.Class(name, cfg, iCat.widget);
		},

		util: function(name, fn){
			if(iCat.isString(name)){
				iCat.util[name] = fn;
			} else if(iCat.isFunction(name)){
				iCat.mix(iCat.util, name());
			} else {
				iCat.mix(iCat.util, name);
			}
		},

		rentAjax: function(fnAjax, cfg){
			if(!fnAjax || !iCat.isFunction(fnAjax)) return function(){};
			iCat.util.ajax = function(cfgAjax){
				cfg = cfg || {};
				var _cfg = iCat.mix({}, cfgAjax, 'success, error');
					_cfg = iCat.mix(_cfg, cfg, 'success, error', false);
				_cfg.prevSuccess = cfg.success;
				_cfg.nextSuccess = cfgAjax.success;
				_cfg.prevError = cfg.error;
				_cfg.nextError = cfgAjax.error;
				_cfg.success = function(data){
					if(!data) return;
					data = iCat.isObject(data) || iCat.isArray(data)? data : JSON.parse(data);
					var ret = _cfg.prevSuccess? _cfg.prevSuccess(data) : '';
					if(_cfg.nextSuccess) _cfg.nextSuccess(ret || data);
				};
				_cfg.error = function(){
					var ret = _cfg.prevError? _cfg.prevError() : '';
					if(_cfg.nextError) _cfg.nextError(ret);
				};
				fnAjax(_cfg);
			};
		},

		// iCat或app下的namespace，相当于扩展出的对象
		namespace: function(){
			var a = arguments, l = a.length, o = null, i, j, p;

			for(i=0; i<l; ++i){
				p = ('' + a[i]).split('.');
				o = this;
				for(j = (root[p[0]]===o)? 1:0; j<p.length; ++j){
					o = o[p[j]] = o[p[j]] || {};
				}
			}
			return o;
		},
		
		// create a app for some project
		app: function(name, sx){
			var isStr = iCat.isString(name),
				O = isStr? root[name] || {} : name;

			iCat.mix(O, iCat, ['namespace'], true);
			iCat.mix(O, iCat.isFunction(sx) ? sx() : sx);
			isStr && (iCat.app[name] = root[name] = O);

			return O;
		},

		log: function(msg){
			if(doc.all){
				root.console!==undefined && console.log? console.log(msg) : alert(msg);
			} else {
				try{ __$abc_ICAT(); }
				catch(e){
					var fileline = e.stack.replace(/\n\s+at\s+<.*>/g, '').split('\n')[2];// fixed bug:Direction on an input element that cannot have a selection.
					fileline = fileline.replace(/.*[\(\s]|\).*/g, '').replace(/(.*):(\d+):\d+/g, '$1  line $2:\n');
					console.log(fileline, msg);
				}
			}
		}
	});

	/*-------------------------------------------*
	 * The common tools of ICAT
	 *-------------------------------------------*/
	iCat.namespace('Once');
	var Sutil = iCat.Shim.util || {};

	//base
	iCat.util(
	{
		/*
		 * t: 多少毫秒执行取图片
		 * imgSelector: 选择器
		 */
		lazyLoad: function(pNode, t, imgSelector){
			if(!pNode) return;

			t = t || 500;
			pNode = iCat.util.queryOne(pNode);
			imgSelector = imgSelector || 'img[src$="blank.gif"]';

			setTimeout(function(){
				iCat.foreach(iCat.util.queryAll(imgSelector, pNode),
					function(k, o){
						var src = o.getAttribute('data-src');
						iCat.__cache_images = iCat.__cache_images || {};
						if(!src) return;

						if(!iCat.__cache_images[src]){
							var oImg = new Image(); oImg.src = src;
							oImg.onload = function(){
								o.src = src;
								iCat.__cache_images[src] = true;
								oImg = null;
							};
						} else {
							o.src = src;
						}
						o.removeAttribute('data-src');
					}
				);
			}, t);
		},

		/*
		 * delay: 停顿多长时间开始加载
		 * step: 每隔多少ms请求一次
		 */
		wait: function(callback, delay, step){
			delay = delay || 100;
			step = step || 1;
			var cacheTimer = iCat.__cache_timers = iCat.__cache_timers || {};
			var steps = 0,
				key = 'icat_timer' + Math.floor(Math.random()*1000000+1);

			(function(){
				var fn = arguments.callee;
				callback(key, steps);
				if(steps<delay && cacheTimer[key]===false){
					setTimeout(function(){
						steps = steps + step;
						fn();
					}, step);
				}
			})();
		},

		recurse: function(arr, callback){//递归
			var fn = function(a, cb){
				while(a.length){
					if(cb(a[0])===false) break;
					a.shift(); fn(a, cb);
				}
			};

			iCat.isArray(arr)?
				fn(arr.concat()/*保护原数组*/, callback) : callback(arr);
		},

		fullUrl: function(url, argu){//isAjax|bi
			var url = url || '',
				bi = iCat.isString(argu)? argu : '',
				isAjax = iCat.isBoolean(argu)? argu : false,
				isUrl = /^\w+:\/\//.test(url);

			url = url.replace(/^\//g, '');

			if(iCat.DemoMode && url!=='' && !isUrl){
				url = /[\?#]/.test(url)?
					url.replace(/(\/\w+)([\?#])/g, '$1.php$2') :
						/(\.\w+)$/.test(url)? url : url.replace(/([^\.]\w+)$/g, '$1.php');
			}
			if(!isAjax && bi){
				url = url + (url.indexOf('?')<0? '?':'&') + bi.replace(/[\?&]+/g, '');
			}

			return (isUrl? '' : iCat.PathConfig.pageRef) + url;
		},

		_jsonCompare: function(json1, json2){
			if(!json1 || !json2) return false;
			var _toString = function(json){
				json = iCat.isString(json)? json : JSON.stringify(json);
				json = json.replace(/[\r\t\n\s'"]/g, '');
				return json;
			};
			return _toString(json1) === _toString(json2);
		},

		_str2Hooks: function(str){
			if(!str) return [];

			var s, sid, arrCla = [];
			s = str.match(/(\#[\w\-\d]+)|(\.[\w\-\d]+)/g);
			if(s!=null){
				s.forEach(function(me){
					/^\./.test(me)?
						arrCla.push(me.substring(1)) : (sid = sid || me.substring(1));
				});
			}
			return [sid, arrCla.unique()];
		},

		scroll: Sutil.scroll || function(box, callback){
			var me = iCat.isString(box)? iCat.util.queryOne(box) : box,
				o, nodes, isBody;

			me = me.nodeType!==1? doc.body : me;
			nodes = me.children;
			isBody = me===doc.body;
			if(nodes.length!==1){
				o = doc.createElement('div');
				while(nodes.length){ o.appendChild(nodes[0]); }
				me.appendChild(o);
			} else {
				o = nodes[0];
			}

			(isBody? doc : me).addEventListener('scroll', function(){
				var boxHeight = iCat.util.outerHeight(isBody? root : me),
					boxScrollTop = me!==doc.body? me.scrollTop :
						doc.body.scrollTop || (doc.documentElement && doc.documentElement.scrollTop),
					pannelHeight = iCat.util.outerHeight(o);
				callback(boxHeight, boxScrollTop, pannelHeight);
			}, false);
		}
	});

	iCat.util(
	{
		_matches: Sutil.matches || function(el, selector){
			if(!el || !selector) return false;
			if(el.nodeType!==1 || el==doc.body) return false;//fixed bug:冒泡不能到body以上，会报错(Illegal invocation)

			if(iCat.isjQueryObject(el)){
				return el.closest(selector).length>0;
			} else {
				var match = doc.documentElement.webkitMatchesSelector;
				if(iCat.isString(selector)){
					return match.call(el, selector);
				} else if(iCat.isArray(selector)){
					for(var i=0, len=selector.length; i<len; i++){
						if(match.call(el, selector[i])) return i;
					}
					return false;
				}
			}
		},

		queryAll: Sutil.queryAll || function(selector, context){
			if(!selector) return [];
			return iCat.isString(selector)?
					(context || iCat.elCurWrap || iCat.elBodyWrap || doc).querySelectorAll(selector) : selector;
		},

		queryOne: Sutil.queryOne || function(selector, context){
			if(!selector) return;
			if(iCat.isString(selector)){
				selector = /\:[\d]+/.test(selector)?
					selector.replace(/(\:[\d]+).*/g, '$1').split(':') : [selector];
				return iCat.util.queryAll(selector[0], context)[ selector[1] || 0 ];
			} else
				return selector;
		},

		addClass: function(el, cla){
			if(!el) return;
			var arr = el.className? el.className.split(/\s+/) : [];
			if(!arr.contains(cla)) arr.push(cla);
			el.className = arr.join(' ');
		},

		removeClass: function(el, cla){
			if(!el) return;
			var arr = (el.className || '').split(/\s+/);
			if(arr.contains(cla)) arr.remove(cla);
			el.className = arr.join(' ');
		},

		hasClass: function(el, cla){
			if(!el) return false;
			var arr = (el.className || '').split(/\s+/);
			return arr.contains(cla.trim());
		}
	});
	
	iCat.util(
	{
		/*
		 * 一个参数时表示取数据(同规则：storage, cookie)
		 * 两个及以上的参数时表示存数据
		 */
		storage: function(){
			if(!arguments.length || !root.localStorage || !root.sessionStorage) return;
			
			var ls = root.localStorage,
				ss = root.sessionStorage;
			if(arguments.length==1){
				var dname = arguments[0];
				return iCat.isString(dname)? ( ls.getItem(dname) || ss.getItem(dname) ) : '';
			} else {
				var dname = arguments[0],
					data  = arguments[1],
					shorttime = arguments[2];
				if(iCat.isString(dname)){
					var s = shorttime? ss : ls;
					s.removeItem(dname);
					s.setItem(dname, iCat.isObject(data)? JSON.stringify(data) : data);
				}
			}
		},

		clearStorage: function(dname){
			if(!dname || !root.localStorage || !root.sessionStorage) return;

			var ls = root.localStorage,
				ss = root.sessionStorage;
			if(dname==ls || dname==ss){
				dname.clear();
			} else {
				if(ls[dname]) ls.removeItem(dname);
				if(ss[dname]) ss.removeItem(dname);
			}
		},

		cookie: function(){
			if(!arguments.length) return;

			if(arguments.length==1){
				var dCookie = doc.cookie;
				if(dCookie.length<=0) return;

				var cname = arguments[0],
					cStart = dCookie.indexOf(cname+'=');
				if(cStart!=-1){
					cStart = cStart + cname.length + 1;
					cEnd   = dCookie.indexOf(';', cStart);
					if(cEnd==-1) cEnd = dCookie.length;
					return unescape(dCookie.substring(cStart,cEnd));
				}
			} else {
				var cname = arguments[0], val = arguments[1], seconds = arguments[2] || 60,
					exdate = new Date(), expires = '';
				exdate.setTime( exdate.getTime()+(seconds*1000) );
				expires = '; expires='+exdate.toGMTString();
				doc.cookie = cname + '=' + escape(val) + expires + '; path=/';
			}
		},

		clearCookie: function(cname){
			iCat.View.cookie(cname, '', -1);
		}
	});

	// kinds of width & height
	iCat.foreach({Height:'height', Width:'width'}, function(name, type){
		iCat.foreach(
			{padding:'inner'+name, content:type, '':'outer'+name},
			function(defaultExtra, funName){
				iCat.util[funName] = function(elem){
					if(!elem) return 0;
					return (function(el, type){
						var doc;
						if(el===root){
							return el.document.documentElement['client'+name];
						}
						if(el.nodeType===9){
							doc = el.documentElement;
							return Math.max(
								el.body['scroll'+name], doc['scroll'+name],
								el.body['offset'+name], doc['offset'+name],
								doc['client'+name]
							)
						}
						return el['client'+name];
					})(elem);
				};
			}
		);
	});

	//html engine
	iCat.util(function(tools){
		iCat.Class('Tools',
		{
			init: function(){
				var oSelf = this;
				return {
					zenCoding: function(s){
						if(!s) return '';
						if(/(\<[^\>]+\>)/.test(s)) return s;
						return oSelf._bracket(s.replace(/\s*/g, '')).replace(/\&nbsp;/g, '');
					},

					/*
					 * items = 'header#iHeader.hd + div#iScroll'
					 * items = {'module:3': 'header#iHeader.hd + div#iScroll'}
					 * items = {
							'module:2': 'header#iHeader.hd + div#iScroll + div.aaa.bbb + div.ccc'
							'module:3': 'span.aaa.bbb.ccc*9'
						}
					 */
					makeHtml: function(items, pNode, clear){
						if(!items) return;

						if(iCat.isObject(items)){
							iCat.foreach(items, function(k, item){
								oSelf._makeHtml(item, iCat.util.queryOne(k.trim()), clear);
							});
						}
						else if(iCat.isString(items)){
							oSelf._makeHtml(items, pNode, clear);
						}
					},

					unwrap: function(el){
						if(!el) return;

						var p = el.parentNode,
							uncla = el.className,
							nodes = el.childNodes;
						while(nodes.length>0){
							if(uncla){
								nodes[0].setAttribute('data-unclass', uncla);
							}
							p.insertBefore(nodes[0], el);
						}
						p.removeChild(el);
					}
				};
			},

			_tag: function(t){
				if(!t) return '';
				var s = iCat.util._str2Hooks(t),
					sid, arrCla, rpStr;
				
				arrCla = s[1].length? (' class="'+s[1].join(' ')+'"') : '';
				sid = s[0]? (' id="'+s[0]+'"') : '';
				rpStr = /img|input|br|hr/i.test(t)? ('<$1'+sid+arrCla+' />') : ('<$1'+sid+arrCla+'>&nbsp;</$1>');
				return t = t.replace(/^(\w+).*/g, rpStr);
			},

			_repeat: function(s){
				if(!s) return '';

				var oSelf = this;
				if(s.indexOf('*')<0) return oSelf._tag(s);

				s = s.split('*');
				var str = '';
				for(var i=0; i<s[1]; i++){
					str += oSelf._tag(s[0]);
				}
				return str;
			},

			_sibling: function(s){
				if(!s) return '';

				var oSelf = this;
				if(s.indexOf('+')<0){
					if(s.indexOf('*')!=-1)
						return oSelf._repeat(s);
					else if(s.indexOf('>')!=-1)
						return oSelf._stack(s);
					else
						return oSelf._tag(s);
				}

				s = s.split('+');
				var str = '';
				s.forEach(function(v){
					if(v.indexOf('*')!=-1)
						str += oSelf._repeat(v);
					else if(v.indexOf('>')!=-1)
						str += oSelf._stack(v);
					else
						str += oSelf._tag(v);
				});
				return str;
			},

			_stack: function(s){
				if(!s) return '';

				var oSelf = this;
				if(s.indexOf('>')<0){
					if(s.indexOf('*')!=-1)
						return oSelf._repeat(s);
					else if(s.indexOf('+')!=-1)
						return oSelf._sibling(s);
					else
						return oSelf._tag(s);
				}

				s = s.split('>');
				var str = '&nbsp;';
				s.forEach(function(v){
					if(v.indexOf('*')!=-1)
						str = str.replace(/\&nbsp;/g, oSelf._repeat(v));
					else if(v.indexOf('+')!=-1)
						str = str.replace(/\&nbsp;/g, oSelf._sibling(v));
					else
						str = str.replace(/\&nbsp;/g, oSelf._tag(v));
				});

				return str;
			},

			_bracket: function(s){
				if(!s) return '';

				var oSelf = this;
				if(!/\(|\)/.test(s))
					return s.indexOf('+')? oSelf._sibling(s) : oSelf._stack(s);

				var str;
				if(/\+\s*\([^\)]+/.test(s)){
					str = '';
					s = s.replace(/\+\s*\(([^\)]+)/g, ',$1,');
					s = s.split(',');
					s.forEach(function(v){
						v = v.replace(/\(|\)/g, '');
						str += oSelf._stack(v);
					});
				}
				else if(/\>\s*\(/.test(s)){
					s = s.split('>');
					str = oSelf._stack[s[0]].replace(/\&nbsp;/g, arguments.callee(s[1]));
				}

				return str;
			},

			_makeHtml: function(items, pNode, clear){
				if(!items || !iCat.isString(items)) return;

				var p = pNode, o, shtml;
				if(!p) return;

				if(clear) p.innerHTML = '';
				if(!p.childNodes.length){//拒绝重复
					shtml = iCat.util.zenCoding(items);
					o = doc.createElement('wrap');
					o.innerHTML = shtml || '';
					itemNodes = o.childNodes;
					while(itemNodes.length>0){ p.appendChild(itemNodes[0]); }
					o = null;
				}
			}
		}, iCat.Once);
		
		tools = new iCat.Once.Tools();
		delete iCat.Once.Tools; 
		return tools.init();
	});
	
	//template engine
	iCat.util(function(tools){
		iCat.Class('Tools',
		{
			init: function(){
				var oSelf = this;
				return {
					/*
					 * cfg = {
					 *     scrollWrap/wrap: 父层，没有设置则返回html
					 *     tempId: 模板ID（规则同_fnTmpl）
					 *     hooks: js-hooks，也可以设置伪属性
					 *     delayTime: 惰性加载img，推迟时间点
					 *     blankPic: 占位图片选择器
					 *     callback: 渲染完成后执行回调函数
					 *     onlyChild: 当单页面模式且此值为true时，会先清空再渲染(同clear效果)
					 *     overwrite: 父层有子元素时是否覆盖
					 *     loadCallback: (内部使用)当页面模块化加载时，此为控制函数
					 * }
					 *
					 * before: 是否在旧元素前渲染
					 * clear: 是否先清空再渲染
					 */
					render: function(cfg, data, before, clear){
						if(cfg && data){
							var w = cfg.scrollWrap || cfg.wrap,
								pWrap = iCat.util.queryOne(w);
							iCat.isjQueryObject(pWrap) && (pWrap = pWrap[0]);

							//兼容old-api
							cfg.overwrite = cfg.repeatOverwrite!==undefined? cfg.repeatOverwrite : cfg.overwrite;
							cfg.onlyChild = cfg.oneChild!==undefined? cfg.oneChild : cfg.onlyChild;

							var	o = doc.createElement('wrap'),
								uncla = (cfg.viewId || cfg.tempId) + '-loaded',
								oldNodes = iCat.util.queryAll('*[data-unclass='+uncla+']', pWrap),
								isFirst = !oldNodes.length,
								curNode, html = '';

							try {// fixed bug:如果json不符合模版，报错(此问题已解)
								html = oSelf._fnTmpl(cfg.tempId)(data);
							} catch(e){}

							o.style.display = 'block';
							o.className = uncla;
							o.innerHTML = html;
							
							if(cfg.hooks){//js钩子
								iCat.foreach(cfg.hooks, function(k, arrHook){
									k = oSelf._getWalker(k);
									if(!k) oSelf._joinHook(arrHook, pWrap);
									else {
										var nodes = oSelf._walker(k, [o, pWrap]);
										if(!nodes) return;
										nodes.length===undefined?
											oSelf._joinHook(arrHook, nodes) : 
											nodes.forEach(function(node){
												oSelf._joinHook(arrHook, node);
											});
									}
								});
							}
							html = o.innerHTML;
						} else {
							// 如果没有数据，返回模板函数
							return oSelf._fnTmpl(cfg.tempId);
						}

						// 如果没有父层，返回html字符串
						if(!pWrap) return html;
						
						//辞旧
						if(cfg.onlyChild===undefined) cfg.onlyChild = true;
						if(clear || (iCat.singleMode && cfg.onlyChild)){
							var nodes = pWrap.childNodes;
							while(nodes.length){
								pWrap.removeChild(nodes[0]);
							}
						}

						//迎新
						if(isFirst){
							before?
								pWrap.insertBefore(o, pWrap.firstChild) : pWrap.appendChild(o);
						}
						else {
							if(!pWrap.childNodes.length){
								pWrap.appendChild(o);
							} else {
								pWrap.insertBefore(o, oldNodes[0]);
								for(var i=oldNodes.length-1; i>=0; i--){
									if(cfg.overwrite || !before){
										pWrap.removeChild(oldNodes[i]);
										if(!cfg.overwrite){
											o.insertBefore(oldNodes[i], o.firstChild);
										}
									}
								}
							}
						}
						curNode = iCat.util.queryOne('.'+uncla, pWrap);
						cfg.loadCallback?
							// fixed bug:当模块html为空时，滑动加载有卡的感觉(加上!html)
							cfg.loadCallback(curNode, !html) : iCat.util.unwrap(curNode);

						// 图片默认惰性加载
						iCat.util.lazyLoad(pWrap, cfg.delayTime, cfg.blankPic);
						o = null;

						// 回调函数
						if(cfg.callback) cfg.callback(pWrap, cfg, data);

						// 包含表单
						var form = /form/i.test(pWrap.tagName) ?
								pWrap : iCat.util.queryOne('form', pWrap);
						if(!form) return;

						return function(format){
							format = format || 'string';
							var jsonFormat = /json/i.test(format),
								argus = jsonFormat? {} : '';

							iCat.foreach(form.elements, function(i, el){
								var key = el.getAttribute('name'), value = el.value;
								if(key){
									jsonFormat?
										argus[key] = value : argus += '&' + key + '=' + value;
								}
							});
							return jsonFormat? argus : argus.replace(/^&/, '');
						};
					},

					/*
					 * cfg = {
					 *      viewId: mvc模式下，每一个view的id
					 *      dataSave: 是否存储数据，默认存入localStorage
					 *      dataKey: 可选，与viewId一起组成keyStorage，没有则只有viewId成为keyStorage
					 *      ajaxUrl: ajax请求地址
					 *      globalKey: 单页面时，全局数据的key
					 *      overwrite: 是否覆盖
					 * }
					 */
					fetch: function(cfg, callback){
						if(!cfg) return;

						var keyStorage,
							IMData = cfg.viewId? iCat.Model.__pageData[cfg.viewId] : {},
							ownData = IMData.ownData,
							online = navigator.onLine==true;

						//兼容old-api
						cfg.dataSave = cfg.isSave!==undefined? cfg.isSave : cfg.dataSave;
						cfg.dataKey = cfg.key!==undefined? cfg.key : cfg.dataKey;
						cfg.overwrite = cfg.repeatOverwrite!==undefined? cfg.repeatOverwrite : cfg.overwrite;

						if(cfg.dataSave){
							cfg.dataKey = cfg.dataKey || '';
							keyStorage = (cfg.viewId || cfg.tempId) + cfg.dataKey;
						}

						if(online && cfg.ajaxUrl){
							oSelf._ajaxFetch(cfg, callback, ownData, keyStorage);
						}
						else {
							!!cfg.globalKey?
								oSelf._globalFetch(cfg, callback, ownData) :
								oSelf._storageFetch(cfg, callback, ownData, keyStorage);
						}
					},

					save: function(key, data, overwrite){//overwrite是否覆盖
						return oSelf._dataSave(key, data, overwrite);
					},

					remove: function(key){
						if(!key) return;
						iCat.isArray(key)?
							key.forEach(function(k){ oSelf._dataRemove(k); }) : oSelf._dataRemove(key);
					}
				};
			},

			_tmpl: function(tempId, data, strTmpl){
				if(!tempId) return;

				var cacheFuns = iCat.__cache_funs = iCat.__cache_funs || {},
					fnEmpty = function(){return '';},
					fBody;
				if(cacheFuns[tempId]){
					return data? cacheFuns[tempId](data) : cacheFuns[tempId];
				} else {
					if(!strTmpl) return fnEmpty;
					strTmpl = strTmpl.replace(/[\r\t\n]/g, '');
					fBody = "var __p_fun = [], _self = jsonData;with(jsonData){" +//typeof $1!='undefined' fixe bug:当json不包含某字段时，整个函数执行异常
								"__p_fun.push('" + strTmpl.replace(/<%=(.*?)%>/g, "',(typeof $1!='undefined'? $1:''),'").replace(/<%(.*?)%>/g, "');$1__p_fun.push('") + "');" +
							"};return __p_fun.join('');";
					
					cacheFuns[tempId] = new Function("jsonData", fBody);
					return data? cacheFuns[tempId](data) : cacheFuns[tempId];
				}
			},

			/*
			 * 根据tempId获得模板函数
			 * tempId可以是字符串ID，jquery对象，dom对象
			 */
			_fnTmpl: function(tempId){
				tempId = iCat.isString(tempId)? tempId.trim() : tempId;

				var cacheTmpls = iCat.__cache_tmpls = iCat.__cache_tmpls || {};
				var cacheFuns = iCat.__cache_funs = iCat.__cache_funs || {};
				var _fn, sTmpl, oSelf = this;

				// cacheTmpls的解析
				if(iCat.isEmptyObject(cacheTmpls)){
					iCat.foreach(iCat.app, function(k, app){
						if(app.template){
							iCat.foreach(app.template, function(k, v){
								cacheTmpls[k] = v.replace(/[\r\t\n]/g, '');
							});
						}
					});
				}

				// tempId的解析
				if(cacheFuns[tempId]){// 已有模板函数
					_fn = cacheFuns[tempId];
				} else if(cacheTmpls[tempId]) {// 已有模板字符串
					_fn = oSelf._tmpl( tempId, undefined, cacheTmpls[tempId] );
					cacheFuns[tempId] = _fn;
				} else if(iCat.isjQueryObject(tempId)){// jquery对象
					_fn = oSelf._tmpl( tempId, undefined, tempId.html() );
					cacheFuns[tempId] = _fn;
				} else if(iCat.isString(tempId) || iCat.isObject(tempId)){// dom/选择器/id
					var el = iCat.isObject(tempId)?
							tempId : /\.|#|\[[\w\$\^\*\=]+\]/.test(tempId)?
								iCat.util.queryOne(tempId) : doc.getElementById(tempId);
					sTmpl = el? el.innerHTML.replace(/[\r\t\n]/g, '').replace(/\s+(<)|\s*$/g, '$1') : '';
					cacheFuns[tempId] = _fn = oSelf._tmpl(tempId, undefined, sTmpl);
					cacheTmpls[tempId] = sTmpl;
				}

				return _fn;
			},

			/*
			 * hooks = '.xxx#aaa.yyy.zzz'
			 * hooks = ['.aaa.bbb#ccc', 'data-ajaxUrl~http://www.baidu.com']
			 */
			_joinHook: function(hooks, el){
				if(!hooks || !el) return;
				hooks = iCat.isArray(hooks)? hooks : [hooks];
				hooks.forEach(function(v){
					if(!v) return;

					if(/\w*~.*/.test(v)){
						v = v.split('~');
						el.setAttribute(v[0]/*.replace(/^(\s|data-)?/, 'data-')*/, v[1]);
					} else {
						v = iCat.util._str2Hooks(v);
						var oldClass = el.className? el.className.trim().split(/\s+/) : [],
							newClass = v[1].concat(oldClass).unique();
						if(v[0]) el.id = v[0];
						if(newClass.length) el.className = newClass.join(' ');
					}
				});
			},

			/*
			 * & : 本父层
			 * &>2(:*) : 第三层<所有子元素>
			 * &>1:.item : 第二层<.item子元素>
			 * &>1:3 : 第二层<子元素>的第四个元素
			 * &<0 : 第一层<父元素>
			 */
			_getWalker: function(s){
				if(!/^&[<>]\d+/.test(s)) return;
				return s.indexOf('>')!=-1?
					{'c': s.replace(/^&>(\d+\:?[\d\w\.\*#]*).*/, '$1').split(':')} : {'p': s.replace(/^&<(\d+).*/, '$1')};
			},

			/*
			 * o = {'c': ['0','1']}
			 * o = {'c': ['1', '*']} = {'c': ['1']}
			 * o = {'p': '1'}
			 */
			_walker: Sutil._walker || function(o, ref){
				if(o.c){
					var a = parseInt(o.c[0]), b = o.c[1] || '*',
						isSelector = !iCat.isNumber(b),// fixed bug:非数字即是选择器
						filter = null;
					b = isSelector? b : parseInt(b);
					ref = ref[0];//指向创建的div
					if(!ref) return;

					if(a==0){ 
						if(isSelector){
							var arrNode = [];
							iCat.foreach(ref.children, function(i, v){
								if(iCat.util._matches(v, b)) arrNode.push(v);
							});
							return arrNode;
						} else
							return ref.children[b];
					} else {
						var walker = doc.createTreeWalker(ref, NodeFilter.SHOW_ELEMENT, filter, false),
							cp, cnodes;
						for(var i=0; i<a; i++){
							if(i==a-1){
								cp = walker.nextNode();
							} else {
								walker.nextNode();
							}
						}
						if(isSelector){
							cnodes = [];
							while(cp){
								iCat.foreach(cp.children, function(i, v){
									if(iCat.util._matches(v, b)){
										cnodes.push(v);
									}
								});
								cp = walker.nextSibling();
							}
						} else {
							cnodes = cp.children;
						}
						return isSelector? cnodes : cnodes[b];
					}
				} else {
					var num = parseInt(o.p) + 1;
					return function(){
						var px = ref[1];//指向父层
						if(!px) return;

						for(var i=0; i<num; i++){
							px = px.parentNode;
							if(px===doc.body) break;
						}
						return px;
					}();
				}
			},

			_ajaxFetch: function(cfg, callback, ownData, keyStorage){
				if(!iCat.util.ajax && iCat.$) iCat.rentAjax(iCat.$.ajax);
				var oSelf = this;

				cfg.ajaxUrl = iCat.util.fullUrl(cfg.ajaxUrl, true);
				iCat.util.ajax({
					type: 'POST', timeout:10000,
					url: cfg.ajaxUrl,
					cache: false,
					success: function(data){
						var _data = JSON.stringify(data);

						if(cfg.globalKey)
							iCat.Model.GlobalData(cfg.globalKey, data);
						if(keyStorage)
							oSelf._dataSave(keyStorage, _data, cfg.overwrite);

						iCat.mix(data, ownData);
						if(callback) callback(data);
					},
					error: function(){
						oSelf._storageFetch(cfg, callback, ownData, keyStorage);
					}
				});
			},

			_globalFetch: function(cfg, callback, ownData){
				iCat.util.wait(function(k, t){
					var gData = iCat.Model.GlobalData(cfg.globalKey);
					if(!gData){
						iCat.__cache_timers[k] = false;
						return;
					}
					delete iCat.__cache_timers[k];

					iCat.mix(gData, ownData);
					if(callback) callback(gData);
				}, undefined, 10);
			},

			_storageFetch: function(cfg, callback, ownData, keyStorage){
				var data = {}, arr = [];
				if(keyStorage){
					data = iCat.util.storage(keyStorage) || iCat.util.storage(keyStorage+'Repeat') || {};
				}

				if(iCat.isString(data)){
					if(/Repeat_\d+/.test(data)){
						data = data.split(',');
						data.forEach(function(k){
							var item = JSON.parse(iCat.util.storage(k));
								item['rkey'] = k;
							arr.push(item);
						});
						data = { repeatData: arr };
					} else {
						data = JSON.parse(data);
					}
				}

				iCat.mix(data, ownData);
				if(callback) callback(data);
			},

			_dataSave: function(key, data, overwrite){
				if(!key || !data) return;
				if(iCat.isUndefined(overwrite)) overwrite = true;

				var firstData = iCat.util.storage(key),
					arrKeys = iCat.util.storage(key+'Repeat'),//索引
					repeatKeys = iCat.util.storage('repeatKeys'), _key,
					_repeatStore = function(d, arr){
						if(iCat.isArray(d)){
							iCat.util.clearStorage(key);
							repeatKeys[key] = true;
							iCat.util.storage('repeatKeys', repeatKeys);
							d.forEach(function(v){ _repeatStore(v, arr); });
						} else {
							var prevData = arr[0]? iCat.util.storage(arr[0]) : '';
							if(iCat.util._jsonCompare(prevData, d)) return;//拒绝重复
							var k = key + 'Repeat_' + arr.length + '_' + Math.floor(Math.random()*1000+1);
							arr.unshift(k);
							iCat.util.storage(key+'Repeat', arr.join(','));
							iCat.util.storage(k, d);
						}
					};
				
				repeatKeys = repeatKeys? JSON.parse(repeatKeys) : {};
				_key = key.replace(/repeat_\d+.*/gi, '');
				if(repeatKeys[_key]===undefined || overwrite){//第一次或可以覆盖
					iCat.util.storage(key, data);
					if(repeatKeys[_key]===undefined){
						repeatKeys[_key] = false;
						iCat.util.storage('repeatKeys', repeatKeys);
					}
					return _key;
				}

				if(iCat.util._jsonCompare(firstData, data)) return _key;//拒绝重复

				data = firstData? [firstData, data] : data;
				arrKeys = arrKeys? arrKeys.split(',') : [];
				_repeatStore(data, arrKeys);
				return arrKeys;
			},

			_dataRemove: function(key){
				if(key.indexOf('Repeat_')>0){
					var indexKey = key.replace(/(Repeat)_\d+.*/g, '$1'),
						arrKeys = iCat.util.storage(indexKey).split(',');
					arrKeys.remove(key);
					iCat.util.storage(indexKey, arrKeys.join(','));
				}
				iCat.util.clearStorage(key);
			}
		}, iCat.Once);

		tools = new iCat.Once.Tools();
		delete iCat.Once.Tools; 
		return tools.init();
	});
	
	// Game over
	delete iCat.Once;
}).call(this);