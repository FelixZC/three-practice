import * as THREE from 'three';
import GUI from 'lil-gui';
import WebGL from 'three/addons/capabilities/WebGL.js';
import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import {
    RoomEnvironment
} from 'three/addons/environments/RoomEnvironment.js';
/**
 *  ThreeDemo类用于创建和管理一个Three.js的3D渲染场景。
 *  @param {string} containerId - 用于包裹Three.js渲染循环的HTML容器元素的ID，默认为"container"。
 *  @returns {ThreeDemo} 返回ThreeDemo的实例。
 */
export default class ThreeDemo {
    constructor(containerId = "container") {
        // 获取HTML容器元素，基于窗口大小初始化画布尺寸和宽高比。
        this.container = document.getElementById(containerId);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspectRatio = this.width / this.height;
        this.devicePixelRatio = window.devicePixelRatio;

        // 初始化Three.js场景、相机和渲染器相关的属性。
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // 配置对象，用于控制各种设置的开启或关闭。
        this.config = {
            isSetUpStats: true, // 是否设置统计信息显示
            isSetUpControls: true, // 是否设置相机控制
            isAddAxesHelper: true, // 是否添加坐标轴辅助线
            isAddGridHelper: true, // 是否添加网格辅助线
            isAddCameraHelper: true, // 是否添加相机辅助线
            isSetUpGUI: true, // 是否设置图形用户界面
            isSetUpEnvironment: false, // 是否设置环境光
        };

        // 检查WebGL是否可用，如果不可用，则向容器添加错误消息并抛出异常。
        if (!WebGL.isWebGLAvailable()) {
            const warning = WebGL.getWebGLErrorMessage();
            this.container.appendChild(warning);
            throw new Error("WebGL is not available.");
        }
    }

    /**
     * 初始化 GUI 控制面板。
     */
    setUpGUI() {
        const gui = new GUI();

        // 创建光照颜色控制器
        const lightColorController = gui.addColor(this.directionalLight, 'color').name('Directional Light Color');
        lightColorController.onChange((value) => {
            this.directionalLight.color.set(value);
        });

        // 创建光照强度控制器
        const lightIntensityController = gui.add(this.directionalLight, 'intensity', 0, 5).step(0.1).name('Directional Light Intensity');
        lightIntensityController.onChange((value) => {
            this.directionalLight.intensity = value;
        });

        // 创建雾效颜色控制器
        const fogColorController = gui.addColor(this.scene.fog, 'color').name('Fog Color');
        fogColorController.onChange((value) => {
            this.scene.fog.color.set(value);
        });

        // 创建雾效范围控制器
        const fogRangeController = gui.add(this.scene.fog, 'near', 0, 0.5).step(0.1).name('Fog Near');
        fogRangeController.onChange((value) => {
            this.scene.fog.near = value;
        });

        // 通过GUI界面控制器动态调整场景雾化效果的远距离参数。
        const fogFarController = gui.add(this.scene.fog, 'far', 0, 1000).step(1).name('Fog Far');

        // 当雾化远距离值发生变化时，更新场景的雾化远距离参数。
        fogFarController.onChange((value) => {
            this.scene.fog.far = value;
        });
    }


    /**
     * 添加坐标轴辅助线，帮助识别场景中 XYZ 坐标的方向。
     *
     * @param {number} [size=5] 辅助线的长度
     */
    addAxesHelper(size = 5) {
        const axesHelper = new THREE.AxesHelper(size);
        this.scene.add(axesHelper);
    }

    /**
     * 添加网格辅助，帮助定位和对齐物体。
     *
     * @param {number} [size=100] 网格大小
     * @param {number} [divisions=10] 网格分割数（每边的细分数量）
     */
    addGridHelper(size = 100, divisions = 10) {
        const gridHelper = new THREE.GridHelper(size, divisions);
        this.scene.add(gridHelper);
    }

    /**
     * 添加平面辅助，以三维形式显示一个平面，便于查看平面的法线方向和尺寸。
     *
     * @param {THREE.Plane} plane 需要显示辅助的平面对象
     * @param {number} [size=1] 辅助线的大小
     * @param {number} [hexColor1=0xffff00] 平面法线方向的辅助线颜色（十六进制）
     * @param {number} [hexColor2=0x0000ff] 平面切线方向的辅助线颜色（十六进制）
     */
    addPlaneHelper(plane, size = 1, hexColor1 = 0xffff00, hexColor2 = 0x0000ff) {
        const planeHelper = new THREE.PlaneHelper(plane, size, hexColor1, hexColor2);
        this.scene.add(planeHelper);
    }

    /**
     * 添加点光源辅助，以小球和射线的形式展示点光源的位置和照射方向。
     *
     * @param {THREE.PointLight} light 需要显示辅助的点光源对象
     * @param {number} [sphereSize=0.75] 点光源小球的大小
     */
    addPointLightHelper(light, sphereSize = 0.75) {
        const pointLightHelper = new THREE.PointLightHelper(light, sphereSize);
        this.scene.add(pointLightHelper);
    }

    /**
     * 添加聚光灯辅助，以圆锥体和射线的形式展示聚光灯的位置、照射方向和角度。
     *
     * @param {THREE.SpotLight} light 需要显示辅助的聚光灯对象
     * @param {number} [sphereSize=0.5] 聚光灯小球的大小
     */
    addSpotLightHelper(light, sphereSize = 0.5) {
        const spotLightHelper = new THREE.SpotLightHelper(light, sphereSize);
        this.scene.add(spotLightHelper);
    }

    /**
     * 添加方向光辅助，以长方体和射线的形式展示方向光的方向。
     *
     * @param {THREE.DirectionalLight} light 需要显示辅助的方向光对象
     * @param {number} [size=1] 方向光长方体的大小
     */
    addDirectionalLightHelper(light, size = 1) {
        const directionalLightHelper = new THREE.DirectionalLightHelper(light, size);
        this.scene.add(directionalLightHelper);
    }

    /**
     * 添加相机辅助，以线框形式展示相机的视椎体和视野范围。
     *
     * @param {THREE.Camera} camera 需要显示辅助的相机对象
     */
    addCameraHelper(camera) {
        const cameraHelper = new THREE.CameraHelper(camera);
        this.scene.add(cameraHelper);
    }

    /**
     * 处理窗口大小改变事件，动态调整相机视角和渲染器尺寸。
     */
    handleWindowResize() {
        window.addEventListener("resize", () => {
            // 当窗口大小改变时，更新相机的宽高比并重新设置渲染器的大小
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /**
     * 设置并初始化Three.js渲染器。
     */
    setUpRenderer() {
        // 创建WebGL渲染器并设置抗锯齿选项
        const renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        // 获取场景和相机引用
        const scene = this.scene
        const camera = this.camera
        // 设置渲染器，并配置其输出编码、大小、像素比和清屏颜色
        this.renderer = renderer
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(this.devicePixelRatio);
        this.renderer.setClearColor(this.scene.fog.color);

        // 动态渲染循环
        function updateRender() {
            requestAnimationFrame(() => {
                renderer.render(scene, camera);
                updateRender();
            });
        }
        updateRender()
    }

    /**
     * 设置并初始化相机。
     */
    setUpCamera() {
        // 创建透视相机并设置其初始位置和参数
        this.camera = new THREE.PerspectiveCamera(90, this.aspectRatio, 0.1, 100);
        this.camera.position.set(5, 2, 8);
        this.camera.aspect = this.aspectRatio;
        this.camera.updateProjectionMatrix();
        // 将相机添加到场景中
        this.scene.add(this.camera);
    }

    /**
     * 设置场景光照。
     */
    setUpLighting() {
        // 添加环境光和方向光到场景中
        const light = new THREE.AmbientLight(4210752);
        this.directionalLight = new THREE.DirectionalLight(16777215, 0.6);
        this.directionalLight.position.set(0, 5, 5);
        this.scene.add(light);
        this.scene.add(this.directionalLight);
    }

    /**
     * 设置并初始化相机控制。
     */
    async setUpControls() {
        // 创建并配置OrbitControls对象
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;

        // 动态更新控制
        function updateControls() {
            requestAnimationFrame(() => {
                controls.update();
                updateControls();
            });
        }
        updateControls()
    }

    /**
     * 设置场景的环境贴图。
     */
    async setUpEnvironment() {
        // 使用PMREMGenerator从一个房间环境创建环境贴图
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = pmremGenerator.fromScene(
            new RoomEnvironment(this.renderer),
            0.04
        ).texture;
    }

    /**
     * 设置Three.js场景，配置雾效。
     */
    setUpScene() {
        // 创建新的场景并设置雾效
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(592152, 1, 600);
        // // 设置场景的背景颜色
        // this.scene.background = new THREE.Color(12575709);
    }

    /**
     * 设置并初始化性能统计器。
     */
    setUpStats() {
        // 创建Stats对象用于性能统计，并将其添加到页面中
        const stats = new Stats();
        this.container.appendChild(stats.dom);

        // 动态更新统计信息
        function updateStats() {
            requestAnimationFrame(() => {
                stats.update();
                updateStats();
            });
        }
        updateStats()
    }

    /**
     * 初始化函数，用于设置3D场景的各种配置和元素。
     * @param {Object} config 配置对象，包含各种可选设置如是否设置控制、是否添加辅助轴等。
     *                        具体结构取决于应用需求。
     * @returns {undefined} 该函数没有返回值。
     */
    async init(config) {
        // 首先检查传入的配置对象，并赋值给this.config
        if (config) {
            this.config = config;
        }

        // 检查WebGL是否可用，如果不可用则提前退出
        if (!WebGL.isWebGLAvailable()) {
            return;
        }

        // 初始化场景、相机、光照和渲染器
        this.setUpScene();
        this.setUpCamera();
        this.setUpLighting();
        this.setUpRenderer();

        // 根据配置，异步设置控制项
        if (this.config.isSetUpControls) {
            await this.setUpControls();
        }

        // 根据配置，异步添加坐标轴辅助工具
        if (this.config.isAddAxesHelper) {
            await this.addAxesHelper();
        }

        // 根据配置，添加网格辅助工具
        if (this.config.isAddGridHelper) {
            this.addGridHelper(200, 20);
        }

        // 根据配置，添加相机辅助工具
        if (this.config.isAddCameraHelper) {
            this.addCameraHelper(this.camera);
        }

        // 根据配置，设置图形用户界面
        if (this.config.isSetUpGUI) {
            this.setUpGUI();
        }
        // 根据配置，设置性能统计
        if (this.config.isSetUpStats) {
            this.setUpStats()
        }
        // 根据配置，设置环境光
        if (this.config.isSetUpEnvironment) {
            this.setUpEnvironment();
        }

        // 处理窗口大小调整事件，并将渲染器的DOM元素添加到容器中
        this.handleWindowResize();
        this.container.appendChild(this.renderer.domElement);
    }
}