/* mvc.js # */
(function(iCat, root, doc){

	/* 本模块公用方法 */
	iCat.util({
		lazyLoad: function(pNode, t){
			if(!pNode) return;
			pNode = iCat.util.queryOne(pNode);
			var imgs = iCat.toArray(
				iCat.util.queryAll('img[src$="blank.gif"]', pNode)
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
				_fn = iCat.util._tmpl( tempId, undefined, cacheTmpls[tempId] );
				cacheFuns[tempId] = _fn;
			} else if(iCat.isjQueryObject(tempId)){// jquery对象
				_fn = iCat.util._tmpl( tempId, undefined, tempId.html() );
				cacheFuns[tempId] = _fn;
			} else if(iCat.isString(tempId) || iCat.isObject(tempId)){// dom/选择器/id
				var el = iCat.isObject(tempId)?
						tempId : /[\.#]/.test(tempId)?
							iCat.util.queryOne(tempId) : doc.getElementById(tempId);
				_fn = iCat.util._tmpl(
					tempId, undefined, el? el.innerHTML : ''
				);
				cacheFuns[tempId] = _fn;
				cacheTmpls[tempId] = sTmpl;
			}

			return _fn;
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
				fBody = "var __p_fun = [];with(jsonData){" +
							"__p_fun.push('" + strTmpl.replace(/<%=(.*?)%>/g, "',$1,'").replace(/<%(.*?)%>/g, "');$1__p_fun.push('") + "');" +
						"};return __p_fun.join('');";
				
				cacheFuns[tempId] = new Function("jsonData", fBody);
				return data? cacheFuns[tempId](data) : cacheFuns[tempId];
			}
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
					if(!/[#\.]/.test(v)) return;
					v = v.replace(/\s+/g, '')
						 .replace(/#(\w+)/g, ',$1,').replace(/,+/g, ',')
						 .replace(/^,|,$/g, '')
						 .split(',');

					var oldClass = (el.className || '').trim().split(/\s+/);
					v.forEach(function(s){
						if(s.indexOf('.')==-1){
							el.id = s;
						} else {
							el.className = s.split('.').concat(oldClass).unique().join(' ').trim();
						}
					});
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
		_walker: function(o, ref){
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

		/*
		 * tempId可以是字符串，jquery对象/dom对象
		 * clear表示是否先清空再渲染
		 */
		render: function(tempId, data, clear){
			if(iCat.isString(tempId))
				tempId = tempId.trim();

			if(data){
				var parentNode = data.ICwrap,
					html = iCat.util._fnTmpl(tempId)(data),
					o = doc.createElement('div'),
					itemNodes;
				
				o.innerHTML = html;
				if(data.IChooks){//js钩子
					iCat.foreach(data.IChooks, function(k, arrHook){
						k = iCat.util._getWalker(k);
						if(!k) iCat.util._joinHook(arrHook, parentNode);
						else {
							var nodes = iCat.util._walker(k, [o, parentNode]);
							if(!nodes) return;
							nodes.length===undefined?
								iCat.util._joinHook(arrHook, nodes) : 
								nodes.forEach(function(node){
									iCat.util._joinHook(arrHook, node);
								});
						}
					});
				}
				html = o.innerHTML;
			} else {
				// 如果没有数据，返回模板函数
				return iCat.util._fnTmpl(tempId);
			}

			// 如果没有父层，返回html字符串
			if(!parentNode) return html;
			
			if(clear){//辞旧
				var oldNodes = parentNode.childNodes;
				while(oldNodes.length>0){
					parentNode.removeChild(oldNodes[0]);
				}
			}

			itemNodes = o.childNodes;
			while(itemNodes.length>0){//迎新
				parentNode.appendChild(itemNodes[0]);
			}

			// 图片默认惰性加载
			iCat.util.lazyLoad(parentNode);
			o = null;

			// 回调函数
			if(data.callback)
				data.callback(parentNode);
		},

		/*
		 * 一个参数时表示取数据(同规则：storage, cookie)
		 * 两个及以上的参数时表示存数据
		 */
		storage: function(){
			if(!arguments.length || !window.localStorage || !window.sessionStorage) return;
			
			var ls = window.localStorage,
				ss = window.sessionStorage;
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
			if(!dname || !window.localStorage || !window.sessionStorage) return;

			var ls = window.localStorage,
				ss = window.sessionStorage;
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

		makeWrap: function(s, pNode){
			if(!s) return;

			if(iCat.isString(s)){
				var o = doc.createElement('div'),
					exp;
				if(s.indexOf('~')>=0){
					s = s.split('~');
					pNode = iCat.util.queryOne(s[0]);
					exp = s[1];
				} else {
					pNode = pNode || doc.body;
					exp = s;
				}
				
				var c = exp.trim().split('*'),
					cSelector = c[0],
					num = c[1] || 1,
					shtml = '',

					strHtml = cSelector
								.replace(/(\w+)([\.\#\w\-\d]+)/, '<$1$2></$1>')
								.replace(/\.([\.\w\-\d]+)/g, ' class="$1"').replace(/\./g, ' ')
								.replace(/\#([\w\-\d]+)/g, ' id="$1"');

				for(var i=0; i<num; i++){ shtml += strHtml; }
				o.innerHTML = shtml;
				itemNodes = o.childNodes;
				while(itemNodes.length>0){ pNode.appendChild(itemNodes[0]); }
			} else {
				var fn = arguments.callee;
				s.forEach(function(v){
					fn(v);
				});
			}
		},

		fullUrl: function(url, argu){//isAjax/bi
			var url = url || '',
				bi = iCat.isString(argu)? argu : '',
				isAjax = iCat.isBoolean(argu)? argu : false;

			url = url.replace(/^\//g, '');

			if(iCat.DemoMode && url!==''){
				url = url.indexOf('?')<0? (url+'.php') : url.replace(/(\?)/g, '.php$1');
			}
			if(!isAjax && bi){
				url = url + (url.indexOf('?')<0? '?':'&') + bi;
			}

			return iCat.PathConfig.pageRef + url;
		}
	});

	/*
	 * view-module职责：
	 * - 初始化页面刚进入时的模板函数（及数据），渲染模块
	 * - 接收controller传递过来的数据，并更新渲染模块
	 * - 获取用户‘输入的表单数据’，传递给controller
	 * - 扩展实例化后对象的方法
	 */
	
	function View(tempId, initData){
		var _self = this;
		
		_self.tempId = tempId;

		_self._render = function(data, clear){
			iCat.util.waitObj(function(k){
				var pNode = iCat.util.queryOne(data.ICwrap);
				if(!pNode){
					iCat.__cache_timers[k] = false;
					return;
				}

				iCat.__cache_timers[k] = true;
				data.ICwrap = pNode;
				iCat.View.render(_self.tempId, data);

				// 包含表单
				var form = /form/i.test(pNode.tagName)?
						pNode : iCat.util.queryOne('form', pNode);
				if(form){
					_self.getData = function(format){
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
				}
			});
		};

		if(initData){
			_self._render(initData);
		}
	}
	View.prototype = {

		addItem: function(d){
			this._render(d);
		},

		setData: function(d){
			this._render(d, true);
		},

		extend: function(o){
			iCat.mix(this, o);
		}
	};

	//对外接口
	iCat.View = function(module, data){
		if(!module) return;

		if(!iCat.View[module]){
			iCat.View[module] = new View(module);
		}
		if(data){
			iCat.View[module].setData(data);
		}
		return iCat.View[module];
	};

	iCat.mix(iCat.View, {
		render: iCat.util.render,
		destroy: function(modules){
			if(!modules) return;

			modules = iCat.isString(modules) ? [modules] : modules;
			modules.forEach(function(v){
				delete iCat.View[v];
			});
		}
	});

	/*
	 * model-module职责：
	 * - 处理controller传递过来的数据，进行封装返回
	 * - 处理数据层面的业务逻辑，进行封装返回
	 * - 按需存取数据
	 * - 扩展实例化后对象的方法
	 */
	function Model(module, initData){
		this.module = module;
		this.initData = initData;
	}
	Model.prototype = {

		getInitData: function(dname){
			return this.initData[dname || ''];
		},

		fetchData: function(){},

		storeData: function(){},
		
		extend: function(o){
			iCat.mix(this, o);
		}
	};

	//对外接口
	iCat.Model = function(module, data){
		if(!module) return;

		if(!iCat.Model[module]){
			iCat.Model[module] = new Model(module, data);
		} else {
			iCat.Model[module].initData = data || iCat.Model[module].initData;
		}
		return iCat.Model[module];
	};
	
	iCat.mix(iCat.Model, {
		
		storage: iCat.util.storage,

		clearStorage: iCat.util.clearStorage,

		cookie: iCat.util.cookie,

		clearCookie: iCat.util.clearCookie,

		destroy: function(modules){
			if(!modules) return;
			modules = iCat.isString(modules) ? [modules] : modules;
			modules.forEach(function(v){
				delete iCat.Model[v];
			});
		}
	});

	/*
	 * controller-module职责：
	 * - 响应用户动作，调用对应的View和Model
	 * - 在View/Model之间传递数据
	 * - 如果是apk，添加或调用硬件接口
	 * - 扩展实例化后对象的方法
	 */
	
	var Event = iCat.Event;

	// 创建Observer-Controller类
	function Controller(module){
		this.selectors = [];
		this.module = module;
	}
	Controller.prototype = {
		subscribe: function(o){//o同Event.delegate
			var _self = this;
			o = iCat.isArray(o)? o : [o];
			o.forEach(function(item){
				Event.delegate(item, true);
				if(!_self.selectors.contains(item.selector)){
					_self.selectors.push(item.selector);
				}
			});
		},

		unsubscribe: function(o){//o同Event.undelegate
			var _self = this;
			o = iCat.isArray(o)? o : [o];
			o.forEach(function(item){
				Event.undelegate(item);
				if(_self.selectors.contains(item.selector)){
					_self.selectors.remove(item.selector);
				}
			});
		},

		addEvents: function(events){
			this.subscribe(events);
		},

		removeEvents: function(events){
			this.unsubscribe(events);
		},

		extend: function(o){
			iCat.mix(this, o);
		}
	};

	//对外接口
	iCat.Controller = function(module, events){
		if(!module) return;

		if(!iCat.Controller[module]){
			iCat.Controller[module] = new Controller(module);
		}
		if(iCat.isFunction(events)){
			events(iCat.Controller[module]);
		} else {
			iCat.Controller[module].subscribe(events);
		}
		return iCat.Controller[module];
	};

	//销毁实例化对象
	iCat.mix(iCat.Controller, {
		addCurrent: function(modules, callback){
			if(!modules) return;
			modules = iCat.isString(modules) ? [modules] : modules;
			modules.forEach(function(v){
				if(iCat.Controller[v]){
					Event.__event_selectors = Event.__event_selectors.concat(iCat.Controller[v].selectors);
				}
			});
			if(callback && iCat.isFunction(callback)){
				callback();
			}
		},

		destroy: function(modules){
			if(!modules) return;
			modules = iCat.isString(modules) ? [modules] : modules;
			modules.forEach(function(v){
				if(iCat.Controller[v]){
					iCat.Controller[v].selectors.forEach(function(v){
						delete Event.items[v];
						Event.__event_selectors.remove(v);
					});
				}
				delete iCat.Controller[v];
			});
		}
	});
})(ICAT, this, document);