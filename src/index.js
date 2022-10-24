import * as THREE from '../node_modules/three/build/three.module.js'
import * as dat from '../node_modules/dat.gui'

import Engine from '../src/engine'
import audio from '../src/utils/audio'

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

// import {assetsLoader} from '../utils/assetsLoader'

const engine = new Engine()

let scene = null
let camera = null

let gui = null
let guiSetting = null

let mixer = null
let previousTime = 0
const clock = new THREE.Clock()

const setup = () => {
  // scene & camera
  scene = new THREE.Scene()
  // scene.fog = new THREE.Fog( 0xFF6685, 1, 50 )
  scene.background = new THREE.TextureLoader().load(require("url:/public/assets/textures/wall.png"))

  camera = new THREE.PerspectiveCamera(50, engine.width / engine.height, .5, 100)
  camera.position.z = 5
  camera.position.y = 1
  camera.lookAt(0, 1, 0)

  // orbit controls
  const controls = new OrbitControls(camera, engine.renderer.domElement)
  controls.enableZoom = true

  // resize
  window.addEventListener('resize', onResize)
}

const setupScene = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({color: 0xffff00});
  const cube = new THREE.Mesh(geometry, material)
  // scene.add(cube)

  // lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.set(1024, 1024)
  directionalLight.shadow.camera.far = 500
  directionalLight.shadow.camera.left = -7
  directionalLight.shadow.camera.top = 7
  directionalLight.shadow.camera.right = 7
  directionalLight.shadow.camera.bottom = -7
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  // load model
  const loader = new GLTFLoader()
  loader.load(require('url:/public/assets/models/character.glb'), function (model) {
    model.scene.traverse(function (child){
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        // child.material = new THREE.MeshNormalMaterial()
      }
    })

    scene.add(model.scene)

    mixer = new THREE.AnimationMixer(model.scene)
    const action = mixer.clipAction(model.animations[0])
    console.log(action, 'action')
    action.play()

  }, undefined,function ( error ) {
    console.error( error )
  })

  // floor
  const floorGeometry = new THREE.PlaneGeometry( 100, 100 )
  floorGeometry.rotateX(-Math.PI * 0.5)
  const floorMaterial = new THREE.MeshBasicMaterial( {color: 0x5c595b, side: THREE.DoubleSide} )
  const plane = new THREE.Mesh( floorGeometry, floorMaterial )
  plane.position.z = -25
  plane.receiveShadow = true;

  scene.add(plane)
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
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  requestAnimationFrame(onFrame)

  // actions
  if(mixer) {
    mixer.update(deltaTime)
  }

  render()
}

const onBeat = () => {
  console.log( 'onBeat' )
}

audio.start( {
  onBeat: onBeat,
  live: false,
  src: require('url:/public/assets/audio/iron-woodkid.mp3')
})

onFrame()
