import { vec3, mat4, vec2 } from '../lib/gl-matrix-module.js';
import { Gun } from './Gun.js';
import { Player } from './Player.js';
import { ShopModel } from './ShopModel.js';

export class HitScan {

    constructor(scene) {
        this.scene = scene;
        this.temp = vec3.create();
    }
    
    update(dt) {
        let col = 0
        this.scene.traverse(cam => {
            if (cam instanceof Player) {
                this.scene.traverse(other => {
                    if (cam !== other) {
                        //if(other instanceof ShopModel)
                            col+=this.resolveCollision(cam, other,true)
                    }
                });
            }
            
        });
        if(col == 0){
            document.getElementsByClassName("cross")[0].innerHTML = "+"
        }
        //console.log(col)
    }

    // all args are Vec3, Hit will be filled by this algo
    checkLineBox( B1, B2, L1, L2, Hit){
        if (L2[0] < B1[0] && L1[0] < B1[0]) return false;
        if (L2[0] > B2[0] && L1[0] > B2[0]) return false;
        if (L2[1] < B1[1] && L1[1] < B1[1]) return false;
        if (L2[1] > B2[1] && L1[1] > B2[1]) return false;
        if (L2[2] < B1[2] && L1[2] < B1[2]) return false;
        if (L2[2] > B2[2] && L1[2] > B2[2]) return false;
        if (L1[0] > B1[0] && L1[0] < B2[0] &&
            L1[1] > B1[1] && L1[1] < B2[1] &&
            L1[2] > B1[2] && L1[2] < B2[2])
        {
            vec3.set( L1, Hit);
            return true;
        }

    if ((this.getIntersection(L1[0] - B1[0], L2[0] - B1[0], L1, L2, Hit) && this.inBox(Hit, B1, B2, 1))
      || (this.getIntersection(L1[1] - B1[1], L2[1] - B1[1], L1, L2, Hit) && this.inBox(Hit, B1, B2, 2))
      || (this.getIntersection(L1[2] - B1[2], L2[2] - B1[2], L1, L2, Hit) && this.inBox(Hit, B1, B2, 3))
      || (this.getIntersection(L1[0] - B2[0], L2[0] - B2[0], L1, L2, Hit) && this.inBox(Hit, B1, B2, 1))
      || (this.getIntersection(L1[1] - B2[1], L2[1] - B2[1], L1, L2, Hit) && this.inBox(Hit, B1, B2, 2))
      || (this.getIntersection(L1[2] - B2[2], L2[2] - B2[2], L1, L2, Hit) && this.inBox(Hit, B1, B2, 3)))
        return true;

    return false;
}

    
    getIntersection( fDst1, fDst2, P1, P2, Hit)
    {
        if ((fDst1 * fDst2) >= 0) return false;
        if (fDst1 == fDst2) return false;

        vec3.subtract(P2, P1, this.temp);
        vec3.scale( this.temp, (-fDst1 / (fDst2 - fDst1)));
        vec3.add( this.temp, P1, Hit);

        return true;
    }

    inBox(Hit, B1, B2, Axis)
    {
        if (Axis == 1 && Hit[2] > B1[2] && Hit[2] < B2[2] && Hit[1] > B1[1] && Hit[1] < B2[1]) return true;
        if (Axis == 2 && Hit[2] > B1[2] && Hit[2] < B2[2] && Hit[0] > B1[0] && Hit[0] < B2[0]) return true;
        if (Axis == 3 && Hit[0] > B1[0] && Hit[0] < B2[0] && Hit[1] > B1[1] && Hit[1] < B2[1]) return true;
        return false;
    }

    intersectCube(origin,direction,bmin,bmax) {
        let tmin = vec3.create()
        let tmax = vec3.create()
        vec3.sub(tmin,bmin, origin)
        vec3.div(tmin,tmin,direction)

        vec3.sub(tmax,bmax, origin)
        vec3.div(tmax,tmax,direction)

        let t1 = vec3.create()
        let t2 = vec3.create()
        
        vec3.min(t1,tmin, tmax);
        vec3.max(t2,tmin, tmax);

        let tnear = Math.max(t1[0],t1[1],t1[2])
        let tfar = Math.max(t2[0],t2[1],t2[2])
        
        //če je dolžina neg ne seka
        return vec2.fromValues(tnear, tfar);
    }


    resolveCollision(cam, b, looking) {
        //console.log(a)
        // Update bounding boxes with global translation.
        const tcam = cam.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const poscam = mat4.getTranslation(vec3.create(), tcam);
        const posb = mat4.getTranslation(vec3.create(), tb);
        let con;
        let mincam,maxcam;
        let minb,maxb;
        let bVertices,bOglj
        let v2,n,n1,n2
        let trikot,planes
        const hit = vec3.create()
        for(let i = 0;i<b.mesh.primitives.length;i++){
            if(looking){
                mincam = vec3.clone(poscam);
                maxcam = vec3.add(vec3.create(), poscam, cam.look); //preveri look
                minb = vec3.add(vec3.create(), posb, b.mesh.primitives[i].attributes.POSITION.min);
                maxb = vec3.add(vec3.create(), posb, b.mesh.primitives[i].attributes.POSITION.max);
            }

            bVertices = [
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.min[0], b.mesh.primitives[i].attributes.POSITION.min[1], b.mesh.primitives[i].attributes.POSITION.min[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.min[0], b.mesh.primitives[i].attributes.POSITION.min[1], b.mesh.primitives[i].attributes.POSITION.max[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.min[0], b.mesh.primitives[i].attributes.POSITION.max[1], b.mesh.primitives[i].attributes.POSITION.min[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.min[0], b.mesh.primitives[i].attributes.POSITION.max[1], b.mesh.primitives[i].attributes.POSITION.max[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.max[0], b.mesh.primitives[i].attributes.POSITION.min[1], b.mesh.primitives[i].attributes.POSITION.min[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.max[0], b.mesh.primitives[i].attributes.POSITION.min[1], b.mesh.primitives[i].attributes.POSITION.max[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.max[0], b.mesh.primitives[i].attributes.POSITION.max[1], b.mesh.primitives[i].attributes.POSITION.min[2]),
                vec3.fromValues(b.mesh.primitives[i].attributes.POSITION.max[0], b.mesh.primitives[i].attributes.POSITION.max[1], b.mesh.primitives[i].attributes.POSITION.max[2]),
            ].map(v => vec3.transformMat4(v, v, tb));
            
            minb = vec3.fromValues(
                Math.min(...bVertices.map(v => v[0])),
                Math.min(...bVertices.map(v => v[1])),
                Math.min(...bVertices.map(v => v[2])),
            );
            maxb = vec3.fromValues(
                Math.max(...bVertices.map(v => v[0])),
                Math.max(...bVertices.map(v => v[1])),
                Math.max(...bVertices.map(v => v[2])),
            );


            planes = [
                [minb,[1,0,0]],
                [minb,[0,1,0]],
                [minb,[0,0,1]],

                [maxb,[1,0,0]],
                [maxb,[0,1,0]],
                [maxb,[0,0,1]]
            ]
   
            planes.forEach(pl => {
                this.intersectCube(mincam,maxcam,minb,maxb)
            });
            if(con){
                break
            }
        }
        //console.log(b.constructor.name)
        if(con && looking){
            //console.log(b.constructor.name)
            //console.log("swap")
            //console.log(b.translation)
            //document.getElementsByClassName("cross")[0].innerHTML = b.type
        }
        
        return con;

   
        
    }

}
