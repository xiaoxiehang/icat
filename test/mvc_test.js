(function(iCat){
	// example
	window.onload = function(){

		var temp = '<%for(var i=0; i<data.length; i++){%>\
				<li class="<%=data[i].jshook%>">\
					<a href="<%=data[i].link%>">\
						<span class="icon"><img src="<%=data[i].img%>"></span>\
						<span class="desc">\
							<em><%=data[i].title%></em>\
							<b></b>\
							<b></b>\
						</span>\
					</a>\
				</li>\
				<%}%>',
		
		data = {
			sucess:true, msg:'',
			parentSelector:'.J_itembox',
			data:[
				{link:'ccc', img:'http://dev.assets.gionee.com/apps/game/apk/pic/pic_icon.jpg', title:'ccc', jshook:'todo'},
				{link:'ddd', img:'http://dev.assets.gionee.com/apps/game/apk/pic/pic_icon.jpg', title:'ddd'},
				{title:'abc'}
			]
		};
	
		var pageView = new iCat.View(temp, data),//'J_mvcView'
			d = {
				sucess:true, msg:'',
				parentSelector:'.J_itembox',
				data:[
					{link:'000', img:'http://assets.3gtest.gionee.com/apps/game/apk/pic/pic_icon.jpg', title:'000', jshook:'doit'}
				]
			};
		
		//pageView.setData(d);
		pageView.addItem([{link:'bbb', img:'http://assets.3gtest.gionee.com/apps/game/apk/pic/pic_icon.jpg', title:'bbb', jshook:'testit'}]);
		pageView.addItem({link:'aaa', img:'http://assets.3gtest.gionee.com/apps/game/apk/pic/pic_icon.jpg', title:'aaa'});
	};
})(ICAT);