[中文](README.md)

# vue-notify-event
Fire vue events to any component in whole components tree.

In vue child component we use `$emit` to fire event to parent component but we cannot fire event to ancestors components.

And in parent component we use `props` and child's `watch` to notify child component. This is not convenient and we cannot send event to grandson components.

Use this plugin, you can send events to anywhere of the vue components tree.

### 1. init this plugin
```
import Vue from 'vue'
import vueNotifyEvent from 'vue-notify-event'

Vue.use(vueNotifyEvent)
```

### 2. `$report` and `reported`
$report(eventName, argObj)

Fire events to parent or ancestors components, util `stopEvent()` called.

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

Fire events to whole sub tree below current component, include children and grandsons and great-grandsons components, util `stopEvent()` called.
##### [fnFilter]
function(comp: VueComponent) : Boolean

A function to filter sub components, component will be called when it return true. If no `fnFilter`, all is called.

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

Fire events to other-branch-components of whole tree, like siblings/uncle/cousin components and so on, util `stopEvent()` called.
##### fnCheckRoot
function(comp: VueComponent) : Boolean

`$notifyTree` first check `fnCheckRoot` upwards layer by layer, once it returns `true` then fire downwards `$notify` event to sub tree, util `stopEvent()` called.
##### [fnFilter]
function(comp: VueComponent) : Boolean

A function to filter sub components, component will be called when it return true. If no `fnFilter`, all is called.
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
