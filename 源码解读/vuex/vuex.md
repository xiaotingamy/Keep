# vuex

## vuex和全局对象不同点

* vuex是响应式的。当vue组件从store中读取状态的时候，如果store中的状态发生变化，那么相应组件也会相应的得到更新。（getters）
* 规则：不能直接改变store中的值，改变store中的值的唯一路径就是mutation。（单向数据流，便于跟踪每个状态的变化）

## vuex安装过程

```javascript
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
```

Vue.use会执行install方法
延伸：vue源码中Vue.use的实现：

```javascript
export function initUse (Vue) {
  Vue.use = function (plugin) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      // 插件已被安装
      return this // 这里的this指向什么？是Vue对象
    }

    const args = toArray(argumengts, 1) // 参数转为真正的数组
    args.unshift(this) // Vue对象作为install的第一个参数

    if (typeof plugin.install === 'function') {
      // 如果插件有install方法则执行install方法
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      // 如果plugin是函数，直接执行函数
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this // 这里的this指向什么？是Vue对象
  }
}
```

接着看一下Vuex的install方法：

```javascript
let Vue // 这里用了一个全局的Vue去接受Vue对象，不需要单独import Vue
function install (_Vue) {
  if (Vue && _Vue === Vue) {
    if (__DEV__) {
      console.error('')
    }
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}
```

源码文件：src/index.js

```javascript
export default {
  Store,
  install,
  version: '__Version__',
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers
}
```

混入vuexInit函数，通过vuexInit方法，让每个vue实例都会拥有$store对象。每个组件的beforeCreate的时候都可以拿到store实例。

## Store的实例化过程

```javascript
export class Store {
  
}
```
