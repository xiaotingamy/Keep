# vuex api

## 回顾一下vuex store初始化过程

以下面代码为例子，回顾一下store的初始化过程，有兴趣可以粘贴这段代码debugger一下。

```javascript
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'

Vue.use(Vuex)

Vue.config.productionTip = false

const moduleA = {
  namespaced: true,
  state: () => ({
    countA: 10,
    pointX: 10,
    pointY: 10
  }),
  mutations: {
    increment (state) {
      state.countA++
    },
    moveX (state, step) {
      state.pointX += step
    },
    moveY (state, step) {
      state.pointY += step
    }
  },
  actions: {
    incrementIfOddOnRootSum ({ state, commit, rootState }) {
      if ((state.countA + rootState.count) % 2 === 1) {
        commit('increment')
      }
    }
  },
  getters: {
    doubleCount (state) {
      return state.countA * 2
    },
    sumWithRootCount (state, getters, rootState) {
      return state.countA + rootState.count
    }
  }
}

const moduleB = {
  namespaced: true,
  state: () => ({
    countB: 20
  }),
  mutations: {
    increment (state) {
      state.countB++
    }
  },
  actions: {
    incrementIfOddOnRootSum ({ state, commit, rootState }) {
      if ((state.countB + rootState.count) % 2 === 1) {
        commit('increment')
      }
    }
  },
  getters: {
    doubleCount (state) {
      return state.countB * 2
    },
    sumWithRootCount (state, getters, rootState) {
      return state.countB + rootState.count
    }
  }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  },
  state: {
    count: 50
  },
  mutations: {
    increment (state) {
      state.count++
    },
    incrementBy (state, amount) {
      state.count += amount
    }
  },
  actions: {
    incrementIfOdd ({ state, commit}) {
      if (state.count % 2 === 1) {
        commit('increment')
      }
    }
  },
  getters: {
    doubleCount (state) {
      return state.count * 2
    }
  }
})

new Vue({
  // 把 store 对象提供给 “store” 选项，这可以把 store 的实例注入所有的子组件
  store,
  render: h => h(App),
}).$mount('#app')
```

*第一步*，`this._modules = new ModuleCollection(options)`，初始化_modules，将modules组成一个树形结构。

如上例，形成的树形结构如下：

```javascript
this._modules = {
  runtime: false,
  state: {
    count: 50
  },
  _children: {
    a: {
      namespaced: true,
      runtime: false,
      state: {
        countA: 10
        pointX: 10
        pointY: 10
      },
      _children: {},
      _rawModule: {
        namespaced: true,
        state: () => ({
          countA: 10,
          pointX: 10,
          pointY: 10
        }),
        mutations: {
          increment (state) {
            state.countA++
          },
          moveX (state, step) {
            state.pointX += step
          },
          moveY (state, step) {
            state.pointY += step
          }
        },
        actions: {
          incrementIfOddOnRootSum ({ state, commit, rootState }) {
            if ((state.countA + rootState.count) % 2 === 1) {
              commit('increment')
            }
          }
        },
        getters: {
          doubleCount (state) {
            return state.countA * 2
          },
          sumWithRootCount (state, getters, rootState) {
            return state.countA + rootState.count
          }
        }
      }
    },
    b: {
      namespaced: true,
      runtime: false,
      state: {
        countB: 20
      },
      _children: {},
      _rawModule: {
        namespaced: true,
        state: () => ({
          countB: 20
        }),
        mutations: {
          increment (state) {
            state.countB++
          }
        },
        actions: {
          incrementIfOddOnRootSum ({ state, commit, rootState }) {
            if ((state.countB + rootState.count) % 2 === 1) {
              commit('increment')
            }
          }
        },
        getters: {
          doubleCount (state) {
            return state.countB * 2
          },
          sumWithRootCount (state, getters, rootState) {
            return state.countB + rootState.count
          }
        }
      }
    }
  },
  _rawModule: {
    modules: {
      a: {
        // 这里省略子模块moduleA中的具体内容
        namespaced: true,
        state: () => ({ ... }),
        mutations: { ... },
        actions: { ... },
        getters: { ... }
      },
      b: {
        // 这里省略子模块moduleB中的具体内容
        namespaced: true,
        state: () => ({ ... }),
        mutations: { ... },
        actions: { ... },
        getters: { ... }
      }
    },
    state: {
      count: 50
    },
    mutations: {
      increment (state) {
        state.count++
      }
    },
    actions: {
      incrementIfOddOnRootSum ({ state, commit, rootState }) {
        if ((state.countA + rootState.count) % 2 === 1) {
          commit('increment')
        }
      }
    },
    getters: {
      doubleCount (state) {
        return state.countA * 2
      },
      sumWithRootCount (state, getters, rootState) {
        return state.countA + rootState.count
      }
    }
  }
}
```

![set](./_modules.png)

*第二步*，根据初始化的模块树（_modules），递归的去安装所有的模块。安装模块的结果实际上就是对之前定义的_actions、_mutations、_wrappedGetters做初始化。同时，对模块树_modules.state，会设置上所有子模块的state。

```javascript
// store internal state
this._actions = Object.create(null);
this._mutations = Object.create(null);
this._wrappedGetters = Object.create(null);
this._modules = new ModuleCollection(options);

// init root module.
// this also recursively registers all sub-modules
// and collects all module getters inside this._wrappedGetters
installModule(this, state, [], this._modules.root);
```

在安装模块后的store实例：

```javascript
// store 实例
const store = {
  _actions: {
    'a/incrementIfOddOnRootSum': [f],
    'b/incrementIfOddOnRootSum': [f],
    'incrementIfOdd': [f]
  },
  _mutations: {
    'b/increment': [f],
    'a/moveY': [f],
    'a/moveX': [f],
    'a/increment': [f],
    'increment': [f]
  },
  _wrappedGetters: {
    'a/doubleCount': function wrappedGetter (store) {},
    'a/sumWithRootCount': function wrappedGetter (store) {},
    'b/doubleCount': function wrappedGetter (store) {},
    'b/sumWithRootCount': function wrappedGetter (store) {},
    'doubleCount': function wrappedGetter (store) {
      return rawGetter(
        local.state, // local state
        local.getters, // local getters
        store.state, // root state
        store.getters // root getters
      )
    }
  },
  _modules: {
    state: {
      count: 50,
      a: {
        countA: 10,
        pointX: 10,
        pointY: 10
      },
      b: {
        countB: 20
      }
    },
    runtime: false,
    _children: {...},
    _rawModule: {...}
  }
}

// 如果是moduleA、moduleB的namespaced为false，没有命名空间的情况下
const store = {
  _actions: {
    'incrementIfOddOnRootSum': [f, f],
    'incrementIfOdd': [f]
  },
  _mutations: {
    'moveY': [f],
    'moveX': [f],
    'increment': [f, f, f]
  },
  _wrappedGetters: {
    'sumWithRootCount': function wrappedGetter (store) {},
    'doubleCount': function wrappedGetter (store) {}
  },
  ...
}
```

*第三步*，初始化store._vm，实例化Vue，建立state和getters的依赖关系，将state、getters变成响应式数据。

```javascript
// initialize the store vm, which is responsible for the reactivity
// (also registers _wrappedGetters as computed properties)
resetStoreVM(this, state);

function resetStoreVM (store, state, hot) {
  var oldVm = store._vm;

  // bind store public getters
  store.getters = {};
  // reset local getters cache
  store._makeLocalGettersCache = Object.create(null);
  var wrappedGetters = store._wrappedGetters;
  var computed = {};
  forEachValue(wrappedGetters, function (fn, key) {
    // use computed to leverage its lazy-caching mechanism
    // direct inline function use will lead to closure preserving oldVm.
    // using partial to return function with only arguments preserved in closure environment.
    computed[key] = partial(fn, store);
    Object.defineProperty(store.getters, key, {
      get: function () { return store._vm[key]; },
      enumerable: true // for local getters
    });
  });

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  var silent = Vue.config.silent;
  Vue.config.silent = true;
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed: computed
  });
  Vue.config.silent = silent;

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store);
  }

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(function () {
        oldVm._data.$$state = null;
      });
    }
    Vue.nextTick(function () { return oldVm.$destroy(); });
  }
}
```

通过定义一个Vue实例对store._vm进行初始化，建立响应式数据，getters作为computed属性进行读取。

初始化store._vm后，store实例如下：

```javascript
// store 实例
const store = {
  _actions: {
    'a/incrementIfOddOnRootSum': [f],
    'b/incrementIfOddOnRootSum': [f],
    'incrementIfOdd': [f]
  },
  _mutations: {
    'b/increment': [f],
    'a/moveY': [f],
    'a/moveX': [f],
    'a/increment': [f],
    'increment': [f]
  },
  _wrappedGetters: {
    'a/doubleCount': function wrappedGetter (store) {},
    'a/sumWithRootCount': function wrappedGetter (store) {},
    'b/doubleCount': function wrappedGetter (store) {},
    'b/sumWithRootCount': function wrappedGetter (store) {},
    'doubleCount': function wrappedGetter (store) {
      return rawGetter(
        local.state, // local state
        local.getters, // local getters
        store.state, // root state
        store.getters // root getters
      )
    }
  },
  _modules: {
    state: {
      count: 50,
      a: {
        countA: 10,
        pointX: 10,
        pointY: 10
      },
      b: {
        countB: 20
      }
    },
    runtime: false,
    _children: {...},
    _rawModule: {...}
  },
  getters: { // 访问器属性
    'a/doubleCount': 20
    'a/sumWithRootCount': 60
    'b/doubleCount': 40
    'b/sumWithRootCount': 70
    'doubleCount': 100
  },
  state: { // 访问器属性
    count: 50,
    a: {
      countA: 10,
      pointX: 10,
      pointY: 10
    },
    b: {
      countB: 20
    }
  },
  _vm: { // vue实例
    $vnode: undefined,
    _data: {
      $$state: {
        count: 50,
        a: {
          countA: 10,
          pointX: 10,
          pointY: 10
        },
        b: {
          countB: 20
        }
      }
    },
    ...
  }
}
```

至此，数据仓库构造完毕，store初始化完成。store实例的部分数据属性如下图：

![set](./store.png)

构造好这个`store`后，vuex提供了一些API对数据进行存取操作，进入本篇正题。

## 数据读取

### 读取state中的数据

```javascript
get state () {
  return this._vm._data.$$state
}

function resetStoreVM (store, state, hot) {
  // ...
  store._vm = new Vue({
    data: {
      $$state: state // 此处传入的state是`root state`
    },
    computed: computed
  });
  // ...
}
```

`root state`在vuex初始化安装模块递归执行`installModule`时已经完成构建，所有子模块的state都会整合到`root state`中。

```javascript
function installModule (store, rootState, path, module, hot) {

  // ...

  // set state 构建整颗state树
  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1)) // 找到父模块state对象
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      if (__DEV__) {
        if (moduleName in parentState) {
          console.warn(
            `[vuex] state field "${moduleName}" was overridden by a module with the same name at "${path.join('.')}"`
          )
        }
      }
      // 设置子模块state：子模块名称为key，子模块state对象为value
      Vue.set(parentState, moduleName, module.state)
    })
  }
}
```

当通过`store.state.count`读取数据时，返回`this._vm._data.$$state`，也就是`store._vm._data.$$state.count`

当要访问子模块的state时，如`store.state.countA`是访问不到的，前面需要加上子模块名称'a'`store.state.a.countA`。访问`store.state.a.countA`就是访问`store._vm._data.$$state.a.countA`

### 读取getters中数据

`getter`可以认为是`store`中的计算属性，`getter`的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。

```javascript
function resetStoreVM (store, state, hot) {

  // ...

  var wrappedGetters = store._wrappedGetters;
  var computed = {};
  forEachValue(wrappedGetters, function (fn, key) {
    // use computed to leverage its lazy-caching mechanism
    // direct inline function use will lead to closure preserving oldVm.
    // using partial to return function with only arguments preserved in closure environment.
    computed[key] = partial(fn, store);
    Object.defineProperty(store.getters, key, {
      get: function () { return store._vm[key]; },
      enumerable: true // for local getters
    });
  });

  // ...

  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed: computed
  });

  //...
}
```

```javascript
getters: {
  doubleCount (state) {
    return state.count * 2
  }
}
```

通过属性访问，访问`store.getters.doubleCount`，也就是访问`store._vm['doubleCount']`，`doubleCount`作为vue实例的计算属性被访问，会执行`partial(fn, store)`得到值。`partial(fn, store)`即执行_wrappedGetters中对应key为`doubleCount`的getter方法。

回头看一下_wrappedGetters中返回rawGetter，rawGetter就是我们自定义的getter方法，可以传入四个参数，除了全局的state和getter外，我们还可以访问到当前module下的state和getter。

```javascript
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

由此可见，如果想通过属性访问有命名空间的子模块下的getter数据，就需要这么写`store.getters['a/sumWithRootCount']`。

## 数据存储

### commit mutation

更改Vuex的store中的状态的唯一方法是提交mutation。每个 mutation都有一个字符串的事件类型 (type)和一个回调函数 (handler)。这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数：

```javascript
// ...
mutations: {
  increment (state) {
    state.count++
  }
},
//...
```

当要调用这个`increment`函数时，你需要调用 store.commit 方法：

```javascript
store.commit('increment')
```

下面看一下commit方法的实现

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
  this._withCommit(() => {
    entry.forEach(function commitIterator (handler) {
      handler(payload)
    })
  })

  // ...
}
```

`unifyObjectStyle`对参数进行处理，第一个参数支持传入对象。

```javascript
// commit支持对象风格的提交方式
store.commit({
  type: 'increment',
  amount: 10
})

function unifyObjectStyle (type, payload, options) {
  // 整个对象都作为载荷传给 mutation 函数
  if (isObject(type) && type.type) {
    options = payload
    payload = type
    type = type.type
  }

  if (__DEV__) {
    assert(typeof type === 'string', `expects string as the type, but found ${typeof type}.`)
  }

  return { type, payload, options }
}
```

读完store初始化后，我们知道_mutations中存储了所有模块的mutation函数，以数组的形式存储，有命名空间的子模块对应的key会加上模块命名空间的前缀。

```javascript
const mutation = { type, payload }
const entry = this._mutations[type]
// 没有找到该type的对应函数数组
if (!entry) {
  if (__DEV__) {
    console.error(`[vuex] unknown mutation type: ${type}`)
  }
  return
}
this._withCommit(() => {
  entry.forEach(function commitIterator (handler) {
    handler(payload)
  })
})
```

根据传入的type，在_mutations中找到对应的函数数组`entry`，遍历获取到每个handler并执行，这里的handler就是我们自定义的mutation方法，该方法可以传入两个参数，第一个是当前模块的state`local.state`, 第二个是payload。

```javascript
// 这里传入的handler是我们自定义的mutation函数
function registerMutation (store, type, handler, local) {
  const entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload)
  })
}
```

----
我们看到entry遍历外层包了_withCommit方法，`this._withCommit`的作用，看下面两段代码：

```javascript
if (store.strict) {
  enableStrictMode(store)
}

function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, () => {
    if (process.env.NODE_ENV !== 'production') {
      assert(store._committing, `Do not mutate vuex store state outside mutation handlers.`)
    }
  }, { deep: true, sync: true })
}
```

```javascript
_withCommit (fn) {
  const committing = this._committing
  this._committing = true
  fn()
  this._committing = committing
}
```

`_withCommit`就是对 fn 包装了一个环境，确保在 fn 中执行任何逻辑的时候 this._committing = true。

如果设置为严格模式`store.strict = true`，那么`store._vm`会添加一个 wathcer来观测`this._data.$$state`的变化，也就是当`store.state`被修改的时候, `store._committing`必须为`true`，否则在开发阶段会报警告。

所以`_withCommit`的作用就是确保严格模式下在执行自定义的mutation方法时不会报警告。

----

### dispatch action

Action 类似于 mutation，不同在于：

* Action 提交的是 mutation，而不是直接变更状态。
* Action 可以包含任意异步操作。

看一下我们例子中的`action`

```javascript
// root
actions: {
  incrementIfOdd ({ state, commit}) {
    if (state.count % 2 === 1) {
      commit('increment')
    }
  }
},

// moduleA
actions: {
  incrementIfOddOnRootSum ({ state, commit, rootState }) {
    if ((state.countA + rootState.count) % 2 === 1) {
      commit('increment')
    }
  }
}

```

我们通过store.dispatch提交一个action。

```javascript
store.dispatch('incrementIfOdd')
```

看一下dispatch方法的实现：

```javascript
dispatch (_type, _payload) {
  // check object-style dispatch
  const {
    type,
    payload
  } = unifyObjectStyle(_type, _payload)

  const action = { type, payload }
  const entry = this._actions[type]
  if (!entry) {
    if (__DEV__) {
      console.error(`[vuex] unknown action type: ${type}`)
    }
    return
  }

  // ...

  const result = entry.length > 1
    ? Promise.all(entry.map(handler => handler(payload)))
    : entry[0](payload)

  return new Promise((resolve, reject) => {
    result.then(res => {
      // ...
      resolve(res)
    }, error => {
      // ...
      reject(error)
    })
  })
}
```

同mutation一样，我们在初始化过程中在_actions中存储了所有模块的action函数。根据传入的_type，找到对应的函数数组，遍历执行handler回调函数。我们看一下执行handler回调函数实际上是执行了`wrappedActionHandler(payload)`

```javascript
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
    // 如果返回值不是Promise对象，要resolve出去一个Promise对象
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
```

我们观察一下handler函数（也就是自定义的action函数）的传参。

第一个参数传入一个对象，包含了当前模块`local`下的 dispatch、commit、getters、state，以及全局的 rootState 和 rootGetters，所以我们定义的 action 函数能拿到当前模块下的 commit 方法。

```javascript
{
  dispatch: local.dispatch,
  commit: local.commit,
  getters: local.getters,
  state: local.state,
  rootGetters: store.getters,
  rootState: store.state
}
```

第二个是载荷payload，不多说。

从中可看出，`action`比我们自己写一个函数执行异步操作然后提交`mutation`的好处是在于它可以在参数中获取到当前模块的一些方法和状态。

## 辅助函数

大部分场景下我们可以用`this.$store`去访问store这个全局实例对象。但在一个组件中有多个状态要读取或者多个状态需要进行设置时，使用map***的辅助函数会更方便。vuex提供这样的语法糖。接下来我们分别看一下mapState、mapGetters、mapMutations、mapActions。

### mapState

用法：
mapState 辅助函数帮助我们生成计算属性

```javascript
// 在单独构建的版本中辅助函数为 Vuex.mapState
import { mapState } from 'vuex'

export default {
  // ...
  computed: mapState({
    // 箭头函数可使代码更简练
    count: state => state.count,

    // 传字符串参数 'count' 等同于 `state => state.count`
    countAlias: 'count',

    // 为了能够使用 `this` 获取局部状态，必须使用常规函数
    countPlusLocalState (state, getters) {
      return state.count + this.localCount
    }
  })
}
```

当映射的计算属性的名称与 state 的子节点名称相同时，我们也可以给 mapState 传一个字符串数组。

```javascript
computed: mapState([
  // 映射 this.count 为 store.state.count
  'count'
])
```

mapState返回一个对象，传入的参数必须是一个对象或者一个数组。

```javascript
/**
 * Return a function expect two param contains namespace and map. it will normalize the namespace and then the param's function will handle the new namespace and the map.
 * @param {Function} fn
 * @return {Function}
 */
function normalizeNamespace (fn) {
  return (namespace, map) => {
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/'
    }
    return fn(namespace, map)
  }
}
/**
 * Normalize the map
 * normalizeMap([1, 2, 3]) => [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
 * normalizeMap({a: 1, b: 2, c: 3}) => [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]
 * @param {Array|Object} map
 * @return {Object}
 */
function normalizeMap (map) {
  if (!isValidMap(map)) {
    return []
  }
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}

export const mapState = normalizeNamespace((namespace, states) => {
  const res = {}
  if (__DEV__ && !isValidMap(states)) {
    console.error('[vuex] mapState: mapper parameter must be either an Array or an Object')
  }
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState () {
      let state = this.$store.state
      let getters = this.$store.getters
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        state = module.context.state
        getters = module.context.getters
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})
```

执行normalizeNamespace方法返回的函数，normalizeNamespace的作用是对传参做一次处理，如果未传命名空间，那么第一个参数赋值为空，将传入的第一个参数赋值到map。将map作为states参数传入。

normalizeMap先格式化map。

分数组和对象两种情况

```javascript
normalizeMap([1, 2, 3]) 
// 返回值 [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
normalizeMap({a: 1, b: 2, c: 3})
// 返回值 [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]

mapState([
  // 映射 this.count 为 store.state.count
  'count'
])
// 传入的`['count']`数组，会被转换为`[{key: 'count', val: 'count'}]`

mapState({
  count: state => state.count,
  countAlias: 'count'
})
// 返回值
// [
//   {
//     key: 'count',
//     val: state => state.count
//   },
//   {
//     key: 'countAlias',
//     val: 'count'
//   }
// ]
```

遍历这个对象数组，创建res对象，res对象的属性名为遍历的数组中对象的key，属性值是mappedState函数，mappedState函数内部可以获取到$store.state和$store.getters，判断对象的val是函数则执行函数传入state和getters，否则如果是字符串则直接获取到`state[val]`。

当使用mapState来绑定带命名空间的模块时，写起来可能比较繁琐：

```javascript
computed: {
  ...mapState({
    countA: state => state.a.countA,
    pointX: state => state.a.pointX,
    pointY: state => state.a.pointY,
  })
}
```

mapState支持传入命名空间，可以这样写：

```javascript
computed: {
  ...mapState('a', {
    countA: state => state.countA,
    pointX: state => state.pointX,
    pointY: state => state.pointY,
  })
}
```

如果存在命名空间，那么state和getters就会变成当前命名空间模块下的state和getters。

```javascript
if (namespace) {
  const module = getModuleByNamespace(this.$store, 'mapState', namespace)
  if (!module) {
    return
  }
  state = module.context.state
  getters = module.context.getters
}
```

通过getModuleByNamespace函数拿到当前module，因为store初始化时_modulesNamespaceMap中存储了命名空间映射到模块的映射表。

```javascript
/**
 * Search a special module from store by namespace. if module not exist, print error message.
 * @param {Object} store
 * @param {String} helper
 * @param {String} namespace
 * @return {Object}
 */
function getModuleByNamespace (store, helper, namespace) {
  const module = store._modulesNamespaceMap[namespace]
  if (__DEV__ && !module) {
    console.error(`[vuex] module namespace not found in ${helper}(): ${namespace}`)
  }
  return module
}

// 初始化安装模块时，存储了映射表
function installModule (store, rootState, path, module, hot) {
  // ...
  const namespace = store._modules.getNamespace(path)

  // register in namespace map
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module
  }

  // ...
}
```

理解了mapState后，再理解以下的辅助函数就比较简单了。原理都类似。
### mapGetters

用法

mapGetters 辅助函数仅仅是将 store 中的 getter 映射到局部计算属性:

```javascript
import { mapGetters } from 'vuex'

export default {
  // ...
  computed: {
  // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapGetters([
      'doubleCount'
      // ...
    ])
  }
}
```

如果想将一个getter属性另取一个名字，使用对象形式：

```javascript
...mapGetters({
  // 把 `this.doneCount` 映射为 `this.$store.getters.doubleCount`
  root_doubleCount: 'doubleCount',
  a_doubleCount: 'a/doubleCount',
  b_doubleCount: 'b/doubleCount',
  a_sumWithRootCount: 'a/sumWithRootCount',
  b_sumWithRootCount: 'b/sumWithRootCount',
})
```

mapGetters也支持传入命名空间：

```javascript
...mapGetters('a', [
  doubleCount,
  sumWithRootCount
])
```

看一下mapGetters函数的实现，同样返回一个对象，传入参数也必须是对象或者数组。

```javascript
/**
 * Reduce the code which written in Vue.js for getting the getters
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} getters
 * @return {Object}
 */
export const mapGetters = normalizeNamespace((namespace, getters) => {
  const res = {}
  if (__DEV__ && !isValidMap(getters)) {
    console.error('[vuex] mapGetters: mapper parameter must be either an Array or an Object')
  }
  normalizeMap(getters).forEach(({ key, val }) => {
    // The namespace has been mutated by normalizeNamespace
    val = namespace + val
    res[key] = function mappedGetter () {
      if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
        return
      }
      if (__DEV__ && !(val in this.$store.getters)) {
        console.error(`[vuex] unknown getter: ${val}`)
        return
      }
      return this.$store.getters[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})
```

遍历normalizeMap后的对象数组，创建res对象，res对象的属性名为遍历的数组中对象元素的key，属性值是mappedGetter函数，如果有命名空间，val就拼接上namespace前缀，直接取`this.$store.getters[val]`返回就行。

### mapMutations

用法：

使用 mapMutations 辅助函数将组件中的 methods 映射为 store.commit 调用（前提需要在根节点注入 store）。

mapMutations也支持传入对象或者数组，如果需要换个名字就用对象的形式。

```javascript
import { mapMutations } from 'vuex'

export default {
  // ...
  methods: {
    ...mapMutations([
      'increment', // 将 `this.increment()` 映射为 `this.$store.commit('increment')`

      // `mapMutations` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
    ]),
    ...mapMutations({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.commit('increment')`
    })
  }
}
```

```javascript
/**
 * Reduce the code which written in Vue.js for committing the mutation
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} mutations # Object's item can be a function which accept `commit` function as the first param, it can accept anthor params. You can commit mutation and do any other things in this function. specially, You need to pass anthor params from the mapped function.
 * @return {Object}
 */
export const mapMutations = normalizeNamespace((namespace, mutations) => {
  const res = {}
  if (__DEV__ && !isValidMap(mutations)) {
    console.error('[vuex] mapMutations: mapper parameter must be either an Array or an Object')
  }
  normalizeMap(mutations).forEach(({ key, val }) => {
    res[key] = function mappedMutation (...args) {
      // Get the commit method from store
      let commit = this.$store.commit
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapMutations', namespace)
        if (!module) {
          return
        }
        commit = module.context.commit
      }
      return typeof val === 'function'
        ? val.apply(this, [commit].concat(args))
        : commit.apply(this.$store, [val].concat(args))
    }
  })
  return res
})
```

`commit.apply(this.$store, [val].concat(args))`可以看出还支持传入额外的参数args。

mapMutations同样支持namespace，如果存在命名空间，那么commit方法会变成当前命名空间模块（子模块）下的commit方法。

### mapActions

用法和mapMutations一样：

使用 mapActions 辅助函数将组件的 methods 映射为 store.dispatch 调用（需要先在根节点注入 store）

```javascript
import { mapActions } from 'vuex'

export default {
  // ...
  methods: {
    ...mapActions([
      'incrementIfOdd', // 将 `this.incrementIfOdd()` 映射为 `this.$store.dispatch('incrementIfOdd')`
    ]),
    ...mapActions({
      addIfOdd: 'incrementIfOdd' // 将 `this.addIfOdd()` 映射为 `this.$store.dispatch('incrementIfOdd')`
    })
  }
}
```

mapActions实现和mapMutations一模一样，只是把commit变成了dispatch，支持namespace，也支持传入额外的参数args。

```javascript
/**
 * Reduce the code which written in Vue.js for dispatch the action
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} actions # Object's item can be a function which accept `dispatch` function as the first param, it can accept anthor params. You can dispatch action and do any other things in this function. specially, You need to pass anthor params from the mapped function.
 * @return {Object}
 */
export const mapActions = normalizeNamespace((namespace, actions) => {
  const res = {}
  if (__DEV__ && !isValidMap(actions)) {
    console.error('[vuex] mapActions: mapper parameter must be either an Array or an Object')
  }
  normalizeMap(actions).forEach(({ key, val }) => {
    res[key] = function mappedAction (...args) {
      // get dispatch function from store
      let dispatch = this.$store.dispatch
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapActions', namespace)
        if (!module) {
          return
        }
        dispatch = module.context.dispatch
      }
      return typeof val === 'function'
        ? val.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$store, [val].concat(args))
    }
  })
  return res
})
```

### createNamespacedHelpers

可以通过使用 createNamespacedHelpers 创建基于某个命名空间辅助函数。它返回一个对象，对象里有新的绑定在给定命名空间值上的组件绑定辅助函数：

```javascript
/**
 * Rebinding namespace param for mapXXX function in special scoped, and return them by simple object
 * @param {String} namespace
 * @return {Object}
 */
export const createNamespacedHelpers = (namespace) => ({
  mapState: mapState.bind(null, namespace),
  mapGetters: mapGetters.bind(null, namespace),
  mapMutations: mapMutations.bind(null, namespace),
  mapActions: mapActions.bind(null, namespace)
})
```

它的用法：

```javascript
import { createNamespacedHelpers } from 'vuex'

const { mapState, mapActions } = createNamespacedHelpers('a')

export default {
  computed: {
    // 在 `a` 中查找
    ...mapState({
      countA: state => state.countA,
      pointX: state => state.pointX,
      pointY: state => state.pointY
    })
  },
  methods: {
    // 在 `a` 中查找
    ...mapActions([
      'incrementIfOddOnRootSum'
    ])
  }
}
```

## 模块动态注册

### store.registerModule

```javascript
import Vuex from 'vuex'

const store = new Vuex.Store({ /* 选项 */ })

// 注册模块 `myModule`
store.registerModule('myModule', {
  // ...
})
// 注册嵌套模块 `nested/myModule`
store.registerModule(['nested', 'myModule'], {
  // ...
})
```

注册后，通过 store.state.myModule 和 store.state.nested.myModule 访问模块的状态。

registerModule的实现：

```javascript
registerModule (path, rawModule, options = {}) {
  if (typeof path === 'string') path = [path]

  if (__DEV__) {
    assert(Array.isArray(path), `module path must be a string or an Array.`)
    assert(path.length > 0, 'cannot register the root module by using registerModule.')
  }

  this._modules.register(path, rawModule)
  installModule(this, this.state, path, this._modules.get(path), options.preserveState)
  // reset store to update getters...
  resetStoreVM(this, this.state)
}
```

第一个参数必传，不能传空，传数组或者字符串。

`this._modules.register`执行`ModuleCollection`的`register`方法，往模块树`_modules`中加入一个新的子模块。然后，通过`installModule`安装模块，通过`resetStoreVM`重新生成一个vue实例（也会销毁原vue实例），更新`state`和`getters`。

```javascript
export default class ModuleCollection {
  // ...
  register (path, rawModule, runtime = true) {
    if (__DEV__) {
      assertRawModule(path, rawModule)
    }

    const newModule = new Module(rawModule, runtime)
    if (path.length === 0) { // 根模块
      this.root = newModule
    } else {
      // 父module和子module建立父子关系
      const parent = this.get(path.slice(0, -1))
      parent.addChild(path[path.length - 1], newModule)
    }

    // register nested modules 递归注册嵌套的module
    if (rawModule.modules) {
      // 比方这里有个名为a的子模块，path就是['a'], 那么path.length不为0，执行建立父子关系的逻辑
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule, runtime)
      })
      // 注意这里用了concat方法，该方法不会改变原path，而仅仅会返回被连接数组的一个副本。
    }
  }
  // ...
}
```

### store.unregisterModule(moduleName) 动态卸载模块

```javascript
import Vuex from 'vuex'

const store = new Vuex.Store({ /* 选项 */ })

// 卸载模块 `myModule`
store.unregisterModule('myModule')
// 卸载嵌套模块 `nested/myModule`
store.unregisterModule(['nested', 'myModule'])
```

```javascript
unregisterModule (path) {
  if (typeof path === 'string') path = [path]

  if (__DEV__) {
    assert(Array.isArray(path), `module path must be a string or an Array.`)
  }

  this._modules.unregister(path)
  this._withCommit(() => {
    const parentState = getNestedState(this.state, path.slice(0, -1))
    Vue.delete(parentState, path[path.length - 1])
  })
  resetStore(this)
}
```

第一步，先将在_modules模块树中扩展的子模块通过`unregister`移除。

```javascript
export default class ModuleCollection {
  // ...
  get (path) {
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root)
  }

  unregister (path) {
    // 获取当前模块的父模块
    const parent = this.get(path.slice(0, -1))
    const key = path[path.length - 1]
    const child = parent.getChild(key)

    if (!child) {
      if (__DEV__) {
        console.warn(
          `[vuex] trying to unregister module '${key}', which is ` +
          `not registered`
        )
      }
      return
    }

    if (!child.runtime) {
      return
    }

    parent.removeChild(key)
  }
  // ...
}

export default class Module {
  // ...
  removeChild (key) {
    delete this._children[key]
  }
  // ...
}

```

逻辑比较简单，先通过`this.get()`获取到当前模块的父模块，父模块通过removeChild移除对应key的子模块。

第二步，`Vue.delete(parentState, path[path.length - 1])`把root state中对应的state也移除。

第三步，`resetStore(this)`

```javascript
function resetStore (store, hot) {
  store._actions = Object.create(null)
  store._mutations = Object.create(null)
  store._wrappedGetters = Object.create(null)
  store._modulesNamespaceMap = Object.create(null)
  const state = store.state
  // init all modules
  installModule(store, state, [], store._modules.root, true)
  // reset vm
  resetStoreVM(store, state, hot)
}
```

`resetStore`把`store`下的对应存储的`_actions`、`_mutations`、`_wrappedGetters` 和 `_modulesNamespaceMap` 都清空，然后重新执行 installModule安装所有模块以及`resetStoreVM`重置`store._vm`。

以上就是动态卸载模块的步骤。

## 总结

我们回顾了一下store初始化的过程，并且分析了vuex中进行数据读取和存储的方法，还分析vuex提供的辅助函数。`mapXXX`的设计让我们在使用api的时候更加方便，设计思路非常值得我们学习。
