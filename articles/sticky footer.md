# sticky footer布局

## 负margin布局方式

html代码：

```html
<div class="detail">
  <div class="wrapper clearfix">
    <div class="title">
      <h1>这里是头部</h1>
    </div>
    <div class="main">
      <p>这里是main content区域...</p>
    </div>
  </div>
  <div class="footer">
    <p>© 2017 No rights reserved.</p>
  </div>
</div>  
```

css代码：

```css
.detail {
  position: fixed;
  overflow: auto;
  width: 100%;
  height: 100%;
}
.wrapper {
  min-height: 100%;
  width: 100%;
}
.clearfix:after {
  display: block;
  content: ".";
  height: 0;
  clear: both;
  visibility: hidden;
}
.main {
  padding-bottom: 64px;
}
.footer {
  margin: -64px auto 0;
}
```

`.main`中的`padding-bottom`的值要和`.footer`中的`负margin`值保持一致。

## flex布局方式

html代码：

```html
<body>
  <header>
    <h1>头部</h1>
  </header>
  <div class="main">
    <p>主体内容</p>
  </div>
  <footer>
    <p>© 2017 No rights reserved.</p>
  </footer>
</body>
```

css代码：

```css
body{
  display: flex;
  flex-flow: column;
  min-height: 100vh;
  overflow:auto;
}
.main{
  flex:1;
}
```
