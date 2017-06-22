import '../css/tabcms.css';

(function ($) {
    var artTabs = function (config) {
        config = $.extend(true, {}, artTabs.defaults, config);
        config.$tabList = $('#' + config.id, top.document).find('div.m-tab-list');
        config.$tabCon = $('#' + config.id, top.document).find('div.m-tabCon');
        config.height = parseInt($('.m-container').css('paddingTop')) + $('.m-tab-list').height();
        return new artTabs.fn._init(config);
    };
    artTabs.idArray = [];
    artTabs.fn = artTabs.prototype = {
        _init: function (config) {
            var that = this;
            that.config = config;
            if ($('#' + that.config.id + 'Menu', top.document).hasClass('m-menu')) {
                var curId = that._curId();	//当前操作iframe的Id
                if (config.addTab) {        //iframe中新增tab页(新增跟修改是同一个意思，只是修改的话需要刷新)
                    that._addIframe(config.addTab.items);
                    if (config.isRefresh) {
                        that._refreshIframe(config.addTab.items);
                    }
                } else if (config.toTab) {     //iframe中跳转指定Id的tab页
                    that._toIframe(config.toTab.id);
                    if (config.isRefresh) {
                        that._refreshIframe(config.toTab.id);
                    }
                } else if (config.closeTab) {      //iframe中纯粹关闭当前页，默认跳转到上一页
                    that._prevShow(curId);
                    that._closeIframe(curId);
                } else if (config.isRefresh) {     //iframe中纯粹刷新当前页，在导航上已有此功能，一般不需要这样调用
                    that._refreshIframe(curId);
                }
                return;
            } else {
                that._getMenu(config);      //加载导航
                that._menuOperate(config);  //导航操作
                that._closeBox();			//绑定li里面a标签的关闭
                that._tabToggle();			//绑定li的切换
                that._nextPrev();			//左右切换
                that._getRighthand();		//绑定li的右键菜单
                that._resize();				//高度自适应
            }
            return that;
        },

        _getMenu: function (config) {
            var data = config.data;
            var _wrap = $('<div id="' + config.id + 'Nav" class="m-nav-sub"></div>');
            var _menu = $('<h4>菜单</h4>');
            var _ul = $('<ul class="thin-scroll"></ul>');
            $(data).each(function (i) {
                var _creatLi = '';
                if (data[i].url) {
                    _creatLi = $('<li><a id="' + data[i].id + '" href="' + data[i].url + '"><span>' + data[i].title + '</span></a></li>');
                } else {
                    _creatLi = $('<li><a href="javascript:"><span>' + data[i].title + '</span></a></li>');
                }
                var _subUl = $('<ul class="m-sub-ul"></ul>');
                var _subLi = '';
                $(data[i].items).each(function (j) {
                    _subLi += '<li><a id="' + data[i].items[j].id + '" href="' + data[i].items[j].url + '"><span>' + data[i].items[j].title + '</span></a></li>';
                });
                _subUl.append(_subLi);
                _creatLi.append(_subUl);
                _ul.append(_creatLi);
            });
            _wrap.append(_menu);
            _wrap.append(_ul);
            $('#' + config.id).before(_wrap);
            $('#' + config.id + 'Nav', top.document).children('ul').css({'overflow-y': 'auto'}).height($(window).height() - parseInt($('.m-container').css('paddingTop')) - _menu.outerHeight(true));
            $('#' + config.id, top.document).find('div.m-tabCon').children('div').eq(0).css({'overflow': 'auto'}).height($(window).height() - config.height);
            return this;
        },
        _menuOperate: function (config) {
            var that = this;
            var _li = $('#' + config.id + 'Nav').find('li');

            //导航效果
            if (_li.has('ul')) {
                _li.off('click.li').on('click.li', function () {
                    $(this).toggleClass('open').children('ul').slideToggle(200);
                });
            }

            //打开窗口
            _li.each(function () {
                var _a = $(this).children('a');
                if (_a.attr('href') !== 'javascript:') {
                    _a.click(function () {
                        var itemData = {};
                        itemData.url = $(this).attr('href');
                        itemData.title = $(this).text();
                        itemData.id = $(this).attr('id');
                        itemData.height = $(window).height() - config.height;
                        if ($.inArray(itemData.id, artTabs.idArray) == -1) {
                            that._openIframe(itemData);
                            artTabs.idArray.push(itemData.id);      //给数组传值,记录tab的Id数
                        }
                        that._showTab(itemData.id);
                        return false;
                    })
                }
            });
            return that;
        },
        _openIframe: function (itemData) {
            var that = this;
            var _iframe = '';
            var _li = '';
            _iframe += '<div id="' + itemData.id + 'Con" style="height:' + itemData.height + 'px;" class="m-tab-content">' +
                '<iframe scrolling="auto" src="' + itemData.url + '" frameborder="0" class="m-frameCon"></iframe>' +
                '</div>';
            $('#' + that.config.id, top.document).find('div.m-tabCon').append(_iframe);
            _li += '<li id="' + itemData.id + 'list">' +
                '<span>' + itemData.title + '</span>' +
                '<a href="javascript:" class="m-tab-close"></a>' +
                '</li>';
            $('#' + that.config.id, top.document).find('div.m-tab-list').children('ul').append(_li);
            return that;
        },
        _closeBox: function () {
            var that = this;

            that.config.$tabList.off('click.closeTab').on('click.closeTab', 'a.m-tab-close', function () {
                var listId = $(this).closest('li').attr('id');
                var i = listId.indexOf('list');
                var tabId = listId.substring(0, i);
                var j = $.inArray(tabId, artTabs.idArray);
                artTabs.idArray.splice(j, 1);
                if ($(this).closest('li').hasClass('on')) {
                    that._prevShow(tabId);
                    that._removeTab(tabId);
                } else {
                    that._removeTab(tabId);
                }
            })
            return that;
        },
        _tabToggle: function () {
            var that = this;
            that.config.$tabList.off('click.delegateLi').on('click.delegateLi', 'ul li', function () {
                var listId = $(this).closest('li').attr('id');
                if (listId) {
                    var i = listId.indexOf('list');
                    var tabId = listId.substring(0, i);
                    that._showTab(tabId);
                } else {
                    that._showTab('');
                }
            });
            return that;
        },
        _resize: function () {
            var that = this;
            $(window).resize(function () {
                var _win = $(window).height();
                var _divHeight = _win - that.config.height;
                var _pt = parseInt($('.m-container').css('paddingTop'));
                var _navTitle = $('#' + that.config.id + 'Nav', top.document).children('h4').outerHeight(true);
                var _navHeight = _win - _pt - _navTitle;
                $('#' + that.config.id + 'Nav', top.document).children('ul').css({'overflow-y': 'auto'}).height(_navHeight);
                $('#' + that.config.id, top.document).find('div.m-tabCon').children('div').height(_divHeight);
            });
            return that;
        },
        _nextPrev: function () {
            var that = this;
            var _lt = $('<div class="m-tab-left"></div>');
            var _rt = $('<div class="m-tab-right"></div>');
            var $li = '';
            var left = 0;
            var v_wid = 120;
            $(document).off('click.prev').on('click.prev', '.m-tab-left', function () {
                if (left >= 0) {
                    return false;
                } else {
                    that.config.$tabList.children('ul').stop().animate({"left": left + v_wid});
                    left = left + v_wid;
                }
            });
            $(document).off('click.next').on('click.next', '.m-tab-right', function () {
                $li = that.config.$tabList.find('li');
                var getConWidth = that.config.$tabList.innerWidth();
                var getUlWidth = 0;
                for (var i = 0, l = $li.length; i < l; i++) {
                    getUlWidth = getUlWidth + $li.eq(i).outerWidth(true);
                }
                if (getUlWidth <= getConWidth) {
                    return false;
                } else if ((getUlWidth - Math.abs(left)) <= getConWidth) {
                    return false;
                } else {
                    that.config.$tabList.children('ul').stop().animate({"left": left - v_wid});
                    left = left - v_wid;
                }
            });
            that.config.$tabList.before(_lt);
            that.config.$tabList.before(_rt);
        },
        _getRighthand: function () {
            var that = this;

            if ($('#' + that.config.id + 'Menu', top.document).hasClass('m-menu')) {
                return;
            } else {
                var $contextmenu = $('<div id="' + that.config.id + 'Menu" class="m-menu"></div>');
                var _line = $('<div class="menu-line"></div>');
                var _sep = $('<div class="menu-sep"></div>');
                var _refresh = $('<div class="menu-item"><div class="menu-text">刷新</div></div>');
                var _close = $('<div class="menu-item"><div class="menu-text">关闭</div></div>');
                var _closeOther = $('<div class="menu-item"><div class="menu-text">关闭其他</div></div>');
                var _closeAll = $('<div class="menu-item"><div class="menu-text">关闭全部</div></div>');

                //刷新
                _refresh.off('click.refresh').on('click.refresh', function () {
                    var listId = that.config.$tabList.find('li').filter('.on').attr('id');
                    var i = listId.indexOf('list');
                    var tabId = listId.substring(0, i);
                    that._refreshIframe(tabId);
                    $contextmenu.hide();
                });

                //关闭当前
                _close.off('click.close').on('click.close', function () {
                    var listId = that.config.$tabList.find('li').filter('.on').attr('id');
                    var i = listId.indexOf('list');
                    var tabId = listId.substring(0, i);
                    var j = jQuery.inArray(tabId, artTabs.idArray);
                    artTabs.idArray.splice(j, 1);
                    that._prevShow(tabId);
                    that._removeTab(tabId);
                    $contextmenu.hide();
                });

                //全部关闭
                _closeAll.off('click.close').on('click.close', function () {
                    that.config.$tabList.find('li').not(':first').remove();
                    that.config.$tabCon.children('div').not(':first').remove();
                    that.config.$tabList.find('li:first').addClass('on');
                    that.config.$tabCon.children('div:first').show();
                    artTabs.idArray = [];
                    $contextmenu.hide();
                });

                //关闭除当前之外的TAB
                _closeOther.off('click.closeOther').on('click.closeOther', function () {
                    var listId = that.config.$tabList.find('li').filter('.on').attr('id');
                    var i = listId.indexOf('list');
                    var tabId = listId.substring(0, i);
                    var index = that.config.$tabList.find('li').filter('.on').index();
                    that.config.$tabList.find('li').each(function (i) {
                        if (i == 0 || i == index) {
                            //do something...
                        } else {
                            $(this).remove();
                        }
                    })
                    that.config.$tabCon.children('div').each(function (i) {
                        if (i == 0 || i == index) {
                            //do something...
                        } else {
                            $(this).remove();
                        }
                    })
                    artTabs.idArray = [];
                    artTabs.idArray.push(tabId);
                    $contextmenu.hide();
                });

                $contextmenu.append(_line).append(_refresh).append(_sep).append(_close).append(_closeOther).append(_closeAll);
                $('body').append($contextmenu);


                $(document).off('contextmenu').on('contextmenu', '.m-tab-list li', function (e) {
                    var listId = $(this).attr('id');
                    if (listId) {
                        var i = listId.indexOf('list');
                        var tabId = listId.substring(0, i);
                        that._showTab(tabId);
                        $contextmenu.show().css({'top': e.pageY - 2, 'left': e.pageX - 4});
                        return false;
                    } else {
                        that._showTab('');
                    }
                    return false;
                });

                $contextmenu.find('.menu-item').hover(function () {
                    $(this).addClass('menu-active');
                }, function () {
                    $(this).removeClass('menu-active');
                });
                $contextmenu.on('mouseleave', function () {
                    $(this).hide();
                })
            }
            return that;
        },
        _curId: function () {
            var that = this;
            var listId = that.config.$tabList.find('li').filter('.on').attr('id');
            var i = listId.indexOf('list');
            var tabId = listId.substring(0, i);
            return tabId;
        },

        _addIframe: function (itemData) {
            var that = this;
            itemData.height = that.config.$tabCon.children('div:first').height();
            if ($.inArray(itemData.id, top.artTabs.idArray) == -1) {
                that._openIframe(itemData);
                top.artTabs.idArray.push(itemData.id);
            }
            that._showTab(itemData.id);
            return that;
        },

        _toIframe: function (tabId) {
            var that = this;
            if ($.inArray(tabId, top.artTabs.idArray) == -1) {
                alert('指定ID= "' + tabId + '" 的页面不存在，请重新打开');
                return false;
            } else {
                that._showTab(tabId);
            }
            return that;
        },
        _closeIframe: function (tabId) {
            var that = this;
            //删除数据中的id
            var j = jQuery.inArray(tabId, top.artTabs.idArray);
            top.artTabs.idArray.splice(j, 1);
            that._removeTab(tabId);
        },

        _showTab: function (tabId) {
            var that = this;
            if (tabId) {
                $('#' + tabId + 'list', top.document).addClass('on').siblings().removeClass('on');
                $('#' + tabId + 'Con', top.document).show().siblings('div').hide();
            } else {
                $('#' + that.config.id, top.document).find('div.m-tab-list').children('ul').children('li:first').addClass('on').siblings().removeClass('on');
                $('#' + that.config.id, top.document).find('div.m-tabCon').children('div:first').show().siblings().hide();
            }
            return that;
        },
        _prevShow: function (tabId) {
            $('#' + tabId + 'list', top.document).prev().addClass('on');
            $('#' + tabId + 'Con', top.document).prev().show();
            return this;
        },
        _removeTab: function (tabId) {
            $('#' + tabId + 'list', top.document).remove();
            $('#' + tabId + 'Con', top.document).remove();
            return this;
        },


        _refreshIframe: function (itemData) {
            if (itemData.id) {
                $('#' + itemData.id + 'Con', top.document).find(".m-frameCon")[0].contentWindow.location.href = itemData.url;
            } else {
                $('#' + itemData + 'Con', top.document).find(".m-frameCon")[0].contentWindow.location.reload();
            }
            return this;
        }
    };

    artTabs.fn._init.prototype = artTabs.fn;
    $.fn.tabs = $.fn.artTabs = function () {
        var config = arguments;
        this[this.live ? 'live' : 'bind']('click', function () {
            artTabs.apply(this, config);
            return false;
        });
        return this;
    };

    /**
     * 默认配置
     * 说明：
     * 1.一个调用方法中不能同时出现addTab,toTab
     * 2.menu用于加载菜单数据,需要单独调用(后期扩展三级菜单或者更多)
     * 3.道理上来讲, closeTab跟isRefresh可以跟其他的同时一起调用
     */
    artTabs.defaults = {
        id: 'tabCms',
        data: null,			//导航数据
        addTab: null,		//新增tab页
        toTab: null,		//跳转到指定tab页
        closeTab: false,	//关闭当前tab页
        isRefresh: false
    };
    window.artTabs = $.tabs = $.artTabs = artTabs;
})(jQuery);