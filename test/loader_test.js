var iCat = ICAT;
iCat.PathConfig();

module('ICAT-loader');

test('', function(){
	equal(![].length, true);
});

iCat.inc('./src/aaa.js');

/*iCat.require('testMod', ['aaa.js', 'bbb.js'], function(){
	alert(AAAname+'load complated...');
});
iCat.log(iCat);*/

iCat.ModsConfig({
	modName: 'aaa',
	paths: ['./src/aaa.js', './src/bbb.js']
});
iCat.use('aaa', function(){
	alert(AAAname+'load complated...');
});

/*iCat.incfile(['aaa.js', 'bbb.js'], function(){
	alert(AAAname+'load complated...');
});*/