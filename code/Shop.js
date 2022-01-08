import { mat4, vec3 } from "../lib/gl-matrix-module.js";

export class Shop {
  constructor() {
    this.shopModels = [];
    this.gate;
    this.gateOpen = false;
    this.curModel = null;

    this.timeout;
  }

  setCurModel(node) {
    this.curModel = node;
  }

  update(dt, player) {
    if (this.gateOpen) {
      /*if (player.keys["KeyF"]) {
        let t = this.gate.translation;
        t[1] += 20;
        this.gate.updateMatrix();
        this.gateOpen = false;
        player.keys["KeyF"] = false;
        document.querySelector(".infoText").innerText = "";
        return;
      }*/
      if (this.curModel) {
        if (this.curModel.type === "health") {
          document.querySelector(".infoText").innerText =
            "Press E to buy health for " + this.curModel.price + " coins";
          if (player.keys["KeyE"]) {
            this.buyHealth(this.curModel, player);
            player.keys["KeyE"] = false;
          }
        } else {
          if (this.curModel.inInventory === "true") {
            document.querySelector(".infoText").innerText =
              "Press E to buy ammo for " + this.curModel.ammoPrice + " coins";
            if (player.keys["KeyE"]) {
              this.buyAmmo(this.curModel, player);
              player.keys["KeyE"] = false;
            }
          } else {
            document.querySelector(".infoText").innerText =
              "Press E to buy gun for " + this.curModel.price + " coins";
            if (player.keys["KeyE"]) {
              this.buyGun(this.curModel, player);
              player.keys["KeyE"] = false;
            }
          }
        }
      } else document.querySelector(".infoText").innerText = "";
    } else {
      /*if (player.keys["KeyF"]) {
        let t = this.gate.translation;
        t[1] -= 20;
        this.gate.updateMatrix();
        this.gateOpen = true;
        player.keys["KeyF"] = false;
      }*/
    }
  }

  buyAmmo(item, player) {
    if (player.inventory.money >= item.ammoPrice) {
      let gun = player.inventory.guns.filter(
        (gunItem) => gunItem.name === item.name
      )[0];
      gun.totalAmmo += 30;
      player.inventory.money -= item.ammoPrice;
      if (player.children.indexOf(gun) > -1) gun.showAmmo();
      player.showMoney();
    } else {
      this.showWarningMessage("Not enough money");
    }
  }

  buyGun(item, player) {
    if (player.inventory.money >= item.price) {
      let gun = player.inventory.guns.filter(
        (gunItem) => gunItem.name === item.name
      )[0];
      player.inventory.money -= item.price;
      item.inInventory = "true";
      gun.inInventory = "true";
      player.children[0].stopReload();
      player.children = [];
      player.addChild(gun);
      gun.showAmmo();
      player.showMoney();
    } else {
      this.showWarningMessage("Not enough money");
    }
  }

  buyHealth(item, player) {
    if (player.inventory.money >= item.price) {
      if (player.inventory.health === 100) {
        this.showWarningMessage("Health full");
      } else {
        player.inventory.health >= 90
          ? (player.inventory.health = 100)
          : (player.inventory.health += 10);
        player.inventory.money -= item.price;
        player.showHealth();
        player.showMoney();
      }
    } else {
      this.showWarningMessage("Not enough money");
    }
  }

  showWarningMessage(msg) {
    let div = document.querySelector("#hudWarningText");
    let text = document.querySelector("#warningText");

    text.innerHTML = msg;
    div.classList.add("moving");
    text.classList.add("fading");

    div.style.animation = "none";
    div.offsetHeight;
    div.style.animation = null;

    text.style.animation = "none";
    div.offsetHeight;
    text.style.animation = null;
  }

  openCloseGate() {
    if (this.gateOpen) {
        let t = this.gate.translation;
        t[1] += 20;
        this.gate.updateMatrix();
        this.gateOpen = false;
        document.querySelector(".infoText").innerText = "";
    }
    else {
        let t = this.gate.translation;
        t[1] -= 20;
        this.gate.updateMatrix();
        this.gateOpen = true;
    }
  }

  intervalIntersection(min1, max1, min2, max2) {
    return !(min1 > max2 || min2 > max1);
  }

  aabbIntersection(aabb1, aabb2) {
    return (
      this.intervalIntersection(
        aabb1.min[0],
        aabb1.max[0],
        aabb2.min[0],
        aabb2.max[0]
      ) &&
      this.intervalIntersection(
        aabb1.min[1],
        aabb1.max[1],
        aabb2.min[1],
        aabb2.max[1]
      ) &&
      this.intervalIntersection(
        aabb1.min[2],
        aabb1.max[2],
        aabb2.min[2],
        aabb2.max[2]
      )
    );
  }

  resolveCollision(a, b) {
    // Update bounding boxes with global translation.
    const ta = a.getGlobalTransform();
    const tb = b.getGlobalTransform();

    const posa = mat4.getTranslation(vec3.create(), ta);
    const posb = mat4.getTranslation(vec3.create(), tb);

    if (!b.mesh) {
      return;
    }
    //console.log(a)
    //console.log(b)

    const mina = vec3.add(vec3.create(), posa, a.min);
    const maxa = vec3.add(vec3.create(), posa, a.max);
    const minb = vec3.add(
      vec3.create(),
      posb,
      b.mesh.primitives[0].attributes.POSITION.min
    );
    const maxb = vec3.add(
      vec3.create(),
      posb,
      b.mesh.primitives[0].attributes.POSITION.max
    );

    // Check if there is collision.
    const isColliding = this.aabbIntersection(
      {
        min: mina,
        max: maxa,
      },
      {
        min: minb,
        max: maxb,
      }
    );

    return isColliding;
  }
}
