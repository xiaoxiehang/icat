(function(iCat){
	iCat.app('Gallery', function(){
		iCat.PathConfig();
		return {
			version: '1.0'
		}
	});

	iCat.include('lib/jquery.js', function(){
		iCat.include('./mvc.source.js');
	});
})(ICAT);