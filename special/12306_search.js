/**
 * 无障碍助手 -- 查询页面
 * https://dynamic.12306.cn/otsweb/loginAction.do?method=init
 * @author kimhou
 *
 */
console.log(location.href);
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
					title: '请输入出发地',
					accesskey: 1,
					clearEvent: ['focus', 'blur', 'keydown', 'keyup', 'click'],
					initFocus: true,
					addEvent: {
						blur: function(){
							var input = $(this),
								txt = $.trim($(this).val()),
								NO = self.stationMap[txt];
							if(txt && !NO){
								alert('您输入的地址不存在，请重新输入');
								$('#fromStation').val('');
								setTimeout(function(){
									input.focus();
								}, 300);
							}else if(NO){
								$('#fromStation').val(NO);
							}
						}

					},
					clearVlue: true
				},
				'input[id=toStationText]':  {//目的地
					title: '请输入目的地',
					clearEvent: ['focus', 'blur', 'keydown', 'keyup', 'click'],
					addEvent: {
						blur: function(){
							var input = $(this),
								txt = $.trim($(this).val()),
								NO = self.stationMap[txt];
							if(txt && !NO){
								alert('您输入的地址不存在，请重新输入');
								$('#toStation').val('');
								setTimeout(function(){
									input.focus();
								}, 300);
							}else if(NO){
								$('#toStation').val(NO);
							}
						}
					},
					clearVlue: true
				},
				'input[id=startdatepicker]': { //出发日期
					title: '请输入出发日期，格式为2013中横线12中横线12',
					clearEvent: ['focus', 'blur', 'keydown', 'keyup', 'click'],
					clearAttr: ['readonly']
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
					accesskey: 0
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
					'早上6点到12点',
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
			var resultTable = $('div.gridbox');
			var resultTrs = $('table.obj.row20px').find('tr');
			if(!self.resultMsgDom){
				self.resultMsgDom = $('<a tabindex="-1" href="javascript:;"></a>');
				resultTable.before(self.resultMsgDom);
			}
			if(resultTrs.length < 2){//没有
				var msg = '没有搜索到任何余票信息，您可以修改搜索条件重新搜索';
				self.resultMsgDom.html(msg).attr('title', msg).focus();
			}else{
				var count = self.dealSearchResultDom(resultTrs),
					msg = '搜索到' + count + '条结果';
				self.resultMsgDom.html(msg).attr('title', msg).focus();
			}
		},
		/**
		 * 从搜索结果表格提信息
		 */
		dealSearchResultDom: function(trs){
			var siteMap = ['商务座', '特等座', '一等座', '二等座', '高级软卧', '软卧', '硬卧', '软座', '硬座', '无座', '其他'],
				count = 0;
			for(var i = 0, len = trs.length; i < len; i++){
				var tr = $(trs[i]),
					tds = tr.find('td');
				if(!tds.length)continue;
				var startStationInfo = $(tds[1]).html().replace(/&nbsp;/g,'').split(/<[^>]*>/),
					toStationInfo = $(tds[2]).html().replace(/&nbsp;/g,'').split(/<[^>]*>/),
					trainNum = $(tds[0]).find('span').text(),//车次
					startStation = startStationInfo[1],//出发地
					startTime = startStationInfo[2].split(':').join('点') + '分',//出发时间
					toStation = toStationInfo[1],//到达地
					toTime = toStationInfo[2].split(':').join('点') + '分',//到达时间
					takeTime = $(tds[3]).html().split(':').join('时') + '分',//费时
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
					if(orderBtn.attr('class') == 'btn130_2'){//可以预订
						var title = ['车次', trainNum, '时间', startTime, '从', startStation, '出发', '时间', toTime, '到达', toStation, '历时', takeTime, '还有座位类型：', canOrderSiteTypes.join('、')].join('');
						orderBtn.attr('href', '#')
							.attr('title', title)
							.css('border','solide 5px #222');
					}else{
						orderBtn.attr('href', '#')
							.attr('title', ['车次', trainNum, '不可预订'].join(''));
					}
					
				}
			}
			return count;
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
							dom.focus();
							break;
						case 'title', 'accesskey': 
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
				$('#fromStationText').focus();
				canquery = false;
				return canquery;
				}
				if ($.trim($('#toStationText').val()) == ''
				|| $.trim($('#toStationText').val()) == '简码/汉字') {
				alert('请填写目的地！');
				$('#toStationText').focus();
				canquery = false;
				return canquery;
				}
				}
				if ($.trim($('#fromStationText').val()) == $
				.trim($('#toStationText').val())) {
				alert('出发地与目的地不能相同！');
				$('#fromStationText').focus();
				canquery = false;
				return canquery;
				}
				if ($.trim($('#startdatepicker').val()) == '') {
				alert('请填写出发日期！');
				canquery = false;
				$('#startdatepicker').focus();
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
				$('#startdatepicker').focus();
				return canquery;
				}
				}else{
				var back_date=$.trim($('#roundTrainDate').val());
				if(back_date<stu_can_buy[0] || back_date>stu_can_buy[1]){
				canquery = false;
				alert('学生票的预售期是['+stu_can_buy[0]+' ～ '+stu_can_buy[1]+'],请重新选择日期查询！');
				$('#roundTrainDate').focus();
				return canquery;
				}
				}
				}else{
				if($('#startdatepicker').attr('class')!='input_20hui'){
				var go_date=$.trim($('#startdatepicker').val());
				if(go_date<other_can_buy[0] || go_date>other_can_buy[1]){
				canquery = false;
				alert('您选择的日期不在预售期范围内！');
				$('#startdatepicker').focus();
				return canquery;
				}
				}else{
				var back_date=$.trim($('#roundTrainDate').val());
				if(back_date<other_can_buy[0] || back_date>other_can_buy[1]){
				canquery = false;
				alert('您选择的日期不在预售期范围内！');
				$('#roundTrainDate').focus();
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
				},1000)
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
	MOD.init(window);
	PAHelper = PAHelper || {};
	PAHelper.SearchPage = {
		init: function(){
			MOD.init();
		}
	};
})(window.PAHelper = window.PAHelper || {});