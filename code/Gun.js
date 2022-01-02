import { Node } from "./Node.js";
import {Sound} from "./Sound.js"

export class Gun extends Node{
    constructor(options) {
        super(options);
        console.log(options)

        this.ammoDisplay = document.getElementsByClassName("ammo")[0];
        this.cross = document.getElementsByClassName("cross")[0];
        //firerate
        this.fireRate = 500//spec.fireRate;
        this.lastFire = 0

        //sounds
        this.bang = new Sound("../common/sounds/rifle.mp3")//spec.shoot);
        this.bang.setVolume(0.5);

        this.fireEmpty = new Sound("../common/sounds/empty.mp3")//spec.emptyShot);
        this.fireEmpty.setVolume(0.5);

        this.reloadSound = new Sound("../common/sounds/clean-revolver-reload.mp3")//spec.reloadSound);
        this.fireEmpty.setVolume(0.5);

        //ammo
        this.magSize = 30//spec.magSize
        this.magAmmo = this.magSize
        this.totalAmmo = 100//spec.totalAmmo

        //reload
        this.reloadTime = 3//spec.reloadTime //v sek
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
        this.cross.innerHTML = "+"
        this.reloadingInProgress = 0
        this.reloadProg = 0
        this.reloadSound.stop()
        this.reloadSound.sound.currentTime = 0
    }

    reloading(dt){
        if(this.reloadingInProgress == 0) //ce ne reloadamo
            return
        this.reloadProg += dt
        this.cross.innerHTML = (Math.round(((this.reloadTime-this.reloadProg))* 10) / 10).toFixed(1)
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
        this.cross.innerHTML = "+"
        this.showAmmo()
    }
    showAmmo(){
        this.ammoDisplay.innerHTML = this.magAmmo + " / " + this.totalAmmo
    }
}