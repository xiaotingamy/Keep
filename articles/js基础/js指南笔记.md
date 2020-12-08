# js权威指南笔记

## 类型转换

### toString

Number类定义的toString()方法可以传入转换基数radix。（指二进制、八进制、16进制等）
不传参数默认十进制。

```javascript
var n = 17;
binary_string = n.toString(2); // 转换为‘10001’
octal_string =  '0' + n.toString(8); // 转换为‘021’
hex_string = '0x' + n.toString(16); // 转换为‘0x11'
```

### parseInt和parseFloat

1. 如果字符串前缀是‘0x’或‘0X’，parseInt会将其解释为16进制数。

2. 这两个方法都会跳过任意数量的前导空格，尽可能解析更多数值字符，并忽略后面的内容。

3. 如果第一个非空格字符是非法的数字直接量则会返回NaN

```javascript
parseInt('0xff') // => 255
parseInt(' 3.14 meters') // => 3.14
parseFloat('.1') // => 0.1
parseInt('.1') // => NaN
parseInt('$89.00') // => NaN
```

* parseInt可接受第二个参数，指定数字转换的基数radix（2～36）

```javascript
parseInt('11', 2) // => 3
parseInt('ff', 16) // => 255
parseInt('zz', 36) // => 1295
parseInt('077', 8) // => 63
parseInt('077', 10) // => 77
```

### 显式转换

Number函数

1. 字符串如果可以被解析为数值（是纯数字组成的）那就转化为数值，否则得到NaN，空字符串转为0。
2. 布尔值：true转为1，false转为0
3. ndefined 转为NAN
4. null 转为0
5. 对象：Number(对象)

转换对象类型

* 先调用对象自身的valueOf方法，如果该方法返回原始类型的值（数值、字符串和布尔值），则直接对该值使用Number方法，不再进行后续操作。
* 如果valueOf方法返回复合类型的值，再调用对象自身的toString方法，如果toString方法返回原始类型的值，则对该值使用Number方法，不再进行后续操作。
* 如果toString方法返回的是复合类型的值，则报错。

String函数

转换对象类型

* 先调用toString方法，如果哦toString方法返回的是原始类型的值，则对该值使用String方法，不再进行以下步骤。
* 如果toString方法返回的是复合类型的值，在调用valueOf方法返回原始类型的值，则对该值使用String方法，不再进行后续操作。
* 如果valueOf方法返回的是复合类型的值，则报错

## 对象

### 定义对象的几种方式

1. new Object() 构造函数方式
2. 对象字面量
3. Object.create()

### 对象属性类型

1. 数据属性（data property）
configurable 被改为false后就不能再被改为true了。(一旦把属性定义为不可配置的，就不能再变回可配置的了)

2. 存取器属性（accessor property）

### Object.create()

第一个参数是所创建的这个对象的原型对象，第二个可选参数可以对这个对象属性进行进一步的描述。

例子：通过原型继承创建一个新对象

```javascript
function inherit(p) {
  if (p === null) throw TypeError()
  if (Object.create) {
    return Object.create(p)
  }
  var t = typeof p
  if (t !== 'object' && t !== 'function') throw TypeError()
  function f() {}
  f.prototype = p
  return new f()
}
```

inherit函数返回了一个继承自原型对象p的属性的新对象。

内置构造函数的原型对象是只读的。

```javascript
Object.prototype = o // 赋值失败，但是没有报错。Object.prototype没有被修改
```

### 删除属性

```javascript
var a = {
  p: {
    x: 1
  }
}
var b = a.p
delete a.p
```

执行以上代码后b.x的值还是1。因为已经删除的属性的引用依然存在。

delete不能删除那些可配置型为false的属性。（某些内置对象的属性是不可配置的，比如通过变量声明和函数声明创建的全局对象的属性）

```javascript
delete Object.prototype // 不能删除，属性是不可配置的
var x = 1
delete this.x // 不能删除这个属性
function f() {}
delete this.f // 也不能删除全局函数


this.x = 1 // 创建一个可配置的全局属性（没有用var）
delete x // 在非严格模式中删除全局对象的可配置属性时，可以省略对全局对象的引用，delete操作符后跟随要删除的属性名即可。（严格模式下会报语法错误）
delete this.x // 严格模式下的写法
```

### 检测属性

判断某属性是否存在于对象中。

* in运算符
* hasOwnProperty()
* propertyIsEnumerable()
* 属性查询

in运算符: 如果对象的自有属性或继承属性中包含这个属性值则返回true。

```javascript
var o = { x: 1 }
var b = inherit(o)
'x' in o // true
'y' in o  // false
'x' in b // true  b继承o的x属性
```

hasOwnProperty() 检测是否是对象的自有属性，对于继承属性它会返回false。

```javascript
var o = { x: 1 }
var b = inherit(o)
o.hasOwnProperty('x')  // true o中存在自有属性x
o.hasOwnProperty('y')  // false o中不存在属性y
b.hasOwnProperty('x')  // false x对于b来说是继承属性
```

propertyIsEnumerable() 是hasOwnProperty的升级版，检测到是自有属性且这个属性的可枚举性为true时它才返回true。

```javascript
var o = { x: 1 }
var b = inherit(o)
o.propertyIsEnumerable('x')  // true o中存在可枚举的自有属性x
b.propertyIsEnumerable('x')  // false x对于b来说是继承属性
Object.prototype.propertyIsEnumerable('toString') // false 内置属性toString是不可枚举的
```

属性查询

```javascript
// 如果o中含有属性x，则o.x乘以2
if (o.x) {
  o.x *= 2
}
```

### 枚举属性

遍历对象中的属性

* for/in循环，遍历对象中所有可枚举的属性（包括自有属性和继承属性）

为避免for/in循环中遍历出继承属性或者Object.prototype中添加的新的方法或属性，可用以下两种方式：

```javascript
for (p in o) {
  if (!o.hasOwnProperty(p)) continue; // 跳过继承的属性
}

for (p in o) {
  if (typeof o[p] === 'function') continue; // 跳过方法
}
```

返回一个数组，这个数组包含的是o中可枚举的自有属性的名字

```javascript
function keys(o) {
  if (typeof o !== 'object') throw TypeError()
  var result = []
  for (var prop in o) {
    if (o.hasOwnProperty(prop)) {
      result.push(prop)
    }
  }
  return result
}
// 作用等同于Object.keys()
```

Object.keys()返回对象中`可枚举`的自有属性的名称组成的数组。
Object.getOwnPropertyNames()返回对象中`所有`自有属性的名称(包括不可枚举和可枚举的属性)。

### 存取器属性

getter和setter，举个🌰

```javascript
var p = {
  x: 1.0,
  y: 1.0,

  // r是可读写的存取器属性，它有getter和setter
  get r () {
    return Math.sqrt(this.x*this.x+this.y*this.y)
  },
  set r (newvalue) {
    var oldvalue = Math.sqrt(this.x*this.x+this.y*this.y)
    var ratio = newvalue / oldvalue
    this.x *= ratio
    this.y *= ratio
  },
  // theta是只读存取器属性，它只有getter方法
  get theta () {
    return Math.atan2(this.y, this.x)
  }
}
```

存取器属性是可以继承的。

```javascript
var q = inherit(p)  // 创建一个继承getter和setter的新对象
q.x = 1, q.y = 2;
console.log(q.r) // 可使用继承的r属性
console.log(q.theta)
```

### 属性的特性

利用属性的特性的api

1. 给原型对象添加方法，并设置为不可枚举的，看起来像内置方法。

2. 给对象定义不能修改或删除的属性，“锁定”对象。

数据属性的4个特性： value、writable、enumberable、configurable
存储器属性的4个特性： get、set、enumberable、configurable

获得对象特定属性的属性描述符`Object.getOwnPropertyDescriptor()`，要注意的对于继承属性和不存在的属性返回undefined。

```javascript
Object.getOwnPropertyDescriptor({x:1}, 'x')
// 返回 {value: 1, writable: true, enumberable: true, configurable: true}

Object.getOwnPropertyDescriptor({}, 'x')
// 返回undefined
Object.getOwnPropertyDescriptor({}, 'toString')
// 返回 undefined
```

设置属性特性或者新建属性具有某种特性：`Object.defineProperty()`

```javascript
var o = {}
Object.defineProperty(o, 'x', {
  value: 1,
  writable: true,
  enumberable: false,
  configurable: true
})
o.x // 属性存在但不可枚举
Object.keys(o) // []

// 变成只读属性
Object.defineProperty(o, 'x', {
  writable: false
})

o.x = 2 // 操作失败但不报错，严格模式会报错

o.x // =>1

// 虽然只读，但属性依然是可配置的，所以可以通过这种方式对它进行修改
Object.defineProperty(o, 'x', {
  value: 2
})

o.x // =>2

// 还能x从数据属性改为存取器属性
Object.defineProperty(o, 'x', {
  get: function() {
    return o
  }
})
```

关于Object.defineProperty和Object.defineProperties的规则：

* 如果对象是不可扩展的，则可以编辑已有的自有属性，但不能给他添加新属性。
* 如果属性是不可配置的，那么不能修改它的可配置性和可枚举性。
* 如果存取器属性是不可配置的，则不能修改其getter和setter方法，也不能将其转换为数据属性。
* 如果数据属性是不可配置的，则不能将其转换为存取器属性
* 如果数据属性是不可配置的，则不能将它的可写性从false转为true，但可以从true转为false。
* 如果数据属性是不可配置且不可写的，则不能修改它的值。然后可配置但不可写属性的值是可以修改。

extend函数升级版：
给Object.prototype添加一个不可枚举的extend方法

```javascript
Object.defineProperty(Object.prototype, 'extend', {
  writable: true,
  enumberable: false,
  configurable: true,
  value: function(o) {
    var names = Object.getOwnPropertyNames(o)
    for (var i = 0; i<names.length; i++) {
      if (names[i] in this) continue
      var desc = Object.getOwnPropertyDescriptor(o, names[i])
      Object.defineProperty(this, names[i], desc)
    }
  }
})
```

### 原型属性

* 对象直接量创建的对象使用Object.prototype作为它们的原型
* 通过new创建的对象使用构造函数的prototype属性作为原型
* Object.create创建的对象以第一个参数作为原型

`isPrototypeOf`检测一个对象是否是另一对象的原型。与instanceof类似。

### 对象序列化  JSON.stringify 和 JSON.parse

* NaN、Infinity、-Infinity序列化后是null
* 日期对象（Date）序列化结果是ISO格式的日期字符串，JSON.parse()依然保持它们字符串的形态，而不会还原为日期对象。
* 函数、RegExp、Error对象和undefined值不能序列化和还原。
* JSON.stringify只能序列化对象可枚举的自有属性，对于不能序列化的属性在序列化后会被省略掉。

## 数组

数组方法：
`join`  数组转字符串，传入分隔符

`reverse` 返回逆序的数组。改变原数组

`sort`
默认按字母表顺序进行排序，返回排序后的数组。可以给sort传递一个比较函数。如果第一个参数需要在前面，那么比较函数需要返回一个小于0的数值。相反，如果第一个参数需要在后，比较函数要返回一个大于0的数值。

```javascript
let a = [1, 4, 7, 5]
// 升序
a.sort((a, b) => a - b)

// 降序
a.sort((a, b) => b - a)
```

`concat`
创建并返回一个新数组。不改变原数组。 参数自身是数组时，连接的是数组的元素，而非数组本身。但是不会扁平化数组的数组。

`slice`
返回指定数组的一个片段或子数组。不改变原数组。
如果参数中出现负数，它表示相对于数组中最后一个元素的位置。 如：-1指定了最后一个元素，而-3指定了倒数第三个元素。

```javascript
var a = [1, 2, 3, 4, 5];
a.slice(0, 3); // [1, 2, 3]
a.slice(3); // [4, 5]
a.slice(1, -1); // [2, 3, 4]
a.slice(-3, -2); // [3]
```

`splice`
在数组中插入或删除元素的通用方法。会改变原数组。
返回值：一个由删除元素组成的数组，或者如果没有删除元素则返回一个空数组。
前两个参数指定了需要删除的数组元素，后面的任意个数的参数指定了需要插入到数组中的元素。从第一个参数指定的位置开始插入。

`push` and `pop`  会改变原数组
push()在数组的尾部添加一个或多个元素，并返回数组新的长度。
pop()删除数组的最后一个元素，减少数组的长度并返回它删除的值。

`shift` and `unshift`  会改变原数组
unshift()在数组的头部添加一个或多个元素，最后返回数组新的长度。
shift()删除数组的第一个元素并将其返回。

`forEach` 循环遍历
forEach()无法在所有元素都传递给调用函数之前终止遍历。没有像for循环中使用的相应的break语句。要提前终止的话要使用try catch。

`map` 循环遍历，函数需要return语句，返回一个新数组

`filter` 过滤数组，返回的新数组是原数组的一个子集。传递的函数是用来逻辑判定的：该函数返回true或者false。会压缩稀疏数组成为稠密数组。

`every` 当且仅当针对数组中的所有元素调用判定函数都返回true，才返回true。在判定函数第一次返回false后就返回false。遍历空数组的话every返回true。

`some` 当且仅当数值中的所有元素调用判定函数都返回false，它才会返回false。在判定函数第一次返回true后就会返回true。遍历空数组的话，some返回false。

`reduce`和`reduceRight`使用指定的函数将数组元素进行组合，生成单个值。这个在函数式编程中式常见的操作，也可以称为注入和折叠。

```javascript
// 数组求和
let a = [1,2,3,4,5]
let sum = a.reduce((x,y) => x+y, 0)
let product = a.reduce((x,y) => x*y, 1)
let max = a.reduce((x, y) => x > y ? x : y)
```

reduce需要两个参数，第一个是执行化简操作的函数。化简函数的任务是用某种方法将两个值组合或者化简为一个值，并返回化简后的值。第二个参数是一个传递给函数的初始值（可选参数）。

在空数组上，不带初始值参数调用reduce()将导致类型错误异常。

如果调用它的时候只有一个值（数组只有一个元素并且没有指定初始值），
或者有一个空数组并且指定了一个初始值，那么reduce只是简单地返回那个值而不会调用化简函数。

```javascript
let a = [1]
a.reduce((x,y) => x+y)  // 返回值： 1

[].reduce((x,y) => x+y, []) // 返回值： []

[].reduce((x,y) => x+y)  // 报错：Reduce of empty array with no initial value
```

`reduceRight()`的工作原理和reduce()一样，不同的是它是按照数组索引从高到低（从右到左）处理数组的。如果化简操作的优先顺序是从右到左，就可以使用它。

```javascript
let a = [2, 3, 4]
// 计算2^(3^4)
let big = a.reduceRight((accumulator, value) => Math.pow(value,accumulator))
```

`reduce`计算两个对象的“并集”

```javascript
// 将p中的可枚举属性复制到o中，并且返回o;
// 如果o和p中含有同名属性，则覆盖o中的属性；
function extend (o, p) {
  for (prop in p) {
    o[prop] = p[prop]
  }
  return o
}
// 返回一个新对象，这个对象同事拥有o的属性和p的属性
function union (o, p) {
  return extend(extend({}, o), p)
}

let objs = [{x: 1}, {y: 2}, {z: 3}]
let merged = Objs.reduce(union) // => {x: 1, y: 2, z: 3}

let objects = [{x:1, a:1}, {y:2, a:2}, {z:3, a:3}]
let leftunion = objects.reduce(union) // {x: 1, a: 3, y: 2, z: 3}
let rightunion = objects.reduceRight(union) //{z: 3, a: 1, y: 2, x: 1}
```

`indexOf`和`lastIndexOf`

这个两个函数搜索整个数组中具有给定值的元素，返回找到的第一个元素的索引，或者如果没有找到就会返回-1。 indexOf从头到尾搜索，lastIndexOf则反向寻找。

这两个函数可以传两个参数，第一个参数是需要搜索的值，第二个参数是可选的：它指定数组中的一个索引，从那里开始搜索。第二个参数可以是负数，代表相对数组末尾的偏移量。 -1表示数组的最后一个元素。

在一个数组中搜索指定的值并返回包含所有匹配的数组索引的一个数组。利用indexOf的第二个参数。

```javascript
function findAll (a, x) {
  let res = [], len = a.length, pos = 0
  while (pos < len) {
    pos = a.indexOf(x, pos)
    if (pos === -1) break
    res.push(pos)
    pos = pos + 1
  }
  return res
}
```

数组类型的判定

可以使用`Array.isArray()`判定。

```javascript
const isArray = Function.isArray || function (o) {
  return typeof o === 'object' && Object.prototype.toString.call(o) === '[object Array]'
}
```

检测类数组对象：

```javascript
function isArrayLike (o) {
  if (o &&
    typeof o === 'object' &&
    isFinite(o.length) &&  // o.length是有限数值
    o.length >= 0 &&
    o.length === Math.floor(o.length) && // o.length是整数
    o.length < 4294967296
  )
}
```

类数组对象没有继承自Array.prototype，所以不能直接调用数组的方法，不过可以通过call方法调用：

```javascript
let a = {"0": "a", "1": "b", "2": "c", length: 3}
Array.prototype.join.call(a, "+") // => "a+b+c"
Array.prototype.slice.call(a, 0) // => ['a', 'b', 'c']
Array.prototype.map.call(a, (x) => {
  return x.toUpperCase()
}) // => ['A', 'B', 'C']
```

字符串也可以通过call方法，调用数组的方法，下面是例子：

```javascript
let s = 'javascript'
Array.prototype.join.call(s, " ") // => "j a v a s c r i p t"
Array.prototype.filter.call(s, (x) => {
  return x.match(/[^aeiou]/) // 只匹配非元音字母
}).join("")  // "jvscrpt"
```

## 函数

