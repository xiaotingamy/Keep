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

1. 数据属性
configurable 被改为false后就不能再被改为true了。(一旦把属性定义为不可配置的，就不能再变回可配置的了)

2. 访问器属性

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
  if (t !== 'object' && t !== 'function') thorw TypeError()
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
