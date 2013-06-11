(function(iCat, root){
	
	//template
	Gou.template =
	{
		aHeader: //一级页头
			'<div class="logo-search">\
				<h1>购物大厅</h1>\
				<form action="/front/index/search" method="get">\
					<input type="text" name="keyword" placeholder="请输入商品名">\
					<button type="submit"></button>\
				</form>\
			</div>\
			<nav>\
				<ul>\
					<%for(var i=0, len=nav.length; i<len; i++){%>\
					<li><%if(nav[i].selected){%><span><%=nav[i].name%></span><%}else{%><a href="<%=nav[i].link%>"><%=nav[i].name%></a><%}%></li>\
					<%}%>\
				</ul>\
			</nav>',

		bHeader: '', //二级页头

		recommend: //首页推荐位
			'<section class="tj-webapp">\
			<%if(data.length){%>\
				<ul>\
					<%for(var i=0, len=data.length; i<len; i++){%>\
					<li><a href="<%=data[i].link%>"><img src="<%=blankPic%>" data-src="<%=data[i].img%>"></a></li>\
					<%}%>\
				</ul>\
			<%}%>\
			</section>',

		points: //首页积分链接
			'<section class="jf-links">\
				<ul>\
					<%for(var i=0, len=links.length; i<len; i++){%>\
					<li><a href="<%=links[i].link%>"></a></li>\
					<%}%>\
				</ul>\
			</section>',

		notice: '', //首页消息通知

		icoItem: //首页 购物商城/便民助手
			'<section class="ico-show">\
				<h2><%=title%></h2>\
				<%if(data.length){%>\
				<ul>\
					<%for(var i=0, len=data.length; i<len; i++){%>\
					<li>\
						<a href="<%=data[i].link%>">\
							<span><img src="<%=blankPic%>" data-src="<%=data[i].img%>"></span>\
							<em><%=data[i].name%></em>\
						</a>\
					</li>\
					<%}%>\
				</ul>\
				<%}%>\
			</section>',

		footer: //首页底部
			'<footer class="ft">\
				<div class="help">\
					<span>官网QQ群：237057997</span>\
					<a>帮助中心</a>\
				</div>\
				<div class="copyright">\
					<p>深圳市金立通信设备有限公司</p>\
					<p>copyright &copy; 2012 粤ICP备05087105号</p>\
				</div>\
			</footer>',

		codList: //货到付款列表
			'<section class="cod-list">\
			<%if(data.length){%>\
				<%for(var i=0, len=data.length; i<len; i++){%>\
				<div class="item">\
					<figure data-id="<%=data[i].id%>">\
						<div class="icon">\
							<span><img src="<%=blankPic%>" data-src="<%=data[i].img%>"></span>\
						</div>\
						<div class="desc">\
							<h3><%=data[i].title%></h3>\
							<p><%=data[i].descrip%></p>\
						</div>\
					</figure>\
					<div class="detail"></div>\
				</div>\
				<%}%>\
			<%}%>\
			</section>',

		codDetail: //展开详情
			'<%if(data.img_data.length || data.text_data.length){%>\
			<ul>\
				<%for(var i=0, len=data.img_data.length; i<len; i++){\
				if(i==0){%>\
					<li class="top-ad">\
						<a href="<%=data.img_data[i].link%>">\
							<span><img src="<%=blankPic%>" data-src="<%=data.img_data[i].img%>"></span>\
						</a>\
				<%}else if(i==len-1){%>\
						<a href="<%=data.img_data[i].link%>">\
							<span><img src="<%=blankPic%>" data-src="<%=data.img_data[i].img%>"></span>\
						</a>\
					</li>\
				<%}else if(i%2){%>\
					</li><li class="top-ad">\
						<a href="<%=data.img_data[i].link%>">\
							<span><img src="<%=blankPic%>" data-src="<%=data.img_data[i].img%>"></span>\
						</a>\
				<%}else{%>\
						<a href="<%=data.img_data[i].link%>">\
							<span><img src="<%=blankPic%>" data-src="<%=data.img_data[i].img%>"></span>\
						</a>\
					</li><li class="top-ad">\
				<%}}%>\
				<%for(var i=0, len=data.text_data.length; i<len; i++){\
				if(i==0){%>\
					<li>\
						<a<%if(data.text_data[i].color){%> style="color:<%=data.text_data[i].color%>"<%}%> href="<%=data.text_data[i].link%>"><%=data.text_data[i].title%></a>\
				<%}else if(i%2==0){%>\
					</li><li>\
						<a<%if(data.text_data[i].color){%> style="color:<%=data.text_data[i].color%>"<%}%> href="<%=data.text_data[i].link%>"><%=data.text_data[i].title%></a>\
				<%}else{%>\
						<a<%if(data.text_data[i].color){%> style="color:<%=data.text_data[i].color%>"<%}%> href="<%=data.text_data[i].link%>"><%=data.text_data[i].title%></a>\
					</li>\
				<%}}%>\
			</ul>\
			<%}%>'
	};

	//view
	var bi = typeof t_bi != 'undefined'? ('t_bi=' + t_bi) : '',
		i = 0;
	Gou.view = iCat.View.extend({
		config: {
			isSave: true,
			multiChild: true
		},
		blankPic: iCat.PathConfig.appRef.replace(/assets\/js\//g, 'pic/blank.gif')
	});

	Gou.view.setting = {
		'header': {//页头
			config: {
				tempId: 'aHeader',
				wrap: '#iHeader',
				multiChild: false,
				dataSave: false
			},
			nav: [
				{name:'推 荐', link:iCat.util.fullUrl('', bi)},
				{name:'货到付款', link:iCat.util.fullUrl('/cod', bi)},
				{name:'个人中心', link:iCat.util.fullUrl('/person', bi)}
			]
		},

		// ------------

		'recommend': {//推荐
			config: {
				tempId: 'recommend',
				wrap: '#iScroll .panel',
				ajaxUrl: '/api/gou/recommend',
				events: [{
					selector:'.tj-webapp a', type:'singleTap', preventDefault:true, stopPropagation:true,
					callback:function(){
						i++;
						iCat.View['recommend'].setAjaxUrl(iCat.util.fullUrl('/api/gou/recommend?page='+i, true));
					}
				},{
					selector:'.tj-webapp a', type:'hover', preventDefault:true,
					callback:function(v, m, cfg, evt, status){
						this.style.background = status==0? '#f90' : '';
					}
				},{
					selector:'.tj-webapp a', type:'longtap', preventDefault:true,
					callback:function(){
						alert(this.tagName);
					}
				},{
					selector:'.tj-webapp a', type:'tap', preventDefault:true, callback:'fnTest'
				},{
					selector:'.tj-webapp a', type:'doubletap', preventDefault:true,
					callback:function(){
						alert(this.tagName);
					}
				}]
			},
			fnTest: function(v, m, cfg, evt){
				iCat.log(v); iCat.log(m); iCat.log(this);
			}
		},
		'points': {//积分
			config: {
				tempId: 'points',
				wrap: '#iScroll .panel'
			},
			links: [
				{link: iCat.util.fullUrl('/goods', bi)},
				{link: iCat.util.fullUrl('/subject', bi)}
			]
		},
		'notice': {//通告
			config: {
				tempId: 'notice',
				wrap: '#iScroll .panel'
			}
		},
		'mall': {//商场
			config: {
				tempId: 'icoItem',
				wrap: '#iScroll .panel',
				ajaxUrl: '/api/gou/mall'
			},
			title: '综合购物商城'
		},
		'theme': {//主题店
			config: {
				tempId: 'icoItem',
				wrap: '#iScroll .panel',
				ajaxUrl: '/api/gou/theme'
			},
			title: '主题店'
		},
		'tuan': {//团购&折扣
			config: {
				tempId: 'icoItem',
				wrap: '#iScroll .panel',
				ajaxUrl: '/api/gou/tuan'
			},
			title: '团购&折扣'
		},
		'helper': {//助手
			config: {
				tempId: 'icoItem',
				wrap: '#iScroll .panel',
				ajaxUrl: '/api/gou/helper'
			},
			title: '生活便民助手'
		},
		'footer': {//页尾
			config: {
				tempId: 'footer',
				wrap: '#iScroll .panel'
			}
		},

		// ------------

		'list': {
			config: {
				tempId: 'codList',
				wrap: '#iScroll .panel',
				multiChild: false,
				hooks: {
					'&>1:.item' : '.J_itemWrap',
					'&>2:.detail' : '.J_itemDetail'
				},
				ajaxUrl: '/api/cod/type',
				isSave: true,
				callback: function(){
					var scrollPanel = $('#iScroll', iCat.elCurWrap),
						num = iCat.util.cookie('itemIndex'),
						el = '.J_itemWrap figure' + (num? ':'+parseInt(num) : '');
					scrollPanel.find('.J_itemWrap:last').height(scrollPanel.height());
					num!=undefined ?
						iCat.Event.trigger(el, '@singleTap') : scrollPanel.addClass('not-first');
				}
			}
		}
	};
})(ICAT, window);