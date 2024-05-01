import * as THREE from 'three';
/**
 * 设置鼠标拖动旋转立方体的事件监听器
 */
export function setupMouseControls(object3D, sensitivity = 0.005) {
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
  
    const onDocumentMouseDown = (event) => {
      event.preventDefault();
      isDragging = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    };
  
    const onDocumentMouseMove = (event) => {
      if (isDragging) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;
  
        const deltaX = (mouseX - lastMouseX) * sensitivity;
        const deltaY = (mouseY - lastMouseY) * sensitivity;
  
        object3D.rotation.x += deltaY;
        object3D.rotation.y += deltaX;
  
        lastMouseX = mouseX;
        lastMouseY = mouseY;
      }
    };
  
    const onDocumentMouseUp = () => {
      isDragging = false;
    };
  
    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mouseup', onDocumentMouseUp);
  }
  
/**
 * 设置three立方体自旋转的事件监听器
 */
export function setupAutoRotate(object3D, axis = 'Y', speed = 0.001) {
  let lastTime = 0;

  // 定义旋转轴向量
  let rotationAxis;
  switch(axis.toUpperCase()) {
      case 'X':
          rotationAxis = new THREE.Vector3(1, 0, 0);
          break;
      case 'Y':
          rotationAxis = new THREE.Vector3(0, 1, 0);
          break;
      case 'Z':
          rotationAxis = new THREE.Vector3(0, 0, 1);
          break;
      default:
          console.warn('Invalid axis specified. Defaulting to Y-axis.');
          rotationAxis = new THREE.Vector3(0, 1, 0);
  }

  const quaternion = new THREE.Quaternion();

  const onAnimationFrame = (time) => {
      const deltaTime = time - lastTime;
      // 使用四元数旋转，以避免万向节锁问题
      quaternion.setFromAxisAngle(rotationAxis, speed * deltaTime);
      object3D.quaternion.multiply(quaternion);

      lastTime = time;
      requestAnimationFrame(onAnimationFrame);
  };

  requestAnimationFrame(onAnimationFrame);
}