(function(a){a.app("Gou",function(){a.PathConfig();return{version:"0.9.6"};});a.mix(Gou,{init:function(){var b=a.Event,c=this,d=window.token||"";a.rentAjax($.ajax,{data:{token:d},success:function(){a.log("我执行了...");},error:function(){}});b.on(".J_unfoldWrap h2","@singleTap",c.unfold);b.on(".J_unfoldWrap .loadMore","@singleTap",c.loadmore);},unfold:function(){var b=$(this),c=b.attr("data-ajaxUrl"),d=b.next(".desc"),e=d.find("ul");if(c&&!b.hasClass("done")){a.util.ajax({url:a.util.fullUrl(c,true),success:function(f){if(f.success){a.util.render({tempId:$(".J_unfoldWrap script"),wrap:e},f);if(f.data.hasnext==true&&!d.find(".loadMore")[0]){e.after('<div class="btn loadMore"><span class="rount-rect gray">加载更多...</span></div>');}b.attr("data-hasnext",f.data.hasnext).attr("data-curpage",f.data.curpage);}}});b.addClass("done");}b.hasClass("up")?b.removeClass("up").addClass("down"):b.removeClass("down").addClass("up");d.toggleClass("hidden");},loadmore:function(){var b=$(this),h=b.prev("ul"),f=b.parent(".desc"),g=f.prev("h2"),e=g.attr("data-ajaxUrl");if(g.attr("data-hasnext")=="true"){var d=g.attr("data-curpage"),c=d?"&page="+(parseInt(d)+1):"";a.util.ajax({url:a.util.fullUrl(e,true),success:function(i){if(i.success){a.util.render({tempId:$(".J_unfoldWrap script"),wrap:h},i);if(i.data.hasnext==false){b.remove();}g.attr("data-hasnext",i.data.hasnext).attr("data-curpage",i.data.curpage);}}});}}});Gou.namespace("view","model","controller");a.include(["lib/jquery.js"],function(){Gou.init();a.require({modName:"appMVC"});});})(ICAT);