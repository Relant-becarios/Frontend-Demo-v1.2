<template>
  <div class="stl-view-container">
    <div
      v-if="!fileLoaded"
      class="stl-dropzone"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="{ 'drag-active': isDragging }"
    >
      <div class="dropzone-content">
        <h2 class="drop-title">VISOR STL INDUSTRIAL</h2>
        <p class="drop-desc">Arrastra y suelta tu archivo 3D aquí</p>
        <div class="drop-divider">o</div>
        <button class="btn-upload" @click="triggerInput">EXAMINAR ARCHIVO</button>
        <input
          type="file"
          ref="fileInput"
          accept=".stl"
          style="display: none"
          @change="handleFileUpload"
        />
      </div>
    </div>

    <div v-show="fileLoaded" class="canvas-wrapper">
      <div class="stl-toolbar">
        <button class="tool-btn" @click="resetCamera" title="Centrar Cámara">🏠 Centrar</button>
        <button class="tool-btn" @click="toggleAutoRotate" :class="{ active: autoRotate }">
          🔄 Auto-Rotar
        </button>
        <button class="tool-btn" @click="toggleWireframe" :class="{ active: wireframeMode }">
          🕸️ Malla
        </button>
        <div class="color-picker-wrapper tool-btn">
          🎨 Color
          <input type="color" v-model="meshColor" @input="updateColor" class="color-picker" />
        </div>
        <div class="separator"></div>
        <button class="tool-btn danger" @click="resetViewer">✕ Cerrar Modelo</button>
      </div>

      <div v-if="isProcessing" class="processing-overlay">
        <div class="spinner"></div>
        <p>Renderizando modelo de alta precisión...</p>
      </div>

      <div class="canvas-container" ref="canvasContainer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Estado de la UI
const fileInput = ref<HTMLInputElement | null>(null)
const canvasContainer = ref<HTMLElement | null>(null)
const fileLoaded = ref(false)
const isDragging = ref(false)
const isProcessing = ref(false)

// Estado del Visor
const wireframeMode = ref(false)
const autoRotate = ref(false)
const meshColor = ref('#aaaaaa')

// Variables de Three.js (usamos shallowRef para objetos complejos en Vue 3)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let currentMesh: THREE.Mesh | null = null
let animationId: number

// --- FUNCIONES DE CARGA DE ARCHIVO ---
const triggerInput = () => fileInput.value?.click()

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file && file.name.toLowerCase().endsWith('.stl')) {
    procesarArchivo(file)
  } else {
    alert('Por favor, sube un archivo con extensión .STL')
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) procesarArchivo(file)
}

const procesarArchivo = (file: File) => {
  isProcessing.value = true
  fileLoaded.value = true
  const reader = new FileReader()
  reader.readAsArrayBuffer(file)
  reader.onload = (e) => {
    if (e.target?.result) {
      // Pequeño timeout para permitir que Vue dibuje la pantalla de carga
      setTimeout(() => {
        initThreeJS(e.target!.result as ArrayBuffer)
        isProcessing.value = false
      }, 100)
    }
  }
}

// --- CONFIGURACIÓN DE THREE.JS ---
const initThreeJS = (data: ArrayBuffer) => {
  if (!canvasContainer.value) return
  canvasContainer.value.innerHTML = '' // Limpiar canvas previo si existe

  // 1. Escena
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#0f1215')
  scene.fog = new THREE.Fog('#0f1215', 200, 1000) // Añade profundidad

  // 2. Cámara
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / (window.innerHeight - 60), 0.1, 2000)
  camera.position.set(100, 100, 150)

  // 3. Renderizador
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(window.innerWidth, window.innerHeight - 60)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Optimización pantallas retina
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  canvasContainer.value.appendChild(renderer.domElement)

  // 4. Controles (Orbit)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxDistance = 500

  // 5. Suelo y Cuadrícula (Estilo Industrial)
  const gridHelper = new THREE.GridHelper(500, 50, '#30363d', '#161b22')
  gridHelper.position.y = -0.1
  scene.add(gridHelper)

  // 6. Luces Realistas
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 1)
  dirLight1.position.set(100, 200, 50)
  dirLight1.castShadow = true
  scene.add(dirLight1)

  const dirLight2 = new THREE.DirectionalLight(0xaaccff, 0.5) // Luz de relleno azulada
  dirLight2.position.set(-100, -50, -50)
  scene.add(dirLight2)

  // 7. Cargar Geometría
  try {
    const geometry = new STLLoader().parse(data)
    geometry.computeVertexNormals() // Asegurar sombras suaves

    // Material Industrial Realista
    const material = new THREE.MeshStandardMaterial({
      color: meshColor.value,
      metalness: 0.3,
      roughness: 0.4,
    })

    currentMesh = new THREE.Mesh(geometry, material)
    currentMesh.castShadow = true
    currentMesh.receiveShadow = true

    // Centrar automáticamente la pieza en el mundo
    geometry.computeBoundingBox()
    const boundingBox = geometry.boundingBox!
    const center = new THREE.Vector3()
    boundingBox.getCenter(center)
    currentMesh.position.set(-center.x, -boundingBox.min.y, -center.z) // Apoyar sobre la base y centrar

    scene.add(currentMesh)

    // Ajustar cámara al tamaño de la pieza
    const size = new THREE.Vector3()
    boundingBox.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    camera.position.set(maxDim * 1.5, maxDim * 1.5, maxDim * 1.5)
    controls.target.set(0, size.y / 2, 0)
    controls.update()
  } catch (error) {
    console.error('Error procesando STL:', error)
    alert('El archivo STL parece estar dañado o no es válido.')
    resetViewer()
    return
  }

  // Evento Resize de Ventana
  window.addEventListener('resize', onWindowResize)

  // 8. Bucle de Animación
  const animate = () => {
    animationId = requestAnimationFrame(animate)

    if (autoRotate.value && controls) {
      controls.autoRotate = true
      controls.autoRotateSpeed = 2.0
    } else if (controls) {
      controls.autoRotate = false
    }

    if (controls) controls.update()
    if (renderer && scene && camera) renderer.render(scene, camera)
  }
  animate()
}

// --- HERRAMIENTAS DEL TOOLBAR ---
const toggleWireframe = () => {
  wireframeMode.value = !wireframeMode.value
  if (currentMesh && currentMesh.material) {
    ;(currentMesh.material as THREE.MeshStandardMaterial).wireframe = wireframeMode.value
  }
}

const toggleAutoRotate = () => {
  autoRotate.value = !autoRotate.value
}

const updateColor = () => {
  if (currentMesh && currentMesh.material) {
    ;(currentMesh.material as THREE.MeshStandardMaterial).color.set(meshColor.value)
  }
}

const resetCamera = () => {
  if (currentMesh && controls && camera) {
    const box = new THREE.Box3().setFromObject(currentMesh)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)

    // Animación suave hacia el centro usando Tween.js sería ideal, pero directo funciona bien:
    camera.position.set(maxDim * 1.5, maxDim * 1.5, maxDim * 1.5)
    controls.target.set(0, size.y / 2, 0)
    controls.update()
  }
}

// --- LIMPIEZA Y MEMORIA ---
const onWindowResize = () => {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / (window.innerHeight - 60)
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight - 60)
}

const resetViewer = () => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onWindowResize)

  // Limpiar memoria de la GPU (¡Muy importante en 3D!)
  if (currentMesh) {
    scene.remove(currentMesh)
    currentMesh.geometry.dispose()
    ;(currentMesh.material as THREE.Material).dispose()
    currentMesh = null
  }
  if (renderer) renderer.dispose()

  fileLoaded.value = false
  wireframeMode.value = false
  autoRotate.value = false
  if (fileInput.value) fileInput.value.value = ''
}

onBeforeUnmount(() => {
  resetViewer()
})
</script>

<style scoped>
.stl-view-container {
  width: 100%;
  height: calc(100vh - 60px); /* Resta el alto aprox del navbar */
  background: #0f1215;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* --- ESTILOS DEL DROPZONE --- */
.stl-dropzone {
  width: 80%;
  max-width: 800px;
  height: 60%;
  border: 3px dashed #30363d;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #161b22;
  border-radius: 20px;
  transition: all 0.3s ease;
}
.stl-dropzone.drag-active {
  border-color: #ff0000;
  background: rgba(255, 0, 0, 0.05);
  transform: scale(1.02);
}
.dropzone-content {
  text-align: center;
}
.drop-title {
  color: #ff0000;
  letter-spacing: 2px;
  margin-bottom: 10px;
  font-weight: 900;
}
.drop-desc {
  color: #8b949e;
  font-size: 16px;
  margin-bottom: 20px;
}
.drop-divider {
  color: #30363d;
  margin: 20px 0;
  font-weight: bold;
}
.btn-upload {
  padding: 15px 40px;
  background: #ff0000;
  border: none;
  color: white;
  border-radius: 30px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: 0.3s;
  letter-spacing: 1px;
}
.btn-upload:hover {
  background: #cc0000;
  box-shadow: 0 5px 15px rgba(255, 0, 0, 0.3);
}

/* --- ESTILOS DEL VISOR Y TOOLBAR --- */
.canvas-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
.canvas-container {
  width: 100%;
  height: 100%;
  outline: none;
}

.stl-toolbar {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(22, 27, 34, 0.85);
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  border-radius: 30px;
  border: 1px solid #30363d;
  display: flex;
  gap: 15px;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.tool-btn {
  background: transparent;
  color: #fff;
  border: 1px solid transparent;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}
.tool-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
.tool-btn.active {
  background: #ff0000;
  color: white;
  border-color: #ff0000;
}
.tool-btn.danger {
  color: #ff4444;
}
.tool-btn.danger:hover {
  background: rgba(255, 68, 68, 0.1);
}

.separator {
  width: 1px;
  height: 20px;
  background: #30363d;
}

.color-picker-wrapper {
  position: relative;
  overflow: hidden;
}
.color-picker {
  opacity: 0;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* --- PANTALLA DE CARGA --- */
.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 18, 21, 0.9);
  z-index: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #30363d;
  border-top: 4px solid #ff0000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
