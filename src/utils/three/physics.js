import * as CANNON from 'cannon-es';
import * as THREE from 'three';
/**
 * 直接初始化并配置一个默认的Cannon.js物理世界。
 * @returns {CANNON.World} 创建的物理世界实例，已含默认地面。
 */
export function createDefaultPhysicsWorld() {
    // 创建Cannon物理世界，使用默认重力向量
    const cannonWorld = new CANNON.World();
    cannonWorld.gravity.set(0, -9.82, 0);
    cannonWorld.broadphase = new CANNON.NaiveBroadphase();
    cannonWorld.solver.iterations = 10; // 可调整以改变模拟精确度
    cannonWorld.allowSleep = true;
    return cannonWorld;
}

/**
 * 创建一个地面对象，包括地面的物理模拟和渲染。
 * 
 * @param {Object} options 配置项对象，可包含以下属性：
 *   - size: 地面的尺寸，默认为25。
 *   - color: 地面的颜色，默认为0x808080（灰色）。
 *   - yOffset: 地面在Y轴上的偏移，默认为0。
 *   - meshMaterialOptions: 用于创建地面网格材质的选项对象，默认为空对象。
 *   - physicsMaterialOptions: 用于创建地面物理材质的选项对象，默认为空。
 * @returns {Object} 包含以下属性的对象：
 *   - groundBody: CANNON.js中的地面物理体对象。
 *   - groundMesh: THREE.js中的地面渲染网格对象。
 *   - groundPhysMat: 地面的物理材质对象。
 */
export function createGround({
    size = 25,
    color = 0x808080,
    yOffset = 0,
    meshMaterialOptions = {},
    physicsMaterialOptions,
} = {}) {
    // 创建一个立方体几何体作为地面的基础形状
    const groundGeo = new THREE.BoxGeometry(size, 0.1, size);

    // 使用提供的颜色和额外的材质选项创建地面的渲染材质
    const groundMaterial = new THREE.MeshStandardMaterial({
        color,
        ...meshMaterialOptions,
    });

    // 创建用于物理模拟的地面材质
    const groundPhysMat = new CANNON.Material(physicsMaterialOptions);

    // 设置地面的物理属性，如质量、材质，并定义其形状
    const groundBody = new CANNON.Body({
        mass: 0, // 地面无质量
        material: groundPhysMat
    });
    groundBody.addShape(new CANNON.Box(new CANNON.Vec3(size / 2, 0.1 / 2, size / 2))); // 设置地面的物理形状
    groundBody.position.set(0, yOffset, 0); // 将地面位置设置为配置的Y偏移值

    // 创建地面的Three.js网格对象，并设置其接收阴影的属性
    const groundMesh = new THREE.Mesh(groundGeo, groundMaterial);
    groundMesh.receiveShadow = true;
    groundMesh.position.copy(groundBody.position); // 将网格位置与物理体位置同步

    return {
        groundBody,
        groundMesh,
        groundPhysMat
    };
}

/**
 * 创建一个带有物理模拟的立方体。
 * 
 * @param {Object} options 配置对象，包含立方体的各种属性。
 * @param {number} options.size 立方体的尺寸，默认为1。
 * @param {THREE.Vector3} options.position 立方体的初始位置，默认为(5, 5, 5)。
 * @param {number} options.mass 立方体的质量，默认为1。
 * @param {number|string} options.color 立方体的颜色，默认为红色（0xff0000）。
 * @param {Object} options.meshMaterialOptions 立方体网格材质的额外选项，默认为空对象。
 * @param {Object} options.physicsMaterialOptions 立方体物理材质的额外选项，默认为空。
 * @returns {Object} 返回一个包含立方体网格（cubeMesh）、立方体物理体（cubeBody）和立方体物理材质（cubePhysMat）的对象。
 */
export function createCube({
    size = 1,
    position = new THREE.Vector3(5, 5, 5),
    mass = 1,
    color = 0xff0000,
    meshMaterialOptions = {},
    physicsMaterialOptions,
} = {}) {
    // 创建立方体几何体
    const cubeGeo = new THREE.BoxGeometry(size, size, size);

    // 创建立方体材质
    const cubeMaterial = new THREE.MeshStandardMaterial({
        color,
        ...meshMaterialOptions
    });

    // 创建物理材质
    const cubePhysMat = new CANNON.Material(physicsMaterialOptions);

    // 创建立方体物理体
    const cubeBody = new CANNON.Body({
        mass,
        material: cubePhysMat
    });
    cubeBody.addShape(new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)));
    cubeBody.position.copy(position);

    // 创建立方体的Three.js网格
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
    cubeMesh.castShadow = true; // 立方体投射阴影
    cubeMesh.position.copy(cubeBody.position); // 初始位置设置

    /**
     * 动画函数，用于每帧更新立方体的网格位置和旋转，以匹配物理体的状态。
     */
    function animate() {
        requestAnimationFrame(() => {
            cubeMesh.position.copy(cubeBody.position); // 更新位置
            cubeMesh.quaternion.copy(cubeBody.quaternion); // 更新旋转
            animate();
        });
    }
    if (mass != 0) {
        animate(); // 如果质量不为0，则开始动画
    }
    return {
        cubeMesh,
        cubeBody,
        cubePhysMat
    };
}
/**
 * 创建一个带有物理模拟的球体。
 * 
 * @param {Object} 参数对象，包含球体的各种属性。
 * @param {number} radius 球体的半径，默认为0.5。
 * @param {THREE.Vector3} position 球体的初始位置，默认为新的THREE.Vector3()。
 * @param {THREE.Vector3} velocity 球体的初始速度，默认为新的THREE.Vector3()。
 * @param {THREE.Vector3} angularVelocity 球体的初始角速度，默认为新的THREE.Vector3()。
 * @param {number} color 球体的颜色，默认为绿色（0x00ff00）。
 * @param {number} mass 球体的质量，默认为1。
 * @param {Object} meshMaterialOptions 球体网格材质的选项，默认为空对象。
 * @param {Object} physicsMaterialOptions 球体物理材质的选项，默认为空。
 * @returns {Object} 返回一个包含球体物理体、网格和物理材质的对象。
 */
export function createSphere({
    radius = 0.5,
    position = new THREE.Vector3(),
    velocity = new THREE.Vector3(),
    angularVelocity = new THREE.Vector3(),
    color = 0x00ff00,
    mass = 1,
    meshMaterialOptions = {},
    physicsMaterialOptions,
} = {}) {
    // 创建球体几何体
    const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);

    // 创建球体材质
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color,
        ...meshMaterialOptions
    });

    // 创建球体物理材质
    const spherePhysMat = new CANNON.Material(physicsMaterialOptions);

    // 创建球体物理体
    const sphereBody = new CANNON.Body({
        mass,
        material: spherePhysMat
    });
    sphereBody.addShape(new CANNON.Sphere(radius));
    sphereBody.position.copy(position);
    sphereBody.velocity.copy(velocity);
    sphereBody.angularVelocity.copy(angularVelocity);

    // 创建球体的Three.js网格
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMaterial);
    sphereMesh.castShadow = true; // 球体投射阴影
    sphereMesh.position.copy(sphereBody.position); // 初始位置设置

    /**
     * 动画函数，用于每帧更新球体的网格位置和旋转，以匹配其物理体的状态。
     */
    function animate() {
        requestAnimationFrame(() => {
            sphereMesh.position.copy(sphereBody.position);
            sphereMesh.quaternion.copy(sphereBody.quaternion);
            animate();
        });
    }
    if (mass != 0) {
        animate(); // 如果球体有质量，则开始动画更新
    }
    return {
        sphereBody,
        sphereMesh,
        spherePhysMat
    };
}

/**
 * 配置两种材质之间的接触属性。
 * 
 * @param {CANNON.World} world - Cannon.js物理世界的实例。
 * @param {CANNON.Material} materialA - 第一种物理材质。
 * @param {CANNON.Material} materialB - 第二种物理材质。
 * @param {Object} [options] - 配置选项，包含摩擦、恢复系数等。
 * @param {number} [options.friction=0.3] - 接触摩擦系数，默认为0.3。
 * @param {number} [options.restitution=0.3] - 接触恢复系数（弹性），默认为0.3。
 */
export function configureContactMaterials(world, materialA, materialB, options = {}) {
    const {
        friction = 0.3,
            restitution = 0.3,
    } = options;

    const contactMaterial = new CANNON.ContactMaterial(materialA, materialB, {
        friction,
        restitution,
        ...options
    });

    world.addContactMaterial(contactMaterial);
}

/**
 * 为给定的模型创建物理属性和物理体，使其能够在物理模拟中运行。
 * @param {Object} model - 用于物理模拟的三维模型。
 * @param {Object} materialOptions - 物理材质的选项。
 * @param {number} [mass=1] - 物理体的质量，默认为1。
 * @returns {Object} 包含模型、物理体和物理材质的对象。
 */
export function addPhysicsForModel(model, materialOptions, mass = 1) {
    // 计算模型的包围盒并创建相应的物理形状
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);

    // 创建物理材质和物理体
    const gltfBodyMaterial = new CANNON.Material(materialOptions);
    const gltfBody = new CANNON.Body({
        mass,
        material: gltfBodyMaterial,
        position: new CANNON.Vec3(...model.position.toArray()),
        quaternion: new CANNON.Quaternion(...model.quaternion.toArray())
    });
    gltfBody.addShape(new CANNON.Box(halfExtents));
    gltfBody.addEventListener("collide", (event) => {
        console.log("Collision occurred!");
    });

    // 启动动画循环以保持模型和物理世界的状态同步
    function animate() {
        requestAnimationFrame(animate);
        model.position.copy(gltfBody.position);
        model.quaternion.copy(gltfBody.quaternion);
    }
    animate();

    return {
        model,
        gltfBody,
        gltfBodyMaterial
    };
}