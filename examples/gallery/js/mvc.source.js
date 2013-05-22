(function(iCat){
	function switchPage(p1, p2){
		p1 && $(p1).hide();
		$(p2).show();
		/*if(p1){
			$(p2).hide();
			$(p1).fadeOut(500, function(){
				$(p2).slideDown(500);
			});
		}*/
	}

	//view
	var View = iCat.View.extend({
		config: {
			wrap: '',
			repeatOverwrite: true,
			ajaxUrl:'data/album.php',
			globalKey:'pageData'
		}
	});

	//model
	var mainModel = iCat.Model.extend({
		DataOutput: function(d, a, b){
			if(!a) return d;

			var _data = {};
			if(!b){
				d.forEach(function(v){
					if(v.pid==a){
						_data.data = v.subalbum;
					}
				});
				_data.cid = a;
			} else {
				d.forEach(function(v){
					if(v.pid==a){
						v.subalbum.forEach(function(item){
							if(item.pid==b){
								_data = item;
							}
						});
					}
				});
			}
			return _data;
		}
	});

	//controller
	var mainCtrl = iCat.Controller.extend({
		config: {
			baseBed: '#main .jstest',
			adjustLayout: {'#main':'div.jstest*3'}
		},

		routes: {
			'': 'homeInit',
			'subalbum/c:num': 'albumInit',
			'subalbum/c:num/:num': 'detailInit'
		},

		homeInit: function(){
			var c = this;
			c.init({
				view: new View('mv', {config: {tempId:'indexTmpl'}}),
				model: mainModel,
				switchPage: switchPage
			});
		},

		albumInit: function(){
			var c = this,
				aId = c.hashArgus[1];
			c.init({
				view: new View('uv', {config: {tempId:'subindexTmpl', globalArgus:[aId]}}),
				model: mainModel,
				switchPage: switchPage
			});
		},

		detailInit: function(){
			var c = this,
				aId = c.hashArgus[1], dId = c.hashArgus[2] || 0;
			c.init({
				view: new View('dv', {config: {tempId:'itemTmpl', globalArgus:[aId, dId]}}),
				model: mainModel,
				switchPage: switchPage
			});
		}
	});

	//start
	iCat.ctrlAble(new mainCtrl('mc'));
})(ICAT);