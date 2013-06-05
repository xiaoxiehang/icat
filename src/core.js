/*!
 * Copyright 2011~2013, ICAT JavaScript Library v1.1.5
 * https://github.com/valleykid/icat
 *
 * Copyright (c) 2013 valleykid
 * Licensed under the MIT license.
 *
 * @Author valleykiddy@gmail.com
 * @Time 2013-05-22 16:00:00
 */

/* core.js # */
(function(){
	// Create the root object, 'root' in the browser, or 'global' on the server.
	var root = this, doc = document, iCat = { version: '1.1.5' };
	
	// Export the ICAT object for **Node.js**
	if(typeof exports!=='undefined'){
		if(typeof module!=='undefined' && module.exports){
			exports = module.exports = iCat;
		}
		exports.ICAT = iCat;
	} else {
		root['ICAT'] = iCat;
	}

	// Compatible plugin for PC
	iCat.Shim = root['SHIM'] || {};

	// jQuery/Zepto coming in
	iCat.$ = root['jQuery'] || root['Zepto'];

	// expand the built-in Objects' functions.
	var ArrPro = Array.prototype;
	ArrPro.contains = function(item){ return this.indexOf(item)<0? false : true; };
	ArrPro.remove = function(item){
		var self = this;
		self.forEach(function(v, i){
			if(v===item){ self.splice(i, 1); }
		});
		return self;
	};
	ArrPro.unique = function(){
		var self = this, hash = {}, r = [];
		self.forEach(function(v){
			if(!hash[v]){
				r.push(v); hash[v] = true;
			}
		});
		return r;
	};

	// Kinds of judgments
	['String', 'Boolean', 'Function', 'Array', 'Object'].forEach(function(v){
		iCat['is'+v] = function(obj){
			if(v==='Array' && Array.isArray) return Array.isArray(obj);
			return Object.prototype.toString.call(obj) === '[object '+v+']';
		};
	});
	iCat.isNull = function(obj){ return obj===null; };
	iCat.isNumber = function(obj){ return !isNaN(Number(obj)); };
	iCat.isUndefined = function(obj){ return obj===undefined; };
	iCat.isjQueryObject = function(obj){ return !!iCat.$ && obj instanceof iCat.$; };
	iCat.isEmptyObject = function(obj){ for(var name in obj){return false;} return true; };

	// Kinds of modes
	(function(){
		var href = location.href,
			keyRegs = {
				'DebugMode': /debug/i,
				'DemoMode': /localhost|demo\.|\/{2}\d+(\.\d+){3}|file\:/i,
				'IPMode': /\/{2}\d+(\.\d+){3}/
			};
		for(var k in keyRegs){ iCat[k] = keyRegs[k].test(href); }
	})();

	// Copies all the properties of s to r.
	// l(ist):黑/白名单, ov(erwrite):覆盖
	iCat.mix = function(r, s, l, ov){
		if(!s || !r) return r;
		if(iCat.isUndefined(ov)) ov = true;
		var i, p, len, white = true;

		if(l && !Array.isArray(l)){
			l = l.replace(/\s+/g, '').split(',');
			white = false;
		}

		if(l && (len=l.length)){
			if(white){
				for(i=0; i<len; i++){
					p = l[i];
					if(p in s){
						if(ov || !(p in r)){
							r[p] = s[p];
						}
					}
				}
			} else {
				for(p in s){
					if(l.indexOf(p)<0 && (ov || !(p in r))){
						r[p] = s[p];
					}
				}
			}
		} else {
			for(p in s) {
				if(ov || !(p in r)){
					r[p] = s[p];
				}
			}
		}
		return r;
	};

	/*-------------------------------------------*
	 * The core of ICAT's framework
	 *-------------------------------------------*/
	iCat.mix(iCat, {
		toArray: iCat.Shim.toArray || function(o){
			return Array.prototype.slice.call(o);
		},

		contains: function(o, p){
			if(iCat.isArray(o)){
				return o.contains(p);
			}
			else if(iCat.isObject(o)){
				return p in o;
			}
			return false;
		},
		
		// Handles objects with the built-in 'foreach', arrays, and raw objects.
		foreach: function(o, cb, args){
			var name, i = 0, length = o.length,
				isObj = iCat.isUndefined(length) || iCat.isString(o) || iCat.isFunction(o);
			
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
				len = argus.length, cfg, Cla,
				claName, context;
			if(!len) return;

			cfg = argus[1] || argus[0];
			if(!iCat.isObject(cfg)) return;
			Cla = function(){ cfg.Create.apply(this, arguments); };

			if(len>1){
				claName = argus[0];
				context = argus[2] || root;
				if(!iCat.isString(claName)) return;	
			}
			iCat.mix(Cla.prototype, cfg, 'Create');
			if(Cla.prototype.constructor==Object.prototype.constructor){
				Cla.prototype.constructor = Cla;
			}
			return len===1? Cla : (context[claName] = Cla);
		},
		
		widget: function(name, cfg){
			this.Class(name, cfg, iCat.widget);
		},

		util: function(name, fn){
			if(iCat.isString(name)){
				iCat.util[name] = fn;
			} else {
				iCat.mix(iCat.util, name);
			}
		},

		rentAjax: function(fnAjax, cfg){
			if(!fnAjax || !iCat.isFunction(fnAjax)) return function(){};
			iCat.util.ajax = function(cfgAjax){
				cfg = cfg || {};
				var _cfg = iCat.mix({}, cfgAjax, 'success, error');
					_cfg = iCat.mix(_cfg, cfg, 'success, error', false);
				_cfg.prevSuccess = cfg.success;
				_cfg.nextSuccess = cfgAjax.success;
				_cfg.prevError = cfg.error;
				_cfg.nextError = cfgAjax.error;
				_cfg.success = function(data){
					if(!data) return;
					data = iCat.isObject(data) || iCat.isArray(data)? data : JSON.parse(data);
					var ret = _cfg.prevSuccess? _cfg.prevSuccess(data) : '';
					if(_cfg.nextSuccess) _cfg.nextSuccess(ret || data);
				};
				_cfg.error = function(){
					var ret = _cfg.prevError? _cfg.prevError() : '';
					if(_cfg.nextError) _cfg.nextError(ret);
				};
				fnAjax(_cfg);
			};
		},

		// iCat或app下的namespace，相当于扩展出的对象
		namespace: function(){
			var a = arguments, l = a.length, o = null, i, j, p;

			for(i=0; i<l; ++i){
				p = ('' + a[i]).split('.');
				o = this;
				for(j = (root[p[0]]===o)? 1:0; j<p.length; ++j){
					o = o[p[j]] = o[p[j]] || {};
				}
			}
			return o;
		},
		
		// create a app for some project
		app: function(name, sx){
			var isStr = iCat.isString(name),
				O = isStr? root[name] || {} : name;

			iCat.mix(O, iCat, ['namespace'], true);
			iCat.mix(O, iCat.isFunction(sx) ? sx() : sx);
			isStr && (iCat.app[name] = root[name] = O);

			return O;
		},

		log: function(msg){
			if(doc.all){
				root.console!==undefined && console.log? console.log(msg) : alert(msg);
			} else {
				try{ __$abc_ICAT(); }
				catch(e){
					var fileline = e.stack.replace(/\n\s+at\s+<.*>/g, '').split('\n')[2];// fixed bug:Direction on an input element that cannot have a selection.
					fileline = fileline.replace(/.*[\(\s]|\).*/g, '').replace(/(.*):(\d+):\d+/g, '$1  line $2:\n');
					console.log(fileline, msg);
				}
			}
		}
	});
}).call(this);