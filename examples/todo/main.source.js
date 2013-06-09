(function(iCat){
	iCat.PathConfig();
	iCat.app('Todos', function(){
		return {
			version: '0.0.1'
		};
	});

	iCat.include('lib/jquery.js', function(){
		iCat.include('./todos.source.js');
	});
})(ICAT);