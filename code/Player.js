import { vec3, mat4 } from '../lib/gl-matrix-module.js';

import { Utils } from './Utils.js';
import { Node } from './Node.js';

export class Player extends Node {

    constructor(options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);

        //this.projection = this.camera.matrix//mat4.create();
        //this.camera.updateMatrix();

        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);

        this.mousedownHandler = this.mousedownHandler.bind(this);
        this.mouseupHandler = this.mouseupHandler.bind(this);


        this.keys = {};
    }

    updateProjection() {
        mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
    }

    changeToGun(n){
        this.children[0].stopReload()
        //this.children[0].isEquiped = false;
        //this.player.guns[0].isEquiped = true;
        this.children = [];
        this.addChild(this.player.guns[n]);
        this.children[0].showAmmo();
    }

    updateGuns(){
        
        if(this.keys['Digit1']) {
            this.changeToGun(0)
        }

        if(this.keys['Digit2']) {
            this.changeToGun(1)
        }

        if(this.keys["mouse0"]){
            this.children[0].triggerPull()
        }
        
        if(this.keys["KeyR"]){
            this.children[0].tryReload()
        }
    }

    update(dt) {
        const c = this;
        //console.log(c.jumptime)
        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));

        const up = vec3.set(vec3.create(), 0, 1 ,0 );

        this.updateGuns()

        if(this.children[0]){
            this.children[0].reloading(dt)
        }

        // 1: add movement acceleration
        let acc = vec3.create();
        let jump = vec3.create();

        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }

        if(c.can_jump || c.jumptime > 0){
            if (this.keys['Space'] || c.jumptime > 0) {
                vec3.add(jump, jump, up);
                if(this.jumptime <= 0)
                    this.jumptime = 1
                c.can_jump = 0
            }
            
        }
        //gravity
        this.jumptime = this.jumptime - dt
        const grav = vec3.set(vec3.create(),0, -2,0 );
        if(!c.can_jump){
            vec3.scaleAndAdd(jump, jump, grav ,Math.abs(1-this.jumptime));
        }

        //vclip
        if (this.keys['KeyC']) {
            vec3.add(acc, acc, up);
        }
        if (this.keys['KeyX']) {
            vec3.sub(acc, acc, up);
        }

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);
        vec3.scale(jump, jump, dt * c.jump);
        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }

        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }
        vec3.add(c.velocity,c.velocity,jump)
       
    }

    enable() {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);

        document.addEventListener('mousedown', this.mousedownHandler);
        document.addEventListener('mouseup', this.mouseupHandler);

    }

    disable() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);
        document.removeEventListener('mousedown', this.mousedownHandler);
        document.removeEventListener('mouseup', this.mouseupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    mousemoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this;

        c.rotation[0] -= dy * c.mouseSensitivity;
        c.rotation[1] -= dx * c.mouseSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        if (c.rotation[0] > halfpi) {
            c.rotation[0] = halfpi;
        }
        if (c.rotation[0] < -halfpi) {
            c.rotation[0] = -halfpi;
        }

        c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

    mousedownHandler(e) {
        this.keys["mouse"+e.button] = true;
    }

    mouseupHandler(e) {
        this.keys["mouse"+e.button] = false;
    }

}

Player.defaults = {
    velocity         : [0, 0, 0],
    mouseSensitivity : 0.002,
    maxSpeed         : 10,
    friction         : 0.2,
    acceleration     : 20,
    min              : [-1, -3, -1],
    max              : [1, 1, 1],
    jump             : 100,
    can_jump         : 1,
    jumptime         : 0,
    maxFall          : 3
};
