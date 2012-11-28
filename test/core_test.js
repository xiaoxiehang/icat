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
module('关键函数');
test('log', function(){
	var obj = {};
	equal(ICAT.isObject(obj), true);
	deepEqual(ICAT.mix({},{aaa:2}), {aaa:2}, 'mix({},{aaa:2}) == {aaa:2}');
});