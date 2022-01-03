import { mat4, vec3 } from "../lib/gl-matrix-module.js";

export class Shop {
    constructor() {
        this.shopModels = [];
        this.gate;
        this.gateOpen = false;
    }

    update(dt, player) {
        //console.log(player)
        let colCount = 0;
        if(this.gateOpen) {
            if (player.keys['KeyF']) {
                let t = this.gate.translation;
                t[1] += 20;
                this.gate.updateMatrix();
                this.gateOpen = false;
                player.keys['KeyF'] = false;
                return;
            }
            this.shopModels.forEach(model => {
                if (this.resolveCollision(player, model)) {
                    colCount ++;
                    if(model.inInventory === "true") {
                        console.log("Press e to buy ammo for")
                        document.querySelector(".text").innerText = "Press e to buy ammo for " + model.ammoPrice + " coins";
                        if (player.keys['KeyE']) {
                            this.buyAmmo(model, player);
                            player.keys['KeyE'] = false;
                        }
                    }
                    else {
                        document.querySelector(".text").innerText = "Press e to buy gun for " + model.price + " coins";
                        if (player.keys["KeyE"]) {
                            this.buyGun(model, player);
                            player.keys["KeyE"] = false;
                        }
                    }
                }
            })
            if (colCount === 0) 
                document.querySelector(".text").innerText = "";
        }
        else {
            if (player.keys['KeyF']) {
                let t = this.gate.translation;
                t[1] -= 20;
                this.gate.updateMatrix();
                this.gateOpen = true;
                console.log(this.gate)
                player.keys['KeyF'] = false;
            }
        }

    }

    buyAmmo(item, player) {
        if(player.inventory.money >= item.ammoPrice) {
            let gun = player.inventory.guns.filter(gunItem => gunItem.name === item.name)[0];
            gun.totalAmmo += 30;
            player.inventory.money -= item.ammoPrice;
            if(player.children.indexOf(gun) > -1)
                gun.showAmmo();
        }
    }

    buyGun(item, player) {
        if(player.inventory.money >= item.price) {
            let gun = player.inventory.guns.filter(gunItem => gunItem.name === item.name)[0];
            player.inventory.money -= item.price;
            item.inInventory = "true";
            gun.inInventory = "true";
            player.children = [];
            player.addChild(gun)
            gun.showAmmo();
        }
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    resolveCollision(a, b) {
        // Update bounding boxes with global translation.
        const ta = a.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const posa = mat4.getTranslation(vec3.create(), ta);
        const posb = mat4.getTranslation(vec3.create(), tb);
        
        if(!b.mesh){
            return
        }
        //console.log(a)
        //console.log(b)

        const mina = vec3.add(vec3.create(), posa, a.min);
        const maxa = vec3.add(vec3.create(), posa, a.max);
        const minb = vec3.add(vec3.create(), posb, b.mesh.primitives[0].attributes.POSITION.min);
        const maxb = vec3.add(vec3.create(), posb, b.mesh.primitives[0].attributes.POSITION.max);

        // Check if there is collision.
        const isColliding = this.aabbIntersection({
            min: mina,
            max: maxa
        }, {
            min: minb,
            max: maxb
        });

        return isColliding;

    }
}