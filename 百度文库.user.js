// ==UserScript==
// @name     百度文库
// @version  1
// @grant    zxl
// @include  https://wenku.baidu.com/view/*
// ==/UserScript==

window.onload = function(){

 	var box = {    
   	// 显示文本的元素
  	_obj: {},
   	
    // 初始化
   	init: function() {
     	// 取消复制禁用
    	document.querySelector(".doc-reader").oncopy = "";
     	// body整体右移    
     	document.querySelector("body").style.paddingLeft = "100px";
     	// 插入显示的div
     	this._insertDiv();
	 		this._obj = document.querySelector("#box");
		},
    
    setBackground: function(color) {
      this._obj.style.background = color;
    },
    
    show: function(text) {
      this._obj.innerHTML = text;
    },
		
    // 插入div
		_insertDiv: function() {
  		let div = document.createElement('div');
    	div.id = "zxl-div";
    	div.style.width 			= "100px";
    	div.style.height 			= "100%";
    	div.style.position 		= "fixed";
    	div.style.background 	= "white";
    	div.style.zIndex 			= "99999";
    	div.style.marginTop 	= "12px";
    	div.style.marginLeft 	= "-100px";
      div.style.transition 	= "width 1s ease";
    	div.innerHTML = "<div id='zxl-count' style='position: absolute;z-index: 1;top: 9px;border-radius: 5px;left: 8px;padding: 5px;width: 56px;color: white;background: #b7a9a9;text-align: center;'>总页数：0</div><div id='zxl-show' style='border-radius: 5px;position: absolute;z-index: 1;top: 42px;left: 8px;padding: 5px;width: 56px;color: white;background: gray;text-align: center;'>展开</div><div id='zxl-close' style='border-radius: 5px;position: absolute;z-index: 1;top: 75px;left: 8px;padding: 5px;width: 56px;color: white;background: gray;text-align: center;'>收缩</div><div id='zxl-selectAll' style='border-radius: 5px;position: absolute;z-index: 1;top: 108px;left: 8px;padding: 5px;width: 56px;color: white;background: gray;text-align: center;'>选中全文</div><div style='border-radius: 5px;position: absolute;z-index: 1;left: 88px;top: 6px;color: white;background: gray;padding: 8px;width: 87%;border-radius: 5px;letter-spacing: 1px;'>说明：只有滚动到文档对应的页面后才会将其添加到这里，所以在原文中需要全文显示并且从上到下滚动一次!!!</div><div id='box' style='position:relative; width:100%; height:95%; overflow:auto; font-size: 18px; box-sizing: border-box;'></div>";
    	// 插入显示的div
    	document.body.insertBefore(div, document.querySelector("#doc"));
      // 绑定事件
      this._bindEvent();
  	},
    
    _bindEvent: function() {
      // 显示      
      let eleObjs = document.querySelectorAll("#zxl-show, #box");
      for(let i = 0; i < eleObjs.length; i++) {
        eleObjs[i].addEventListener("click", function() {
       		document.querySelector("#zxl-div").style.width = "971px"; 
      	}); 
      }      
      // 关闭      
      eleObjs = document.querySelectorAll("#zxl-close, #doc");
      for(let i = 0; i < eleObjs.length; i++) {
        eleObjs[i].addEventListener("click", function() {
       		document.querySelector("#zxl-div").style.width = "100px"; 
      	}); 
      }
      // 选中全文
      document.querySelector("#zxl-selectAll").addEventListener("click", function() {
        var range = document.createRange();  
        range.selectNode(document.querySelector("#box"));  
        window.getSelection().addRange(range);    
      });
    }
	};
	
  // 初始化
  box.init(); 
  // 页码表
  let pageIndexTable = [];
  // 记录页数
  let pageCount = 0;
  // 是否刷新，用来当内容与显示不一致强制刷新
  let doRefresh = false;
  
  setInterval(() => {    
    // 获取所有内容
    let pages = document.querySelectorAll(".reader-page");
    console.log("开始测试");
    for(let i = 0; i < pages.length; i++) {
      // 获取页码
      let page = pages[i];
      let pageHtml = "";
      let pageIndex = page.className.match(/.*(\d+)/)[1];      
      let pElements = page.querySelectorAll("p");      
      for(let j = 0; j < pElements.length; j++) {
        let pObj = pElements[j];
        // 获取样式
        let width  = Number(pObj.style.width.replace("px", ""));
        let height = Number(pObj.style.height.replace("px", ""));
        let top    = Number(pObj.style.top.replace("px", ""));
        let left   = Number(pObj.style.left.replace("px", ""));
        let color  = pObj.style.color;
        let pContent = pObj.innerHTML;
        let fontSize = Number(document.defaultView.getComputedStyle(pObj, null)["font-size"].replace("px", ""));        
        let lineHeight = Number(pObj.style.lineHeight.replace("px", ""));        
        let fontFamily = document.defaultView.getComputedStyle(pObj, null)["font-family"];                
        // 判断是否为换行符
        if(pContent == "&nbsp;\n") {
          pContent = "<br/>";
        }        
        // 判断3级父元素节点类型
        let parentNodeClassName = pObj.parentNode.parentNode.className;
        switch(parentNodeClassName) {
          case "reader-txt-layer": {
            top 			= top * 0.1;
            left 			= left * 0.1;
            width 		= Math.ceil(width * 0.1) + 1;
            height 		= height * 0.1;            
            fontSize 	= fontSize * 0.1;
            lineHeight = lineHeight * 0.1;
          } break;
          case "reader-pic-layer": {
						// 若是图片则不用缩放          
          } break;
          default: {
            top 			= top * 0.1;
            left 			= left * 0.1;
            width 		= Math.ceil(width * 0.1) + 1;
            height 		= height * 0.1;            
            fontSize 	= fontSize * 0.1;   
            lineHeight = lineHeight * 0.1;
          }
        }        
        // 连接页内每一句
        pageHtml += "<span style='position:absolute; color:" + color + ";  height:" + height + "px; top:" + top + "px; left:" + left + "px; font-size:" + fontSize + "px; line-height:" + lineHeight + "px; font-family:" + fontFamily + ";'>" + pContent + "</span>";
      }  
      if(pageIndexTable[Number(pageIndex)] == undefined || pageHtml.length > pageIndexTable[Number(pageIndex)].length) {
        if(pageHtml != "") {
          // 拼接单页div
         	pageHtml = "<div style='position:relative; width: 954px; height: 1343px; margin: 0 0 5px 0; background:white; color: black;'>" + pageHtml + "</div>";           
         	pageIndexTable[Number(pageIndex)] = pageHtml;  
        	doRefresh = true; 
        }
      }         
    }

    // 页数不同或需要强制刷新则更新
    if(pageIndexTable.length - 1 != pageCount || doRefresh) {
      let content = "";
      console.log(pageIndexTable);
      for(let key in pageIndexTable) {
        content += pageIndexTable[key];
      }          
      box.show(content);  
      box.setBackground("gray");
      if(pageIndexTable.length == 0) {
       	pageCount = 0; 
      } else {
        pageCount = pageIndexTable.length - 1;
      }      
      // 显示在界面
      document.querySelector("#zxl-count").innerHTML = "总页数：" + pageCount;
      doRefresh = false;
    }   
  }, 500);
  
};
