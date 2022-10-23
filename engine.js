import * as THREE from 'three'

export default class Engine {

  constructor() {
    this.renderer = new THREE.WebGLRenderer()
    // console.log(this.renderer)
    document.body.appendChild( this.renderer.domElement )

    this.width = 0
    this.height = 0

    this._onResize()

    window.addEventListener( "resize", this._onResize, false )
  }

  _onResize = () => {
    this.width = window.innerWidth
    this.height = window.innerHeight

    this.renderer.setSize( this.width, this.height )
  }

}
