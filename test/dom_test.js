var iCat = ICAT;

module('ICAT.Dom');

test('Dom', function(){
	deepEqual(iCat.mix({},{aaa:2}), {aaa:2});
	deepEqual(iCat.mix({bbb:"test aaa"}, {aaa:2, bbb:"test bbb"}), {aaa:2, bbb:"test bbb"});
	deepEqual(iCat.mix({bbb:"test aaa"}, {aaa:2, bbb:"test bbb"}, undefined, false), {aaa:2, bbb:"test bbb"});
});

window.addEventListener('load', function(){
	var Dom = iCat.Dom;
	/*var el = Dom.one('#qunit-header');
	Dom.replaceClass(el, 'testCla', 'ccc');*/
	//iCat.log(Dom.all('i'));
	var $ = iCat.$,
		el = $('div');
	//Dom.addClass(el, 'abc');
	el.css({color:'red'}).addClass('ab');
	$.extend({
		testfn: function(){console.log(this)}
	});
	$.fn.extend({
		testfn: function(){
			console.log(el.get(1))
			el.prev().addClass('abc').next().next().addClass('rrr');
		}//console.log()[0].css('color')
	})

	//$.testfn();
	el.testfn();
	//iCat.log(el.addClass);
	//Dom.position(el, {left:'19px', top:'28px'});
});