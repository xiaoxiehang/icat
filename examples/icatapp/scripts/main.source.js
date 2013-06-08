(function(iCat){
	iCat.app('App', function(){
		iCat.PathConfig();
		return {
			version: '1.0'
		}
	});

	iCat.include('./mvc.source.js');
})(ICAT);