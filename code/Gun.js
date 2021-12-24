import { mat4, vec3 } from "../lib/gl-matrix-module.js";
import { Model } from "./Model.js";
import { Sound } from "./Sound.js";


export class Gun extends Model {
    constructor(mesh, texture, spec) {
        super(mesh, texture, spec);
        //firerate
        this.fireRate = spec.fireRate;
        this.lastFire = 0

        //sounds
        this.bang = new Sound(spec.shoot);
        this.bang.setVolume(0.5);

        this.fireEmpty = new Sound(spec.emptyShot); //change hardcode
        this.fireEmpty.setVolume(0.5);

        this.reloadSound = new Sound(spec.reloadSound);
        this.fireEmpty.setVolume(0.5);

        //ammo
        this.magSize = spec.magSize
        this.magAmmo = this.magSize
        this.totalAmmo = spec.totalAmmo

        //reload
        this.reloadTime = spec.reloadTime //v sek
        this.reloadProg = 0
        this.reloadingInProgress = 0 //ali trenutno reload-amo
    }

    
    
    triggerPull(){
        
        if( Date.now() - this.lastFire > this.fireRate){
            this.fire();
            this.lastFire = Date.now();
        }

    }

    fire(){
        if (this.reloadingInProgress==1)
            return
        if(this.magAmmo>0){
            this.bang.play();
            this.magAmmo--;
            this.showAmmo();
        }else{
            this.fireEmpty.play();
        }
    }

    tryReload(){
        if(this.reloadingInProgress == 1) //ce ze reload
            return
        if(this.magAmmo == this.magSize){ //ce mamo poln mag
            return
        }
        if(this.totalAmmo == 0) //ce smo brez rezerve
            return
        
        this.reloadSound.play()
        this.reloadingInProgress = 1
        
    }
    stopReload(){
        this.reloadingInProgress = 0
        this.reloadProg = 0
        this.reloadSound.stop()
        this.reloadSound.sound.currentTime = 0
    }

    reloading(dt){
        if(this.reloadingInProgress == 0) //ce ne reloadamo
            return
        this.reloadProg += dt
        if(this.reloadProg >= this.reloadTime)
            this.reload()
    }
    
    reload(){
        let ammoToFull = this.magSize-this.magAmmo;
        
        this.reloadingInProgress = 0
        this.reloadProg = 0
        if(this.totalAmmo - ammoToFull < 0){ //ce nimamo dost total ammo za napolniti mag
            this.magAmmo += this.totalAmmo
            this.totalAmmo = 0
        }else{
            this.magAmmo += ammoToFull
            this.totalAmmo -= ammoToFull
        }
        this.showAmmo()
    }
    showAmmo(){
        let ammoDisplay = document.getElementsByClassName("ammo")[0];
        ammoDisplay.innerHTML = this.magAmmo + " / " + this.totalAmmo
    }
    
}

