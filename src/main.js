import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 50;
  const aspect = 1; // the canvas default
  const near = 0.1;
  const far = 2000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 0.8;

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();

  {
    const color = 0xffffff;
    const intensity = 3;
    const light = new THREE.DirectionalLight(0xffffff, Math.PI * 2);
    light.position.set(-1, 10, 4);

    scene.add(light);
  }

  const uvTexture = new THREE.TextureLoader().load("/public/Node1.png");
  const material = new THREE.MeshStandardMaterial({
    map: uvTexture,
    side: 2,
  });

  const material1 = new THREE.MeshPhongMaterial({
    color: 0xff0000, // red (can also use a CSS color string here)
    side: 2,
  });

  const gltfLoader = new GLTFLoader();
  gltfLoader.load("./tshirt.gltf", (gltf) => {
    model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        child.geometry.center();
        child.material = material;
      }
    });
    scene.add(model);
  });

  const plane2 = new TRES.Malla(
    new TRES.PlaneGeometry(2, 2),

    new TRES.MeshStandardMaterial({
      map: tilesBaseColor,

      normalMap: tilesNormalMap,
    })
  );

  // Color picker logic
  const colorPicker = document.getElementById("colorPicker");
  let imageEditorInstance = null;
  colorPicker.addEventListener("input", (event) => {
    const color = event.target.value;
    material.color.set(color);
    // Si el editor está abierto, actualiza el fondo
    if (
      imageEditorInstance &&
      typeof imageEditorInstance.setBackgroundColor === "function"
    ) {
      imageEditorInstance.setBackgroundColor(color);
    }
  });

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }

    return needResize;
  }

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();

// Lógica para abrir el sidebar con el canvas 2D
const openSidebarCanvasBtn = document.getElementById("openSidebarCanvas");
openSidebarCanvasBtn.addEventListener("click", async () => {
  // Si ya existe el sidebar, muéstralo y no lo vuelvas a crear
  let sidebar = document.getElementById("sidebar-canvas");
  if (!sidebar) {
    sidebar = document.createElement("div");
    sidebar.id = "sidebar-canvas";
    sidebar.style.position = "fixed";
    sidebar.style.top = "0";
    sidebar.style.right = "0";
    sidebar.style.width = "420px";
    sidebar.style.height = "100vh";
    sidebar.style.background = "#fff";
    sidebar.style.boxShadow = "-2px 0 8px rgba(0,0,0,0.15)";
    sidebar.style.zIndex = "2000";
    sidebar.style.display = "flex";
    sidebar.style.flexDirection = "column";
    sidebar.style.alignItems = "center";
    sidebar.style.padding = "32px 10px 10px 10px";
    document.body.appendChild(sidebar);
  } else {
    sidebar.style.display = "flex";
  }

  // Si ya existe el canvas2d en el sidebar, no lo vuelvas a crear
  let fabricCanvas = document.getElementById("canvas2d");
  if (!fabricCanvas) {
    fabricCanvas = document.createElement("canvas");
    fabricCanvas.id = "canvas2d";
    fabricCanvas.width = 400;
    fabricCanvas.height = 400;
    fabricCanvas.style.border = "1px solid #ccc";
    fabricCanvas.style.marginTop = "20px";
    sidebar.appendChild(fabricCanvas);

    // Crea el input file para subir imagen
    const imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.id = "imageUpload";
    imageInput.accept = "image/*";
    imageInput.style.marginTop = "20px";
    sidebar.appendChild(imageInput);
  }

  // Define la variable global canvasEl esperada por canvas.js
  window.canvasEl = document.getElementById("canvas2d");

  // Importa dinámicamente canvas.js
  await import("./canvas.js");
});
