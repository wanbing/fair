/*
 * 用户的基础js，一般情况不需要改动
 */

let GLOBAL = {};

function invokeJSFunc(parameter) {
    if (parameter === null) {
        return null;
    }
    let map = JSON.parse(parameter);
    if ('method' === map['type']) {
        return _invokeMethod(map);
    } else if ('variable' === map['type']) {
        return _invokeVariable(map);
    }
    return null;
}

function _invokeVariable(par) {
    console.log('_invokeVariable' + JSON.stringify(par));
    let pName = par['pageName'];
    let varMap = par['args'];
    let curPage = GLOBAL[pName];
    let callResult = {
        pageName: pName,
        result: {}
    };
    if (!isNull(varMap) && Object.keys(varMap).length > 0) {
        Object.keys(varMap).forEach(function (varKey) {
            callResult['result'][varKey] = eval('curPage.' + varKey.toString());
        });
        return JSON.stringify(callResult);
    }
    //如果没有传参数，默认返回全部的变量以及结果值
    Object.keys(curPage).forEach(function (key) {
        if (!isFunc(curPage[key])) {
            callResult['result'][key] = eval('curPage.' + key.toString());
        }
    });
    return JSON.stringify(callResult);
}

function _invokeMethod(par) {
    let pageName = par['pageName'];
    let funcName = par['args']['funcName'];
    let args = par['args']['args'];

    if ('getAllJSBindData' === funcName) {
        return getAllJSBindData(par);
    }
    if ('releaseJS' === funcName) {
        return _release(par);
    }
    let mClass = GLOBAL[pageName];
    let func = mClass[funcName];
    let methodResult;
    if (isNull(func)) {
        methodResult = '';
    } else {
        if (Array.isArray(args)) {
            for (let key in args) {
                if (args.hasOwnProperty(key)) {
                    const value = args[key];
                    if (typeof value === 'object') {
                        invokeMethodArgsInterceptorManager.handle(value)
                        //入参被压缩为数组时，确保数组内所有元素经拦截器处理
                        const innerArgs = value;
                        for (let innerKey in innerArgs) {
                            if (innerArgs.hasOwnProperty(innerKey)) {
                                const innerValue = innerArgs[innerKey];
                                if (typeof innerValue === 'object') {
                                    invokeMethodArgsInterceptorManager.handle(innerValue)
                                }
                            }
                        }
                    }
                }
            }
        } else {
            console.log('_invokeMethod intercept failed, args is not array');
        }
        methodResult = func.apply(mClass, args);
    }
    let result = {
        pageName: pageName,
        result: {
            result: methodResult
        }
    };
    return JSON.stringify(result);
}

function _getAll(par) {
    let pageName = par['pageName'];
    let mc = GLOBAL[pageName];
    let bind = {}
    if (isNull(mc)) {
        return JSON.stringify(bind);
    }
    let bindFunc = [];
    let bindVariables = {};
    let keys;
    if (!isNull(keys = Object.keys(mc))) {
        for (let i = 0; i < keys.length; i++) {
            let k = keys[i];
            if (!mc.hasOwnProperty(k)) {
                continue;
            }
            if (isFunc(mc[k])) {
                bindFunc.push(k);
            } else {
                bindVariables[k] = mc[k];
            }
        }
    }
    bind['func'] = bindFunc;
    bind['variable'] = bindVariables;
    return bind;
}

//demo 获取所有的变量和绑定的方法
function getAllJSBindData(par) {
    let pageName = par['pageName'];
    let bind = _getAll(par);
    let result = {
        pageName: pageName,
        result: {
            result: bind
        }

    };
    return JSON.stringify(result);
}


function _release(par) {
    let pageName = par['pageName'];
    GLOBAL[pageName] = null;
    return null;
}


function isFunc(name) {
    return typeof name === "function";
}

function isNull(prop) {
    return prop === null || 'undefined' === prop
        || 'undefined' === typeof prop
        || undefined === typeof prop
        || 'null' === prop;
}

function setState(pageName, obj) {
    console.log('JS:setState()_before' + pageName + '-' + obj);
    let p = {};
    p['funcName'] = 'setState';
    p['pageName'] = pageName;
    // console.log('JS:setState(states)'+JSON.stringify(Object.getOwnPropertySymbols(obj)));
    obj();
    p['args'] = null;
    let map = JSON.stringify(p);
    console.log('JS:setState()' + map);
    invokeFlutterCommonChannel(map);
}
function mapOrSetToObject(arg) {

    if (Object.prototype.toString.call(arg) === '[object Map]') {
        let obj1 = {}
        for (let [k, v] of arg) {
            obj1[k] = mapOrSetToObject(v);
        }
        return obj1;
    }

    if (Object.prototype.toString.call(arg) === '[object Array]') {
        let obj2 = [];
        for (let k of arg) {
            obj2.push(mapOrSetToObject(k));
        }
        return obj2;
    }

    if (Object.prototype.toString.call(arg) === '[object Object]') {
        let keys = Object.getOwnPropertyNames(arg);
        let obj3 = {};
        for (let key of keys) {
            let value = arg[key];
            obj3[key] = mapOrSetToObject(value);
        }
        return obj3;
    }

    return arg;
}

const invokeFlutterCommonChannel = (invokeData, callback) => {
    console.log("invokeData" + invokeData)
    jsInvokeFlutterChannel(invokeData, (resultStr) => {
        console.log('resultStr' + resultStr);
        if (callback) {
            callback(resultStr);
        }
    });
};

class InvokeMethodArgsInterceptorManager {
    constructor() {
        this.interceptors = [];
    }

    // 注册拦截器
    use(interceptor) {
        if (typeof interceptor === 'function') {
            this.interceptors.push(interceptor);
        }
    }

    // 处理对象
    handle(object) {
        for (const interceptor of this.interceptors) {
            // 如果有拦截器返回 true，则停止处理并返回结果
            if (interceptor(object) === true) {
                return object;
            }
        }
        return object;
    }
}

// 创建一个拦截器管理器实例
const invokeMethodArgsInterceptorManager = new InvokeMethodArgsInterceptorManager();