var basePath = "http://XXXX";

/**
 * 基础请求
 * @param {Object} dataSource
 */
function baseRequest(dataSource){
	$.ajax({
	    type: 'POST',
	    dataType : "json",
	    url: basePath+"/"+dataSource.url,
	    data:dataSource.param,
	    success: function(data) { 
	    	dataSource.success(data);
	    },
		error : function(e) {   
			console.log(JSON.stringify(e));
			dataSource.error();
	   	}  
	}); 
}

var loginPage = null;
function loginValidate(dataSource){
	var user = getGlobalAttribute("userInfo");
	console.log(JSON.stringify(user));
	if(user != null && notEmpty(user.id)){
		dataSource.success();
	}
	else{
		if(null == loginPage){
			if(null == getWebviewPage("login")){
	    		loginPage = mui.preload({
				    url:"../login.html",
				    id:"login",
				});
	    	}
	    	else{
	    		loginPage = getWebviewPage("login");
	    	}
		}
		mui.openWindow({
			id: "login"
		});
	}
}

/**
 * session获取值
 * @param {Object} name
 */
function getSessionAttribute(name){
	var stateText = sessionStorage.getItem(name) || "{}";
	return JSON.parse(stateText);
}
/**
 * session存储值
 * @param {Object} name
 * @param {Object} jsonObj
 */
function setSessionAttribute(name, jsonObj) {
	jsonObj = jsonObj || {};
	sessionStorage.setItem(name, JSON.stringify(jsonObj));
}
/**
 * session删除值
 * @param {Object} name
 */
function rmvSessionAttribute(name){
	sessionStorage.removeItem(name);
}

/**
 * 本地获取值
 * @param {Object} name
 */
function getGlobalAttribute(name) {

	//var stateText = localStorage.getItem(name) || "{}";
	var stateText = plus.storage.getItem(name) || "{}";
	return JSON.parse(stateText);
	
}
/**
 * 本地储存值
 * @param {Object} name
 * @param {Object} jsonObj
 */
function setGlobalAttribute(name, jsonObj) {

	jsonObj = jsonObj || {};
	plus.storage.setItem(name, JSON.stringify(jsonObj))
	//localStorage.setItem(name, JSON.stringify(jsonObj));
}
/**
 * 本地删除值
 * @param {Object} name
 */
function rmvGlobalAttribute(name) {
	plus.storage.removeItem(name);
	//localStorage.removeItem(name);
}

/**
 * 获取webview页面
 * @param {Object} key
 */
function getWebviewPage(key){
	return plus.webview.getWebviewById(key);
}
/**
 * 
 * @param {Object} key 页面标识
 * @param {Object} method 自定义方法
 * @param {Object} param 参数
 */
function openViewWithFire(key,method,param){
	var page = getWebviewPage(key);
	if(null == page){
		page = preLoadPage(key);
	}
	mui.fire(page,method,param);
	mui.openWindow({
		id:key
	});
}
/**
 * 预加载页面
 * @param {Object} key
 */
function preLoadPage(key){
	var page = mui.preload({
	    url:key+".html",
	    id:key,
	});
	return page;
}

/**
 * 为空验证
 * @param {Object} str
 */
function notEmpty(str){
	if(str != null && str != ''){
		return true;
	}
	else{
		return false;
	}
}

/**
 * 打开页面
 * @param {Object} flag
 */
function openpage(flag,id){
	if(id == null || id == ''){
		id = flag;
	}
	mui.openWindow({
		url: flag+'.html',
		id: id,
		show: {
			aniShow: 'pop-in'
		}
	});
}

/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if (loginInfo.account.length < 5) {
			return callback('账号最短为 5 个字符');
		}
		if (loginInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		}
		
		baseRequest({
			url:"app_login.ac",
			param:{
				username:loginInfo.account,
				password:loginInfo.password
			},
			success:function(data){
				if(data.msg == '1' || data.msg == 1){
					setGlobalAttribute("userInfo",data.userInfo);
					return callback();
				}
				else{
					return callback(data.msg);
				}
			},
			error:function(){
				return callback("服务器异常！");
			}
		});
	};

	owner.createState = function(name, callback) {
		var state = owner.getState();
		state.account = name;
		state.token = "token123456789";
		owner.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		if(checkNull(regInfo.account)){
			return callback('手机号不能为空');
		}

		if (!checkPhone(regInfo.account)) {
			return callback('手机号码不合法');
		}

		if(checkNull(regInfo.password)){
			return callback('密码不能为空');
		}
		if (regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}
		if (regInfo.password.length > 55) {
			return callback('密码太长');
		}
		if(checkNull(regInfo.nickname)){
			return callback('姓名不能为空');
		}
		if (regInfo.nickname.length > 55) {
			return callback('姓名不合法');
		}
		
		baseRequest({
			url:"app_reg.ac",
			param:{
				username:regInfo.account,
				password:regInfo.password,
				nickname:regInfo.nickname
			},
			success:function(data){
				if(data.msg == '1' || data.msg == 1){
					plus.nativeUI.toast('注册成功');
					$.openWindow({
						id: "login"
					});
				}
				else{
					return callback(data.msg);
				}
			},
			error:function(){}
		});
		
	};

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};
	
	var checkPhone = function(phone){
		return phone.length == 11;
	}
	
	var checkNull = function (str){
		return str == null || str == "" || str.length <= 0;
	}

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if (!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
			var settingsText = localStorage.getItem('$settings') || "{}";
			return JSON.parse(settingsText);
		}
		/**
		 * 获取本地是否安装客户端
		 **/
	owner.isInstalled = function(id) {
		if (id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if (mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch (e) {}
		} else {
			switch (id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}
}(mui, window.app = {}));



/**
 * 表单格式化JSON
 */
try {
	(function($) {
		$.fn.serializeJson = function() {
			var serializeObj = {};
			var array = this.serializeArray();
			var str = this.serialize();
			$(array).each(function() {
				/*var _this_value = encodeURIComponent(encodeURIComponent(this.value));*/
				var _this_value = this.value;
				if (serializeObj[this.name]) {
					if ($.isArray(serializeObj[this.name])) {
						serializeObj[this.name].push(_this_value);
					} else {
						serializeObj[this.name] = [serializeObj[this.name], _this_value];
					}
				} else {
					serializeObj[this.name] = _this_value;
				}
			});
			return serializeObj;
		};
		
		$.fn.serializeObject = function()    
		{    
		   var o = {};    
		   var a = this.serializeArray();    
		   $.each(a, function() {    
		       if (o[this.name]) {    
		           if (!o[this.name].push) {    
		               o[this.name] = [o[this.name]];    
		           }    
		           o[this.name].push(this.value || '');    
		       } else {    
		           o[this.name] = this.value || '';    
		       }    
		   });    
		   return o;    
		}; 
	})(jQuery);
} catch (e) {
	//TODO handle the exception
}


//判断是否为空,为空返回true
function isEmpty(s){
	if(!s){
		return true;
	}
	if(s.replace(/\s+/g,"") == ''){
		return true;
	}
	if(s == null){
		return true;
	}
	return false;
}

function notEmpty(s){
	return !isEmpty(s);
}

/**
 * 将返回的数据处理为json格式
 * @param {Object} data
 */
function pagingProcessing(data){
	data = $.parseJSON(data);
	if(null != data.respCode && data.respCode == 0){
		var respData = $.parseJSON(data.respData);
		data.respData = respData;
		if(data.respData.orderObjList == null || data.respData.totalCount == null ){
			data.respData.orderObjList = new Array();
			data.respData.totalCount = 0;
		}
	}
	return data;
}


function getLanguage(){
	var language = getGlobalAttribute("language");
	if(null == language){
		language = useLanguage("zh-cn");
	}
	return language
}

function useLanguage(code){
	var zhcn={
		languageFlag:"zh-cn",
		main_title:"主页",
		personal_title:"个人信息",
		nickname:"姓名",
		birthday:"生日",
		languageToggle:"语言切换",
		username:"用户名",
		email:"电子邮箱",
		password:"密码",
		changePassword:"更改密码",
		logout:"退出登录",
		login:"登陆",
		coupons:"优惠券",
		collect:"我的收藏"
		
	}
	
	var en={
		languageFlag:"en",
		main_title:"Home",
		personal_title:"Personal",
		nickname:"name",
		birthday:"birthday",
		languageToggle:"languageToggle",
		username:"username",
		email:"email",
		password:"password",
		changePassword:"changePassword",
		logout:"logout",
		login:"login",
		coupons:"coupons",
		collect:"collect"
		
	}
	
	
	
	if(code == "zh-cn"){
		setGlobalAttribute("language",zhcn);
	}
	else if(code == "en"){
		setGlobalAttribute("language",en);
	}
}


mui("nav").on("tap",'a',function(){
	$("nav a").each(function(i,obj){
		var span1 = $(obj).children().first();
		var styles = span1.attr("class");
		styles = styles.replace("-filled","");
		span1.attr("class",styles);
	});
	var thisStyle = $(this).children().first().attr("class");
	if(thisStyle.indexOf("mui-icon-map")== -1){
		thisStyle = thisStyle+"-filled";
	}
	
	$(this).children().first().attr("class",thisStyle);
	
});