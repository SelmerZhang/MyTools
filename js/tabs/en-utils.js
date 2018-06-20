/**
 * 初始化入口
 */
$(function() {
	//绑定转换按钮点击事件
	$('#enBtn1').click(turnUpper);
	$('#enBtn2').click(turnLower);
	$('#enBtn3').click(ucfirst);
	$('#enBtn4').click(humpOrUnderline);
});

function turnUpper() {
	let str = $('#enStr').val();
	if (!str || typeof str != 'string' || str == '') return;
	$('#enStr').val(str.toUpperCase());
}

function turnLower() {
	let str = $('#enStr').val();
	if (!str || typeof str != 'string' || str == '') return;
	$('#enStr').val(str.toLowerCase());
}

function ucfirst() {
	let str = $('#enStr').val();
	if (!str || typeof str != 'string' || str == '') return;
	if (str && typeof str == 'string' && str != '') {
		str = str.toLowerCase();
		str = str.replace(/\b\w+\b/g, function(word) {
			return word.substring(0, 1).toUpperCase() + word.substring(1);
		});
		$('#enStr').val(str);
	}
}

function humpOrUnderline() {
	let str = $('#enStr').val();
	if (!str || typeof str != 'string' || str == '') return;
	//有下划线则转驼峰,无下划线则转下划线
	if (/\_/.test(str)) {
		str = turnHump(str);
	} else {
		str = turnUnderline(str);
	}
	$('#enStr').val(str);
}

function turnHump(str) {
	let arr = str.toLowerCase().split('');
	let turnUp = false;
	let out = '';
	for (var i = 0; i < arr.length; i++) {
		let c = arr[i];
		if (turnUp) {
			turnUp = false;
			c = c.toUpperCase();
		}

		if (c == '_') {
			turnUp = true;
		} else {
			out += c;
		}
	}
	return out;
}

function turnUnderline(str) {
	let arr = str.split('');
	let out = '';
	for (c of arr) {
		if (isUpperCase(c)) out += '_';
		out += c;
	}
	return out.toUpperCase();
}

function isUpperCase(ch) {
	return ch >= 'A' && ch <= 'Z'
}

function isLowerCase(ch) {
	return ch >= 'a' && ch <= 'z'
}