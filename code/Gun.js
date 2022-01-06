import { Node } from "./Node.js";
import {Sound} from "./Sound.js"

export class Gun extends Node{
    constructor(options) {
        super(options);
        console.log(options)

        this.ammoDisplay = document.getElementsByClassName("ammo")[0];
        this.cross = document.getElementsByClassName("cross")[0];
        //firerate
        this.fireRate = options.extras.fireRate || 1000
        this.lastFire = 0
        this.dmg = options.extras.dmg || 1

        //sounds
        this.bang = new Sound(options.extras.shoot || "../common/sounds/rifle.mp3")
        this.bang.setVolume(0.5);

        this.fireEmpty = new Sound(options.extras.emptyShoot || "../common/sounds/empty.mp3")
        this.fireEmpty.setVolume(0.5);

        this.reloadSound = new Sound(options.extras.reloadSound || "../common/sounds/clean-revolver-reload.mp3")
        this.fireEmpty.setVolume(0.5);

        //ammo
        this.magSize = options.extras.magSize || 30
        this.magAmmo = this.magSize
        this.totalAmmo = options.extras.totalAmmo || 100

        //reload
        this.reloadTime = options.extras.reloadTime || 3 //v sek
        this.reloadProg = 0
        this.reloadingInProgress = 0 //ali trenutno reload-amo

        //inventory
        this.inInventory = options.extras.inInventory || false;

        this.name = options.extras.name;    //ime guna, da vemo kaj v shopu kupiti
    }
    triggerPull(){
        let zark
        if( Date.now() - this.lastFire > this.fireRate){
            this.bang.stop();
            zark = this.fire();
            this.lastFire = Date.now();
        }
        return zark

    }

    fire(){
        if (this.reloadingInProgress==1)
            return
        if(this.magAmmo>0){
            this.bang.play();
            this.magAmmo--;
            this.showAmmo();
            return this.dmg
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