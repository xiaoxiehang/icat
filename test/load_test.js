var iCat = ICAT;

module('ICAT-load');

test('', function(){
	equal(![].length, true);
});

/*iCat.require('testMod', ['aaa.js', 'bbb.js'], function(){
	alert(AAAname+'load complated...');
});*/

//iCat.log(iCat);
iCat.config({
	modName: 'aaa',
	paths: {aaa:'aaa.js', bbb:'bbb.js'}
});
iCat.use('aaa');
//iCat.log(iCat.modsConfig);