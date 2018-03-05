/*
*开始...
*/

;(function (global,factory) {
    
    if (typeof define == "function" && define.amd){
    	define(["$"],factory);
    	return;
    }
    //es6
    if(typeof(module) !== 'undefined'){
    	module.exports = factory();
    	return;
    }
    //cmd的模块形式没有写

    factory().init();
})(window,function(){
	var LocalUrl = location.href;//该网页url
	var getListUrl = "/article/Home/article/getmyarticlelist";
	var getGroupUrl = "/article/Home/article/getgroup";
	
	var artilceprefixurl = "/article/articles/m/";
	var mockData = [{
		articleid : "42423942944",
		articleauthorid : "6823732",
		articletitle : "大学生，你可以不读书，但是不能不学习!",
		articleauthor : "三方一把刀",
		aType : 2,
		articleimg1 : "https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=2906276322,3401388055&fm=55&s=5F2FB84409433ECCA856DC9F0300508B&w=121&h=81&img.JPEG",
	}];
	//模拟分组
	var mockGroup = [{name:"新闻",id:1001},{name:"教育",id:1001}];
	var page = {	
		init : function(){
			console.log("运行初始化方法。。。");
			
			this.initVue(this.vueMethods());
			// window.open("http://www.aishihuixiaogou.com/mymedia/pages/authorwall.html");
		},

		//初始化vue
		initVue : function(methods){
			new Vue({
			  	el: '#app',
			  	data: {
			    	scanmore : true,//浏览更多
			    	infolist : [],//信息列表
			    	defaultitem : "",//默认选中的类型
			    	defaultupdatetime : 5,//默认重新获取信息的时间间隔
			    	userinfo : {},//用户信息
			    	groups : [],//分组
			    	maxid : 0,//文章最大id
			    	minid : 0,//文章最小id
			  	},
			  	methods :  methods,

			  	beforeMount : function(){
			  		//this.groups = this.getDataFromLocalStorage("groups") || [];

			  		//先从localStorage内部获取短期内的数据
			  		this.userinfo = this.getDataFromLocalStorage("userinfo")||{};//用户数据
			  		// var localStorage = this.getDataFromLocalStorage("all");
			  		//获取一下最近一次存储的时间
			  		var lastTime = this.getDataFromLocalStorage("lasttime")||0;
			  		//在获取当前时间戳(毫秒级别)
			  		var timestamp = Date.parse(new Date());

			  		var toppx = 0;//距离顶部有多远
			  		if(((timestamp-lastTime<this.defaultupdatetime*60*1000))&&lastTime>1000){
			  			var infolist = [];
			  			try{
			  				toppx = this.getDataFromLocalStorage("toppx") || 0;
			  				infolist = this.getDataFromLocalStorage("infolist");
			  				
			  			}catch(e){
			  				console.log("e",e);
			  			}
			  			this.infolist = infolist;
			  			this.goToTop(toppx);
			  		}else{

			  			//判断如果是间隔超过了规定时间，则直接请求列表,如果超过的时间超过一天，则需要把存储在本地localstorage列表数据清除
				  		//自动获取初始化的列表
				  		this.getList();
				  		if(timestamp - lastTime>24*60*60*1000){
			  				this.removeLocalStorage("infolist");
			  				this.removeLocalStorage("lasttime");
			  			}
			  		}

			  		this.getGroup();//获取分组
			  	}
			});
		},
		//vue的方法
		vueMethods : function(){
			return {
				//回到顶部
				goToTop : function(px){
					var top = px || 0;
					window.scrollTo(0,px);
					// setTimeout(function(){window.scrollTo(0,0)},1000); 
				},
				refresh : function(){
					this.getList(null,true);//刷新请求
					this.getGroup(null,true);
				},
				formatDateTime :function (inputTime) {    
				    var date = new Date(inputTime);  
				    var y = date.getFullYear();    
				    var m = date.getMonth() + 1;    
				    m = m < 10 ? ('0' + m) : m;    
				    var d = date.getDate();    
				    d = d < 10 ? ('0' + d) : d;    
				    var h = date.getHours();  
				    h = h < 10 ? ('0' + h) : h;  
				    var minute = date.getMinutes();  
				    var second = date.getSeconds();  
				    minute = minute < 10 ? ('0' + minute) : minute;    
				    second = second < 10 ? ('0' + second) : second;   
				    return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;    
				},
	  			//获取列表
	  			getList : function(data,isfresh){
	  				var self = this;
	  				var userid = self.userid;
	  				if(typeof data =="object"&&data!=null){
	  					data.userid = userid||1000;
	  					data.minid = self.minid;
	  					data.maxid = self.maxid;
	  				}else{
	  					data = {};
	  					data.userid = userid||1000;
	  					data.minid = self.minid;
	  					data.maxid = self.maxid;
	  				}
	  				
	  				var options = {data:data||{userid:userid},cache:false};
	  				options.url = getListUrl;
	  				request.regularRequest(options,function(res){
	  					if(res.code==1){
	  						var data = res.data;

	  						for(var i in data){
	  							var item = data[i];
	  							item.articleurl = artilceprefixurl + item.articleauthorid + "/" + item.articleid+".html";
	  							try{
	  								item.articletimestamp =  self.formatDateTime(item.articleid/1);
	  							}catch(e){
	  								console.log(e);
	  							}
	  							if(self.maxid<item.articleid){
	  								self.maxid = item.articleid;
	  							}
	  							if(self.minid>item.articleid&&self.minid>0){
	  								self.minid = item.articleid;
	  							}else{
	  								self.minid = item.articleid;
	  							}

	  							if((!item.articleimg1)&&(!item.articleimg2)&&(!item.articleimg3)){
	  								item.aType = 0;
	  							}
	  							if(item.articleimg1?true:item.articleimg2?true:item.articleimg3?true:false){
	  								item.aType = 2;
	  							}
	  							if(item.articleimg1&&item.articleimg2&&item.articleimg3){
	  								item.aType = 1;
	  							}

	  						}
	  						//如果是刷新的话，自动回到顶部，并且新刷出来的新闻需要放到数组前面
	  						if(isfresh){
	  							// self.infolist = self.infolist.concat(data);
	  						}else{
	  							// self.infolist = data.concat(self.infolist);
	  						}
	  						self.infolist = data.concat(self.infolist);
	  						if(self.infolist.length>1){
	  							self.setDataIntoLocalStorage("infolist",self.infolist);
	  						}
	  						// self.scanmore = false;
	  						self.scanmore = true;
	  						self.goToTop();
	  					}
	  				},function(err){

	  				});
	  			},
	  			//获取分组
	  			getGroup : function(data,isfresh){

	  				var self = this;
	  				var options = {data:data||{},cache:false};
	  				options.url = getGroupUrl;
	  				request.regularRequest(options,function(res){
	  					if(res.code==1){
	  						var data = res.data;
	  						self.groups = data;
	  						self.setDataIntoLocalStorage("groups",self.groups);
	  					}
	  				},function(err){

	  				});
	  			},
	  			//点击进入读取
	  			clickReadArticle : function(item){
	  				console.log(item);
	  				this.doSomeRecord(item);
	  				var articleurl = item.articleurl;
	  				window.location.href = articleurl;

	  			},
	  			//做一些本地存储记录
	  			doSomeRecord : function(item){
	  				var record = {};
	  				record.groupid = item.articlegroupid;
	  				record.authorid = item.articleauthorid;
	  				record.artilcetype1 = item.artilcetype1;
	  				record.artilcetype2 = item.artilcetype2;
	  				record.artilcetype3 = item.artilcetype3;
	  				this.setDataIntoLocalStorage("record",record);
	  				var scrolltop = document.body.scrollTop  || window.scrollY;
	  				this.setDataIntoLocalStorage("scrolltop",scrolltop);
	  				var timestamp = Date.parse(new Date());
	  				this.setDataIntoLocalStorage("lasttime",timestamp);
	  			},

	  			//获取更多列表数据
	  			getMore : function(){
	  				
	  				var arr = [];
	  				var obj = this.deepClone(this.infolist[0]);
	  				if(typeof obj !="object"){
	  					this.getList();
	  					return;
	  				}else{
	  					obj.aType=10;//type 10为刚才阅读到这里，点击查看查看更多
	  					arr.push(obj);
	  				}
	  				this.infolist = arr.concat(this.infolist);
	  				this.getList();
	  				
	  			},
	  			//从localStorage内部取数据
				getDataFromLocalStorage: function(key){

					if(localStorage){
						if(key=="all"){
							return JSON.parse(localStorage.getItem(LocalUrl)||"{}");
						}
						var localObj = JSON.parse(localStorage.getItem(LocalUrl)||"{}");//获取该网页的所有localStorage；

						return localObj[key];
					}else{
						return ({key:''})[key];
					}
				},
				//将数据存放到localStorage
				setDataIntoLocalStorage: function (key,value){
					if(localStorage){
						
						//当前该网页的localstorage
						var localObj = JSON.parse(localStorage.getItem(LocalUrl)||"{}");
						
						localObj[key]  = value;

						value = JSON.stringify(localObj);

						localStorage.setItem(LocalUrl,value);
					}
				},
				//移除localStorage里面的存储数据
				removeLocalStorage : function(key){

					/*
					if(localStorage){
						localStorage.removeItem(key||"");
					}*/
					if(!localStorage)return;
					//当前该网页的localstorage
					var localObj = JSON.parse(localStorage.getItem(LocalUrl)||"{}");
					
					delete localObj[key]

					value = JSON.stringify(localObj);

					localStorage.setItem(LocalUrl,value);
				},
				clearLocalStorage : function(clearUserInfo){
					/*
					if(localStorage){
						localStorage.clear();
						//清除掉用户信息之后重新存储用用户信息
						if(!clearUserInfo){
							this.setDataIntoLocalStorage("userinfo",this.userinfo);
						}
						
					}
					*/
					if(!localStorage)return;
					

					localStorage.setItem(LocalUrl,"{}");
					//清除掉用户信息之后重新存储用用户信息
					if(!clearUserInfo){
						this.setDataIntoLocalStorage("userinfo",this.userinfo);
					}
				},
				//js进行深拷贝
				deepClone : function (data){
					function getType(obj){
				       	//tostring会返回对应不同的标签的构造函数
				       	var toString = Object.prototype.toString;
				       	var map = {
				          	'[object Boolean]'  : 'boolean', 
				          	'[object Number]'   : 'number', 
				          	'[object String]'   : 'string', 
				          	'[object Function]' : 'function', 
				          	'[object Array]'    : 'array', 
				          	'[object Date]'     : 'date', 
				          	'[object RegExp]'   : 'regExp', 
				          	'[object Undefined]': 'undefined',
				          	'[object Null]'     : 'null', 
				          	'[object Object]'   : 'object'
				      	};
				      	if(obj instanceof Element) {
				           	return 'element';
				      	}
				      	return map[toString.call(obj)];
					}

			       var type = getType(data);
			       var obj;
			       if(type === 'array'){
			           obj = [];
			       } else if(type === 'object'){
			           obj = {};
			       } else {
			           //不再具有下一层次
			           return data;
			       }
			       if(type === 'array'){
			           for(var i = 0, len = data.length; i < len; i++){
			               obj.push(this.deepClone(data[i]));
			           }
			       } else if(type === 'object'){
			           for(var key in data){
			               obj[key] = this.deepClone(data[key]);
			           }
			       }
			       return obj;
			   }

	  		}
		}
	}


	//请求函数
	var request = {
		

		regularRequest : function(options,sucfn,errFn){
			if(typeof options.data == "object" ){
				//options.data.operatorid = this.operatorid;
			}
			var $ = axios;
			$.post(options.url,options.data,{
				url : options.url,
				type : "post",
				cache : options.cache || false,
				timeout :options.time || 10000,//设置超时时间为10s
		      	data : options.data,  
		        dataType: "json",
		        transformRequest: [function (data) {
				    // Do whatever you want to transform the data
				    let ret = ''
				    for (let it in data) {
				      ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
				    }
				    return ret
				}],
		      	success : function(res){
		      		sucfn(res);
		      	},
		      	error : function(err){
		      		errFn(err);
		      	}
			}).then(function(res){
				sucfn(res.data);
			}).catch(function(err){
			 	errFn(err);
			});
		},
		//自定义的ajax
		ajax: function(options,sucfn,errFn){
			var options = options || {};
			//生成xhr对象
			function createXhr(){
				if(typeof XMLHttpRequest != 'undefined'){
					var xhr = new XMLHttpRequest();
					return xhr;
				}else if(typeof ActiveXObject != 'undefined'){
					// var versions = ['MSXML2.XMLHttp.6.0','MSXML2.XMLHttp.3.0','MSXML2.XMLHttp'];
					var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp", "Microsoft.XMLHttp"];
					for (var i = 0; i < versions.length; i ++) {
						try {
							return new ActiveXObject(version[i]);
						} catch (e) {
							//跳过
						}
					}
				} else {
					throw new Error('您的浏览器不支持XHR对象！');
				}
			}
			var xhr = new createXhr();
			xhr.open(options.type ||'get', options.url, options.async==false?false:true); //设置了异步
			xhr.setRequestHeader("Content-Type", options["contentType"] || "application/x-www-form-urlencoded");

			xhr.send(options.data);
			if (xhr.status == 200&&xhr.readyState == 4) { //如果返回成功了
				var data = xhr.responseText;
				if(options.dataType=="json"||options.dataType=="JSON"){
					data = eval(data);
				}else if (dataType == "xml" || dataType == "XML") {
                    //接收xml文档    
                   data =  xhr.responseXML;
                }

				if(Object.prototype.toString.call(sucfn)=="function"){
					sucfn(data);
				}
			} else {
				if(Object.prototype.toString.call(errFn)=="function"){
					errFn(xhr.statusText);
				}
				
			}

		}

	
	}

	//懒加载插件
	var lazyLoad = {
		
		init : function(cb){
			var self = this;
			//判断onload看是否是一个方法
			if(Object.prototype.toString.call(window.onload)=="[object Function]"){
				window.ready = function(){
					setTimeout(function(){
						self.load(cb);
					},3000);
				}
				return;
			}

			window.onload = function(){
				self.load(cb);
			}
			
		},
		load : function(cb){
			function getFixed(obj){
			　　//获取非行间属性
			　　function getStyle(obj,styleName){
			　　　　if (obj.currentStyle){
			　　　　　　return obj.currentStyle[styleName];
			　　　　}
			　　　　else{
			　　　　　　return getComputedStyle(obj,null)[styleName];
			　　　　}
			　　}
			　　//要获取图片相对网页顶部的距离，但图片有被定位的父级
			　　var iLeft=0; 
			　　var iTop=0;
			　　var oParent=obj;
			　　while(oParent){
			　　　　if (oParent.tagName=="HTML"){
			　　　　　　break;
			　　　　}
			　　　　iLeft+=oParent.offsetLeft;
			　　　　iTop+=oParent.offsetTop;
			　　　　if (oParent!=obj){
			　　　　　　iLeft+=parseInt(getStyle(oParent,"borderWidth"));//offsetLeft不包括边框，因此要把边框加上
			　　　　　　iTop+=parseInt(getStyle(oParent,"borderWidth"));
			　　　　}
			　　　　oParent=oParent.offsetParent;
			　　}
			　　return [iLeft,iTop];//当 break 后itop就是图片相对网页顶部的距离
			}
			//获取整个img标签
			var aImg=document.getElementsByTagName("img");
			
		　　var bodyScrollTop=document.body.scrollTop||document.documentElement.scrollTop;
		　　var scrollBottom=bodyScrollTop+document.documentElement.clientHeight;
			
		　　for (var i=0; i<aImg.length; i++){
		　　　　if (getFixed(aImg[i])[1]<=scrollBottom){//此时说明这图片已经在可视区域内，应该开始加载了
		　　　　　　aImg[i].src=aImg[i].getAttribute("_src");
		　　　　}
		　　}
		}
	}

	return page;
});


