(function(iCat){
	iCat.app('Gou', function(){
		iCat.PathConfig();
		return {
			version: '0.9.6'
		};
	});

	iCat.mix(Gou, {
		init: function(){
			var Event = iCat.Event,
				self = this, token = window['token'] || '';
			
			//设置ajax接口
			iCat.rentAjax($.ajax, {
				data: {token:token},
				success: function(){ iCat.log('我执行了...'); },
				error: function(){}
			});

			//事件绑定
			Event.on('.J_unfoldWrap h2', '@singleTap', self.unfold);
			Event.on('.J_unfoldWrap .loadMore', '@singleTap', self.loadmore);
		},

		unfold: function(){
			var _self = $(this), ajaxUrl = _self.attr('data-ajaxUrl'),
				_desc = _self.next('.desc'), _itemWrap = _desc.find('ul');

			if(ajaxUrl && !_self.hasClass('done')){
				iCat.util.ajax({
					url: iCat.util.fullUrl(ajaxUrl, true),
					success: function(data){
						if(data.success){
							iCat.util.render({
								tempId: $('.J_unfoldWrap script'),
								wrap: _itemWrap
							}, data);
							if(data.data.hasnext==true && !_desc.find('.loadMore')[0])
								_itemWrap.after('<div class="btn loadMore"><span class="rount-rect gray">加载更多...</span></div>');
							_self.attr('data-hasnext', data.data.hasnext)
								 .attr('data-curpage', data.data.curpage);
						}
					}
				});
				_self.addClass('done');
			}

			_self.hasClass('up')?
				_self.removeClass('up').addClass('down') :
				_self.removeClass('down').addClass('up');
			_desc.toggleClass('hidden');
		},

		loadmore: function(){
			var _self = $(this), _itemWrap = _self.prev('ul'),
				_desc = _self.parent('.desc'), _titleWrap = _desc.prev('h2'),
				ajaxUrl = _titleWrap.attr('data-ajaxUrl');
			
			if(_titleWrap.attr('data-hasnext')=='true'){
				var curPage = _titleWrap.attr('data-curpage'),
					_page = curPage? '&page=' + (parseInt(curPage)+1) : '';
				iCat.util.ajax({
					url: iCat.util.fullUrl(ajaxUrl, true),
					success: function(data){
						if(data.success){
							iCat.util.render({
								tempId: $('.J_unfoldWrap script'),
								wrap: _itemWrap
							}, data);
							if(data.data.hasnext==false)
								_self.remove();
							_titleWrap.attr('data-hasnext', data.data.hasnext)
									  .attr('data-curpage', data.data.curpage);
						}
					}
				});
			}
		}
	});

	Gou.namespace('view', 'model', 'controller');

	iCat.include([/*'lib/phonecore.css!', */'lib/jquery.js'], function(){
		Gou.init();//common
		iCat.require({modName:'appMVC'});//mvc
	});
})(ICAT);