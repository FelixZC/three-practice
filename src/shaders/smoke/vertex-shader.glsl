// Vertex Shader 示例代码
attribute vec3 aPosition; // 顶点位置
attribute vec2 aTexCoord; // 纹理坐标

uniform mat4 uModelViewMatrix; // 模型视图矩阵
uniform mat4 uProjectionMatrix; // 投影矩阵

varying vec2 vUv; // 传递给片段着色器的纹理坐标

void main() {
    // 将顶点位置从模型空间转换到裁剪空间
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
    
    // 将纹理坐标从顶点着色器传递给片段着色器
    vUv = aTexCoord;
}