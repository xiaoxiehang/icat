/* mvc.js # */
(function(iCat, root, doc){
	// 创建mvc命名空间
	iCat.namespace('mvc');

	iCat.Class('Tools',
	{
		init: function(){
			var oSelf = this;
			return {
				/*
				 * Class: 父类
				 * option: 继承时被共用的配置
				 */
				inherit: function(Class, option){
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
				},

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
				},

				regEvents: function(view, cfg){// bind-events
					if(cfg.events){
						iCat.util.recurse(cfg.events, function(e){
							//此处如果直接e.callback=f，e.callback已被替换，无法找到函数
							var fn = e.callback;
							if(iCat.isString(fn)) fn = view[e.callback];
							e.callback = function(){
								var argus = iCat.toArray(arguments); //step2
									argus.unshift(view, view.model, cfg);//普通方法追加view, model, config
								fn.apply(this, argus);
							};
							if(iCat.Event)
								iCat.Event.delegate(e);
							else if(iCat.$ && iCat.$.event)
								iCat.$(iCat.elCurWrap).delegate(e.selector, e.type.replace(/!/g, ''), e.callback);
						});
					}
				},

				/*
				 * 页面初始化分三种情况：
				 * - 多页面(multiPage)切换：此种情况下，每次都是“真实初始化”
				 * - 单页面单层(singleLayer)：此种情况下，第一次是“真实初始化”，以后是“半伪初始化”
				 * - 单页面多层(multiLayer)切换：此种情况下，第一次是“真实初始化”，以后是“伪初始化”
				 * 
				 * #真实初始化：直接实例化view和model，绑定events，进行页面渲染，不用进行数据比较
				 * #半伪初始化：清空上次的dom和events，进行真实初始化
				 * #伪初始化：清空上次的events，如果是空白层则进行真实初始化，如果非空则选择性渲染
				 */
				multiPage: function(){
					oSelf._baseInit.apply(oSelf, arguments);
				},

				singleLayer: function(c, o){
					// clear
					if(c.modsLoad_mode) delete c.modsLoad_mode;
					if(c.routes.scrollWrap) delete c.routes.scrollWrap;
					c.vmClear();

					oSelf._baseInit(c, o);
				},

				multiLayer: function(c, o){
					var cfg = c.config,
						wraps = c.pageWraps,
						curGroup = c.wrapGroup, curPid = c.hashArgus[0],
						curCla = cfg.currentCla || 'icat-current-wrap',
						curWrap, page1, page2;
					
					// clear
					if(c.modsLoad_mode) delete c.modsLoad_mode;
					if(c.routes.scrollWrap) delete c.routes.scrollWrap;
					c.vmClear();
					if(iCat.elCurWrap){
						iCat.util.addClass(iCat.elCurWrap, '__prev_baseBed');
						iCat.util.removeClass(iCat.elCurWrap, curCla);
						delete iCat.elCurWrap;
					}

					// 设置操作层
					if(!curGroup.contains(curPid)){
						if(wraps.length==curGroup.length){
							page1 = iCat.util.queryOne('.__prev_baseBed');
							iCat.util.removeClass(page1, '__prev_baseBed');
							iCat.util.addClass(page1, curCla);
							console.log('The beds are not enough.');
							return;
						}
						curWrap = iCat.elCurWrap = wraps[curGroup.length];
						curGroup.push(curPid);
					} else {
						curWrap = iCat.elCurWrap = wraps[curGroup.indexOf(curPid)];
					}
					iCat.util.addClass(curWrap, curCla);

					// 操作层切换动画接口
					page1 = iCat.util.queryOne('.__prev_baseBed');
					page2 = iCat.elCurWrap;
					if(o.switchPage) o.switchPage(page1, page2);
					if(page1) iCat.util.removeClass(page1, '__prev_baseBed');

					oSelf._baseInit(c, o);
				}
			};
		},

		_baseInit: function(c, o){
			var cfg = c.config,
				curWrap = iCat.elCurWrap;
			if(!curWrap) return;

			// page set
			if(o.baseBed) delete o.baseBed;

			if(o.setAjax){
				delete iCat.util.ajax;
				iCat.rentAjax(o.setAjax[0], o.setAjax[1]);
			}
			if(o.modules){
				c.pageMods = o.modules.replace(/\s+/, '').split(',');// fixed bug:前后有空格，模块加载失败
				c.modsLoad_mode = !!c.pageMods.length;
				delete o.modules;
			}

			if(o.vmGroups) o = o.vmGroups;

			// page render
			c.vmAdd(o, true);
			c.modsLoad_mode? this._modsLoad(c) : this._commLoad(c);
		},

		// type: 0=common, 1=height-load, 2=scroll-load
		__serialize: function(c, type, mh, wh){
			if(!c.pageMods.length || !c.pageMods[0]) return;

			var fn = this._serialize, vid = c.pageMods[0],
				curView = iCat.View[vid], modelId = c.vmGroups[vid],
				IMData = iCat.Model.ViewData(vid),
				cfg;
			if(!curView || !IMData){// fixed bug:某个模块请求失败，影响后续加载
				c.pageMods.shift();
				fn.apply(c, arguments);
				return;
			}

			cfg = IMData.config;
			switch(type){
				case 0:
					cfg.loadCallback = function(node){
						c.pageMods.shift();
						if(node) iCat.util.unwrap(node);
						fn.call(c, 0);
					};
					curView.setModel(iCat.Model[modelId]);
				break;

				case 1:
					cfg.loadCallback = function(node){
						c.pageMods.shift();
						if(node){
							mh = mh + iCat.util.outerHeight(node);
							iCat.util.unwrap(node);
						}
						if(mh<=wh+20 && c.pageMods.length){
							fn.call(c, 1, mh, wh);
						} else if(c.pageMods.length){
							iCat.util.scroll(
								c.routes.scrollWrap,
								function(slHeight, slTop, spHeight){
									if(!c.pageMods.length) return;
									if(slTop+slHeight+50>=spHeight){
										fn.call(c, 2);
									}
								}
							);
						}
					};
					curView.setModel(iCat.Model[modelId]);
				break;

				case 2:
					if(curView.loaded==undefined){//拒绝重复
						curView.loaded = false;
						cfg.loadCallback = function(node, blankHtml){
							c.pageMods.shift();
							curView.loaded = true;
							if(node) iCat.util.unwrap(node);
							if(blankHtml) fn.call(c, 2);
						};
						curView.setModel(iCat.Model[modelId]);
					}
				break;
			}
		},

		_modsLoad: function(c){// 模块化加载
			var self = this;
			if(c.routes.scrollWrap){// 滚动加载
				var winHeight = iCat.util.outerHeight(root),
					modsHeight = 0;
				self.__serialize(c, 1, modsHeight, winHeight);
			} else {
				if(c.pageMods.length){
					self.__serialize(c, 0);
				}
			}
		},

		_commLoad: function(c){// 普通加载
			iCat.foreach(c.vmGroups, function(vid, mid){
				var curView = iCat.View[vid],
					curModel = iCat.Model[mid];
				curView.setModel(curModel);
			});
		}
	}, iCat.mvc);

	var tools = new iCat.mvc.Tools().init();
	delete iCat.mvc.Tools;
	delete iCat.mvc;

	/*
	 * view-module职责：ui中心
	 * - 设置与ui相关的参数
	 * - 设置与ui相关的函数(events挂钩)，调用其model的逻辑
	 * - 每次extend都会生成一个新的view-Class
	 */
	var View = function(viewId, option){
		this.viewId = viewId;//必须
		this._init(option, viewId);

		if(!iCat.View[viewId]){//copy
			iCat.View[viewId] = this;
		} else {
			return iCat.View[viewId];
		}
	};
	View.prototype = {
		_init: function(opt, vid){
			var self = this, IMData;

			IMData = iCat.Model.__pageData[vid] = iCat.Model.ViewData(vid) || {};
			IMData.ownData = {};

			iCat.foreach(opt, function(k, v){
				if(iCat.isFunction(v)){//option中的方法
					self[k] = v;
				}
				else if(k=='config'){//option中的配置数据
					IMData['config'] = v;
					IMData['config'].viewId = vid;
				}
				else {//option中的静态数据
					self[k] = v;
					IMData.ownData[k] = v;
				}
			});

			if(self.model)
				self._htmlRender();
		},

		_render: function(data, before, clear, outData){
			var self = this, vid = self.viewId, ret1, ret2,
				IMData = iCat.Model.ViewData(vid),
				ownData = IMData.ownData,
				curCfg = IMData.config,
				curWrap = iCat.util.queryOne(curCfg.wrap || curCfg.scrollWrap, iCat.elCurWrap),
				nodes = iCat.util.queryAll('*[data-unclass='+self.viewId+'-loaded]', curWrap);
			
			if(self.model._dataChange(vid, data)//数据发生变化
				|| iCat.singleMode//单层切换
					|| !nodes.length)//对应子元素为空(fixed bug: 同init函数不同hash无法渲染)
			{
				if(outData){//设置setData得到的数据
					ret1 = self.model.save(curCfg, data);
					if(!!ret1 && iCat.isArray(ret1))
						data = { repeatData: ret1 };
					iCat.mix(data, ownData);
				}
				if(data.repeatData){
					data.repeatData.forEach(function(d, i){
						iCat.util.render(curCfg, d, before, i==0);
					});
				} else {
					ret2 = iCat.util.render(curCfg, data, before, clear);
					if(ret2 && iCat.isFunction(ret2)){
						self.getFormData = ret2;
					}
				}
			}
		},

		_htmlRender: function(data, before, clear){
			var self = this,
				IMData = iCat.Model.ViewData(self.viewId),
				cfg = IMData.config;

			if(!data && self.model){
				self.model.fetch(cfg, function(servData){
					if(cfg.globalKey && self.model.DataOutput){
						cfg.globalArgus = cfg.globalArgus || [];
						cfg.globalArgus.unshift(servData);
						servData = self.model.DataOutput.apply(self, cfg.globalArgus);
					}
					self._render(servData, before, clear);
				});
			} else if(data) {
				self._render(data, before, clear, true);
			}
		},

		setModel: function(m, data, before, clear){
			var self = this;
			if(!m || (iCat.isObject(m) && m.constructor.__super__!==Model)){
				m = iCat.Model['__page_emptyModel'] || new Model('__page_emptyModel');
			}
			if(!self.model){//第一次
				self.model = m;
				if(self.init)//自定义初始化
					data = self.init(self, m, true);
				self._htmlRender(data, before, clear);
			} else {
				self.model = m;
			}
		},

		setConfig: function(cfg, before, clear){
			var self = this;
			if(self.model._cfgChange(self.viewId, cfg)){
				self._htmlRender(null, before, clear);
			}
		},

		setAjaxUrl: function(url, before, clear){ this.setConfig({ajaxUrl:url}, before, clear); },
		setTempId: function(tid, before, clear){ this.setConfig({tempId:tid}, before, clear); },
		setWrap: function(wrap, before, clear){ this.setConfig({wrap:wrap}, before, clear); },
		setData: function(data, before, clear){ this._htmlRender(data, before, clear); },
		update: function(before){ this._htmlRender(null, before, true); }
	};

	/*
	 * model-module职责：数据和逻辑处理中心
	 * - 设置与数据/逻辑处理相关的函数
	 * - 处理view发过来的指令，处理后返回相应结果
	 * - 每次extend都会生成一个新的model-Class
	 */
	var Model = function(modelId){
		this.modelId = modelId;//必须

		if(!iCat.Model[modelId]){//copy
			iCat.Model[modelId] = this;
		} else {
			return iCat.Model[modelId];
		}
	};
	Model.prototype = {
		_cfgChange: function(vid, cfg){ return iCat.Model.cfgChange(vid, cfg); },
		_dataChange: function(vid, data){ return iCat.Model.dataChange(vid, data); },

		fetch: function(){ iCat.util.fetch.apply(this, arguments); },
		save: function(){ return iCat.util.save.apply(this, arguments); },
		remove: function(){ iCat.util.remove.apply(this, arguments); }
	};

	/*
	 * controller-module职责：响应中心
	 * - 响应用户动作，调用对应的View处理函数
	 * - 每次extend都会生成一个新的controller-Class
	 */
	var	Controller = function(ctrlId, option){
		option = option || {};

		var self = this;
		self.ctrlId = ctrlId;//必须
		self.config = option.config || {};
		self.routes = option.routes || {};

		self.vmGroups = {};// key=viewId, value=modelId
		self.wrapGroup = [];// value=modHash

		self._init(ctrlId, option, self.config);
	};
	Controller.prototype = {
		_init: function(cId, opt, cfg){
			var self = this,
				bodyId;

			if(!iCat.Controller[cId])//copy
				iCat.Controller[cId] = self;

			//处理routes
			iCat.foreach(self.routes, function(k, v){
				var _k = k.replace(/\s+/g, '')
					 .replace(/\:num/gi, '(\\d+)')
					 .replace(/\:\w+/g, '(\\w+)');
				self.routes[_k] = iCat.isFunction(v)? v : self[v];
				if(_k!==k) delete self.routes[k];
			});
			
			//把option合并到self
			iCat.mix(self, opt, 'config, routes');

			//全局调整结构
			if(cfg.adjustLayout){
				if(iCat.isString(cfg.adjustLayout) && cfg.baseBed){
					var wraps = iCat.util.queryAll(cfg.baseBed);
					iCat.foreach(wraps, function(w){
						iCat.util.makeHtml(cfg.adjustLayout, w);
					});
				} else {
					iCat.util.makeHtml(cfg.adjustLayout);
				}
			}
			
			iCat.util.wait(function(k, t){
				var bodyNode = iCat.elBodyWrap || iCat.util.queryOne('*[data-pagerole=body]');
				if(!bodyNode){
					iCat.__cache_timers[k] = false;
					if(t!=200) return;
				}
				delete iCat.__cache_timers[k];

				iCat.elBodyWrap = iCat.elBodyWrap || doc.body;
				bodyId = iCat.elBodyWrap.getAttribute('id');
				var fnInit = function(id){
					var hash = tools.dealHash(id, self.routes);
					self.hashArgus = hash;
					try{
						self.routes[hash[0]].call(self);
					}
					catch(e){}
				};

				if(iCat.isNull(bodyId)){//页面里没有id属性，则为锚点hash
					fnInit(location.hash);
					root['onhashchange'] = function(){ fnInit(location.hash); };
				} else{
					iCat.mode_multiPage = true;
					fnInit(bodyId);
				}
			}, 200, 10);
		},

		init: function(o){
			var self = this,
				cfg = self.config,
				bedSele = o.baseBed || cfg.baseBed;

			if(iCat.mode_multiPage){
				iCat.elCurWrap = iCat.util.queryOne(bedSele);
				tools.multiPage(self, o);
			} else {
				if(o.adjustLayout){
					iCat.util.makeHtml(o.adjustLayout, curWrap, iCat.mode_singleLayer);
					delete o.adjustLayout;
				}

				if(iCat.mode_singleLayer){
					tools.singleLayer(self, o);
				} else {
					if(iCat.mode_multiLayer){
						tools.multiLayer(self, o);
					} else {
						var wraps = self.pageWraps = iCat.util.queryAll(bedSele),
							len = wraps.length;
						if(!len) return;

						if(len==1){
							iCat.mode_singleLayer = true;
							iCat.elCurWrap = wraps[0];
							tools.singleLayer(self, o);
						}
						else {
							iCat.mode_multiLayer = true;
							tools.multiLayer(self, o);
						}
					}
				}
			}
		},

		vmAdd: function(vm, init){
			if(!vm) return;
			vm = iCat.isArray(vm)? vm : [vm];

			var self = this,
				vmGroups = self.vmGroups;
			iCat.util.recurse(vm, function(item){//instanceof => false
				//view必须有，且是View的实例化 
				if(!item.view ||
					(iCat.isObject(item.view) && item.view.constructor.__super__!==View)) return;
				
				if(iCat.isFunction(item.model) && item.model.__super__==Model){
					iCat.foreach(
						item.model.setting || {'__page_mainModel': {}},// default= '__page_mainModel'
						function(key, setItem){
							item.model = iCat.Model[key] || new item.model(key, setItem);
						}
					);
				}

				if(iCat.isFunction(item.view) && item.view.__super__==View){
					iCat.foreach(
						item.view.setting || {'__page_mainView': {config:{}}},// default= '__page_mainView'
						function(key, setItem){
							if(init && self.pageMods && !self.pageMods.contains(key)) return;
							var curView = iCat.View[key] || new item.view(key, setItem),
								cfg = setItem.config;
							if(!vmGroups[key]){
								if(init){//(伪)初始化时
									if(curView.model){
										delete curView.model;
									} else {
										if(!item.model){
											item.model = iCat.Model['__page_emptyModel'] || new Model('__page_emptyModel');
										}
									}
									vmGroups[key] = item.model.modelId;
								}
								else if(item.model){
									curView.setModel(item.model);
									vmGroups[key] = item.model.modelId;
								}
							}

							if(cfg.scrollWrap || self.config.scrollWrap)
								self.routes.scrollWrap = self.config.scrollWrap || cfg.scrollWrap;
							tools.regEvents(curView, cfg);
						}
					);
				} else {
					var curView = item.view,
						key = curView.viewId,
						cfg = iCat.Model.ViewData(curView.viewId).config;
					if(!vmGroups[key]){
						if(init){//(伪)初始化时
							if(curView.model){
								delete curView.model;
							} else {
								if(!item.model){
									item.model = iCat.Model['__page_emptyModel'] || new Model('__page_emptyModel');
								}
							}
							vmGroups[key] = item.model.modelId;
						}
						else if(item.model){
							curView.setModel(item.model);
							vmGroups[key] = item.model.modelId;
						}
					}
					tools.regEvents(curView, cfg);
				}
			});
		},

		vmRemove: function(vid){
			if(!vid) return;

			var self = this;
			if(iCat.isString(vid) && vid.indexOf(',')<0){
				var vmGroups = self.vmGroups;
				if(vmGroups[vid]){
					var events = iCat.Model.ViewData(vid).config.events;
					if(events){
						iCat.util.recurse(events, function(e){
							if(iCat.Event)
								iCat.Event.undelegate(e);
							else if(iCat.$ && iCat.$.event){
								e.type = e.type.replace(/!/g, '')
											   .replace(/(long|single)?tap/gi, 'click');
								iCat.$(iCat.elCurWrap).undelegate(e.selector, e.type);
							}
						});
					}
					delete vmGroups[vid];
				}
			} else {
				var fn = arguments.callee;
				vid = iCat.isString(vid)? vid.split(',') : vid;
				iCat.isArray(vid)?// fixed bug:当调用fn时，其中的this指向window
					vid.forEach(function(k){fn.call(self, k);}) :iCat.foreach(vid, function(k){fn.call(self, k);});
			}
		},

		vmClear: function(){ this.vmRemove(this.vmGroups); },
		gotopage: function(url){ location.href = iCat.util.fullUrl(url); }
	};

	// 对外接口
	iCat.namespace('View', 'Model', 'Controller');
	iCat.View.extend       = function(opt){ return tools.inherit(View, opt); };
	iCat.Model.extend      = function(opt){ return tools.inherit(Model, opt); };
	iCat.Controller.extend = function(opt){ return tools.inherit(Controller, opt); };

	iCat.Model['__pageData'] = iCat.Model['__pageData'] || {};
	iCat.mix(iCat.Model, {
		cfgChange: function(vid, d){
			var oldCfg = iCat.Model.ViewData(vid).config,
				ret = (d.ajaxUrl && oldCfg.ajaxUrl!=d.ajaxUrl) ||
					  (d.tempId && oldCfg.tempId!=d.tempId) ||
					  (d.wrap && oldCfg.wrap!=d.wrap);
			iCat.mix(oldCfg, d);
			return ret;
		},

		dataChange: function(vid, d){
			var prevData = iCat.Model.ViewData(vid).prevData,
				ret = !iCat.util._jsonCompare(d, prevData);
			prevData = JSON.stringify(d);
			return ret;
		},

		GlobalData: function(key, d){
			var GD = iCat.Model.__globalData = iCat.Model.__globalData || {};
			if(!d) return GD[key];
			if(!GD[key]) GD[key] = d;
		},

		ViewData: function(vid, d){
			var PD = iCat.Model.__pageData = iCat.Model.__pageData || {};
			if(!d) return PD[vid];
			if(!PD[vid]) PD[vid] = d;
		}
	});
})(ICAT, this, document);