import { mat4, vec3 } from "../lib/gl-matrix-module.js";
import { Sound } from "./Sound.js";

export class Shop {
  constructor() {
    this.shopModels = [];
    this.gate;
    this.gateOpen = false;
    this.curModel = null;

    this.buySound = new Sound("../common/sounds/buy.wav");
    this.buySound.setVolume(0.2)

    
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
            this.buySound.stop()
            this.buySound.play()
          }
        } else {
          if (this.curModel.inInventory === "true") {
            document.querySelector(".infoText").innerText =
              "Press E to buy ammo for " + this.curModel.ammoPrice + " coins";
            if (player.keys["KeyE"]) {
              this.buyAmmo(this.curModel, player);
              player.keys["KeyE"] = false;
              this.buySound.stop()
              this.buySound.play()
            }
          } else {
            document.querySelector(".infoText").innerText =
              "Press E to buy gun for " + this.curModel.price + " coins";
            if (player.keys["KeyE"]) {
              this.buyGun(this.curModel, player);
              player.keys["KeyE"] = false;
              this.buySound.stop()
              this.buySound.play()
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

}
