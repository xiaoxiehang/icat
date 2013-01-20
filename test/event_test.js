var iCat = ICAT;

module('ICAT.Observer');

test('Observer', function(){
	deepEqual(iCat.mix({},{aaa:2}), {aaa:2});
	deepEqual(iCat.mix({bbb:"test aaa"}, {aaa:2, bbb:"test bbb"}), {aaa:2, bbb:"test bbb"});
	deepEqual(iCat.mix({bbb:"test aaa"}, {aaa:2, bbb:"test bbb"}, undefined, false), {aaa:2, bbb:"test bbb"});
});

var Event = iCat.Event;
Event.on('.pass span.module-name', 'longTap', function(){alert(this.nodeName)});

var home = iCat.obsCreate('home');
home.subscribe([//iCat.obsCreate['home']
		{el:'#qunit-tests > .pass', eType:'click', callback:function(){alert(this.nodeName);}, stopDefault:false, stopBubble:true},
		{el:'a', eType:'tap', callback:function(){alert(this.nodeName);}, stopDefault:true, stopBubble:true},
		{el:'h1', eType:'tap', callback:function(){alert(this.innerText);}, stopDefault:true, stopBubble:true}
	])
	.on('.test-message', 'singleTap', function(){alert(this.innerText); this.className='aaa';})
	.setCurrent();//iCat.__OBSERVER_PAGEID = 'home';

//iCat.obsDestroy('home');

/*home = iCat.obsCreate('home');
home.on('.pass', 'click', function(){alert(this.className);})
	.setCurrent()
	.off('.pass', 'click');*/

//Event.setCurrent();//iCat.__OBSERVER_PAGEID = undefined | '' | '__PAGE_EVENT';
//iCat.log(iCat);