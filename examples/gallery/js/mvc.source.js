(function(iCat){
	function switchPage(p1, p2){
		if(p1){
			$(p2).hide();
			$(p1).fadeOut(500, function(){
				$(p2).slideDown(500);
			});
		}
	}

	//view
	var View = iCat.View.extend({
		config: {
			wrap: '',
			repeatOverwrite: true,
			ajaxUrl: 'data/album.php'
		}
	});

	//model
	var mainModel = iCat.Model.extend();

	//controller
	var mainCtrl = iCat.Controller.extend({
		config: {
			baseWrap: '#main .jstest',
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
			var c = this;
			c.init({
				view: new View('uv', {config: {tempId:'subindexTmpl'}}),
				model: mainModel,
				setAjax: [$.ajax, {
					success: function(data){
						var aId = c.hashArgus[1],
							albumData = {};
						data.forEach(function(v){
							if(v.pid==aId){
								albumData.data = v.subalbum;
							}
						});
						albumData.cid = aId;
						return albumData;
					}
				}],
				switchPage: switchPage
			});
		},

		detailInit: function(){
			var c = this;
			c.init({
				view: new View('dv', {config: {tempId:'itemTmpl'}}),
				model: mainModel,
				setAjax: [$.ajax, {
					success: function(data){
						var aId = c.hashArgus[1], dId = c.hashArgus[2] || 0,
							detaiData = {};
						data.forEach(function(v){
							if(v.pid==aId){
								v.subalbum.forEach(function(item){
									if(item.pid==dId){
										detaiData = item;
									}
								});
							}
						});
						return detaiData;
					}
				}],
				switchPage: switchPage
			});
		}
	});

	//start
	iCat.ctrlAble(new mainCtrl('mc'));
})(ICAT);