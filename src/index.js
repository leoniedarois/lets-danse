import * as THREE from 'three'
import * as dat from 'dat.gui'

import Engine from '../src/engine'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

const engine = new Engine()

let scene = null
let camera = null

let gui = null
let guiSetting = null

const setup = () => {
  // scene & camera
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, engine.width / engine.height, .1, 1000)
  camera.position.z = 10

  // orbit controls
  const controls = new OrbitControls(camera, engine.renderer.domElement)
  controls.enableZoom = false

  // resize
  window.addEventListener('resize', onResize)
}

const setupScene = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material= new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  const cube = new THREE.Mesh(geometry, material)

  scene.add(cube)
}

const onResize = () => {
  camera.aspect = engine.width / engine.height
  camera.updateProjectionMatrix()
}

const createGui = () => {
  gui = new dat.GUI()
  guiSetting = gui.addFolder('Settings')
  guiSetting.open()
}

setup()
setupScene()
createGui()

const render = () => {
  engine.renderer.render(scene, camera)
}

const onFrame = () => {
  requestAnimationFrame(onFrame)

  // actions

  render()
}

onFrame()
