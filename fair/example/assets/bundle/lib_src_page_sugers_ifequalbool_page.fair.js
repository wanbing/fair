GLOBAL['#FairKey#']=(function(__initProps__){const __global__=this;function _State(){const inner=_State.__inner__;if(this==__global__){return new _State({__args__:arguments});}else{const args=arguments.length>0?arguments[0].__args__||arguments:[];inner.apply(this,args);_State.prototype.ctor.apply(this,args);return this;}}_State.__inner__=function inner(){this.fairProps=__initProps__;this._count=0;};_State.prototype={getTitle:function getTitle(){const __thiz__=this;with(__thiz__){return fairProps.__op_idx__('pageName');}},onTapText:function onTapText(){const __thiz__=this;with(__thiz__){_count=_count+1;setState('#FairKey#',function dummy(){});}},_countCanMod2:function _countCanMod2(){const __thiz__=this;with(__thiz__){return _count%2==1;}},initState:function initState(){const __thiz__=this;with(__thiz__){fairProps=widget.fairProps;}},};_State.prototype.ctor=function(){Object.prototype.ctor.call(this);};;return _State();})(convertObjectLiteralToSetOrMap(JSON.parse('#FairProps#')));