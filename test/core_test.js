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
	iCat.log(iCat);
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