(function(iCat){
	iCat.app('Gou', function(){
		iCat.PathConfig();
		return {
			version: '0.9.6'
		};
	});

	Gou.namespace('view', 'model', 'controller');

	iCat.include('lib/jquery.js', function(){
		iCat.include(['./mvc/view2.js', './mvc/model.js', './mvc/controller2.js']);//mvc
	});
})(ICAT);