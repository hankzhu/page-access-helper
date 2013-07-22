//封装innertext
function isIE(){ //ie? 
    if (window.navigator.userAgent.toLowerCase().indexOf("msie")>=1) 
        return true; 
    else 
        return false; 
} 

if(!isIE()){ //firefox innerText define
    HTMLElement.prototype.__defineGetter__("innerText", 
        function(){
            var anyString = "";
            var childS = this.childNodes;
            for(var i=0; i<childS.length; i++) { 
                if(childS[i].nodeType==1)
                    //anyString += childS[i].tagName=="BR" ? "\n" : childS[i].innerText;
                    anyString += childS[i].innerText;
                else if(childS[i].nodeType==3)
                    anyString += childS[i].nodeValue;
            }
            return anyString;
        } 
    ); 
    HTMLElement.prototype.__defineSetter__("innerText", 
        function(sText){
            this.textContent=sText; 
        } 
    ); 
}


String.prototype.trim = function(){
	return this.replace(/(^\s*)|(\s*$)/g, "");
}

//1. a标签 若a标签和文字描述都存在且相同，则去掉title描述
var a_list = document.getElementsByTagName("a");
for(var i = 0; i < a_list.length; i ++){
    var a = a_list[i];
	if(!a.title.trim()&&!a.innerText.trim()){
		a.title = "这是一个链接";
	}
	else{
		if(a.title.trim() == a.innerText.trim()){
			a.title = "";
		}
	}	
}


//2. img标签 添加alt
var img_list = document.getElementsByTagName("img");
for(var i = 0; i < img_list.length; i ++){
	var img = img_list[i];
	
	if(!img.alt.trim()){
		var text = img.innerText.trim();
		img.alt = text ? text : "这是一个图片";
	}
}

//3、当input = images是必须有alt或者titile属性，且不为空  为空则提示图片按钮  
//4、type等于button、reset、submit的input必须要有value或title
var Obj1=document.getElementsByTagName("input");
for (var i = 0;i < Obj1.length; i++ ){
	if(Obj1[i].type=="image"){
		if(!Obj1[i].title.trim()&&!Obj1[i].alt.trim()){
			Obj1[i].title = "图片按钮";
			}
	}
	if(Obj1[i].type=="button"){
		if(!Obj1[i].title.trim()&&!Obj1[i].value.trim()){
			Obj1[i].title = "按钮";
			}
	}
	if(Obj1[i].type=="reset"){
		if(!Obj1[i].title.trim()&&!Obj1[i].value.trim()){
			Obj1[i].title = "重置按钮";
			}
	}
	if(Obj1[i].type=="submit"){
		if(!Obj1[i].title.trim()&&!Obj1[i].value.trim()){
			Obj1[i].title = "递交按钮";
			}
	}
}


//5、每一个button必须包含文字内容       为空则提示按钮
var Obj1=document.getElementsByTagName("button");
for (var i=0;i<Obj1.length;i++ ){
	//alert(Obj1[i].innerText)
	if(!Obj1[i].innerText.trim()){
		Obj1[i].innerText  = "按钮";
	}
}


//6、每个label必须有文字内容   如果有for，则根据for对应的id，将title或value或text获取并填写
var Obj1=document.getElementsByTagName("label");
for (var i=0;i<Obj1.length;i++ ){
	if(!Obj1[i].innerText.trim()){
			if(Obj1[i].getAttribute("for")){
				var id = Obj1[i].getAttribute("for");
				var input = document.getElementById(id);
				if(input.title!=""){
					Obj1[i].innerText = input.title;
					break;
					}
				if(input.value!=""){
					text = input.value;
					Obj1[i].innerText = text;
					break;
					}
				if(input.text!=""){
					Obj1[i].innerText = input.text;
					break;
					}
				else{
					Obj1[i].innerText  = "标签";
					}
			}
	}
}


