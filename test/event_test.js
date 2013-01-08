var iCat = ICAT;

module('ICAT.Observer');

test('Observer', function(){
	deepEqual(iCat.mix({},{aaa:2}), {aaa:2});
	deepEqual(iCat.mix({bbb:"test aaa"}, {aaa:2, bbb:"test bbb"}), {aaa:2, bbb:"test bbb"});
	deepEqual(iCat.mix({bbb:"test aaa"}, {aaa:2, bbb:"test bbb"}, undefined, false), {aaa:2, bbb:"test bbb"});
});

var home = iCat.observer('home');
iCat.log(iCat.Obs);

home.subscribe([
	{el:'.pass span.module-name', eType:'longTap', callback: function(){iCat.log(this.nodeName);}},
	{el:'.pass', eType:'click', callback: function(){iCat.log(this.className);}},
	{el:'a', eType:'click', callback: function(event){event.preventDefault();}}//evt.preventDefault(); this.setAttribute('href','#');
]);