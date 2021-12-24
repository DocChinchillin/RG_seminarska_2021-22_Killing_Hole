import { GUI } from '../lib/dat.gui.module.js';

import { Application } from '../common/engine/Application.js';

import { Renderer } from './Renderer.js';
import { Physics } from './Physics.js';
import { Camera } from './Camera.js';
import { SceneLoader } from './SceneLoader.js';
import { SceneBuilder } from './SceneBuilder.js';
import { Gravity } from './Gravity.js';
import { Sound } from './Sound.js';
import { Shop } from './Shop.js';
import { InventoryBuilder } from './InventoryBuilder.js';

class App extends Application {

    start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.time = Date.now();
        this.startTime = this.time;

        this.aspect = 1;

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        this.BGM = new Sound("../common/sounds/BGM.m4a")
        this.BGM.setVolume(0.1)
        

        this.load('scene.json', 'inventory.json');
    }

    async load(uri, uri2) {
        const scene = await new SceneLoader().loadScene(uri);
        const inventory = await new SceneLoader().loadScene(uri2);
        const builder = new SceneBuilder(scene);
        const invBuilder = new InventoryBuilder(inventory);
        this.scene = builder.build();
        this.inventory = invBuilder.build();
        this.physics = new Physics(this.scene);
        this.gravity = new Gravity(this.scene);
        this.shop = new Shop(this.scene);

        // Find first camera.
        this.camera = null;
        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
            }
        });

        this.camera.addChild(this.inventory.nodes[0]);
        this.camera.player.guns.push(this.inventory.nodes[0]);
        
        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        this.renderer.prepare(this.scene);
        this.renderer.prepare(this.inventory);
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
            
            this.BGM.play()
        } else {
            this.camera.disable();
            this.BGM.stop()
        }
    }

    update() {
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        

        if (this.camera) {
            this.camera.update(dt);
        }

        if (this.physics) {
            this.physics.update(dt);
        }

        if (this.gravity) {
            this.gravity.update(dt);
        }

        /*if (this.shop) {
            this.shop.update(dt, this.camera);
        }*/

    }

    render() {
        if (this.scene) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.aspect = w / h;
        if (this.camera) {
            this.camera.aspect = this.aspect;
            this.camera.updateProjection();
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new GUI();
    gui.add(app, 'enableCamera');
});
