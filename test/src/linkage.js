(function(iCat){
	var Event = iCat.Event,
		ctrl = iCat.Controler(), mod = iCat.Model();

	mod.extend({
		initData: function(){
			return this._createData();
		},

		_createData: function(v){
			var	wrap = document.querySelector('#J_linkageWrap'),
				d = CitySelectData,
				node = {parentWrap:wrap, data:d};
			
			v = v || wrap.getAttribute('old-anode');
			if(!v) return node;
			
			for (var p in d) {
				for (var c in d[p].items) {
					for (var cr in d[p].items[c].items) {
						if (d[p].items[c].items[cr]==v){
							node.selectNum = [d[p].val, d[p].items[c].val, v];
							return node;
						}
					}
				}
			}
			return node;
		}
	});

	Event.ready(function(){
		var d = mod.initData(),
			optView = iCat.View('J_selectView', d);
	});
})(ICAT);