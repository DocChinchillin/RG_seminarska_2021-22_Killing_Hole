import { Node } from "./Node.js";
import { mat4, quat, vec3, vec4 } from "../lib/gl-matrix-module.js";
import { Sound } from "./Sound.js";

export class Enemy extends Node {
    constructor(options) {
        console.log(options)
        super(options);

        this.dmgSound = new Sound("../common/sounds/Zombie_Death.mp3");
        this.dmgSound.setVolume(0.4)

        this.hp = options.extras.hp;
        this.startingHp = options.extras.hp;
        this.isInScene = false;
        this.moveSpeed = 1;
        this.drop = options.extras.money;
        this.dmg = options.extras.dmg;
        this.isBoss = options.extras.boss ? true : false;
        this.velocity  = [0, 0, 0];
        this.padc = [0, 0, 0];
        this.originalRotation = vec4.clone(this.rotation);
        //console.log(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3])

    }

    update(dt, player){
        if (this.isInScene){
            //console.log(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3])
            let direction = vec3.create();
            let pom = vec3.clone(player.translation);
            let trans = vec3.clone(this.translation);
            vec3.mul(trans, trans, vec3.fromValues(1, 0, 1))
            vec3.mul(pom, pom, vec3.fromValues(1, 0, 1))
            vec3.sub(direction, pom, trans)
            vec3.normalize(direction, direction)
            let rotationQuat = quat.create();
            let rotation = Math.atan2(direction[2], direction[0]) / (2 * Math.PI);
            //quat.fromEuler(rotationQuat, 0, rotation * 180 / Math.PI, 0)
            //console.log(rotationQuat[0], rotationQuat[1], rotationQuat[2], rotationQuat[3])
            //quat.set(this.rotation, rotationQuat[0],rotationQuat[1],rotationQuat[2],rotationQuat[3])
            //quat.mul(this.rotation, rotationQuat, this.originalRotation)
            //console.log( rotation * 180 / Math.PI)
            //this.rotation = quat.fromValues(this.rotation[0], direction[0], this.rotation[2])
            vec3.scale(direction, direction, 2)
            //this.velocity = direction;
            //console.log(direction)
        
        }
    }

    updatePos() {
        //this.updateMatrix();
        const t = this.matrix;
        const degrees = this.rotation.map(x => x * 180 / Math.PI);
        //console.log(degrees)
        const q = quat.fromEuler(quat.create(), ...degrees);
        const v = vec3.clone(this.translation);
        const s = vec3.clone(this.scale);

        mat4.fromRotationTranslationScale(t, this.rotation, v, s);
    }

    hit(shot, player){
        this.red = 1;
        this.hp -= shot.dmg;
        this.dmgSound.play()
        if (this.hp <= 0) {
            this.isInScene = false;
            this.translation[1] -= 20;
            player.inventory.money += Math.floor(this.drop);
            player.showMoney();
        }
    }
}
