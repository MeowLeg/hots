$(function() {
	var h5_cb = function(d, key, _callAjax) {
    var getUserinfoCb = function(hg_username, hg_img) {
        var hot_id = _getPar("hot_id");
        var comments = [];
        var MAX = 1000000;
        var currentEventElement;
				var users = ["admin", "小编", "前方记者"];
        if (hot_id == '') return;

        // get random comments from db
        var getRandomComments = function(limit) {
            _callAjax({
								"noloading":1,
                "cmd":"getRandomComments",
                "limit":limit,
                "hot_id":hot_id,
            }, function(d) {
                if (d.data === null) return;
                comments = comments.concat(d.data);
            });
        };

        // get random comments in init
        getRandomComments(10);

        var updateComments = function(e, comments) {
            var ul = e.find(".event-comments ul");
            if (!comments) return;
            comments.forEach(function(r) {
                $('<li class="clearfix bbe mb10" data-id='+r.id+'> <span class="l"><img src="'+r.img+'" width="40"/></span> <div class="r pct80 pb10"> <div class="clearfix g6"> <span class="l">'+r.name+'</span><span class="r">'+_howLongAgo(r.logdate)+'</span> </div> <article class="bk">'+r.content+'</article> </div> </li> ').appendTo(ul);
            });
        };

        var updateEvents = function(d) {
            d.data.forEach(function(r) {
							// _tell(users);
							// _tell(parseInt(_get("xinlan_id"))-1);
                var str = '<div class="list clearfix mt10 mb5" data-id='+r.id+'> <div class="list-logo l"><img src="http://60.190.176.70:11001/images/xinlanUser/'+r.userid+'.jpg" width="100%"/><p>'+users[parseInt(r.userid)-1]+'</p></div> <div class="list-main rel r bg_light pct70 p10"> <header> <h6 class="mt1 calm">'+r.title+'<b class="f12 n ml10 assertive">'+r["status"]+'</b></h6> <time class="g9">'+_howLongAgo(r.logdate)+'</time> </header> <article class="mt10 f16">'+r.content+'</article> <div class="list-footer bg_light pct100 clearfix tc pt10 pb5 g6 bte mt10"> <span class="l rel zan">'+r.zan+'</span> <span class="r rel pl10 comment-count" if-shown=0>评论 '+r.commentsCount+'</span> </div> </div> <div class="event-comments bg_light pct70 p10 mt5 r dn" if-shown=0><ul></ul><span class="btn bg_positive pct100 p0 pt5 pb5 comments-more">查看更多</span></div></div>';
                var e = $(str).appendTo("#events");
                e.find(".zan").click(function() {
                    _callAjax({
                        "cmd":"zan",
                        "event_id":r.id
                    }, function(d) {
                        var zans = parseInt(e.find(".zan").text());
                        // var zans = parseInt($(this).text());// 这里的$(this)是window
                        if (d.success) e.find(".zan").text(zans+1);
                    });
                });
                e.find(".comment-count").click(function(){
                    var cEle = e.find(".event-comments");
                    var ifShown = cEle.attr("if-shown").replace(/\s/g, '') == "1";
                    if (ifShown) {
                        cEle.hide();
                        $("#comment-input").hide();
                        cEle.attr("if-shown", 0);
                    } else {
                        currentEventElement = e;
                        cEle.attr("if-shown", 1);
                        $("#comment-input").show();
                        cEle.show();
                        if (!cEle.find("ul li").length) {
                            _callAjax({
                                "cmd":"getTop5Comments",
                                "event_id":r.id,
                                "from": MAX
                            }, function(d) {
                                updateComments(e, d.data);
                            });
                        }
                    }
                });
                e.find(".comments-more").click(function() {
                    var l = e.find(".comment ul li:last");
                    if (!l) return;
                    var from = l.attr("data-id");
                    _callAjax({
                        "cmd":"getTop5Comments",
                        "event_id":r.id,
                        "from":from
                    }, function(d) {
                        updateComments(e, d.data);
                    });
                });

            });
        };

        _callAjax({
            "cmd":"getHotInfoById",
            "id":hot_id
        }, function(d){
            $("#hot-title").text(d.data.title);
            $("#events-count").text("报道数："+d.data.eventsCount);
            $("#clicks-count").text(d.data.clicksCount+" 次浏览量");
        });

        _callAjax({
            "cmd":"getTop5Events",
            "hot_id":hot_id,
            "from":MAX
        }, function(d) {
            updateEvents(d);
        });

        $("#events-more").click(function() {
            var eLast = $("#events > div:last");
            if (!eLast) return;
            var from = eLast.attr("data-id");
            _callAjax({
                "cmd":"getTop5Events",
                "hot_id":hot_id,
                "from":from
            }, function(d) {
                updateEvents(d);
            });
        });

        $("#comment-input span").click(function(e){
            // e.stopPropagation();
            var content = $(this).prev().val().replace(/\s/g, '');
            var event_id = currentEventElement.attr("data-id");
            if (content == '') return _toast.show("请填写内容！");
            // 获取hg_h5app的userinfo
            _callAjax({
                "cmd":"newComment",
                "name":hg_username,
                "img":hg_img,
                "content":content,
                "event_id": event_id
            }, function(d) {
                if (d.success) {
                    currentEventElement.find(".event-comments ul").empty();
                    _callAjax({
                        "cmd":"getTop5Comments",
                        "event_id":event_id,
                        "from":MAX
                    }, function(d){
                        updateComments(currentEventElement, d.data);
                    });
                }
            });
        });

        // damoo function
        var emitComment = function() {

            var i = -1,
            damoo = Damoo('dm-screen', 'dm-canvas', 9);
            damoo.start();

            // damoo random color
            var randomColor = function() {
                var nums = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F'],
                    cnt = 3, colors = [];
                while (cnt > 0) {
                    colors.push(nums[parseInt(Math.random()*16)]);
                    cnt -= 1;
                }
                return "#"+colors.join("");
            };

            // display damoo on screen
            return function() {
                if (comments.length == 0) return;
                i += 1;
                if (i == comments.length) i = -10;
                damoo.emit({
                    "text":comments[i].comment,
                    "color":randomColor(),
                    "shadow":true
                });
            };
        }();

        // damoo run every 2 seconds
        setInterval(function(){
          emitComment();
        }, 2000);

        // get comments every 5 seconds
        setInterval(function() {
          if (comments.length == 0) return;
          getRandomComments(10);
        }, 5000);

				$('.list img').on('click',function(){
					$('.layer').show().children('img').attr('src',$(this).attr('src'))
					$('.layer').on('click',function(){
						$(this).hide();
					});
				});
    };

    // show big image
		var name = _getToken(d, "username"),
			  img = _getToken(d, "picurl");
		if (name == "") name = "app用户";
		if (img == "") img = "http://60.190.176.70:11001/images/xinlanUser/2.jpg";
		getUserinfoCb(name, img);

	};

	var only_for_user = true;
	_wxzs({
		"callback": h5_cb,
		"_callAjax": _genCallAjax("http://60.190.176.70:11002/xinlan/")
	}, only_for_user);
});
