(function(iCat){
	iCat.app('App', function(){
		iCat.PathConfig();
		return {
			version: '1.0'
		}
	});

	iCat.include('lib/jquery/jquery.js', function(){
		iCat.include('./mvc.source.js');
	});
})(ICAT);