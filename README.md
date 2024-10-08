[English](README-en.md)

# vue-notify-event
触发vue事件到整个组件树的任意组件。

在Vue中，我们通过`$emit`触发事件到父组件，但没法触发事件到再上层的祖先组件。

同时在父组件中我们通过`props`和`watch`传递事件给子组件。这并不方便，并且我们没法触发事件给再下层的孙组件。

使用本组件，你可以触发事件到整个组件树的任意地方。

### 1. 初始化组件
```
import Vue from 'vue'
import vueNotifyEvent from 'vue-notify-event'

Vue.use(vueNotifyEvent)
```

### 2. `$report` and `reported`
$report(eventName, argObj)

触发事件到上层父组件或祖先组件，直到调用了`stopEvent()`为止。

* Sample template:
```
<div>
    <ancestor>
        <ancestor2>
            ......
                <child></child>
            ......
        </ancestor2>
    </ancestor>
</div>
```
* Child component:
```
export const Child = {
    props: {},
    methods: {
        reportEvt() {
            var e = { par: 1 }
            this.$report('myEventName', e)
        },
    }
}
```

* Parent or ancestors component:
```
export const Ancestor = {
    props: {},
    reported: {
        myEventName(e) {
            console.log(e.par)
            e.stopEvent()
        }
    },
    methods: {
    }
}
```


### 3. `$notify` and `notified`
$notify(eventName, argObj[, fnFilter])

触发事件到当前组件下整个组件树的组件，包括所有子孙组件，直到调用了`stopEvent()`为止。
##### [fnFilter]
function(comp: VueComponent) : Boolean

过滤下层树组件的函数，返回true的组件才会被调用。可以不传，此时所有组件都被调用。

* Sample template:
```
<div>
    <ancestor>
        <ancestor2>
            ......
                <child></child>
            ......
        </ancestor2>
    </ancestor>
</div>
```

* Parent or ancestors component:
```
export const Ancestor = {
    props: {},
    methods: {
        notifyEvt() {
            var e = { par: 2 }
            this.$notify('myNotify', e, comp => compo.needMyEvt)
        },
    }
}
```

* Child component:
```
export const Child = {
    props: {},
    data(){
        return { needMyEvt: true }
    },
    notified: {
        myNotify(e) {
            console.log(e.par)
            e.stopEvent()
        }
    },
    methods: {
    }
}
```



### 4. `$notifyTree` and `notified`
$notifyTree(eventName, fnCheckRoot, argObj[, fnFilter])

触发事件到当前组件树的其他分支上的组件，如兄弟组件、堂兄第组件、姑舅组件等等，直到调用了`stopEvent()`为止。
##### fnCheckRoot
function(comp: VueComponent) : Boolean

`$notifyTree`先向上逐层校验`fnCheckRoot`，一旦返回`true`时，再向下触发`$notify`事件到下层树，直到调用了`stopEvent()`为止。
##### [fnFilter]
function(comp: VueComponent) : Boolean

过滤下层树组件的函数，返回true的组件才会被调用。可以不传，此时所有组件都被调用。
* Sample template:
```
<div>
    <root>
        <ancestor>
            <ancestor2>
                ......
                    <child></child>
                    <sibling></sibling>
                ......
            </ancestor2>
            <uncle>
                ......
                    <cousin></cousin>
                ......
            </uncle>
        </ancestor>
        <comp2></comp2>
        ......
    </root>
</div>
```

* Child component:
```
export const Child = {
    props: {},
    methods: {
        sendEvt() {
            var e = { par: 3 }
            this.$notifyTree('clanEvt', comp => compo.isMyRoot, e)
        },
    }
}
```

* Ancestor component:
```
export const Ancestor = {
    data() {
        return { isMyRoot: true }
    }
}
```

* Cousin or other component:
```
export const Cousin = {
    props: {},
    notified: {
        clanEvt(e) {
            console.log(e.par)
            e.stopEvent()
        }
    },
    methods: {
    }
}
```
