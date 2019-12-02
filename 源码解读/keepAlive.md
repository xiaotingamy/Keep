# keep-alive 组件
## 用法

```javascript
<!-- 基本 -->
<keep-alive>
  <component :is="view"></component>
</keep-alive>

<!-- 多个条件判断的子组件 -->
<keep-alive>
  <comp-a v-if="a > 1"></comp-a>
  <comp-b v-else></comp-b>
</keep-alive>

<!-- 常见应用 -->
<keep-alive>
  <router-view></router-view>
</keep-alive>
```
keep-alive 要求同时只有一个子元素被渲染。

#### props
`include` -- 逗号分隔字符串、正则表达式或一个数组。只有名称匹配的组件会被缓存。  
`exclude` -- 逗号分隔字符串、正则表达式或一个数组。任何名称匹配的组件都不会被缓存。  
`max` -- 最多可以缓存多少组件实例。

### 生命钩子
`keep-alive`提供了两个生命钩子，分别是`activated`与`deactivated`。   
因为`keep-alive`会将组件保存在内存中，并不会销毁以及重新创建，所以不会重新调用组件的`created`等方法，需要用`activated`与`deactivated`这两个生命钩子来得知当前组件是否处于活动状态。

## keep-alive组件实现-源码
我们从源码角度看一下`keep-alive`是如何实现组件的缓存的。

```javascript
const patternTypes: Array<Function> = [String, RegExp, Array]

export default {
  name: 'keep-alive',
  // 表示是抽象组件
  abstract: true, 

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  created () {
    // 用于缓存vnode对象
    this.cache = Object.create(null)
    this.keys = []
  },
  // destroyed钩子中销毁所有cache中的组件实例
  destroyed () {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },
  // 监听include和exclude属性
  mounted () {
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },

  render () {
    // ...省略代码（render函数后面详细讲解）
    return vnode || (slot && slot[0])
  }
}
```
## created和destroy钩子
首先看一下`created`钩子中，缓存一个`cache`对象，用来缓存`vnode`节点。同时还缓存了一个`keys`数组，缓存的`vnode`节点的唯一标识。

`destroyed`钩子在组件被销毁的时候清除`cache`缓存中的所有组件实例。下面是销毁组件的函数实现：1.把缓存中对应`key`的`vnode`的组件实例`destroy`；2.从`cache`中移除，并在`keys`数组中移除对应的`key`。
```javascript
function pruneCacheEntry (cache, key, keys, current) {
  const cached = cache[key]
  if (cached && (!current || cached.tag !== current.tag)) {
    // 判断cache的vnode不是目前渲染的vnode，则销毁
    cached.componentInstance.$destroy()
  }
  cache[key] = null
  remove(keys, key)
}
```
## render函数
接下来看一下组件中render函数的实现：做了详细注释
```javascript
render () {
  // 获取默认插槽
  const slot = this.$slots.default
  // 获取第一个子组件（注意keepalive组件同时只能渲染一个子元素）
  const vnode: VNode = getFirstComponentChild(slot)
  // componentOptions中存储了组件的配置项
  const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
  if (componentOptions) {
    // 获取到组件的name，存在组件名则直接使用组件名，否则会使用tag
    const name: ?string = getComponentName(componentOptions)
    const { include, exclude } = this
    if (
      (include && (!name || !matches(include, name))) ||
      (exclude && name && matches(exclude, name))
    ) {
      // 如果配置了include但是组件名不匹配include 或者 配置了exclude且组件名匹配exclude，那么就直接返回这个组件的vnode
      return vnode
    }

    const { cache, keys } = this
    // 获取或生成代表组件的唯一标识key
    const key: ?string = vnode.key == null
      ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
      : vnode.key
    if (cache[key]) {
      // cache缓存中存在这个vnode，那么直接将缓存的vnode的componentInstance（组件实例）覆盖到目前的vnode上面
      vnode.componentInstance = cache[key].componentInstance
      // 更新keys数组，让最新渲染的vnodekey推到尾部
      remove(keys, key)
      keys.push(key)
    } else {
      // 如果没有缓存过，则将vnode缓存到cache中
      cache[key] = vnode
      keys.push(key)
      // 如果缓存的组件实例数量大于max时，销毁最早缓存的那个组件
      if (this.max && keys.length > parseInt(this.max)) {
        pruneCacheEntry(cache, keys[0], keys, this._vnode)
      }
    }
    // keepAlive标记位
    vnode.data.keepAlive = true
  }
  return vnode || (slot && slot[0])
}
```

首先获取到它的默认插槽，然后再获取到它的第一个子组件，获取该组件的`name`（存在组件名则直接使用组件名，否则会使用`tag`）。接下来会将这个`name`通过`include`与`exclude`属性进行匹配，匹配不成功（说明不需要进行缓存）则不进行任何操作直接返回`vnode`。

检测`include`与`exclude`属性匹配的函数很简单：
```javascript
// 判断name是否匹配pattern
function matches (pattern: string | RegExp | Array<string>, name: string): boolean {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}
```
`include`与`exclude`属性支持数组、支持字符串如"a,b,c"这样组件名以逗号隔开的情况以及正则表达式。`matches`通过这三种方式分别检测是否匹配当前组件。

接着，根据`key`在`this.cache`中查找，如果存在则说明之前已经缓存过了，直接将缓存的`vnode`的`componentInstance`（组件实例）覆盖到目前的`vnode`上面。否则将vnode存储在cache中。

最后返回`vnode`（有缓存时该`vnode`的`componentInstance`已经被替换成缓存中的了）。

## mounted钩子
我们注意到mounted钩子中，我们对exclude属性和include属性做了监听。
```javascript
mounted () {
  this.$watch('include', val => {
    pruneCache(this, name => matches(val, name))
  })
  this.$watch('exclude', val => {
    pruneCache(this, name => !matches(val, name))
  })
}
```
也就是说，我们会监听这两个属性的变化，改变的时候修改cache缓存中的缓存数据。其实会对`cache`做遍历，发现缓存的节点名称和新的规则没有匹配上的时候，就把这个缓存节点从缓存中摘除。我们看看`pruneCache`函数的实现：
```javascript
function pruneCache (keepAliveInstance: any, filter: Function) {
  // _vnode：表示目前组件的渲染节点
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    const cachedNode: ?VNode = cache[key]
    if (cachedNode) {
      const name: ?string = getComponentName(cachedNode.componentOptions)
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}
```
遍历`cache`缓存，`name`不符合`filter`条件的时候则调用`pruneCacheEntry`方法销毁`vnode`对应的组件实例（Vue实例），并从`cache`中移除。   

## 总结
`keep-alive`组件是一个抽象组件，并且它的缓存是基于VNode节点的缓存，它的实现是通过自定义render函数并且利用了插槽。而且会随时监听include和exclude属性的变化做缓存数据的变化。它将满足条件的组件在cache对象中缓存起来，在需要重新渲染的时候再将VNode节点从cache对象中取出并渲染。
