# three-practice

#### 介绍
Web 3D练习，从入门到入土

#### 流程
1. 图形学 和 数学 打好基础
2. 选择一个领域，Web (WebGL、Threejs)、3D引擎、游戏 (Unity) ...
3. 新建一个文件夹 ...

#### 例子
Three.js官方网站提供了丰富的示例来帮助开发者学习和理解如何使用这个强大的3D库。这些示例覆盖了从基础到高级的多种技术，包括但不限于：

1. **基础示例**：如创建一个最基本的3D场景，包含渲染器、摄像机和一个简单的几何体（如立方体或球体）。
2. **材质与纹理**：展示不同类型的材质应用，如基础颜色材质、光照材质、纹理贴图等。
3. **光照与阴影**：演示如何添加光源（如环境光、点光源、聚光灯等）以及实现阴影效果。
4. **动画与交互**：包括物体旋转、缩放等基本动画，以及鼠标和键盘交互控制3D场景。
5. **几何体与模型加载**：展示如何创建各种几何形状，以及如何导入和使用外部3D模型。
6. **后处理与特效**：如景深效果、模糊效果、Bloom（辉光效果）等高级视觉效果的实现。
7. **粒子系统**：如何创建粒子效果，如火焰、烟雾、雨雪等。
8. **2D图形与文字**：在3D场景中渲染2D图形和3D文字。
9. **WebGL特性利用**：展示如何利用WebGL的高级特性，如缓冲区对象、着色器等进行定制渲染。
10. **AR与VR**：包括WebVR和WebXR相关的示例，展示如何创建增强现实和虚拟现实应用。

每个示例通常都附带源代码，并且可以直接在网页上查看运行效果，这对于学习特定技术点非常有帮助。此外，官方网站还提供了详尽的API文档和指南，帮助开发者深入学习Three.js的各个方面。


#### 功能
**已实现功能**
1. **基础组件设置**
   - **渲染器**：配置 WebGL 渲染器的各项参数，如抗锯齿、sRGB 输出编码、尺寸调整、设备像素比、背景颜色，并添加窗口 resize 事件监听。
   - **相机**：创建透视相机，设定视角、宽高比、近/远裁剪面距离，设置初始位置和更新投影矩阵。
   - **灯光**
     - **环境光**：添加全局环境光。
     - **定向光**：创建定向光，可调整颜色和强度。
   - **场景**
     - **场景创建**：初始化场景对象。
     - **雾效**：添加雾效，可调节雾的颜色、起始距离和结束距离。
   - **交互功能**
     - **OrbitControls**：实现相机的旋转、平移、缩放交互。
   - **GUI 控制面板**
     - **光照控制**：调整环境光和定向光的颜色和强度。
     - **雾效控制**：调整雾的颜色、起始距离和结束距离。
   - **辅助工具**
     - **坐标轴辅助线**
     - **网格辅助**
     - **平面辅助**
     - **点光源辅助**
     - **聚光灯辅助**
     - **方向光辅助**
     - **相机辅助**

2. **3D模型加载**
   - 使用模型加载器（如 `THREE.GLTFLoader`、`THREE.ObjectLoader`）加载多种格式（`.gltf`, `.glb`, `.obj`, `.fbx` 等）的 3D 模型。
   - 对加载的模型进行位置、旋转、缩放和材质属性的调整。

3. **动画与关键帧**
   - 定义并播放关键帧动画，利用 `THREE.AnimationMixer` 和 `THREE.KeyframeTrack` 进行控制。
   - 通过 `THREE.AnimationClip`、`THREE.AnimationAction` 等 API 实现精细的动画管理。

4. **粒子系统**
   - 使用 `THREE.Points` 或 `THREE.PointsMaterial` 创建粒子系统，实现诸如烟雾、火焰、星空、雪花等效果。
   - 结合 `THREE.ShaderMaterial` 和自定义着色器实现复杂的粒子效果。

5. **物理模拟**
   - 集成第三方物理引擎（如 Cannon.js 或 Ammo.js），使用对应的插件（如 `THREE.CannonPhysics` 或 `THREE.AmmoPhysics`）。
   - 为场景对象添加物理属性，处理碰撞检测、重力、刚体动力学等。

6. **用户交互**
   - 实现除 OrbitControls 以外的交互方式，如射线拾取（`THREE.Raycaster`）、鼠标拖拽旋转、触摸手势识别（如集成 Hammer.js）。
   - 根据交互结果更新场景状态、触发特效或动画。

**待实现功能**
1. **后期处理效果**
   - 使用 `THREE.EffectComposer` 结合 `THREE.ShaderPass` 实现景深、模糊、色彩校正、噪点、像素化等后期处理效果。
   - 利用 `THREE.ShaderLib` 提供的着色器或编写自定义 GLSL 着色器实现独特的视觉效果。

2. **音频与音效**
   - 添加背景音乐和空间化音效，利用 `THREE.AudioListener`、`THREE.Audio`、`THREE.PositionalAudio`。
   - 使用 `THREE.AudioLoader` 加载音频文件，并通过 `THREE.AudioAnalyser` 实现音频可视化。

3. **多视图与分屏显示**
   - 创建多个相机、渲染器和 canvas 元素，实现不同视角的并列显示或分屏布局。
   - 使用 `THREE.StereoCamera` 实现立体视图，或 `THREE.WebGLMultisampleRenderTarget` 提升抗锯齿效果。

4. **性能优化**
   - 使用 `THREE.LOD` 实现细节层次，根据相机距离自动切换模型的低模和高模版本。
   - 采用 `THREE.BufferGeometry`、`THREE.InstancedBufferGeometry`、`THREE.InstancedMesh` 优化相似对象的渲染。
   - 利用 `renderer.info` 监控渲染统计信息，据此调整渲染策略以降低 GPU 负荷。