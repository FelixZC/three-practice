import * as THREE from 'three';
import vertexShaderSource from '../../shaders/smoke/vertex-shader.glsl';
import fragmentShaderSource from '../../shaders/smoke/fragment-shader.glsl';

class Firework {
    constructor(demo, position) {
        this.position = position.clone();
        this.particles = [];
        this.isExploded = false;

        // 爆炸粒子参数
        const particleCount = 300;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * 2;
            const y = Math.random() * 2;
            const z = (Math.random() - 0.5) * 2;
            positions.set([x, y, z], i * 3);

            const r = Math.random() * 0.5 + 0.5;
            const g = Math.random() * 0.5 + 0.5;
            const b = Math.random();
            colors.set([r, g, b], i * 3);
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        this.material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
        });

        this.mesh = new THREE.Points(geometry, this.material);
        this.mesh.position.copy(this.position);
        demo.scene.add(this.mesh);
    }

    update(deltaTime) {
        if (!this.isExploded) {
            // 简单上升动画
            this.position.y += 0.9 * deltaTime; // 控制上升速度
            this.mesh.position.copy(this.position);

            // 碰撞检测，此处简化处理，实际可根据需要设定爆炸条件
            if (this.position.y > 100) {
                this.explode();
            }
        } else {
            // 爆炸后的粒子动画，这里简化处理
            this.material.sizeAttenuation = true; // 粒子大小随距离衰减
            for (let p of this.particles) {
                p.life -= deltaTime;
                if (p.life <= 0) {
                    this.mesh.geometry.attributes.position.array[p.index * 3] = p.velocity.x * p.life + p.startPos.x;
                    this.mesh.geometry.attributes.position.array[p.index * 3 + 1] = p.velocity.y * p.life + p.startPos.y;
                    this.mesh.geometry.attributes.position.array[p.index * 3 + 2] = p.velocity.z * p.life + p.startPos.z;
                    this.mesh.geometry.attributes.color.array[p.index * 3 + 2] = p.life; // 简化处理，颜色随生命减少而变化
                    this.mesh.geometry.attributes.position.needsUpdate = true;
                    this.mesh.geometry.attributes.color.needsUpdate = true;
                }
            }
        }
    }

    explode() {
        this.isExploded = true;

        // 真实情况这里应生成新的粒子数据，这里简化处理直接使用现有粒子
        for (let i = 0; i < this.mesh.geometry.attributes.position.count; i++) {
            const life = Math.random() * 2; // 粒子生命期
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 3,
                (Math.random() * 2 - 1) * 3,
                (Math.random() - 0.5) * 3
            );
            this.particles.push({
                index: i,
                startPos: this.mesh.geometry.attributes.position.array.slice(i * 3, i * 3 + 3),
                velocity,
                life
            });
        }
    }
}
/**
 * 向场景中添加烟花效果。
 * @param {Object} demo - 包含场景(scene)等THREE.js相关对象的示例实例，用于添加和管理烟花对象。
 */
export function addFireWork(demo) {
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

/**
 * 在给定的场景中添加指定数量的星星。
 * @param {Object} demo 包含场景(scene)等Three.js相关对象和数据的示例对象。
 * @param {number} count 要添加的星星数量。
 */
export function addStars(demo, count) {
    // 加载星星纹理
    const textureLoader = new THREE.TextureLoader();
    const starTexture = textureLoader.load('src/image/textures/smoke_texture.png'); // 替换为实际星星纹理的路径

    // 创建星星材质
    const starMaterial = new THREE.PointsMaterial({
        map: starTexture,
        size: 0.1, // 可根据需要调整星星的大小
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending, // 使用加性混合让星星更亮
    });

    // 循环创建指定数量的星星并添加到场景中
    for (let i = 0; i < count; i++) {
        const geometry = new THREE.SphereGeometry(0.01, 32, 32); // 使用小球几何体作为星星的形状
        const star = new THREE.Points(geometry, starMaterial);

        // 随机定位星星
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000)); // 调整范围以适应你的场景大小
        star.position.set(x, y, z);

        demo.scene.add(star);
    }
}

/**
 * 为指定的Three.js演示demo添加烟雾效果。
 * 不知道为什么就是无法引入顶点着色器和片段着色器
 * @param {Object} demo 包含场景(scene)等Three.js演示相关对象的容器。
 */
export function addSmoke(demo) {
    // 加载烟雾纹理
    const smokeTextureLoader = new THREE.TextureLoader();
    smokeTextureLoader.load('src/image/textures/smoke_texture.png', (texture) => {
        texture.minFilter = THREE.LinearFilter;

        // 创建烟雾材质
        const smokeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: {
                    value: 0
                },
                color: {
                    value: new THREE.Color(0x888888)
                },
                opacity: {
                    value: 0.6
                },
                texture: {
                    value: texture
                }
            },
            vertexShader: vertexShaderSource,
            fragmentShader: fragmentShaderSource,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true
        });

        // 创建粒子几何体和粒子系统
        const numParticles = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(numParticles * 3);
        const colors = new Float32Array(numParticles * 3);

        // 随机生成粒子位置和颜色
        for (let i = 0; i < numParticles; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 200;
            const z = (Math.random() - 0.5) * 200;
            positions.set([x, y, z], i * 3);
            colors.set([x / 100 + 0.9, y / 100 + 0.9, z / 100 + 0.9], i * 3);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // 创建并添加烟雾粒子系统到场景
        const smokeParticles = new THREE.Points(geometry, smokeMaterial);
        demo.scene.add(smokeParticles);

        // 动画烟雾粒子
        function animate() {
            requestAnimationFrame(animate);
            smokeMaterial.uniforms.time.value += 0.01;
        }
        animate();
    });
}