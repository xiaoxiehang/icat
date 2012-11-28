(function(){
	// Create the root object, 'window' in the browser, or 'global' on the server.
	var root = this, iCat = {};
	
	// Export the ICAT object for **Node.js**
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
		  exports = module.exports = iCat;
		}
		exports.ICAT = iCat;
	} else {
		root['ICAT'] = iCat;
	}
	
	var isDebug = /debug/i.test(root.location.href),
		ObjProto = Object.prototype,
		toString = ObjProto.toString,
		nativeIsArray = Array.isArray;
	
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
			var argus = arguments, len = argus.length;
			
			if(len==0) return null;
			
			else if(len==1){
				var cfg = argus[0];
				if(!iCat.isObject(cfg))
					return null;
				else {
					var Cla = cfg.Create,
						ClaProto = Cla.prototype;
					
					iCat.foreach(cfg, function(k, v){
						if(k!='Create')
							ClaProto[k] = v;
					});
					
					return Cla;
				}
			}
			
			else if(len>=2){
				var claName = argus[0], cfg = argus[1];
				if(!iCat.isString(claName) || !iCat.isObject(cfg)) return null;
				else {
					root[claName] = cfg.Create;
					var ClaProto = root[claName].prototype;
					iCat.foreach(cfg, function(k, v){
						if(k!='Create')
							ClaProto[k] = v;
					});
				}
			}
		}
	});
}).call(this);