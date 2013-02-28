(function(iCat){
	// example
	window.onload = function(){

		var temp = '<%for(var i=0; i<data.length; i++){%>\
				<li>\
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
			parentWrap:'#qunit-tests',
			dataAttr:'data-ajaxUrl~http://www.gionee.com',
			data:[
				{link:'ccc', img:'http://dev.assets.gionee.com/apps/game/apk/pic/pic_icon.jpg', title:'ccc', jsHook:'#J_todo'},
				{link:'ddd', img:'http://dev.assets.gionee.com/apps/game/apk/pic/pic_icon.jpg', title:'ddd', jsHook:'.J_test'},
				{title:'abc', dataAttr:'data-ajaxUrl~http://www.baidu.com, pageNum~1, hasnext~false'}
			]
		};
	
		var pageView = new iCat.View(temp, data),//'J_mvcView'
			d = {
				sucess:true, msg:'',
				parentWrap:'',
				data:[
					{link:'000', img:'http://assets.3gtest.gionee.com/apps/game/apk/pic/pic_icon.jpg', title:'000', jshook:'doit'}
				]
			};//iCat.log(pageView)
		
		/*document.body.onclick = function(){
			pageView.setData(d);iCat.log(pageView)
			pageView.addItem([{link:'bbb', img:'http://assets.3gtest.gionee.com/apps/game/apk/pic/pic_icon.jpg', title:'bbb', jshook:'testit'}]);
			pageView.addItem({link:'aaa', img:'http://assets.3gtest.gionee.com/apps/game/apk/pic/pic_icon.jpg', title:'aaa'});
		};*/


		var tempx = '<div class="game-inf">\
						<div class="item-list">\
							<ul>\
								<li>\
									<a>\
										<figure class="clearfix">\
											<div class="pic"><img src="<%=data.info.img%>" onerror="this.src=\\\'src/img/ico_default.jpg\\\'"></div>\
											<div class="desc">\
												<p>\
													<span>类型: <%=(data.types[data.info.ptype]||{})[\'title\']%></span>\
													<span>资费: <%=["免费","道具收费","关卡收费"][parseInt(data.info.pay_type)-1]%></span>\
													<span>语言: <%=data.info.language%></span>\
													<span>大小: <%=data.info.size%></span>\
													<span>版本: <%=data.info.version%></span>\
													<span>更新: <%=data.info.update_time%></span>\
													<span>公司: <%=data.info.company%></span>\
												</p>\
											</div>\
										</figure>\
									</a>\
								</li>\
							</ul>\
						</div>\
						<div class="gm-down">\
							<div class="btn J_btnLoad"></div>\
						</div>\
						<div class="pic-show J_picShow"><div class="wrap">\
							<%for(var i=0; i<data.gimgs.length; i++){%>\
							<img src="<%=data.gimgs[i].img%>" alt="" />\
							<%}%>\
						</div></div>\
					</div>\
					<div class="game-intro">\
						<h3>简介：</h3>\
						<div class="desc">\
							<div class="J_descText"><%=data.info.descrip%></div>\
						</div>\
					</div>',

			datax = {
			    "success": true,
			    "msg": "",
			    "data": {
			        "info": {
			            "id": "32",
			            "sort": "49",
			            "name": "\u6355\u9c7c\u8fbe\u4eba2",
			            "resume": "\u98ce\u9761\u5168\u7403\u7684\u4f11\u95f2\u7c7b\u6e38\u620f\u6355\u9c7c\u8fbe\u4eba\u7684\u7eed\u4f5c",
			            "link": "http:\/\/gamedl.gionee.com\/apps\/games\/puyuer.apk",
			            "img": "http:\/\/games.gionee.com\/attachs\/game\/201211\/102457.jpg",
			            "ptype": "2",
			            "pay_type": "3",
			            "subject": "15",
			            "downloads": "0",
			            "language": "\u4e2d\u6587",
			            "package": "org.cocos2dx.FishingJoy2",
			            "activity": "",
			            "price": "0.00",
			            "company": "\u5317\u4eac\u89e6\u63a7\u79d1\u6280\u6709\u9650\u516c\u53f8",
			            "version": "1.0.9",
			            "sys_version": "4",
			            "min_resolution": "1",
			            "max_resolution": "5",
			            "size": "21.81MB",
			            "update_time": "2013-02-01",
			            "descrip": "<p>\u6355\u9c7c\u8fbe\u4eba2\u662f\u98ce\u9761\u5168\u7403\u7684\u4f11\u95f2\u7c7b\u6e38\u620f\u6355\u9c7c\u8fbe\u4eba\u7684\u7eed\u4f5c\uff0c\u65b0\u7248\u7684\u6e38\u620f\u4e0d\u4ec5\u7ee7\u627f\u4e86\u539f\u7248\u6e38\u620f\u7684\u7279\u8272\uff0c\u8fd8\u5728\u539f\u6709\u57fa\u7840\u4e0a\u6dfb\u52a0\u4e86\u8bb8\u591a\u65b0\u7684\u5185\u5bb9\uff0c\u5982\u65b0\u7684\u6e38\u620f\u573a\u666f\u4ee5\u53ca\u65b0\u6b66\u5668\u7b49\u3002\u4e0d\u8fc7\u6355\u9c7c\u8fbe\u4eba2\u548c\u4e4b\u524d\u7684\u7248\u672c\u4e0d\u540c\uff0c\u56e0\u4e3a\u65b0\u7684\u5173\u5361\u573a\u666f\u662f\u9700\u8981\u4ed8\u8d39\u624d\u80fd\u6fc0\u6d3b\u7684\u3002\u9c7c\u8fbe\u4eba2\u8fd8\u63a8\u51fa\u4e86\u5168\u65b0\u7684\u7279\u8272\u73a9\u6cd5!<\/p><p>1\u3001\u65b0\u5f00\u653e\u6e14\u573a\u5185\u7684\u500d\u7387\u9009\u62e9,\u591a\u79cd\u500d\u7387\u4e0e\u591a\u7ea7\u6b66\u5668\u81ea\u7531\u7ec4\u5408,\u6ee1\u8db3\u73a9\u5bb6\u591a\u6837\u7684\u6355\u9c7c\u7b56\u7565.<\/p><p>2\u3001\u9664\u4e86\u95ea\u4eae\u91d1\u5e01,\u6355\u83b7\u9c7c\u513f\u8fd8\u6709\u53ef\u80fd\u6389\u843d\u5361\u724c.\u5404\u8272\u7cbe\u7f8e\u5361\u724c,\u5bf9\u5e94\u4e0d\u540c\u5c0f\u6e38\u620f\u4e0e\u968f\u673a\u4e8b\u4ef6,\u4ee4\u6355\u9c7c\u8da3\u5473\u500d\u589e!<\/p><p>3\u3001\u6bcf\u65e5\u591a\u6b21\u9886\u53d6\u514d\u8d39\u91d1\u5e01,\u7d2f\u79ef\u9886\u53d6\u6570\u6b21\u4e4b\u540e,\u66f4\u53ef\u62bd\u53d6\u5e78\u8fd0\u5927\u5956!<\/p><p>\u6e38\u620f\u7279\u8272\uff1a\u3000<\/p><p>1\u3001\u5168\u9762\u652f\u6301\u9ad8\u6e05\u663e\u793a\u3000\u3000<\/p><p>2\u3001\u723d\u5feb\u7684\u6355\u9c7c\u4f53\u9a8c<\/p><p>3\u3001\u66f4\u81ea\u7136\u4f18\u7f8e\u7684\u9c7c\u7fa4\u6e38\u52a8\u3000\u3000<\/p><p>4\u3001\u53ef\u4f9b\u9009\u62e9\u7684\u4e30\u5bcc\u6e14\u573a,\u5c55\u73b0\u6d77\u5e95\u591a\u6837\u98ce\u60c5\u3000<\/p><p>5\u3001\u673a\u67aa\u3001\u6563\u5f39\u3001\u6fc0\u5149,\u4e09\u5927\u7c7b\u6b66\u5668\u5404\u5177\u7279\u8272\u3000<\/p><p>6\u3001\u5f00\u653e\u81ea\u7531\u8c03\u6574\u500d\u7387,\u4e0e\u4e0d\u540c\u6b66\u5668\u7ec4\u5408\u51fa\u591a\u6837\u6355\u9c7c\u7b56\u7565\u3000<\/p><p>7\u3001\u6e38\u620f\u5168\u65b0\u5361\u724c\u7cfb\u7edf,\u968f\u673a\u89e6\u53d1\u4e8b\u4ef6\u548c\u5c0f\u6e38\u620f\u3000\u3000<\/p><p>8\u3001\u6e38\u620f\u5b9a\u65f6\u9886\u53d6\u514d\u8d39\u91d1\u5e01,\u66f4\u6709\u673a\u4f1a\u62bd\u53d6\u5927\u5956<\/p>"
			        },
			        "gimgs": [{
			            "id": "147",
			            "game_id": "32",
			            "img": "http:\/\/games.gionee.com\/attachs\/game\/201211\/102507.jpg"
			        },
			        {
			            "id": "148",
			            "game_id": "32",
			            "img": "http:\/\/games.gionee.com\/attachs\/game\/201211\/102508.jpg"
			        },
			        {
			            "id": "149",
			            "game_id": "32",
			            "img": "http:\/\/games.gionee.com\/attachs\/game\/201211\/102511.jpg"
			        }],
			        "types": {
			            "1": {
			                "id": "1",
			                "sort": "1",
			                "title": "\u7f51\u6e38",
			                "status": "1"
			            },
			            "2": {
			                "id": "2",
			                "sort": "2",
			                "title": "\u5355\u673a",
			                "status": "1"
			            }
			        }
			    }
			};

		var pageViewx = new iCat.View(tempx, datax);
	};
})(ICAT);