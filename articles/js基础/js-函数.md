# 函数

## 函数定义

函数语句和表达式两种方式定义。

```javascript
//函数语句——声明
function printprops(o) {
for(var p in o)
  console.log(p + ": " + o[p] + "\n")
}
//函数表达式
var square = function(x) { return x*x }
```

* 表达式定义的函数，函数的名称是可选的，有命名函数和匿名函数。

* 函数声明定义的函数可以在定义之前出现的代码调用。

* 以表达式定义的函数在定义之前无法调用（变量的声明提前，但是赋值不会提前）。

* 函数声明语句不能出现在循环，条件判断，或者try/catch/finally以及with语句中

形参：函数中定义的变量。
实参：在运行时的行数调用时传入的参数。

## 函数调用

有四种方式调用js函数: 作为函数、作为方法、作为构造函数、通过它们的call() 和 apply() 方法间接调用

*方法链*：

当方法的返回值是一个对象，这个对象还可以再调用它的方法。这种方法调用序列中（通常被称为“链”）每次的调用结果都是另外一个表达式的组成部分。比如jquery库。

当方法并不需要返回值时，最好直接返回this。如果再设计的API中一直采用这种方式（每个方法都返回this），使用API就可以进行链式调用。这种编程风格中，只要指定一次要调用的对象即可，余下的方法都可以基于此进行调用。

注意⚠️不要将方法的链式调用和构造函数的链式调用混为一谈。

* this是一个关键字，不是变量也不是属性名。ES3和非严格的ES5，调用上下文（this）是全局对象，严格模式下，则是undefined。

* 函数表达式作为对象的属性访问表达式，此时是一个方法，对象成为函数的调用上下文。

```javascript
var calculator = { // An object literal
    operand1: 1,
    operand2: 1,
    add: function() {
        // Note the use of the this keyword to refer to this object.
        this.result = this.operand1 + this.operand2;
    }
};
calculator.add(); // A method invocation to compute 1+1.
calculator.result // => 2
```

* 任何函数只要作为方法调用实际上都会传入一个隐式的实参，这个实参是一个对象，方法调用的母体就是这个对象。

* this是关键字，非变量，所以this没有作用域的限制——嵌套的函数不会从调用它的函数中继承this，它的this指向调用它的对象。

```javascript
var o = {
       m: function() {
           var self = this; // 将this的值保存至一个变量中
           console.log(this === o); 
           f(); // 调用辅助函数 f().
           function f() { // 定义嵌套函数f()
               console.log(this === o); // "false": this的值是全局对象或undefined
               console.log(self === o); // "true": self指外部函数的this值
           }
       }
   };
   o.m();
```

* 如果函数或者方法调用之前带有关键字new，就构成构造函数调用。
* 构造函数中的this指向这个新创建的对象。
* call和apply可以显示地指定调用所需的this值，即使该函数不是那个对象的方法。

## 函数的实参和形参

调用函数时传入的实参比函数声明时指定的形参个数要少，则剩下的形参设置为undefined，所以需要给省略的参数赋一个默认值。

```javascript
// 将对象o中可枚举的属性名追加至数组a中，并返回这个数组a
// 如果省略a，则创建一个新数组并返回这个新数组
function getPropertyNames(o, /* optional */ a) {
  if (a === undefined) a = [];
  for(var property in o) a.push(property);
  return a;
}
// 这个函数调用可以传入1个或2个实参
var a = getPropertyNames(o); // 将o的属性存储到一个新数组中
getPropertyNames(p,a); // 将p的属性追加到数组a中
a = a || [];
```

调用函数时传入的实参个数超过形参个数时，不能直接获得未命名值的引用——在函数体内，标识符arguments是指向实参对象的引用，是一个类数组对象。

```javascript
function f(x, y, z) {
  // 验证传入实惨的个数是否正确
  if (arguments.length != 3) {
    throw new Error("function f called with " + arguments.length +
    "arguments, but it expects 3 arguments.");
  }
  // 再执行函数的其他逻辑
}
```

实参对象有一个重要的用处，就是让函数可以操作任意数量的实参。不定实参函数——接受任意个数的实参。

```javascript
function max(/* ... */) {
  var max = Number.NEGATIVE_INFINITY;
  for(var i = 0; i < arguments.length; i++)
      if (arguments[i] > max) max = arguments[i];
  return max;
}
var largest = max(1, 10, 100, 2, 3, 1000, 4, 5, 10000, 6); // => 10000
```

通过实参名字来修改实参值的话，通过arguments[]数组可以获取到更改后的值。

```javascript
function f(x) {
    console.log(x);
    arguments[0] = null; // 这里修改实参数组的元素同样会修改x的值
    console.log(x); // ==> null
}
// x和arguments[0]指代同一个值
```

ES5的严格模式下，读写callee和caller属性会产生类型错误。callee指代当前正在执行的函数。caller指代调用当前正在执行的函数的函数。在匿名函数中可以通过callee来递归的调用本身。

```javascript
var factorial = function(x) {
  if (x <= 1) return 1;
  return x * arguments.callee(x-1);
};
```

形参过多时，可以将传入的实参写入一个单独的对象。这样就不需要去记实参的顺序了。

```javascript
function arraycopy(/* array */ from, /* index */ from_start,
                /* array */ to, /* index */ to_start,
                /* integer */ length)
{
// ...
}
function easycopy(args) {
    arraycopy(args.from,
    args.from_start || 0, // 这里设置了默认值
    args.to,
    args.to_start || 0,
    args.length);
}
var a = [1,2,3,4], b = [];
easycopy({from: a, to: b, length: 4})
```

实参类型做类型检查

```javascript
function sum(a) {
  if (isArrayLike(a)) {
    var total = 0;
    for(var i = 0; i < a.length; i++) {
        var element = a[i];
        if (element == null) continue;
        if (isFinite(element)) total += element;
        else throw new Error("sum(): elements must be finite numbers");
    }
    return total;
  } else throw new Error("sum(): argument must be array-like");
}
```

这里的sum方法进行了非常严格的实参检查，当传入非法的值时，会给出容易看懂的错误提示信息。但是当涉及类数组对象和真正的数组，这种灵活性不高。

## 作为值的函数

函数可以赋给变量。

```javascript
function square(x) {
  return x*x
}
var s = square;
square(4) //  16
s(4) // 16
```

函数除了赋值给变量，还可以赋值给对象的属性，此时函数就称为方法。

```javascript
function add(x,y) { return x + y; }
function subtract(x,y) { return x - y; }
function multiply(x,y) { return x * y; }
function divide(x,y) { return x / y; }
function operate(operator, operand1, operand2) {
  return operator(operand1, operand2);
}
//  (2+3)+(4*5)
var i = operate(add, operate(add, 2, 3), operate(multiply, 4, 5));
var operators = {
    add: function(x,y) { return x+y; },
    subtract: function(x,y) { return x-y; },
    multiply: function(x,y) { return x*y; },
    divide: function(x,y) { return x/y; },
    pow: Math.pow
};
function operate2(operation, operand1, operand2) {
    if (typeof operators[operation] === "function")
    return operators[operation](operand1, operand2);
    else throw "unknown operator";
}
var j = operate2("add", "hello", operate2("add", " ", "world"));
var k = operate2("pow", 10, 2);
```

函数可以拥有属性，使信息在函数调用过程中持久化——不需要放到全局变量中。

```javascript
// 函数声明会提前 所以这里可以在之前赋值
uniqueInteger.counter = 0;
// 每次调用这个函数会返回一个不同的整数
// 它使用一个属性来记住下一次将要返回的值
function uniqueInteger() {
  return uniqueInteger.counter++; // 先放回计数器的值，然后计数器自增1
```

函数使用自身的属性缓存上一次的计算结果。

```javascript
// 计算阶乘，并将结果缓存到函数的属性中。
function factorial(n) {
  if (isFinite(n) && n>0 && n==Math.round(n)) {
  if (!(n in factorial))
    factorial[n] = n * factorial(n-1); // 计算结果并缓存
    return factorial[n]; // 返回缓存结果
  }
  else return NaN;
}
factorial[1] = 1;
```

## 作为命名空间的函数

在函数中声明的变量在整个函数体内是可见的，在函数外是不可见的。不在任何函数内声明的变量是全局变量。

通过将代码放入一个函数内，然后调用该函数，使全局变量变成函数内的局部变量。（立即执行函数）

```javascript
function mymodule() {
  // 这里定义的变量是局部变量
}
mymodule();

(function() {
  // ...
}()); // 立即执行函数
```

上面函数左圆括号是必需的，如果不写，会被解析为函数声明语句。

特定场景下返回带补丁的extend()版本——for/in循环是否会枚举测试对象的toString属性。

```javascript
// 定义一个扩展函数，用来将第二个以及后续参数复制至第一个参数。
// 如果o的属性拥有一个不可枚举的同名属性，则for/in循环不会枚举对象o的可枚举属性，也就是说，将不会正确地处理toString的属性除非我们显式检测它
var extend = (function() { // 将这个函数的返回值赋值给extend
  // 在修复它之前，先检查是否存在bug
  for(var p in {toString:null}) {
    // 如果代码执行到这里，那么for/in循环会正确工作并返回
    // 一个简单版本的extend函数
    return function extend(o) {
      for(var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for(var prop in source) o[prop] = source[prop];
      }
      return o;
    };
  }
  // 如果代码执行到这里，说明for/in循环不会枚举测试对象的toString属性
  // 所以返回另一个版本的extend函数，这个函数显式测试
  // Object.prototype中的不可枚举属性
  return function patched_extend(o) {
    for(var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      // 复制所有的可枚举属性
      for(var prop in source) o[prop] = source[prop];
        // 检查特殊属性
        for(var j = 0; j < protoprops.length; j++) {
          prop = protoprops[j];
          if (source.hasOwnProperty(prop)) o[prop] = source[prop];
        }
      }
      return o;
    };
    // 这个列表列出来需要检查的特殊属性
    var protoprops = ["toString", "valueOf", "constructor", "hasOwnProperty",
    "isPrototypeOf", "propertyIsEnumerable","toLocaleString"];
}());
```

## 闭包

* JavaScript采用词法作用域，函数的执行依赖于变量作用域，是在函数定义时决定，而不是调用时决定的。

* 闭包——函数对象可以通过作用域链相互关联起来，函数体内部的变量都可以保存在函数作用域内。

* 词法作用域规则——作用域链是函数定义的时候创建的。

```javascript
var scope = "global scope"; // 全局变量
function checkscope() {
    var scope = "local scope"; // 局部变量
    function f() { return scope; } // 在作用域中返回这个值
    return f();
}
checkscope() // => "local scope"

var scope = "global scope"; 
function checkscope() {
    var scope = "local scope";
    function f() { return scope; }
    return f;
}
checkscope()() // 这个返回值是什么？
```

js函数用到了作用域链，这个作用域链是函数定义的时候创建的。嵌套函数f()定义在这个作用域链里，其中的变量scope一定是局部变量，不管在何时何地执行函数f()，这种绑定在执行f()时依然有效。所以最后返回的是“local scope”。

闭包，可以捕捉到局部变量和参数，并一直保存下来。看起来像是这些变量绑定到了在其中定义它们的外部函数。

其实很容易理解，就是函数定义时的作用域链到函数执行时依然有效。

接下来，改造uniqueInteger()函数，使局部变量变成私有状态。

```javascript
var uniqueInteger = (function() { // 定义函数并立即调用
  var counter = 0; // 函数的私有状态
  return function() { return counter++; };
}());
```

类似counter的私有变量可以被多个嵌套函数访问。

```javascript
function counter() {
  var n = 0;
  return {
    count: function() { return n++; },
    reset: function() { n = 0; }
  };
}
var c = counter(), d = counter(); // 创建两个计数器
c.count() // => 0
d.count() // => 0:  它们互不干扰
c.reset() // reset() 和 count() 方法共享状态
c.count() // => 0: 因为我们重置了c
d.count() // => 1: 而没有重置d
```

从技术角度看，其实可以将这个闭包合并为属性存取器方法getter和setter。

```javascript
function counter(n) { // n为一个私有变量
    return {
        get count() { return n++; },
        // 属性setter不允许n递减
        set count(m) {
        if (m >= n) n = m;
        else throw Error("count can only be set to a larger value");
        }
    };
}
var c = counter(1000);
c.count // => 1000
c.count // => 1001
c.count = 2000
c.count // => 2000
c.count = 2000 // => Error!
```

使用闭包技术来共享私有状态的通用做法。

```javascript
function addPrivateProperty(o, name, predicate) {
  var value;
  o["get" + name] = function() { return value; };
  o["set" + name] = function(v) {
    if (predicate && !predicate(v))
      throw Error("set" + name + ": invalid value " + v);
    else
      value = v;
  };
}
var o = {};
// 增加属性存取器方法getName和setName，确保只允许字符串值
addPrivateProperty(o, "Name", function(x) { return typeof x == "string"; });

o.setName("Frank"); // 设置属性值
console.log(o.getName()); // 得到属性值
o.setName(0); // 设置一个错误类型的值，会报错
```

在同一个作用域链种定义两个闭包，这两个闭包共享同样的私有变量或变量。

```javascript
// 这个函数返回一个总是返回v的函数
function constfunc(v) { return function() { return v; }; }
// 创建一个数组来存储常数函数
var funcs = [];
for(var i = 0; i < 10; i++) funcs[i] = constfunc(i);
// 在第5个位置的元素所表示的函数返回值是5
funcs[5]() // => 5


function constfuncs() {
    var funcs = [];
    for(var i = 0; i < 10; i++)
    funcs[i] = function() { return i; };
    return funcs;
}
var funcs = constfuncs();
funcs[5]() // 这个返回了 10

// 这段代码创建了10个闭包，并将它们存储在一个数组中。这些个闭包在同一个函数调用中定义，所以它们可以共享变量i
// 当constfunc()返回的时候，变量i的值是10
```

牢记一点，关联到闭包的作用域链是“活动的”！！！
闭包在外部函数内是无法访问this的，除非外部函数将this转存为一个变量。

## 函数属性、方法和构造函数

* 函数的length代表形参的个数
* prototype属性：这个属性指向一个对象的引用，“原型对象”
* call()和apply(): ES5严格模式中，call和apply的第一个实参都会变为this的值（即使是null和undefined），在ES3和非严格模式中，传入的null和undefined会被全局变量代替。

```javascript
f.call(o, 1, 2);
f.apply(o, [1,2]);
```

* bind()方法——将函数绑定到某个对象。实现bind方法。

```javascript
function bind(f, o) {
  if (f.bind) return f.bind(o);
    else return function() {
      return f.apply(o, arguments);
    };
}
```

* 柯里化

```javascript
var sum = function(x,y) { return x + y };
var succ = sum.bind(null, 1);
succ(2) // => 3
function f(y,z) { return this.x + y + z };
var g = f.bind({x:1}, 2);
g(3)
```

* Function.bind()

```javascript
if (!Function.prototype.bind) {
  Function.prototype.bind = function(o /*, args */) {
    var self = this, boundArgs = arguments;
    return function() {
      var args = [], i;
      for(i = 1; i < boundArgs.length; i++) args.push(boundArgs[i]);
      for(i = 0; i < arguments.length; i++) args.push(arguments[i]);
      return self.apply(o, args);
    };
  };
}
```

### Function()构造函数

var f = new Function("x", "y", "return x*y;");

* Function()构造函数允许JavaScript在运行时动态地创建并编译函数
* 每次调用Function()构造函数都会解析函数体，并创建新的函数对象
* 它所创建的函数并不是用词法作用域，总是在顶层函数执行——无法捕获局部作用域。

```javascript
var scope = "global";
function constructFunction() {
var scope = "local";
return new Function("return scope");
}
constructFunction()(); // => "global
```

检测一个对象是否是真正的函数对象

```javascript
function isFunction(x) {
  return Object.prototype.toString.call(x) === "[object Function]";
}
```

## 函数式编程

### 使用函数处理数组

使用函数处理数组——计算平均值和标准差。

```javascript
var sum = function(x,y) { return x+y; };
var square = function(x) { return x*x; };
var data = [1,1,3,5,5];
var mean = data.reduce(sum)/data.length;
var deviations = data.map(function(x) {return x-mean;});
var stddev = Math.sqrt(deviations.map(square).reduce(sum)/(data.length-1));
```

自定义的map和reduce函数

```javascript
var map = Array.prototype.map
? function(a, f) { return a.map(f); }
: function(a, f) {
  var results = [];
  for(var i = 0, len = a.length; i < len; i++) {
    if (i in a) results[i] = f.call(null, a[i], i, a);
  }
  return results;
};

var reduce = Array.prototype.reduce
? function(a, f, initial) {
    if (arguments.length > 2)
      return a.reduce(f, initial);
    else 
      return a.reduce(f);
  }
  : function(a, f, initial) {
      var i = 0, len = a.length, accumulator;
      if (arguments.length > 2) accumulator = initial;
      else { 
        if (len == 0) throw TypeError();
        while(i < len) {
          if (i in a) {
            accumulator = a[i++];
            break;
          }
          else i++;
        }
        if (i == len) throw TypeError();
      }
      while(i < len) {
        if (i in a)
          accumulator = f.call(undefined, accumulator, a[i], i, a);
        i++;
      }
      return accumulator;
    }
```

使用自定义的map和reduce函数

```javascript
var data = [1,1,3,5,5];
var sum = function(x,y) { return x+y; };
var square = function(x) { return x*x; };
var mean = reduce(data, sum)/data.length;
var deviations = map(data, function(x) {return x-mean;});
var stddev = Math.sqrt(reduce(map(deviations, square), sum)/(data.length-1));
```

### 高阶函数

操作函数的函数，接收一个或多个函数作为参数，返回一个新的函数

```javascript
//not()函数时一个高阶函数
function not(f) {
  return function() {
    var result = f.apply(this, arguments);
    return !result;
  };
}
var even = function(x) {
  return x % 2 === 0;
};
var odd = not(even);
[1,1,3,5,5].every(odd); // => true: 每个元素都是奇数
```

```javascript
function mapper(f) {
  return function(a) { return map(a, f); };
}
var increment = function(x) { return x+1; };
var incrementer = mapper(increment);
incrementer([1,2,3]) // => [2,3,4]
```

```javascript
function compose(f, g) {
  return function() {
    return f.call(this, g.apply(this, arguments));
  };
}
var square = function(x) { return x*x; };
var sum = function(x,y) { return x+y; };
var squareofsum = compose(square, sum);
squareofsum(2,3) // => 25
```

### 不完全函数

把一次完整的函数调用拆成多次函数调用，每次传入的实参都是完整实参的一部分，每次拆分开的函数叫做不完全函数，每次函数调用叫做不完全调用

```javascript
//将类数组对象转换为真正的数组
function array(a, n) { return Array.prototype.slice.call(a, n || 0); }

//这个函数的实参传递至左侧
function partialLeft(f /*, ...*/) {
  var args = arguments; // 保存外部的实参数组
  return function() {
    var a = array(args, 1);
    a = a.concat(array(arguments));
    return f.apply(this, a);
  };
}

//这个函数的实参传递至右侧
function partialRight(f /*, ...*/) {
  var args = arguments;
  return function() {
    var a = array(arguments);
    a = a.concat(array(args,1));
    return f.apply(this, a);
  };
}

//这个函数的实参被用作模板
//实参列表中的undefined值都被填充
function partial(f /*, ... */) {
  var args = arguments;
  return function() {
    var a = array(args, 1);
    var i=0, j=0;
    for(; i < a.length; i++)
      if (a[i] === undefined) a[i] = arguments[j++];
      a = a.concat(array(arguments, j))
    return f.apply(this, a);
  };
}
```

利用已有函数来定义新的函数：

```javascript
var increment = partialLeft(sum, 1);
var cuberoot = partialRight(Math.pow, 1/3);
String.prototype.first = partial(String.prototype.charAt, 0);
String.prototype.last = partial(String.prototype.substr, -1, 1)
```

当将不完全调用和其他高阶函数整合在一起

```javascript
var not = partialLeft(compose, function(x) { return !x; });
var even = function(x) { return x % 2 === 0; };
var odd = not(even);
var isNumber = not(isNaN)
```

使用不完全调用的组合来重新组织求平均数和标准差的代码——函数式编程

```javascript
var data = [1,1,3,5,5]; // Our data
var sum = function(x,y) { return x+y; };
var product = function(x,y) { return x*y; };
var neg = partial(product, -1); // 定义其他函数
var square = partial(Math.pow, undefined, 2);
var sqrt = partial(Math.pow, undefined, .5);
var reciprocal = partial(Math.pow, undefined, -1);
// 计算平均值和标准差，所有的函数调用都不带运算符

var mean = product(reduce(data, sum), reciprocal(data.length));
var stddev = sqrt(product(reduce(map(data,
                                    compose(square,
                                      partial(sum, neg(mean)))),
                            sum),
                      reciprocal(sum(data.length,-1))));
```

### 记忆

将上次的计算结果缓存起来，在函数式编程中，这种缓存技巧叫做“记忆”。

```javascript
function memoize(f) {
  var cache = {};
  return function() {
    var key = arguments.length + Array.prototype.join.call(arguments,",");
    if (key in cache) return cache[key];
    else return cache[key] = f.apply(this, arguments);
  };
}
```

memoize函数创建一个新的对象，这个对象被当作缓存的宿主并赋值给一个局部变量，所有对于返回的函数来说他是私有的（在闭包中）。所返回的函数将他的实参数组转换为字符串，并将字符串用作缓存对象的属性名，如果缓存仲有这个值，那么直接返回它。

```javascript
//欧几里得算法-求两个整数的最大公约数
function gcd(a,b) {
  var t;
  if (a < b) t=b, b=a, a=t;
  while(b != 0) t=b, b = a%b, a=t;
  return a;
}
var gcdmemo = memoize(gcd);
gcdmemo(85, 187) // => 17
var factorial = memoize(function(n) {
  return (n <= 1) ? 1 : n * factorial(n-1);
});
factorial(5) // => 120.
```
