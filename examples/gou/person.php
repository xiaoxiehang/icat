<!DOCTYPE HTML>
<?php include '_cfg.php';?>
<html class="<?php echo $ucClass;?>">
<head>
	<meta charset="UTF-8">
	<title>购物大厅</title>
	<?php include '_inc.php';?>
</head>

<body data-pagerole="body">
	<header id="iHeader" class="hd">
		<div class="logo-search">
			<h1>购物大厅</h1>
			<form action=""><input type="text" name="" placeholder="请输入商品名"></form>
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
						<li><a class="selected rount-rect"><em>66.00</em>我的积分</a></li>
						<li><a href="order.php" class="rount-rect"><em>23</em>我的订单</a></li>
						<li><a href="" class="rount-rect"><em>12</em>心愿清单</a></li>
						<li><a href="" class="rount-rect"><em>收货地址</em></a></li>
					</ul>
				</nav>
				<div class="main J_unfoldWrap">
					<h2 class="arrow-rect down">积分使用说明</h2>
					<div class="desc jf-rule hidden">
						<h3>如何获取积分</h3>
						<p>恭喜您获得20.00银币（注册送银币，本周赠送20银币）</p>
						<h3>如何使用积分</h3>
						<p>恭喜您获得100.00银币（可用30.00元，冻结70.00元）注册奖励。</p>
					</div>

					<h2 class="arrow-rect up">积分流通记录</h2>
					<div class="desc">
						<p>恭喜您获得20.00银币（注册送银币，本周赠送20银币）
							<time>2013-03-13 00:00:01</time>
						</p>
						<p>恭喜您获得100.00银币（可用30.00元，冻结70.00元）注册奖励。
							<time>2013-03-13 00:00:01</time>
						</p>
					</div>
				</div>
			</section>
		</article>
	</div>
</body>
</html>