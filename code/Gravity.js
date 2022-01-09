import { vec3, mat4 } from '../lib/gl-matrix-module.js';
import { Gun } from './Gun.js';
import { Player } from './Player.js';

export class Gravity {

    constructor(scene) {
        this.scene = scene;
    }
    
    update(dt) {
        let col = 0
        let camera
        this.scene.traverse(cam => {
            if (cam instanceof Player) {
                camera = cam
                this.scene.traverse(other => {
                    if (cam !== other) {
                        if(!(other instanceof Gun) && (!other.deco)){
                            if(other.jumpable){ //ko bojo jump hitboxi odkomenitraj
                                col +=this.resolveCollision(cam, other);
                             }
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

        //const poscam = mat4.getTranslation(vec3.create(), tcam);
        //const posb = mat4.getTranslation(vec3.create(), tb);

        //const mincam = vec3.add(vec3.create(), poscam, cam.min);
        //const maxcam = vec3.add(vec3.create(), poscam, cam.max);

        const aVertices = [
            vec3.fromValues(a.min[0], a.min[1], a.min[2]),
            vec3.fromValues(a.min[0], a.min[1], a.max[2]),
            vec3.fromValues(a.min[0], a.max[1], a.min[2]),
            vec3.fromValues(a.min[0], a.max[1], a.max[2]),
            vec3.fromValues(a.max[0], a.min[1], a.min[2]),
            vec3.fromValues(a.max[0], a.min[1], a.max[2]),
            vec3.fromValues(a.max[0], a.max[1], a.min[2]),
            vec3.fromValues(a.max[0], a.max[1], a.max[2]),
        ].map(v => vec3.transformMat4(v, v, ta));
        const mina = vec3.fromValues(
            Math.min(...aVertices.map(v => v[0])),
            Math.min(...aVertices.map(v => v[1])),
            Math.min(...aVertices.map(v => v[2])),
        );
        const maxa = vec3.fromValues(
            Math.max(...aVertices.map(v => v[0])),
            Math.max(...aVertices.map(v => v[1])),
            Math.max(...aVertices.map(v => v[2])),
        );


        const bVertices = [
            vec3.fromValues(b.mesh.primitives[0].attributes.POSITION.min[0], b.mesh.primitives[0].attributes.POSITION.min[1], b.mesh.primitives[0].attributes.POSITION.min[2]),
            vec3.fromValues(b.mesh.primitives[0].attributes.POSITION.min[0], b.mesh.primitives[0].attributes.POSITION.min[1], b.mesh.primitives[0].attributes.POSITION.max[2]),
            vec3.fromValues(b.mesh.primitives[0].attributes.POSITION.min[0], b.mesh.primitives[0].attributes.POSITION.max[1], b.mesh.primitives[0].attributes.POSITION.min[2]),
            vec3.fromValues(b.mesh.primitives[0].attributes.POSITION.min[0], b.mesh.primitives[0].attributes.POSITION.max[1], b.mesh.primitives[0].attributes.POSITION.max[2]),
            vec3.fromValues(b.mesh.primitives[0].attributes.POSITION.max[0], b.mesh.primitives[0].attributes.POSITION.min[1], b.mesh.primitives[0].attributes.POSITION.min[2]),
            vec3.fromValues(b.mesh.primitives[0].attributes.POSITION.max[0], b.mesh.primitives[0].attributes.POSITION.min[1], b.mesh.primitives[0].attributes.POSITION.max[2]),
            vec3.fromValues(b.mesh.primitives[0].attributes.POSITION.max[0], b.mesh.primitives[0].attributes.POSITION.max[1], b.mesh.primitives[0].attributes.POSITION.min[2]),
            vec3.fromValues(b.mesh.primitives[0].attributes.POSITION.max[0], b.mesh.primitives[0].attributes.POSITION.max[1], b.mesh.primitives[0].attributes.POSITION.max[2]),
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
        //const minb = vec3.add(vec3.create(), posb, b.mesh.primitives[0].attributes.POSITION.min);
        //const maxb = vec3.add(vec3.create(), posb, b.mesh.primitives[0].attributes.POSITION.max);

        // Check if there is collision.
        const isColliding = this.aabbIntersection({
            min: mina,
            max: maxa
        }, {
            min: minb,
            max: maxb
        });

        if (!isColliding) {
            return 0;
        }

        //stop falling or jumping
        //const stop = vec3.set(vec3.create(),1, 0, 1 );
        //vec3.multiply(cam.velocity,cam.velocity,stop)
        a.can_jump = 1
    
        return 1;
        
    }

}
