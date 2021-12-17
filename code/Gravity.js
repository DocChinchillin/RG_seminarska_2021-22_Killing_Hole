import { vec3, mat4 } from '../lib/gl-matrix-module.js';
import { Camera } from './Camera.js';

export class Gravity {

    constructor(scene) {
        this.scene = scene;
    }

    update(dt) {
        let col = 0
        this.scene.traverse(cam => {
            if (cam instanceof Camera) {
                this.scene.traverse(other => {
                    if (cam !== other) {
                        col +=this.resolveCollision(cam, other);
                    }
                });
            }
            if(col == 0){  //ce se ne dotikam tal začnem padat
                //cam.can_jump = 0
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
        //console.log(a)
        // Update bounding boxes with global translation.
        const ta = a.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const posa = mat4.getTranslation(vec3.create(), ta);
        const posb = mat4.getTranslation(vec3.create(), tb);

        const mina = vec3.add(vec3.create(), posa, a.aabb.min);
        const maxa = vec3.add(vec3.create(), posa, a.aabb.max);
        const minb = vec3.add(vec3.create(), posb, b.aabb.min);
        const maxb = vec3.add(vec3.create(), posb, b.aabb.max);

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
        a.can_jump = 1
        //console.log("se dotikam :)")
        return 1;
        
    }

}
