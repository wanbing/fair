GLOBAL['#FairKey#']=(function(__initProps__){const __global__=this;return runCallback(function(__mod__){with(__mod__.imports){function UrlLauncherPageState(){const inner=UrlLauncherPageState.__inner__;if(this==__global__){return new UrlLauncherPageState({__args__:arguments});}else{const args=arguments.length>0?arguments[0].__args__||arguments:[];inner.apply(this,args);UrlLauncherPageState.prototype.ctor.apply(this,args);return this;}}UrlLauncherPageState.__inner__=function inner(){this._phone='18888888888';this._message='This is a message from 58';this._url='https://m.58.com';};UrlLauncherPageState.prototype={_onPhoneTextChanged:function _onPhoneTextChanged(text){const __thiz__=this;const __arg_ctx__={text,};with(__thiz__){with(__arg_ctx__){_phone=text;}}},_onMessageTextChanged:function _onMessageTextChanged(text){const __thiz__=this;const __arg_ctx__={text,};with(__thiz__){with(__arg_ctx__){_message=text;}}},_makePhoneCall:function _makePhoneCall(){const __thiz__=this;with(__thiz__){FairUrlLauncher.makePhoneCall(_phone);}},_sendSMS:function _sendSMS(){const __thiz__=this;with(__thiz__){FairUrlLauncher.sendSMS({phoneNumber:_phone,message:_message});}},_sendMail:function _sendMail(){const __thiz__=this;with(__thiz__){FairUrlLauncher.sendMail({email:_phone,message:_message});}},_launchInBrowser:function _launchInBrowser(){const __thiz__=this;with(__thiz__){FairUrlLauncher.launchInBrowser(_url);}},_launchInWebViewOrVC:function _launchInWebViewOrVC(){const __thiz__=this;with(__thiz__){FairUrlLauncher.launchInWebViewOrVC(_url);}},_launchInWebViewWithoutJavaScript:function _launchInWebViewWithoutJavaScript(){const __thiz__=this;with(__thiz__){FairUrlLauncher.launchInWebViewWithoutJavaScript(_url);}},_launchInWebViewWithoutDomStorage:function _launchInWebViewWithoutDomStorage(){const __thiz__=this;with(__thiz__){FairUrlLauncher.launchInWebViewWithoutDomStorage(_url);}},_launchUniversalLinkIos:function _launchUniversalLinkIos(){const __thiz__=this;with(__thiz__){FairUrlLauncher.launchUniversalLinkIos(_url);}},};UrlLauncherPageState.prototype.ctor=function(){};;return UrlLauncherPageState();}},[]);})(convertObjectLiteralToSetOrMap(JSON.parse('#FairProps#')));