package com.wuba.fair.v8;

import com.eclipsesource.v8.V8;
import com.eclipsesource.v8.V8Array;
import com.wuba.fair.FairPlugin;
import com.wuba.fair.callback.JsResultCallback;
import com.wuba.fair.constant.FairConstant;
import com.wuba.fair.jsexecutor.JSExecutor;
import com.wuba.fair.utils.FairFileUtil;

/**
 * v8引擎加载文件控制
 */
public class V8Executor extends JSExecutor {

    private V8 v8 = FairPlugin.get().getV8();

    /**
     * 释放 js引擎，目前Android端采用的是google的v8引擎
     */
    @Override
    public void release() {
        v8.release(true);
    }

    /**
     * 加载本地js文件，该文件可能是assert目录下的文件或者是用户下载的文件存储在
     * 缓存中的文件地址
     *
     * @param filePath 文件地址,本地地址，或者assert
     * @param complete 加载结果的回调
     */
    @Override
    public void loadJS(String filePath, JsResultCallback<String> complete) {
        String js = FairFileUtil.getScript(filePath);
        v8Object = v8.executeObjectScript(js);

        if (complete != null) {
            complete.call("result");
        }

    }

    /**
     * 执行js的操作，这个操作包括获取js侧变量、方法、js脚本结果等，
     * js侧只通过一个方法分发其它操作
     *
     * @param src js侧需要的参数，一般是一个json格式的字符串
     * @return 结果
     */
    @Override
    public Object invokeJSChannel(Object src) {
        V8Array array = new V8Array(v8);
        return v8.executeFunction(FairConstant.INVOKE_JS_FUNC, array);
    }

}
