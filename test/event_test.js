var iCat = ICAT;

module('ICAT.Event');

test('Event', function(){
	deepEqual(true, true);
});

var Event = iCat.Event, doc = document;

Event.bind(doc, 'click', function(evt){
	console.log(evt.target);
	Event.unbind(doc, 'click');
});

Event.on(doc, 'click.test', function(evt){
	console.log(this);
	Event.off(doc, 'click.test');
});

Event.on('.pass span', '@longTap', function(){
	alert(this.nodeName)
	Event.off('.pass span', '@longTap');
});

Event.delegate([
	{
		selector:'#test-output0 a', type:'click',
		callback:function(){
			alert(this.href);
			setTimeout(function(){
				Event.undelegate({selector:'#test-output0 a', type:'click'});
			}, 500);
		},
		preventDefault:true, stopPropagation:true
	},
	{
		selector:'p', type:'tap',
		callback:function(){ alert(this.className); }
	}
]);