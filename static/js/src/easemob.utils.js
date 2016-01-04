/*
    Easemob widget utils
    version: 1.0.0
*/
;(function(window, undefined) {
    'use strict';

    var EasemobWidget = EasemobWidget || {};
    EasemobWidget.utils = EasemobWidget.utils || {};

	EasemobWidget.utils.encode = function ( str, history ) {
		if ( !str || str.length === 0 ) return "";
		var s = '';
		s = str.replace(/&amp;/g, "&");
		s = s.replace(/<(?=[^o][^)])/g, "&lt;");
		s = s.replace(/>/g, "&gt;");
		//s = s.replace(/\'/g, "&#39;");
		s = s.replace(/\"/g, "&quot;");
		s = s.replace(/\n/g, "<br>");
		return s;
	};

	EasemobWidget.utils.decode = function ( str ) {
		if ( !str || str.length === 0 ) return "";
		var s = '';
		s = str.replace(/&amp;/g, "&");
		return s;
	};

    EasemobWidget.utils.getIEVersion = function() {
        var ua = navigator.userAgent,matches,tridentMap={'4':8,'5':9,'6':10,'7':11};
        matches = ua.match(/MSIE (\d+)/i);
        if(matches&&matches[1]) {
            return +matches[1];
        }
        matches = ua.match(/Trident\/(\d+)/i);
        if(matches&&matches[1]) {
            return tridentMap[matches[1]]||null;
        }
        return null;
    };
   
    EasemobWidget.utils.queryString = function(url, key) {//queryString
        var r = url.match(new RegExp('[?&]?'+key+'=[0-9a-zA-Z%@._-]*[^&]', 'g'));
        r = r && r[0] ? (r[0][0]=='?' || r[0][0]=='&' ? r[0].slice(1) : r[0]) : '';

        return r.slice(key.length+1);
    };

    EasemobWidget.utils.getConfig = function(key, searchScript){//get config from current script
        var that;
        if(key && searchScript) {
            var scripts = document.scripts;
            for(var s = 0, l=scripts.length; s<l; s++) {
                if(scripts[s].src && 0 < scripts[s].src.indexOf(key)) {
                    that = scripts[s].src;
                    break;
                }
            }
        } else if(key) {
            that = key;
        } else {
            that = location.href;
        }

        var obj = {};
        if(!that) {
            return {
                str: ''
                , json: obj
                , domain: ''
            };
        }

        var tmp,
            idx = that.indexOf('?'),
            sIdx = that.indexOf('//') > -1 ? that.indexOf('//') : 0,
            domain = that.slice(sIdx, that.indexOf('/', sIdx + 2)),
            arr = that.slice(idx+1).split('&');
        
        obj.src = that.slice(0, idx);
        for(var i=0,len=arr.length;i<len;i++) {
            tmp = arr[i].split('=');
            obj[tmp[0]] = tmp.length>1 ? decodeURIComponent(tmp[1]) : '';
        }
        return {
            str: that
            , json: obj
            , domain: domain
        };
    };
    EasemobWidget.utils.isAndroid = /Android/i.test(navigator.userAgent);//is mobile
    EasemobWidget.utils.isMobile = /mobile/i.test(navigator.userAgent);//is mobile
    EasemobWidget.utils.isQQBrowserInAndroid = EasemobWidget.utils.isAndroid && /MQQBrowser/.test(navigator.userAgent);

    var _on = function(target, ev, fn) {
        if(target.addEventListener) {
            target.addEventListener(ev, fn);
        } else if(target.attachEvent) {
            target.attachEvent('on' + ev, fn);
        } else {
            target['on' + ev] = fn;
        }
    };
    var _remove = function(target, ev, fn) {
        if(target.removeEventListener) {
            target.removeEventListener(ev, fn);
        } else if(target.detachEvent) {
            target.detachEvent('on' + ev, fn);
        } else {
            target['on' + ev] = null;
        }
    };

    EasemobWidget.utils.on = _on;
    EasemobWidget.utils.remove = _remove;

    /*
        detect the browser if minimize
    */
    EasemobWidget.utils.isMin = function() {
        if(document.visibilityState && document.visibilityState == 'hidden' || document.hidden) {
            return true;
        } 
    };

    /*
     * message transfer
     * easemob.com
     * 1.0.0
    */
    var EmMessage = (function(){
       
        //attribute
        var _supportPostMessage = 'postMessage' in window;

        //method
        var _hasHash = function(url) {
            var idx = url.lastIndexOf('/'),
                idxj = url.lastIndexOf('#');

            if(0 > idxj) return false;
            if(url.indexOf('#') > idx && idxj != url.length) return true;
        };
        var _parseHash = function(url, key) {
            var res = url.match(new RegExp(key + '\\w*' + key, 'g'));
            return res ? 
                res[0] ? res[0].slice(key.length, -key.length) : ''
                : '';
        };
        var _getMsg = function(key, url) {
            var str = key.toString(),
                arr = url.match(new RegExp(str + '\\w*' + str, 'g'));
            if(arr) {
                return arr[0].slice(str.length, -str.length);
            }
            return '';
        };
        var _appendMsg = function(key, msg, url) {
            return url.replace(new RegExp(key + '\\w*' + key, 'g'), key + msg + key);
        };
        
        //core: message
        var Message = function(iframeId, prefix){
            
            if(!(this instanceof Message)) {
                 return new Message();
            }
            this.t = new Date().getTime();
            this.iframe = document.getElementById(iframeId);
            this.prefix = prefix || '_em_';
            delete this.t;
        };
        Message.prototype.sendToParent = function(msg){
            if(typeof msg !== 'string') {
                throw 'msg must be string';
            }

            if(_supportPostMessage) {
                window.parent.postMessage(msg, '*');
                return this;
            }

            return this;
        };
        Message.prototype.sendToIframe = function(msg){
            if(typeof msg !== 'string') {
                throw 'msg must be string';
            }

            if(_supportPostMessage) {
                this.iframe.contentWindow.postMessage(msg, '*');
                return this;
            }
            
            var src = this.iframe.getAttribute('src');
            if(_hasHash(src)) {
                if(_getMsg(this.prefix, src)) {
                    this.iframe.setAttribute('src', _appendMsg(this.prefix, msg, src));
                } else {
                    this.iframe.setAttribute('src', src + '&' + this.prefix + msg + this.prefix);
                }
            } else {
                this.iframe.setAttribute('src', src += '#' + this.prefix + msg + this.prefix);
            }

            return this;
        };
        Message.prototype.listenToParent = function(callback){
            if(_supportPostMessage) {
                _on(window, 'message', function(e){
                    callback(e.data);
                });
                return this;
            }
            if(window.onhashchange) {
                window.onhashchange = function(){
                    callback(_parseHash(location.href, this.prefix));
                };
            } else {
                var that = this;
                var memHref = location.href,
                    sit = setInterval(function(){
                        var curHref = location.href;
                        if(curHref != memHref) {
                            memHref = curHref;
                            callback(_parseHash(curHref, that.prefix));
                        }
                    }, 50);
            }

            return this;
        };
        Message.prototype.listenToIframe = function(callback){
            if(_supportPostMessage) {
                _on(window, 'message', function(e){
                    callback(e.data);
                });
            }
            return this;
        };

        return Message;
    }());
    
    var c = {
        setcookie: function(key, value) {
            var date = new Date();
            date.setTime(date.getTime() + 30*24*3600*1000);
            document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) + ';path=/;expires=' + date.toGMTString();
        }
        , getcookie: function(key) {
            var results = document.cookie.match('(^|;) ?' + encodeURIComponent(key) + '=([^;]*)(;|$)'); 
            return results ? decodeURIComponent(results[2]) : '';
        }
    };

    /*
        date format
    */
    Date.prototype.format = function(fmt) {
        var o = {
            'M+': this.getMonth()+1//月份
            , 'd+': this.getDate()//日
            , 'h+': this.getHours()//小时
            , 'm+': this.getMinutes()//分
            , 's+': this.getSeconds()//秒
        };
        
        if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        }
        for(var k in o) {
            if(new RegExp("("+ k +")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
            }
        }
        return fmt;   
    };

    /*
        open
    */
    window.EasemobWidget = EasemobWidget;
    window.TransferMessage = EmMessage;
    window.Emc = c;
}(window, undefined));
