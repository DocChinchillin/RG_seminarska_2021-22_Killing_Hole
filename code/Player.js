import { vec3, mat4, quat } from '../lib/gl-matrix-module.js';

import { Utils } from './Utils.js';
import { Node } from './Node.js';
import { Sound } from './Sound.js';

export class Player extends Node {

    constructor(options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);

        //this.projection = this.camera.matrix//mat4.create();
        //this.camera.updateMatrix();

        this.dmgSound = new Sound("../common/sounds/player_hit.mp3");
        this.dmgSound.setVolume(0.2)

        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);

        this.mousedownHandler = this.mousedownHandler.bind(this);
        this.mouseupHandler = this.mouseupHandler.bind(this);
        this.shots = []
        this.keys = {};

        this.inventory = {money: 100, health: 100}

        // pretekli čas od zadnjega odbitka hp-ja. Zato, da ti enemy ne more takoj zbiti vseh 100%
        this.timeSinceDamageTaken = 0.0;

        this.playing = false;
    }
    getViewProjectionMatrix(camera) {
        const mvpMatrix = mat4.clone(camera.matrix);
        let parent = camera.parent;
        while (parent) {
            mat4.mul(mvpMatrix, parent.matrix, mvpMatrix);
            parent = parent.parent;
        }
        mat4.invert(mvpMatrix, mvpMatrix);
        mat4.mul(mvpMatrix, camera.camera.matrix, mvpMatrix);
        return mvpMatrix;
    }


    updateProjection() {
        mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
    }

    changeToGun(n){
        this.children[0].stopReload()
        this.children[0].bang.stop();
        //this.children[0].isEquiped = false;
        //this.player.guns[0].isEquiped = true;
        this.children = [];
        this.addChild(this.inventory.guns[n]);
        this.children[0].showAmmo();
    }

    showHealth() {
        document.querySelector("#myHealth").innerHTML = this.inventory.health + "%";
        document.querySelector("#myHealth").style.width = this.inventory.health + "%";
    }

    showMoney() {
        document.querySelector("#myMoney").innerHTML = this.inventory.money;
    }

    updateGuns(){
        let novRay,dmg
        if(this.keys['Digit1']) {
            if (this.inventory.guns[0].inInventory === "true")
                this.changeToGun(0)
        }

        if(this.keys['Digit2']) {
            if (this.inventory.guns[1].inInventory === "true")
            this.changeToGun(1)
        }
        
        if(this.keys["mouse0"]){
            dmg = this.children[0].triggerPull()
        }

        if(dmg){
            const vp = this.getViewProjectionMatrix(this) 
            mat4.invert(vp,vp)

            const tocka = vec3.fromValues(0,0,-1)
            const tocka1 = vec3.fromValues(0,0,1)
            const smer = vec3.create()
            
            vec3.transformMat4(tocka,tocka,vp)
            vec3.transformMat4(tocka1,tocka1,vp) 

            vec3.sub(smer,tocka1,tocka)
            novRay = {
                "dmg": dmg,
                "origin" : tocka,
                "dir" : smer
            }
            this.shots.push(novRay)
        }

        if(this.keys["KeyR"]){
            this.children[0].tryReload()
        }
    }

    update(dt) {

             
        const c = this;
        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));

        const up = vec3.set(vec3.create(), 0, 1 ,0 );
        
        if(this.jumptime < 0){
        this.min[1] = (Math.abs(Math.sin(this.premik*5))*0.15) -3
        }else{
            this.min[1] = -3
        }
        c.timeSinceDamageTaken -= dt
        if( c.timeSinceDamageTaken > 0)
            c.children[0].red = c.timeSinceDamageTaken
        c.updateGuns()

        if(c.children[0]){
            c.children[0].reloading(dt)
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
                    this.jumptime = this.maxAir
                c.can_jump = 0
            }
            
        }
        //gravity
        this.jumptime = this.jumptime - dt
        const grav = vec3.set(vec3.create(),0, -2,0 );
        
        //if(!c.can_jump){
            vec3.scaleAndAdd(jump, jump, grav ,this.maxAir-this.jumptime);
        //}

        //vclip
        if (this.keys['KeyC']) {
            vec3.add(jump, jump, up);
        }
        if (this.keys['KeyX']) {
            vec3.sub(jump, jump, up);
        }

        // 2: update velocity

        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);
        vec3.scaleAndAdd(c.padc, c.padc, jump, dt * c.jump);
       
        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }
        else{
            this.premik +=dt
        }

        // if (!this.keys['Space'])
        // {
        //     vec3.scale(c.padc, c.padc, 1 - c.friction);
        // }

        // 4: limit speed
        let len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }

        len = vec3.len(c.padc);
        if (len > c.maxFall) {
            vec3.scale(c.padc, c.padc, c.maxFall / len);
        }
        
       
    }

    enable() {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);

        document.addEventListener('mousedown', this.mousedownHandler);
        document.addEventListener('mouseup', this.mouseupHandler);

        this.playing = true;
    }

    disable() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);
        document.removeEventListener('mousedown', this.mousedownHandler);
        document.removeEventListener('mouseup', this.mouseupHandler);

        this.playing = false;

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
    padc             : [0, 0, 0],
    mouseSensitivity : 0.002,
    maxSpeed         : 10,
    friction         : 0.2,
    acceleration     : 20,
    min              : [-1, -3, -1],
    max              : [1, 1, 1],
    jump             : 100,
    can_jump         : 1,
    jumptime         : 0,
    maxFall          : 5,
    maxAir           : 1,
    premik           :0,
    timeSinceDamageTaken: 1
};
