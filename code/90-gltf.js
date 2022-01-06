import { GUI } from "../lib/dat.gui.module.js";

import { Application } from "../common/engine/Application.js";

import { GLTFLoader } from "./GLTFLoader.js";
import { Renderer } from "./Renderer.js";
import { Physics } from "./Physics.js";
import { Gravity } from "./Gravity.js";
import { mat4, vec3 } from "../lib/gl-matrix-module.js";
import { Shop } from "./Shop.js";
import { HitScan } from "./HitScan.js";
import { Light } from "./Light.js";
import { Sound } from "./Sound.js";
import { Enemy } from "./Enemy.js"

class App extends Application {
  async start() {
    this.loader = new GLTFLoader();
    await this.loader.load("../common/models/map.gltf");

    this.test = await this.loader.loadNode("TEST");
    console.log("test: ", this.test)
    this.test.translation = vec3.fromValues(20, 20, 20)
    this.test.scale = vec3.fromValues(0.2, .2, 0.2)
    this.test.updateMatrix()
    this.player = await this.loader.loadPlayer("Player");
    this.playerRef = await this.loader.loadNode("Camera");
    this.gun = await this.loader.loadGun("Gun1");
    let gunInventory = [this.gun];
    gunInventory.push(await this.loader.loadGun("Gun2"));
    this.player.inventory.guns = gunInventory;
    this.player.camera = this.playerRef.camera;
    this.player.camera.updateMatrix();
    gunInventory.forEach(gun => {   //dodamo vse gune playerju, zato da bodo bli na sceni
      this.player.addChild(gun);
    })
    this.gun.showAmmo();
    this.BGM = new Sound("../common/sounds/BGM.mp3")
    this.BGM.setVolume(0.1)
    

    this.light = new Light();
    this.shop = new Shop();
    this.shop.shopModels.push(await this.loader.loadShop("Gun1SHOP"));
    this.shop.shopModels.push(await this.loader.loadShop("Gun2SHOP"));
    this.shop.shopModels.push(await this.loader.loadShop("Medpack"));

    this.shop.gate = await this.loader.loadNode("Gate");

    this.enemy = await this.loader.loadEnemy("enemy1");
    //this.enemy2 = await this.loader.loadEnemy("enemy2");
    //this.enemy3 = await this.loader.loadEnemy("enemy3");
    //this.enemy4 = await this.loader.loadEnemy("enemy4");
    console.log(this.enemy.rotation)

    this.scene = await this.loader.loadScene(this.loader.defaultScene);
    console.log(this.player)
    console.log(this.scene);

console.log(this.light)
    if (!this.scene || !this.player) {
      throw new Error("Scene or Camera not present in glTF");
    }

    if (!this.player.camera) {
      throw new Error("Camera node does not contain a camera reference");
    }

    this.renderer = new Renderer(this.gl);
    this.renderer.prepareScene(this.scene);
    
    this.player.children.splice(1, this.player.children.length - 1);  //na sceni rabi bit samo se prvi gun

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
      this.BGM.play()
    } else {
      this.player.disable();
      this.BGM.pause()
    }
  }

  update() {
    
    const t = (this.time = Date.now());
    const dt = (this.time - this.startTime) * 0.001;
    this.startTime = this.time;
    
    if (this.player && this.player.camera) {
      this.player.update(dt);
      //console.log(this.player.look)
    }

    if (this.gravity) {
      this.gravity.update(dt);
    }

    if (this.physics) {
      this.physics.update(dt);
    }

    if (this.shop) {
      this.shop.update(dt, this.player);
    }
    if (this.hitScan) {
      this.hitScan.update(dt,this.shop,this.player,this.test);
    }
    if (this.enemy && this.player) {
      this.enemy.update(dt, this.player);
      //this.enemy2.update(dt, this.player);
      //this.enemy3.update(dt, this.player);
      //sthis.enemy4.update(dt, this.player);
    }



  }

  render() {
    if (this.renderer) {
      this.renderer.render(this.scene, this.player, this.light);
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
  setTimeout(() => {
    gui.addColor(app.light, 'ambientColor');
    gui.addColor(app.light, 'diffuseColor');
    gui.addColor(app.light, 'specularColor');
    gui.add(app.light, 'shininess', 0.0, 1000.0);
    for (let i = 0; i < 3; i++) {
        gui.add(app.light.position, i, -200.0, 200.0).name('position.' + String.fromCharCode('x'.charCodeAt(0) + i));
    }
  }, 3000)
  gui.add(app, "enableCamera");
});
