import { vec3, mat4 } from '../lib/gl-matrix-module.js';
import { Gun } from './Gun.js';
import { Player } from './Player.js';

export class HitScan {

    constructor(scene) {
        this.scene = scene;
    }
    
    update(dt) {
        let col = 0
        this.scene.traverse(cam => {
            if (cam instanceof Player) {
                this.scene.traverse(other => {
                    if (cam !== other) {
                        if(!(other instanceof Gun)){
                            this.resolveCollision(cam, other);
                            
                        }
                    }
                });
            }
            if(col == 0){  //ce se ne dotikam tal začnem padat
                //cam.can_jump = 0
            }
        });
        
    }

    // intervalIntersection(min1, max1, min2, max2) {
    //     return !(min1 > max2 || min2 > max1);
    // }

    // aabbIntersection(aabb1, aabb2) {
    //     return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
    //         && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
    //         && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    // }



    resolveCollision(cam, b) {
        //console.log(a)
        // Update bounding boxes with global translation.
        const tcam = cam.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const poscam = mat4.getTranslation(vec3.create(), tcam);
        const posb = mat4.getTranslation(vec3.create(), tb);
        const mincam = vec3.clone(poscam);
        const maxcam = vec3.add(vec3.create(), poscam, cam.look);
        const minb = vec3.add(vec3.create(), posb, b.mesh.primitives[0].attributes.POSITION.min);
        const maxb = vec3.add(vec3.create(), posb, b.mesh.primitives[0].attributes.POSITION.max);

        const LMid = vec3.create()
        vec3.add(LMid,mincam,maxcam)
        vec3.scale(LMid,LMid,1/2)

        const L = vec3.create()
        vec3.sub(L,mincam,LMid)

        const LExt = vec3.set(vec3.create(),Math.abs(L[0]),Math.abs(L[1]),Math.abs(L[2]))
        //console.log(LExt)

        // Use Separating Axis Test
        // Separation vector from box center to line center is LMid, since the line is in box space
        if ( Math.abs( LMid[0] ) > maxb[0] + LExt[0] ) return false;
        if ( Math.abs( LMid[1] ) > maxb[1] + LExt[1] ) return false;
        if ( Math.abs( LMid[2] ) > maxb[2] + LExt[2] ) return false;
        // Crossproducts of line and each axis
        // if ( Math.abs( LMid.y * L.z - LMid.z * L.y)  >  (m_Extent.y * LExt.z + m_Extent.z * LExt.y) ) return false;
        // if ( Math.abs( LMid.x * L.z - LMid.z * L.x)  >  (m_Extent.x * LExt.z + m_Extent.z * LExt.x) ) return false;
        // if ( Math.abs( LMid.x * L.y - LMid.y * L.x)  >  (m_Extent.x * LExt.y + m_Extent.y * LExt.x) ) return false;
        // No separating axis, the line intersects
        //console.log("Gledam")
        return true;

        // Check if there is collision.
        // const isColliding = this.aabbIntersection({
        //     min: mincam,
        //     max: maxcam
        // }, {
        //     min: minb,
        //     max: maxb
        // });

        // if (!isColliding) {
        //     return ;
        // }

      
        //console.log("Gledam v")
        //console.log(b)
        return ;
        
    }

}
