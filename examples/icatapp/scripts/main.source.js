(function(iCat){
	iCat.app('App', function(){
		iCat.PathConfig();
		return {
			version: '1.0',
			init: function(){
				iCat.include(['lib/jquery.js', './mvc.source.js'], null, true);
			}
		}
	});

	App.init();
})(ICAT);