import { ShopModel } from "./ShopModel.js";
import { vec3, mat4 } from '../lib/gl-matrix-module.js';

export class Shop {
    constructor(scene) {
        this.scene = scene.nodes.filter(item => item instanceof ShopModel);
    }

    update(dt, camera) {
        this.scene.forEach(item => {
            if(this.resolveCollision(camera, item)) {
                if (item.inInventory) {
                    console.log("press e to buy ammo for " + item.ammoPrice + " coins")
                    if (camera.keys["KeyE"]) {
                        this.buyAmmo(camera, item);
                        camera.keys["KeyE"] = false;
                    }
                }
                else {
                    console.log("press e to buy gun for " + item.price + " coins")
                    if (camera.keys["KeyE"]) {
                        this.buyGun(camera, item);
                        camera.keys["KeyE"] = false;
                    }
                }
            }
        });
        
    }

    buyAmmo(camera, item) {
        let gun = camera.player.guns.filter(gunItem => gunItem.itemName === item.itemName)[0];
        if (camera.player.money >= item.ammoPrice) {
            gun.totalAmmo += 30;
            camera.player.money -= item.ammoPrice;
            console.log("Remaining money " + camera.player.money)
            if (gun.isEquiped)
                gun.showAmmo();
        }
        else
            console.log("Not enough money!")
    }

    buyGun(camera, item) {
        let gun = camera.player.guns.filter(gunItem => gunItem.itemName === item.itemName)[0];
        if (camera.player.money >= item.price) {
            camera.player.money -= item.price;
            item.inInventory = true;
            gun.inInventory = true;
            gun.isEquiped = true;
            camera.children[0].isEquiped = false;
            camera.children = [];
            camera.addChild(gun)
            console.log("Remaining money " + camera.player.money)
        }
        else
            console.log("Not enough money!")
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    resolveCollision(cam, b) {
        // Update bounding boxes with global translation.
        const tcam = cam.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const poscam = mat4.getTranslation(vec3.create(), tcam);
        const posb = mat4.getTranslation(vec3.create(), tb);

        const mincam = vec3.add(vec3.create(), poscam, cam.aabb.min);
        const maxcam = vec3.add(vec3.create(), poscam, cam.aabb.max);
        const minb = vec3.add(vec3.create(), posb, b.aabb.min);
        const maxb = vec3.add(vec3.create(), posb, b.aabb.max);

        // Check if there is collision.
        const isColliding = this.aabbIntersection({
            min: mincam,
            max: maxcam
        }, {
            min: minb,
            max: maxb
        });

        if (!isColliding) {
            return 0;
        }

        //console.log("se dotikam :)")
        return 1;
        
    }
    
}