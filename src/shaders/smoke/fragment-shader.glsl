// Fragment Shader 示例代码
precision mediump float;

uniform vec3 uColor; // 烟雾颜色
uniform float uDensity; // 烟雾密度

varying vec2 vUv; // 从顶点着色器传递过来的纹理坐标

void main() {
    // 基于纹理坐标(uv)产生简单的烟雾变化效果
    float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
    noise = abs(smoothstep(0.0, 0.2, noise)); // 使用smoothstep平滑过渡

    // 根据烟雾密度调整效果强度
    vec3 color = mix(vec3(0.0), uColor, uDensity * noise);

    gl_FragColor = vec4(color, uDensity); // 设置输出颜色，并使用密度控制透明度
}