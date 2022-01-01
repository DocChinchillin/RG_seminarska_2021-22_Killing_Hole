import { GUI } from "../lib/dat.gui.module.js";

import { Application } from "../common/engine/Application.js";

import { GLTFLoader } from "./GLTFLoader.js";
import { Renderer } from "./Renderer.js";
import { Physics } from "./Physics.js";
import { Gravity } from "./Gravity.js";
import { mat4, vec3 } from "../lib/gl-matrix-module.js";

class App extends Application {
  async start() {
    this.loader = new GLTFLoader();
    await this.loader.load("../common/models/map.gltf");

    this.player = await this.loader.loadPlayer("Player");
    this.playerRef = await this.loader.loadNode("Camera");
    this.gun = await this.loader.loadGun("Gun2");
    console.log(this.player)
    this.player.camera = this.playerRef.camera;
    this.player.camera.updateMatrix();
    this.player.addChild(this.gun)
    console.log(this.gun.translation)
    
    this.scene = await this.loader.loadScene(this.loader.defaultScene);
    console.log(this.player)
    console.log(this.scene);

    if (!this.scene || !this.player) {
      throw new Error("Scene or Camera not present in glTF");
    }

    if (!this.player.camera) {
      throw new Error("Camera node does not contain a camera reference");
    }

    this.renderer = new Renderer(this.gl);
    this.renderer.prepareScene(this.scene);
    this.physics = new Physics(this.scene);
    this.gravity = new Gravity(this.scene);
    this.resize();
    this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
    document.addEventListener(
      "pointerlockchange",
      this.pointerlockchangeHandler
    );
    
  }

  enableCamera() {
    this.canvas.requestPointerLock();
  }

  pointerlockchangeHandler() {
    if (!this.player) {
      return;
    }

    if (document.pointerLockElement === this.canvas) {
      this.player.enable();
    } else {
      this.player.disable();
    }
  }

  update() {
    const t = (this.time = Date.now());
    const dt = (this.time - this.startTime) * 0.001;
    this.startTime = this.time;

    if (this.player) {
      this.player.update(dt);
    }

    if (this.physics) {
      this.physics.update(dt);
    }

    if (this.gravity) {
      this.gravity.update(dt);
    }
  }

  render() {
    if (this.renderer) {
      this.renderer.render(this.scene, this.player);
    }
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const aspectRatio = w / h;

    if (this.player) {
      this.player.camera.aspect = aspectRatio;
      this.player.camera.updateMatrix();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("canvas");
  const app = new App(canvas);
  const gui = new GUI();
  gui.add(app, "enableCamera");
});
