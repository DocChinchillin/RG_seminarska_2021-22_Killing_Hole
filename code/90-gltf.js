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

    this.camera = await this.loader.loadPlayer("Camera");
    this.gun = await this.loader.loadGun("Gun1");
    this.scene = await this.loader.loadScene(this.loader.defaultScene);
    this.camera.addChild(this.gun);
    if (!this.scene || !this.camera) {
      throw new Error("Scene or Camera not present in glTF");
    }

    if (!this.camera.camera) {
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
    console.log(this.camera);
  }

  enableCamera() {
    this.canvas.requestPointerLock();
  }

  pointerlockchangeHandler() {
    if (!this.camera) {
      return;
    }

    if (document.pointerLockElement === this.canvas) {
      this.camera.enable();
    } else {
      this.camera.disable();
    }
  }

  update() {
    const t = (this.time = Date.now());
    const dt = (this.time - this.startTime) * 0.001;
    this.startTime = this.time;

    if (this.camera) {
      //console.log(this.camera)
      this.camera.update(dt);
    }

    if (this.physics) {
      this.physics.update(dt);
      console.log(this.camera);
    }

    if (this.gravity) {
      this.gravity.update(dt);
    }

    if (this.gun) {
      this.gun.matrix = mat4.clone(this.camera.getGlobalTransform());
      mat4.rotateX(this.gun.matrix, this.gun.matrix, this.gun.rotation[0]);
      mat4.rotateY(this.gun.matrix, this.gun.matrix, this.gun.rotation[1]);
      mat4.rotateZ(this.gun.matrix, this.gun.matrix,this.gun.rotation[2]);
      mat4.translate(
        this.gun.matrix,
        this.gun.matrix,
        this.gun.translation
      );
    }
    //console.log(this.scene)
  }

  render() {
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const aspectRatio = w / h;

    if (this.camera) {
      this.camera.camera.aspect = aspectRatio;
      this.camera.camera.updateMatrix();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("canvas");
  const app = new App(canvas);
  const gui = new GUI();
  gui.add(app, "enableCamera");
});
