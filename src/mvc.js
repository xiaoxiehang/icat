/* mvc.js # */
(function(iCat, root, doc){
	// 创建mvc命名空间
	iCat.namespace('mvc');

	iCat.Class('Tools',
	{
		init: function(){
			var oSelf = this;
			return {
				toArray: oSelf.toArray,

				/*
				 * Class: 父类
				 * option: 继承时被共用的配置
				 */
				inherit: function(Class, option){
					var Cla = function(){
						var argus = oSelf.toArray(arguments);
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
				}
			};
		},

		toArray: function(oArr){
			var arr = [];
			iCat.foreach(oArr, function(i,v){ arr.push(v); });
			return arr;
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

			if(!iCat.Model[vid]){//data
				IMData = iCat.Model.__pageData[vid] = {};
				IMData.ownData = {};
			}

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
				IMData = iCat.Model.__pageData[vid],
				ownData = IMData.ownData,
				curCfg = IMData.config,
				curWrap = iCat.util.queryOne(curCfg.wrap || curCfg.scrollWrap, iCat.elCurWrap);
			
			if(self.model._dataChange(vid, data) ||//数据发生变化
				iCat.singleMode ||//单层切换
					!iCat.util.queryAll('*[data-unclass='+self.viewId+'-loaded]', curWrap).length){//对应子元素为空(fixed bug: 同init函数不同hash无法渲染)
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
				IMData = iCat.Model.__pageData[self.viewId],
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
			if(!m || (iCat.isObject(m) && m.constructor.__super__!==Model))
				m = iCat.Model['__page_emptyModel'] || new Model('__page_emptyModel');
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
		_cfgChange: function(vid, cfg){
			return iCat.Model.cfgChange(vid, cfg);
		},
		_dataChange: function(vid, data){
			return iCat.Model.dataChange(vid, data);
		},

		fetch: function(){
			iCat.util.fetch.apply(this, arguments);
		},
		save: function(){
			return iCat.util.save.apply(this, arguments);
		},
		remove: function(){
			iCat.util.remove.apply(this, arguments);
		}
	};

	/*
	 * controller-module职责：响应中心
	 * - 响应用户动作，调用对应的View处理函数
	 * - 每次extend都会生成一个新的controller-Class
	 */
	var Event = iCat.Event;
	var	Controller = function(ctrlId, option){
		option = option || {};

		var self = this;
		self.ctrlId = ctrlId;//必须
		self.config = option.config || {};
		self.routes = option.routes || {};

		self.vmGroups = {};// key=viewId, value=modelId
		self.wraps = [];// value=modHash
		self.selectors = [];

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
				}
				else {
					iCat.util.makeHtml(cfg.adjustLayout);
				}
			}
			
			iCat.util.wait(function(k){// fixed bug:合并状态下，js加载过快，会导致无法得到bodyWrap
				if(!iCat.elBodyWrap){
					iCat.__cache_timers[k] = false;
					return;
				}
				delete iCat.__cache_timers[k];

				bodyId = iCat.elBodyWrap.getAttribute('id');

				//页面里没有id属性，则为锚点hash
				if(iCat.isNull(bodyId)){
					root['onhashchange'] = function(){
						var hash = tools.dealHash(location.hash, self.routes);
						self.hashArgus = hash;
						self.pseudoInit = true;
						try{ self.routes[hash[0]].call(self); } catch(e){}
					};
				}

				var hash = tools.dealHash(bodyId || location.hash, self.routes);
				self.hashArgus = hash;
				try{ self.routes[hash[0]].call(self); } catch(e){}
			}, 500, 10);
		},

		init: function(o){
			var self = this,
				cfg = self.config,
				argus = self.hashArgus,
				curWrap, curPid = argus[0], curCla = cfg.currentCla || 'icat-current-wrap',
				singleSele = o.singleBed || cfg.singleBed,
				page1, page2;

			// clear
			self.modsLoad_mode = false;
			if(self.routes.scrollWrap)
				delete self.routes.scrollWrap;
			if(iCat.elCurWrap){
				iCat.util.addClass(iCat.elCurWrap, '__prev_baseBed');
				iCat.util.removeClass(iCat.elCurWrap, curCla);
				iCat.elCurWrap = null;
			}

			// 设置操作层
			if(o.baseBed){
				curWrap = iCat.elCurWrap = iCat.util.queryOne(o.baseBed);
				iCat.util.addClass(curWrap, curCla);
				delete o.baseBed;
			}
			else if(cfg.baseBed){
				var wraps = iCat.util.queryAll(cfg.baseBed);
				if(!wraps.length) return;
				if(!self.wraps.contains(curPid)){
					if(wraps.length==self.wraps.length){
						page1 = iCat.util.queryOne('.__prev_baseBed');
						iCat.util.removeClass(page1, '__prev_baseBed');
						iCat.util.addClass(page1, curCla);
						console.log('The beds are not enough.');
						return;
					}
					curWrap = iCat.elCurWrap = wraps[self.wraps.length];
					self.wraps.push(curPid);
				} else {
					curWrap = iCat.elCurWrap = wraps[self.wraps.indexOf(curPid)];
				}
				iCat.util.addClass(curWrap, curCla);
			}
			else if(singleSele) {// fixed bug:会影响到没有使用mvc的页面
				iCat.singleMode = true;
				curWrap = iCat.util.queryOne(singleSele);
				if(!curWrap){
					var singleHtml = iCat.util.zenCoding('div'+singleSele),
						w = doc.createElement('wrap'),
						nodes;
					w.innerHTML = singleHtml;
					nodes = w.childNodes;
					while(nodes.length){
						iCat.elBodyWrap.insertBefore(nodes[0], iCat.elBodyWrap.firstChild);
					}
					iCat.elCurWrap = curWrap = iCat.util.queryOne(singleSele);
				} else {
					iCat.elCurWrap = curWrap;
				}
			}
			else return;

			// 设置外来ajax
			if(o.setAjax){
				delete iCat.util.ajax;
				iCat.rentAjax(o.setAjax[0], o.setAjax[1]);
			}

			// 操作层切换动画接口
			page1 = iCat.util.queryOne('.__prev_baseBed');
			page2 = iCat.elCurWrap;
			if(o.switchPage) o.switchPage(page1, page2);
			if(page1) iCat.util.removeClass(page1, '__prev_baseBed');

			// 调整结构
			if(o.adjustLayout){
				iCat.util.makeHtml(o.adjustLayout, curWrap, iCat.singleMode);
				delete o.adjustLayout;
			}

			// 模块化加载模式
			if(o.modules){
				self.pageMods = o.modules.trim().split(/\s*,\s*/);// fixed bug:前后有空格，模块加载失败
				self.modsLoad_mode = !!self.pageMods.length;
				delete o.modules;
			}

			if(o.vmGroups) o = o.vmGroups;

			// page render
			self.vmClear();
			self.vmAdd(o, true);
			self.modsLoad_mode? self._modsLoad() : self._commLoad();
			delete o;

			if(self.pseudoInit){//伪初始化需重新激活
				iCat.ctrlAble(self);
				delete self.pseudoInit;
			}
		},

		// type: 0=common, 1=height-load, 2=scroll-load
		_serialize: function(type, mh, wh){
			if(!this.pageMods.length || !this.pageMods[0]) return;

			var self = this,
				fn = arguments.callee, vid = self.pageMods[0],
				curView = iCat.View[vid], modelId = self.vmGroups[vid],
				IMData = iCat.Model.__pageData[vid],
				cfg;
			if(!curView || !IMData){// fixed bug:某个模块请求失败，影响后续加载
				self.pageMods.shift();
				fn.apply(self, arguments);
				return;
			}

			cfg = IMData.config;
			switch(type){
				case 0:
					cfg.loadCallback = function(node){
						self.pageMods.shift();
						if(node) iCat.util.unwrap(node);
						fn.call(self, 0);
					};
					curView.setModel(iCat.Model[modelId]);
				break;

				case 1:
					cfg.loadCallback = function(node){
						self.pageMods.shift();
						if(node){
							mh = mh + iCat.util.outerHeight(node);
							iCat.util.unwrap(node);
						}
						if(mh<=wh+20 && self.pageMods.length){
							fn.call(self, 1, mh, wh);
						} else if(self.pageMods.length){
							iCat.util.scroll(
								self.routes.scrollWrap,
								function(slHeight, slTop, spHeight){
									if(!self.pageMods.length) return;
									if(slTop+slHeight+50>=spHeight){
										fn.call(self, 2);
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
							self.pageMods.shift();
							curView.loaded = true;
							if(node) iCat.util.unwrap(node);
							if(blankHtml) fn.call(self, 2);
						};
						curView.setModel(iCat.Model[modelId]);
					}
				break;
			}
		},

		_modsLoad: function(){// 模块化加载
			var self = this;

			// 初始化页面
			if(self.routes.scrollWrap){// 滚动加载
				var winHeight = iCat.util.outerHeight(root),
					modsHeight = 0;
				self._serialize(1, modsHeight, winHeight);
			} else {
				if(self.pageMods.length){
					self._serialize(0);
				}
			}
		},

		_commLoad: function(){// 普通加载
			var self = this;
			iCat.foreach(self.vmGroups, function(vid, mid){
				curView = iCat.View[vid], curModel = iCat.Model[mid];
				curView.setModel(curModel);
			});
		},

		_subscribe: function(events, disabled){//events参数同Event.delegate
			var self = this;
			iCat.util.recurse(events, function(o){
				o.selector = o.selector.trim().replace(/\s+/g, ' ');
				Event.delegate(o, disabled);
				if(!self.selectors.contains(o.selector)){
					self.selectors.push(o.selector);
					Event.__event_selectors.push(o.selector);
				}
			});
		},

		_regEvents: function(view, disabled){// bind-events
			var self = this,
				vid = view.viewId,
				events = iCat.Model.__pageData[vid].config.events;
			if(events){
				iCat.util.recurse(events, function(e){
					//此处如果直接e.callback=f，e.callback已被替换，无法找到函数
					var fn = e.callback;
					if(iCat.isString(fn)) fn = view[e.callback];
					e.callback = function(){
						var argus = tools.toArray(arguments); //step2
							argus.unshift(view, view.model, iCat.Model.__pageData[view.viewId].config);//普通方法追加view, model, config
						fn.apply(this, argus);
					};
					self._subscribe(e, disabled);
				});
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
							var curView = iCat.View[key] || new item.view(key, setItem);
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

							if(setItem.config.scrollWrap || self.config.scrollWrap)
								self.routes.scrollWrap = self.config.scrollWrap || setItem.config.scrollWrap;
							self._regEvents(curView, init);
						}
					);
				} else {
					var curView = item.view,
						key = curView.viewId,
						cfg = iCat.Model.__pageData[curView.viewId].config;
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
					self._regEvents(curView, init);
				}
			});
		},

		vmRemove: function(vid){
			if(!vid) return;

			var self = this;
			if(iCat.isString(vid) && vid.indexOf(',')<0){
				var vmGroups = self.vmGroups;
				if(vmGroups[vid]){
					var events = iCat.Model.__pageData[vid].config.events;
					if(events){
						iCat.util.recurse(events, function(o){
							Event.undelegate(o);
							if(self.selectors.contains(o.selector)){
								self.selectors.remove(o.selector);
							}
						});
					}
					delete vmGroups[vid];
				}
			} else {
				var fn = arguments.callee;
				vid = iCat.isString(vid)? vid.split(',') : vid;
				iCat.isArray(vid)?// fixed bug:当调用fn时，其中的this指向window
					vid.forEach(function(k){fn.call(self, k);}) : iCat.foreach(vid, function(k){fn.call(self, k);});
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
			var oldCfg = iCat.Model.__pageData[vid].config,
				ret = (d.ajaxUrl && oldCfg.ajaxUrl!=d.ajaxUrl) ||
					  (d.tempId && oldCfg.tempId!=d.tempId) ||
					  (d.wrap && oldCfg.wrap!=d.wrap);
			iCat.mix(oldCfg, d);
			return ret;
		},

		dataChange: function(vid, d){
			var oldData = iCat.Model.__pageData[vid].prevData,
				ret = !iCat.util._jsonCompare(d, oldData);
			iCat.Model.__pageData[vid].prevData = JSON.stringify(d);
			return ret;
		},

		GlobalData: function(key, d){
			var GD = iCat.Model.__globalData = iCat.Model.__globalData || {};
			if(!d) return GD[key];
			if(!GD[key]) GD[key] = d;
		}
	});

	iCat.mix(iCat, {
		ctrlAble: function(arrCtrl, callback){
			if(!arrCtrl) return;
			arrCtrl = iCat.isArray(arrCtrl) ? arrCtrl : [arrCtrl];
			arrCtrl.forEach(function(item){
				Event.__event_selectors = Event.__event_selectors.concat(item.selectors);
				Event.__event_selectors.unique();
			});
			if(callback && iCat.isFunction(callback)){
				callback();
			}
		},

		ctrlDisable: function(arrCtrl){
			if(!arrCtrl) return;
			arrCtrl = iCat.isArray(arrCtrl) ? arrCtrl : [arrCtrl];
			arrCtrl.forEach(function(item){
				item.selectors.forEach(function(v){
					delete Event.items[v];
					Event.__event_selectors.remove(v);
				});
			});
		}
	});
})(ICAT, this, document);