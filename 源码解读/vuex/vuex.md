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
