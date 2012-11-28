/*module('关键函数');
test('mix', function(){
	equal(1,'1', 'OK');
	deepEqual(mix({},{aaa:2}), {aaa:2}, 'mix({},{aaa:2}) == {aaa:2}');
	deepEqual(mix({bbb:"test aaa"}, {aaa:2, bbb:"test bbb"}), {aaa:2, bbb:"test bbb"}, 'mix({bbb:"test aaa"}, {aaa:2, bbb:"test bbb"}) == {aaa:2, bbb:"test bbb"}');
	deepEqual(mix({bbb:"test aaa"}, {aaa:2, bbb:"test bbb"}, undefined, false), {aaa:2, bbb:"test aaa"}, 'mix({bbb:"test aaa"}, {aaa:2, bbb:"test bbb"}, undefined, false) == {aaa:2, bbb:"test aaa"}');
});*/


 
 /*test('iCat#mix', function() {
    // Not a bad test to run on collection methods.
    //strictEqual(iCat.mix({}, {aaa:0}), {"aaa":0}, '执行正确');
	//ok(iCat.mix({}, {aaa:0}), '执行正确');
	
	strictEqual(isEven(3), false, '执行正确');
	strictEqual(isEven(-1), false, '执行正确');
	strictEqual(isEven(5), false, '执行正确');
  });
  
  module('B');
  test('iCat#mix', function() {
	deepEqual(iCat.mix({},{"aaa":2}), {"aaa":2}, 'Two objects can be the same in value');
  });*/

//ICAT.mix();
var Class = {};
Class.create = function(source){
	var kclass = function(){//console.log(this.initialize);
		this.initialize.apply(this,arguments);
	};
	for(var i in source){
		kclass.prototype[i] = source[i];
	}
	return kclass;
};

var Able = Class.create({
	initialize: function(name){
		this.name = name;
	},
	
	log: function(){
		alert(this.name);
	}
});

ICAT.widget('Ablex', {
	Create: function(name, util){
		this.name = name;
		this.util = util;
	},
	
	log: function(){
		alert(this.util);
	}
});

function Ablexx(name){
	this.name = name;
}

var able = new Able('able'),
	ablex = new ICAT.Ablex('ablex'),
	ablexx = new Ablexx('ablexx');
//able.log();
ICAT.log(able);
console.log(ablex);//.constructor==Ablex
console.log(ablexx);

module('关键函数');
test('log', function(){
	var obj = {};
	equal(ICAT.isObject(obj), true);
	deepEqual(ICAT.mix({},{aaa:2}), {aaa:2}, 'mix({},{aaa:2}) == {aaa:2}');
});