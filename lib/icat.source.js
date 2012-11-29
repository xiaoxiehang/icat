/*!
 * Copyright 2011~2012, ICAT JavaScript Library v1.1.3
 * https://github.com/valleykid/icat
 *
 * Copyright (c) 2012 valleykid
 * Licensed under the MIT license.
 *
 * @Author valleykiddy@gmail.com
 * @Time 2012-11-29 19:52:00
 */

/** core.js */
(function(){
	// Create the root object, 'window' in the browser, or 'global' on the server.
	var root = this, iCat = {};
	
	// Export the ICAT object for **Node.js**
	if(typeof exports!=='undefined'){
		if(typeof module!=='undefined' && module.exports){
			exports = module.exports = iCat;
		}
		exports.ICAT = iCat;
	} else {
		root['ICAT'] = iCat;
	}
	
	var _ua = navigator.userAgent, ObjProto = Object.prototype,
		toString = ObjProto.toString,
		nativeIsArray = Array.isArray,
        __APP_MEMBERS = ['namespace'];// iCat.app() with these members.
	
	// Copies all the properties of s to r.
	// w(hite)l(ist):白名单, ov(erwrite):覆盖
	iCat.mix = function(r, s, wl, ov){
		if (!s || !r) return r;
		if (!ov) ov = true;
		var i, p, len;

		if (wl && (len = wl.length)) {
			for (i = 0; i < len; i++) {
				p = wl[i];
				if (p in s) {
					if (ov || !(p in r)) {
						r[p] = s[p];
					}
				}
			}
		} else {
			for (p in s) {
				if (ov || !(p in r)) {
					r[p] = s[p];
				}
			}
		}
		return r;
	};
	
	iCat.mix(iCat, {
		// Current version.
		version: '1.1.3',
		
		// debug or not
		isDebug: /debug/i.test(root.location.href),
		
		// kinds of browsers
		browser: {
			safari: /webkit/i.test(_ua),
			opera: /opera/i.test(_ua),
			msie: /msie/i.test(_ua) && !/opera/i.test(_ua),
			mozilla: /mozilla/i.test(_ua) && !/(compatible|webkit)/i.test(_ua)
		},
		
		// common browser
		/*isIE: (function(){return iCat.browser.msie;})(),
		ieVersion: iCat.browser.msie? _ua.match(/MSIE(\s)?\d+/i)[0].replace(/MSIE(\s)?/i,'') : -1,*/
		
		// Commonly used judgment
		isFunction: function(obj){
			return toString.call(obj) == '[object Function]';
		},
		
		isString: function(obj){
			return toString.call(obj) == '[object String]';
		},
		
		isArray: nativeIsArray ||
			function(obj){
				return toString.call(obj) == '[object Array]';
			},
		
		isObject: function(obj){
			return toString.call(obj) == '[object Object]';//obj === Object(obj);
		},
		
		isNull: function(obj){
			return obj === null;
		},
		
		// Handles objects with the built-in 'foreach', arrays, and raw objects.
		foreach: function(o, cb, args){
			var name, i = 0, length = o.length,
				isObj = length===undefined || iCat.isString(o);
			
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
				len = argus.length;
			
			if(len==0) return null;
			
			else if(len==1){
				var cfg = argus[0];
				if(!iCat.isObject(cfg))
					return null;
				else {
					function Cla(){cfg.Create.apply(this, arguments);}
					iCat.foreach(cfg, function(k, v){
						if(k!='Create')
							Cla.prototype[k] = v;
					});
					
					return Cla;
				}
			}
			
			else if(len>=2){
				var claName = argus[0],
					cfg = argus[1],
					context = argus[2] || root;
				
				if(!iCat.isString(claName) || !iCat.isObject(cfg))
					return null;
				else {
					function Cla(){cfg.Create.apply(this, arguments);}
					iCat.foreach(cfg, function(k, v){
						if(k!='Create')
							Cla.prototype[k] = v;
					});
					
					context[claName] = Cla;
				}
			}
		},
		
		widget: function(name, cfg){
			this.Class(name, cfg, iCat);
		},
		
		// iCat或app下的namespace，相当于扩展出的对象
		namespace: function() {
            var a = arguments, l = a.length, o = null, i, j, p;

            for (i = 0; i < l; ++i) {
                p = ('' + a[i]).split('.');
                o = this;
                for (j = (root[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                    o = o[p[j]] = o[p[j]] || {};
                }
            }
            return o;
        },
		
		// create a app for some project
		app: function(name, sx) {
            var self = this,
				isStr = self.isString(name),
                O = isStr ? root[name] || {} : name;

            self.mix(O, self, __APP_MEMBERS, true);
			self.mix(O, self.isFunction(sx) ? sx() : sx);
			isStr && (root[name] = O);

            return O;
        },
		
		// print some msg for unit testing
		log: function(msg) {
            root.console!==undefined && console.log ? console.log(msg) : alert(msg);
        }
	});
}).call(this);

/** load.js */
(function(iCat){
	var doc = document,
		ohead = doc.head || doc.getElementsByTagName('head')[0],
		_metaAppRef = doc.getElementsByName('appRef')[0],
		_curScript, _curUrl, _timestamp,
		_hasSysOZ, _hasAppOZ, _sysPlugin, _appPlugin,
		_corecss, _corelib, _asynCorelib, _mainJS, _asynMainJS,
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
	_corecss    = _metaAppRef? _metaAppRef.getAttribute('corecss') : '';
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
			if(/^\.(\.|~)?\//g.test(url)){//type3
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
			setTimeout(function(){
				_exec(file, callback, mod, context);
			},5);
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
							_unblockImport(_dealUrl(f[i]), function(){/**/loadfile();}, undefined, context);
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
	if(_corecss){
		iCat.inc(_corecss);
	}
	
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

/**
 *
 * NOTES:
 *
 * 2012-11-29 19:52:00
 * - 重构了代码，提升了性能，使其无多余代码，仅仅裸露ICAT
 * - 增加了Class、iCat.widget，用于扩展UI组件
 *
 * 2012-10-31 09:14:30
 * - 增加插入script节点的父层
 * - 增加mainjs、corelib异步加载的支持
 *
 * 2012-09-23 13:45:00
 * - 抛开underscore.js、json2.js，感觉框架太臃肿了
 * - 新增iCat函数，使其成为Class的制造体
 *
 * 2012-09-23 10:00:00
 * 为了更和谐地利用backbone，icat融合了underscore.js、json2.js
 * - 避免冲突，改include方法名为incfile
 * - corelib支持多个文件设置
 *
 */