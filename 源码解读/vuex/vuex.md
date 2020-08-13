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
install方法中，Vue对象作为第一个参数被传入。

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

applyMixin方法:

```javascript
export default function (Vue) {
  const version = Number(Vue.version.split('.')[0])

  if (version >= 2) {
    // VUE2.0以上
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    const _init = Vue.prototype._init
    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit () {
    const options = this.$options
    // store injection
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
}
```

在beforeCreate钩子函数中混入vuexInit函数，通过vuexInit方法，让每个vue实例都会拥有$store对象。这样，每个组件的beforeCreate的时候都可以拿到store实例。

## Store的实例化过程

```javascript
export class Store {
  constructor (options = {}) {
    // Auto install if it is not done yet and `window` has `Vue`.
    // To allow users to avoid auto-installation in some cases,
    // this code should be placed here. See #731
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.Vue)
    }

    if (__DEV__) {
      assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`)
      assert(typeof Promise !== 'undefined', `vuex requires a Promise polyfill in this browser.`)
      assert(this instanceof Store, `store must be called with the new operator.`)
    }

    const {
      plugins = [],
      strict = false
    } = options

    // store internal state
    this._committing = false
    this._actions = Object.create(null)
    this._actionSubscribers = [] // 订阅actions变化的订阅者
    this._mutations = Object.create(null)
    this._wrappedGetters = Object.create(null)
    this._modules = new ModuleCollection(options) // 初始化modules。构建一个module的树。
    this._modulesNamespaceMap = Object.create(null)
    this._subscribers = [] // 订阅mutations变化的订阅者
    this._watcherVM = new Vue()
    this._makeLocalGettersCache = Object.create(null)

    // bind commit and dispatch to self
    const store = this
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    } // 执行this.dispatch时，保证dispatch上下文是store
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }

    // strict mode
    this.strict = strict

    const state = this._modules.root.state

    // init root module.
    // this also recursively registers all sub-modules
    // and collects all module getters inside this._wrappedGetters
    installModule(this, state, [], this._modules.root)

    // initialize the store vm, which is responsible for the reactivity
    // (also registers _wrappedGetters as computed properties)
    // getters和state建立依赖关系，变成响应式
    resetStoreVM(this, state)

    // apply plugins
    plugins.forEach(plugin => plugin(this))

    const useDevtools = options.devtools !== undefined ? options.devtools : Vue.config.devtools
    if (useDevtools) {
      devtoolPlugin(this)
    }
  }
  ...
}
```

以上构造函数逻辑，重点关注到三个点

1. modules初始化 `this._modules = new ModuleCollection(options)`
2. installModule `installModule(this, state, [], this._modules.root)`
3. resetStoreVM `resetStoreVM(this, state)`

### this._modules = new ModuleCollection(options)

通过new ModuleCollection形成一颗模块树：

例子：

```javascript
const moduleA = {
  state: { c: 2 },
  mutations: { ... },
  actions: { ... },
  getters: { ... }
}

const moduleB = {
  state: { d: 4 },
  mutations: { ... },
  actions: { ... },
  getters: { ... },
}

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  },
  state: {
    kk: 1
  },
  mutations: {...},
  actions: {...},
  getters: {...}
})
```

上面例子最终的树形结构是:

```javascript
const tree = {
  runtime: false,
  _children: {
    a: {
      runtime: false,
      _children: {},
      _rawModule: {
        state: {
          c: 2
        },
        mutations: { ... },
        actions: { ... },
        getters: { ... }
      },
      state: {
        c: 2
      }
    },
    b: {
      runtime: false,
      _children: {},
      _rawModule: {
        state: {
          d: 4
        },
        mutations: { ... },
        actions: { ... },
        getters: { ... }
      },
      state: {
        d: 4
      }
    }
  }, // 存储子modules
  _rawModule: {
    modules: {
      a: moduleA,
      b: moduleB
    },
    state: {
      kk: 1
    },
    mutations: {...},
    actions: {...},
    getters: {...}
  }, // 原始的module（root module (Vuex.Store options)）
  state: {
    kk: 1
  } // rawModule.state
}
```

看一下ModuleCollection类的实现：

```javascript
export default class ModuleCollection {
  constructor (rawRootModule) {  // rawRootModule ==> options
    // register root module (Vuex.Store options)
    this.register([], rawRootModule, false)
  }
  ...
}
```

1. 构造函数中，注册「根模块」节点。

```javascript
export default class ModuleCollection {

  ...

  register (path, rawModule, runtime = true) {
    if (__DEV__) {
      assertRawModule(path, rawModule)
    }

    // 创建了一个 Module 的实例
    // Module 是用来描述单个模块的类
    const newModule = new Module(rawModule, runtime)
    // 根module
    // {
    //   runtime: false,
    //   _children: {}, // 存储子modules
    //   _rawModule: {
    //     modules: {
    //       a: moduleA,
    //       b: moduleB
    //     },
    //     state: {
    //       kk: 1
    //     },
    //     mutations: {...},
    //     actions: {...},
    //     getters: {...}
    //   }, // 根module（root module (Vuex.Store options)）
    //   state: {
    //     kk: 1
    //   } // rawModule.state
    // }
    if (path.length === 0) {
      // 根模块
      this.root = newModule
    } else {
      // 父module和子module建立父子关系
      const parent = this.get(path.slice(0, -1))
      //  ==> this.get([])
      // parent ==> this.root 根module
      parent.addChild(path[path.length - 1], newModule)
      // root.addChild('a', a对应的module实例对象)
    }

    // register nested modules 递归注册嵌套的module
    if (rawModule.modules) { // rawModule.modules ==> {a: {...}, b: {...}}
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        // 注册子模块 a、b
        this.register(path.concat(key), rawChildModule, runtime)
      })
    }
  }
}
```

2. 
`const parent = this.get(path.slice(0, -1))`
`parent.addChild(path[path.length - 1], newModule)`

首先根据路径获取到父模块，然后再调用父模块的 addChild 方法建立父子关系。

```javascript
export default class ModuleCollection {

  ...

  get (path) {
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root)
  }
  // 根据path找到当前模块的父模块。
}
```

调用父模块的addChild方法。
定义在单个模块类（module）的addChild方法

```javascript
export default class Module {
  constructor (rawModule, runtime) {
    this.runtime = runtime
    // Store some children item
    this._children = Object.create(null)
    // Store the origin module object which passed by programmer
    this._rawModule = rawModule
    const rawState = rawModule.state

    // Store the origin module's state
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {}
  }

  ...

  addChild (key, module) {
    this._children[key] = module // this._children['a'] = 子module实例对象
  }

  ...
}
```

3. 遍历当前模块定义中的所有modules，根据key作为path，递归调用register方法。

```javascript
if (rawModule.modules) { // rawModule.modules ==> {a: {...}, b: {...}}
  forEachValue(rawModule.modules, (rawChildModule, key) => {
    // 注册子模块 a、b
    this.register(path.concat(key), rawChildModule, runtime)
  })
}
```

总结：
对于 root module 的下一层 modules 来说，它们的 parent 就是 root module，那么他们就会被添加的 root module 的 _children 中。每个子模块通过路径找到它的父模块，然后通过父模块的 addChild 方法建立父子关系，递归执行这样的过程，最终就建立一颗完整的模块树。
