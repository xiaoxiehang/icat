(function(iCat){

	var doc = document, tmplCache = {},

		tmpl = function(str, data){
			if(!str) return;

			var fn, fnBody= "var p = [];with(jsonData){" +
								"p.push('" + str.replace(/<%=(.*?)%>/g, "',$1,'").replace(/<%(.*?)%>/g, "');$1p.push('") + "');" +
							"}return p.join('');",
				regExp = /\W|for|if|else|switch|while|var|length|data|class|id|href|src|title|alt/g;
			
			if(!/\W/.test(str)){
				var tpl = tmplCache[str] = (tmplCache[str] || doc.getElementById(str).innerHTML).replace(/[\r\t\n]/g, ''),
					key = tpl.replace(regExp, '');
				fn = tmplCache[key] = tmplCache[key] || tmpl(tpl);
			} else {
				var tpl = str.replace(/[\r\t\n]/g, ''),
					key = tpl.replace(regExp, '');
				fn = tmplCache[key] = tmplCache[key] || new Function("jsonData", fnBody);
			}
			// iCat.log(tmplCache);	
			return data? fn(data) : fn;
		};

	/*
	 * view-module职责：
	 * - 初始化页面刚进入时的模板函数（及数据），渲染模块
	 * - 接收controler传递过来的数据，并更新渲染模块
	 * - 获取用户‘输入的数据’或‘模版数据’，传递给controler
	 * - 销毁自己
	 */
	function View(template, data){
		this.fnTemplate = tmpl(template);
		this.data = data || {};

		if(data){
			this.init();
		}
	}
	View.prototype = {
		init: function(){
			this._render(this.data);
		},

		_render: function(d, clear){
			var _self = this,
				parentNode = doc.querySelector(_self.data.parentSelector || d.parentSelector) || doc.body,
				itemNodes;

			var	html = _self.fnTemplate(d),
				o = doc.createElement('div');
			
			o.innerHTML = html;
			itemNodes = o.childNodes;

			if(clear){
				var oldNodes = parentNode.childNodes;
				while(oldNodes.length>0){
					parentNode.removeChild(oldNodes[0]);
				}
			}

			while(itemNodes.length>0){
					parentNode.appendChild(itemNodes[0]);
			}
			o = null;
		},

		addItem: function(d){
			var _self = this,
				dataItems = _self.data.data;

			if(iCat.isArray(d)){
				dataItems.concat(d);
				_self._render({data:d});
			} else if(iCat.isObject(d)) {
				if(d.sucess){
					dataItems.concat(d.data);
					_self._render(d);
				} else {
					dataItems.push(d);
					_self._render({data:[d]});
				}
			}
		},

		setData: function(d){
			var _self = this;
			_self.data = d;
			_self._render(d, true);
		},

		getData: function(p){
			return this[p];
		},

		destroy: function(){}
	};

	/*
	 * model-module职责：
	 * - 处理controler传递过来的数据，进行封装返回
	 * - 处理数据层面的业务逻辑，进行封装返回
	 * - 按需存取数据
	 * - 销毁自己
	 */
	function Model(argument){
		// body...
	}
	Model.prototype = {};

	/*
	 * controler-module职责：
	 * - 响应用户动作，调用对应的View和Model
	 * - 在View/Model之间传递数据
	 * - 如果是apk，添加或调用硬件接口
	 * - 销毁自己
	 */
	function Controler(argument){
		// body...
	}
	Controler.prototype = {};

	// 对外接口
	iCat.namespace('View', 'Model', 'Controler');
	iCat.View = View;
	iCat.Model = Model;
	iCat.Controler = Controler;
})(ICAT);