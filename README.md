# ✨ SpatialScenes

一个轻量级的JavaScript库，用于创建类似iOS 26 Spatial Scenes的3D视差效果。通过鼠标移动模拟设备倾斜，将普通2D图片转换为具有景深效果的3D立体画面。

## ✨ 特性

- 🎯 **零依赖** - 纯JavaScript实现，无需任何外部库
- 📱 **响应式** - 支持桌面和移动设备
- 🎮 **易于使用** - 简单的API，几行代码即可集成
- 🎨 **可定制** - 丰富的配置选项
- 🔧 **模块化** - 支持多种引入方式（UMD、ES6、CommonJS）
- 🐛 **调试友好** - 内置调试信息显示
- 🖼️ **背景填充** - 解决旋转时的黑边和虚线问题

## 🚀 快速开始

### 1. 引入库文件

```html
<!-- 直接引入 -->
<script src="spatial-scene.js"></script>
```

```javascript
// ES6 模块
import SpatialScene from './spatial-scene.js';

// CommonJS
const SpatialScene = require('./spatial-scene.js');
```

### 2. 创建HTML容器

```html
<div id="my-scene" style="width: 500px; height: 350px;"></div>
```

### 3. 初始化场景

```javascript
// 基础用法
const scene = new SpatialScene({
    container: '#my-scene'
});

// 加载图片
scene.loadImage('path/to/your/image.jpg');
```

## 📖 详细用法

### 配置选项

```javascript
const scene = new SpatialScene({
    container: '#my-scene',        // 容器选择器或DOM元素
    width: 500,                    // 容器宽度（数字或字符串）
    height: 350,                   // 容器高度（数字或字符串）
    maxRotation: 15,               // 最大旋转角度（度）
    parallaxStrength: 0.5,         // 视差强度（0-1）
    fillBackground: true,          // 是否填充背景（解决旋转时的黑边问题）
    enableTouch: true,             // 是否启用触摸支持
    showDebugInfo: false,          // 是否显示调试信息
    autoInit: true                 // 是否自动初始化
});
```

### 主要方法

```javascript
// 加载图片
scene.loadImage('image.jpg');

// 重置视角
scene.reset();

// 销毁实例
scene.destroy();
```

### 链式调用

```javascript
const scene = new SpatialScene({ container: '#scene' })
    .loadImage('image.jpg')
    .reset();
```

## 🎮 交互方式

- **桌面端**: 移动鼠标控制3D效果
- **移动端**: 触摸滑动控制3D效果
- **重置**: 调用 `reset()` 方法恢复初始视角

## 🎨 效果原理

库将单张2D图片分解为三个图层：

- **背景层** (Background): 距离最远，移动幅度最小
- **中景层** (Midground): 中等距离，中等移动幅度
- **前景层** (Foreground): 距离最近，移动幅度最大

通过CSS 3D变换和不同的视差移动速度，创造出立体的景深效果。

## 🔧 高级配置

### fillBackground 选项

当启用 `fillBackground: true` 时：
- 背景图层会放大到1.3倍
- 有效解决旋转时出现的黑边和虚线问题
- 提供更流畅的视觉体验

### 调试模式

启用 `showDebugInfo: true` 可以显示：
- 当前鼠标坐标
- 标准化的坐标值
- 实时旋转角度

## 📱 预览

![✨ SpatialScenes](https://github.com/ELDment/IOS26-Spatial-Scenes/blob/main/SpatialScenes.png)

## 🎯 使用场景

- **产品展示**: 为产品图片添加3D效果
- **艺术作品**: 增强图片的视觉冲击力
- **网站背景**: 创建动态的背景效果
- **移动应用**: 模拟iOS Spatial Scenes功能

## 🔍 浏览器支持

- Chrome 36+
- Firefox 31+
- Safari 9+
- Edge 12+
- iOS Safari 9+
- Android Browser 4.4+

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

**注意**: 这是对iOS 26 Spatial Scenes功能的算法模拟实现，旨在为Web平台提供类似的视觉体验。
