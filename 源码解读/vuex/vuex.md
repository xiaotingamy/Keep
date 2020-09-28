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
    Vue.mixin({ beforeCreate: vuexInit }) // 全局注册一个混入，影响注册之后所有创建的每个 Vue 实例。也就是所有组件实例都能访问到this.$store的原因。
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

这里我们看到使用了`Vue.mixin`全局注册一个混入，影响注册之后所有创建的每个 Vue 实例。这也就是所有组件实例都能访问到this.$store的原因。而从vueInit函数中可以看出this.$store存储了store实例对象。

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
  }, // rawModule.state
  namespace: false
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

对于 root module 的下一层 modules 来说，它们的 parent 就是 root module，那么他们就会被添加的 root module 的 _children 中。每个子模块通过路径找到它的父模块，然后通过父模块的 addChild 方法建立父子关系，递归执行这样的过程，最终就建立一颗完整的模块树。

### installModule
作用：遍历module树，给_acitons、_mutations、_wrappedGetters赋值。
完成了模块下的 state、getters、actions、mutations 的初始化工作，并且通过递归遍历的方式，就完成了所有子模块的安装工作。

```javascript
function installModule (store, rootState, path, module, hot) {
  const isRoot = !path.length
  const namespace = store._modules.getNamespace(path) // 生成当前路径（当前模块）的namespace字段：如果是根模块，namespace就是‘’，如果是子模块的就是模块key+'/'，如果'a/'。

  // register in namespace map
  if (module.namespaced) {
    if (store._modulesNamespaceMap[namespace] && __DEV__) {
      console.error(`[vuex] duplicate namespace ${namespace} for the namespaced module ${path.join('/')}`)
    }
    store._modulesNamespaceMap[namespace] = module
  } // 生成一个_modulesNamespaceMap, namespace为key, 对应模块对象为value

  // set state
  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))  // 获取当前模块的父state对象
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      if (__DEV__) {
        if (moduleName in parentState) {
          console.warn(
            `[vuex] state field "${moduleName}" was overridden by a module with the same name at "${path.join('.')}"`
          )
        }
      }
      Vue.set(parentState, moduleName, module.state)
    })
  }

  const local = module.context = makeLocalContext(store, namespace, path)  // 构造一个本地上下文环境，返回一个local对象【里面重写了dispatch、commit，代理了getters、state】

  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })

  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })

  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })

  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}
```

```javascript
function makeLocalContext (store, namespace, path) {
  const noNamespace = namespace === ''

  const local = {
    dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)  // 参数重代，如果第一个参数是对象，那么参数需要移个位置
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) {
        // 做上下文命名空间的拼接‘a/方法名’ 例：‘a/increment’
        type = namespace + type
        if (__DEV__ && !store._actions[type]) {
          console.error(`[vuex] unknown local action type: ${args.type}, global type: ${type}`)
          return
        }
      }

      return store.dispatch(type, payload)
    },

    commit: noNamespace ? store.commit : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) {
        type = namespace + type
        if (__DEV__ && !store._mutations[type]) {
          console.error(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
          return
        }
      }

      store.commit(type, payload, options)
    }
  }

  // getters and state object must be gotten lazily
  // because they will be changed by vm update

  // getters和state需使用代理的方式，因为他们是响应式的
  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? () => store.getters
        : () => makeLocalGetters(store, namespace)
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  })

  return local
}
// 返回一个local上下文对象，在registerMutation、forEachAction、forEachGetter中需要传入

function makeLocalGetters (store, namespace) {
  if (!store._makeLocalGettersCache[namespace]) {
    const gettersProxy = {}
    const splitPos = namespace.length
    Object.keys(store.getters).forEach(type => { // 'a/increment'  'a/'是namespace
      // skip if the target getter is not match this namespace
      if (type.slice(0, splitPos) !== namespace) return

      // extract local getter type
      const localType = type.slice(splitPos) // 'a/increment' => localType = increment

      // Add a port to the getters proxy.
      // Define as getter property because
      // we do not want to evaluate the getters in this time.
      Object.defineProperty(gettersProxy, localType, {
        get: () => store.getters[type],
        enumerable: true
      })
    })
    store._makeLocalGettersCache[namespace] = gettersProxy
  }
  return store._makeLocalGettersCache[namespace]
}

function getNestedState (state, path) {
  return path.reduce((state, key) => state[key], state)
}

```

```javascript
// 往store._mutations添加mutations key是带命名空间的type，value是存放mutation方法的数组
store._mutations: {
  'a/increment': [mutation函数, ...],
  'b/increment': [mutation函数, ...]
}

function registerMutation (store, type, handler, local) {
  const entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload)
  })
}

function registerAction (store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = [])
  entry.push(function wrappedActionHandler (payload) {
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload)
    if (!isPromise(res)) {
      res = Promise.resolve(res)
    }
    if (store._devtoolHook) {
      return res.catch(err => {
        store._devtoolHook.emit('vuex:error', err)
        throw err
      })
    } else {
      return res
    }
  })
}

// 同理给store._wrappedGetters加值
function registerGetter (store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    if (__DEV__) {
      console.error(`[vuex] duplicate getter key: ${type}`)
    }
    return
  }
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  }
}
```

### resetStoreVM （数据获取）

resetStoreVM(this, state)，初始化store._vm
建立getters和state之间的联系。getters的获取依赖了state。

```javascript
function resetStoreVM (store, state, hot) {
  const oldVm = store._vm

  // bind store public getters
  store.getters = {}
  // reset local getters cache
  store._makeLocalGettersCache = Object.create(null)
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    // direct inline function use will lead to closure preserving oldVm.
    // using partial to return function with only arguments preserved in closure environment.
    computed[key] = partial(fn, store)   // 相当于 computed[key] = () => fn(store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  const silent = Vue.config.silent
  Vue.config.silent = true
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  Vue.config.silent = silent

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store)
  }

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }
}
```

1. 定义computed对象。
首先遍历_wrappedGetters, 这个对象的key是type，fn就是wrappedGetter函数。`computed[key] = () => fn(store)`执行了fn函数，返回rawGetter函数，也就是用户自定义的getter函数。

```javascript
store._wrappedGetters[type] = function wrappedGetter (store) {
  return rawGetter(
    local.state, // local state
    local.getters, // local getters
    store.state, // root state
    store.getters // root getters
  )
}
```

2.实例化一个Vue实例store._vm，并把`computed`传入

```javascript
store._vm = new Vue({
  data: {
    $$state: state  // 这里的state是rootState
  },
  computed  // 上面定义的computed对象，{[type]: rawGetter(...), ...}
})
```

Store中访问store.state的时候会执行get state()函数，实际上访问到store._vm._data.$$state

```javascript
get state () {
  return this._vm._data.$$state  // store._vm._data.$$state
}
```

```javascript
forEachValue(wrappedGetters, (fn, key) => {
  computed[key] = partial(fn, store)   // 相当于 computed[key] = () => fn(store)
  Object.defineProperty(store.getters, key, {
    get: () => store._vm[key],
    enumerable: true // for local getters
  })
})
```

我们根据key访问store.getters中的某个getter时，访问到store._vm[key]，也就访问到了computed[key]，然后就会执行rawGetter(local.state,...)也就是用户自定义的getter方法，第一个参数local.state，会访问到getNestedState，那么就会访问到store.state，进而访问到store._vm._data.$$state。这样就建立了一个依赖关系。

如果store.state发生了变化，用户再次访问store.getters中的getter时会重新计算拿到最新的state值。

### 数据存储

数据存储实际是对state中数据做操作，通过执行mutations中定义的方法。
store类中定义了两个方法，commit 和 dispatch

#### commit

首先看下commit的定义：commit方法让我们提交一个mutation

```javascript
commit (_type, _payload, _options) {
  // check object-style commit
  const {
    type,
    payload,
    options
  } = unifyObjectStyle(_type, _payload, _options)

  const mutation = { type, payload }
  const entry = this._mutations[type]
  if (!entry) {
    if (__DEV__) {
      console.error(`[vuex] unknown mutation type: ${type}`)
    }
    return
  }
  // 遍历store._mutations[type]中的方法并执行传入的handler。
  this._withCommit(() => {
    entry.forEach(function commitIterator (handler) {
      handler(payload)
    })
  })

  this._subscribers
    .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
    .forEach(sub => sub(mutation, this.state))

  if (
    __DEV__ &&
    options && options.silent
  ) {
    console.warn(
      `[vuex] mutation type: ${type}. Silent option has been removed. ` +
      'Use the filter functionality in the vue-devtools'
    )
  }
}
```

从store._mutations找到对应的函数数组，遍历它们执行获取到每个handler然后执行，实际上就是执行了wrappedMutationHandler(playload)，接着会执行我们定义的mutation函数，并传入当前模块的state。这样就实现了对当前模块的state的修改。

#### dispatch

dispatch的特点：必须返回一个promise

看一下dispatch的定义：

```javascript
dispatch (_type, _payload) {
  // check object-style dispatch
  const {
    type,
    payload
  } = unifyObjectStyle(_type, _payload) // 参数重代

  const action = { type, payload }
  const entry = this._actions[type]
  if (!entry) {
    if (__DEV__) {
      console.error(`[vuex] unknown action type: ${type}`)
    }
    return
  }

  try {
    this._actionSubscribers
      .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
      .filter(sub => sub.before)
      .forEach(sub => sub.before(action, this.state))
  } catch (e) {
    if (__DEV__) {
      console.warn(`[vuex] error in before action subscribers: `)
      console.error(e)
    }
  }

  const result = entry.length > 1
    ? Promise.all(entry.map(handler => handler(payload))) // 这里说明了要dispatch的函数必须返回promise
    : entry[0](payload)

  return new Promise((resolve, reject) => {
    result.then(res => {
      try {
        this._actionSubscribers
          .filter(sub => sub.after)
          .forEach(sub => sub.after(action, this.state))
      } catch (e) {
        if (__DEV__) {
          console.warn(`[vuex] error in after action subscribers: `)
          console.error(e)
        }
      }
      resolve(res)
    }, error => {
      try {
        this._actionSubscribers
          .filter(sub => sub.error)
          .forEach(sub => sub.error(action, this.state, error))
      } catch (e) {
        if (__DEV__) {
          console.warn(`[vuex] error in error action subscribers: `)
          console.error(e)
        }
      }
      reject(error)
    })
  })
}
```

从store._actions找到对应的函数数组，遍历它们执行获取到每个handler然后执行，执行wrappedActionHandler(payload)，接着会执行我们定义的action函数，并传入一个对象。传入对象包含了当前模块下的 dispatch、commit、getters、state，以及全局的state和getters，所以我们定义的action函数能拿到当前模块下的commit方法。

这里注意，在我们注册模块时的makeLocalContext方法保证了不同的模块都调用其自身模块下的mutations或actions方法。

