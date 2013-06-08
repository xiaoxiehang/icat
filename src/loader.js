/* loader.js # */
(function(iCat, root, doc){
	// 创建Loader命名空间
	iCat.namespace('Loader');
	
	var fnPathConfig,
		Sloader = iCat.Shim.loader || {};//keep Compatible

	iCat.Class('Tools',
	{
		init: function(){
			var oSelf = this;
			return {
				getCurrentJS: function(){
					var scripts = doc.getElementsByTagName('script');
					return scripts[scripts.length-1];
				},

				getConcatUrl: function(src, o){
					var arrsrc = src.replace(/(\?{2}|\.js(?=\?))/g, '$1|').split('|'),
					_webRoot = arrsrc[0].replace(/\?+/g,'');
					o._webRoot = arrsrc[0];
					o.timestamp = arrsrc[2] || '';//fixed bug:时间戳没设置时，会有undefined

					arrsrc[1].split(',').forEach(function(v){
						if(/\/sys\//i.test(v))
							o._sysRef = v.replace(/(\/sys\/).*/ig, '$1');
						if(/\/apps\//i.test(v))
							o._appRef = v.replace(/(\/)\w+(\.\w+)?\.js/g, '$1');
					});

					o.sysRef = (_webRoot+o._sysRef).replace(/([^:])\/{2,}/g,'$1/');//fixed bug:把http://变成了http:/
					o.appRef = (_webRoot+o._appRef).replace(/([^:])\/{2,}/g,'$1/');
				},

				getCommonUrl: function(src, o, init){
					if(init){//初始化设置pageRef,sysRef
						o.sysRef = /\/sys\//i.test(src)?
							src.replace(/(\/sys\/).*/ig, '$1') : src.replace(/(\/)\w+(\.\w+)?\.js(.*)?/g, '$1');
						o.timestamp = src.replace(/.*\.js(\?)?/g, '$1');
					} else {//设置appRef
						o.appRef = src.replace(/(\/)\w+(\.\w+)?\.js(.*)?/g, '$1');
						if(!o.timestamp)
							o.timestamp = src.replace(/.*\.js(\?)?/g, '$1');
					}
				},

				fnInc: function(files){
					files = iCat.isString(files)? [files] : files;
					oSelf.getURL(files).forEach(function(v){
						if(!v) return;
						oSelf.blockLoad(v);
					});
				},

				fnOption: function(option, isRequire){
					oSelf._fnOption.apply(oSelf, arguments);
				},

				fnInclude: function(files, callback, isDepend, isSingle, context){
					oSelf._fnOption({
						files: files, callback: callback,
						isDepend: isDepend, isSingle: isSingle,
						context: context
					});
				},

				fnRequire: function(modName, files, callback, isSingle, context){
					oSelf._fnOption({
						modName: modName,
						files: files, callback: callback,
						isSingle: isSingle, context: context
					});
				},

				fnUse: function(){
					var opt = arguments[0];
					if(!iCat.isObject(opt)) return;

					iCat.util.wait(function(k, t){
						if(!oSelf._modGroup[opt.modName]){
							iCat.__cache_timers[k] = false;
							if(t==50 && iCat.ModsConfig[opt.modName]){
								delete iCat.__cache_timers[k];
								iCat.require({
									modName: opt.modName,
									files: iCat.ModsConfig[opt.modName],
									callback: opt.callback, context: opt.context
								});
							}
							return;
						}

						delete iCat.__cache_timers[k];
						if(opt.callback)
							opt.callback(opt.context);
					}, 60, 10);
				}
			}
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
			} else {//type1
				strPath = sysRef + strPath;
			}

			return strPath;
		},

		_loadedGroup: {},//loaded-js

		_modGroup: {},//loaded-module

		_fnLoad: Sloader._fnLoad || function(option, pNode, node){
			var oSelf = this;
			node.onload = function(){
				oSelf._loadedGroup[option.file] = true;
				if(option.callback && iCat.isFunction(option.callback))
					option.callback(option.context || iCat);
				if(option.modName)
					oSelf._modGroup[option.modName] = true;
				oSelf._loadedGroup[option.file] = true;
				if(!iCat.$ && (root['jQuery'] || root['Zepto'])){
					iCat.$ = root['jQuery'] || root['Zepto'];
				}
			};
			pNode.appendChild(node);
			pNode.removeChild(node);
		},

		getURL: function(arr, isSingle){//isSingle表示强制单个加载
			if(!iCat.isArray(arr) || !arr.length) return;
			if(arr.length===1) isSingle = true;

			var oSelf = this,
				singleArr = [], newArr = [],
				isConcat = iCat.PathConfig._isConcat && !isSingle;
			arr.forEach(function(v){
				v = v.replace(/([^\:])\/+/g, '$1/');
				if(iCat.DebugMode){
					v = v.indexOf('!')>=0 ?
							v.replace(/\!/g,'') : v.replace(/(\.source)?(\.(js|css))/g, '.source$2');
				} else {
					v = v.replace(/\!/g,'');
				}

				if(/^\w+:\/\/|^\/\w+/.test(v)){//type4|type2
					v = /^\/\w+/.test(v)?
						v.replace(/^\//g, iCat.PathConfig.pageRef) : v;
					singleArr.push(v);
				} else {
					v = oSelf._fullUrl(v, isConcat);
					newArr.push(v);
				}
			});
			newArr = isConcat? [iCat.PathConfig._webRoot + newArr.join(',')] : newArr;
			return newArr.concat(singleArr);
		},

		blockLoad: function(file){
			var oSelf = this,
				_url = file.indexOf('#')>0 ?
					file.replace(/(#.*)/, iCat.PathConfig.timestamp+'$1') : (file + iCat.PathConfig.timestamp);
			if(oSelf._loadedGroup[_url]) return;
			
			var type = file.replace(/.*\.(css|js)/g,'$1'),
				isCSS = type=='css',
				tag = isCSS? 'link':'script',
				attr = isCSS? ' type="text/css" rel="stylesheet"' : ' type="text/javascript"',
				path = (isCSS? 'href':'src') + '="' + _url + '"';
			doc.write('<'+tag+attr+path+(isCSS? '/>':'></'+tag+'>'));
			oSelf._loadedGroup[file] = true;
			if(!iCat.$ && (root['jQuery'] || root['Zepto'])) iCat.$ = root['jQuery'] || root['Zepto'];
		},

		unblockLoad: function(option){
			//增加时间戳
			var	oSelf = this,
				_url = option.file.indexOf('#')>0?
					option.file.replace(/(#.*)/, iCat.PathConfig.timestamp+'$1') : (option.file + iCat.PathConfig.timestamp);
			option.file = option.file.replace(/(#.*)/g, '');
			
			if(oSelf._loadedGroup[option.file]){
				if(option.callback && iCat.isFunction(option.callback))
					option.callback(option.context || iCat);
				
				if(option.modName){
					oSelf._modGroup[option.modName] = true;
				}
				return;
			}
			
			var node, type = option.file.replace(/.*\.(css|js)/g,'$1');
			if(type==='css'){
				node = doc.createElement('link');
				node.setAttribute('type', 'text/css');
				node.setAttribute('rel', 'stylesheet');
				node.setAttribute('href', _url);
			} else if(type==='js'){
				node = doc.createElement('script');
				node.setAttribute('type', 'text/javascript');
				node.setAttribute('src', _url);
				node.setAttribute('async', true);
			}
			
			if(!node) return;
			
			iCat.util.wait(function(k){
				var nodeReady = doc.body || doc.getElementsByTagName('body')[0],
					pNode;
				if(!nodeReady){
					iCat.__cache_timers[k] = false;
					return;
				}

				delete iCat.__cache_timers[k];
				pNode = doc.head || doc.getElementsByTagName('head')[0];
				
				/* 监听加载完成 */
				if(type==='js'){
					oSelf._fnLoad(option, pNode, node);
				}
				
				/* css不需要监听加载完成*/
				if(type==='css'){
					setTimeout(function(){
						if(option.callback && iCat.isFunction(option.callback))
							option.callback(option.context || iCat);
						
						if(option.modName){
							oSelf._modGroup[option.modName] = true;
						}
					},5);
					oSelf._loadedGroup[option.file] = true;
					pNode.appendChild(node);
					pNode.removeChild(node);
				}
			});
		},

		_fnOption: function(option, isRequire){
			var oSelf = this,
				opt = option, fn;
			if(isRequire){
				if(iCat.isString(opt)) opt = {modName:opt};
				if(!iCat.isObject(opt) || !(opt.files = opt.files || iCat.ModsConfig[opt.modName])) return;
			} else {
				if(iCat.isString(opt) || iCat.isArray(opt)) opt = {files:opt};
				if(!iCat.isObject(opt) || !opt.files) return;
			}

			opt.files = iCat.isString(opt.files) ?
					oSelf.getURL([opt.files]) : oSelf.getURL(opt.files, opt.isSingle);

			if(isRequire && oSelf._modGroup[opt.modName] && opt.callback){
				opt.callback();
				return;
			}

			if(isRequire) opt.isDepend = true;

			(fn = function(){
				if(!opt.files.length) return;
				var curJS = opt.files.shift();
				if(opt.files.length){
					if(opt.isDepend)//文件间有依赖 顺序加载
						oSelf.unblockLoad({
							file: curJS,
							callback: function(){
								fn(opt.files);//next
							},
							context: opt.context,
							modName: opt.modName
						});
					else {
						oSelf.unblockLoad({
							file: curJS,
							context: opt.context
						});
						fn(opt.files);//next
					}
				} else {
					oSelf.unblockLoad({
						file: curJS,
						callback: opt.callback,
						context: opt.context,
						modName: opt.modName
					});
				}
			})();
		}
	}, iCat.Loader);

	var loader = new iCat.Loader.Tools().init();
	delete iCat.Loader.Tools;
	delete iCat.Loader;

	/*
	 * pageRef:参照页面路径
	 * sysRef:参照icat.js所在的sys目录路径
	 * appRef:参照main.js所在的目录路径
	 * timestamp:时间戳
	 */
	(fnPathConfig = function(cfg){
		var pc = iCat.PathConfig,
			_curScript = loader.getCurrentJS(), src = _curScript.src;
		pc._isConcat = src.indexOf('??')>=0;

		if(!pc.appRef){
			pc._isConcat?
				loader.getConcatUrl(src, pc) : loader.getCommonUrl(src, pc, cfg===true);
		}

		if(iCat.isObject(cfg)){
			iCat.mix(pc, cfg);
		}
	})(true);

	//对外接口
	iCat.mix(iCat, {

		PathConfig: iCat.mix(fnPathConfig, iCat.PathConfig),

		// support user's config
		ModsConfig: function(cfg){
			var mc = iCat.ModsConfig;
			if(iCat.isArray(cfg)){
				iCat.foreach(cfg, function(k, v){
					mc[v.modName] = (mc[v.modName]||[]).concat(v.paths);
				});
			} else {
				if(cfg.modName && cfg.paths){
					mc[cfg.modName] = (mc[cfg.modName]||[]).concat(cfg.paths);
				} else {
					iCat.foreach(cfg, function(k, v){
						mc[k] = (mc[k]||[]).concat(v);
					});
				}
			}
		},

		/* 阻塞式加载文件 */
		inc: function(){
			if(!arguments.length) return;
			loader.fnInc(arguments[0]);
		},

		/* 加载文件形式：
		 * - 单个文件，支持字符串或文件数组(length为1)
		 * - 多个文件，必须是文件数组
		 * - 参数：options || files, callback, isDepend, isSingle, context
		 */
		include: function(){//加载一个或多个文件
			if(!arguments.length) return;
			arguments.length==1?
				loader.fnOption(arguments[0]) :
				loader.fnInclude(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
		},
		
		/* 加载文件形式：
		 * - 单个文件，支持字符串或文件数组(length为1)
		 * - 多个文件，必须是文件数组
		 * - 参数：options || modName, files, callback, isSingle, context
		 */
		require: function(){//加载有依赖的模块
			if(!arguments.length) return;
			arguments.length==1?
				loader.fnOption(arguments[0]) :
				loader.fnRequire(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
		},
		
		//使用已加载后的模块
		//参数：options || modName, callback, delay, context
		use: function(opt){
			if(!arguments.length) return;
			if(arguments.length==1){
				loader.fnUse(arguments[0]);
			} else {
				loader.fnUse({
					modName: arguments[0], callback: arguments[1],
					delay: arguments[2], context: arguments[3]
				});
			}
		}
	});

	//默认模块
	iCat.ModsConfig([
		{
			modName: 'zeptoCore',
			paths: ['lib/zepto/src/zepto.js', 'lib/zepto/src/event.js', 'lib/zepto/src/ajax.js', 'lib/zepto/src/fx.js']
		},{
			modName: 'appMVC',
			paths: ['./mvc/view.js', './mvc/model.js', './mvc/controller.js']
		}
	]);

	iCat.weinreStart = function(){
		if(!iCat.PathConfig.weinreRef) return;

		var whash = iCat.util.cookie('__w_hash') || '';
		if(location.hash && !whash){
			iCat.util.cookie('__w_hash', location.hash, 3600);
		}
		var weinrejs = iCat.PathConfig.weinreRef + 'target/target-script-min.js!' + whash;
		iCat.include(weinrejs);// fixed bug:用inc当js无法加载时，会阻碍页面渲染
	};

	//如果是ip模式，自动调用weinre
	if(iCat.IPMode) iCat.weinreStart();
})(ICAT, this, document);