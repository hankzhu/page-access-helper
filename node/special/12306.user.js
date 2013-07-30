// ==UserScript==
// @name        12306
// @namespace   12306
// @include     *12306.cn*
// @version     1
// ==/UserScript==
(function(PAH){
	var $ = window.jQuery;
	//parse the original rules
	var parseRules = function(rules){
		var parseRules = {}, tmp, reg = /(\w{1,7}?)\[([^=]+)=([^\]]+)\]/;
		if(rules){
			for(var i in rules){
				tmpl = reg.exec(i);
				if(tmpl && tmpl.length == 4){
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
						href : rules[i].href,
						tabindex : rules[i].tabindex
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
		dom && dom.setAttribute('accesskey', keyVal || 'z');   //重要的功能键使用
	};

	var firstFocus = function(selector){
		var dom;
		if(selector){
			dom = $(selector).focus().select();
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
//			try{
				for(var i = 0; i < w.length; i++){
					doc = w[i].contentWindow.document;
					s = doc.createElement('script');
					s.src = url;
					doc.getElementsByTagName('head')[0].appendChild(s);
				}
//			}catch(ign){}
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
							if(rule.href && (doms[t].innerText || doms[t].textContent)){
								continue;
							}
							rule.title && addTitle(doms[t], rule.title);
							rule.accesskey && addAccessKey(doms[t], rule.accesskey);
							rule.href && (doms[t].setAttribute('href', rule.href));
							rule.tabindex && (doms[t].setAttribute('tabindex', rule.tabindex));
							break;
						}
					}
				}
			}
		}
		//focus解析
		if(config.firstFocus){
			(function(tag){
				setTimeout(function(){
					firstFocus(tag);
				}, 1000);
			})(config.firstFocus);
		}

		//iframe内部执行, bookmarklet的方式
		if(config.iframe && !window.GM_log && !(window.chrome && window.chrome.runtime)){
			inIframe();
		}
		
	};

	PAH.init = mainSchedule;
})((window.PAHelper = window.PAHelper || {}));

window.log = function(msg){
	window.console && console.log && console.log(msg);
};

//首页
(function(O){
	var config = {
		rules : {
			'a[href=./kyfw/reg/$]' : {
				accesskey : 'z',
				title : '网上购票用户注册'
			},
			'a[href=./kyfw/$]' : {
				accesskey : 'z',
				title : '购票或登录',
				href : 'https://dynamic.12306.cn/otsweb/'
			},
			'a[href=./kyfw/wstp/$]' : {
				accesskey : 'z',
				title : '退票'
			}
		}
	}
	O[0] = {
		//main in
		init : function(){
			O.init(config);
		}
	};
	
})(window.PAHelper = window.PAHelper || {});
//登录子页面
(function(O){
	var config = {
		rules : {
			'input[id=^UserName$]' : {
				accesskey : 'u',
				title : '请输入用户或者邮箱'
			},
			'input[id=^password$]' : {
				accesskey : 'p',
				title : '请输入密码'
			},
			'input[id=^randCode$]' : {
				accesskey : 'v',
				title : '请输入右侧的验证码，可以截图发给朋友识别'
			},
			'input[id=^refundLoginCheck$]' :{
				title : '如果是退票登录，请勾上'
			}
		},
		firstFocus : '#UserName' //selector
	};

	//TODO 优化焦点顺序，比如输入验证码后，下一个tab应该是登录按钮
	//TODO 优化submit的快捷键
	O[1] = {
		//main in
		init : function(){
			O.init(config);
		}
	};
	
})(window.PAHelper = window.PAHelper || {});

//子页面框架
(function(O){
	//TODO iframe加title
	var config = {
		rules : {
			'a[href=./kyfw/reg/$]' : {
				accesskey : 'z',
				title : '网上购票用户注册'
			},
			'a[href=./kyfw/$]' : {
				accesskey : 'z',
				title : '购票'
			},
			'a[href=./kyfw/wstp/$]' : {
				accesskey : 'z',
				title : '退票'
			},
			'iframe[id=^main$]' : {
				title : '这是一个子页面'
			}
		},
		firstFocus : null,
		iframe : true
	};
	//TEST
	
	O[2] = {
		//main in
		init : function(){
			O.init(config);
		}
	};
	
})(window.PAHelper = window.PAHelper || {});

//登录后第一页面子页面
(function(O){
	var config = {
		rules : {
			'a[href=./otsweb/order/querySingleAction]' : {
				accesskey : 'z'
			}
		},
		firstFocus: 'a.text_yellow:last'
	};
	
	O[3] = {
		//main in
		init : function(){
			O.init(config);
		}
	};
	
})(window.PAHelper = window.PAHelper || {});

//选择票务和订票人页面
(function(O){
	var config = {
		rules : {
			'input[id=^passenger_filter_input$]' : {
				title : '常用联系人搜索'
			},
			'select[id=^passenger_1_seat$]' : {
				title : '请选择席别',
				tabindex : 10
			},
			'select[id=^passenger_1_ticket$]' : {
				title : '请选择票种',
				tabindex : 11
			},
			'input[id=^passenger_1_name$]' : {
				title : '请输入乘车人姓名',
				tabindex : 12
			},
			'select[id=^passenger_1_cardtype$]' : {
				title : '请选择证件类型',
				tabindex : 13
			},
			'input[id=^passenger_1_cardno$]' : {
				title : '请输入证件号码',
				tabindex : 14
			},
			'input[id=^passenger_1_mobileno$]' : {
				title : '请输入手机号码',
				tabindex : 15
			},
			'input[id=^checkbox_select_all$]' : {
				title : '是否全部保存为常用联系人',
				tabindex : -1
			},
			'input[id=^passenger_1_isSave$]' : {
				title : '保存为常用联系人',
				tabindex : 16
			},
			'input[id=^rand$]' : {
				title : '请输入右侧的验证码，可以截图发给朋友识别',
				tabindex : 17
			},
			'button[id=^sureButton$]' : {
				tabindex : 18,
				title : '点击将打开订单确认对话框'
			},
			'button[id=^reChooseButton$]' : {
				tabindex : 19
			}
		},
		firstFocus : '#passenger_1_seat'
	};
	
	var fixFrequentPeople = function(){
		var inputs = document.getElementById('showPassengerFilter').getElementsByTagName('input'),
			reg = /[^A-Z0-9]+/, tmpl;
		if(inputs){
			for(var i = 0; i< inputs.length; i++){
				tmpl = reg.exec(inputs[i].id);
				if(tmpl){
					inputs[i].setAttribute('title', tmpl[0]);
				}
			}
		}
	};

	var extraEvent = function(){
		jQuery('button#sureButton').click(function(){
			var b = this;
			window.setTimeout(function(){
				var ele = parent.jQuery('.ui-dialog'), yc = parent.jQuery('#yc');// title = parent.jQuery('#ui-dialog-title-yc');

				//读描述
//				ele.attr('aria-describedby', 'yc');
//				title.text(title.text() + '请按tab继续');
//				yc.attr('tabindex', 0).attr('aria-label', yc.text() + '继续tab可以进行确认或者取消');
				ele.find('button:first').click(function(){
					b.focus();  //还原焦点
				});
				
				if(ele[0]){
					ele = ele[0].getElementsByTagName('button');
					if(ele[1]){
						ele[1].setAttribute('title', parent.jQuery('#yc').text() + ' 确认请回车，或者tab到取消');
						ele[1].focus();
					}
				}


			}, 2000);
		});
	};

	O[4] = {
		//main in
		init : function(){
			jQuery('button.long_button_u')[1].id = 'sureButton';
			O.init(config);
			//添加联系人先隐藏
			jQuery('.add_ticket_passenger').attr('aria-hidden', 'true');
			//常用联系人优化
			fixFrequentPeople();
			//额外事件的处理
			extraEvent();

		}
	};
	
})(window.PAHelper = window.PAHelper || {});


//支付页面
(function(O){
	function initPage(){
		var orderTable = $('table.table_list'),
			titleTd = orderTable.find('tr:eq(1)').find('td'),
			infoTd = orderTable.find('tr:eq(2)').find('td'),
			msg = [];
		msg.push('请确认以下订票信息：');
		for(var i = 0, len = titleTd.length; i < len; i++){
			msg.push($(titleTd[i]).text(), $(infoTd[i]).text());
		}
		$('#payButton').attr('title', msg.join('').replace('（元）', '') + orderTable.find('tr:last').text() + '，确认请按回车进行网上支付');
	}
	var config = {
		rules : {
			'button[id=^payButton$]':{
				accesskey: 'b'
			}
		},
		firstFocus : '#payButton'
	};
	
	O[5] = {
		//main in
		init : function(){
			setTimeout(function(){
				initPage();
				O.init(config);
			}, 500);	
		}
	};
	
})(window.PAHelper = window.PAHelper || {});


/**
 * 无障碍助手 -- 查询页面
 * https://dynamic.12306.cn/otsweb/loginAction.do?method=init
 * @author kimhou
 *
 */
(function(PAHelper){
	var curWindow;
	var MOD = {
		init: function(win){
			curWindow = win;
			var self = this;
			//获取地址数据
			self.getStationData();
			//批量处理
			self.dealAll();
			//特殊处理
			self.specialDeal();
			//重写页面方法
			self.rewriteMethod();
		},
		/**
		 * 配置
		 */
		config: function(){
			var self = this;
			return {
				'input[id=singleRadio]':  {//单程 
					title: '选择单程票'
				},
				'input[id=roundRadio]': {//往返
					title: '选择往返票'
				},
				'input[id=fromStationText]':  {//出发地
					title: '请输入完整的出发城市中文名',
					accesskey: 'f',
					clearEvent: ['focus', 'blur', 'keydown', 'keyup', 'click'],
					initFocus: true,
					clearVlue: true
				},
				'input[id=toStationText]':  {//目的地
					title: '请输入完整的目的地城市中文名',
					clearEvent: ['focus', 'blur', 'keydown', 'keyup', 'click'],
					clearVlue: true,
					accesskey: 't'
				},
				'input[id=startdatepicker]': { //出发日期
					title: '请输入出发日期，格式为2013中横线12中横线12',
					clearEvent: ['focus', 'blur', 'keydown', 'keyup', 'click'],
					clearAttr: ['readonly'],
					accesskey: 'd'
				},
				'input[id=roundTrainDate]': { //返回日期
					title: '请输入返回日期，格式为2013中横线12中横线12',
					clearEvent: ['focus', 'blur', 'keydown', 'keyup', 'click'],
					clearVlue: true,
					clearAttr: ['readonly']
				},
				'select[id=startTime]':  {//出发时间
					title: '请选择出发时间'
				},
				'select[id=roundStartTimeStr]':  {//返回时间
					title: '请选择返回时间'
				},
				'input[id=trainCodeText]':  {//出发车次
					title: '请输入出发车次',
					clearEvent: ['focus', 'blur', 'keydown', 'keyup', 'click'],
					addEvent: {
						blur: function(){
							$('#trainCode').val($(this).val());
						}
					}
				},
				'input[id=ccType]': {//全部
				},
				'div[id=gridbox]': {//搜索结果
				},
				'button[id=submitQuery]':  {//搜索
					title: '查询',
					accesskey: 's'
				},
				'button[id=stu_submitQuery]': {//查询学生票
					title: '查询学生票',
					accesskey: 9
				}
			}
		},
		/**
		 *特殊处理
		 *
		 */
		specialDeal: function(){
			var self = this,
				config = self.config();
			//选项加title
			$('input[id=ccType]').each(function(i,n){
				$(n).attr('title', n.nextSibling.textContent);
			});
			//出发时间
			var startTimeDom = $('#startTime'),
				titleArr = [
					'凌晨0点到24点',
					'凌晨0点到早上6点',
					'早上6点到中午12点',
					'中午12点到下午18点',
					'下午18点到晚上24点'
				];
			startTimeDom.find('option').each(function(i,n){
				$(n).html(titleArr[i]);
			});
			$('#roundStartTimeStr').find('option').each(function(i,n){
				$(n).html(titleArr[i]);
			});
			top.$('div[lang=zh-cn]').hide();
			top.$('#main')[0].contentWindow.$('#form_cities2').hide()
			//全部，始发，过路添加TITLE
			$('input[name=trainPassType]').each(function(i, n){
				$(n).attr('title', n.nextSibling.textContent);
			});
		},
		/**
		 *特殊处理 搜索结果
		 */
		dealSearchResult: function(){
			var self = this;
			var resultTable = $('table.obj.row20px');
			var resultTrs = resultTable.find('tr');
			if(!self.resultMsgDom){
				self.resultMsgDom = $('<a href="javascript:;"></a>');
				resultTable.before(self.resultMsgDom);
			}
			if(resultTrs.length < 2){//没有
				var msg = '没有搜索到任何余票信息，您可以修改搜索条件重新搜索';
				self.resultMsgDom.html('').hide();
				alert(msg);
			}else{
				var count = self.dealSearchResultDom(resultTrs),
					msg = '搜索到' + count + '条余票信息';
				self.resultMsgDom.show().html(msg).focus();
			}
		},
		/**
		 * 从搜索结果表格提信息，并给按钮加title
		 */
		dealSearchResultDom: function(trs){
			var siteMap = ['商务座', '特等座', '一等座', '二等座', '高级软卧', '软卧', '硬卧', '软座', '硬座', '无座', '其他'],
				count = 0;
			for(var i = 0, len = trs.length; i < len; i++){
				var tr = $(trs[i]),
					tds = tr.find('td');
				if(!tds.length)continue;
				var startStationInfo = $(tds[1]).html().replace(/&nbsp;/g,'').replace(/^<[^>]+>/,'').replace(/<[^>]+>$/,'').split(/<[^>]*>/),
					toStationInfo = $(tds[2]).html().replace(/&nbsp;/g,'').replace(/^<[^>]+>/,'').replace(/<[^>]+>$/,'').split(/<[^>]*>/),
					trainNum = $(tds[0]).find('span').text(),//车次
					startStation = startStationInfo[0],//出发地
					startTime = startStationInfo[1].split(':').join('点') + '分',//出发时间
					toStation = toStationInfo[0],//到达地
					toTime = toStationInfo[1].split(':').join('点') + '分',//到达时间
					takeTime = $(tds[3]).html().split(':').join('小时') + '分',//费时
					orderBtn = tr.find('td:last').find('a'),//预订按钮
					//座位信息
					siteInfo = [],
					canOrderSiteTypes = [];
				for(var j = 0, siteLen = 11; j < siteLen; j++){
					var td = $(tds[j + 4]),
						text = td.text();
					if(text && text != '--' && text != '无'){
						siteInfo.push({
							name: siteMap[j],
							val: text
						});
						canOrderSiteTypes.push(siteMap[j]);
					}
				}
				if(trainNum){
					count++;
					tr.unbind('click').unbind('keyup').unbind('keydown').unbind('focus').unbind('blur');
					if(orderBtn.attr('class') == 'btn130_2'){//可以预订
						var title = ['车次', trainNum, '出发时间', startTime, '从', startStation, '出发，', '到达时间', toTime, '到达', toStation, '，历时', takeTime, '，余票类型：', canOrderSiteTypes.join('、'), '，需要预订此次列车请按回车键'].join('');
						orderBtn.attr('href', 'javascript:;')
							.attr('title', title);
					}else{
						orderBtn.attr('href', '#')
							.attr('title', ['车次', trainNum, '已无余票，不可预订，请选择其他车次'].join(''))
							.unbind('click').unbind('keyup').unbind('keydown').unbind('focus').unbind('blur')
							.bind('click', function(){
								$(this).focus();
								return false;
							});
					}
					
				}
			}
			return count;
		},
		/**
		 * 校验表单
		 */
		checkForm: function(){
			var self = this;
			//出发地
			var input = $('#fromStationText'),
				txt = $.trim(input.val()),
				NO = self.stationMap[txt];
			if(!NO){
				alert(txt ? '您输入的出发城市名不存在，请重新输入完整的城市中文名' : '请输入完整的出发城市中文名');
				$('#fromStation').val('');
				input.focus().select();
				return false;
			}else{
				$('#fromStation').val(NO);
			}
			//目的地
			var input = $('#toStationText'),
				txt = $.trim(input.val()),
				NO = self.stationMap[txt];
			if(!NO){
				alert(txt ? '您输入的目的地城市名不存在，请重新输入完整的城市中文名' : '请输入完整的目的地城市中文名');
				$('#toStation').val('');
				input.focus().select();
				return false;
			}else{
				$('#toStation').val(NO);
			}
			//出发日期
			var input = $('#startdatepicker'),
				val = $.trim(input.val());
			if(!/^[\d]{4}-[\d]{2}-[\d]{2}$/.test(val)){
				alert(val ? '您输入的出发日期格式不正确，请输入2013中横线12中横线12这样的格式' : '请输入出发日期');
				input.focus().select();
				return false;
			}
			//返回日期
			var input = $('#roundTrainDate'),
				val = $.trim(input.val());
			if(input.is(':visible') && !/^[\d]{4}-[\d]{2}-[\d]{2}$/.test(val)){
				alert(val ? '您输入的返回日期格式不正确，请输入2013中横线12中横线12这样的格式' : '请输入返回日期');
				input.focus().select();
				return false;
			}
			return true;
		},
		/**
		 *批量处理
		 */
		dealAll: function(){
			var self = this,
				config = self.config();
			for(i in config){
				var item = config[i],
					dom = $(i);
				for(var attr in item){
					var attrVal = item[attr];
					switch(attr){
						case 'initFocus':
							(function(d){
								setTimeout(function(){
									d.focus().select();
								}, 1000);
							})(dom);
							//dom.focus();
							break;
						case 'title':
						case 'accesskey': 
							dom.attr(attr, attrVal);
							break;
						case 'clearEvent':
							for(var index in attrVal){
								dom.unbind(attrVal[index]);
							}
							break;
						case 'clearAttr':
							for(var index in attrVal){
								dom.removeAttr(attrVal);
							}
							break;
						case 'clearVlue':
							dom.val('');
							break;
						case 'tabIndex':
							dom.attr('tabIndex', attrVal);
							break;
						case 'addEvent':
							for(var index in attrVal){
								dom.bind(index, attrVal[index]);
							}
							break;
					}
				}
			}
		},
		/**
		 *获取地址数据
		 */
		getStationData: function(){
			var stationMap = {};
			if(curWindow.station_names){
				var arr = curWindow.station_names.split('@');
				for(var i = 0, len = arr.length; i < len; i++){
					var arr2 = arr[i].split('|');
					arr2[1] && (stationMap[arr2[1]] = [arr2[2]]);
				}
			}
			this.stationMap = stationMap;
		},
		/**
		 * 重写页面事件
		 */
		rewriteMethod: function(){
			var self = this;
			/**
			 *重写表单校验
			 */
			// 判断内否提交查询
			curWindow.canquery = function () {
				var canquery = true;
				if(!self.checkForm())return false;
				// 防止操作产生的关键数据不正确开始
				if (jQuery.trim($('#trainCodeText').val()) == '') {
				$('#trainCode').val('');
				}
				if (jQuery.trim($('#fromStationText').val()) == '') {
				$('#fromStation').val('');
				}
				if (jQuery.trim($('#toStationText').val()) == '') {
				$('#toStation').val('');
				}
				// 防止操作产生的关键数据不正确计数
				if ($.trim($('#toStationText').val()) == ''
				|| $.trim($('#fromStationText').val()) == ''
				|| $.trim($('#toStationText').val()) == '简码/汉字'
				|| $.trim($('#fromStationText').val()) == '简码/汉字') {
				if ($.trim($('#fromStationText').val()) == ''
				|| $.trim($('#fromStationText').val()) == '简码/汉字') {
				alert('请填写出发地！');
				$('#fromStationText').focus().select();
				canquery = false;
				return canquery;
				}
				if ($.trim($('#toStationText').val()) == ''
				|| $.trim($('#toStationText').val()) == '简码/汉字') {
				alert('请填写目的地！');
				$('#toStationText').focus().select();
				canquery = false;
				return canquery;
				}
				}
				if ($.trim($('#fromStationText').val()) == $
				.trim($('#toStationText').val())) {
				alert('出发地与目的地不能相同！');
				$('#fromStationText').focus().select();
				canquery = false;
				return canquery;
				}
				if ($.trim($('#startdatepicker').val()) == '') {
				alert('请填写出发日期！');
				canquery = false;
				$('#startdatepicker').focus().select();
				return canquery;
				}
				if (checkBeyondMixTicketNum()) {
				canquery = false;
				return canquery;
				}
				if (getSingleRoundType() == '') {
				canquery = false;
				alert('请选择单程查询还是往返查询！');
				$('#singleRadio').focus();
				return canquery;
				}
				if (!checkRoundValid()) {
				canquery = false;
				return canquery;
				}
				//检查日期是否在预期可售时间内
				if(clickBuyStudentTicket=='Y'){
				if($('#startdatepicker').attr('class')!='input_20hui'){
				var go_date=$.trim($('#startdatepicker').val());
				if(go_date<stu_can_buy[0] || go_date>stu_can_buy[1]){
				canquery = false;
				alert('学生票的预售期是['+stu_can_buy[0]+' ～ '+stu_can_buy[1]+'],请重新选择日期查询！');
				$('#startdatepicker').focus().select();
				return canquery;
				}
				}else{
				var back_date=$.trim($('#roundTrainDate').val());
				if(back_date<stu_can_buy[0] || back_date>stu_can_buy[1]){
				canquery = false;
				alert('学生票的预售期是['+stu_can_buy[0]+' ～ '+stu_can_buy[1]+'],请重新选择日期查询！');
				$('#roundTrainDate').focus().select();
				return canquery;
				}
				}
				}else{
				if($('#startdatepicker').attr('class')!='input_20hui'){
				var go_date=$.trim($('#startdatepicker').val());
				if(go_date<other_can_buy[0] || go_date>other_can_buy[1]){
				canquery = false;
				alert('您选择的日期不在预售期范围内！');
				$('#startdatepicker').focus().select();
				return canquery;
				}
				}else{
				var back_date=$.trim($('#roundTrainDate').val());
				if(back_date<other_can_buy[0] || back_date>other_can_buy[1]){
				canquery = false;
				alert('您选择的日期不在预售期范围内！');
				$('#roundTrainDate').focus().select();
				return canquery;
				}
				}
				}
				if(passengerTypesString == ''){//单程或往程
				//点击的是查询学生按钮
				if(clickBuyStudentTicket=='Y'){
				if(!isStudentTicketDateValid()){
				var alertMessage='学生票的乘车时间为每年的暑假6月1日至9月30日、寒假12月1日至3月31日，目前不办理学生票业务。';
				alert(alertMessage);
				canquery = false;
				return canquery;
				}
				}
				}else{//返程
				if(!isStudentTicketDateValid()){
				var alertMessage='学生票的乘车时间为每年的暑假6月1日至9月30日、寒假12月1日至3月31日，目前不办理学生票业务。';
				alert(alertMessage);
				canquery = false;
				return canquery;
				}
				}
				return canquery;
			} 

			/**
			 *重写搜索事件
			 */
			// 加载查询数据开始
			curWindow.loadData = function () {
				var gridbox = $('#gridbox');
				showLoadMsg(gridbox);
				//异步请求站名
				$.ajax( {
				url : ctx+'/order/querySingleAction.do?method=queryLeftTicket',
				type : 'GET',
				dataType:'text',
				data:{
				'orderRequest.train_date' : $('#startdatepicker').val(),
				'orderRequest.from_station_telecode' : $('#fromStation').val(),
				'orderRequest.to_station_telecode' : $('#toStation').val(),
				'orderRequest.train_no' : $('#trainCode').val(),
				'trainPassType' : getTrainPassType(),
				'trainClass' : getTrainClassString(),
				'includeStudent' : getIncludeStudent(),
				'seatTypeAndNum' : getSeanTypeAndNum(),
				'orderRequest.start_time_str' : $('#startTime').val()
				},
				success : function(data, textStatus) {
				$('#stu_submitQuery').attr('disabled',false);
				if(data == '-10'){
				alert('您还没有登录或者离开页面的时间过长，请登录系统或者刷新页面');
				curWindow.location.href=ctx+'/loginAction.do?method=init';
				return;
				}
				if(data == '-1') {
				alert('服务器忙，加载查询数据失败！');
				data = '';
				} else if(data !='undefine' &&data.split(',')[0]=='-2'){
				alert(data.split(',')[1]);
				data='';
				}else {
				data=data.replaceAll('\\\\n',String.fromCharCode(10));
				}
				mygrid.clearAll();
				//mygrid.startFastOperations();
				mygrid.parse(data,'csv');
				//mygrid.stopFastOperations();
				dealwithQueryInfo(mygrid);
				/*if(clickBuyStudentTicket=='Y'){
				$('#stu_submitQuery').attr('disabled',false);
				}else{
				$('#submitQuery').click(sendQueryFunc);
				}*/
				removeLoadMsg();
				setTimeout(function(){
					self.dealSearchResult();
				},500)
				//自定义处理事件
				},
				error : function(e) {
				alert('服务器忙，加载查询数据失败！');
				removeLoadMsg();
				validQueryButton();
				if (isStudentTicketDateValid()) {
				stu_validQueryButton();
				}
				if(clickBuyStudentTicket=='N'){
				// renameButton('research_u');
				//$('#submitQuery').click(sendQueryFunc);
				}else{
				// stu_renameButton('research_u');
				//$('#stu_submitQuery').click(sendQueryFunc);
				//$('#stu_submitQuery').attr('disabled',false);
				}
				}
				});
			} 
		}
	};
	PAHelper = PAHelper || {};
	PAHelper.SearchPage = {
		init: function(){
			MOD.init(window);
		}
	};
})(window.PAHelper = window.PAHelper || {});
//clear expression
window.setTimeout(function(){
	if(window.ActiveXObject){
		jQuery(document.head).append('<style type="text/css">a{blr:expression(this.Focus=null)}</style>');
	}
},1000);
//
/**
 * 主入口，路由
 */
(function(){
	var address = location.href;
	if(/mormhweb/.test(location.pathname)){
		window.PAHelper[0].init();
	}else if(/otsweb\/loginAction\.do\?method=login/.test(address) || /otsweb\/loginAction\.do;jsessionid/.test(address) || /otsweb\/loginAction\.do\?method=initForMy12306/.test(address)){ //登录后第一个页面、我的12306页面 https://www.12306.cn/otsweb/loginAction.do?method=initForMy12306
		window.PAHelper[3].init();
	}else if(/otsweb\/loginAction\.do\?method=init/.test(address)){ //登录页面
		window.PAHelper[1].init();
	}else if(/otsweb\/order\/confirmPassengerAction\.do\?method=init/.test(address)){
		window.PAHelper[4].init();
	}else if(/otsweb\/order\/myOrderAction\.do\?method=laterEpay&orderSequence_no/.test(address) || /otsweb\/order\/confirmPassengerAction\.do\?method=payOrder&orderSequence_no/.test(address)){ //支付页面
		window.PAHelper[5].init();
	}else if(/otsweb\/order\/querySingleAction\.do/.test(address) || /otsweb\/order\/payConfirmOnlineSingleAction\.do\?method=cancelOrder/.test(address)){//搜索页面
		window.PAHelper.SearchPage.init();
	}else if(/otsweb/.test(location.pathname)){ //登录页面的外层
		window.PAHelper[2].init();
	}
})();