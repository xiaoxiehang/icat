(function(iCat){
	//view
	var menuView = iCat.View.extend({
		config: {
			tempId: 'item-tmpl',
			wrap: '#backbone-menu',
			ajaxUrl: 'Backboneapp_data.php',
			globalKey:'pageData',
			repeatOverwrite: true,
			callback: function(p, cfg){
				$('.active').removeClass('active');
				$('#item' + cfg.curId).addClass('active');
			}
		}
	});

	var mainView = iCat.View.extend({
		config: {
			tempId: 'content-tmpl',
			wrap: '#backbone-content',
			repeatOverwrite: true,
			globalKey:'pageData'
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
					{view: new menuView('menu', {config:{curId:itemId}}), model: pageModel},
					{view: new mainView('main', {config:{globalArgus:[itemId]}}), model: pageModel}
				],
				baseBed: '#content'
			});
		}
	});

	new pageCtrl('pc');
})(ICAT);