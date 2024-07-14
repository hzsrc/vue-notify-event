module.exports = { install }

function install(Vue) {
    // 通告事件：
    // 提供一种从上往下（父组件向子孙组件）广播事件的机制。与$emit方向相反，一对多。因为要遍历，性能不太好，且跨级传递不利于理清关联，不要滥用
    //子组件通过 notified 配置钩子捕捉事件。事件处理完，调用stopEvent()之后，则不再广播
    //默认情况，分支优先递归执行。设置parObj.leafFirst优先递归叶子节点
    Vue.prototype.$notify = function (eventName, parObj, filter) {
        var children = this.$children;
        parObj = fixArg(parObj)
        for (var i = 0; i < children.length; i++) {
            var child = children[i]
            if (!child._isVue) continue; //忽略原生节点

            if (parObj.leafFirst) {
                child.$notify(eventName, parObj, filter) //递归，叶子节点优先执行
                if (parObj._stop) return parObj
            }

            var notified = mergeOpt(child, 'notified')
            if (notified) {
                var fn = notified[eventName]
                if (fn && (!filter || filter(child))) {
                    if (process.env.NODE_ENV === 'development')
                        if (!parObj._noLog) console.log('$notify', eventName, 'to:', fn)
                    fn.call(child, parObj)
                    if (parObj._stop) return parObj
                }
            }

            if (!parObj.leafFirst) {
                child.$notify(eventName, parObj, filter) //递归，主分支优先执行（默认）
                if (parObj._stop) return parObj
            }
        }
    }

    //汇报事件：
    //提供一种从下往上（子孙组件向祖先组件）广播事件的机制。与$emit类似，但会一直向上冒泡。一对多。
    //上级组件通过 reported 事件钩子捕捉事件。事件处理完，调用stopEvent()之后，则不再向上冒泡
    Vue.prototype.$report = function (eventName, parObj) {
        var parent = this.$parent;
        parObj = fixArg(parObj)
        if (!parent || parent === this || !parent._isVue) return parObj;
        var reported = mergeOpt(parent, 'reported')
        if (reported) {
            var fn = reported[eventName]
            if (fn) {
                if (process.env.NODE_ENV === 'development')
                    if (!parObj._noLog) console.log('$report', eventName, 'to:', fn)
                fn.call(parent, parObj)
                if (parObj._stop) return parObj
            }
        }
        parent.$report(eventName, parObj)
    }

    //先往上找到根节点，然后通知整个树的所有组件
    //注意树要尽可能小
    Vue.prototype.$notifyTree = function (eventName, checkRoot, parObj, filter) {
        var parent = this.$parent;
        while (parent) {
            if (checkRoot(parent)) {
                if (process.env.NODE_ENV === 'development')
                    if (!parObj._noLog) console.log('$notifyTree', eventName, 'root:', parent.$options.__file)
                parent.$notify(eventName, parObj, filter)
                return
            }
            parent = parent.$parent
        }
        console.warn('No node found')
    }

    //参数增加stopEvent方法。建议直接传递简单对象作参数 {...}
    function fixArg(parObj) {
        //不是简单对象的，作为val属性
        if (({}).toString.call(parObj) !== '[object Object]') parObj = { val: parObj }
        if (!('stopEvent' in parObj)) parObj.stopEvent = function () {
            this._stop = true
        }
        return parObj
    }

    //需要考虑extends和mixins
    function mergeOpt(vm, prop) {
        var opt = vm.$options
        var objs = [opt[prop]]
        if (opt.extends) objs.push(opt.extends[prop]);
        (opt.mixins || []).map(function (mixin) {
            objs.push(mixin[prop])
        })
        objs = objs.filter(function (o) {
            return o
        })
        if (!objs[0]) return null;

        var r = {}
        objs.map(function (obj) {
            Object.assign(r, obj)
        })
        return r
    }
}
