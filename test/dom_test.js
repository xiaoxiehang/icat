var iCat = ICAT;

module('ICAT.Dom');

test('Dom', function(){
	deepEqual(iCat.mix({},{aaa:2}), {aaa:2});
	deepEqual(iCat.mix({bbb:"test aaa"}, {aaa:2, bbb:"test bbb"}), {aaa:2, bbb:"test bbb"});
	deepEqual(iCat.mix({bbb:"test aaa"}, {aaa:2, bbb:"test bbb"}, undefined, false), {aaa:2, bbb:"test bbb"});
});

window.addEventListener('load', function(){
	var Dom = iCat.Dom;
	var el = Dom.one('#qunit-header');
	Dom.replaceClass(el, 'testCla', 'ccc');Dom.css(el, 'opacity')
	iCat.log(Dom.height(el))
	Dom.position(el, {left:19, top:28})
});
