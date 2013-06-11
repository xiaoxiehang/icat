(function(iCat){
	var Controller = iCat.Controller.extend(
	{	
		/*
		 * type1: 无baseBed模式
		 * type2: 全局baseBed模式
		 * type3：私有baseBed模式
		 * ps: 'base切换层'无论在页面上存在与否，都要指定，否则会生成一个
		 */
		config:{ baseBed:'.single-wrap' },
		routes: {
			' ': 'homeInit',
			'home': 'homeInit',
			'cod': 'codInit'
		},

		homeInit: function(){
			var c = this,
				nav = Gou.view.setting.header.nav;
			nav.forEach(function(v, i){
				i==0? v.selected = true : delete v.selected;
			});

			c.init({
				view: Gou.view, model: Gou.model,
				scrollBox:'#iScroll',
				adjustLayout: 'header#iHeader.hd + div#iScroll > div.penel',
				modules: 'header, recommend, points, notice, mall, theme, tuan, helper, footer'
			});
		},

		codInit: function(){
			var c = this,
				nav = Gou.view.setting.header.nav;
			nav.forEach(function(v, i){
				i==1? v.selected = true : delete v.selected;
			});

			c.init({
				view: Gou.view, model: Gou.model,
				adjustLayout: 'header#iHeader.hd + div#iScroll > div.penel',
				modules: 'header, list'
			});
			
			var detailView = iCat.View.extend({
				config: {
					tempId: 'codDetail',
					isSave: true,
					blankPic: 'img',
					delayTime: 100,
					events: [{
						selector:'.J_itemWrap figure', type:'singleTap', callback: 'tapdetail'
					},{
						selector:'.J_itemWrap figure', type:'hover', preventDefault:true,
						callback:function(v, m, cfg, evt, status){
							this.style.background = status==0? '#f90' : '';
						}
					}]
				},
				
				tapdetail: function(v, m){
					var _self = $(this),
						scrollPanel = $('#iScroll', iCat.elCurWrap),
						_id = _self.attr('data-id'),
						_cur = _self.next('.J_itemDetail'),
						_rest = scrollPanel.find('.J_itemDetail').not(_cur);

					if(_cur.html()){
						_cur.toggleClass('hidden');
						if(!_cur.hasClass('hidden')){
							_rest.addClass('hidden');
							scrollPanel.animate({
								scrollTop: scrollPanel.scrollTop() + _self.position().top
							}, 200);
						}
						return;
					}

					_rest.addClass('hidden');
					_cur.removeClass('hidden');

					var index = $('.J_itemWrap figure').index(this);
					iCat.util.cookie('itemIndex', index, 3600);
					if(!v.model)
						v.setModel(iCat.Model['mainModel']);
					v.setConfig({
						wrap: '.J_itemDetail:'+index,
						ajaxUrl: '/api/cod/guide?cid='+_id,
						key: _id
					});

					if(scrollPanel.hasClass('not-first')){
						scrollPanel.animate({
							scrollTop: scrollPanel.scrollTop() + _self.position().top
						}, 200);
					} else {
						scrollPanel.scrollTop( scrollPanel.scrollTop() + _self.position().top );
						scrollPanel.addClass('not-first');
					}
				}
			});
			c.vmAdd({view:new detailView('detail')});
		}
	});
	
	new Controller('mainPage');
})(ICAT);