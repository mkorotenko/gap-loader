
(function(){

  var func = function(method1)
  {
  	var met = method1;
  	window["super_"+met] = XMLHttpRequest.prototype[met];
  	return function(){
  	  //OPEN
  	  if(met==='open'){
    	  var url = arguments[1];
    	  if(url.indexOf('index.html')>0){
    	    this._reqURL = arguments[1];
    	    this._overloaded = true;
    	    Object.defineProperties(this, {
    	      "readyState": {
      	      get: function(){return this._readyState || 0;},
      	      set: function(st){this._readyState = st;},
      	    },
      	    "response": {
      	      get: function(){return this._response || "";},
      	      set: function(st){this._response = st;},
      	    },
      	    "responseText": {
      	      get: function(){return this._responseText || "";},
      	      set: function(st){this._responseText = st;},
      	    },
      	    "responseURL": {
      	      get: function(){return this._responseURL || "";},
      	      set: function(st){this._responseURL = st;},
      	    },
      	    "status": {
      	      get: function(){return this._status || 0;},
      	      set: function(st){this._status = st;},
      	    },
      	    "statusText": {
      	      get: function(){return this._statusText || "";},
      	      set: function(st){this._statusText = st;},
      	    }
      	  });
    	    this.readyState = 1;
    	    return;
    	  }
    	  else {
    	    return window["super_"+met].apply(this,arguments);
    	  }
  	  }
  	  //SEND
  	  else{
  	    if(this._overloaded === true){
  	      var timeout = function(){
            switch(this.readyState){
              case 1: 
                this.readyState = 2;
                setTimeout(timeout.bind(this),2);
                this.onreadystatechange();
                break;
              case 2: 
                this.readyState = 3;
                setTimeout(timeout.bind(this),2);
                this.onreadystatechange();
                break;
              case 3:
                var req = new XMLHttpRequest();
        				window["super_open"].call(req,"GET", this._reqURL, false);
        				window["super_send"].call(req,null);
        				var l = req.responseText;
                console.log(this._reqURL + ' loaded by OVERLOADED!');
                this.readyState = 4;
                this.response = l;
                this.responseText = l;
                this.responseURL = this._reqURL;
                this.status = 200;
                this.statusText = "OK";
                this.onreadystatechange();
                break;
            }
          };
          setTimeout(timeout.bind(this),2);
  	    }
    	  else {
    	    return window["super_"+met].apply(this,arguments);
    	  }
  	  }
  	};
  };
  XMLHttpRequest.prototype.open = func('open');
  XMLHttpRequest.prototype.send = func('send');

	function ajaxJS(url, callbackFunction) {
		var that=this;      
		this.updating = false;
		this.error = false;
		this.ready = false;
		// if(window.$) this['def']=$.Deferred();
		// if(window.$) this['evl']=$.Deferred();

		this.update = function(passData,postMethod) { 
			if (that.updating===true) { return false; }
			that.updating=true;                       
			var AJAX = null;                          
			if (window.XMLHttpRequest) {              
			  AJAX=new XMLHttpRequest();              
			} else {                                  
			  AJAX=new ActiveXObject("Microsoft.XMLHTTP");
			}                                             
			if (AJAX===null) {                             
			  return false;                               
			} else {
			  AJAX.onreadystatechange = function() {  
				if (AJAX.readyState==4) {             
				  that.updating=false;                
				  that.callback(AJAX.responseText,AJAX.status,AJAX.responseXML);        
				  //delete AJAX;                                         
				}                                                      
			  };                                                        
			  var timestamp = new Date(),
			    uri;
			  if (postMethod=='POST') {
  				uri=(urlCall||'')+'?'+timestamp.getTime();
  				AJAX.open("POST", uri, true);
  				AJAX.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  				AJAX.send(passData);
  			} else {
  				uri=(urlCall||'')+'?'+passData+'×tamp='+(timestamp*1); 
  				AJAX.open("GET", uri, true);                             
  				AJAX.send(null);                                         
			  }              
			  return true;                                             
			}                                                                           
		};
		var urlCall = url;
		this.callbackFunction = callbackFunction;
		this.evaluate = function(){
			if(this.updating||this.error) return false;
			this.ready = true;
			if (this.responseStatus==200) {
				var wEval=function(responseText){
					eval(responseText);
				};
				try{
					wEval.call(window,this.responseText);
				}
				catch (err){
					console.log('ERROR rt: ' + err);
				}
				if(this.evl) this.evl.resolveWith(this);
				return true;
			}
			else{
				console.log('ERROR: responseStatus=='+this.responseStatus);
				this.error=true;
				return false;
			}
		};
		this.callback = function (responseText, responseStatus) {
			this.responseText=responseText;
			this.responseStatus=responseStatus;
			if(this.callbackFunction) this.callbackFunction();
		};
	}

	var lPath=window.deviceModule.path? window.deviceModule.path.href:window.deviceModule.pathLink;
	var path=lPath;
	
 	var onJQueryReady=function(){
		window.onerror=function(){
			$('<h4>').text('window.onerror').appendTo($('body'));
		};
		var PadHTML = new ajaxJS(path+'/index.html',function(){
			var cHtml=this.responseText,
				fHead=$(/<head>([^\0]+)<\/head>/gim.exec(cHtml)[1]).filter('[accessory!="desktopOnly"]');
			var baseURI = 'file:///android_asset/www/';
			//Относительные ссылки сделаем абсолютными
			fHead.filter('link').each(function(){this.href=this.href.replace(baseURI,path+'/');});
			try{
				$('head').append(fHead);
			}
			catch (exc){
				$('<h4>').text('Loading: '+exc+'').appendTo($('body'));
			}
			for(var ht=0; ht<fHead.length; ht++){
				if(fHead[ht].nodeType!=3) $('<h4>').text(fHead[ht].outerHTML+'').appendTo($('body'));
			}
			
			$('body').html(/<body>([^\0]+)<\/body>/gim.exec(cHtml)[1]);

		});
		PadHTML.update();
 	};
	
 	var jQueryJS = new ajaxJS(lPath+'/js/jquery-1.11.3.min.js',function(){if(this.evaluate()) onJQueryReady();});
 	jQueryJS.update();

})();