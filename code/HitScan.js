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
        let col
        this.scene.traverse(cam => {
            if (cam instanceof Player) {
                this.scene.traverse(other => {
                    if (cam !== other) {
                        //if(other instanceof ShopModel)
                            col=this.resolveCollision(cam, other,true)
                            if(col){
                                
                            }
                    }
                });
            }
            
        });
        // if(col == 0){
        //     document.getElementsByClassName("cross")[0].innerHTML = "+"
        // }
        //console.log(col)
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
        let tfar = Math.min(t2[0],t2[1],t2[2])
        
        //če je dolžina neg ne seka
        return vec2.fromValues(tnear, tfar);
    }

    isect_line_plane(p0, p1, p_co, p_no ){
    /*
    p0, p1: Define the line.
    p_co, p_no: define the plane:
        p_co Is a point on the plane (plane coordinate).
        p_no Is a normal vector defining the plane direction;
             (does not need to be normalized).

    Return a Vector or None (when the intersection can't be found).
    */
    let epsilon=1e-6
    let u = vec3.create()
    let w = vec3.create()
    let fac 
    vec3.sub(u,p1, p0)
    let dot = vec3.dot(p_no, u)
    let ret = vec3.create()

    if (Math.abs(dot) > epsilon){
        // The factor of the point between p0 -> p1 (0 - 1)
        // if 'fac' is between (0 - 1) the point intersects with the segment.
        // # Otherwise:
        // #  < 0.0: behind p0.
        // #  > 1.0: infront of p1.
        vec3.sub(w,p0, p_co)
        fac = vec3.dot(p_no, w) / dot
        vec3.scale(u,u, -fac)
        vec3.add(ret,p0, u)
        //console.log(ret)
        return fac//vec3.clone(ret)
    }
    //# The segment is parallel to plane.
    return 
    }
    getViewProjectionMatrix(camera) {
        const mvpMatrix = mat4.clone(camera.matrix);
        let parent = camera.parent;
        while (parent) {
            mat4.mul(mvpMatrix, parent.matrix, mvpMatrix);
            parent = parent.parent;
        }
        mat4.invert(mvpMatrix, mvpMatrix);
        mat4.mul(mvpMatrix, camera.camera.matrix, mvpMatrix);
        return mvpMatrix;
    }



    resolveCollision(cam, b, looking) {
        //console.log(a)
        // Update bounding boxes with global translation.
        const tcam = cam.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const vp = this.getViewProjectionMatrix(cam) 
        mat4.invert(vp,vp)

        const tocka = vec3.fromValues(0,0,-1)
        const tocka1 = vec3.fromValues(0,0,1)
        const smer = vec3.create()
        vec3.sub(smer,tocka1,tocka)

        vec3.transformMat4(tocka,tocka,vp)
        vec3.transformMat4(tocka1,tocka1,vp)
        

        const poscam = mat4.getTranslation(vec3.create(), tcam);
        const posb = mat4.getTranslation(vec3.create(), tb);
        let con;
        let mincam,maxcam;
        let minb,maxb;
        let bVertices,bOglj
        let v2,n,n1,n2
        let trikot,planes
        let ret
        let to1 = vec3.create() 
        let to2 = vec3.create() 
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


        
            ret = this.intersectCube(tocka,smer,minb,maxb)

            if(ret[0] < ret[1] && ret[1] > 0){
                vec3.scaleAndAdd(to1,tocka,smer,ret[0])
                vec3.scaleAndAdd(to2,tocka,smer,ret[1])

                con = true
                break
            }
            
            
           
        }
        //console.log(b.constructor.name)
        if(con && looking){
            console.log(b.constructor.name)
            //console.log("swap")
            //console.log(b.translation)
            //document.getElementsByClassName("cross")[0].innerHTML = b.type
            console.log(ret[0],ret[1])
            return [to1,to2]
        }
        
        

   
        
    }

}
