var iCat = ICAT;

module('ICAT关键属性和方法');

test('mix', function(){
	deepEqual(iCat.mix({},{aaa:2}), {aaa:2});
	deepEqual(iCat.mix({bbb:"test aaa"}, {aaa:2, bbb:"test bbb"}), {aaa:2, bbb:"test bbb"});
	deepEqual(iCat.mix({bbb:"test aaa"}, {aaa:2, bbb:"test bbb"}, undefined, false), {aaa:2, bbb:"test bbb"});
});

test('isDebug', function(){
	equal(iCat.isDebug, false);
});

test('browser', function(){
	iCat.foreach({
		safari: 'chrome or safari.',
		opera: 'opera.',
		msie: 'msie.',
		mozilla: 'mozilla.'
	}, function(k, v){
		equal(iCat.browser[k], true, v);
	});
});

test('is函数', function(){
	var arrKey = ['Function', 'String', 'Array', 'Object', 'Null'],
		arrExamp = [iCat.mix, iCat.version, arrKey, iCat, null];
	
	iCat.foreach(arrKey, function(i, v){
		equal(iCat['is'+v](arrExamp[i]), true, v);
	});
});

test('Class/widget', function(){
	iCat.Class('Person', {
		Create: function(name, age){
			this.name = name;
			this.age = age;
		},
		
		getName: function(){
			iCat.log(this.name);
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
		iCat.Teacher.prototype[k] = v;
	});*/
	iCat.mix(iCat.Teacher.prototype, Person.prototype);
	var Tom = new iCat.Teacher('Tom', 28, 'English');
	Tom.getName();
});

test('app/namespace', function(){
	iCat.app('aaa');
	equal(iCat.isObject(aaa), true);
	equal(iCat.isFunction(aaa.namespace), true);
	equal(iCat.isFunction(aaa.foreach), true);
	
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