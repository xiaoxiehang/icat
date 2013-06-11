(function(iCat){
	//view
	var menuView = iCat.View.extend({
		config: {
			tempId: 'item-tmpl',
			wrap: '#backbone-menu',
			ajaxUrl: 'Backboneapp_data.php',
			globalKey:'pageData',
			dataSave: true
		}
	});

	var mainView = iCat.View.extend({
		config: {
			tempId: 'content-tmpl',
			wrap: '#backbone-content',
			globalKey:'pageData',
			callback: function(p, cfg, data){
				$('.active').removeClass('active');
				$('#item' + data.position).addClass('active');
			}
		}
	});

	//model
	var pageModel = iCat.Model.extend({
		DataOutput: function(d, id){
			if(!id) return d;

			var _data = {};
			d.forEach(function(v){
				if(v.position==id){
					_data = v;
				}
			});
			return _data;
		}
	});

	//ctrl
	var pageCtrl = iCat.Controller.extend({
		config: {baseBed: '#content'},
		routes: {
			' ': 'defaultRoute',
			'info/:id': 'infoShow'
		},

		defaultRoute: function(){
			this.infoShow(1);
		},

		infoShow: function(id){
			var c = this,
				itemId = id || c.hashArgus[1];

			c.init({
				vmGroups: [
					{view: new menuView('menu'), model: pageModel},
					{view: new mainView('main', {config:{globalArgus:[itemId]}}), model: pageModel}
				]
			});
		}
	});

	new pageCtrl('pc');
})(ICAT);