(function(iCat){

	var doc = document, tmplCache = {},
		tsKey = function(s){
			return s.replace(/for|if|else|switch|case|do|while|var|data|length|this/g, '_')
					.replace(/class|id|href|src|title|alt|type|name|value|on\w*/g, '110')
					.replace(/\W/g, '').replace(/110/g, '$')
					.slice(32,64);
		},
		tmpl = function(str, data){
			if(!str) return;

			var fn, fnBody= "var __p_fun = [];with(jsonData){" +
								"__p_fun.push('" + str.replace(/<%=(.*?)%>/g, "',$1,'").replace(/<%(.*?)%>/g, "');$1__p_fun.push('") + "');" +
							"}return __p_fun.join('');";
			
			if(!/\W/.test(str)){
				var tpl = tmplCache[str] = (tmplCache[str] || doc.getElementById(str).innerHTML).replace(/[\r\t\n]/g, ''),
					key = tsKey(tpl);
				fn = tmplCache[key] = tmplCache[key] || tmpl(tpl);
			} else {
				var tpl = str.replace(/[\r\t\n]/g, ''),
					key = tsKey(tpl);
				fn = tmplCache[key] = tmplCache[key] || new Function("jsonData", fnBody);
			}
			// iCat.log(tmplCache);	
			return data? fn(data) : fn;
		};

	/*
	 * view-module职责：
	 * - 初始化页面刚进入时的模板函数（及数据），渲染模块
	 * - 接收controler传递过来的数据，并更新渲染模块
	 * - 获取用户‘输入的表单数据’，传递给controler
	 * - 扩展实例化后对象的方法
	 */
	function View(template, data){
		this.fnTemplate = tmpl(template);

		if(data){
			this._render(data);
		}
	}
	View.prototype = {

		_render: function(d, clear){
			var _self = this,
				apSlice = Array.prototype.slice,
				parentNode = iCat.isString(d.parentWrap)? doc.querySelector(d.parentWrap) : d.parentWrap;
			if(!parentNode) return;

			var	html = _self.fnTemplate(d),
				o = doc.createElement('div'),
				itemNodes,
				joinHook = function(hooks, el){
					if(!hooks || !el) return;
					hooks = iCat.isArray(hooks)? hooks : [hooks];
					hooks.forEach(function(v){
						if(!v) return;

						if(/\w*~.*/.test(v)){
							v = v.split('~');
							el.setAttribute(v[0].replace(/^(\s|data-)?/, 'data-'), v[1]);
						} else {
							var jsHook = v.replace(/[#\.]/g, ''),
								cla = el.className;
							v.indexOf('#')>=0? el.id = jsHook :
								el.className = cla.indexOf(jsHook)>=0? cla : cla+(cla? ' ':'')+jsHook;
						}
					});
				};
			
			o.innerHTML = html;
			itemNodes = o.childNodes;

			if(clear){
				var oldNodes = parentNode.childNodes;
				while(oldNodes.length>0){
					parentNode.removeChild(oldNodes[0]);
				}
			}

			if(d.hooks){
				iCat.foreach(d.hooks, function(k, hooks){
					k = k.replace(/\D+@/g, '');
					if(/^\d+@/.test(k)){
						k = k.split('@');
						var node = o.querySelectorAll(k[1])[k[0]];
						joinHook(hooks, node);
					} else {
						var nodes = apSlice.call(o.querySelectorAll(k));
						nodes.forEach(function(node){
							joinHook(hooks, node);
						});
					}
				});
			}

			while(itemNodes.length>0){
				parentNode.appendChild(itemNodes[0]);
			}
			o = null;

			var form = /form/i.test(parentNode.tagName)? parentNode : parentNode.querySelector('form');
			if(form){
				this.getData = function(format){
					format = format || 'string';
					var jsonFormat = /json/i.test(format),
						argus = jsonFormat? {} : '';

					apSlice.call(form.elements).forEach(function(el){
						var key = el.getAttribute('name'), value = el.value;
						if(key){
							jsonFormat?
								argus[key] = value : argus += '&' + key + '=' + value;
						}
					});
					return jsonFormat? argus : argus.replace(/^&/, '');
				}
			}
		},

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

	/*
	 * model-module职责：
	 * - 处理controler传递过来的数据，进行封装返回
	 * - 处理数据层面的业务逻辑，进行封装返回
	 * - 按需存取数据
	 * - 扩展实例化后对象的方法
	 */
	function Model(module, events){
		this.mID = module;
		this.events = events;
	}
	Model.prototype = {
		setEvents: function(){},
		addEvents: function(){},
		envelopData: function(){},
		storeData: function(){},
		extend: function(o){
			iCat.mix(this, o);
		}
	};

	/*
	 * controler-module职责：
	 * - 响应用户动作，调用对应的View和Model
	 * - 在View/Model之间传递数据
	 * - 如果是apk，添加或调用硬件接口
	 * - 扩展实例化后对象的方法
	 */
	function Controler(module, events){
		this.controler = iCat.obsCreate(module||'__pageControler');
		if(events){
			this.controler.subscribe(events);
		}
	}
	Controler.prototype = {
		fn: function(){
			
		},

		extend: function(o){
			iCat.mix(this, o);
		}
	};

	// 对外接口
	iCat.View = function(template, data){
		/*var k = tsKey(template);
		iCat.View[k] = new View(template, data);
		iCat.View[k].destroy = function(){
			iCat.View[k] = null;
		};
		return iCat.View[k];*/
		return new View(template, data);
	};
	iCat.Model = function(module, events){
		return new Model(module);
	};
	iCat.Controler = function(module, events){
		return new Controler(module, events);
	};
})(ICAT);