import * as THREE from 'three'
import * as dat from 'dat.gui'

import Engine from './engine'

const engine = new Engine()

let scene = null
let camera = null

let gui = null
let guiSetting = null

const setup = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, engine.width / engine.height, .1, 1000)
  camera.position.z = 10

  // resize
  window.addEventListener('resize', onResize)
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
createGui()

const render = () => {
  // console.log(engine.renderer.render())
  engine.renderer.render(scene, camera)
}

const onFrame = () => {
  requestAnimationFrame(onFrame)

  // actions

  render()
}

onFrame()
