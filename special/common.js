(function(PAH){
	var $ = window.jQuery;
	//parse the original rules
	var parseRules = function(rules){
		var parseRules = {}, tmp, reg = /(\w{1,7}?)\[(\w{2,6}?)=([^\]]+)\]/;
		if(rules){
			for(var i in rules){
				tmpl = reg.exec(i);
				if(tmpl.length == 4){
					if(!parseRules[tmpl[1]]){
						parseRules[tmpl[1]] = [];
					}
					parseRules[tmpl[1]].push({
//						tagName : tmpl[1],
						attrName : tmpl[2],
//						attrVal : tmpl[3],
						title : rules[i].title,
						accesskey : rules[i].accesskey,
						attrVal : new RegExp(tmpl[3]),
						href : rules[i].href
					});
				}
			}
		}
		return parseRules;
	};

	var addTitle = function(dom, title){
		dom.setAttribute('title', title);
	};
	var addAccessKey = function(dom, keyVal){
		log(dom); log(keyVal);
		dom && dom.setAttribute('accesskey', keyVal || 'z');   //重要的功能键使用
	};

	var firstFocus = function(selector){
		var dom;
		if(selector){
			dom = $(selector);
			dom[0] && dom[0].focus();
		}
	};

	var addLabel = function(inputIds){
		if(inputIds){
			for(var i in config.labels){
				doms = $('#'+i);
				doms.after('<label for="'+i+'">'+config.labels[i]+'</label>');
			}
		}
	};

	//进入iframe然后注入js
	var inIframe = function(){
		var w = document.getElementsByTagName('iframe'), doc, s, url;
		s = document.getElementById('pahjs');
		if(s && (url = s.src)){
			for(var i = 0; i < w.length; i++){
				doc = w[i].contentWindow.document;
				s = doc.createElement('script');
				s.src = url;
				doc.getElementsByTagName('head')[0].appendChild(s);
			}
		}
	};

	var mainSchedule = function(config){
		var rules, i, doms,  val, rule;
		if(config.rules){
			rules = parseRules(config.rules);
			//rules解析
			for(i in rules){
				doms = document.getElementsByTagName(i);
				for(var j = 0, lenJ = rules[i].length; j < lenJ; j++){
					rule = rules[i][j];

					for(var t = 0, lenT = doms.length; t < lenT; t++){
						if((val = doms[t][rule.attrName]) && rule.attrVal.test(val)){
							rule.title && addTitle(doms[t], rule.title);
							rule.accesskey && addAccessKey(doms[t], rule.accesskey);
							rule.href && (doms[t].href = rule.href);
							break;
						}
					}
				}
			}
		}

		//focus解析
		if(config.firstFocus){
			firstFocus(config.firstFocus);
		}

		//iframe内部执行, bookmarklet的方式
		if(config.iframe && !window.GM_log && !(window.chrome && window.chrome.runtime)){
			inIframe();
		}
		
	};

	PAH.init = mainSchedule;
})((window.PAHelper = window.PAHelper || {}));