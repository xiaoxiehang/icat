/* load.js # */
(function(iCat, root, doc){

	// 本模块公用方法
	var _loadedGroup = {}, _modGroup = {}, _fnLoad;
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
		_dealURL: function(arr, isSingle){//isSingle表示强制单个加载
			if(!arr.length) return;
			if(arr.length===1) isSingle = true;

			var newArr, urlArr = [],
				_notUrl = function(s){
					var v = s,
						isConcat = iCat.PathConfig._isConcat && !isSingle ? '_' : '';
					if(/^\.{1,}\//.test(v)){//type3
						v = /^\.\//.test(v) ?
								v.replace(/^\.\//g, iCat.PathConfig[isConcat+'appRef']) :
								v.replace(/^\.{2}\//g, iCat.PathConfig[isConcat+'appRef'].replace(/\w+\/$/g,''));
					}
					else if(/^\//.test(v)){//type2
						v = v.replace(/^\//g, iCat.PathConfig.pageRef);
					} else {//type1
						v = iCat.PathConfig[isConcat+'sysRef'] + v;
					}

					return v;
				};
			
			if(iCat.PathConfig._isConcat && !isSingle){
				newArr = '';
				iCat.DebugMode ?
					arr.forEach(function(v){
						v = v.replace(/\?.*/, '');
						if(/^(http|ftp|https):\/\//i.test(v))//type4
							urlArr.push(
								v.indexOf('!')>=0 ?
									v.replace(/\!/g,'') :
									v.replace(/(\.source)?(\.(js|css))/g,'.source$2')
							);
						else {
							if(/^\//.test(v)){
								v = _notUrl(v);
								urlArr.push(
									v.indexOf('!')>=0 ?
										v.replace(/\!/g,'') :
										v.replace(/(\.source)?(\.(js|css))/g,'.source$2')
								);
							} else {
								v = _notUrl(v);
								newArr += (v.indexOf('!')>=0? v.replace(/\!/g,'') : v.replace(/(\.source)?(\.(js|css))/g,'.source$2')) + ',';
							}
						}
					})
					:
					arr.forEach(function(v){
						v = v.replace(/\?.*/, '');
						v = v.replace(/\!/g,'');
						if(/^(http|ftp|https):\/\//i.test(v))//type4
							urlArr.push(v);
						else {
							if(/^\//.test(v)){
								urlArr.push(_notUrl(v));
							} else {
								newArr += _notUrl(v) + ',';
							}
						}
					});

				newArr = iCat.PathConfig._webRoot + newArr.replace(/,$/g, '');
				return [newArr].concat(urlArr);
			} else {
				newArr = [];
				iCat.DebugMode ?
					arr.forEach(function(v){
						v = v.replace(/\?.*/, '');
						if(/^(http|ftp|https):\/\//i.test(v))//type4：网址
							newArr.push(
								v.indexOf('!')>=0 ?
									v.replace(/\!/g,'') :
									v.replace(/(\.source)?(\.(js|css))/g,'.source$2')
							);
						else {
							v = _notUrl(v);
							newArr.push(
								v.indexOf('!')>=0 ?
									v.replace(/\!/g,'') :
									v.replace(/(\.source)?(\.(js|css))/g,'.source$2')
							);
						}
					})
					:
					arr.forEach(function(v){
						v = v.replace(/\?.*/, '');
						v = v.replace(/\!/g,'');
						if(/^(http|ftp|https):\/\//i.test(v))//type4：网址
							newArr.push(v);
						else {
							newArr.push(_notUrl(v));
						}
					});

				return newArr;
			}
		},

		_blockImport: function(file){
			var url = file,
				_url = url.indexOf('#')>0?
					url.replace(/(#.*)/, iCat.PathConfig.timestamp+'$1') : (url + iCat.PathConfig.timestamp);

			if(_loadedGroup[_url]) return;
			
			var type = url.replace(/.*\./g,''),
				isCSS = type=='css', tag = isCSS? 'link':'script',
				attr = isCSS? ' type="text/css" rel="stylesheet"' : ' type="text/javascript"',
				path = (isCSS? 'href':'src') + '="'+_url+'"';
			doc.write('<'+tag+attr+path+(isCSS? '/>':'></'+tag+'>'));
			_loadedGroup[url] = true;
		},

		_unblockImport: function(option){
			//增加时间戳
			var	_url = option.file.indexOf('#')>0?
					option.file.replace(/(#.*)/, iCat.PathConfig.timestamp+'$1') : (option.file + iCat.PathConfig.timestamp);
			
			if(_loadedGroup[option.file]){
				if(option.callback && iCat.isFunction(option.callback))
					option.callback(option.context || iCat);
				
				if(option.modName){
					_modGroup[option.modName] = true;
				}
				return;
			}
			
			var node, type = option.file.replace(/.*\./g,'');
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
			
			iCat.util.waitObj(function(k){
				var pNode = doc.body || doc.getElementsByTagName('body')[0];
				if(!pNode){
					iCat.__cache_timers[k] = false;
					return;
				}

				iCat.__cache_timers[k] = true;
				
				/* 监听加载完成 */
				if(type==='js'){
					_fnLoad = SHIM._load || function(MG, LG, option, pNode, node, _icat){
						node.onload = function(){
							if(option.callback && _icat.isFunction(option.callback))
								option.callback(option.context || _icat);
							
							if(option.modName){
								MG[option.modName] = true;
							}
							LG[option.file] = true;
						};
						pNode.appendChild(node);
					};
					_fnLoad(_modGroup, _loadedGroup, option, pNode, node, iCat);
				}
				
				/* css不需要监听加载完成*/
				if(type==='css'){
					setTimeout(function(){
						if(option.callback && _icat.isFunction(option.callback))
							option.callback(option.context || _icat);
						
						if(option.modName){
							_modGroup[option.modName] = true;
						}
					},5);
					_loadedGroup[option.file] = true;
					pNode.appendChild(node);
				}
			});
		}
	});

	/*
	 * pageRef:参照页面路径
	 * sysRef:参照icat.js所在的sys目录路径
	 * appRef:参照main.js所在的目录路径
	 * timestamp:时间戳
	 */
	iCat.PathConfig = function(cfg){
		var _curScript = iCat.util.getCurrentJS(),
			src = _curScript.src,
			refSlipt = _curScript.getAttribute('refSlipt') || '';
		
		iCat.PathConfig._isConcat = src.indexOf('??')>=0;
		if(refSlipt && _curScript.baseURI.indexOf(refSlipt)==-1) refSlipt = false;//fixed bug:分隔符在字符串里不存在时

		if(!iCat.PathConfig.appRef){
			var baseURI = (iCat.DemoMode && !refSlipt)?//fixed bug:为了匹配类似/index.php的情况
					_curScript.baseURI+'?' : _curScript.baseURI,
				strExp = iCat.DemoMode? (refSlipt? '('+refSlipt+'/).*' : '(/)([\\w\\.]+)?\\?.*') : '(//[\\w\\.]+/).*',
				regExp = new RegExp(strExp, 'g');
			iCat.PathConfig.pageRef = iCat.PathConfig.pageRef || baseURI.replace(regExp, '$1');
			iCat.PathConfig.weinreRef = iCat.IPMode? baseURI.replace(/(\d+(\.\d+){3}).*/g, '$1:8080/') : '';

			if(iCat.PathConfig._isConcat){
				var arrsrc = src.replace(/(\?{2}|\.js(?=\?))/g, '$1|').split('|'),
					_webRoot = arrsrc[0].replace(/\?+/g,'');
				iCat.PathConfig._webRoot = arrsrc[0];
				iCat.PathConfig.timestamp = arrsrc[2] || '';//fixed bug:时间戳没设置时，会有undefined

				arrsrc[1].split(',').forEach(function(v){
					if(/\/sys\//i.test(v))
						iCat.PathConfig._sysRef = v.replace(/(\/sys\/).*/ig, '$1');
					if(/\/apps\//i.test(v))
						iCat.PathConfig._appRef = v.replace(/(\/)\w+(\.\w+)?\.js/g, '$1');
				});

				iCat.PathConfig.sysRef = (_webRoot+iCat.PathConfig._sysRef).replace(/([^:])\/{2,}/g,'$1/');//fixed bug:把http://变成了http:/
				iCat.PathConfig.appRef = (_webRoot+iCat.PathConfig._appRef).replace(/([^:])\/{2,}/g,'$1/');
			} else {
				if(cfg===true){//初始化设置pageRef,sysRef
					iCat.PathConfig.sysRef = /\/sys\//i.test(src)? src.replace(/(\/sys\/).*/ig, '$1') : src.replace(/(\/)\w+(\.\w+)?\.js(.*)?/g, '$1');
					iCat.PathConfig.timestamp = src.replace(/.*\.js(\?)?/g, '$1');
				} else {//设置appRef
					iCat.PathConfig.appRef = src.replace(/(\/)\w+(\.\w+)?\.js(.*)?/g, '$1');
					if(!iCat.PathConfig.timestamp)
						iCat.PathConfig.timestamp = src.replace(/.*\.js(\?)?/g, '$1');
				}
			}
		}

		if(iCat.isObject(cfg)){
			iCat.mix(iCat.PathConfig, cfg);
		}
	};

	// The first execution 
	iCat.PathConfig(true);

	// support user's config
	iCat.ModsConfig = function(cfg){
		if(iCat.isArray(cfg)){
			iCat.foreach(cfg, function(k, v){
				iCat.ModsConfig[v.modName] = (iCat.ModsConfig[v.modName]||[]).concat(v.paths);
			});
		} else {
			if(cfg.modName && cfg.paths){
				iCat.ModsConfig[cfg.modName] = (iCat.ModsConfig[cfg.modName]||[]).concat(cfg.paths);
			} else {
				iCat.foreach(cfg, function(k, v){
					iCat.ModsConfig[k] = (iCat.ModsConfig[k]||[]).concat(v);
				});
			}
		}
	};

	//对外接口
	iCat.mix(iCat, {

		/* 阻塞式加载文件 */
		inc: function(files){
			if(!files) return;
			files = iCat.isString(files)? [files] : files;
			
			iCat.foreach(iCat.util._dealURL(files), function(i, v){
				if(!v) return;
				iCat.util._blockImport(v);
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
				if(iCat.isString(opt)) opt = {files:opt};
				if(!iCat.isObject(opt) || !opt.files) return;

				opt.files = iCat.isString(opt.files) ?
								iCat.util._dealURL([opt.files]) : iCat.util._dealURL(opt.files, opt.isSingle);
				
				(function(){
					if(!opt.files.length) return;

					var curJS = opt.files.shift(),
						fn = arguments.callee;
					if(opt.files.length){
						if(opt.isDepend)//文件间有依赖 顺序加载
							iCat.util._unblockImport({
								file: curJS,
								callback: function(){
									fn(opt.files);//next
								},
								context: opt.context
							});
						else {
							iCat.util._unblockImport({
								file: curJS,
								context: opt.context
							});
							fn(opt.files);//next
						}
					} else {
						iCat.util._unblockImport({
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
				if(!iCat.isObject(opt) || !(opt.files = opt.files || iCat.ModsConfig[opt.modName])) return;

				opt.files = iCat.isString(opt.files) ?
								iCat.util._dealURL([opt.files]) : iCat.util._dealURL(opt.files, opt.isSingle);
			
				if(_modGroup[opt.modName]){
					if(opt.callback)
						opt.callback(opt.context);
				} else {
					(function(){
						if(!opt.files.length) return;

						var curJS = opt.files.shift(),
							fn = arguments.callee;
						if(opt.files.length){
							iCat.util._unblockImport({
								file: curJS,
								callback: function(){fn(opt.files);},
								context: opt.context,
								modName: opt.modName
							});
						} else {
							iCat.util._unblockImport({
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

				iCat.util.waitObj(function(k, t){
					if(!_modGroup[opt.modName]){
						iCat.__cache_timers[k] = false;
						if(t==50 && iCat.ModsConfig[opt.modName]){
							iCat.require({
								modName: opt.modName,
								files: iCat.ModsConfig[opt.modName],
								context: opt.context
							});
						}
						return;
					}

					iCat.__cache_timers[k] = true;
					if(opt.callback)
						opt.callback(opt.context);
				});
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
			modName: 'zepto_core',
			paths: ['lib/zepto/src/zepto.js', 'lib/zepto/src/event.js', 'lib/zepto/src/ajax.js', 'lib/zepto/src/fx.js']
		},{
			modName: 'app_mvcBase',
			paths: ['./mvc/template.js', './mvc/initdata.js', './mvc/view.js', './mvc/model.js', './mvc/controller.js']
		}
	]);

	iCat.weinreStart = function(){
		if(!iCat.PathConfig.weinreRef) return;
		var weinrejs = iCat.PathConfig.weinreRef + 'target/target-script-min.js!' + (location.hash || '');
		iCat.include(weinrejs);
	};

	//如果是ip模式，自动调用weinre
	if(iCat.IPMode){
		iCat.weinreStart();
	}
})(ICAT, this, document);