var iCat = ICAT;

iCat.PathConfig();
/*iCat.ModsConfig({
	modName: 'aaa',
	paths: ['./src/aaa.js', './src/bbb.js']
});*/

module('ICAT-loader');

test('', function(){
	equal(![].length, true);
});

iCat.inc('./src/aaa.js');

iCat.include(['./src/aaa.js', './src/bbb.js'], function(){
	alert(AAAname+'load complated 1...');
});

iCat.require('testMod', ['./src/aaa.js', './src/bbb.js'], function(){
	alert(AAAname+'load complated 2...');
});

iCat.use('testMod', function(){
	alert(AAAname+'load complated 3...');
});