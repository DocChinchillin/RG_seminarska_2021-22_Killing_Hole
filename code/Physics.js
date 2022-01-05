import { vec3, mat4 } from '../lib/gl-matrix-module.js';
import { Gun } from './Gun.js';
import { Player } from './Player.js';

export class Physics {

    constructor(scene) {
        this.scene = scene;
    }

    update(dt) {
        this.scene.traverse(node => {
            if(node.red && node.red > 0){
                node.red -= dt
              }
            if (node.velocity) {
                //console.log(node)
                vec3.scaleAndAdd(node.translation, node.translation, node.velocity, dt);
                vec3.scaleAndAdd(node.translation, node.translation, node.padc, dt);
                node.updatePos();
                this.scene.traverse(other => {
                    if (node !== other) {
                        if(!(other instanceof Gun) && (!other.deco)){
                            this.resolveCollision(node, other);
                        }
                    }
                });
            }
        });
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

        // const posa = mat4.getTranslation(vec3.create(), ta);
        // const posb = mat4.getTranslation(vec3.create(), tb);
        
        if(!b.mesh){
            return
        }
        let aVertices,mina,maxa
        for(let i = 0;i<b.mesh.primitives.length;i++){ //b.mesh.primitives.length
            if(a.max){
                aVertices = [
                    vec3.fromValues(a.min[0], a.min[1], a.min[2]),
                    vec3.fromValues(a.min[0], a.min[1], a.max[2]),
                    vec3.fromValues(a.min[0], a.max[1], a.min[2]),
                    vec3.fromValues(a.min[0], a.max[1], a.max[2]),
                    vec3.fromValues(a.max[0], a.min[1], a.min[2]),
                    vec3.fromValues(a.max[0], a.min[1], a.max[2]),
                    vec3.fromValues(a.max[0], a.max[1], a.min[2]),
                    vec3.fromValues(a.max[0], a.max[1], a.max[2]),
                ].map(v => vec3.transformMat4(v, v, ta));
                mina = vec3.fromValues(
                    Math.min(...aVertices.map(v => v[0])),
                    Math.min(...aVertices.map(v => v[1])),
                    Math.min(...aVertices.map(v => v[2])),
                );
                maxa = vec3.fromValues(
                    Math.max(...aVertices.map(v => v[0])),
                    Math.max(...aVertices.map(v => v[1])),
                    Math.max(...aVertices.map(v => v[2])),
                );
            }else{
                aVertices = [
                    vec3.fromValues(a.mesh.primitives[0].attributes.POSITION.min[0], a.mesh.primitives[0].attributes.POSITION.min[1], a.mesh.primitives[0].attributes.POSITION.min[2]),
                    vec3.fromValues(a.mesh.primitives[0].attributes.POSITION.min[0], a.mesh.primitives[0].attributes.POSITION.min[1], a.mesh.primitives[0].attributes.POSITION.max[2]),
                    vec3.fromValues(a.mesh.primitives[0].attributes.POSITION.min[0], a.mesh.primitives[0].attributes.POSITION.max[1], a.mesh.primitives[0].attributes.POSITION.min[2]),
                    vec3.fromValues(a.mesh.primitives[0].attributes.POSITION.min[0], a.mesh.primitives[0].attributes.POSITION.max[1], a.mesh.primitives[0].attributes.POSITION.max[2]),
                    vec3.fromValues(a.mesh.primitives[0].attributes.POSITION.max[0], a.mesh.primitives[0].attributes.POSITION.min[1], a.mesh.primitives[0].attributes.POSITION.min[2]),
                    vec3.fromValues(a.mesh.primitives[0].attributes.POSITION.max[0], a.mesh.primitives[0].attributes.POSITION.min[1], a.mesh.primitives[0].attributes.POSITION.max[2]),
                    vec3.fromValues(a.mesh.primitives[0].attributes.POSITION.max[0], a.mesh.primitives[0].attributes.POSITION.max[1], a.mesh.primitives[0].attributes.POSITION.min[2]),
                    vec3.fromValues(a.mesh.primitives[0].attributes.POSITION.max[0], a.mesh.primitives[0].attributes.POSITION.max[1], a.mesh.primitives[0].attributes.POSITION.max[2]),
                ].map(v => vec3.transformMat4(v, v, ta));
                mina = vec3.fromValues(
                    Math.min(...aVertices.map(v => v[0])),
                    Math.min(...aVertices.map(v => v[1])),
                    Math.min(...aVertices.map(v => v[2])),
                );
                maxa = vec3.fromValues(
                    Math.max(...aVertices.map(v => v[0])),
                    Math.max(...aVertices.map(v => v[1])),
                    Math.max(...aVertices.map(v => v[2])),
                    );
            }

            const bVertices = [
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.min[0], b.mesh.primitives[i].attributes.POSITION.min[1], b.mesh.primitives[i].attributes.POSITION.min[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.min[0], b.mesh.primitives[i].attributes.POSITION.min[1], b.mesh.primitives[i].attributes.POSITION.max[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.min[0], b.mesh.primitives[i].attributes.POSITION.max[1], b.mesh.primitives[i].attributes.POSITION.min[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.min[0], b.mesh.primitives[i].attributes.POSITION.max[1], b.mesh.primitives[i].attributes.POSITION.max[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.max[0], b.mesh.primitives[i].attributes.POSITION.min[1], b.mesh.primitives[i].attributes.POSITION.min[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.max[0], b.mesh.primitives[i].attributes.POSITION.min[1], b.mesh.primitives[i].attributes.POSITION.max[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.max[0], b.mesh.primitives[i].attributes.POSITION.max[1], b.mesh.primitives[i].attributes.POSITION.min[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.max[0], b.mesh.primitives[i].attributes.POSITION.max[1], b.mesh.primitives[i].attributes.POSITION.max[2]),
            ].map(v => vec3.transformMat4(v, v, tb));
            const minb = vec3.fromValues(
                Math.min(...bVertices.map(v => v[0])),
                Math.min(...bVertices.map(v => v[1])),
                Math.min(...bVertices.map(v => v[2])),
            );
            const maxb = vec3.fromValues(
                Math.max(...bVertices.map(v => v[0])),
                Math.max(...bVertices.map(v => v[1])),
                Math.max(...bVertices.map(v => v[2])),
            );
            //const mina = vec3.add(vec3.create(), posa, a.min);
            //const maxa = vec3.add(vec3.create(), posa, a.max);
            // const minb = vec3.add(vec3.create(), posb, b.mesh.primitives[0].attributes.POSITION.min);
            // const maxb = vec3.add(vec3.create(), posb, b.mesh.primitives[0].attributes.POSITION.max);

            // Check if there is collision.
            const isColliding = this.aabbIntersection({
                min: mina,
                max: maxa
            }, {
                min: minb,
                max: maxb
            });

            if (!isColliding) {
                continue;
            }
            //console.log(b.deco)
            //console.log("collison")
            // Move node A minimally to avoid collision.
            const diffa = vec3.sub(vec3.create(), maxb, mina);
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
            a.updatePos();
        }
    }

}
