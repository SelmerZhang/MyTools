/**
 * 闭包的形式封装了QR工具界面的对象,外部只能访问到init()函数初始化工具页面
 * @param  {string} mainId 
 * @return {[fn]}   页面初始化函数,向mainId指定的div注入页面html代码,绑定事件,以及其他操作
 */
function createQrPage(mainId) {
	//二维码插件的操作对象
	let qrCode = null;

	//界面
	let page =
		'<div class="board">' +
		'	<input type="text" id="str" value="" placeholder="输入内容转为二维码" style="height: 24px;width: 190px;"/>' +
		'	<button id="btn" class="button button-primary button-rounded button-small" style="padding: 0 16px;">转换</button>' +
		'</div>' +
		//这里必须提前给好宽高,否则qrcode.js生成二维码慢的话,在页面显示的时候可能还没有生成二维码,也就无法把页面正确撑开
		'<div class="board" style="height:256px;">' +
		'	<div id="qrcode"></div>' +
		'</div>';

	/**
	 * 将用户输入的字符串转为二维码
	 */
	function createCode() {
		let str = $('#str').val();
		setPic(str);
	}
	/**
	 * 用户按下回车键,将用户输入的字符串转为二维码
	 * @param  {object} event 事件
	 */
	function pressEnter(event) {
		let keycode = event.keyCode;
		if (keycode == 13) {
			createCode();
		}
	}
	/**
	 * 设置二维码图片
	 * @param {string} str 要转为二维码的字符串
	 */
	function setPic(str) {
		if (str == null || str == '') return;
		if (qrCode == null) {
			qrCode = new QRCode(document.getElementById('qrcode'), {
				width: 256,
				height: 256,
				colorDark: '#000000',
				colorLight: '#ffffff',
				correctLevel: QRCode.CorrectLevel.H
			});
		}
		qrCode.clear(); // 清除代码
		qrCode.makeCode(str); // 生成另外一个二维码
	}

	/**
	 * 初始化入口
	 */
	function init() {
		//向div#main注入页面html代码
		$('#' + mainId).html(page).width(276);
		//绑定转换按钮点击事件
		$('#btn').click(createCode);
		//绑定输入框回车事件
		$('#str').keydown(pressEnter);

		//生成当前标签路径的二维码
		chrome.tabs.getSelected(null, function(tab) {
			setPic(tab.url);
		});
	}

	return init;
}