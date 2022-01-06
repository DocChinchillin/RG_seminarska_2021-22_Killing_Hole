import { Node } from "./Node.js";
import { mat4, quat, vec3, vec4 } from "../lib/gl-matrix-module.js";

export class Enemy extends Node {
    constructor(options) {
        super(options);

        this.hp = options.extras.hp;
        this.isInScene = true;
        this.moveSpeed = 1;
        this.drop = options.extras.money;
        this.dmg = options.extras.dmg;
        this.velocity = [0, 0, 0];
        this.padc = [0, 0, 0]
        console.log(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3])

    }

    update(dt, player){
        if (this.isInScene){
            console.log(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3])
            let x = vec3.create();
            let pom = vec3.clone(player.translation);
            let trans = vec3.clone(this.translation);
            vec3.mul(trans, trans, vec3.fromValues(1, 0, 1))
            vec3.mul(pom, pom, vec3.fromValues(1, 0, 1))
            vec3.sub(x, pom, trans)
            vec3.normalize(x, x)
            //this.rotation = quat.fromValues(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3]);
            vec3.scale(x, x, 2)
            //this.velocity = x;
            //console.log(x)
            
            
        }
    }


}
