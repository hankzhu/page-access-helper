var HTTP = require('http'),
	//HTTPS = require('https'),
	URL = require('url'),
	FS = require('fs'),
	FORM = require('./formidable');

var textUtil = {
	stringToArray : function(str){
		if(!str){
			return [];
		}
		return str.split(',');
	},
	testPattern : function(str, pattern){
		var tmp = pattern.length - 1;
		if(pattern.charAt(0) == '^'){
			if(pattern.charAt(tmp) == '$'){ //整句匹配
				return str == pattern.substring(1, tmp);
			}
			return str.substr(0, tmp) == pattern.substr(1);
		}else if(pattern.charAt(tmp) == '$'){
			return str.substr(str.length - tmp) == pattern.substr(0, tmp);
		}else{
			return ~str.indexOf(pattern);
		}
	}
}

var responseData = function(data, res){
	res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
	res.end(data);
}
var responseError = function(code, res){
	res.writeHead(code, {'Content-Type': 'text/html; charset=utf-8'});
	res.end('亲, ' + code + '额~');
}

var cache = {};
var cache_12306 = FS.readFileSync(__dirname+'/special/12306.user.js');
var EXT_TO_TYPE_MAP = {
	'js':'application/javascript; charset=utf-8',
	'html':'text/html; charset=utf-8',
	'png':'image/png',
	'ico':'image/vnd.microsoft.icon'
};
var responseFile = function(path, ext, res){
	if(arguments.length == 2){
		res = ext;
		ext = path.split('.').pop();
	}
	var file = cache[path];
	if(file){
		res.writeHead(200, {'Content-Type': file.type, 'Cache-Control': 'max-age=60'});
		res.end(file.data);
	}else{
		FS.readFile(path, function(err, data){
			if(err){
				responseError(404, res);
				return;
			}
			file = {
				type: EXT_TO_TYPE_MAP[ext] || 'text/plain',
				data: data
			};
			cache[path] = file;
			res.writeHead(200, {'Content-Type': file.type, 'Cache-Control': 'max-age=60'});
			res.end(file.data);
		});
	}
};
var responseFileWithoutHeader = function(path, ext, res){
	if(arguments.length == 2){
		res = ext;
		ext = path.split('.').pop();
	}
	var file = cache[path];
	if(file){
		res.end(file.data);
	}else{
		FS.readFile(path, function(err, data){
			if(err){
				res.end();
				return;
			}
			file = {
				type: EXT_TO_TYPE_MAP[ext] || 'text/plain',
				data: data
			};
			cache[path] = file;
			res.end(file.data);
		});
	}
};

var saveExtRules = function(res){
	data = '';
	for(var i = 0, len = extRules.length; i < len; i++){
		var rule = extRules[i];
		data += rule.name + '|' + encodeURIComponent(rule.domain.join(',')) + '|' + '' + '|' + encodeURIComponent(rule.keyword.join(',')) + '|' + '' + '|' + rule.path + '\n';
	}
	FS.writeFile('rules.tmp', data, function(err){
		if(err){
			console.info('write rules error');
			responseError(500, res);
			return;
		}
		try{
			FS.renameSync('rules.txt', 'rules.bak');
		}catch(e){
			console.info(e);
		}
		try{
			FS.renameSync('rules.tmp', 'rules.txt')
		}catch(e){
			console.info(e);
			try{
				FS.renameSync('rules.bak', 'rules.txt'); //发生错误了, 把拿回来
			}catch(e2){
			}
			responseError(500, res);
			return;
		}
		responseData('提交成功', res);
	});
};


var checkRule = function(url, keyword, rule){
	url = url.replace(/https?\:\/\//i, '');
	if(rule.domain.length){
		var flag = false;
		var arr = rule.domain;
		for(var i = 0, len = arr.length; i < len; i++){
			if(textUtil.testPattern(url, arr[i])){
				flag = true;
				break;
			}
		}
		if(!flag){
			return false;
		}
	}
	if(rule.domain_black.length){
		var arr = rule.domain_black
		for(var i = 0, len = arr.length; i < len; i++){
			if(textUtil.testPattern(url, arr[i])){
				return false;
			}
		}
	}
	if(rule.keyword.length){
		var flag = false;
		var arr = rule.keyword;
		for(var i = 0, len = arr.length; i < len; i++){
			if(textUtil.testPattern(keyword, arr[i])){
				flag = true;
				break;
			}
		}
		if(!flag){
			return false;
		}
	}
	if(rule.keyword_black.length){
		var arr = rule.keyword_black;
		for(var i = 0, len = arr.length; i < len; i++){
			if(textUtil.testPattern(keyword, arr[i])){
				return false;
			}
		}
	}
	return true;
};

var accessPrefix = FS.readFileSync(__dirname+'/static/help.js');
var handlers = {
	'/access.js':function(req, res){
		var url = URL.parse(req.url, true);
		var refer = req.headers['referer'] || url.query.refer || 'none',
			type = url.query.type,
			keyword = url.query.keyword || '',
			path;
		console.info(refer,type,keyword);
		res.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'max-age=60'});
		res.write(accessPrefix);
		if(type && (path = TYPE_TO_FILE_PATH[type])){ //强制命中
			responseFileWithoutHeader(path, res);
		}else{
			for(var i = 0, len = extRules.length; i < len; i++){
				if(checkRule(refer, keyword, extRules[i])){
					console.info('rule detected: ' + extRules[i].name);
					responseFileWithoutHeader(extRules[i].path, res);
					return;
				}
			}
			for(var i = 0, len = innerRules.length; i < len; i++){
				if(checkRule(refer, keyword, innerRules[i])){
					console.info('rule detected: ' + innerRules[i].name);
					//12306 把通用代码合并进来
					if(innerRules[i].name == '12306'){
						res.write(';\n/*12306.user.js merge by node*/\n');
						res.write(cache_12306);
						res.write(';\n/*common.js merge by node*/\n');
						responseFileWithoutHeader(TYPE_TO_FILE_PATH['common'], res);
					}else{
						responseFileWithoutHeader(innerRules[i].path, res);
					}
					return;
				}
			}
			console.info('no rule match, use default');
			responseFileWithoutHeader(TYPE_TO_FILE_PATH['common'], res);
		}
	},
	'/post':function(req, res){
		if(req.method.toUpperCase() == 'POST'){
			var form = new FORM.IncomingForm();
			form.uploadDir = __dirname+'/tmp';
			form.parse(req, function(err, fields, files){
				if(err){
					console.info('parse form error');
					responseError(500, res);
					return;
				}
				if(!files.file || !/^\w+$/.test(fields.name) || 
					(/![^\s\,]/.test(fields.keyword) && /![^\s\,]/.test(fields.keyword_black) &&
						/![^\s\,]/.test(fields.domain) && /![^\s\,]/.test(fields.domain_black))){
					console.info('check form error', {fields: fields, files: files});
					responseError(403, res);
					return;
				}
				var path = __dirname+'/rules/' + Date.now() + '_' + Math.floor(Math.random()*1000);
				FS.rename(files.file.path, path, function(err){
					if(err){
						console.info('save script error',err);
						responseError(500, res);
						return;
					}
					extRules.unshift({
						name : fields.name,
						keyword : textUtil.stringToArray(fields.keyword),
						keyword_black : textUtil.stringToArray(fields.keyword_black),
						domain : textUtil.stringToArray(fields.domain),
						domain_black : textUtil.stringToArray(fields.domain_black),
						path : path
					});
					saveExtRules(res);
				});
				/*res.writeHead(200, {'content-type': 'text/plain'});
				res.write('received upload:\n\n');
				res.end(util.inspect({fields: fields, files: files}));*/
			});
		}else{
			responseError(403, res);
		}
	}
};

//loadRules
var TYPE_TO_FILE_PATH = {
	'common':__dirname+'/common/PAHelper.Common.js'
};
var innerRules = [{
	name : 'news',
	domain : ['^news.','^finance.'],
	domain_black : ['/$','/index'],
	keyword : ['new','新闻','finance','财经'],
	keyword_black : [],
	path : __dirname+'/readability/access-helper.js'
},{
	name : '12306',
	domain : ['12306.cn'],
	domain_black : [],
	keyword : [],
	keyword_black : [],
	path : __dirname+'/special/12306.user.js'
}];
var extRules = [];
try{
	var rules = FS.readFileSync('rules.txt', {encoding:'utf-8'});
	var arr = rules.split(/[\n\r]+/);
	for(var i = 0, len = arr.length; i < len; i++){
		var arr2 = arr[i].split('|');
		if(arr2.length == 6){
			extRules.push({
				name : arr2[0],
				domain : textUtil.stringToArray(decodeURIComponent(arr2[1])),
				domain_black : textUtil.stringToArray(decodeURIComponent(arr[2])),
				keyword : textUtil.stringToArray(decodeURIComponent(arr2[3])),
				keyword_black : textUtil.stringToArray(decodeURIComponent(arr[4])),
				path : arr2[5]
			});
		}
	}
}catch(e){}
for(var i = 0, len = extRules.length; i < len; i++){
	var rule = extRules[i];
	TYPE_TO_FILE_PATH[rule.name] = rule.path;
}
for(var i = 0, len = innerRules.length; i < len; i++){
	var rule = innerRules[i];
	TYPE_TO_FILE_PATH[rule.name] = rule.path;
}

//startServer
process.on('uncaughtException', function (err) {
	console.log('Caught exception: ' + err);
});
HTTP.createServer(function (req, res) {
	var url = URL.parse(req.url);
	console.info('http request:' + url.path);
	var handler = handlers[url.pathname];
	if(handler){
		handler(req, res);
	}else{
		responseFile(__dirname+'/static/'+url.pathname, res);
	}
}).listen(12005);
console.log('Server running at http://127.0.0.1:12005/');

/*HTTPS.createServer({
	key: FS.readFileSync('ssl.key'),
	cert: FS.readFileSync('ssl.csr')
}, function (req, res) {
	var url = URL.parse(req.url);
	console.info('https request:' + url.path);
	if(url.pathname=='/access.js'){
		handlers['/access.js'](req, res);
	}else{
		responseError(404, res);
	}
}).listen(443);*/