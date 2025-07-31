import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// SCENE
const scene = new THREE.Scene();

// CAMERA
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.update();

// RESIZE HAMDLER
export function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize);

// INIT CAMERA
camera.position.z = 8;
camera.position.x = 0;
camera.position.y = 0;
camera.lookAt(0, 0, 0);
// INIT HEMISPHERE LIGHT
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// SCENE
scene.background = new THREE.Color(0x2f46);

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
  format: THREE.RGBFormat,
  generateMipmaps: true,
  minFilter: THREE.LinearMipmapLinearFilter,
  encoding: THREE.sRGBEncoding,
});

const cubeCamera = new THREE.CubeCamera(1, 10000, cubeRenderTarget);

// GLTFLoader y modelo tshirt.gltf
const gltfLoader = new GLTFLoader();
// Cargar textura con transparencia para superponer sobre el color base

let tshirtModel = null;
gltfLoader.load("/tshirt.glb", (gltf) => {
  tshirtModel = gltf.scene;
  const overlayTexture = new THREE.TextureLoader().load("/tshirt2.png");
  overlayTexture.flipY = false; // Corregir orientación para GLTF
  overlayTexture.flipX = true; // Corregir orientación para GLTF
  tshirtModel.traverse((child) => {
    if (child.isMesh) {
      // Material base (color)
      const baseMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,

        side: 2,
      });
      // Material overlay (solo textura, transparente)
      const overlayMaterial = new THREE.MeshBasicMaterial({
        map: overlayTexture,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
      });
      // Mesh base
      const baseMesh = new THREE.Mesh(child.geometry.clone(), baseMaterial);
      baseMesh.position.copy(child.position);
      baseMesh.rotation.copy(child.rotation);
      baseMesh.scale.copy(child.scale);
      // Mesh overlay
      const overlayMesh = new THREE.Mesh(
        child.geometry.clone(),
        overlayMaterial
      );
      overlayMesh.position.copy(child.position);
      overlayMesh.rotation.copy(child.rotation);
      overlayMesh.scale.copy(child.scale);
      // Agrupar ambos
      const group = new THREE.Group();
      group.add(baseMesh);
      group.add(overlayMesh);
      // Reemplazar el mesh original por el grupo
      child.parent.add(group);
      child.visible = false;
    }
  });
  scene.add(tshirtModel);

  // --- Controles para mover la textura ---
  // Crear controles si no existen
  if (!document.getElementById("textureOffsetX")) {
    const controlsDiv = document.createElement("div");
    controlsDiv.style.position = "fixed";
    controlsDiv.style.top = "10px";
    controlsDiv.style.left = "10px";
    controlsDiv.style.background = "rgba(255,255,255,0.9)";
    controlsDiv.style.padding = "10px";
    controlsDiv.style.borderRadius = "8px";
    controlsDiv.style.zIndex = 3000;
    controlsDiv.style.fontFamily = "sans-serif";
    controlsDiv.innerHTML = `
      <label for="textureOffsetX">Mover textura X:</label>
      <input type="range" id="textureOffsetX" min="-1" max="1" step="0.01" value="0" style="width:120px;">
      <span id="textureOffsetXValue">0</span><br>
      <label for="textureOffsetY">Mover textura Y:</label>
      <input type="range" id="textureOffsetY" min="-1" max="1" step="0.01" value="0" style="width:120px;">
      <span id="textureOffsetYValue">0</span>
    `;
    document.body.appendChild(controlsDiv);

    // Listeners para actualizar offset
    const offsetX = document.getElementById("textureOffsetX");
    const offsetY = document.getElementById("textureOffsetY");
    const offsetXValue = document.getElementById("textureOffsetXValue");
    const offsetYValue = document.getElementById("textureOffsetYValue");
    offsetX.addEventListener("input", function () {
      if (overlayTexture) {
        overlayTexture.offset.x = parseFloat(this.value);
        overlayTexture.needsUpdate = true;
        offsetXValue.textContent = this.value;
      }
    });
    offsetY.addEventListener("input", function () {
      if (overlayTexture) {
        overlayTexture.offset.y = parseFloat(this.value);
        overlayTexture.needsUpdate = true;
        offsetYValue.textContent = this.value;
      }
    });
  }
});

// DIRECTIONAL LIGHT
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.x += 20;
directionalLight.position.y += 20;
directionalLight.position.z += 20;
scene.add(directionalLight);

// scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));

// ANIMATE
function animate() {
  const time = Date.now() * 0.0005;
  directionalLight.position.x = Math.sin(time * 0.7) * 20;
  directionalLight.position.z = Math.abs(Math.cos(time * 0.7)) * 20;

  controls.update();

  cubeCamera.update(renderer, scene);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
document.body.appendChild(renderer.domElement);
animate();
