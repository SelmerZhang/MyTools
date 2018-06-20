//配置主菜单
//type[必填]:
//	1.page,菜单文字后面会自动追加'...':
//		title[选填]页面的标题,不指定则使用菜单name作为标题
//		pageInit[必填]页面初始化函数,需要传入page页面注入的目标DIV的ID,调用格式:pageInit('main')()
//	2.hr,菜单分割线
//	3.fn直接调用do指定的函数
//	4.tab在新的tab页显示页面:
//		path[必填]新标签页的路径,标签页默认在./page/tabs/ 下,这里只需要补充剩余路径
//name[选填]:菜单内文字
//key[选填]:菜单的键盘快捷键
//icon[选填]:菜单的小图标
var menu = [{
	type: 'page',
	name: '二维码转换',
	key: 'e',
	icon: 'scan',
	title: '二维码转换',
	pageInit: createQrPage
}, {
	type: 'hr'
}, {
	type: 'fn',
	name: '跳到页首',
	key: '1',
	icon: 'xiangshangjiantou',
	do: toTop
}, {
	type: 'fn',
	name: '跳到页尾',
	key: '2',
	icon: 'xiangxiajiantou',
	do: toBottom
}, {
	type: 'hr'
}, {
	type: 'tab',
	name: '英文大小写转换',
	key: 't',
	icon: 'edit',
	path: 'en-utils.html'
}, {
	type: 'tab',
	name: 'SQL转实体类',
	key: 's',
	icon: 'reload',
	path: 'qtc.html'
}]

/*------------------------------菜单初始化 开始------------------------------*/
$(function() {
	initMenu();

	//点击page左上角按钮关闭页面
	$('#head_btn_back').click(function(event) {
		//只处理鼠标左键点击
		if (event.which != 1) return;
		//显示主菜单
		$('#menu').removeClass('hide');
		//重新绑定菜单快捷键
		setMenuKeyMap();

		//移除页面主界面代码
		$('#main').children().remove();
		//隐藏页面
		$('#page').addClass('hide');
	});
});

/**
 * 初始化主菜单
 */
function initMenu() {
	let $m = $('#menu');
	$(menu).each(function(i, e) {
		let $li = initLi(e);
		$m.append($li);
	});
	setMenuKeyMap();
}

/**
 * 配置菜单中的一行
 * @param  {object} e li配置
 * @return {object}   li的jQuery对象
 */
function initLi(e) {
	let $li = $('<div></div>');

	//1.处理样式
	//分割线直接结束处理
	if (e.type == 'hr') {
		$li.addClass('hr');
		return $li;
	}

	$li.addClass('li');

	//2.处理内容
	let name = e.name;
	//有快捷键加快捷键提示
	if ('key' in e) name += '(' + (e.key + '').toUpperCase() + ')';
	//打开新页面加'...'提示
	if (e.type == 'page') name += '...';
	// 有icon则增加icon,没有icon放空span占位
	if ('icon' in e) {
		name = '<i class="space iconfont icon-' + e.icon + '"></i>' + name;
	} else {
		name = '<span class="space-noicon"></span>' + name;
	}
	$li.html(name);

	//3.绑定点击事件
	$li.click(function(event) {
		//只处理鼠标左键点击
		if (event.which != 1) return;
		menuEvent(e);
	});

	return $li;
}

/**
 * 设置菜单快捷键
 */
function setMenuKeyMap() {
	$('html').keypress(function(event) {
		$(menu).each(function(i, e) {
			if ((e.key + '').toUpperCase() == (event.key + '').toUpperCase()) {
				menuEvent(e);
				//只响应第一个匹配的快捷键,避免错误配置了重复的快捷键
				return false;
			}
		});
	});
}

/**
 * 统一处理菜单点击和菜单快捷键事件,根据菜单不同类型执行不同操作
 * @param  {[type]} e 菜单项配置
 */
function menuEvent(e) {
	if (e.type == 'page') {
		//加载小页面
		loadPage(e);
	} else if (e.type == 'tab') {
		//新标签页打开
		openTab(e);
	} else if (e.type == 'fn') {
		// 执行脚本
		e.do();
	}
}

/*------------------------------page类菜单 开始------------------------------*/
/**
 * 载入功能页面
 * @param  {object} e 页面配置
 */
function loadPage(e) {
	//处理主菜单
	//隐藏菜单
	$('#menu').addClass('hide');
	//移除菜单快捷键
	$('html').unbind('keypress');

	//加载页面
	//调用页面初始化函数向div#main注入页面代码,绑定事件,以及其他操作
	e.pageInit('main')();

	//显示
	$('#page').removeClass('hide');

	//设置页面标题
	$('#head_title')
		//标题宽度 = div#main界面宽度 - a#head_btn_back返回按钮宽度 - a#head_btn_op菜单按钮宽度 - 左右两侧padding
		.width(
			$('#main').width() -
			$('#head_btn_back').width() -
			$('#head_btn_op').width() -
			replace($('#head').css('padding-left'), /[^\d.]/g, '') -
			replace($('#head').css('padding-right'), /[^\d.]/g, '')
		)
		.text(('title' in e) ? e.title : e.name);
}

/**
 * 字符串替换,str为空时返回空字符串而不是报错
 * @param  {string} str    原字符串
 * @param  {regexp/substr} reg    正则表达式
 * @param  {string} newStr 替代匹配部分字符串
 * @return {string}        替换后字符串/空字符串
 */
function replace(str, reg, newStr) {
	if (!str || typeof str != 'string') return '';
	return str.replace(reg, newStr);
}

/*------------------------------page类菜单 结束------------------------------*/

/*------------------------------tab类菜单 开始------------------------------*/


function openTab(e) {
	chrome.tabs.create({
		index: 0,
		url: '../page/tabs/' + e.path,
	}, (tab) => {
		window.close;
	});
}



/*------------------------------tab类菜单 结束------------------------------*/

/*------------------------------fn类菜单 开始------------------------------*/

/**
 * 跳到页首,成功则关闭popup页面
 */
function toTop() {
	sendMsgToContent({
		to: 'top'
	}, window.close);
}

/**
 * 跳到页末,成功则关闭popup页面
 */
function toBottom() {
	sendMsgToContent({
		to: 'bottom'
	}, window.close);
}
/*------------------------------fn类菜单 结束------------------------------*/
/*------------------------------菜单初始化 结束------------------------------*/

/*------------------------------工具函数 开始------------------------------*/
/**
 * 向页面发送跳转信息
 * @param  {object} msg 发送给页面的消息
 * @param  {Function} callback 页面返回成功后回调函数
 */
function sendMsgToContent(msg, callback) {
	msg.request = 'content';
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, msg, function(response) {
			if (typeof response != 'undefined') {
				callback();
			}
		});
	});
}
/*------------------------------工具函数 结束------------------------------*/