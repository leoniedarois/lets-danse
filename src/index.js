import * as THREE from './libs/three.module'
import * as dat from './libs/dat.gui.min'
import OrbitControls from './libs/orbitcontrols'
import {GLTFLoader} from './libs/gltfloader'
import {Reflector} from './libs/Reflector'

import Engine from '../src/engine'
import Audio from '../src/utils/audio'

import vertexShader from '../public/shaders/background.vert'
import fragmentShader from '../public/shaders/background.frag'
import {randomIntFromInterval} from './utils/randomBetweenTwoValues'
import {MathUtils} from './libs/three.module'

const engine = new Engine()

let scene = null
let camera = null

let gui = null
let guiSetting = null

let mixer = null
let previousTime = 0
const clock = new THREE.Clock()
let cube = null
let mirrorFloor = null
let audio = null
let action = null

let deltaTime = null
let time = null
let controls = null
let dancer = null
const cubes = []
let fakeSky = null
let backgroundMaterial = null

const setup = () => {
  // scene & camera
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(45, engine.width / engine.height, .5, 50)
  camera.position.z = 5
  camera.position.y = 1
  camera.lookAt(0, 1, 0)

  // fake sky - sphere with a shader in the backside
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
  scene.add(fakeSky)

  // orbit controls
  controls = new OrbitControls(camera, engine.renderer.domElement)
  controls.enableZoom = true
  controls.enableRotate = true

  // resize
  window.addEventListener('resize', onResize)
}
let posTargetCubes = []
let posTargetCubesX = []
let rotTargetCubes = []

// create cubes
const createCubes = () => {
  for (let i = 0; i < 100; i++) {

    let random = randomIntFromInterval(.05, .2, .05)
    const geometry = new THREE.BoxGeometry(random, random, random)
    const material = new THREE.MeshLambertMaterial({color: 0xebb434})
    cube = new THREE.Mesh(geometry, material)

    const clonecube = cube.clone()

    clonecube.position.set(randomIntFromInterval(-3, 3, .5), -.6, randomIntFromInterval(-3, 3, .5))
    posTargetCubes.push(clonecube.position.y)
    posTargetCubesX.push(clonecube.position.x)
    rotTargetCubes.push(clonecube.rotation.y)
    cubes.push(clonecube)
    scene.add(clonecube)
  }
}

// load model
const loadModel = () => {
  const loader = new GLTFLoader()
  loader.load(require('url:/public/assets/models/character.glb'), (model) => {
    model.scene.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true
      }
    })

    dancer = model.scene
    dancer.position.y = -.8
    dancer.visible = false
    scene.add(dancer)

    mixer = new THREE.AnimationMixer(dancer)
    action = mixer.clipAction(model.animations[3])

  }, undefined, function (error) {
    console.error(error)
  })
}

const setupScene = () => {
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

  loadModel()
  createCubes()

  // floor
  const floorGeometry = new THREE.CircleGeometry(5, 40)
  floorGeometry.rotateX(-Math.PI * 0.5)

  mirrorFloor = new Reflector(floorGeometry, {
    color: new THREE.Color(0x5c595b),
    clipBias: 0.1,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio
  })
  mirrorFloor.position.y = -.8
  mirrorFloor.receiveShadow = true

  scene.add(mirrorFloor)
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
  gui.close()

}

// audio
const button = document.querySelector('button')
const intro = document.querySelector('.background')

const initAudio = () => {
  button.addEventListener('click', startAudio)
}

const onDocumentMouseMove = (event) => {
  event.preventDefault()

  // parallax effect
  camera.position.x = (event.clientX / window.innerWidth) / 5
}

document.addEventListener('mousemove', onDocumentMouseMove, false)

let colors = [
  "ebb434", "d55df0", "f07a5d"
]

const onBeat = () => {
  const cubeColor = new THREE.Color()
  cubeColor.setHex(`0x${colors[Math.floor(Math.random() * colors.length)]}`)

  cubes.forEach((cube, i) => {
    posTargetCubes[i] = audio.values[0] * Math.random() / 5
    posTargetCubesX[i] = randomIntFromInterval(-3, 3, .5)
    cube.rotation.y = Math.PI * 2
    cube.rotation.x = Math.PI * 2
    cube.rotation.z = Math.PI * audio.values[1]
    cube.material.color = cubeColor
  })

  // change color of the shader
  backgroundMaterial.uniforms.music.value = audio.values[2] * 1.5
  backgroundMaterial.uniforms.music2.value = audio.values[4] * 1.9
  backgroundMaterial.uniforms.music3.value = audio.values[4]
}

const startAudio = () => {
  if (dancer && action) {
    dancer.visible = true
    intro.classList.add('hide')

    audio = new Audio()

    audio.start({
      onBeat: onBeat,
      live: false,
      src: require('url:/public/assets/audio/iron-woodkid.mp3')
    })

    // start model animation
    action.play()

    // when music go louder cubes positions change
    setTimeout(() => {
      cubes.forEach((cube, i) => {
        cube.position.x = MathUtils.lerp(cube.position.x, posTargetCubesX[i], 0.5)
      })
    }, 16500)
  }

  button.removeEventListener('click', startAudio)
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
  requestAnimationFrame(onFrame)

  // update actions
  if (mixer && audio) mixer.update(audio.volume / 600)

  if (audio) {
    audio.update()
    cubes.forEach((cube, i) => {
      cube.position.y = MathUtils.lerp(cube.position.y, posTargetCubes[i], 0.8)
      cube.rotation.y = MathUtils.lerp(cube.rotation.y, rotTargetCubes[i], 0.5)
    })
  }
  render()
}

onFrame()
