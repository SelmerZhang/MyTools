/**
 * 按钮图标宽度
 * @type {Number}
 */
const toTopBtnWidth = 50;
/**
 * 按钮图标高度
 * @type {Number}
 */
const toTopBtnHeight = 50;
/**
 * 按钮图标ID
 * @type {String}
 */
const btnId = '#to_top_btn';

/**
 * 全局变量,记录当前窗口的尺寸
 * @type {Object}
 */
var win = {
	'width': 0,
	'height': 0
};

/**
 * 全局变量,记录当前鼠标的状态
 * @type {Object}
 */
var mouse = {
	'isPressed': false,
	//鼠标相对于按钮容器的X坐标偏移量
	'offsetX': 0,
	//鼠标相对于按钮容器的Y坐标偏移量
	'offsetY': 0,
	'pageX': 0,
	'pageY': 0
};

/**
 * 全局变量,记录按钮的相对坐标
 * @type {Object}
 */
var div = {
	'left': 0,
	'top': 0
};

$(function() {

	//响应后台消息
	chrome.extension.onMessage.addListener(getPlugMsg);

	//初始化参数
	initParam();

	//初始化按钮
	initBtn();

	//绑定窗口事件
	$(window).scroll(toggleBtnByScrollTop).resize(setoffBtnOnWindowResize);

	//在整个body监控鼠标事件,根据mouse.isPressed属性判断是否移动按钮容器
	$('body').mouseup(stopMoveBtn).mousemove(moveBtn);

});

/**
 * 初始化全局参数
 */
function initParam() {
	//记录当前窗口尺寸
	win = {
		'width': $(window).width(),
		'height': $(window).height()
	};

	//记录当前按钮坐标,初始化时使用窗口尺寸-容器尺寸计算得到
	div = {
		'left': win.width - toTopBtnWidth,
		'top': win.height - toTopBtnHeight
	};
}

/**
 * 初始化按钮容器
 * @return {[type]} [description]
 */
function initBtn() {
	//向页面插入按钮容器
	let btn = '<div id="' + btnId.replace('#', '') + '" title="点我跳转到页首，按住左键拖动图标位置"></div>';
	$('body').append(btn);

	//根据初始化坐标确定按钮位置
	$(btnId).css(div);

	//引入插件图片资源作为按钮容器的背景
	let upUrl = chrome.extension.getURL('img/up.png');
	let upJpverUrl = chrome.extension.getURL('img/up_hover.png');
	$(btnId).css({
		'background-image': 'url(' + upUrl + ')',
		'width': toTopBtnWidth + 'px',
		'height': toTopBtnHeight + 'px',
	});
	//鼠标滑过时显示更醒目的图片
	$(btnId).hover(function() {
		$(btnId).css({
			'background-image': 'url(' + upJpverUrl + ')'
		});
	}, function() {
		$(btnId).css({
			'background-image': 'url(' + upUrl + ')'
		});
	});

	//为按钮容器绑定事件
	$(btnId).click(clickBtnByLeft).mousedown(startMoveBtn);

	//因为刷新页面不会改变页面滑动位置,这里初始化时判断一次是否需要显示跳转按钮
	toggleBtnByScrollTop();
}
/**
 * 根据页面滑动情况判断是否需要显示跳转按钮,只有当页面下划时才显示按钮
 */
function toggleBtnByScrollTop() {
	if ($(window).scrollTop() > 0) {
		$(btnId).show();
	} else {
		$(btnId).hide();
	}
}

/**
 * 根据窗口尺寸变化调整按钮相对坐标
 */
function setoffBtnOnWindowResize() {
	div.left = $(window).width() - win.width + div.left;
	div.left = div.left > 0 ? div.left : 0;
	div.top = $(window).height() - win.height + div.top;
	div.top = div.top > 0 ? div.top : 0;

	$(btnId).css(div);

	win = {
		'width': $(window).width(),
		'height': $(window).height()
	};
}

/**
 * 左键单击按钮容器,页面跳转到页首
 * @param  {[object]} event 事件对象
 */
function clickBtnByLeft(event) {
	console.log(event)
	let data = $(btnId).data();
	if (event.which == 1 && !data.isPressed && (mouse.pageX == event.pageX && mouse.pageY == event.pageY)) {
		scrollTo(0, 0);
	}
}

/**
 * 在按钮容器上按下鼠标右键,开始移动按钮坐标,这里实际上只是初始化了mouse对象的状态,用于在全局的mousemove事件中移动按钮
 * @param  {[object]} event 事件对象
 */
function startMoveBtn(event) {
	if (event.which == 1) {
		mouse = {
			'isPressed': true,
			'offsetX': event.offsetX,
			'offsetY': event.offsetY,
			'pageX': event.pageX,
			'pageY': event.pageY
		};
	}
}

/**
 * 停止移动按钮坐标
 * @param  {[object]} event 事件对象
 */
function stopMoveBtn(event) {
	if (event.which == 1 && mouse.isPressed) {
		mouse.isPressed = false;
	}
}

/**
 * 移动按钮坐标
 * @param  {[object]} event 事件对象
 */
function moveBtn(event) {
	if (event.which == 1 && mouse.isPressed) {
		let x = event.clientX - mouse.offsetX;
		let y = event.clientY - mouse.offsetY;

		let maxWidth = $(window).width() - toTopBtnWidth;
		let maxHeight = $(window).height() - toTopBtnHeight;

		div.left = x > maxWidth ? maxWidth : x < 0 ? 0 : x;
		div.top = y > maxHeight ? maxHeight : y < 0 ? 0 : y;

		$(btnId).css(div);
	}
}

/**
 * 接收插件发来的消息
 * @param  {object} msg          收到的消息
 * @param  {[type]} sender       发送者
 * @param  {function} sendResponse 返回消息给发送者
 */
function getPlugMsg(msg, sender, sendResponse) {
	//只处理发送给当前页面的消息
	if (!('request' in msg) || msg.request != 'content') return;
	//收到跳转指令,则跳转到页面指定位置
	if ('to' in msg) {
		scrollToByMsg(msg.to);
	}
	sendResponse();
}
/**
 * 收到跳转指令,则跳转到页面指定位置
 * @param  {string} to 页面跳转方向的字符串
 */
function scrollToByMsg(to) {
	//收到跳转指令,则跳转到页面指定位置
	if (to == 'top') {
		scrollTo(0, 0);
	} else if (to == 'bottom') {
		scrollTo(0, $('body')[0].scrollHeight);
	}
}