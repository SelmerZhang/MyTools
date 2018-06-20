/**
 * 初始化入口
 */
$(function() {
	//绑定转换按钮点击事件
	$('#change').click(change);
});
/**
 * 用户输入的SQL语句转class代码并显示
 */
function change() {
	let sql = $('#sql').val();
	let table = parseSql(sql);
	if (table) $('#code').val(createCode(table));
}

/**
 * 将SQL语句解析成一个table对象
 */
function parseSql(str) {

	//移除注释行
	let lines = str.split(/\r?\n/);
	let i = lines.length;
	while (i--) {
		if (lines[i].startsWith('--') || lines[i].trim() == '') lines.splice(i, 1);
	}
	str = lines.join('');

	// 处理每条SQL语句
	let sqls = str.toUpperCase().trim().replace(/\n/g, '').replace(/[\'|\"]/g, '').split(';');
	let table = {
		tableName: '',
		className: '',
		params: []
	}

	let noCreateTableSQL = true;
	for (sql of sqls) {
		if (!sql || sql.trim() == '') continue;
		if (sql.startsWith('CREATE TABLE')) {
			parseTable(sql, table);
			noCreateTableSQL = false;
		}

	}

	if (noCreateTableSQL) {
		alert('没有检测到建表语句,解析失败!');
		return;
	}

	for (sql of sqls) {
		if (sql.startsWith('COMMENT ON COLUMN')) {
			parseComment(sql, table);
		} else if (sql.indexOf('ADD PRIMARY KEY') > 0) {
			parsePK(sql, table);
		}
	}
	return table;
}

/**
 * 解析表结构
 */
function parseTable(sql, table) {
	table.tableName = sql.substring(sql.indexOf('.') + 1, sql.indexOf('(')).trim();
	table.className = parseName(table.tableName, true);

	let arr = sql.match(/\((.+)\)/)[1].split(',');

	for (let column of arr) {
		let columnName = column.trim().substring(0, column.indexOf(' '));
		let paramName = parseName(columnName);

		table.params.push({
			paramName: paramName,
			columnName: columnName
		});
	}
}
/**
 * 解析注释行
 */
function parseComment(sql, table) {
	sql = sql.trim();
	let paramName = sql.substring(sql.lastIndexOf('.') + 1, sql.lastIndexOf(' IS'));
	paramName = parseName(paramName);

	let comment = sql.substring(sql.lastIndexOf('IS ') + 3, sql.length);

	for (param of table.params) {
		if (param.paramName == paramName) {
			param.comment = comment;
			break;
		}
	}
}
/**
 * 解析主键行
 */
function parsePK(sql, table) {
	let columnName = sql.trim().match(/\((.+)\)/)[1];
	for (param of table.params) {
		if (param.columnName == columnName) {
			param.isPK = true;
			break;
		}
	}
}

function parseName(name, firstUp) {
	let arr = name.toLowerCase().split('');
	let turnUp = false;
	let out = '';
	for (var i = 0; i < arr.length; i++) {
		let c = arr[i];
		//如果要求首字母大写,则要考虑,首位可能不是子母,需要顺延下一位,直到匹配到第一个子母
		if (firstUp && /[a-zA-Z]/.test(c)) {
			c = c.toUpperCase();
			firstUp = false;
		} else if (turnUp) {
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

let bodyModel =
	'import javax.persistence.*;\n' +
	'import com.dragonsoft.duceap.core.persistent.entity.IdEntity;\n' +
	'/**\n' +
	' * \n' +
	' */\n' +
	'@Entity\n' +
	'@Table(name = "[table]")\n' +
	'public class [className] implements IdEntity<String>' +
	'{\n' +
	'    /** 序列化版本号 */\n' +
	'    private static final long serialVersionUID = 1L;\n\n' +
	'[params]\n' +
	'[fns]}';

let paramModel =
	'    /** [comment] */\n' +
	'[primaryKey]' +
	'    @Column(name = "[column]")\n' +
	'    private String [paramName];\n\n';

let fnModel =
	'    /** 获取[comment] */\n' +
	'    public String get[fnName]() {return [paramName];}\n\n' +
	'    /** 设置[comment] */\n' +
	'    public void set[fnName](String [paramName]) {this.[paramName] = [paramName];}\n\n';
/**
 * 根据table对象的属性组装class代码
 * @param  {[type]} table [description]
 * @return {[type]}       [description]
 */
function createCode(table) {
	let code = bodyModel.replace('[table]', table.tableName).replace('[className]', table.className);
	let params = '';
	let fns = '';
	console.log(table);
	for (param of table.params) {
		let columnName = param.columnName;
		let paramName = param.paramName;
		let fnName = paramName.replace(paramName.charAt(0), paramName.charAt(0).toUpperCase());
		let comment = param.comment;

		let pm = paramModel.replace(/\[column\]/g, columnName).replace(/\[comment\]/g, comment ? comment : '');
		let fm = fnModel.replace(/\[comment\]/g, comment ? comment : '');

		//主键统一叫id
		if (param.isPK) {
			pm = pm.replace(/\[paramName\]/g, 'id').replace(/\[primaryKey\]/g, '    @Id\n');
			fm = fm.replace(/\[paramName\]/g, 'id').replace(/\[fnName\]/g, 'Id');
		} else {
			pm = pm.replace(/\[paramName\]/g, paramName).replace(/\[primaryKey\]/g, '');
			fm = fm.replace(/\[paramName\]/g, paramName).replace(/\[fnName\]/g, fnName)
		}
		params += pm;
		fns += fm;
	}

	return code.replace('[params]', params).replace('[fns]', fns);
}