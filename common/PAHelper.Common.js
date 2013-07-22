
(function(PAH){

    String.prototype.trim = function(){
        return this.replace(/(^\s*)|(\s*$)/g, "");
    }
    
    String.prototype.startWith=function(str){     
        var reg=new RegExp("^"+str);     
        return reg.test(this);        
    } 

    function bind(node, event, func){
        if(node.addEventListener){
            node.addEventListener(event, func, false);
        }else{
            node.attachEvent("on" + event, func);
        }
    }

    function func_2_string(func){
        if(typeof func == "function"){
            var s = func.toString();
            var start = s.indexOf("{");
            var end = s.lastIndexOf("}");
            return s.slice(start + 1, end);
        }else{
            return func.toString();
        }
    }



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

    PAH.Common = {
            
        getCurrentStyle: function (node){
            var style = null;
            
            if(window.getComputedStyle) {
                style = window.getComputedStyle(node, null);
            }else{
                style = node.currentStyle;
            }
            
            return style;
        }, 
        
        add_lang: function(){
            /*
                添加html中lang属性
            */
            var html = document.getElementsByTagName("html")[0];
            var lang = html.getAttribute("lang");
            if(!lang){
                html.setAttribute("xlm:lang", "zh");
                html.setAttribute("lang", "zh");
            }
            return this;
        },
        
        handle_a: function(){
            /*
                将页面上的A标签去噪。
            */
            var a_list = document.getElementsByTagName("a");
            for(var i = 0; i < a_list.length; i ++){
                //this.single_tabindex(a_list[i]);
                this.check_img_alt(a_list[i]);
                this.check_a_link(a_list[i]);
            }
            return this;
        },
        
        check_a_link: function(node){
            if(node.getAttribute("tabindex") == "-1"){
                return;
            }
        
            var children = node.childNodes;
            if(!node.title.trim()){
                //如果没有title，则将该标签下第一个img的alt赋给title，所有img的alt都没有意义了
                for(var i in children){
                    var child = children[i];
                    if(child.nodeName && child.nodeName.toLowerCase() == "img" && child.alt.trim()){
                        node.title = child.alt;
                        break;
                    }
                }
            }
            
            //a标签下所有的img的alt都没有意义了
            for(var i in children){
                var child = children[i];
                if(child.nodeName && child.nodeName.toLowerCase() == "img"){
                    child.alt = "";
                }
            }
            
            if(!node.title.trim()&&!node.innerText.trim()){
                var href = (node.href || "").trim().toLowerCase();
                if(!href.startWith("##") && !href.startWith("javascript")){
                    node.title = "这是一个指向"+ href +"的链接";
                }else{
                    node.title = "这是一个链接";
                }
            }
            
            
            if(node.title.trim() == node.innerText.trim()){
                node.title = "";
            }
            
        },
        
        check_img_alt: function(node){
            /*
                如果某个A标签下又有img，又有文字，且文字内容跟img的alt一致时，取掉img的alt，以免重复读屏
            */
            var text = node.innerText;
            if(!text){
                return;
            }
            
            var children = node.childNodes;
            for(var i in children){
                var child = children[i];
                if(child.nodeName && child.nodeName.toLowerCase() == "img" && child.alt.trim() == text.trim()){
                    child.alt = "";
                }
            }
        },
        
        single_tabindex: function(node){
            /*
                如果某个元素没有文本内容，或有背景图片，则将tabindex设置为-1，不让tab到
                当链接下有img，且img有alt或title时无效
            */
            var style = this.getCurrentStyle(node);
            if(style.backgroundImage != "none"){
                node.setAttribute("tabindex", "-1");
            }else if(!node.innerText.trim() && !node.title.trim()){
                var children = node.childNodes;
                var is_useful = false;
                for(var i in children){
                    var child = children[i];
                    if(child.nodeName){
                        if(child.nodeName.toLowerCase() == "img" && !child.alt.trim()){
                            continue;
                        }else if (child.nodeName.toLowerCase() == "#text"){
                            continue;
                        }else{
                            is_useful = true;
                            break;
                        }
                    }
                }
                if(!is_useful){
                    node.setAttribute("tabindex", "-1");
                }
            }
            return this;
        },
        
        remove_blur : function(){
            /*
                移除页面中常用的会拥有焦点的标签的onfoucs=this.blur()，防止丢失焦点
            */
            var enable_elements = ["a", "input", "button", "textarea", "img"];
            for(var i = 0; i < enable_elements.length; i ++){
                nodes = document.getElementsByTagName(enable_elements[i]);
                for(var j = 0; j < nodes.length; j ++){
                    node = nodes[j]
                    var focus_func = node.getAttribute("onfocus");
                    if(focus_func){
                        focus_func = func_2_string(focus_func);
                        focus_func = focus_func.replace(/this.blur\(\)\s*;?/, "");
                        if(focus_func){
                            node.onfocus = new Function(focus_func);
                        }else{
                            node.removeAttribute("onfocus");
                        }
                        
                    }
                }
            }
            return this;
        },
        
        handle_img : function(){
            /*
                将页面中图片高度或宽度小于8像素的图片添加aria-hidden=true
            */
            var imgLoad = function (url, callback) {
                var img = new Image();
                img.src = url;
                if (img.complete) {
                    callback(img.width, img.height);
                } else {
                    img.onload = function () {
                        callback(img.width, img.height);
                        img.onload = null;
                    };
                };
            };
            
            var hide_img = function (img){
                img.setAttribute("alt", "");
                img.setAttribute("aria-hidden", "true");
            };
            
            nodes = document.getElementsByTagName("img");
            for(var i = 0; i < nodes.length; i ++){
                var img = nodes[i];
                this.add_img_alt(img);
                
                if((img.width > 0 && img.width < 8) || (img.height > 0 && img.height < 8)){
                    hide_img(img);
                }else if(img.width == 0 || img.height == 0){
                    imgLoad(img.src, function(width, height){
                        width = img.width? img.width: width;
                        height = img.height? img.height: height;
                        
                        if(width < 8 || height < 8){
                            hide_img(img);
                        }
                    })
                }
            }
            
            return this;
        },
        
        add_img_alt : function(img){
            /*
            img先不用处理了，添加上“这是一个图片”也没有意义
            if(!img.alt.trim()){
                var text = img.innerText.trim();
                img.alt = text ? text : "这是一个图片";
            }
            */
        },
        
        handle_input: function(){
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
                        Obj1[i].title = "提交按钮";
                        }
                }
            }
            return this;
        },
        
        handle_button: function(){
            //5、每一个button必须包含文字内容       为空则提示按钮
            var Obj1=document.getElementsByTagName("button");
            for (var i=0;i<Obj1.length;i++ ){
                if(!Obj1[i].innerText.trim()){
                    Obj1[i].innerText  = "按钮";
                }
            }
            return this;
        },
        
        handle_label: function(){
            //6、每个label必须有文字内容   如果有for，则根据for对应的id，将title或value或text获取并填写
            var Obj1=document.getElementsByTagName("label");
            for (var i=0;i<Obj1.length;i++ ){
                if(!Obj1[i].innerText.trim()){
                    if(Obj1[i].getAttribute("for")){
                        var id = Obj1[i].getAttribute("for");
                        var input = document.getElementById(id);
                        if(input && input.title!=""){
                            Obj1[i].innerText = input.title;
                        }else if(input && input.value!=""){
                            text = input.value;
                            Obj1[i].innerText = text;
                        }else if(input && input.text!=""){
                            Obj1[i].innerText = input.text;
                        }else{
                            Obj1[i].innerText  = "标签";
                        }
                    }
                }
            }
            
            return this;
        },
        
        move_event: function(){
            /*
                将页面中所有指定控件的鼠标事件响应迁移到键盘事件上
            */
            var enable_elements = ["a", "input", "button", "textarea", "img"];
            for(var i = 0; i < enable_elements.length; i ++){
                nodes = document.getElementsByTagName(enable_elements[i]);
                for(var j = 0; j < nodes.length; j ++){
                    node = nodes[j];
                    this.move_event_single(node);
                }
            }
            
            
            //针对以下特殊可能会被绑onclick的元素，给他们加上tabindex=0使其能获得焦点
            var click_elements = ["div", "p", "li", "tr", "td"];
            for(var i = 0; i < click_elements.length; i ++){
                nodes = document.getElementsByTagName(click_elements[i]);
                for(var j = 0; j < nodes.length; j ++){
                    node = nodes[j];
                    if(node.onclick){
                    
                        node.setAttribute("tabindex", "0");
                        bind(node, "keypress", function(evt){
                            evt = evt ? evt : window.event
                            if(evt.keyCode == 13){
                                var target = evt.target  ||  evt.srcElement;
                                
                                target.onclick();
                            }
                        })
                    }
                }
            }
            
            return this;
            
        },
        
        move_event_single: function(node){
            /*
                将指定控件的鼠标事件响应迁移到键盘事件上
            */
            var event_map = {
                //"onclick":      "onkeypress",
                "onmouseover":  "onfocus",
                "onmouseout":   "onblur",
                "onmousedown":  "onkeydown",
                "onmouseup":    "onkeyup"
                //"onmousemove":  "onblur"
            };
             
            for(var from_name in event_map){
                var from_event = node.getAttribute(from_name);
                if(from_event){
                    var to_name = event_map[from_name];
                    var to_event = node.getAttribute(to_name);
                    if(!to_event || from_event.toString().replace(/(^\;*)|(\;*$)|\s/g, "") != 
                                        to_event.toString().replace(/(^\;*)|(\;*$)|\s/g, "")){
                                        
                        bind(node, to_name.slice(2), new Function(func_2_string(from_event)));
                    }
                }
            }
        },
        
        handle_outline: function(){
            /*
                在页面中插入一个样式块，覆盖outline:none的样式
            */
            
            var style = document.createElement("style");
            style.innerText = "a:focus{outline: #000 1px dotted !important;}";
            
            document.getElementsByTagName("head")[0].appendChild(style);
            return this;
        },
        
        
        init : function(){
            this.add_lang().handle_a().handle_img().handle_label();
            //this.handle_button().handle_input();
            this.move_event().remove_blur();
            return this;
        }
    }
    
})(window.PAHelper = window.PAHelper || {});


PAHelper.Common.init();
