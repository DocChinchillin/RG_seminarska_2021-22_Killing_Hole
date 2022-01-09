import { vec3 } from "../lib/gl-matrix-module.js";
import { Enemy } from "./Enemy.js";
import { Player } from "./Player.js";

export class WaveGenerator {
  constructor(enemies, scene) {
    this.waveNumber = 0;
    this.enemies = enemies;
    this.scene = scene;
    this.startNew = true;
    this.time = 20;
  }

  generateWave() {
    this.waveNumber++;
    this.enemies.forEach((enemy) => {
      if (enemy.isBoss && this.waveNumber % 5 !== 0) return;

      if (enemy.isBoss) {
        enemy.translation[1] += 20;
        enemy.hp = enemy.startingHp;
      }

      if (this.waveNumber > 1 && !enemy.isBoss) {
        enemy.translation[1] += 20;
        enemy.hp = enemy.startingHp + (this.waveNumber - 1) * 5;
        enemy.dmg += 1;
        enemy.drop += 0.5;
      }

      let collision = true;

      do {
        collision = true;
        let xPos = Math.floor(Math.random() * (52 - -52)) - 52; //Math.floor(Math.random() * (max - min)) + min;
        let yPos = Math.floor(Math.random() * (64 - -64)) - 64; //Math.floor(Math.random() * (max - min)) + min;
        enemy.translation = vec3.fromValues(xPos, enemy.translation[1], yPos);
        enemy.updateMatrix();
        //Preverjej kolizijo enemyja z objekti na sceni
        this.scene.nodes.some((node) => {
          if (node !== enemy && !node.deco && node.name !== "ground") {
            if (node instanceof Enemy) {
              let distance = vec3.dist(node.translation, enemy.translation);
              if (distance < 10) {
                collision = true;
                return true;
              }
            }
            if (node instanceof Player) {
              collision = this.resolveCollision(node, enemy);
              let distance = vec3.dist(node.translation, enemy.translation);
              if (distance < 35) {
                collision = true;
                return true;
              }
            } else collision = this.resolveCollision(enemy, node);
            if (collision) {
              return true;
            }
            return false;
          }
          return false;
        });
      } while (collision);

      enemy.isInScene = true;
    });
    this.startNew = true;
    document.querySelector("#wave").innerHTML = this.waveNumber;
  }

  startCountdown(time, shop, dt) {
    this.startNew = false;
    if (time === 0) {
      this.generateWave();
      return;
    }
    let div = document.querySelector(".hudCountdown");
    let timer = document.querySelector("#countdown");

    this.time -= dt;

    timer.innerHTML = Math.ceil(this.time);
    div.style.display = "block";

    if (this.time <= 0) {
      shop.openCloseGate();
      this.generateWave();
      div.style.display = "none";
      this.time = time;
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

    // const posa = mat4.getTranslation(vec3.create(), ta);
    // const posb = mat4.getTranslation(vec3.create(), tb);

    if (!b.mesh) {
      return;
    }
    let aVertices, mina, maxa;
    for (let i = 0; i < b.mesh.primitives.length; i++) {
      //b.mesh.primitives.length
      if (a.max) {
        aVertices = [
          vec3.fromValues(a.min[0], a.min[1], a.min[2]),
          vec3.fromValues(a.min[0], a.min[1], a.max[2]),
          vec3.fromValues(a.min[0], a.max[1], a.min[2]),
          vec3.fromValues(a.min[0], a.max[1], a.max[2]),
          vec3.fromValues(a.max[0], a.min[1], a.min[2]),
          vec3.fromValues(a.max[0], a.min[1], a.max[2]),
          vec3.fromValues(a.max[0], a.max[1], a.min[2]),
          vec3.fromValues(a.max[0], a.max[1], a.max[2]),
        ].map((v) => vec3.transformMat4(v, v, ta));
        mina = vec3.fromValues(
          Math.min(...aVertices.map((v) => v[0])),
          Math.min(...aVertices.map((v) => v[1])),
          Math.min(...aVertices.map((v) => v[2]))
        );
        maxa = vec3.fromValues(
          Math.max(...aVertices.map((v) => v[0])),
          Math.max(...aVertices.map((v) => v[1])),
          Math.max(...aVertices.map((v) => v[2]))
        );
      } else {
        aVertices = [
          vec3.fromValues(
            a.mesh.primitives[0].attributes.POSITION.min[0],
            a.mesh.primitives[0].attributes.POSITION.min[1],
            a.mesh.primitives[0].attributes.POSITION.min[2]
          ),
          vec3.fromValues(
            a.mesh.primitives[0].attributes.POSITION.min[0],
            a.mesh.primitives[0].attributes.POSITION.min[1],
            a.mesh.primitives[0].attributes.POSITION.max[2]
          ),
          vec3.fromValues(
            a.mesh.primitives[0].attributes.POSITION.min[0],
            a.mesh.primitives[0].attributes.POSITION.max[1],
            a.mesh.primitives[0].attributes.POSITION.min[2]
          ),
          vec3.fromValues(
            a.mesh.primitives[0].attributes.POSITION.min[0],
            a.mesh.primitives[0].attributes.POSITION.max[1],
            a.mesh.primitives[0].attributes.POSITION.max[2]
          ),
          vec3.fromValues(
            a.mesh.primitives[0].attributes.POSITION.max[0],
            a.mesh.primitives[0].attributes.POSITION.min[1],
            a.mesh.primitives[0].attributes.POSITION.min[2]
          ),
          vec3.fromValues(
            a.mesh.primitives[0].attributes.POSITION.max[0],
            a.mesh.primitives[0].attributes.POSITION.min[1],
            a.mesh.primitives[0].attributes.POSITION.max[2]
          ),
          vec3.fromValues(
            a.mesh.primitives[0].attributes.POSITION.max[0],
            a.mesh.primitives[0].attributes.POSITION.max[1],
            a.mesh.primitives[0].attributes.POSITION.min[2]
          ),
          vec3.fromValues(
            a.mesh.primitives[0].attributes.POSITION.max[0],
            a.mesh.primitives[0].attributes.POSITION.max[1],
            a.mesh.primitives[0].attributes.POSITION.max[2]
          ),
        ].map((v) => vec3.transformMat4(v, v, ta));
        mina = vec3.fromValues(
          Math.min(...aVertices.map((v) => v[0])),
          Math.min(...aVertices.map((v) => v[1])),
          Math.min(...aVertices.map((v) => v[2]))
        );
        maxa = vec3.fromValues(
          Math.max(...aVertices.map((v) => v[0])),
          Math.max(...aVertices.map((v) => v[1])),
          Math.max(...aVertices.map((v) => v[2]))
        );
      }

      const bVertices = [
        vec3.fromValues(
          b.mesh.primitives[i].attributes.POSITION.min[0],
          b.mesh.primitives[i].attributes.POSITION.min[1],
          b.mesh.primitives[i].attributes.POSITION.min[2]
        ),
        vec3.fromValues(
          b.mesh.primitives[i].attributes.POSITION.min[0],
          b.mesh.primitives[i].attributes.POSITION.min[1],
          b.mesh.primitives[i].attributes.POSITION.max[2]
        ),
        vec3.fromValues(
          b.mesh.primitives[i].attributes.POSITION.min[0],
          b.mesh.primitives[i].attributes.POSITION.max[1],
          b.mesh.primitives[i].attributes.POSITION.min[2]
        ),
        vec3.fromValues(
          b.mesh.primitives[i].attributes.POSITION.min[0],
          b.mesh.primitives[i].attributes.POSITION.max[1],
          b.mesh.primitives[i].attributes.POSITION.max[2]
        ),
        vec3.fromValues(
          b.mesh.primitives[i].attributes.POSITION.max[0],
          b.mesh.primitives[i].attributes.POSITION.min[1],
          b.mesh.primitives[i].attributes.POSITION.min[2]
        ),
        vec3.fromValues(
          b.mesh.primitives[i].attributes.POSITION.max[0],
          b.mesh.primitives[i].attributes.POSITION.min[1],
          b.mesh.primitives[i].attributes.POSITION.max[2]
        ),
        vec3.fromValues(
          b.mesh.primitives[i].attributes.POSITION.max[0],
          b.mesh.primitives[i].attributes.POSITION.max[1],
          b.mesh.primitives[i].attributes.POSITION.min[2]
        ),
        vec3.fromValues(
          b.mesh.primitives[i].attributes.POSITION.max[0],
          b.mesh.primitives[i].attributes.POSITION.max[1],
          b.mesh.primitives[i].attributes.POSITION.max[2]
        ),
      ].map((v) => vec3.transformMat4(v, v, tb));
      const minb = vec3.fromValues(
        Math.min(...bVertices.map((v) => v[0])),
        Math.min(...bVertices.map((v) => v[1])),
        Math.min(...bVertices.map((v) => v[2]))
      );
      const maxb = vec3.fromValues(
        Math.max(...bVertices.map((v) => v[0])),
        Math.max(...bVertices.map((v) => v[1])),
        Math.max(...bVertices.map((v) => v[2]))
      );
      //const mina = vec3.add(vec3.create(), posa, a.min);
      //const maxa = vec3.add(vec3.create(), posa, a.max);
      // const minb = vec3.add(vec3.create(), posb, b.mesh.primitives[0].attributes.POSITION.min);
      // const maxb = vec3.add(vec3.create(), posb, b.mesh.primitives[0].attributes.POSITION.max);

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

      if (isColliding) return true;
      // Move node A minimally to avoid collision.
      /* const diffa = vec3.sub(vec3.create(), maxb, mina);
      const diffb = vec3.sub(vec3.create(), maxa, minb);

      let minDiff = Infinity;
      let minDirection = [0, 0, 0];
      if (diffa[0] >= 0 && diffa[0] < minDiff) {
        minDiff = diffa[0];
        minDirection = [minDiff, 0, 0];
      }
      if (diffa[1] >= 0 && diffa[1] < minDiff) {
        minDiff = diffa[1];
        minDirection = [0, minDiff, 0];
      }
      if (diffa[2] >= 0 && diffa[2] < minDiff) {
        minDiff = diffa[2];
        minDirection = [0, 0, minDiff];
      }
      if (diffb[0] >= 0 && diffb[0] < minDiff) {
        minDiff = diffb[0];
        minDirection = [-minDiff, 0, 0];
      }
      if (diffb[1] >= 0 && diffb[1] < minDiff) {
        minDiff = diffb[1];
        minDirection = [0, -minDiff, 0];
      }
      if (diffb[2] >= 0 && diffb[2] < minDiff) {
        minDiff = diffb[2];
        minDirection = [0, 0, -minDiff];
      }

      vec3.add(a.translation, a.translation, minDirection);
      a.updatePos();*/
    }
    return false;
  }
}
