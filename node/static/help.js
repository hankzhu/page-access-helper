function addAchLink(text, href, title, key, target, id) {
	var ach = document.createElement('a');
	ach.href = href;
	ach.title = title;
	if(id) {
		ach.id = id;
	}
	ach.accessKey = key;
	ach.target = target;
	ach.style.width = '0px';
	ach.style.height = '0px';
	ach.style.overflow = 'hidden';
	ach.style.display = 'block';
	ach.style.font = '0/0 Arial';
	ach.innerHTML = text;
	document.body.appendChild(ach);
}
function changeMode(mode) {
	window.location.hash = '#' + mode;
	document.body.innerHTML = window.accessHelperDOMCache;
	var s = document.createElement('script');
	s.src = 'http://127.0.0.1/access.js?type=' + mode;
	s.id = 'pahjs';
	document.getElementsByTagName('head')[0].appendChild(s);
}
if(window === top.window){//iframe内部不加，会重复
	if(!document.getElementById('access-helper-help')) {
		addAchLink('无障碍说明', 'http://127.0.0.1/help.html', '现在按回车可以得到详细的无障碍说明，你也可以在需要时用alt+h键访问说明页面', 'h', '_blank', 'access-helper-help');
		addAchLink('切换阅读模式', "javascript:changeMode('news');void(0);", '现在按回车可以切换到阅读模式，你也可以在需要时用alt+逗号键访问说明页面', ',', '_self');
		addAchLink('切换通用模式', "javascript:changeMode('common');void(0);", '现在按回车可以得到详细的无障碍说明，你也可以在需要时用alt+点号键访问说明页面', '.', '_self');
	}
	window.accessHelperDOMCache = document.body.innerHTML;
}