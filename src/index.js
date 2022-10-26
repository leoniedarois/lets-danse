import * as THREE from './libs/three.module'
import * as dat from './libs/dat.gui.min'
import OrbitControls from './libs/orbitcontrols'
import {GLTFLoader} from './libs/gltfloader'
import { Reflector } from 'three/examples/jsm/objects/Reflector'

import Engine from '../src/engine'
import Audio from '../src/utils/audio'

import vertexShader from '../public/shaders/background.vert'
import fragmentShader from '../public/shaders/background.frag'

const engine = new Engine()

let scene = null
let camera = null

let gui = null
let guiSetting = null

let mixer = null
let previousTime = 0
const clock = new THREE.Clock()
let cube = null
let plane = null
let audio = null
let action = null

let deltaTime = null
let time = null
let musicTempo = null

let fakeSky = null
let backgroundMaterial = null

const setup = () => {
  // scene & camera
  scene = new THREE.Scene()
  // scene.background = new THREE.TextureLoader().load(require("url:/public/assets/textures/wall.png"))

  camera = new THREE.PerspectiveCamera(45, engine.width / engine.height, .5, 50)
  camera.position.z = 5
  camera.position.y = 1
  camera.lookAt(0, 1, 0)

  // fake sky
  const sphere = new THREE.SphereGeometry(15, 32, 16)
  backgroundMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: {value: 0},
      music: {value: 1},
      music2: {value: 1},
      music3: {value: 1}
    },
    side: THREE.BackSide,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
  })
  fakeSky = new THREE.Mesh(sphere, backgroundMaterial)
  // background.position.z = -50
  scene.add(fakeSky)

  // orbit controls
  const controls = new OrbitControls(camera, engine.renderer.domElement)
  controls.enableZoom = false

  // resize
  window.addEventListener('resize', onResize)
}

const setupScene = () => {
  // debug cube
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshStandardMaterial({color: 0xffff00})
  cube = new THREE.Mesh(geometry, material)
  cube.castShadow = true
  cube.receiveShadow = true
  // scene.add(cube)

  // lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.castShadow = true
  directionalLight.position.set(4, 3, 50)
  scene.add(directionalLight)

  const lightSetting = guiSetting.addFolder('Lights')
  lightSetting.add(directionalLight.position, 'x', 0, 50, .1)
  lightSetting.add(directionalLight.position, 'y', 0, 50, .1)
  lightSetting.add(directionalLight.position, 'z', 0, 50, .1)
  // lightSetting.open()

  // load model
  const loader = new GLTFLoader()
  loader.load(require('url:/public/assets/models/character.glb'),  (model) => {
    model.scene.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true
        // child.material = new THREE.MeshNormalMaterial()
      }
    })
    model.scene.position.y = -.8
    scene.add(model.scene)

    mixer = new THREE.AnimationMixer(model.scene)
    action = mixer.clipAction(model.animations[3])
    console.log(model.animations, 'animations')

  }, undefined,function ( error ) {
    console.error( error )
  })

  // floor
  const floorGeometry = new THREE.CircleGeometry( 5, 40)
  floorGeometry.rotateX(-Math.PI * 0.5)
  const floorMaterial = new THREE.MeshStandardMaterial({color: 0x5c595b})
  plane = new Reflector(floorGeometry, floorMaterial)
  // plane.position.z = -25
  plane.position.y = -.8
  plane.receiveShadow = true

  scene.add(plane)
}

// resize
const onResize = () => {
  camera.aspect = engine.width / engine.height
  camera.updateProjectionMatrix()
}

// gui
const createGui = () => {
  gui = new dat.GUI()
  guiSetting = gui.addFolder('Settings')
  guiSetting.open()
}

// audio
const canvas = document.querySelector('canvas')

const initAudio = () => {
  canvas.addEventListener('click', startAudio)
}

const onBeat = () => {
  console.log('onBeat', audio.values)

  backgroundMaterial.uniforms.music.value = audio.values[2] * 1.5
  backgroundMaterial.uniforms.music2.value = audio.values[1] * 1.6
  backgroundMaterial.uniforms.music3.value = audio.values[4]
}

const startAudio = () => {
  audio = new Audio()

  audio.start( {
    onBeat: onBeat,
    live: false,
    src: require('url:/public/assets/audio/iron-woodkid.mp3')
  })

  // start model animation
  action.play()

  canvas.removeEventListener('click', startAudio)
}

createGui()
setup()
initAudio()
setupScene()

const render = () => {
  engine.renderer.render(scene, camera)
}

const onFrame = () => {
  const elapsedTime = clock.getElapsedTime()
  deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  time += 0.01
  // backgroundMaterial.uniforms.uTime.value = time

  requestAnimationFrame(onFrame)

  // update actions
  if (mixer && audio) mixer.update(audio.volume / 500)
  if (audio) audio.update()

  render()
}

onFrame()
