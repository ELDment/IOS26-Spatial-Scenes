/**
 * SpatialScene - 空间场景3D效果库
 * 模拟iOS 26的Spatial Scenes功能，通过鼠标移动创建3D视差效果
 * 
 * 使用方法:
 * const spatialScene = new SpatialScene({
 *	container: '#scene-container',
 *	width: 500,					// 容器宽度（数字或字符串）
 *	height: 350,				// 容器高度（数字或字符串）
 *	maxRotation: 15,			// 最大旋转角度
 *	parallaxStrength: 0.5,		// 视差强度
 *	fillBackground: true,		// 是否填充背景（解决旋转时的黑边和虚线问题，启用后背景放大到1.3倍）
 *	enableTouch: true,			// 是否启用触摸支持
 *	showDebugInfo: false		// 是否显示调试信息
 * });
 * 
 * spatialScene.loadImage('path/to/image.jpg');
 * 
 * 返回值: SpatialScene实例，包含容器DOM元素和相关方法
 */

(function(global, factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		// CommonJS
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		// UMD
		define(factory);
	} else {
		// Browser
		global.SpatialScene = factory();
	}
}(typeof self !== 'undefined' ? self : this, function() {
	'use strict';

	class SpatialScene {
		constructor(options = {}) {
			this.options = {
				container: options.container || '.spatial-scene-container',
				width: options.width || null,
				height: options.height || null,
				maxRotation: options.maxRotation || 15,
				parallaxStrength: options.parallaxStrength || 0.5,
				fillBackground: options.fillBackground || false,
				enableTouch: options.enableTouch !== false,
				showDebugInfo: options.showDebugInfo || false,
				autoInit: options.autoInit !== false
			};
			
			this.mouseX = 0;
			this.mouseY = 0;
			this.centerX = 0;
			this.centerY = 0;
			this.isInitialized = false;
			
			if (this.options.autoInit) {
				this.init();
			}
		}
		
		init() {
			if (this.isInitialized) return;
			
			this.container = typeof this.options.container === 'string' 
				? document.querySelector(this.options.container)
				: this.options.container;
				
			if (!this.container) {
				console.error('SpatialScene: 容器元素未找到');
				return;
			}
			
			this.createStructure();
			this.setupEventListeners();
			this.updateCenter();
			this.isInitialized = true;
			
			return this;
		}
		
		createStructure() {
			// 设置容器样式
			const width = this.options.width ? (typeof this.options.width === 'number' ? this.options.width + 'px' : this.options.width) : '100%';
			const height = this.options.height ? (typeof this.options.height === 'number' ? this.options.height + 'px' : this.options.height) : '400px';
			
			this.container.style.cssText = `
				position: relative;
				width: ${width};
				height: ${height};
				perspective: 1000px;
				overflow: hidden;
				border-radius: 20px;
				background: #000;
			`;
			
			// 创建场景容器
			this.scene = document.createElement('div');
			this.scene.className = 'spatial-scene';
			this.scene.style.cssText = `
				width: 100%;
				height: 100%;
				position: relative;
				transform-style: preserve-3d;
				transition: transform 0.1s ease-out;
			`;
			
			// 创建图层
			const bgScale = this.options.fillBackground ? '1.3' : '1.05';
			const bgFilter = this.options.fillBackground ? 'blur(3px) brightness(0.7)' : 'blur(2px) brightness(0.8)';
			this.backgroundLayer = this.createLayer('background', `translateZ(-50px) scale(${bgScale})`, bgFilter);
			this.midgroundLayer = this.createLayer('midground', 'translateZ(0px)', 'none');
			this.foregroundLayer = this.createLayer('foreground', 'translateZ(30px) scale(0.95)', 'brightness(1.1) contrast(1.1)');
			
			this.scene.appendChild(this.backgroundLayer);
			this.scene.appendChild(this.midgroundLayer);
			this.scene.appendChild(this.foregroundLayer);
			this.container.appendChild(this.scene);
			
			// 创建调试信息容器
			if (this.options.showDebugInfo) {
				this.debugInfo = document.createElement('div');
				this.debugInfo.style.cssText = `
					position: absolute;
					top: 10px;
					left: 10px;
					background: rgba(0,0,0,0.7);
					color: white;
					padding: 10px;
					border-radius: 5px;
					font-family: monospace;
					font-size: 12px;
					z-index: 10;
				`;
				this.container.appendChild(this.debugInfo);
			}
			
			this.showPlaceholder();
		}
		
		createLayer(className, transform, filter) {
			const layer = document.createElement('div');
			layer.className = `spatial-layer ${className}`;
			layer.style.cssText = `
				position: absolute;
				width: 100%;
				height: 100%;
				background-size: cover;
				background-position: center;
				background-repeat: no-repeat;
				transform: ${transform};
				filter: ${filter};
				opacity: ${className === 'foreground' ? '0.6' : (className === 'midground' ? '0.8' : '1')};
			`;
			return layer;
		}
		
		setupEventListeners() {
			// 鼠标移动事件
			document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
			
			// 触摸事件
			if (this.options.enableTouch) {
				document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
			}
			
			// 窗口大小改变
			window.addEventListener('resize', () => this.updateCenter());
		}
		
		updateCenter() {
			if (!this.container) return;
			const rect = this.container.getBoundingClientRect();
			this.centerX = rect.left + rect.width / 2;
			this.centerY = rect.top + rect.height / 2;
		}
		
		handleMouseMove(event) {
			this.mouseX = event.clientX;
			this.mouseY = event.clientY;
			this.updateScene();
		}
		
		handleTouchMove(event) {
			if (event.touches.length === 0) return;
			event.preventDefault();
			const touch = event.touches[0];
			this.mouseX = touch.clientX;
			this.mouseY = touch.clientY;
			this.updateScene();
		}
		
		updateScene() {
			if (!this.isInitialized) return;
			
			// 计算相对于容器中心的偏移
			const deltaX = (this.mouseX - this.centerX) / (window.innerWidth / 2);
			const deltaY = (this.mouseY - this.centerY) / (window.innerHeight / 2);
			
			// 限制范围
			const normalizedX = Math.max(-1, Math.min(1, deltaX));
			const normalizedY = Math.max(-1, Math.min(1, deltaY));
			
			// 计算旋转角度
			const rotateY = normalizedX * this.options.maxRotation;
			const rotateX = -normalizedY * this.options.maxRotation;
			
			// 应用3D变换
			this.scene.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
			
			// 更新视差效果
			this.updateParallax(normalizedX, normalizedY);
			
			// 更新调试信息
			if (this.options.showDebugInfo && this.debugInfo) {
				this.debugInfo.innerHTML = `
					鼠标: (${Math.round(this.mouseX)}, ${Math.round(this.mouseY)})<br>
					归一化: (${normalizedX.toFixed(2)}, ${normalizedY.toFixed(2)})<br>
					旋转: X=${rotateX.toFixed(1)}° Y=${rotateY.toFixed(1)}°
				`;
			}
		}
		
		updateParallax(normalizedX, normalizedY) {
			const parallaxX = normalizedX * 20 * this.options.parallaxStrength;
			const parallaxY = normalizedY * 20 * this.options.parallaxStrength;
			
			const bgScale = this.options.fillBackground ? '1.3' : '1.05';
			this.backgroundLayer.style.transform = `translateZ(-50px) scale(${bgScale}) translate(${parallaxX * 0.3}px, ${parallaxY * 0.3}px)`;
			this.midgroundLayer.style.transform = `translateZ(0px) translate(${parallaxX * 0.6}px, ${parallaxY * 0.6}px)`;
			this.foregroundLayer.style.transform = `translateZ(30px) scale(0.95) translate(${parallaxX}px, ${parallaxY}px)`;
		}
		
		loadImage(imageSrc) {
		if (!this.isInitialized) {
			console.error('SpatialScene: 请先调用 init() 方法');
			return;
		}
		
		const img = new Image();
		img.onload = () => {
			this.createLayers(imageSrc);
		};
		img.onerror = () => {
			console.error('SpatialScene: 图片加载失败');
		};
		img.src = imageSrc;
		
		return this;
	}
		
		createLayers(imageSrc) {
			this.backgroundLayer.style.backgroundImage = `url(${imageSrc})`;
			this.midgroundLayer.style.backgroundImage = `url(${imageSrc})`;
			this.foregroundLayer.style.backgroundImage = `url(${imageSrc})`;
			
			// 移除占位符
			[this.backgroundLayer, this.midgroundLayer, this.foregroundLayer].forEach(layer => {
				layer.classList.remove('placeholder');
				layer.innerHTML = '';
			});
		}
		
		showPlaceholder() {
			const placeholderText = '等待加载图片...';
			const borderStyle = this.options.fillBackground ? 'none' : '2px dashed #444';
			const placeholderStyle = `
				display: flex;
				align-items: center;
				justify-content: center;
				color: #666;
				font-size: 16px;
				border: ${borderStyle};
			`;
			
			[this.backgroundLayer, this.midgroundLayer, this.foregroundLayer].forEach(layer => {
				layer.classList.add('placeholder');
				layer.innerHTML = placeholderText;
				layer.style.cssText += placeholderStyle;
				layer.style.backgroundImage = 'none';
			});
		}
		
		reset() {
			if (!this.isInitialized) return;
			
			this.scene.style.transform = 'rotateX(0deg) rotateY(0deg)';
			const bgScale = this.options.fillBackground ? '1.3' : '1.05';
			this.backgroundLayer.style.transform = `translateZ(-50px) scale(${bgScale})`;
			this.midgroundLayer.style.transform = 'translateZ(0px)';
			this.foregroundLayer.style.transform = 'translateZ(30px) scale(0.95)';
			
			return this;
		}
		
		destroy() {
			if (!this.isInitialized) return;
			
			// 移除事件监听器
			document.removeEventListener('mousemove', this.handleMouseMove);
			document.removeEventListener('touchmove', this.handleTouchMove);
			window.removeEventListener('resize', this.updateCenter);
			
			// 清空容器
			if (this.container) {
				this.container.innerHTML = '';
			}
			
			this.isInitialized = false;
			
			return this;
		}
		
		// 更新配置
		updateOptions(newOptions) {
			this.options = { ...this.options, ...newOptions };
			return this;
		}
		
		// 获取当前状态
		getState() {
			return {
				isInitialized: this.isInitialized,
				mousePosition: { x: this.mouseX, y: this.mouseY },
				centerPosition: { x: this.centerX, y: this.centerY },
				options: { ...this.options }
			};
		}
	}
	
	return SpatialScene;
}));
