GLOBAL['#FairKey#']=(function(__initProps__){const __global__=this;defineModule(1,function(__mod__){with(__mod__.imports){}},[]);return runCallback(function(__mod__){with(__mod__.imports){function HomeItemData(){const inner=HomeItemData.__inner__;if(this==__global__){return new HomeItemData({__args__:arguments});}else{const args=arguments.length>0?arguments[0].__args__||arguments:[];inner.apply(this,args);HomeItemData.prototype.ctor.apply(this,args);return this;}}HomeItemData.__inner__=function inner(){this.imagePath='';};HomeItemData.prototype={};HomeItemData.prototype.ctor=function(){};function _HomeScrollViewState(){const inner=_HomeScrollViewState.__inner__;if(this==__global__){return new _HomeScrollViewState({__args__:arguments});}else{const args=arguments.length>0?arguments[0].__args__||arguments:[];inner.apply(this,args);_HomeScrollViewState.prototype.ctor.apply(this,args);return this;}}_HomeScrollViewState.__inner__=function inner(){this._listData=[];this._page=0;};_HomeScrollViewState.prototype={onLoad:function onLoad(){const __thiz__=this;with(__thiz__){requestData();}},onUnload:function onUnload(){const __thiz__=this;with(__thiz__){}},requestData:function requestData(){const __thiz__=this;with(__thiz__){_page++;FairNet().request(convertObjectLiteralToSetOrMap({['pageName']:'#FairKey#',['method']:'GET',['url']:'https://wos2.58cdn.com.cn/DeFazYxWvDti/frsupload/3158c2fc5e3ed9bc08b34f8d694c763d_home_scroll_data.json',['data']:convertObjectLiteralToSetOrMap({['page']:_page,}),['success']:function dummy(resp){if(resp==null){return null;}let data=resp.__op_idx__('data');data.forEach(function dummy(item){let dataItem=HomeItemData();try{dataItem.imagePath=item.imageUrl;}catch(e){dataItem.imagePath=item.__op_idx__('imageUrl');}_listData.add(dataItem);});setState('#FairKey#',function dummy(){});},}));}},isDataEmpty:function isDataEmpty(){const __thiz__=this;with(__thiz__){return _listData.isEmpty;}},_getImagePath:function _getImagePath(index){const __thiz__=this;const __arg_ctx__={index,};with(__thiz__){with(__arg_ctx__){return _listData.__op_idx__(index).imagePath;}}},};_HomeScrollViewState.prototype.ctor=function(){};;return _HomeScrollViewState();}},[1]);})(convertObjectLiteralToSetOrMap(JSON.parse('#FairProps#')));