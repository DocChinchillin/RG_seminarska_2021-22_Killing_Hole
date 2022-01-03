import { GUI } from "../lib/dat.gui.module.js";

import { Application } from "../common/engine/Application.js";

import { GLTFLoader } from "./GLTFLoader.js";
import { Renderer } from "./Renderer.js";
import { Physics } from "./Physics.js";
import { Gravity } from "./Gravity.js";
import { mat4, vec3 } from "../lib/gl-matrix-module.js";
import { Shop } from "./Shop.js";
import { HitScan } from "./HitScan.js";

class App extends Application {
  async start() {
    this.loader = new GLTFLoader();
    await this.loader.load("../common/models/map.gltf");

    this.player = await this.loader.loadPlayer("Player");
    this.playerRef = await this.loader.loadNode("Camera");
    this.gun = await this.loader.loadGun("Gun1");
    let gunInventory = [this.gun];
    gunInventory.push(await this.loader.loadGun("Gun2"));
    this.player.inventory.guns = gunInventory;
    this.player.camera = this.playerRef.camera;
    this.player.camera.updateMatrix();
    this.player.addChild(this.gun);
    //this.player.addChild(this.player.inventory.guns[1])
    this.gun.showAmmo();

    this.shop = new Shop();
    this.shop.shopModels.push(await this.loader.loadShop("Gun1SHOP"));
    this.shop.shopModels.push(await this.loader.loadShop("Gun2SHOP"));
    this.shop.shopModels.push(await this.loader.loadShop("Medpack"));

    this.shop.gate = await this.loader.loadNode("Gate")
    
    this.scene = await this.loader.loadScene(this.loader.defaultScene);
    console.log(this.player)
    console.log(this.scene);


    if (!this.scene || !this.player) {
      throw new Error("Scene or Camera not present in glTF");
    }

    if (!this.player.camera) {
      throw new Error("Camera node does not contain a camera reference");
    }

    /*this.scene.nodes.forEach(node => {
      console.log(node.translation)
    })*/
    this.renderer = new Renderer(this.gl);
    this.renderer.prepareScene(this.scene);
    //this.player.children.pop();
    this.physics = new Physics(this.scene);
    this.gravity = new Gravity(this.scene);
    this.hitScan = new HitScan(this.scene);
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
      //console.log(this.player.look)
    }

    if (this.physics) {
      this.physics.update(dt);
    }

    if (this.gravity) {
      this.gravity.update(dt);
    }

    if (this.shop) {
      this.shop.update(dt, this.player);
    }
    if (this.hitScan) {
      this.hitScan.update(dt);
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
