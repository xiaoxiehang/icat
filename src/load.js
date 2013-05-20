/* loader.js # */
(function(iCat, root, doc){
	/*
	 * pageRef:参照页面路径
	 * sysRef:参照icat.js所在的sys目录路径
	 * appRef:参照main.js所在的目录路径
	 * timestamp:时间戳
	 */
	iCat.PathConfig = function(cfg){
		var pc = iCat.PathConfig,
			_curScript = iCat.util.getCurrentJS(),
			src = _curScript.src,
			baseURI = _curScript.baseURI,
			refSlipt = _curScript.getAttribute('refSlipt') || '';
		
		pc._isConcat = src.indexOf('??')>=0;
		if(refSlipt && baseURI.indexOf(refSlipt)==-1) refSlipt = false;//fixed bug:分隔符在字符串里不存在时

		if(!pc.appRef){
			var strExp = iCat.DemoMode?
					(refSlipt? '('+refSlipt+'/).*' : '(/)([\\w\\.]+)?\\?.*') : '(//[\\w\\.]+/).*',
				regExp = new RegExp(strExp, 'g');
			baseURI = (iCat.DemoMode && !refSlipt)? baseURI+'?' : baseURI;//fixed bug:加?为了匹配类似/index.php的情况
			pc.pageRef = pc.pageRef || baseURI.replace(regExp, '$1');
			pc.weinreRef = iCat.IPMode? baseURI.replace(/(\d+(\.\d+){3}).*/g, '$1:8080/') : '';

			if(pc._isConcat){
				var arrsrc = src.replace(/(\?{2}|\.js(?=\?))/g, '$1|').split('|'),
					_webRoot = arrsrc[0].replace(/\?+/g,'');
				pc._webRoot = arrsrc[0];
				pc.timestamp = arrsrc[2] || '';//fixed bug:时间戳没设置时，会有undefined

				arrsrc[1].split(',').forEach(function(v){
					if(/\/sys\//i.test(v))
						pc._sysRef = v.replace(/(\/sys\/).*/ig, '$1');
					if(/\/apps\//i.test(v))
						pc._appRef = v.replace(/(\/)\w+(\.\w+)?\.js/g, '$1');
				});

				pc.sysRef = (_webRoot+pc._sysRef).replace(/([^:])\/{2,}/g,'$1/');//fixed bug:把http://变成了http:/
				pc.appRef = (_webRoot+pc._appRef).replace(/([^:])\/{2,}/g,'$1/');
			} else {
				if(cfg===true){//初始化设置pageRef,sysRef
					pc.sysRef = /\/sys\//i.test(src)? src.replace(/(\/sys\/).*/ig, '$1') : src.replace(/(\/)\w+(\.\w+)?\.js(.*)?/g, '$1');
					pc.timestamp = src.replace(/.*\.js(\?)?/g, '$1');
				} else {//设置appRef
					pc.appRef = src.replace(/(\/)\w+(\.\w+)?\.js(.*)?/g, '$1');
					if(!pc.timestamp)
						pc.timestamp = src.replace(/.*\.js(\?)?/g, '$1');
				}
			}
		}

		if(iCat.isObject(cfg)){
			iCat.mix(pc, cfg);
		}
	};

	// The first execution 
	iCat.PathConfig(true);

	// support user's config
	iCat.ModsConfig = function(cfg){
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
	};

	var loader = {
		_loadedGroup: {},//loaded-js
		_modGroup: {},//loaded-module

		_fnLoad: function(option, pNode, node){
			node.onload = function(){
				loader._loadedGroup[option.file] = true;
				if(option.callback && iCat.isFunction(option.callback))
					option.callback(option.context || iCat);
				if(option.modName)
					loader._modGroup[option.modName] = true;
				loader._loadedGroup[option.file] = true;
				if(!iCat.$ && (root['jQuery'] || root['Zepto'])){
					iCat.$ = root['jQuery'] || root['Zepto'];
				}
			};
			pNode.appendChild(node);
		},

		blockLoad: function(file){
			var _url = file.indexOf('#')>0 ?
					file.replace(/(#.*)/, iCat.PathConfig.timestamp+'$1') : (file + iCat.PathConfig.timestamp);
			if(loader._loadedGroup[_url]) return;
			
			var type = file.replace(/.*\.(css|js)/g,'$1'),
				isCSS = type=='css',
				tag = isCSS? 'link':'script',
				attr = isCSS? ' type="text/css" rel="stylesheet"' : ' type="text/javascript"',
				path = (isCSS? 'href':'src') + '="' + _url + '"';
			doc.write('<'+tag+attr+path+(isCSS? '/>':'></'+tag+'>'));
			loader._loadedGroup[file] = true;
			if(!iCat.$ && (root['jQuery'] || root['Zepto'])) iCat.$ = root['jQuery'] || root['Zepto'];
		},

		unblockLoad: function(option){
			//增加时间戳
			var	_url = option.file.indexOf('#')>0?
					option.file.replace(/(#.*)/, iCat.PathConfig.timestamp+'$1') : (option.file + iCat.PathConfig.timestamp);
			option.file = option.file.replace(/(#.*)/g, '');
			
			if(loader._loadedGroup[option.file]){
				if(option.callback && iCat.isFunction(option.callback))
					option.callback(option.context || iCat);
				
				if(option.modName){
					loader._modGroup[option.modName] = true;
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
				var pNode = doc.body || doc.getElementsByTagName('body')[0];
				if(!pNode){
					iCat.__cache_timers[k] = false;
					return;
				}

				delete iCat.__cache_timers[k];
				
				/* 监听加载完成 */
				if(type==='js'){
					loader._fnLoad(option, pNode, node, iCat);//shim-loader needs iCat
				}
				
				/* css不需要监听加载完成*/
				if(type==='css'){
					setTimeout(function(){
						if(option.callback && iCat.isFunction(option.callback))
							option.callback(option.context || iCat);
						
						if(option.modName){
							loader._modGroup[option.modName] = true;
						}
					},5);
					loader._loadedGroup[option.file] = true;
					pNode.appendChild(node);
				}
			});
		}
	};

	if(iCat.Shim.loader){//keep Compatible
		iCat.mix(loader, iCat.Shim.loader);
	}

	//对外接口
	iCat.mix(iCat, {

		/* 阻塞式加载文件 */
		inc: function(files){
			if(!files) return;
			files = iCat.isString(files)? [files] : files;
			
			iCat.foreach(iCat.util.getURL(files), function(i, v){
				if(!v) return;
				loader.blockLoad(v);
			});
		},

		/* 加载文件形式：
		 * - 单个文件，支持字符串或文件数组(length为1)
		 * - 多个文件，必须是文件数组
		 * - 参数：options || files, callback, isDepend, isSingle, context
		 */
		include: function(){//加载一个或多个文件
			if(!arguments.length) return;

			if(arguments.length==1){
				var opt = arguments[0];
				if(iCat.isString(opt) || iCat.isArray(opt)) opt = {files:opt};
				if(!iCat.isObject(opt) || !opt.files) return;

				opt.files = iCat.isString(opt.files) ?
						iCat.util.getURL([opt.files]) : iCat.util.getURL(opt.files, opt.isSingle);
				
				(function(){
					if(!opt.files.length) return;

					var curJS = opt.files.shift(),
						fn = arguments.callee;
					if(opt.files.length){
						if(opt.isDepend)//文件间有依赖 顺序加载
							loader.unblockLoad({
								file: curJS,
								callback: function(){
									fn(opt.files);//next
								},
								context: opt.context
							});
						else {
							loader.unblockLoad({
								file: curJS,
								context: opt.context
							});
							fn(opt.files);//next
						}
					} else {
						loader.unblockLoad({
							file: curJS,
							callback: opt.callback,
							context: opt.context
						});
					}
				})();
			} else {
				arguments.callee({
					files: arguments[0],
					callback: arguments[1],
					isDepend: arguments[2],
					isSingle: arguments[3],
					context: arguments[4]
				});
			}
		},
		
		/* 加载文件形式：
		 * - 单个文件，支持字符串或文件数组(length为1)
		 * - 多个文件，必须是文件数组
		 * - 参数：options || modName, files, callback, isSingle, context
		 */
		require: function(){//加载有依赖的模块
			if(!arguments.length) return;

			if(arguments.length==1){
				var opt = arguments[0];
				if(iCat.isString(opt)) opt = {modName:opt};
				if(!iCat.isObject(opt) || !(opt.files = opt.files || iCat.ModsConfig[opt.modName])) return;

				opt.files = iCat.isString(opt.files) ?
						iCat.util.getURL([opt.files]) : iCat.util.getURL(opt.files, opt.isSingle);
			
				if(loader._modGroup[opt.modName]){
					if(opt.callback)
						opt.callback(opt.context);
				} else {
					(function(){
						if(!opt.files.length) return;

						var curJS = opt.files.shift(),
							fn = arguments.callee;
						if(opt.files.length){
							loader.unblockLoad({
								file: curJS,
								callback: function(){fn(opt.files);},
								context: opt.context,
								modName: opt.modName
							});
						} else {
							loader.unblockLoad({
								file: curJS,
								callback: opt.callback,
								context: opt.context,
								modName: opt.modName
							});
						}
					})();
				}
			} else {
				arguments.callee({
					modName: arguments[0],
					files: arguments[1],
					callback: arguments[2],
					isSingle: arguments[3],
					context: arguments[4]
				});
			}
		},
		
		//使用已加载后的模块
		//参数：options || modName, callback, delay, context
		use: function(opt){
			if(!arguments.length) return;

			var i = 0, timer;
			if(arguments.length==1){
				var opt = arguments[0];
				if(!iCat.isObject(opt)) return;

				iCat.util.wait(function(k, t){
					if(!loader._modGroup[opt.modName]){
						iCat.__cache_timers[k] = false;
						if(t==50 && iCat.ModsConfig[opt.modName]){
							delete iCat.__cache_timers[k];
							iCat.require({
								modName: opt.modName,
								files: iCat.ModsConfig[opt.modName],
								callback: opt.callback,
								context: opt.context
							});
						}
						return;
					}

					delete iCat.__cache_timers[k];
					if(opt.callback)
						opt.callback(opt.context);
				}, 60, 10);
			} else {
				arguments.callee({
					modName: arguments[0],
					callback: arguments[1],
					delay: arguments[2],
					context: arguments[3]
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
		var weinrejs = iCat.PathConfig.weinreRef + 'target/target-script-min.js!' + (location.hash || '');
		iCat.include(weinrejs);// fixed bug:用inc当js无法加载时，会阻碍页面渲染
	};

	//如果是ip模式，自动调用weinre
	if(iCat.IPMode){
		iCat.weinreStart();
	}
})(ICAT, this, document);