/* util.js # */
(function(iCat, root, doc){
	var REGEXP_SELECTOR  = /\.|#|\[[\w\$\^\*\=]+\]/;
	var REGEXP_SINGLEURL = /^\w+:\/\/|^\/\w+/;
	var REGEXP_SOURCE    = /(\.source)?(\.(js|css))/g;
	var Sutil = iCat.Shim.util || {};

	var Util = {
		
		/* functions for render
		 -----------------------------*/
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

		//根据tempId获得模板函数
		_fnTmpl: function(tempId){
			tempId = iCat.isString(tempId)? tempId.trim() : tempId;

			var cacheTmpls = iCat.__cache_tmpls = iCat.__cache_tmpls || {};
			var cacheFuns = iCat.__cache_funs = iCat.__cache_funs || {};
			var _fn, sTmpl;

			// cacheTmpls的解析
			if(iCat.isEmptyObject(cacheTmpls)){
				iCat.foreach(iCat.app, function(k, v){
					if(this.template){
						iCat.foreach(this.template, function(k, v){
							cacheTmpls[k] = v.replace(/[\r\t\n]/g, '');
						});
					}
				});
			}

			// tempId的解析
			if(cacheFuns[tempId]){// 已有模板函数
				_fn = cacheFuns[tempId];
			} else if(cacheTmpls[tempId]) {// 已有模板字符串
				_fn = Util._tmpl( tempId, undefined, cacheTmpls[tempId] );
				cacheFuns[tempId] = _fn;
			} else if(iCat.isjQueryObject(tempId)){// jquery对象
				_fn = Util._tmpl( tempId, undefined, tempId.html() );
				cacheFuns[tempId] = _fn;
			} else if(iCat.isString(tempId) || iCat.isObject(tempId)){// dom/选择器/id
				var el = iCat.isObject(tempId)?
						tempId : REGEXP_SELECTOR.test(tempId)?
							iCat.util.queryOne(tempId) : doc.getElementById(tempId);
				sTmpl = el? el.innerHTML.replace(/[\r\t\n]/g, '').replace(/\s+(<)|\s*$/g, '$1') : '';
				cacheFuns[tempId] = _fn = Util._tmpl(tempId, undefined, sTmpl);
				cacheTmpls[tempId] = sTmpl;
			}

			return _fn;
		},

		/*
		 * hooks = '.xxx#aaa.yyy.zzz' | ['.aaa.bbb#ccc', 'data-ajaxUrl~http://www.baidu.com']
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
					v = iCat.util.getIdClass(v);
					var oldClass = (el.className || '').trim().split(/\s+/),
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
					isSelector = /[#\.\*]/.test(b),
					filter = null;
				b = isSelector? b : parseInt(b);
				ref = ref[0];//指向创建的div
				if(!ref) return;

				if(a==0){
					return isSelector? iCat.toArray(ref.children).filter(function(v){
						return iCat.util.matches(v, b);
					}) : ref.children[b];
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
								if(iCat.util.matches(v, b)){
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


		/* functions for zenCoding
		 -----------------------------*/
		_tag: function(t){
			if(!t) return '';
			var s = iCat.util.getIdClass(t),
				sid, arrCla, rpStr;
			
			arrCla = s[1].length? (' class="'+s[1].join(' ')+'"') : '';
			sid = s[0]? (' id="'+s[0]+'"') : '';
			rpStr = /img|input|br|hr/i.test(t)? ('<$1'+sid+arrCla+' />') : ('<$1'+sid+arrCla+'>&nbsp;</$1>');
			return t = t.replace(/^(\w+).*/g, rpStr);
		},

		_repeat: function(s){
			if(!s) return '';
			if(s.indexOf('*')<0) return Util._tag(s);

			s = s.split('*');
			var str = '';
			for(var i=0; i<s[1]; i++){
				str += Util._tag(s[0]);
			}
			return str;
		},

		_sibling: function(s){
			if(!s) return '';
			if(s.indexOf('+')<0){
				if(s.indexOf('*')!=-1)
					return Util._repeat(s);
				else if(s.indexOf('>')!=-1)
					return Util._stack(s);
				else
					return Util._tag(s);
			}

			s = s.split('+');
			var str = '';
			s.forEach(function(v){
				if(v.indexOf('*')!=-1)
					str += Util._repeat(v);
				else if(v.indexOf('>')!=-1)
					str += Util._stack(v);
				else
					str += Util._tag(v);
			});
			return str;
		},

		_stack: function(s){
			if(!s) return '';
			if(s.indexOf('>')<0){
				if(s.indexOf('*')!=-1)
					return Util._repeat(s);
				else if(s.indexOf('+')!=-1)
					return Util._sibling(s);
				else
					return Util._tag(s);
			}

			s = s.split('>');
			var str = '&nbsp;';
			s.forEach(function(v){
				if(v.indexOf('*')!=-1)
					str = str.replace(/\&nbsp;/g, Util._repeat(v));
				else if(v.indexOf('+')!=-1)
					str = str.replace(/\&nbsp;/g, Util._sibling(v));
				else
					str = str.replace(/\&nbsp;/g, Util._tag(v));
			});

			return str;
		},

		_bracket: function(s){
			if(!s) return '';
			if(!/\(|\)/.test(s))
				return s.indexOf('+')? Util._sibling(s) : Util._stack(s);

			var str;
			if(/\+\s*\([^\)]+/.test(s)){// 形如：div.a+(div.b>ul>li>div+span)+div.c>a>img | div.a+(div.b>ul>li>span)+div.c>a>img
				str = '';
				s = s.replace(/\+\s*\(([^\)]+)/g, ',$1,');
				s = s.split(',');
				s.forEach(function(v){
					v = v.replace(/\(|\)/g, '');
					str += Util._stack(v);
				});
			}
			else if(/\>\s*\(/.test(s)){// 形如：div.a>(div.b+(div.c>ul>li>span)+div.d>h1>strong) | div.a>(div.b+div.c>ul>li>span)
				s = s.split('>');
				str = Util._stack[s[0]].replace(/\&nbsp;/g, arguments.callee(s[1]));
			}

			return str;
		}
	};

	iCat.foreach({Height:'height', Width:'width'}, function(name, type){
		iCat.foreach({padding:'inner'+name, content:type, '':'outer'+name}, function(defaultExtra, funName){
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
		});
	});

	/*-------------------------------------------*
	 * fns for base
	 *-------------------------------------------*/
	iCat.util({
		getIdClass: function(str){
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

		recurse: function(arr, callback){//递归
			if(iCat.isArray(arr)){
				(function(a, i, cb){
					if(i<a.length){
						cb(a[i]);
						arguments.callee(a, i+1, cb);
					}
				})(arr, 0, callback);
			} else {
				callback(arr);
			}
		},

		matches: Sutil.matches || function(el, selector){
			if(iCat.isjQueryObject(el)){
				return el.closest(selector).length>0;
			} else {
				//fixed bug:冒泡不能到body以上，会报错(Illegal invocation)
				if(!selector || el==null || el==doc.body.parentNode || el==doc) return;
				var match = doc.documentElement.webkitMatchesSelector;

				if(iCat.isString(selector)){
					return match.call(el,selector);
				} else if(iCat.isArray(selector)){
					for(var i=0, len=selector.length; i<len; i++){
						if(match.call(el,selector[i])) return i;
					}
					return false;
				}
			}
		},

		queryOne: Sutil.queryOne || function(s, el){
			if(!s) return;

			if(iCat.isString(s)){
				s = /\:[\d]+/.test(s)?
					s.replace(/(\:[\d]+).*/g, '$1').split(':') : [s];
				return (el || iCat.el_bodyWrap || doc).querySelectorAll(s[0])[ s[1] || 0 ];
			} else
				return s;
		},

		queryAll: Sutil.queryAll || function(selector, el){
			if(!selector) return;
			return iCat.isString(selector)?
					(el || iCat.el_bodyWrap || doc).querySelectorAll(selector) : selector;
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
		},

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
		},

		_inherit: function(Class, option){
			var Cla = function(){
				var argus = iCat.toArray(arguments);
				if(option){
					argus[1] = argus[1] || {};// fixed bug:如果没有第二个参数时，会合并不了
					argus[1].config = argus[1].config || {};
					iCat.mix(argus[1].config, option['config'], undefined, false); //此处false防止公用的config覆盖实例化的config
					iCat.foreach(option, function(k, v){
						// fixed bug:取或(||)时，最后一个config覆盖了前面的config
						if(k!='config' && !iCat.isFunction(v)) argus[1][k] = v;
					});
				}
				var ret = Class.apply(this, argus);
				if(ret) return ret;// fixed bug: 当已有某实例化对象时，应返回它
			};
			iCat.mix(Cla.prototype, Class.prototype);
			if(Cla.prototype.constructor==Object.prototype.constructor){
			    Cla.prototype.constructor = Cla;
			}
			if(option){
				iCat.foreach(option, function(k, v){
					if(iCat.isFunction(v)) Cla.prototype[k] = v;
				});
			}
			Cla.__super__ = Class;
			return Cla;
		}
	});

	/*-------------------------------------------*
	 * fns for event
	 *-------------------------------------------*/
	iCat.util({
		parentIfText: function(node){
			return 'tagName' in node? node : node.parentNode;
		},

		bubble: function(node, cb){
			if(!node) return;
			while(node!==doc.body){
				if(cb && iCat.isFunction(cb)){
					if(cb(node)==false) break;
				}
				if(node.parentNode) node = node.parentNode;
				else break;
			}
		},

		throttle: function(opt){
			var timer = null, t_start;

			var fn = opt.callback,
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
		}
	});

	/*-------------------------------------------*
	 * fns for mvc
	 *-------------------------------------------*/
	iCat.util(
	{
		/*
		 * t: 多少毫秒执行取图片
		 * imgSelector: 选择器
		 */
		lazyLoad: function(pNode, t, imgSelector){
			if(!pNode) return;
			pNode = iCat.util.queryOne(pNode);
			imgSelector = imgSelector || 'img[src$="blank.gif"]';
			var imgs = iCat.toArray(
				iCat.util.queryAll(imgSelector, pNode)
			);
			
			t = t || 500;
			setTimeout(function(){
				imgs.forEach(function(o){
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
				});
			}, t);
		},

		/*
		 * tempId可以是字符串，jquery对象/dom对象
		 * clear表示是否先清空再渲染
		 */
		render: function(cfg, data, before, clear){
			if(iCat.isString(cfg.tempId))
				cfg.tempId = cfg.tempId.trim();

			if(cfg && data){
				var baseWrap = iCat.el_curWrap,
					w = cfg.wrap || cfg.scrollWrap,
					pWrap = w? iCat.util.queryOne(w, baseWrap) : baseWrap,
					o = doc.createElement('wrap'),
					uncla = cfg.viewId + '-loaded',
					oldNodes = iCat.toArray(
						iCat.util.queryAll('*[data-unclass='+uncla+']', pWrap)
					),
					isFirst = !oldNodes.length,
					curNode, html = '';

				try {// fixed bug:如果json不符合模版，报错(此问题已解)
					html = Util._fnTmpl(cfg.tempId)(data);
				} catch(e){}

				o.style.display = 'block';
				o.className = uncla;
				o.innerHTML = html;
				
				if(cfg.hooks){//js钩子
					iCat.foreach(cfg.hooks, function(k, arrHook){
						k = Util._getWalker(k);
						if(!k) Util._joinHook(arrHook, pWrap);
						else {
							var nodes = Util._walker(k, [o, pWrap]);
							if(!nodes) return;
							nodes.length===undefined?
								Util._joinHook(arrHook, nodes) : 
								nodes.forEach(function(node){
									Util._joinHook(arrHook, node);
								});
						}
					});
				}
				html = o.innerHTML;
			} else {
				// 如果没有数据，返回模板函数
				return Util._fnTmpl(cfg.tempId);
			}

			// 如果没有父层，返回html字符串
			if(!pWrap) return html;
			
			//辞旧
			if(cfg.oneChild===undefined) cfg.oneChild = true;
			if(clear || (iCat.singleWrap && cfg.oneChild)){
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
				pWrap.insertBefore(o, oldNodes[0]);
				for(var i=oldNodes.length-1; i>=0; i--){
					if(cfg.repeatOverwrite) pWrap.removeChild(oldNodes[i]);
					else {
						if(cfg.repeatHide) iCat.util.addClass(oldNodes[i], 'hidden');
						if(!before){
							o.insertBefore(oldNodes[i], o.firstChild);
						}
					}
				}
			}
			curNode = iCat.util.queryOne('.'+uncla, pWrap);
			cfg.loadCallback?
				cfg.loadCallback(curNode, !html)// fixed bug:当模块html为空时，滑动加载有卡的感觉
				: iCat.util.unwrap(curNode);

			// 图片默认惰性加载
			iCat.util.lazyLoad(pWrap, cfg.lazyimgTime, cfg.defImage);
			o = null;

			// 回调函数
			if(cfg.callback) cfg.callback(pWrap);

			// 包含表单
			var form = /form/i.test(pWrap.tagName) ?
					pWrap : iCat.util.queryOne('form', pWrap);
			if(form)
				return function(format){
					format = format || 'string';
					var jsonFormat = /json/i.test(format),
						argus = jsonFormat? {} : '';

					iCat.toArray(form.elements).forEach(function(el){
						var key = el.getAttribute('name'), value = el.value;
						if(key){
							jsonFormat?
								argus[key] = value : argus += '&' + key + '=' + value;
						}
					});
					return jsonFormat? argus : argus.replace(/^&/, '');
				}
		},

		fetch: function(cfg, callback, onLine){
			if(!cfg || !iCat.isObject(cfg)) return;

			var fn = arguments.callee, keyStorage,
				ownData = iCat.Model.__pageData[cfg.viewId].ownData;

			if(onLine===undefined) onLine = true;
			   onLine = onLine && true;//navigator.onLine==true;
			if(cfg.isSave){
				cfg.key = cfg.key || '';
				keyStorage = cfg.viewId + cfg.key;
			}

			if(onLine && cfg.ajaxUrl){//ajax取数据
				if(!iCat.util.ajax)
					iCat.$ && iCat.rentAjax(iCat.$.ajax);
				iCat.util.ajax({
						type: 'POST', timeout:10000,
						url: iCat.util.fullUrl(cfg.ajaxUrl, true),
						cache: false
					},
					function(data){
						var _data = JSON.stringify(data);
						iCat.mix(data, ownData);
						if(keyStorage)
							iCat.util.save(keyStorage, _data, cfg.repeatOverwrite);
						if(callback && iCat.isFunction(callback)){
							callback(data);
						}
					},
					function(){ fn(cfg, callback, false); }
				);
			} else {//本地取数据
				var arr,
					data = keyStorage?
						(iCat.util.storage(keyStorage) || iCat.util.storage(keyStorage+'Repeat')) : {};
				if(iCat.isNull(data)) data = {};// fixed bug:当ajax和缓存无法获取数据时，return会使后续模块无法加载

				if(iCat.isString(data)){
					if(/Repeat_\d+/.test(data)){
						arr = [];
						data = data.split(',');
						data.forEach(function(k){
							var item = JSON.parse(iCat.util.storage(k));
								item['rkey'] = k;
							arr.push(item);
						});
						data = { Drepeat: arr };
					} else {
						data = JSON.parse(data);
					}
				}
				iCat.mix(data, ownData);
				if(callback && iCat.isFunction(callback)){
					callback(data);
				}
			}
		},

		save: function(key, data, ov){//overwrite是否覆盖
			if(!key || !data) return;

			var firstData = iCat.util.storage(key),
				arrKeys = iCat.util.storage(key+'Repeat'),//索引
				repeatKeys = iCat.util.storage('repeatKeys'), _key,
				
				_repeatStore = function(d, arr){
					if(iCat.isArray(d)){
						var fn = arguments.callee;
						iCat.util.clearStorage(key);
						repeatKeys[key] = true;
						iCat.util.storage('repeatKeys', repeatKeys);
						d.forEach(function(v){ fn(v, arr); });
					} else {
						var prevData = arr[0]? iCat.util.storage(arr[0]) : '';
						if(iCat.util.jsonCompare(prevData, d)) return;//拒绝重复

						var k = key + 'Repeat_' + arr.length + '_' + Math.floor(Math.random()*1000+1);
						arr.unshift(k);
						iCat.util.storage(key+'Repeat', arr.join(','));
						iCat.util.storage(k, d);
					}
				};
			
			repeatKeys = repeatKeys?
							JSON.parse(repeatKeys) : {};
			_key = key.replace(/repeat_\d+.*/gi, '');
			if(repeatKeys[_key]===undefined || ov){//第一次或可以覆盖
				iCat.util.storage(key, data);
				if(repeatKeys[_key]===undefined){
					repeatKeys[_key] = false;
					iCat.util.storage('repeatKeys', repeatKeys);
				}
				return;
			}

			if(iCat.util.jsonCompare(firstData, data)) return;//拒绝重复

			data = firstData? [firstData, data] : data;
			arrKeys = arrKeys? arrKeys.split(',') : [];
			_repeatStore(data, arrKeys);
		},

		remove: function(key){
			if(!key) return;
			if(iCat.isArray(key)){
				var fn = arguments.callee;
				key.forEach(function(k){ fn(k); });
			} else {
				if(key.indexOf('Repeat_')>0){
					var indexKey = key.replace(/(Repeat)_\d+.*/g, '$1'),
						arrKeys = iCat.util.storage(indexKey).split(',');
					arrKeys.remove(key);
					iCat.util.storage(indexKey, arrKeys.join(','));
				}
				iCat.util.clearStorage(key);
			}
		},

		fullUrl: function(url, argu){//isAjax|bi
			var url = url || '',
				bi = iCat.isString(argu)? argu : '',
				isAjax = iCat.isBoolean(argu)? argu : false,
				isUrl = /^\w+:\/\//.test(url);

			url = url.replace(/^\//g, '');

			if(iCat.DemoMode && url!=='' && !isUrl){
				if(url.indexOf('.')<0)
					url = url.indexOf('?')<0? (url+'.php') : url.replace(/(\?)/g, '.php$1');
			}
			if(!isAjax && bi){
				url = url + (url.indexOf('?')<0? '?':'&') + bi.replace(/[\?&]+/g, '');
			}

			return (isUrl? '' : iCat.PathConfig.pageRef) + url;
		},

		jsonCompare: function(json1, json2){
			if(!json1 || !json2) return false;
			var _toString = function(json){
				json = iCat.isString(json)? json : JSON.stringify(json);
				json = json.replace(/[\r\t\n\s'"]/g, '');
				return json;
			};
			return _toString(json1) === _toString(json2);
		},

		scroll: Sutil.scroll || function(pannel, callback){
			var me = iCat.isString(pannel)? iCat.util.queryOne(pannel) : pannel;
			me = me==root || me==doc.body? doc : me;
			iCat.Event.on(me, 'scroll', function(){
				var sh = iCat.util.outerHeight(me),
					st = me==doc?
						doc.body.scrollTop || (doc.documentElement && doc.documentElement.scrollTop)
						: me.scrollTop;
				callback( sh, st, iCat.util.outerHeight(me) );
			});
		},

		zenCoding: function(s){
			if(!s) return '';
			if(/(\<[^\>]+\>)/.test(s)) return s;
			return Util._bracket(s.replace(/\s*/g, '')).replace(/\&nbsp;/g, '');
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
				var fn = arguments.callee;
				iCat.foreach(items, function(k, item){
					k = k.trim();
					fn(item, iCat.util.queryOne(k));
				});
			}
			else if(iCat.isString(items)){
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
		},

		// 
		
		/*
		 * objHash = {
			'help'                 : 'help',
			'search/:query'        : 'search\/(\w+)',
			'search/:query/p:page' : 'search\/(\w+)\/p(\w+)''
		   }
		 *
		 * return [pid, argus]
		*/
		 
		dealHash: function(s, objHash){
			if(!s) return [''];

			s = s.replace(/\s+/g, '').match(/[^\#]+/g)[0];
			if(s.indexOf('/')<0)
				return [s];
			else {
				/*
				 * Examples:
				 * #help            = "help"
				 * #search/kiwis    = "search/:query"
				 * #search/kiwis/p7 = "search/:query/p:page"
				 */
				if(!objHash) return;
				var _s;
				iCat.foreach(objHash, function(k, fn){
					var _exp = new RegExp('^'+k+'$', 'i'),
						argus = k.match(/\([^\)]+\)/g),
						querys = '', len;
					if(argus && (len=argus.length)){
						argus.forEach(function(v, i){
							querys += '$' + (i+1) + (i==len-1? '':',');
						});
					}
					if(_exp.test(s)){
						s = s.replace(_exp, querys);
						s = s.split(',');
						s.unshift(k);
						_s = s;
						return false;
					}
				});

				return _s || [''];
			}
		}
	});

	/*-------------------------------------------*
	 * fns for loader
	 *-------------------------------------------*/
	iCat.util({
		getCurrentJS: function(){
			var scripts = doc.getElementsByTagName('script');
			return scripts[scripts.length-1];
		},

		/*
		 * type1: 参照sys目录
		 * type2: 参照页面根目录
		 * type3: 参照main.js目录
		 * type4: 网址
		 */
		_fullUrl: function(strPath, isConcat){
			var _line = isConcat? '_' : '',
				appRef = iCat.PathConfig[_line+'appRef'],
				sysRef = iCat.PathConfig[_line+'sysRef'],
				pageRef = iCat.PathConfig.pageRef;
			strPath = strPath.replace(/\?.*/, '');

			if(/^\.{1,2}\//.test(strPath)){//type3
				strPath = /^\.\//.test(strPath) ?
					strPath.replace(/^\.\//g, appRef) : strPath.replace(/^\.\.\//g, appRef.replace(/\w+\/$/g,''));
			}
			else if(/^\/\w+/.test(strPath)){//type2
				strPath = strPath.replace(/^\//g, pageRef);
			}
			else if(/^\w+:\/\//.test(strPath)) {//type4
				strPath = strPath;
			}
			else {//type1
				strPath = sysRef + strPath;
			}

			return strPath;
		},

		getURL: function(arr, isSingle){//isSingle表示强制单个加载
			if(!iCat.isArray(arr) || !arr.length) return;
			if(arr.length===1) isSingle = true;

			var singleArr = [], newArr = [],
				isConcat = iCat.PathConfig._isConcat && !isSingle;
			arr.forEach(function(v){
				v = iCat.util._fullUrl(v, isConcat);
				if(iCat.DebugMode){
					v = v.indexOf('!')>=0 ?
							v.replace(/\!/g,'') : v.replace(REGEXP_SOURCE,'.source$2');
				} else {
					v = v.replace(/\!/g,'');
				}
				REGEXP_SINGLEURL.test(v)?//type4|type2
					singleArr.push(v) : newArr.push(v);
			})
			newArr = isConcat? [iCat.PathConfig._webRoot + newArr.join(',')] : newArr;
			return newArr.concat(singleArr);
		}
	});
})(ICAT, this, document);