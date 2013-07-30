(function(O){
	var config = {
		rules : {
			'a[href=/kyfw/reg/]' : {
				accesskey : 'z',
				title : '网上购票用户注册'
			},
			'a[href=/kyfw/]' : {
				accesskey : 'z',
				title : '购票'
			},
			'a[href=/kyfw/wstp/]' : {
				accesskey : 'z',
				title : '退票'
			}
		},
		firstFocus : null
	}
	O[0] = {
		//main in
		init : function(){
			var rules = O.parseRules(config.rules), i, doms, j, val, rule;
			for(i in rules){
				doms = document.getElementsByTagName(i);

				for(var j = 0, lenJ = rules[i].length; j < lenJ; j++){
					rule = rules[i][j];
					for(var t = 0, lenT = doms.length; t < lenT; t++){
						if((val = doms[t][rule.attrName]) && val.indexOf(rule.attrVal) != -1){
							rule.title && O.addTitle(doms[t], rule.title);
							rule.accesskey && O.addAccesskey(doms[t], rule.accesskey);
						}
					}
				}
			}
		}
	};
	
})(window.PAHelper = window.PAHelper || {});

if(location.pathname.test('/mormhweb/')){
	window.PAHelper[0].init();
}