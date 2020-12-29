# 数组

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
