<!DOCTYPE HTML>
<?php include '_cfg.php';?>
<html class="<?php echo $ucClass;?>">
<head>
	<meta charset="UTF-8">
	<title>购物大厅</title>
	<?php include '_inc.php';?>
	<script>var token = '013566affdssad';</script>
</head>

<body data-pagerole="body">
	<header id="iHeader" class="hd">
		<div class="logo-search">
			<h1>购物大厅</h1>
			<form action="">
				<input type="text" name="" placeholder="请输入商品名">
				<button></button>
			</form>
		</div>
		<nav>
			<ul>
				<li><a href="index.php">推 荐</a></li>
				<li><a href="cod.php">货到付款</a></li>
				<li><span>个人中心</span></li>
			</ul>
		</nav>
	</header>

	<div id="iScroll">
		<article class="ac">
			<section class="arrow-rect right">
				<div class="person-inf">
					<a href="">
						<span class="pic"><img src="<?php echo "$appPic/headPic.jpg";?>" alt=""></span>
						<em>18602468946</em>
					</a>
				</div>
			</section>

			<section class="tab-wrap">
				<nav>
					<ul>
						<li><a href="person.php" class="rount-rect"><em>66.00</em>我的积分</a></li>
						<li><a class="selected rount-rect"><em>23</em>我的订单</a></li>
						<li><a href="" class="rount-rect"><em>12</em>心愿清单</a></li>
						<li><a href="" class="rount-rect"><em>收货地址</em></a></li>
					</ul>
				</nav>
				<div class="main img-text-list J_unfoldWrap">
					<script type="text/icat-template">
						<%for(var i=0, len=data.list.length; i<len; i++){%>
						<li>
							<div class="img-text">
								<a href="<%=data.list[i].href%>">
									<span class="pic"><img src="<%=data.list[i].img%>" /></span>
									<span class="text">
										<em><%=data.list[i].title%></em>
										<em>单价：<%=data.list[i].price%>元</em>
										<em>数量：<%=data.list[i].quantity%></em>
										<em>成交时间：<%=data.list[i].created%></em>
										<em>订单状态：<strong><%=data.list[i].status%></strong></em>
									</span>
								</a>
								<div class="pay">实际支付：<b><%=data.list[i].totalprice%>元</b>（使用<strong><%=data.list[i].silver%></strong>元银币）</div>
							</div>
						</li>
						<%}%>
					</script>
					
					<h2 class="arrow-rect up" data-ajaxUrl="/api/user/order">积分换购-实物订单（10）</h2>
					<div class="desc hidden"><ul></ul></div>

					<h2 class="arrow-rect down" data-ajaxUrl="/api/user/order">积分换购-话费订单（3）</h2>
					<div class="desc hidden"><ul></ul></div>

					<h2 class="arrow-rect down" data-ajaxUrl="/api/user/order">积分换购-阅读币订单（0）</h2>
					<div class="desc no-order hidden">亲，您还没有订单哦~</div>

					<h2 class="arrow-rect down">积分返利订单（3）</h2>
					<div class="desc hidden"><ul></ul></div>
				</div>
			</section>
		</article>
	</div>
</body>
</html>