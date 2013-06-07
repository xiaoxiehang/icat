var iCat = ICAT;

module('ICAT关键属性和方法');

test('数组常用方法扩展', function(){
	var arr = [1,2,6,6,5,6];
	deepEqual(arr.contains(1), true, '是否包含');
	deepEqual(arr.remove(1), [2,6,6,5,6], '删除元素');
	//deepEqual(arr.contains(1), true);
	deepEqual(arr.unique(), [2,6,5], '去重');
});

test('mix', function(){
	deepEqual(
		iCat.mix({},{aaa:2, bbb:'test bbb', ccc:function(){alert('ccc');}}, 'bbb, ccc'),
		{aaa:2}, '黑名单'
	);
	deepEqual(
		iCat.mix({},{aaa:2, bbb:'test bbb', ccc:'test ccc'}, ['bbb', 'ccc']),
		{bbb:'test bbb', ccc:'test ccc'}, '白名单'
	);
	deepEqual(
		iCat.mix(
			{bbb:'test aaa'}, {aaa:2, bbb:'test bbb'}
		),
		{aaa:2, bbb:'test bbb'}, '默认覆盖'
	);
	deepEqual(
		iCat.mix({bbb:'test aaa'}, {aaa:2, bbb:'test bbb'}, undefined, false),
		{aaa:2, bbb:'test aaa'}, '不覆盖'
	);
});

test('Modes', function(){
	equal(iCat.DebugMode, false, 'It\'s not debug mode');
	equal(iCat.DemoMode, false, 'It\'s not demo mode');
	equal(iCat.IPMode, false, 'It\'s not ip mode');
});

test('is函数', function(){
	var arrKey = ['String', 'Boolean', 'Function', 'Array', 'Object'],
		arrExamp = [iCat.version, iCat.DebugMode, iCat.mix, arrKey, iCat];
	iCat.foreach(arrKey, function(i, v){
		equal(iCat['is'+v](arrExamp[i]), true, v);
	});

	equal(iCat.isNumber('000'), true, 'number1');
	//equal(iCat.isNumber('00a'), true, 'number2');
	equal(iCat.isNumber(01), true, 'number3');
	equal(iCat.isjQueryObject(document.body), false, 'jQuery object test1.');
	equal(iCat.isjQueryObject(iCat.$('body')), true, 'jQuery object test2.');
	equal(iCat.isEmptyObject(iCat.Shim), true, 'Empty object.');
});

test('Class/widget/util', function(){
	iCat.Class('Person', {
		Create: function(name, age){
			this.name = name;
			this.age = age;
		},
		
		getName: function(){
			iCat.log('执行getName方法获取的结果：' + this.name);
		}
	});
	
	var Jim = new Person('Jim', 23);
	equal(iCat.isObject(Jim), true);
	//deepEqual(Jim, {name:'Jim', age:23});
	iCat.log(Jim); Jim.getName();
	
	iCat.widget('Teacher', {
		Create: function(name, age, subject){
			Person.call(this, name, age);
			//arguments.callee.prototype = Person.prototype;
			
			this.subject = subject;
		}
	});
	
	/*iCat.foreach(Person.prototype, function(k, v){
		iCat.widget.Teacher.prototype[k] = v;
	});*/
	iCat.mix(iCat.widget.Teacher.prototype, Person.prototype);
	var Tom = new iCat.widget.Teacher('Tom', 28, 'English');
	Tom.getName();

	iCat.util('fnMethod', function(msg){
		iCat.log(msg);
	});

	iCat.util.fnMethod('util中fnMethod执行的结果：test method');
	//iCat.log(iCat);
});

test('app/namespace', function(){
	iCat.app('aaa');
	equal(iCat.isObject(aaa), true);
	equal(iCat.isFunction(aaa.namespace), true);
	equal(iCat.isFunction(aaa.foreach), false, 'aaa对象没有foreach方法.');
	
	aaa.namespace('bbb');
	equal(iCat.isObject(aaa.bbb), true);
	
	iCat.namespace('ccc');
	equal(iCat.isObject(iCat.ccc), true);
	
	iCat.app('Able', function(){
		return {
			version: '1.0',
			
			testfn: function(){
				alert(0);
			}
		}
	});
	equal(iCat.isString(Able.version), true);
	equal(iCat.isFunction(Able.testfn), true);
});

test('rentAjax', function(){
	equal(iCat.isFunction(iCat.rentAjax), true, '租借其他库的ajax');
	equal(iCat.isFunction(iCat.util.ajax), false, '尚未设置ajax');
	
	iCat.rentAjax(jQuery.ajax, {
		data: {token:'1234567abcdefg'},
		success: function(){ iCat.log('全局success，我执行了...'); },
		error: function(){ iCat.log('发生错误，我执行了...'); }
	});

	equal(iCat.isFunction(iCat.util.ajax), true, '设置了ajax');

	iCat.util.ajax({
		url: 'src/abc.php',
		type: 'POST',//GET
		success: function(data){
			iCat.log('自定义success，我也执行了...');
		},
		error: function(){}
	});
});

test('base-methods', function(){
	deepEqual(true, true);

	iCat.util.recurse([1,2,3,4,5], function(me){
		iCat.log(me);
	});

	/*iCat.util.bubble(
		iCat.util.queryOne('input[name="noglobals"]'),
		function(me){
			iCat.log(me);
		}
	);*/

	iCat.util.scroll(document, function(bh, bs, ph){
		console.log(bh, bs, ph);
		if(bh+bs+10>=ph) iCat.log('小心哈，滑到底部了...');
	});
});

test('dom-methods', function(){
	var elTest = iCat.util.queryOne('#test_makeHtml');

	deepEqual(iCat.util._matches(document, 'html'), false);
	deepEqual(iCat.util._matches(document.body, 'body'), false);
	deepEqual(iCat.util._matches(document), false);
	deepEqual(iCat.util._matches(elTest, '#test_makeHtml'), true);

	iCat.util.addClass(elTest, 'testClass aaa');
	iCat.util.removeClass(elTest, 'aaa');
	deepEqual(iCat.util.hasClass(elTest, 'testClass'), true, '元素包含testClass');
});

test('storage-methods', function(){
	deepEqual(true, true);

	iCat.util.storage('testKey', 'testValue');
	deepEqual(iCat.util.storage('testKey'), 'testValue', 'testKey存入了localStorage');
	iCat.util.clearStorage('testKey');
	deepEqual(iCat.util.storage('testKey'), null, 'testKey已被删除');

	iCat.util.storage('testKeyx', 'testValuex', true);
});

test('html engine', function(){
	deepEqual(true, true);

	console.log(iCat.util.zenCoding('div#page.a.b.c'));
	console.log(iCat.util.zenCoding('header.hd+(div.main>span)+footer.ft'));
	console.log(iCat.util.zenCoding('div#page.a.b.c>header.hd+(div.main>span)+footer.ft'));

	//iCat.util.makeHtml({'#test_makeHtml': 'header#iHeader.hd + div#iScroll'});
	iCat.util.unwrap(iCat.util.queryOne('#test_unwrap'));
});

test('template engine', function(){
	deepEqual(true, true);

	/*iCat.util.render({
		tempId: 'test_temp',
		wrap: '#test_makeHtml ul',
		hooks: {
			'&': ['.aaa.bbb.ccc#ddd#eee', 'data-abc~123456'],
			'&>0': '.xxx.yyy.zzz.xxx',
			'&>0:1': '.a#b'
		},
		//overwrite: true,
		//onlyChild: true,
		callback: function(){}
	}, {a:1, b:2, c:3, d:4});//, undefined, true |, true

	iCat.util.save('key_xxx', {a:1, b:2, c:3, d:4});
	iCat.util.save('key_xxx', {a:1, b:2, c:3, d:4}, false);
	iCat.util.remove('key_xxx');*/
	var cfg = {
		tempId: 'test_temp',
		wrap: '#test_makeHtml ul',
		hooks: {
			'&': ['.aaa.bbb.ccc#ddd#eee', 'data-abc~123456'],
			'&>0': '.xxx.yyy.zzz.xxx',
			'&>0:1': '.a#b'
		},
		ajaxUrl: 'src/abc.php',
		dataSave: true,
		//overwrite: true,
		//onlyChild: true,
		callback: function(){}
	};

	/*iCat.util.fetch(cfg, function(data){
		//iCat.log(data);
		iCat.util.render(cfg, data);
	});*/
});