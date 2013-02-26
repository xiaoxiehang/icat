(function(iCat){

	var doc = document, tmplCache = {},

		tmpl = function(str, data){
			if(!str) return;

			var fn, fnBody= "var p = [];with(jsonData){" +
								"p.push('" + str.replace(/[\r\t\n]/g, "").replace(/<%=(.*?)%>/g, "',$1,'").replace(/<%(.*?)%>/g, "');$1p.push('") + "');" +
							"}return p.join('');";
			
			if(!/\W/.test(str)){
				str = doc.getElementById(str).innerHTML;
				fn = tmplCache[str] = tmplCache[str] || tmpl(str);
			}else{
				fn = tmplCache[str] = tmplCache[str] || new Function("jsonData", fnBody);
			}
					
			return data? fn(data) : fn;
		};

	// view
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

	var temp = '<%for(var i=0; i<data.length; i++){%>\
				<li class="<%=data[i].jshook%>">\
					<a href="<%=data[i].link%>">\
						<span class="icon"><img src="<%=data[i].img%>"></span>\
						<span class="desc">\
							<em><%=data[i].title%></em>\
							<b></b>\
							<b></b>\
						</span>\
					</a>\
				</li>\
				<%}%>',
		
		data = {
			sucess:true, msg:'',
			parentSelector:'.J_itembox',
			data:[
				{link:'ccc', img:'http://dev.assets.gionee.com/apps/game/apk/pic/pic_icon.jpg', title:'ccc', jshook:'todo'},
				{link:'ddd', img:'http://dev.assets.gionee.com/apps/game/apk/pic/pic_icon.jpg', title:'ddd'},
				{title:'abc'}
			]
		};

	//console.log(tmpl(temp,data))
	window.onload = function(){//
		var pageView = new View(temp, data);
		var pagex = new View('J_mvcView', data)
		iCat.log(tmplCache)
		//pageView.setData(data);
	};

	iCat.namespace('View', 'Model', 'Controler');
})(ICAT);