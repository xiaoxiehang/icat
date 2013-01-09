/** load.js */
(function(iCat){
	var doc = document,
		ohead = doc.head || doc.getElementsByTagName('head')[0],
		_metaAppRef = doc.getElementsByName('appRef')[0],
		_curScript, _curUrl, _timestamp,
		_hasSysOZ, _hasAppOZ, _sysPlugin, _appPlugin,
		_corelib, _asynCorelib, _mainJS, _asynMainJS,
		_loadedGroup = {}, _modGroup = {};
	
	// get the current js-file
	(function(scripts){
		_curScript   =  scripts[scripts.length-1];
		_curUrl      =  _curScript.hasAttribute ?  _curScript.src : _curScript.getAttribute('src',4);
		_corelib     =  _curScript.getAttribute('corelib') || '';
		_asynCorelib =  _curScript.getAttribute('asyn-corelib') || '';
		_mainJS      =  _curScript.getAttribute('main') || '';
		_asynMainJS  =  _curScript.getAttribute('asyn-main') || '';
		_hasSysOZ    =  /\/sys\//i.test(_curUrl);
		_hasAppOZ    =  /^\.{2}\//.test(_mainJS||_asynMainJS);
		
		if(/\?[vt]=\d+/.test(_curUrl)){
			_timestamp = _curUrl.replace(/.*\?/,'?');
			_curUrl = _curUrl.replace(/\?.*/,'');
		}
	})(doc.getElementsByTagName('script'));
	
	// set the path
	iCat.modsConfig = {};
	iCat.sysRef = _hasSysOZ? _curUrl.replace(/\/sys\/.*/, '/sys') : _curUrl.replace(/\/\w*\.js/, '');
	iCat.appRef = _metaAppRef? _metaAppRef.content : iCat.sysRef;
	iCat.libRef = iCat.sysRef + '/lib';
	_sysPlugin  = _hasSysOZ? _curUrl.replace(/icat\..*/,'plugin/') : iCat.sysRef+'plugin/';
	_appPlugin  = iCat.appRef + (_hasAppOZ? '/assets':'') + '/plugin/';
	
	// support user's config
	iCat.config = function(cfg){
		iCat.modsConfig[cfg.modName] = [];
		
		iCat.foreach(cfg.paths, function(k, v){
			iCat.modsConfig[cfg.modName].push((cfg.baseUrl||'')+v);
		});
	}
	
	// type1( ): 指向sys根目录(sys级) ~/指向icat下的plugin目录
	// type2(/): 指向lib根目录(lib级) //库文件夹和库名相同
	// type3(./): 指向app根目录(app级) ../指向assets下的css或js目录 .~/指向assets下的plugin目录
	// type4(网址形式): 外链网址
	var _dealUrl = function(s){
		if(!s) return;
		
		//step1: 清理空格及?|#后缀参数
		var url = s.replace(/\s|[\?#].*/g,''), type = url.replace(/.*\./g,''),
			isCSS = type=='css';
		if(!url) return;
		
		//step2: 是否开启debug
		if(iCat.isDebug){
			url = /\.source/i.test(url)? url :
				(isCSS? url.replace(/\.css/g, '.source.css') : url.replace(/\.js/g, '.source.js'));
		}
		if(/^(http|ftp|https):\/\/.*/i.test(url)){//type4，直接输出
			return url;
		} else {
			if(/^\.{1,2}(~)?\//.test(url)){//type3 ##千万不能带g了
				if(/^\.\//.test(url))
					url = url.replace(/^\./, iCat.appRef);
				if(/^\.{2}\//.test(url))
					url = url.replace(/^\.{2}/, iCat.appRef+(isCSS? '/assets/css':'/assets/js'));
				if(/^\.~\//.test(url))
					url = url.replace(/^\.~\//, _appPlugin);
			} else if(/^\/{1,2}/.test(url)){//type2	
				if(/^\/{2}/.test(url)){
					var libFolder = url.replace(/^\/{2}|.source|.css|.js/ig, '');
					libFolder = /\d|\./.test(libFolder)? libFolder.replace(/\d(\/)?|\./g,'') : libFolder;
					url = url.replace(/^\//, iCat.libRef+'/'+libFolder);
				} else {
					url = url.replace(/^\//, iCat.libRef+'/');
				}
			} else {//type1
				if(/^~\//.test(url)){
					url = url.replace(/^~\//, _sysPlugin);
				} else {
					url = iCat.sysRef + '/' + url;
				}
			}
		}
		
		return url + (_timestamp || '');
	},
	
	_blockImport = function(loadFile){
		var url = loadFile, _url = url.replace(/[\?#].*/, '');
		if(_loadedGroup[_url]) return;
		
		var type = _url.replace(/.*\./g,''),
			isCSS = type=='css', tag = isCSS? 'link':'script',
			attr = isCSS? ' type="text/css" rel="stylesheet"' : ' type="text/javascript"',
			path = (isCSS? 'href':'src') + '="'+url+'"';
		doc.write('<'+tag+attr+path+(isCSS? '/>':'></'+tag+'>'));
		_loadedGroup[_url] = true;
	},
	
	// 执行callback函数
	_exec = function(f, cb, mod, ct){
		if(cb && iCat.isFunction(cb))
			cb(ct || iCat);
		
		if(mod){
			_modGroup[mod] = true;
			
			iCat.modsConfig[mod] = iCat.modsConfig[mod]? iCat.modsConfig[mod] : [];
			iCat.modsConfig[mod].push(f);
		}
	},
	
	_unblockImport = function(file, callback, mod, context){
		
		var	url = file,
		
			pNode = _curScript.parentNode || ohead,
			
			//去掉?|#后面的参数，保留纯净的文件
			_url = url.replace(/[\?#].*/, '');
		
		if(_loadedGroup[_url]){
			_exec(file, callback, mod, context);
			return;
		}
		
		var node, type = _url.replace(/.*\./g,'');
		if(type==='css'){
			node = doc.createElement('link');
			node.setAttribute('type', 'text/css');
			node.setAttribute('rel', 'stylesheet');
			node.setAttribute('href', url);
		} else if(type==='js'){
			node = doc.createElement('script');
			node.setAttribute('type', 'text/javascript');
			node.setAttribute('src', url);
			node.setAttribute('async', true);
		}
		
		if(!node) return;
			
		if(iCat.browser.msie){
			var timer = setInterval(function(){
				try{
					document.documentElement.doScroll('left');//在IE下用能否执行doScroll判断dom是否加载完毕
				}catch(e){
					return;
				}
				
				clearInterval(timer);
				if(type==='js' && node.readyState){
					node.onreadystatechange = function(){
						if(node.readyState == "loaded" || node.readyState == "complete") {
							node.onreadystatechange = null;
							_exec(file, callback, mod, context);
							_loadedGroup[_url] = true;
						}
					};
				}
				pNode.appendChild(node);
			},1);
		} else {
			if(type==='js'){
				node.onload = function(){
					_exec(file, callback, mod, context);
					_loadedGroup[_url] = true;
				};
			}
			pNode.appendChild(node);
		}
		
		/* css不需要监听加载完成*/
		if(type==='css'){
			_exec(file, callback, mod, context);
			_loadedGroup[_url] = true;
			pNode.appendChild(node);
		}
	};
	
	//对外接口
	iCat.mix(iCat, {
		
		/* 阻塞式加载文件 */
		inc: function(f){
			if(!f) return;
			f = iCat.isString(f)? [f] : f;
			
			iCat.foreach(f, function(i, v){
				if(!v) return;
				_blockImport(_dealUrl(v));
			});
			
		},
		
		/* 加载文件形式：
		 * - 单个文件，支持字符串或文件数组(length为1)
		 * - 多个文件，必须是文件数组
		 */
		incfile: function(f, cb, isDepend, pNode, context){//加载一个或多个文件
			if(!f) return;
			f = iCat.isString(f)? [f] : f;
			
			var max = f.length-1;
			if(isDepend){
				var i = 0,
				
					loadfile = function(){
						if(i<max){
							_unblockImport(_dealUrl(f[i]), function(){loadfile();}, undefined, context);
						} else {
							_unblockImport(_dealUrl(f[max]), cb, undefined, context);
						}
						i++;
					};
				loadfile();
			} else {
				iCat.foreach(f, function(i, v){
					i==max ?
						_unblockImport(_dealUrl(v), cb, undefined, context)
						:
						_unblockImport(_dealUrl(v), undefined, undefined, context);
				});
			}
		},
		
		/* 加载文件形式：
		 * - 单个文件，支持字符串或文件数组(length为1)
		 * - 多个文件，必须是文件数组
		 */
		require: function(m, f, cb, pNode, context){//加载有依赖的模块
			if(!f) return;
			f = iCat.isString(f)? [f] : f;
			
			if(_modGroup[m]){
				if(cb) cb(context);
			} else {
				var max = f.length-1, i = 0,
				
					loadfile = function(){
						if(i<max){
							_unblockImport(_dealUrl(f[i]), function(){loadfile();}, m, context);
						} else {
							_unblockImport(_dealUrl(f[max]), cb, m, context);
						}
						i++;
					};
				
				loadfile();
			}
		},
		
		//使用已加载后的模块
		use: function(m, cb, t, context){
			var i = 0, t = t || 500, timer;
			
			if(_modGroup[m]){
				if(cb) cb(context);
			} else if(iCat.modsConfig[m]){
				timer = setInterval(function(){
					i += 5;
					if(_modGroup[m]){
						clearInterval(timer);
						if(cb) cb(context);
					} else if(i>=t){
						clearInterval(timer);
						iCat.require(m, iCat.modsConfig[m], cb, context);
					}
				},5);
			}
			
		}
	});
	
	/* 加载js库和关键js */
	if(_corelib){
		_corelib = _corelib.split(',');
		iCat.inc(_corelib);
	}else if(_asynCorelib){
		_asynCorelib = _asynCorelib.split(',');
		iCat.incfile(_asynCorelib, undefined, true);
	}
	
	if(_mainJS)
		iCat.inc(_mainJS);
	else if(_asynMainJS)
		iCat.incfile(_asynMainJS);
})(ICAT);