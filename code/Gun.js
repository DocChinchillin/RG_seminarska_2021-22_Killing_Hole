import { mat4, vec3 } from "../lib/gl-matrix-module.js";
import { Model } from "./Model.js";
import { Sound } from "./Sound.js";


export class Gun extends Model {
    constructor(mesh, texture, spec) {
        super(mesh, texture, spec);
        this.fireRate = spec.fireRate;
        this.lastFire = 0
        this.bang = new Sound(spec.shoot);
        this.bang.setVolume(0.5);
    }
    
    triggerPull(){
        
        if( Date.now() - this.lastFire > this.fireRate){
            this.fire();
            this.lastFire = Date.now();
        }

    }

    fire(){
        this.bang.play();
    }
    
}

