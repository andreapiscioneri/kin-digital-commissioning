<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface Room {
  x: number
  y: number
  w: number
  h: number
  dot: { cx: number; cy: number } | null
}

const props = defineProps<{
  rooms: Room[]
  lampStates: boolean[]
}>()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const canvasHost = ref<HTMLDivElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let resizeObserver: ResizeObserver | null = null
let fallbackResizeTimeout = 0
let frameId = 0

const WALL_HEIGHT = 15
const WALL_THICKNESS = 1.4
const RUG_COLOR = 0xc7ccce
const WOOD_COLOR = 0xb0855a
const FABRIC_COLOR = 0xaab0b4
const ACCENT_COLOR = 0xe0521c

const PALETTE = {
  light: {
    wall: 0xf7f5f0,
    floor: 0xd9bd91,
    floorLit: 0xf0d19f,
    slab: 0xe9e4da,
    ambientSky: 0xffffff,
    ambientGround: 0x9aa6ad,
    ambientIntensity: 0.85,
    dirColor: 0xfff3e0,
    dirIntensity: 0.9
  },
  dark: {
    wall: 0x3d444d,
    floor: 0x7e6042,
    floorLit: 0xd9a35c,
    slab: 0x1b2025,
    ambientSky: 0x8fa0ad,
    ambientGround: 0x14181c,
    ambientIntensity: 0.55,
    dirColor: 0xffe9c7,
    dirIntensity: 0.55
  }
} as const

function currentPalette() {
  return isDark.value ? PALETTE.dark : PALETTE.light
}

type FurnitureKind = 'bed' | 'sofa' | 'kitchen' | 'desk' | 'dining' | 'lounge' | 'plant' | 'none'

const FURNITURE_PLAN: FurnitureKind[] = ['bed', 'kitchen', 'sofa', 'desk', 'lounge', 'plant', 'dining', 'sofa']

type RoomMesh = {
  floor: THREE.Mesh
  bulb: THREE.Mesh
  light: THREE.PointLight
}
let roomMeshes: (RoomMesh | null)[] = []
let allWallMats: THREE.MeshStandardMaterial[] = []
let slabMat: THREE.MeshStandardMaterial | null = null
let ambientLight: THREE.HemisphereLight | null = null
let dirLight: THREE.DirectionalLight | null = null

function wallShellGeometry(w: number, d: number, height: number, thickness: number) {
  const outer = new THREE.Shape()
  outer.moveTo(-w / 2, -d / 2)
  outer.lineTo(w / 2, -d / 2)
  outer.lineTo(w / 2, d / 2)
  outer.lineTo(-w / 2, d / 2)
  outer.closePath()

  const hole = new THREE.Path()
  const iw = w / 2 - thickness
  const id = d / 2 - thickness
  hole.moveTo(-iw, -id)
  hole.lineTo(iw, -id)
  hole.lineTo(iw, id)
  hole.lineTo(-iw, id)
  hole.closePath()
  outer.holes.push(hole)

  const geo = new THREE.ExtrudeGeometry(outer, { depth: height, bevelEnabled: false })
  geo.rotateX(-Math.PI / 2)
  return geo
}

function addBox(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  y: number,
  z: number,
  ry = 0
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: 0.8 }))
  mesh.position.set(x, y, z)
  mesh.rotation.y = ry
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function addCylinder(
  parent: THREE.Object3D,
  r: number,
  h: number,
  color: number,
  x: number,
  y: number,
  z: number
) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 14), new THREE.MeshStandardMaterial({ color, roughness: 0.85 }))
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function buildFurniture(group: THREE.Group, kind: FurnitureKind, rw: number, rd: number) {
  const half = { w: rw / 2 - WALL_THICKNESS - 2, d: rd / 2 - WALL_THICKNESS - 2 }

  if (kind === 'bed') {
    const bx = -half.w + 12
    const bz = -half.d + 14
    addBox(group, 22, 3, 28, WOOD_COLOR, bx, 1.5, bz)
    addBox(group, 22, 5, 26, 0xfaf7f2, bx, 4, bz)
    addBox(group, 22, 2.4, 6, 0xe8e3da, bx, 6.2, bz - 10)
    addBox(group, 9, 2, 6, FABRIC_COLOR, bx - 5, 6.5, bz - 8)
    addBox(group, 9, 2, 6, FABRIC_COLOR, bx + 5, 6.5, bz - 8)
    addCylinder(group, 5, 4, 0xe9e2d3, half.w - 10, 2, -half.d + 10)
  } else if (kind === 'kitchen') {
    addBox(group, rw - 8, 10, 6, 0xf2f0eb, -2, 5, -half.d + 5)
    addBox(group, 10, 1, 4, 0x2e2e2e, half.w - 8, 10.8, -half.d + 5)
    addBox(group, rw * 0.5, 10, 12, 0xf2f0eb, -half.w + rw * 0.28, 5, half.d - 10, 0)
  } else if (kind === 'sofa') {
    const sx = -half.w + 14
    const sz = half.d - 12
    addBox(group, 30, 7, 12, FABRIC_COLOR, sx, 3.5, sz)
    addBox(group, 30, 12, 3, FABRIC_COLOR, sx, 6, sz + 5.2)
    addBox(group, 4, 12, 12, FABRIC_COLOR, sx - 15, 6, sz)
    addBox(group, 4, 12, 12, FABRIC_COLOR, sx + 15, 6, sz)
    addBox(group, 5, 2, 5, ACCENT_COLOR, sx - 8, 8, sz - 2)
    addBox(group, 16, 3, 8, 0x2b2b2b, sx + 20, 1.5, sz - 14)
    const rug = new THREE.Mesh(new THREE.CircleGeometry(16, 24), new THREE.MeshStandardMaterial({ color: RUG_COLOR }))
    rug.rotation.x = -Math.PI / 2
    rug.position.set(sx + 4, 0.15, sz - 16)
    rug.receiveShadow = true
    group.add(rug)
  } else if (kind === 'desk') {
    const dx = half.w - 12
    addBox(group, 20, 1.6, 10, WOOD_COLOR, dx, 6, -half.d + 8)
    addCylinder(group, 0.8, 6, 0x3a3a3a, dx - 9, 3, -half.d + 4)
    addCylinder(group, 0.8, 6, 0x3a3a3a, dx + 9, 3, -half.d + 4)
    addBox(group, 8, 8, 8, 0x3a3a3a, dx, 4, -half.d + 16)
  } else if (kind === 'dining') {
    addBox(group, 22, 1.4, 12, 0xf5f2ec, 0, 6, 0)
    for (const [cx, cz] of [
      [-13, -8],
      [13, -8],
      [-13, 8],
      [13, 8]
    ]) {
      addCylinder(group, 0.7, 6, 0x2f2f2f, cx as number, 3, cz as number)
      addBox(group, 6, 7, 6, 0xe7e1d3, cx as number, 3.5, cz as number)
    }
  } else if (kind === 'lounge') {
    addBox(group, 14, 6, 14, FABRIC_COLOR, -half.w + 12, 3, half.d - 12)
    addCylinder(group, 8, 1.2, 0x2f2f2f, half.w - 12, 0.7, half.d - 12)
  }

  if (kind !== 'plant') {
    addCylinder(group, 3.4, 1, 0xdedad0, half.w - 6, 0.5, half.d - 6)
    addBox(group, 4.6, 5, 4.6, 0x6b7a5c, half.w - 6, 3, half.d - 6)
  } else {
    addCylinder(group, 4, 6, 0xdedad0, 0, 3, 0)
    addBox(group, 10, 10, 10, 0x5c7a5a, 0, 10, 0)
  }
}

const BASE_FOV = 38

// Vertical FOV is only tuned to look right for aspect >= 1 (landscape/square).
// On a narrow portrait container (e.g. the expanded phone-frame modal) a fixed
// vertical FOV crops the horizontal view, making the room look zoomed in — so
// we widen the vertical FOV to keep the horizontal framing roughly constant.
function fovForAspect(aspect: number) {
  if (aspect >= 1) return BASE_FOV
  const halfBase = THREE.MathUtils.degToRad(BASE_FOV / 2)
  return THREE.MathUtils.radToDeg(Math.atan(Math.tan(halfBase) / aspect)) * 2
}

function buildScene() {
  if (!canvasHost.value) return

  scene = new THREE.Scene()
  scene.background = null

  const width = canvasHost.value.clientWidth
  const height = canvasHost.value.clientHeight

  camera = new THREE.PerspectiveCamera(fovForAspect(width / height), width / height, 1, 3000)
  camera.position.set(140, 230, 210)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  canvasHost.value.appendChild(renderer.domElement)

  const ambient = new THREE.HemisphereLight(0xffffff, 0x9aa6ad, 0.85)
  scene.add(ambient)
  ambientLight = ambient
  const dir = new THREE.DirectionalLight(0xfff3e0, 0.9)
  dir.position.set(160, 260, 140)
  dir.castShadow = true
  dir.shadow.mapSize.set(1024, 1024)
  dir.shadow.camera.left = -200
  dir.shadow.camera.right = 200
  dir.shadow.camera.top = 200
  dir.shadow.camera.bottom = -200
  scene.add(dir)
  dirLight = dir

  const bounds = props.rooms.reduce(
    (acc, r) => ({
      minX: Math.min(acc.minX, r.x),
      maxX: Math.max(acc.maxX, r.x + r.w),
      minY: Math.min(acc.minY, r.y),
      maxY: Math.max(acc.maxY, r.y + r.h)
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  )
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerZ = (bounds.minY + bounds.maxY) / 2

  const slabMaterial = new THREE.MeshStandardMaterial({ color: 0xe9e4da })
  slabMat = slabMaterial
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(bounds.maxX - bounds.minX + 6, 2, bounds.maxY - bounds.minY + 6),
    slabMaterial
  )
  slab.position.set(0, -1.2, 0)
  slab.receiveShadow = true
  scene.add(slab)

  allWallMats = []
  roomMeshes = props.rooms.map((room, i) => {
    const rw = room.w - 2
    const rd = room.h - 2
    const rx = room.x + room.w / 2 - centerX
    const rz = room.y + room.h / 2 - centerZ

    const roomGroup = new THREE.Group()
    roomGroup.position.set(rx, 0, rz)
    scene!.add(roomGroup)

    const floorGeo = new THREE.BoxGeometry(rw - WALL_THICKNESS * 2, 0.8, rd - WALL_THICKNESS * 2)
    const floorMat = new THREE.MeshStandardMaterial({ roughness: 0.75 })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.position.set(0, 0.4, 0)
    floor.receiveShadow = true
    roomGroup.add(floor)

    const wallMat = new THREE.MeshStandardMaterial({ roughness: 0.95 })
    allWallMats.push(wallMat)
    const walls = new THREE.Mesh(wallShellGeometry(rw, rd, WALL_HEIGHT, WALL_THICKNESS), wallMat)
    walls.castShadow = true
    walls.receiveShadow = true
    roomGroup.add(walls)

    buildFurniture(roomGroup, FURNITURE_PLAN[i % FURNITURE_PLAN.length], rw, rd)

    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfff3d6, emissive: 0x000000, emissiveIntensity: 0 })
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 12), bulbMat)
    bulb.position.set(0, WALL_HEIGHT - 1.5, 0)
    roomGroup.add(bulb)

    const light = new THREE.PointLight(0xffc978, 0, 90, 2)
    light.position.set(0, WALL_HEIGHT - 3, 0)
    roomGroup.add(light)

    if (!room.dot) return null
    return { floor, bulb, light }
  })

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 120
  controls.maxDistance = 420
  controls.minPolarAngle = Math.PI / 6
  controls.maxPolarAngle = Math.PI / 2.3
  controls.target.set(0, 4, 0)
  controls.update()

  applyTheme()
  applyLampStates()
  animate()
}

function applyTheme() {
  const p = currentPalette()

  if (ambientLight) {
    ambientLight.color.set(p.ambientSky)
    ambientLight.groundColor.set(p.ambientGround)
    ambientLight.intensity = p.ambientIntensity
  }
  if (dirLight) {
    dirLight.color.set(p.dirColor)
    dirLight.intensity = p.dirIntensity
  }
  if (slabMat) slabMat.color.set(p.slab)
  allWallMats.forEach((mat) => mat.color.set(p.wall))
}

function applyLampStates() {
  const p = currentPalette()
  roomMeshes.forEach((mesh, i) => {
    if (!mesh) return
    const on = !!props.lampStates[i]

    const floorMat = mesh.floor.material as THREE.MeshStandardMaterial
    floorMat.color.set(on ? p.floorLit : p.floor)
    floorMat.emissive.set(on ? 0xffb75e : 0x000000)
    floorMat.emissiveIntensity = on ? 0.18 : 0

    const bulbMat = mesh.bulb.material as THREE.MeshStandardMaterial
    bulbMat.emissive.set(on ? 0xffd88f : 0x000000)
    bulbMat.emissiveIntensity = on ? 1.8 : 0

    mesh.light.intensity = on ? 55 : 0
  })
}

function animate() {
  frameId = requestAnimationFrame(animate)
  controls?.update()
  if (renderer && scene && camera) renderer.render(scene, camera)
}

function handleResize() {
  if (!canvasHost.value || !renderer || !camera) return
  const width = canvasHost.value.clientWidth
  const height = canvasHost.value.clientHeight
  if (width === 0 || height === 0) return
  camera.aspect = width / height
  camera.fov = fovForAspect(camera.aspect)
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

watch(
  () => props.lampStates.slice(),
  () => applyLampStates(),
  { deep: true }
)

watch(isDark, () => {
  applyTheme()
  applyLampStates()
})

onMounted(() => {
  buildScene()

  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(handleResize)
    if (canvasHost.value) resizeObserver.observe(canvasHost.value)
  }

  window.addEventListener('resize', handleResize)
  window.visualViewport?.addEventListener('resize', handleResize)

  requestAnimationFrame(handleResize)
  fallbackResizeTimeout = window.setTimeout(handleResize, 140)
})

onUnmounted(() => {
  cancelAnimationFrame(frameId)
  window.clearTimeout(fallbackResizeTimeout)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', handleResize)
  window.visualViewport?.removeEventListener('resize', handleResize)
  controls?.dispose()
  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
  }
  scene?.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose()
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
      else obj.material.dispose()
    }
  })
})
</script>

<template>
  <div ref="canvasHost" class="floorplan-3d" />
</template>

<style scoped>
.floorplan-3d {
  width: 100%;
  height: 100%;
  touch-action: none;
}

.floorplan-3d :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
