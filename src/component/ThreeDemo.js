import * as THREE from 'three';
import {
    setupMouseControls,
    setupAutoRotate
} from '../utils/three.js/animate'
import ThreeDemo from '../utils/three.js/Init'
import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
import {
    DRACOLoader
} from 'three/addons/loaders/DRACOLoader.js';
import Firework from '../utils/three.js/Firework'
/**
 * 渲染一条线
 * @param {ThreeDemo} demo - ThreeDemo实例
 * @param {THREE.Vector3[]} points - 线段顶点数组
 * @param {THREE.LineBasicMaterial} [material] - 自定义线段材质
 */
function renderLine(demo, points, material = new THREE.LineBasicMaterial({
    color: 0x0000ff
})) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    demo.scene.add(line);
}

/**
 * 渲染一个球体
 * @param {ThreeDemo} demo - ThreeDemo实例
 * @param {THREE.Material} [material] - 自定义材质
 * @param {THREE.Vector3} [position] - 自定义球体位置
 * @param {number} [radius=1] - 球体半径
 */
function renderBall(demo, material = new THREE.MeshStandardMaterial({
    color: 0xaafabb
}), position = new THREE.Vector3(0, 0, 0), radius = 1) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const ball = new THREE.Mesh(geometry, material);
    ball.position.copy(position);
    demo.scene.add(ball);
}

/**
 * 渲染一个带单贴图的立方体，并添加鼠标拖动旋转功能
 * @param {ThreeDemo} demo - ThreeDemo实例
 * @param {string} textureUrl - 单张贴图URL
 * @param {THREE.Vector3} [position=THREE.Vector3(0, 0, 0)] - 自定义立方体位置
 */
function renderCubeWithSingleTexture(demo, textureUrl, position = new THREE.Vector3(0, 0, 0)) {
    const textureLoader = new THREE.TextureLoader();
    const material = new THREE.MeshStandardMaterial({
        map: textureLoader.load(textureUrl),
        transparent: true,
        roughness: 0
    });
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);

    // 添加立方体到场景
    demo.scene.add(cube);
    setupMouseControls(cube);
}

/**
 * 渲染一个带多贴图的立方体
 *
 * @param {ThreeDemo} demo - ThreeDemo实例
 * @param {string} atlasImgUrl - 多张贴图的前缀URL，格式如 'path/to/atlas-'
 * @param {number} tilesNum - 贴图数量
 * @param {THREE.Vector3} [position=THREE.Vector3(0, 0, 0)] - 自定义立方体位置
 */
async function renderCubeWithMultipleTextures(demo, atlasImgUrl, tilesNum, position = new THREE.Vector3(0, 0, 0)) {
    const textures = await loadTexturesFromAtlas(atlasImgUrl, tilesNum);

    // 创建一个材质数组，每个材质对应一个从纹理图集加载的贴图
    const materials = textures.map(texture => new THREE.MeshBasicMaterial({
        map: texture
    }));

    // 创建立方体几何体
    const geometry = new THREE.BoxGeometry(3, 3, 3);

    // 使用多材质创建立方体网格，并设置其位置
    const cube = new THREE.Mesh(geometry, materials);
    cube.position.copy(position);

    // 将立方体添加到场景中
    setupAutoRotate(cube);
    demo.scene.add(cube);
    // setupMouseControls(cube);
}

/**
 * 从纹理图集加载指定数量的贴图
 *
 * @param {string} atlasPrefix - 图集文件名前缀，格式如 'path/to/atlas-'
 * @param {number} tilesNum - 贴图数量
 * @returns {Promise<THREE.Texture[]>} - 返回一个包含所有加载完成的纹理的数组
 */
async function loadTexturesFromAtlas(atlasPrefix, tilesNum) {
    const textures = [];
    // 遍历所需贴图数量，依次加载每个贴图
    for (let i = 1; i <= tilesNum; i++) {
        const url = `${atlasPrefix}${i}.png`;
        const image = await loadImage(url);

        // 创建一个新的纹理对象，并将加载的图像赋值给它
        const texture = new THREE.Texture(image);
        texture.needsUpdate = true;

        textures.push(texture);
    }

    return textures;
}

/**
 * 加载指定URL的图像资源
 *
 * @param {string} imageUrl - 图像文件URL
 * @returns {Promise<HTMLImageElement>} - 返回加载完成的图像元素
 */
function loadImage(imageUrl) {
    return new Promise((resolve, reject) => {
        new THREE.ImageLoader().load(imageUrl, resolve, undefined, reject);
    });
}

/**
 * 加载GLTF模型到指定的演示实例中。
 * @param {Object} demo 演示实例，需要包含场景(scene)以及之后可能用到的动画混合器(AnimationMixer)。
 */
function loadGltfModel(demo) {
    // 模型的URL地址
    const modelUrl = '/src/model/gltf/LittlestTokyo.glb'
    // DRACO解码器的路径
    const dracoDecoderPath = '/src/libs/draco/'

    // 模型加载成功后的回调函数
    const onModelLoaded = (gltf) => {
        // 获取模型并设置其位置和缩放比例
        const model = gltf.scene;
        model.position.set(1, 1, 0);
        model.scale.set(0.01, 0.01, 0.01);
        // 将模型添加到演示场景中
        demo.scene.add(model);
        // 创建动画混合器并播放第一个动画
        const clock = new THREE.Clock();
        const mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();
        /**
         * 添加模型动画
         */
        function animate() {
            requestAnimationFrame(() => {
                const delta = clock.getDelta();
                mixer.update(delta);
                animate();
            });
        }
        animate()
    }

    // 模型加载失败时的错误处理函数
    const onModelError = (e) => {
        console.error(e);
    }

    // 初始化DRACO解码器
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(dracoDecoderPath);

    // 初始化GLTF加载器并设置DRACO解码器
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // 加载模型，成功后调用onModelLoaded，失败后调用onModelError
    loader.load(modelUrl, onModelLoaded, undefined, onModelError);
}

/**
 * 向场景中添加烟花效果。
 * @param {Object} demo - 包含场景(scene)等THREE.js相关对象的示例实例，用于添加和管理烟花对象。
 */
function addFireWork(demo) {
    let fireworks = []; // 存储所有烟花对象的数组

    /**
     * 创建并初始化一个烟花对象。
     */
    function createFirework() {
        // 随机生成烟花的初始位置
        const position = new THREE.Vector3(Math.random() * 10 - 5, 0, Math.random() * 10 - 5);
        fireworks.push(new Firework(demo, position)); // 将新创建的烟花添加到数组中
    }

    const clock = new THREE.Clock(); // 用于动画的时钟控制

    /**
     * 烟花动画循环函数。
     */
    function animate() {
        requestAnimationFrame(animate); // 下一帧动画的请求
        const deltaTime = clock.getDelta(); // 获取自上一帧以来的时间差

        // 更新所有烟花的状态，并移除已经结束的烟花
        fireworks.forEach((fw, index) => {
            fw.update(deltaTime);
            if (fw.life <= 0) {
                demo.scene.remove(fw.mesh); // 从场景中移除烟花
                fireworks.splice(index, 1); // 从数组中移除已结束的烟花对象
            }
        });

        // 随机决定是否发射新的烟花
        if (Math.random() < 0.01) { // 每100帧发射一次烟花的概率
            createFirework();
        }
    }

    animate(); // 启动动画循环
}



function addStars(demo, count) {
    // 加载星星纹理
    const textureLoader = new THREE.TextureLoader();
    const starTexture = textureLoader.load('/src/image/textures/star_texture.png'); // 请替换为你的星星纹理路径

    // 创建星星材质
    const starMaterial = new THREE.PointsMaterial({
        map: starTexture,
        size: 0.1, // 根据需要调整星星大小
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending, // 使用加性混合让星星更亮
    });
    for (let i = 0; i < count; i++) {
        const geometry = new THREE.SphereGeometry(0.01, 32, 32); // 小球几何体作为星星
        const star = new THREE.Points(geometry, starMaterial);

        // 随机分布星星的位置
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000)); // 调整范围以适应你的场景大小
        star.position.set(x, y, z);

        demo.scene.add(star);
    }

}



// 示例用法
const demo = new ThreeDemo();
demo.init({
    ...demo.config,
    // isSetUpInteractions: false,
    // isAddAxesHelper: false,
    // isAddGridHelper: false,
    // isAddCameraHelper: false,
    // isSetUpGUI: false
})
// renderCube(demo,new THREE.MeshBasicMaterial({
//     color: 0xfddff2
// }), new THREE.Vector3(0, 0, 0));
// renderLine(demo, [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)]);
// renderBall(demo);
// renderCubeWithSingleTexture(demo, '/src/image/textures/1.png', new THREE.Vector3(6, 0, 0));
await renderCubeWithMultipleTextures(demo, '/src/image/textures/', 6, new THREE.Vector3(0, 6, 0));
loadGltfModel(demo)
addFireWork(demo)
// 添加一定数量的星星
addStars(demo, 1000); // 数量根据实际情况调整